/**
 * كيف تُصنع؟ - منصة اكتشاف المصانع وتنظيم الزيارات
 * المحرك التفاعلي للواجهة البرمجية (SPA Architecture)
 */

// Application State
const state = {
  currentRole: 'visitor', // 'visitor' | 'factory' | 'admin'
  currentVisitor: {
    id: 'usr-visitor-demo',
    name: 'سلطان العبدالله',
    email: 'sultan@example.com',
    phone: '+966551234567'
  },
  currentFactoryId: 'fac-coffee', // for factory manager view
  currentView: 'discover', // 'discover' | 'factory' | 'visits' | 'passport' | 'factory-dashboard' | 'admin-dashboard'
  
  // Data caches
  factories: [],
  selectedFactory: null,
  activeStationIndex: 0,
  events: [],
  requests: [],
  passport: null,
  notifications: [],
  adminMetrics: null,
  onboardingApps: [],

  // Filters
  filterSearch: '',
  filterCity: 'all',
  filterSector: 'all',
  filterPurpose: 'all',

  // Booking / Wizard temporary state
  wizard: {
    step: 1,
    factoryId: null,
    purpose: 'explore',
    groupDetails: {
      attendeesCount: 2,
      adultsCount: 2,
      childrenCount: 0,
      ageRange: 'عائلات وكبار',
      entityName: '',
      academicLevel: 'متوسط',
      studentsCount: 15,
      chaperonesCount: 2,
      educationalGoal: '',
      domain: '',
      meetingSubject: ''
    },
    requestedDate: '',
    requestedSlotTime: '',
    excitedAbout: '',
    visitorName: '',
    visitorEmail: '',
    visitorPhone: ''
  },

  // Modal active event for booking
  activeEventToBook: null
};

// ==========================================================================
// API Helpers
// ==========================================================================
const API = {
  async get(url) {
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'حدث خطأ في جلب البيانات');
      return json.data;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  },

  async post(url, body) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'فشلت العملية');
      return json;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  },

  async put(url, body) {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'فشلت العملية');
      return json;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }
};

// ==========================================================================
// Initialization & Navigation
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadInitialData();
  renderApp();
});

async function loadInitialData() {
  try {
    state.factories = await API.get('/api/factories');
    state.events = await API.get('/api/events');
    await refreshRequests();
    await refreshPassport();
    await refreshNotifications();
  } catch (e) {
    console.error('Error loading initial data', e);
  }
}

async function refreshRequests() {
  if (state.currentRole === 'visitor') {
    state.requests = await API.get(`/api/requests?visitorId=${state.currentVisitor.id}`);
  } else if (state.currentRole === 'factory') {
    state.requests = await API.get(`/api/factory/${state.currentFactoryId}/requests`);
  }
}

async function refreshPassport() {
  state.passport = await API.get(`/api/passport/${state.currentVisitor.id}`);
}

async function refreshNotifications() {
  const target = state.currentRole === 'visitor' ? state.currentVisitor.id : (state.currentRole === 'factory' ? state.currentFactoryId : 'admin');
  state.notifications = await API.get(`/api/notifications?targetUser=${target}`);
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const unreadCount = state.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notif-badge');
  if (badge) {
    badge.style.display = unreadCount > 0 ? 'block' : 'none';
  }
}

// ==========================================================================
// View Routing
// ==========================================================================
function switchView(viewName, params = {}) {
  state.currentView = viewName;

  // Update navigation button active state
  document.querySelectorAll('.nav-link-item, .mobile-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  // Hide all views
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.add('d-none');
  });

  const activePanel = document.getElementById(`view-${viewName}`);
  if (activePanel) {
    activePanel.classList.remove('d-none');
  }

  // Handle specific view rendering
  if (viewName === 'discover') {
    renderDiscoveryView();
  } else if (viewName === 'factory') {
    if (params.factoryId) {
      state.selectedFactory = state.factories.find(f => f.id === params.factoryId) || state.factories[0];
      state.activeStationIndex = 0;
    }
    renderFactoryView();
  } else if (viewName === 'visits') {
    renderVisitsView();
  } else if (viewName === 'passport') {
    renderPassportView();
  } else if (viewName === 'factory-dashboard') {
    renderFactoryDashboard();
  } else if (viewName === 'admin-dashboard') {
    renderAdminDashboard();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// Role Switching (Persona switcher)
// ==========================================================================
function setRole(role, factoryId = null) {
  state.currentRole = role;
  if (factoryId) state.currentFactoryId = factoryId;

  // Update role pill in header
  const roleLabel = document.getElementById('current-role-label');
  if (roleLabel) {
    if (role === 'visitor') roleLabel.textContent = `الزائر: ${state.currentVisitor.name}`;
    else if (role === 'factory') {
      const fac = state.factories.find(f => f.id === state.currentFactoryId);
      roleLabel.textContent = `مدير: ${fac ? fac.name : 'المصنع'}`;
    } else if (role === 'admin') {
      roleLabel.textContent = 'مدير المنصة';
    }
  }

  // Adjust default view for role
  if (role === 'visitor') {
    switchView('discover');
  } else if (role === 'factory') {
    switchView('factory-dashboard');
  } else if (role === 'admin') {
    switchView('admin-dashboard');
  }

  refreshRequests();
  refreshNotifications();
  closeModal('modal-role-switcher');
  showToast(`تم التبديل إلى: ${roleLabel.textContent}`, 'info');
}

// ==========================================================================
// View: Discovery Page
// ==========================================================================
function renderDiscoveryView() {
  const container = document.getElementById('factories-grid-container');
  if (!container) return;

  // Apply filters
  const filtered = state.factories.filter(fac => {
    // Search
    if (state.filterSearch) {
      const q = state.filterSearch.toLowerCase();
      const match = fac.name.toLowerCase().includes(q) ||
                    fac.tagline.toLowerCase().includes(q) ||
                    fac.description.toLowerCase().includes(q) ||
                    fac.city.toLowerCase().includes(q) ||
                    fac.sector.toLowerCase().includes(q);
      if (!match) return false;
    }
    // City
    if (state.filterCity !== 'all' && fac.city !== state.filterCity) {
      return false;
    }
    // Sector
    if (state.filterSector !== 'all' && fac.sectorSlug !== state.filterSector) {
      return false;
    }
    // Purpose
    if (state.filterPurpose !== 'all') {
      if (!fac.tourExperience?.acceptedPurposes?.includes(state.filterPurpose)) {
        return false;
      }
    }
    return true;
  });

  const zeroState = document.getElementById('discovery-empty-state');
  if (filtered.length === 0) {
    container.innerHTML = '';
    if (zeroState) zeroState.classList.remove('d-none');
    return;
  }

  if (zeroState) zeroState.classList.add('d-none');

  container.innerHTML = filtered.map(fac => `
    <article class="factory-card" data-id="${fac.id}">
      <div class="factory-card-cover-wrap">
        <img src="${fac.coverImage}" alt="${fac.name}" class="factory-card-cover" loading="lazy" />
        <span class="factory-city-tag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          ${fac.city}
        </span>
        <span class="factory-status-pill">
          ${fac.isAcceptingRequests ? '🟢 يستقبل الزيارات' : '⏸️ استقبال الطلبات متوقف مؤقتًا'}
        </span>
      </div>

      <div class="factory-card-content">
        <div class="factory-sector-row">
          <span class="sector-badge" style="background-color: ${fac.sectorColor}18; color: ${fac.sectorColor};">
            ${fac.sector}
          </span>
          <span class="text-xs text-muted">تأسس ${fac.established}</span>
        </div>

        <h3 class="factory-card-title">${fac.name}</h3>
        <p class="factory-card-tagline">«${fac.tagline}»</p>
        <p class="factory-card-desc">${fac.description}</p>

        <div class="factory-meta-row">
          <div class="factory-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${fac.tourExperience.duration}
          </div>
          <div class="factory-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            سعة ${fac.tourExperience.capacity} زائر
          </div>
          <div class="factory-meta-item">
            <span style="color: var(--copper); font-weight: 600;">${fac.stations?.length || 4} محطات</span>
          </div>
        </div>

        <div class="factory-card-actions">
          <button class="btn btn-copper btn-sm w-100 btn-view-factory" data-id="${fac.id}">
            استكشف التجربة والمحطات
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

// ==========================================================================
// View: Factory Detailed Page
// ==========================================================================
function renderFactoryView() {
  const fac = state.selectedFactory;
  if (!fac) return;

  const container = document.getElementById('factory-detail-content');
  if (!container) return;

  // Find announced events for this factory
  const factoryEvents = state.events.filter(e => e.factoryId === fac.id);

  // Active station
  const station = fac.stations[state.activeStationIndex] || fac.stations[0];

  container.innerHTML = `
    <!-- Hero Banner -->
    <div class="factory-detail-hero">
      <img src="${fac.coverImage}" alt="${fac.name}" class="factory-detail-hero-img" />
      <div class="factory-hero-gradient">
        <div class="factory-hero-badges">
          <span class="sector-badge" style="background-color: ${fac.sectorColor}; color: #FFF;">
            ${fac.sector}
          </span>
          <span class="badge" style="background-color: rgba(255,255,255,0.2); color: #FFF; padding: 0.2rem 0.75rem; border-radius: 9999px; font-size: 0.8rem;">
            📍 ${fac.city} - ${fac.district}
          </span>
          <span class="badge" style="background-color: rgba(255,255,255,0.2); color: #FFF; padding: 0.2rem 0.75rem; border-radius: 9999px; font-size: 0.8rem;">
            🛡️ بيانات تجريبية معتمدة
          </span>
        </div>
        <h1 class="factory-hero-title">${fac.name}</h1>
        <p class="factory-hero-tagline">«${fac.tagline}»</p>
      </div>
    </div>

    <!-- Overview & Story Grid -->
    <div style="display: grid; grid-template-columns: 1fr; gap: 2rem; margin-bottom: 2.5rem;" class="grid-md-2">
      <div class="card p-4" style="background: var(--bg-ivory-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light); padding: 1.5rem;">
        <h3 class="heading-card mb-2" style="display: flex; align-items: center; gap: 0.5rem; color: var(--copper);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          حكاية المصنع وتاريخه
        </h3>
        <p style="color: var(--text-charcoal-light); line-height: 1.7; font-size: 0.95rem;">${fac.story}</p>
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light); display: flex; gap: 1rem; font-size: 0.85rem; color: var(--text-charcoal-muted);">
          <span><strong>سنة التأسيس:</strong> ${fac.established}</span>
          <span><strong>الاعتماد الصناعي:</strong> معتمد للمسارات السياحية والتعليمية</span>
        </div>
      </div>

      <div class="card p-4" style="background: var(--bg-ivory-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light); padding: 1.5rem;">
        <h3 class="heading-card mb-2" style="display: flex; align-items: center; gap: 0.5rem; color: var(--copper);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6Z"/></svg>
          ماذا ستشاهد في الجولة؟
        </h3>
        <p style="color: var(--text-charcoal-light); line-height: 1.7; font-size: 0.95rem;">${fac.tourExperience.overview}</p>
      </div>
    </div>

    <!-- Products Showcase: ماذا نصنع؟ -->
    <div class="mb-3">
      <div class="section-subhead">
        <div>
          <h2 class="heading-section">ماذا نصنع؟</h2>
          <p class="text-sm text-muted">منتجات تفخر بصناعتها الأيدي الوطنية داخل عنابر المصنع</p>
        </div>
      </div>
      <div class="factory-products-grid">
        ${fac.products.map(prod => `
          <div class="factory-product-item">
            <img src="${prod.image}" alt="${prod.name}" class="factory-product-thumb" />
            <div>
              <span class="badge" style="background: var(--copper-light); color: var(--copper); font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">${prod.tag}</span>
              <h4 style="font-size: 0.95rem; font-weight: 700; margin-top: 4px;">${prod.name}</h4>
              <p style="font-size: 0.8rem; color: var(--text-charcoal-muted); margin-top: 2px;">${prod.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Interactive Tour Stations Timeline (محطات الجولة) -->
    <div class="stations-stepper-wrap">
      <div class="section-subhead">
        <div>
          <h2 class="heading-section">محطات الجولة الميدانية</h2>
          <p class="text-sm text-muted">مسار تفاعلي يمر به الزائر خطوة بخطوة داخل المنشأة</p>
        </div>
      </div>

      <!-- Station Pills Switcher -->
      <div class="stations-pills-row">
        ${fac.stations.map((st, idx) => `
          <button class="station-pill-btn ${idx === state.activeStationIndex ? 'active' : ''}" data-station-index="${idx}">
            <span class="station-num-circle">${st.order}</span>
            <span>${st.title}</span>
          </button>
        `).join('')}
      </div>

      <!-- Station Detail Preview Box -->
      <div class="station-detail-display">
        <div>
          <span style="color: var(--copper); font-weight: 700; font-size: 0.85rem;">المحطة ${station.order} من ${fac.stations.length}</span>
          <h3 style="font-size: 1.35rem; font-weight: 800; margin-block: 0.35rem 0.65rem;">${station.title}</h3>
          <p style="font-weight: 600; color: var(--text-charcoal-light); margin-bottom: 0.75rem; font-size: 0.95rem;">«${station.shortDesc}»</p>
          <p style="color: var(--text-charcoal-muted); line-height: 1.7; font-size: 0.925rem;">${station.fullDesc}</p>
        </div>
        <div>
          <img src="${station.photo}" alt="${station.title}" class="station-detail-img" />
        </div>
      </div>
    </div>

    <!-- Tour Specifications, Requirements, & Guidelines -->
    <div class="tour-specs-box">
      <h3 class="heading-card mb-2" style="color: var(--text-charcoal);">معلومات ومتطلبات حضور الجولة</h3>
      <div class="specs-grid">
        <div class="spec-item">
          <span class="spec-label">مدة الجولة</span>
          <span class="spec-val">⏱️ ${fac.tourExperience.duration}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">السعة لكل جولة</span>
          <span class="spec-val">👥 ${fac.tourExperience.capacity} زائر كحد أقصى</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">الأغراض المتاحة</span>
          <span class="spec-val">🎯 أكتشف، أتعلّم، أتعاون</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">المواعيد المعتادة</span>
          <span class="spec-val">📅 الأحد، الثلاثاء، الخميس</span>
        </div>
      </div>

      <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-medium);">
        <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.65rem;">شروط السلامة والجاهزية:</h4>
        <ul style="padding-right: 1.25rem; font-size: 0.875rem; color: var(--text-charcoal-light); line-height: 1.8;">
          ${fac.tourExperience.requirements.map(req => `<li>${req}</li>`).join('')}
        </ul>
        <div style="margin-top: 1rem; background: #FFF; padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.85rem; border-right: 3px solid var(--copper);">
          📍 <strong>تعليمات الوصول:</strong> ${fac.tourExperience.arrivalInstructions}
        </div>
      </div>
    </div>

    <!-- Announced Public Events Section -->
    ${factoryEvents.length > 0 ? `
      <div class="mb-3">
        <div class="section-subhead">
          <div>
            <h2 class="heading-section">الفعاليات المجدولة المفتوحة</h2>
            <p class="text-sm text-muted">حجز مباشر بمقاعد محددة دون الحاجة لانتظار موافقة الزيارة الخاصة</p>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem;">
          ${factoryEvents.map(evt => `
            <div class="card p-3" style="background: var(--bg-ivory-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light); padding: 1.25rem; display: flex; flex-direction: column;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span class="badge" style="background: var(--status-confirmed-bg); color: var(--status-confirmed-text); font-weight: 700; font-size: 0.75rem; padding: 2px 10px; border-radius: 9999px;">
                  متبقي ${evt.availableSeats} مقاعد
                </span>
                <span class="text-xs text-muted">${evt.fee}</span>
              </div>
              <h4 style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.4rem;">${evt.title}</h4>
              <p class="text-xs text-muted mb-2">🗓️ ${evt.dateText} | ⏰ ${evt.time}</p>
              <p class="text-sm text-muted" style="line-height: 1.5; margin-bottom: 1rem; flex: 1;">${evt.description}</p>
              <button class="btn btn-outline-copper btn-sm w-100 btn-book-event" data-event-id="${evt.id}" ${evt.availableSeats <= 0 ? 'disabled' : ''}>
                ${evt.availableSeats > 0 ? 'احجز مقعدك الآن' : 'اكتملت المقاعد'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Sticky Bottom Bar (Mobile/Desktop) -->
    <div class="sticky-tour-bar">
      <div>
        <div style="font-weight: 700; font-size: 0.95rem;">${fac.name}</div>
        <div class="text-xs text-muted">مدة ${fac.tourExperience.duration} • سعة ${fac.tourExperience.capacity} زائر</div>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-copper btn-open-request-wizard" data-factory-id="${fac.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          طلب زيارة خاصة
        </button>
      </div>
    </div>
  `;
}

// ==========================================================================
// View: My Visits (زياراتي)
// ==========================================================================
function renderVisitsView() {
  const container = document.getElementById('visits-list-container');
  if (!container) return;

  const currentTab = container.dataset.tab || 'active'; // 'active' | 'past'

  const activeRequests = state.requests.filter(r => ['pending', 'alternative_proposed', 'confirmed'].includes(r.status));
  const pastRequests = state.requests.filter(r => ['completed', 'rejected', 'cancelled'].includes(r.status));

  const list = currentTab === 'active' ? activeRequests : pastRequests;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
        <h3 class="heading-card mb-2">لا توجد زيارات في هذا القسم</h3>
        <p class="text-sm text-muted mb-3">ابدأ رحلتك الآن واكتشف المصانع الوطنية وخطوط إنتاجها الفريدة.</p>
        <button class="btn btn-copper" onclick="switchView('discover')">استكشف المصانع المتاحة</button>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(req => {
    return `
      <div class="visit-card" data-req-id="${req.id}">
        <div class="visit-card-header">
          <div>
            <span class="status-badge status-${req.status}">
              ${getStatusBadgeLabel(req.status)}
            </span>
            <h3 class="heading-card" style="margin-top: 0.5rem;">${req.factoryName}</h3>
            <div class="text-xs text-muted" style="margin-top: 2px;">
              رقم الطلب: <strong style="font-family: monospace;">${req.id}</strong> • الغرض: ${req.purposeLabel}
            </div>
          </div>
          <div style="text-align: left;">
            <div style="font-weight: 700; color: var(--copper); font-size: 1rem;">
              🗓️ ${req.requestedDate}
            </div>
            <div class="text-xs text-muted">⏰ ${req.requestedSlotTime}</div>
          </div>
        </div>

        <!-- Group and Coordinator Preview -->
        <div style="background: var(--bg-ivory-warm); padding: 0.9rem; border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <span><strong>المنسق:</strong> ${req.visitorName} (${req.visitorPhone})</span>
            <span><strong>العدد:</strong> ${req.groupDetails?.attendeesCount || req.groupDetails?.studentsCount || 1} مشارك</span>
            ${req.groupDetails?.entityName ? `<span><strong>الجهة:</strong> ${req.groupDetails.entityName}</span>` : ''}
          </div>
          ${req.excitedAbout ? `
            <div style="margin-top: 0.5rem; color: var(--text-charcoal-muted); font-size: 0.8rem;">
              💬 <em>«${req.excitedAbout}»</em>
            </div>
          ` : ''}
        </div>

        <!-- If alternative proposed -> Visitor decision required -->
        ${req.status === 'alternative_proposed' ? `
          <div class="alternative-proposal-box">
            <h4 style="color: var(--status-alt-text); font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem;">
              🔔 اقترح المصنع موعدًا بديلًا لزيارتك:
            </h4>
            <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">
              <strong>الموعد المقترح:</strong> 📅 ${req.proposedAlternative.date} الساعة ${req.proposedAlternative.time}
            </p>
            <p style="font-size: 0.85rem; color: var(--text-charcoal-light); margin-bottom: 1rem;">
              <strong>ملاحظة المصنع:</strong> ${req.proposedAlternative.reason}
            </p>
            <div style="display: flex; gap: 0.75rem;">
              <button class="btn btn-copper btn-sm btn-accept-alt" data-id="${req.id}">
                قبول الموعد المقترح
              </button>
              <button class="btn btn-outline btn-sm btn-reject-alt" data-id="${req.id}">
                الاعتذار وإلغاء الطلب
              </button>
            </div>
          </div>
        ` : ''}

        <!-- If Confirmed -> Render Visitor Ticket Pass -->
        ${req.status === 'confirmed' && req.ticketPass ? `
          <div class="ticket-pass">
            <div class="ticket-pass-header">
              <div>
                <span style="font-size: 0.75rem; color: var(--copper); font-weight: 700;">بطاقة تصريح الزيارة المعتمدة</span>
                <div class="pass-number">${req.ticketPass.passNumber}</div>
              </div>
              <div style="text-align: left;">
                <span class="badge" style="background: var(--status-confirmed-bg); color: var(--status-confirmed-text); font-weight: 700; font-size: 0.75rem; padding: 2px 10px; border-radius: 9999px;">
                  جاهز للدخول
                </span>
              </div>
            </div>
            <div class="ticket-pass-grid">
              <div>
                <span class="text-xs text-muted d-block">بوابة الدخول</span>
                <strong style="font-size: 0.85rem;">${req.ticketPass.gate}</strong>
              </div>
              <div>
                <span class="text-xs text-muted d-block">وقت الحضور</span>
                <strong style="font-size: 0.85rem;">${req.ticketPass.arrivalWindow}</strong>
              </div>
              <div>
                <span class="text-xs text-muted d-block">إرشادات الأمان</span>
                <span style="font-size: 0.8rem; color: var(--text-charcoal-light);">${req.ticketPass.safetyNotes}</span>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- If Rejected -> Show reason -->
        ${req.status === 'rejected' ? `
          <div style="background: var(--status-rejected-bg); border: 1px solid var(--status-rejected-border); padding: 0.9rem; border-radius: var(--radius-md); font-size: 0.85rem; color: var(--status-rejected-text); margin-top: 0.75rem;">
            <strong>سبب الاعتذار:</strong> ${req.rejectionReason}
          </div>
        ` : ''}

        <!-- If Completed -> Stamp feedback -->
        ${req.status === 'completed' ? `
          <div style="background: var(--status-completed-bg); border: 1px solid var(--status-completed-border); padding: 0.9rem; border-radius: var(--radius-md); font-size: 0.85rem; color: var(--status-completed-text); margin-top: 0.75rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              🎖️ <strong>تمت الزيارة بنجاح ومُنح الختم في جواز الاكتشاف!</strong>
            </div>
            <button class="btn btn-outline btn-sm" onclick="switchView('passport')">افتح جوازك</button>
          </div>
        ` : ''}

        <!-- Status Log Accordion Toggle -->
        <div class="audit-timeline">
          <details>
            <summary style="font-size: 0.8rem; color: var(--text-charcoal-muted); cursor: pointer; user-select: none;">
              عرض سجل التحديثات وحالة الطلب (${req.statusLog?.length || 1} إجراءات)
            </summary>
            <div style="margin-top: 0.75rem; padding-right: 0.5rem;">
              ${(req.statusLog || []).map(log => `
                <div class="timeline-item">
                  <span class="timeline-dot"></span>
                  <div>
                    <div style="font-weight: 600; font-size: 0.825rem;">${log.note}</div>
                    <div class="text-xs text-muted">${formatSaudiTime(log.timestamp)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </details>
        </div>
      </div>
    `;
  }).join('');
}

function getStatusBadgeLabel(status) {
  switch (status) {
    case 'pending': return '⏳ بانتظار موافقة المصنع';
    case 'alternative_proposed': return '🔄 موعد بديل مقترح';
    case 'confirmed': return '✅ زيارة مؤكدة';
    case 'completed': return '🎖️ مكتملة';
    case 'rejected': return '❌ معتذر عنها';
    case 'cancelled': return '🚫 ملغاة';
    default: return status;
  }
}

// ==========================================================================
// View: Discovery Passport (جواز الاكتشاف)
// ==========================================================================
function renderPassportView() {
  const container = document.getElementById('passport-content');
  if (!container || !state.passport) return;

  const { stamps, unlockedCount, totalSectors, progressPercentage } = state.passport;

  container.innerHTML = `
    <div class="passport-container">
      <div class="passport-pattern-overlay"></div>
      
      <div class="passport-header">
        <div class="passport-emblem">🛂</div>
        <h2 class="passport-title">جواز الاكتشاف الصناعي الوطني</h2>
        <p class="passport-subtitle">سجل إثبات الرحلات الميدانية واكتساب المعرفة من قلب المصانع</p>
        
        <div style="max-width: 450px; margin-inline: auto; margin-top: 1.5rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #D4AF37; margin-bottom: 0.4rem; font-weight: 600;">
            <span>أختام القطاعات المكتسبة: ${unlockedCount} من ${totalSectors}</span>
            <span>${progressPercentage}%</span>
          </div>
          <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden;">
            <div style="width: ${progressPercentage}%; height: 100%; background: linear-gradient(90deg, #D4AF37, #F3E5AB); transition: width 0.4s ease;"></div>
          </div>
        </div>
      </div>

      <div style="background: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: var(--radius-md); padding: 0.75rem 1rem; text-align: center; font-size: 0.85rem; color: #F7E7CE; max-width: 700px; margin-inline: auto;">
        ℹ️ <strong>ملاحظة نظام الجواز:</strong> يُمنح الختم تلقائيًا عند إتمام زيارتك الميدانية وتسجيل المصنع لحضورك الفعلي، وليس بمجرد الحجز.
      </div>

      <div class="passport-stamps-grid">
        ${stamps.map(st => `
          <div class="stamp-slot ${st.isUnlocked ? 'unlocked' : ''}">
            <div class="stamp-seal">
              <span style="font-size: 2rem;">${st.icon}</span>
              ${st.isUnlocked ? `<span style="font-size: 0.65rem; font-weight: 800; letter-spacing: 1px; color: #D4AF37; margin-top: 2px;">معتمد</span>` : ''}
            </div>
            <h4 class="stamp-sector-title">${st.name}</h4>
            <div style="font-size: 0.75rem; color: ${st.isUnlocked ? '#D4AF37' : 'rgba(255,255,255,0.4)'}; margin-bottom: 0.35rem;">
              ${st.badge}
            </div>
            ${st.isUnlocked ? `
              <div class="stamp-date">🗓️ ${formatShortDate(st.awardedAt)}</div>
              <div style="font-size: 0.75rem; color: #FFF; margin-top: 4px;">${st.factoryName}</div>
            ` : `
              <span style="font-size: 0.75rem; color: rgba(255,255,255,0.35);">بانتظار زيارة المصنع</span>
            `}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ==========================================================================
// View: Factory Manager Dashboard (Isolated per Factory)
// ==========================================================================
function renderFactoryDashboard() {
  const fac = state.factories.find(f => f.id === state.currentFactoryId) || state.factories[0];
  if (!fac) return;

  const container = document.getElementById('factory-dashboard-content');
  if (!container) return;

  // Filter requests strictly for this factory
  const facRequests = state.requests.filter(r => r.factoryId === fac.id);
  const pendingCount = facRequests.filter(r => r.status === 'pending').length;
  const confirmedCount = facRequests.filter(r => r.status === 'confirmed').length;
  const totalVisitors = facRequests.reduce((sum, r) => {
    return sum + (Number(r.groupDetails?.attendeesCount) || Number(r.groupDetails?.studentsCount) || 1);
  }, 0);

  container.innerHTML = `
    <!-- Top Bar with Factory Switcher for Demo testing -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; background: var(--bg-ivory-card); padding: 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
      <div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <h2 class="heading-section">${fac.name}</h2>
          <span class="sector-badge" style="background-color: ${fac.sectorColor}18; color: ${fac.sectorColor};">${fac.sector}</span>
        </div>
        <p class="text-sm text-muted mt-1">المسؤول: ${fac.managerAccount?.displayName || 'مدير التشغيل'}</p>
      </div>

      <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <!-- Accepting Toggle -->
        <button class="btn btn-sm ${fac.isAcceptingRequests ? 'btn-outline' : 'btn-copper'} btn-toggle-accepting" data-id="${fac.id}">
          ${fac.isAcceptingRequests ? '🟢 استقبال الطلبات مفعل (انقر للتعطيل)' : '⏸️ الاستقبال معطل مؤقتًا (انقر للتفعيل)'}
        </button>

        <!-- Factory switcher dropdown for pairing / testing -->
        <select class="filter-select" id="fac-mgr-switcher" style="width: auto; padding-block: 0.4rem;">
          ${state.factories.map(f => `
            <option value="${f.id}" ${f.id === fac.id ? 'selected' : ''}>إدارة: ${f.name}</option>
          `).join('')}
        </select>
      </div>
    </div>

    <!-- KPIs -->
    <div class="dashboard-kpi-grid">
      <div class="kpi-card">
        <div class="kpi-val">${pendingCount}</div>
        <div class="kpi-label">طلبات بانتظار المراجعة والرد</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-val">${confirmedCount}</div>
        <div class="kpi-label">زيارات قادمة مؤكدة</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-val">${totalVisitors}</div>
        <div class="kpi-label">إجمالي الزوار المستضافين</div>
      </div>
    </div>

    <!-- Incoming Requests Management -->
    <div class="card p-4" style="background: var(--bg-ivory-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light); padding: 1.5rem; margin-bottom: 2rem;">
      <div class="section-subhead">
        <div>
          <h3 class="heading-card">إدارة طلبات الزيارة الواردة</h3>
          <p class="text-sm text-muted">قبول الطلبات، اقتراح مواعيد بديلة، أو تسجيل الحضور بعد الزيارة</p>
        </div>
      </div>

      ${facRequests.length === 0 ? `
        <p class="text-muted text-center py-4">لا توجد طلبات واردة حاليًا لهذا المصنع.</p>
      ` : `
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>الزائر / الجهة</th>
                <th>الغرض والعدد</th>
                <th>الموعد المطلوب</th>
                <th>الحالة</th>
                <th>الإجراءات المتاحة</th>
              </tr>
            </thead>
            <tbody>
              ${facRequests.map(req => `
                <tr>
                  <td><strong style="font-family: monospace;">${req.id}</strong></td>
                  <td>
                    <div><strong>${req.visitorName}</strong></div>
                    <div class="text-xs text-muted">${req.visitorPhone}</div>
                    ${req.groupDetails?.entityName ? `<div class="text-xs" style="color: var(--copper); font-weight: 600;">${req.groupDetails.entityName}</div>` : ''}
                  </td>
                  <td>
                    <div>${req.purposeLabel}</div>
                    <div class="text-xs text-muted">${req.groupDetails?.attendeesCount || req.groupDetails?.studentsCount || 1} أشخاص</div>
                  </td>
                  <td>
                    <div>📅 ${req.requestedDate}</div>
                    <div class="text-xs text-muted">⏰ ${req.requestedSlotTime}</div>
                  </td>
                  <td>
                    <span class="status-badge status-${req.status}">
                      ${getStatusBadgeLabel(req.status)}
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                      ${req.status === 'pending' ? `
                        <button class="btn btn-copper btn-sm btn-fac-action" data-req-id="${req.id}" data-action="confirm">
                          قبول وتأكيد
                        </button>
                        <button class="btn btn-outline btn-sm btn-fac-open-propose" data-req-id="${req.id}">
                          اقتراح موعد بديل
                        </button>
                        <button class="btn btn-ghost btn-sm text-danger btn-fac-open-reject" data-req-id="${req.id}">
                          اعتذار
                        </button>
                      ` : ''}

                      ${req.status === 'confirmed' ? `
                        <button class="btn btn-copper btn-sm btn-fac-action" data-req-id="${req.id}" data-action="complete" style="background-color: var(--status-completed-text);">
                          تسجيل حضور واكتمال
                        </button>
                      ` : ''}

                      ${req.status === 'alternative_proposed' ? `
                        <span class="text-xs text-muted">بانتظار رد الزائر على الموعد المقترح</span>
                      ` : ''}

                      ${req.status === 'completed' ? `
                        <span class="text-xs" style="color: var(--status-completed-text); font-weight: 700;">تم منح الختم بنجاح</span>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>

    <!-- Create Announced Event Form -->
    <div class="card p-4" style="background: var(--bg-ivory-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light); padding: 1.5rem;">
      <h3 class="heading-card mb-2">إعلان فعالية عامة جديدة بمقاعد محددة</h3>
      <p class="text-sm text-muted mb-3">تتيح للجمهور الحجز المباشر دون الحاجة لطلب زيارة خاصة</p>
      
      <form id="form-create-event" data-factory-id="${fac.id}">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group mb-0">
            <label class="form-label">عنوان الفعالية</label>
            <input type="text" name="title" class="form-control" placeholder="مثال: ورشة التحميص الحسي" required />
          </div>
          <div class="form-group mb-0">
            <label class="form-label">تاريخ الفعالية</label>
            <input type="date" name="date" class="form-control" required />
          </div>
          <div class="form-group mb-0">
            <label class="form-label">الوقت</label>
            <input type="text" name="time" class="form-control" placeholder="05:00 م - 07:00 م" required />
          </div>
          <div class="form-group mb-0">
            <label class="form-label">إجمالي المقاعد المتاحة</label>
            <input type="number" name="totalSeats" class="form-control" min="5" max="50" value="15" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">وصف الفعالية وأهدافها</label>
          <textarea name="description" class="form-control" rows="2" placeholder="اكتب نبذة موجزة عما سيختبره الحضور..." required></textarea>
        </div>
        <button type="submit" class="btn btn-copper">نشر الفعالية للجمهور</button>
      </form>
    </div>
  `;
}

// ==========================================================================
// View: Platform Administration (إدارة المنصة)
// ==========================================================================
async function renderAdminDashboard() {
  const container = document.getElementById('admin-dashboard-content');
  if (!container) return;

  try {
    const metrics = await API.get('/api/admin/metrics');
    const apps = await API.get('/api/admin/onboarding');

    container.innerHTML = `
      <div class="section-subhead">
        <div>
          <h2 class="heading-section">لوحة إدارة منصة «كيف تُصنع؟»</h2>
          <p class="text-sm text-muted">مراجعة طلبات انضمام المصانع، اعتماد النشر، والإشراف العام على الزيارات</p>
        </div>
      </div>

      <!-- Admin KPIs -->
      <div class="dashboard-kpi-grid">
        <div class="kpi-card">
          <div class="kpi-val">${metrics.totalFactories}</div>
          <div class="kpi-label">المصانع المسجلة بالمنصة</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${metrics.pendingOnboarding}</div>
          <div class="kpi-label">طلبات انضمام بانتظار المراجعة</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${metrics.confirmedVisits}</div>
          <div class="kpi-label">زيارات مؤكدة جارية</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">${metrics.completedVisits}</div>
          <div class="kpi-label">زيارات مكتملة وأختام ممنوحة</div>
        </div>
      </div>

      <!-- Factory Onboarding Applications Review -->
      <div class="card p-4" style="background: var(--bg-ivory-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light); padding: 1.5rem; margin-bottom: 2rem;">
        <h3 class="heading-card mb-2">طلبات انضمام المصانع الجديدة («سجّل مصنعك»)</h3>
        <p class="text-sm text-muted mb-3">لا يُنشر أي مصنع جديد تلقائيًا دون موافقة وتحقق إدارة المنصة</p>

        ${apps.length === 0 ? `
          <p class="text-muted text-center py-4">لا توجد طلبات انضمام جديدة بانتظار المراجعة.</p>
        ` : `
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>اسم المنشأة</th>
                  <th>القطاع والمدينة</th>
                  <th>مسؤول الاتصال</th>
                  <th>نبذة الجولة المقترحة</th>
                  <th>الحالة</th>
                  <th>القرار الإداري</th>
                </tr>
              </thead>
              <tbody>
                ${apps.map(app => `
                  <tr>
                    <td><strong>${app.factoryName}</strong></td>
                    <td>${app.sector} • ${app.city}</td>
                    <td>
                      <div>${app.contactName}</div>
                      <div class="text-xs text-muted">${app.phone}</div>
                    </td>
                    <td style="max-width: 280px; font-size: 0.85rem;">
                      ${app.experienceSummary}
                    </td>
                    <td>
                      <span class="status-badge ${app.status === 'approved' ? 'status-confirmed' : (app.status === 'rejected' ? 'status-rejected' : 'status-pending')}">
                        ${app.status === 'approved' ? 'معتمد ومنشور' : (app.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة')}
                      </span>
                    </td>
                    <td>
                      ${app.status === 'pending_review' ? `
                        <div style="display: flex; gap: 0.4rem;">
                          <button class="btn btn-copper btn-sm btn-admin-review-onboarding" data-id="${app.id}" data-approve="true">
                            اعتماد ونشر المصنع
                          </button>
                          <button class="btn btn-outline btn-sm text-danger btn-admin-review-onboarding" data-id="${app.id}" data-approve="false">
                            رفض
                          </button>
                        </div>
                      ` : `
                        <span class="text-xs text-muted">${app.reviewNote || 'تم اتخاذ الإجراء'}</span>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Reset Demo Data Control -->
      <div style="background: var(--bg-ivory-warm); border: 1px solid var(--border-medium); border-radius: var(--radius-lg); padding: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <strong style="font-size: 0.95rem;">إعادة تهيئة البيانات التجريبية الأولية</strong>
          <p class="text-xs text-muted mt-1">يُعيد المصانع الخمسة، الفعاليات، الطلبات، والأختام إلى حالتها الأصلية للاختبار المتكرر.</p>
        </div>
        <button class="btn btn-outline btn-sm btn-reset-demo">
          🔄 استعادة البيانات الأولية
        </button>
      </div>
    `;
  } catch (e) {
    console.error(e);
  }
}

// ==========================================================================
// 3-Step Visit Request Wizard Modal
// ==========================================================================
function openRequestWizard(factoryId) {
  const fac = state.factories.find(f => f.id === factoryId);
  if (!fac) return;

  state.wizard.factoryId = factoryId;
  state.wizard.step = 1;
  state.wizard.purpose = 'explore';
  state.wizard.requestedDate = '';
  state.wizard.requestedSlotTime = '';
  state.wizard.excitedAbout = '';
  state.wizard.visitorName = state.currentVisitor.name;
  state.wizard.visitorEmail = state.currentVisitor.email;
  state.wizard.visitorPhone = state.currentVisitor.phone;

  renderWizardStep();
  openModal('modal-visit-request');
}

function renderWizardStep() {
  const fac = state.factories.find(f => f.id === state.wizard.factoryId);
  if (!fac) return;

  // Title
  document.getElementById('wizard-factory-name').textContent = fac.name;

  // Stepper Nodes
  [1, 2, 3].forEach(stepNum => {
    const node = document.getElementById(`step-node-${stepNum}`);
    if (node) {
      node.classList.remove('active', 'completed');
      if (stepNum === state.wizard.step) node.classList.add('active');
      else if (stepNum < state.wizard.step) node.classList.add('completed');
    }
  });

  const step1Box = document.getElementById('wizard-step-1');
  const step2Box = document.getElementById('wizard-step-2');
  const step3Box = document.getElementById('wizard-step-3');

  step1Box.classList.toggle('d-none', state.wizard.step !== 1);
  step2Box.classList.toggle('d-none', state.wizard.step !== 2);
  step3Box.classList.toggle('d-none', state.wizard.step !== 3);

  // Dynamic purpose-dependent fields in Step 1
  renderWizardDynamicPurposeFields();

  // Populate slots in Step 2
  if (state.wizard.step === 2) {
    renderWizardSlots(fac);
  }

  // Populate summary review in Step 3
  if (state.wizard.step === 3) {
    renderWizardSummary(fac);
  }

  // Prev / Next button states
  const btnPrev = document.getElementById('wizard-btn-prev');
  const btnNext = document.getElementById('wizard-btn-next');
  const btnSubmit = document.getElementById('wizard-btn-submit');

  if (btnPrev) btnPrev.style.display = state.wizard.step > 1 ? 'inline-flex' : 'none';
  if (btnNext) btnNext.style.display = state.wizard.step < 3 ? 'inline-flex' : 'none';
  if (btnSubmit) btnSubmit.style.display = state.wizard.step === 3 ? 'inline-flex' : 'none';
}

function renderWizardDynamicPurposeFields() {
  const dynamicContainer = document.getElementById('wizard-dynamic-fields');
  if (!dynamicContainer) return;

  const purpose = state.wizard.purpose;

  if (purpose === 'explore') {
    dynamicContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">عدد الحضور الإجمالي *</label>
          <input type="number" id="wiz-attendees" class="form-control" min="1" max="15" value="${state.wizard.groupDetails.attendeesCount || 2}" required />
        </div>
        <div class="form-group">
          <label class="form-label">الفئة العمرية للحضور</label>
          <select id="wiz-age-range" class="filter-select">
            <option value="عائلات وأطفال">عائلات وأطفال</option>
            <option value="كبار وشباب">كبار وشباب (فوق 15 سنة)</option>
            <option value="أفراد مستقلون">أفراد مستقلون</option>
          </select>
        </div>
      </div>
    `;
  } else if (purpose === 'learn') {
    dynamicContainer.innerHTML = `
      <div class="form-group">
        <label class="form-label">اسم المدرسة / الجامعة / المؤسسة التعليمية *</label>
        <input type="text" id="wiz-entity-name" class="form-control" placeholder="مثال: مدارس الأندلس - المرحلة الثانوية" value="${state.wizard.groupDetails.entityName || ''}" required />
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">المرحلة الأكاديمية</label>
          <select id="wiz-academic-level" class="filter-select">
            <option value="ابتدائي (عليا)">ابتدائي (صفوف عليا)</option>
            <option value="متوسط">متوسط</option>
            <option value="ثانوي">ثانوي</option>
            <option value="جامعي">جامعي</option>
            <option value="فني / مهني">تدريب فني ومهني</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">عدد الطلاب *</label>
          <input type="number" id="wiz-students-count" class="form-control" min="5" max="25" value="${state.wizard.groupDetails.studentsCount || 15}" required />
        </div>
        <div class="form-group">
          <label class="form-label">عدد المشرفين *</label>
          <input type="number" id="wiz-chaperones-count" class="form-control" min="1" max="5" value="${state.wizard.groupDetails.chaperonesCount || 2}" required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">الهدف التعليمي من الزيارة</label>
        <input type="text" id="wiz-educational-goal" class="form-control" placeholder="مثال: ربط مقرر الكيمياء / الفيزياء بخطوط الإنتاج والتصنيع الحقيقي" value="${state.wizard.groupDetails.educationalGoal || ''}" />
      </div>
    `;
  } else if (purpose === 'collaborate') {
    dynamicContainer.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="form-group">
          <label class="form-label">اسم الشركة / المنشأة التجارية *</label>
          <input type="text" id="wiz-biz-name" class="form-control" placeholder="مثال: مؤسسة رواء لخدمات الضيافة" value="${state.wizard.groupDetails.entityName || ''}" required />
        </div>
        <div class="form-group">
          <label class="form-label">مجال الاهتمام التجاري</label>
          <input type="text" id="wiz-biz-domain" class="form-control" placeholder="مثال: توريد، توزيع، تصنيع للغير (Private Label)" value="${state.wizard.groupDetails.domain || ''}" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">موضوع اللقاء ونقاط النقاش المقترحة</label>
        <input type="text" id="wiz-biz-subject" class="form-control" placeholder="مثال: بحث التعاقد لتوريد كميات ربع سنوية" value="${state.wizard.groupDetails.meetingSubject || ''}" />
      </div>
    `;
  }
}

function renderWizardSlots(fac) {
  const slotsContainer = document.getElementById('wizard-slots-picker');
  if (!slotsContainer) return;

  const defaultSlots = fac.regularSlots || [
    { day: "الأحد", time: "10:00 ص" },
    { day: "الثلاثاء", time: "04:30 م" },
    { day: "الخميس", time: "11:00 ص" }
  ];

  slotsContainer.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
      <div class="form-group">
        <label class="form-label">التاريخ المقترح *</label>
        <input type="date" id="wiz-date-input" class="form-control" value="${state.wizard.requestedDate || '2026-10-25'}" required />
      </div>
      <div class="form-group">
        <label class="form-label">الفترة الزمنية المفضلة *</label>
        <select id="wiz-time-select" class="filter-select">
          ${defaultSlots.map(s => `
            <option value="${s.time}" ${state.wizard.requestedSlotTime === s.time ? 'selected' : ''}>${s.day} - ${s.time}</option>
          `).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">وش أكثر شيء متحمّس تشوفه؟ (اختياري)</label>
      <input type="text" id="wiz-excited-input" class="form-control" placeholder="مثال: رؤية عملية التقطير، أو تذوق العينات، أو مراحل الفرز الآلي..." value="${state.wizard.excitedAbout}" />
    </div>
  `;
}

function renderWizardSummary(fac) {
  const summaryBox = document.getElementById('wizard-summary-content');
  if (!summaryBox) return;

  const pLabel = state.wizard.purpose === 'explore' ? 'أكتشف (أفراد وعائلات)' : (state.wizard.purpose === 'learn' ? 'أتعلّم (مؤسسات تعليمية)' : 'أتعاون (أعمال واستثمار)');
  const attendeesCount = state.wizard.purpose === 'explore' ? state.wizard.groupDetails.attendeesCount : (state.wizard.purpose === 'learn' ? state.wizard.groupDetails.studentsCount : 2);

  summaryBox.innerHTML = `
    <div style="background: var(--bg-ivory-warm); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-medium); font-size: 0.9rem; margin-bottom: 1.5rem;">
      <div style="font-weight: 700; color: var(--copper); margin-bottom: 0.5rem; font-size: 1.05rem;">
        ملخص طلب الزيارة:
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div><strong>المصنع:</strong> ${fac.name}</div>
        <div><strong>المدينة:</strong> ${fac.city}</div>
        <div><strong>غرض الزيارة:</strong> ${pLabel}</div>
        <div><strong>العدد المتوقع:</strong> ${attendeesCount} شخص</div>
        <div><strong>التاريخ المطلوب:</strong> 📅 ${state.wizard.requestedDate}</div>
        <div><strong>الوقت المطلوب:</strong> ⏰ ${state.wizard.requestedSlotTime}</div>
      </div>
      ${state.wizard.excitedAbout ? `
        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border-medium); font-size: 0.85rem; color: var(--text-charcoal-light);">
          <strong>ما تتحمس لرؤيته:</strong> «${state.wizard.excitedAbout}»
        </div>
      ` : ''}
    </div>

    <!-- Coordinator Details (User authentication check simulated) -->
    <h4 style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.75rem;">بيانات المنسق والاتصال لتلقي إشعار الرد:</h4>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
      <div class="form-group">
        <label class="form-label">الاسم الكامل *</label>
        <input type="text" id="wiz-coord-name" class="form-control" value="${state.wizard.visitorName}" required />
      </div>
      <div class="form-group">
        <label class="form-label">رقم الجوال *</label>
        <input type="tel" id="wiz-coord-phone" class="form-control" value="${state.wizard.visitorPhone}" required />
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">البريد الإلكتروني *</label>
      <input type="email" id="wiz-coord-email" class="form-control" value="${state.wizard.visitorEmail}" required />
    </div>

    <div style="background: #FFF8E6; border: 1px solid #FFE08A; border-radius: var(--radius-sm); padding: 0.75rem 1rem; font-size: 0.8rem; color: #996B00;">
      ⚠️ <strong>تنبيه:</strong> إرسال هذا الطلب ليس حجزًا مؤكدًا، وسيقوم المصنع بمراجعة جدول خطوط الإنتاج والرد بالموافقة أو اقتراح موعد بديل.
    </div>
  `;
}

// ==========================================================================
// Event Listeners & Interaction Wiring
// ==========================================================================
function setupEventListeners() {
  // Navigation Links
  document.querySelectorAll('[data-view]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = elem.dataset.view;
      switchView(targetView);
    });
  });

  // Role Switcher Modal Triggers
  const roleSelectorBtn = document.getElementById('role-selector-btn');
  if (roleSelectorBtn) {
    roleSelectorBtn.addEventListener('click', () => {
      openModal('modal-role-switcher');
    });
  }

  // Switch role actions inside modal
  document.querySelectorAll('.btn-set-role').forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      const facId = btn.dataset.factoryId || null;
      setRole(role, facId);
    });
  });

  // Search input
  const searchInput = document.getElementById('filter-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.filterSearch = e.target.value.trim();
      renderDiscoveryView();
    });
  }

  // Filter selects
  const filterCity = document.getElementById('filter-city');
  if (filterCity) {
    filterCity.addEventListener('change', (e) => {
      state.filterCity = e.target.value;
      renderDiscoveryView();
    });
  }

  const filterSector = document.getElementById('filter-sector');
  if (filterSector) {
    filterSector.addEventListener('change', (e) => {
      state.filterSector = e.target.value;
      renderDiscoveryView();
    });
  }

  const filterPurpose = document.getElementById('filter-purpose');
  if (filterPurpose) {
    filterPurpose.addEventListener('change', (e) => {
      state.filterPurpose = e.target.value;
      renderDiscoveryView();
    });
  }

  // Reset filters
  const resetBtn = document.getElementById('btn-reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.filterSearch = '';
      state.filterCity = 'all';
      state.filterSector = 'all';
      state.filterPurpose = 'all';
      if (searchInput) searchInput.value = '';
      if (filterCity) filterCity.value = 'all';
      if (filterSector) filterSector.value = 'all';
      if (filterPurpose) filterPurpose.value = 'all';
      renderDiscoveryView();
    });
  }

  // Delegate factory clicks in Discovery
  document.addEventListener('click', (e) => {
    // Open Factory Detail
    const viewFacBtn = e.target.closest('.btn-view-factory') || e.target.closest('.product-journey-card');
    if (viewFacBtn) {
      const facId = viewFacBtn.dataset.id;
      switchView('factory', { factoryId: facId });
      return;
    }

    // Station Pills inside Factory Detail
    const stationBtn = e.target.closest('.station-pill-btn');
    if (stationBtn) {
      const idx = Number(stationBtn.dataset.stationIndex);
      state.activeStationIndex = idx;
      renderFactoryView();
      return;
    }

    // Open Request Wizard
    const openWizBtn = e.target.closest('.btn-open-request-wizard');
    if (openWizBtn) {
      const facId = openWizBtn.dataset.factoryId;
      openRequestWizard(facId);
      return;
    }

    // Book Public Event
    const bookEventBtn = e.target.closest('.btn-book-event');
    if (bookEventBtn) {
      const eventId = bookEventBtn.dataset.eventId;
      openBookEventModal(eventId);
      return;
    }

    // Accept Alternative Date
    const acceptAltBtn = e.target.closest('.btn-accept-alt');
    if (acceptAltBtn) {
      const reqId = acceptAltBtn.dataset.id;
      handleAcceptAlternative(reqId);
      return;
    }

    // Reject Alternative Date
    const rejectAltBtn = e.target.closest('.btn-reject-alt');
    if (rejectAltBtn) {
      const reqId = rejectAltBtn.dataset.id;
      handleRejectAlternative(reqId);
      return;
    }

    // Factory Manager Status Actions (confirm, complete)
    const facActionBtn = e.target.closest('.btn-fac-action');
    if (facActionBtn) {
      const reqId = facActionBtn.dataset.reqId;
      const action = facActionBtn.dataset.action;
      handleFactoryStatusAction(reqId, action);
      return;
    }

    // Factory Manager Propose Alternative
    const openProposeBtn = e.target.closest('.btn-fac-open-propose');
    if (openProposeBtn) {
      const reqId = openProposeBtn.dataset.reqId;
      openProposeAlternativeModal(reqId);
      return;
    }

    // Factory Manager Reject with Reason
    const openRejectBtn = e.target.closest('.btn-fac-open-reject');
    if (openRejectBtn) {
      const reqId = openRejectBtn.dataset.reqId;
      openRejectModal(reqId);
      return;
    }

    // Factory Switcher in Manager view
    const toggleAcceptingBtn = e.target.closest('.btn-toggle-accepting');
    if (toggleAcceptingBtn) {
      handleToggleAccepting(toggleAcceptingBtn.dataset.id);
      return;
    }

    // Admin Review Onboarding
    const adminRevBtn = e.target.closest('.btn-admin-review-onboarding');
    if (adminRevBtn) {
      const appId = adminRevBtn.dataset.id;
      const approve = adminRevBtn.dataset.approve === 'true';
      handleAdminReviewOnboarding(appId, approve);
      return;
    }

    // Reset Demo Data
    const resetDemoBtn = e.target.closest('.btn-reset-demo');
    if (resetDemoBtn) {
      handleResetDemoData();
      return;
    }
  });

  // Factory Manager switcher dropdown change
  document.addEventListener('change', (e) => {
    if (e.target.id === 'fac-mgr-switcher') {
      state.currentFactoryId = e.target.value;
      refreshRequests().then(() => renderFactoryDashboard());
    }
  });

  // Visits tab filter (active vs past)
  document.querySelectorAll('.tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');
      const listContainer = document.getElementById('visits-list-container');
      if (listContainer) {
        listContainer.dataset.tab = tabBtn.dataset.tab;
        renderVisitsView();
      }
    });
  });

  // Modal Closers
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });

  // Close modals on overlay backdrop click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // Wizard Step Navigation
  const btnWizNext = document.getElementById('wizard-btn-next');
  if (btnWizNext) {
    btnWizNext.addEventListener('click', () => {
      if (validateWizardStep(state.wizard.step)) {
        state.wizard.step++;
        renderWizardStep();
      }
    });
  }

  const btnWizPrev = document.getElementById('wizard-btn-prev');
  if (btnWizPrev) {
    btnWizPrev.addEventListener('click', () => {
      if (state.wizard.step > 1) {
        state.wizard.step--;
        renderWizardStep();
      }
    });
  }

  // Wizard Purpose Radio Selection
  document.querySelectorAll('.purpose-radio-label').forEach(label => {
    label.addEventListener('click', () => {
      document.querySelectorAll('.purpose-radio-label').forEach(l => l.classList.remove('active'));
      label.classList.add('active');
      state.wizard.purpose = label.dataset.purpose;
      renderWizardDynamicPurposeFields();
    });
  });

  // Submit Visit Request
  const btnWizSubmit = document.getElementById('wizard-btn-submit');
  if (btnWizSubmit) {
    btnWizSubmit.addEventListener('click', handleVisitRequestSubmit);
  }

  // Factory Onboarding Modal Trigger
  const btnOpenOnboarding = document.getElementById('btn-open-onboarding');
  if (btnOpenOnboarding) {
    btnOpenOnboarding.addEventListener('click', () => {
      openModal('modal-onboarding');
    });
  }

  // Submit Onboarding Form
  const formOnboarding = document.getElementById('form-onboarding');
  if (formOnboarding) {
    formOnboarding.addEventListener('submit', handleOnboardingSubmit);
  }

  // Submit Create Event Form in Factory Dashboard
  document.addEventListener('submit', (e) => {
    if (e.target.id === 'form-create-event') {
      e.preventDefault();
      handleCreateEventSubmit(e.target);
    }
  });

  // Notification Bell Click
  const notifBell = document.getElementById('notif-bell-btn');
  if (notifBell) {
    notifBell.addEventListener('click', () => {
      renderNotificationsModal();
      openModal('modal-notifications');
    });
  }
}

// ==========================================================================
// Wizard Validation & Actions
// ==========================================================================
function validateWizardStep(step) {
  if (step === 1) {
    const purpose = state.wizard.purpose;
    if (purpose === 'explore') {
      const attendees = document.getElementById('wiz-attendees');
      if (attendees && Number(attendees.value) < 1) {
        showToast('يرجى تحديد عدد الحضور', 'warning');
        return false;
      }
      state.wizard.groupDetails.attendeesCount = Number(attendees.value);
      const age = document.getElementById('wiz-age-range');
      if (age) state.wizard.groupDetails.ageRange = age.value;
    } else if (purpose === 'learn') {
      const entity = document.getElementById('wiz-entity-name');
      const students = document.getElementById('wiz-students-count');
      const chaperones = document.getElementById('wiz-chaperones-count');
      if (!entity || !entity.value.trim()) {
        showToast('يرجى كتابة اسم المؤسسة التعليمية', 'warning');
        return false;
      }
      state.wizard.groupDetails.entityName = entity.value.trim();
      state.wizard.groupDetails.studentsCount = Number(students?.value) || 10;
      state.wizard.groupDetails.chaperonesCount = Number(chaperones?.value) || 2;
      state.wizard.groupDetails.educationalGoal = document.getElementById('wiz-educational-goal')?.value || '';
    } else if (purpose === 'collaborate') {
      const bizName = document.getElementById('wiz-biz-name');
      if (!bizName || !bizName.value.trim()) {
        showToast('يرجى كتابة اسم المنشأة التجارية', 'warning');
        return false;
      }
      state.wizard.groupDetails.entityName = bizName.value.trim();
      state.wizard.groupDetails.domain = document.getElementById('wiz-biz-domain')?.value || '';
      state.wizard.groupDetails.meetingSubject = document.getElementById('wiz-biz-subject')?.value || '';
    }
    return true;
  }

  if (step === 2) {
    const dateInput = document.getElementById('wiz-date-input');
    const timeSelect = document.getElementById('wiz-time-select');
    if (!dateInput || !dateInput.value) {
      showToast('يرجى اختيار التاريخ المناسب للزيارة', 'warning');
      return false;
    }
    state.wizard.requestedDate = dateInput.value;
    state.wizard.requestedSlotTime = timeSelect?.value || '10:00 ص';
    state.wizard.excitedAbout = document.getElementById('wiz-excited-input')?.value.trim() || '';
    return true;
  }

  return true;
}

async function handleVisitRequestSubmit() {
  const coordName = document.getElementById('wiz-coord-name')?.value.trim();
  const coordPhone = document.getElementById('wiz-coord-phone')?.value.trim();
  const coordEmail = document.getElementById('wiz-coord-email')?.value.trim();

  if (!coordName || !coordPhone || !coordEmail) {
    showToast('يرجى استكمال جميع بيانات المنسق', 'warning');
    return;
  }

  try {
    const payload = {
      factoryId: state.wizard.factoryId,
      purpose: state.wizard.purpose,
      visitorId: state.currentVisitor.id,
      visitorName: coordName,
      visitorPhone: coordPhone,
      visitorEmail: coordEmail,
      groupDetails: state.wizard.groupDetails,
      requestedDate: state.wizard.requestedDate,
      requestedSlotTime: state.wizard.requestedSlotTime,
      excitedAbout: state.wizard.excitedAbout
    };

    const res = await API.post('/api/requests', payload);
    closeModal('modal-visit-request');

    // Show nice confirmation modal
    document.getElementById('conf-req-id').textContent = res.data.id;
    document.getElementById('conf-factory-name').textContent = res.data.factoryName;
    document.getElementById('conf-date-time').textContent = `${res.data.requestedDate} الساعة ${res.data.requestedSlotTime}`;
    openModal('modal-request-confirmed');

    await refreshRequests();
  } catch (e) {
    console.error(e);
  }
}

// ==========================================================================
// Public Event Booking
// ==========================================================================
function openBookEventModal(eventId) {
  const evt = state.events.find(e => e.id === eventId);
  if (!evt) return;

  state.activeEventToBook = evt;
  document.getElementById('book-event-title').textContent = evt.title;
  document.getElementById('book-event-meta').textContent = `${evt.factoryName} • 🗓️ ${evt.dateText} (${evt.time})`;
  document.getElementById('book-event-available').textContent = `المقاعد المتبقية: ${evt.availableSeats} مقعد`;

  const seatsSelect = document.getElementById('book-event-seats');
  if (seatsSelect) {
    seatsSelect.innerHTML = '';
    const maxSelectable = Math.min(evt.availableSeats, 4);
    for (let i = 1; i <= maxSelectable; i++) {
      seatsSelect.innerHTML += `<option value="${i}">${i} مقعد</option>`;
    }
  }

  // Pre-fill user details
  document.getElementById('book-event-name').value = state.currentVisitor.name;
  document.getElementById('book-event-email').value = state.currentVisitor.email;
  document.getElementById('book-event-phone').value = state.currentVisitor.phone;

  openModal('modal-event-book');
}

document.getElementById('form-book-event')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!state.activeEventToBook) return;

  const seats = document.getElementById('book-event-seats')?.value || 1;
  const name = document.getElementById('book-event-name')?.value.trim();
  const email = document.getElementById('book-event-email')?.value.trim();
  const phone = document.getElementById('book-event-phone')?.value.trim();

  try {
    const res = await API.post(`/api/events/${state.activeEventToBook.id}/book`, {
      visitorName: name,
      visitorEmail: email,
      visitorPhone: phone,
      seats: Number(seats)
    });

    closeModal('modal-event-book');
    showToast(res.message || 'تم حجز مقعدك بنجاح!', 'success');
    state.events = await API.get('/api/events');
    renderFactoryView();
  } catch (e) {
    console.error(e);
  }
});

// ==========================================================================
// Visitor Alternative Response
// ==========================================================================
async function handleAcceptAlternative(reqId) {
  try {
    const res = await API.post(`/api/requests/${reqId}/accept-alternative`, { visitorId: state.currentVisitor.id });
    showToast('تم قبول الموعد البديل وتأكيد الزيارة! تم إصدار بطاقة الدخول.', 'success');
    await refreshRequests();
    renderVisitsView();
  } catch (e) {
    console.error(e);
  }
}

async function handleRejectAlternative(reqId) {
  const reason = prompt('سبب الاعتذار عن الموعد البديل (اختياري):', 'الموعد لا يناسب جدولنا');
  try {
    const res = await API.post(`/api/requests/${reqId}/reject-alternative`, {
      visitorId: state.currentVisitor.id,
      reason
    });
    showToast('تم إلغاء الطلب.', 'info');
    await refreshRequests();
    renderVisitsView();
  } catch (e) {
    console.error(e);
  }
}

// ==========================================================================
// Factory Manager Actions
// ==========================================================================
async function handleFactoryStatusAction(reqId, action) {
  try {
    const res = await API.post(`/api/factory/${state.currentFactoryId}/requests/${reqId}/status`, {
      action
    });
    showToast(res.message || 'تم تحديث حالة الطلب بنجاح', 'success');
    await refreshRequests();
    await refreshPassport();
    renderFactoryDashboard();
  } catch (e) {
    console.error(e);
  }
}

function openProposeAlternativeModal(reqId) {
  const req = state.requests.find(r => r.id === reqId);
  if (!req) return;

  document.getElementById('propose-req-id').value = reqId;
  document.getElementById('propose-visitor-name').textContent = req.visitorName;
  document.getElementById('propose-current-date').textContent = `${req.requestedDate} (${req.requestedSlotTime})`;
  openModal('modal-propose-alternative');
}

document.getElementById('form-propose-alternative')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const reqId = document.getElementById('propose-req-id').value;
  const newDate = document.getElementById('propose-new-date').value;
  const newTime = document.getElementById('propose-new-time').value;
  const reason = document.getElementById('propose-reason').value.trim();

  try {
    const res = await API.post(`/api/factory/${state.currentFactoryId}/requests/${reqId}/status`, {
      action: 'propose_alternative',
      payload: {
        alternativeDate: newDate,
        alternativeTime: newTime,
        reason
      }
    });

    closeModal('modal-propose-alternative');
    showToast('تم إرسال الموعد البديل المقترح للزائر بنجاح', 'success');
    await refreshRequests();
    renderFactoryDashboard();
  } catch (e) {
    console.error(e);
  }
});

function openRejectModal(reqId) {
  const reason = prompt('سبب الاعتذار عن الزيارة (سيصل للزائر في سجل التحديثات):', 'انشغال صالات الإنتاج بالصيانة السنوية');
  if (reason) {
    API.post(`/api/factory/${state.currentFactoryId}/requests/${reqId}/status`, {
      action: 'reject',
      payload: { reason }
    }).then(() => {
      showToast('تم الاعتذار عن الطلب', 'info');
      refreshRequests().then(() => renderFactoryDashboard());
    });
  }
}

async function handleToggleAccepting(factoryId) {
  try {
    const res = await API.post(`/api/factory/${factoryId}/toggle-status`, {});
    showToast(res.message, 'info');
    state.factories = await API.get('/api/factories');
    renderFactoryDashboard();
  } catch (e) {
    console.error(e);
  }
}

async function handleCreateEventSubmit(form) {
  const formData = new FormData(form);
  const factoryId = form.dataset.factoryId;
  const payload = {
    title: formData.get('title'),
    date: formData.get('date'),
    time: formData.get('time'),
    totalSeats: Number(formData.get('totalSeats')),
    description: formData.get('description'),
    fee: 'مجانية (بتسجيل مسبق)'
  };

  try {
    const res = await API.post(`/api/factory/${factoryId}/events`, payload);
    showToast('تم إنشاء الفعالية ونشرها بنجاح!', 'success');
    form.reset();
    state.events = await API.get('/api/events');
    renderFactoryDashboard();
  } catch (e) {
    console.error(e);
  }
}

// ==========================================================================
// Onboarding & Admin
// ==========================================================================
async function handleOnboardingSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const payload = {
    factoryName: formData.get('factoryName'),
    sector: formData.get('sector'),
    city: formData.get('city'),
    contactName: formData.get('contactName'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    experienceSummary: formData.get('experienceSummary'),
    capacityPerTour: Number(formData.get('capacityPerTour')) || 15
  };

  try {
    const res = await API.post('/api/onboarding', payload);
    closeModal('modal-onboarding');
    form.reset();
    showToast(res.message || 'تم إرسال طلب تسجيل المصنع للمراجعة', 'success');
  } catch (e) {
    console.error(e);
  }
}

async function handleAdminReviewOnboarding(appId, approve) {
  try {
    const res = await API.post(`/api/admin/onboarding/${appId}/review`, { approve });
    showToast(res.message, approve ? 'success' : 'info');
    state.factories = await API.get('/api/factories');
    renderAdminDashboard();
  } catch (e) {
    console.error(e);
  }
}

async function handleResetDemoData() {
  if (!confirm('هل تود استعادة البيانات الأولية الافتراضية للتطبيق؟')) return;
  try {
    await API.post('/api/reset-data', {});
    showToast('تمت استعادة البيانات التجريبية بنجاح!', 'success');
    await loadInitialData();
    renderApp();
  } catch (e) {
    console.error(e);
  }
}

// ==========================================================================
// Notifications Modal
// ==========================================================================
function renderNotificationsModal() {
  const container = document.getElementById('notifications-list');
  if (!container) return;

  if (state.notifications.length === 0) {
    container.innerHTML = '<p class="text-muted text-center py-3">لا توجد إشعارات حالية.</p>';
    return;
  }

  container.innerHTML = state.notifications.map(n => `
    <div style="background: ${n.read ? 'var(--bg-ivory-warm)' : '#FFF'}; border: 1px solid var(--border-medium); border-right: 4px solid var(--copper); padding: 0.9rem; border-radius: var(--radius-md); margin-bottom: 0.75rem;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <h4 style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem;">${n.title}</h4>
        <span class="text-xs text-muted">${formatSaudiTime(n.timestamp)}</span>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-charcoal-light); margin-bottom: 0.5rem;">${n.message}</p>
      ${n.linkTab ? `
        <button class="btn btn-ghost btn-sm" onclick="switchView('${n.linkTab}'); closeModal('modal-notifications');" style="color: var(--copper); font-weight: 600; padding-inline: 0;">
          فتح التفاصيل في التطبيق &larr;
        </button>
      ` : ''}
    </div>
  `).join('');
}

// ==========================================================================
// UI Helpers: Modals & Toasts & Formatter
// ==========================================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : (type === 'error' ? '❌' : (type === 'warning' ? '⚠️' : 'ℹ️'))}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

function formatSaudiTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString('ar-SA', {
    timeZone: 'Asia/Riyadh',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
}

function formatShortDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('ar-SA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function renderApp() {
  switchView(state.currentView);
}
