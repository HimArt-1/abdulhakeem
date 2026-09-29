const express = require('express');
const path = require('path');
const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 3700;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// 1. Factories
app.get('/api/factories', (req, res) => {
  try {
    const factories = store.getFactories(true);
    res.json({ success: true, data: factories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/factories/:id', (req, res) => {
  try {
    const factory = store.getFactoryById(req.params.id);
    if (!factory) return res.status(404).json({ success: false, error: 'المصنع غير موجود' });
    res.json({ success: true, data: factory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Events
app.get('/api/events', (req, res) => {
  try {
    const events = store.getEvents();
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/events/:id/book', (req, res) => {
  try {
    const { visitorName, visitorEmail, visitorPhone, seats } = req.body;
    if (!visitorName || !visitorEmail) {
      return res.status(400).json({ success: false, error: 'الاسم والبريد الإلكتروني مطلوبان' });
    }
    const updatedEvent = store.bookEvent(req.params.id, {
      visitorName,
      visitorEmail,
      visitorPhone,
      seats: seats || 1
    });
    res.json({ success: true, data: updatedEvent, message: 'تم حجز مقعدك في الفعالية بنجاح!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 3. Visit Requests (Private Tours)
app.post('/api/requests', (req, res) => {
  try {
    const {
      factoryId,
      purpose,
      purposeLabel,
      visitorId,
      visitorName,
      visitorEmail,
      visitorPhone,
      groupDetails,
      requestedDate,
      requestedSlotTime,
      excitedAbout
    } = req.body;

    if (!factoryId || !purpose || !visitorName || !visitorEmail || !requestedDate || !requestedSlotTime) {
      return res.status(400).json({ success: false, error: 'يرجى استكمال جميع الحقول المطلوبة' });
    }

    const newRequest = store.createRequest({
      factoryId,
      purpose,
      purposeLabel,
      visitorId: visitorId || 'usr-visitor-demo',
      visitorName,
      visitorEmail,
      visitorPhone,
      groupDetails,
      requestedDate,
      requestedSlotTime,
      excitedAbout
    });

    res.status(201).json({
      success: true,
      data: newRequest,
      message: 'تم إرسال طلب الزيارة للمصنع بنجاح وهو بانتظار المراجعة.'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/requests', (req, res) => {
  try {
    const visitorId = req.query.visitorId || 'usr-visitor-demo';
    const requests = store.getRequests({ visitorId });
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/requests/:id/accept-alternative', (req, res) => {
  try {
    const visitorId = req.body.visitorId || 'usr-visitor-demo';
    const updated = store.visitorRespondToAlternative(req.params.id, visitorId, true);
    res.json({ success: true, data: updated, message: 'تم قبول الموعد البديل وتأكيد الزيارة بنجاح!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/requests/:id/reject-alternative', (req, res) => {
  try {
    const visitorId = req.body.visitorId || 'usr-visitor-demo';
    const { reason } = req.body;
    const updated = store.visitorRespondToAlternative(req.params.id, visitorId, false, reason);
    res.json({ success: true, data: updated, message: 'تم الاعتذار عن الموعد البديل وإلغاء الطلب.' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. Discovery Passport
app.get('/api/passport/:visitorId', (req, res) => {
  try {
    const passport = store.getPassport(req.params.visitorId);
    res.json({ success: true, data: passport });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Factory Dashboard API (Strictly isolated by factoryId)
app.get('/api/factory/:id/requests', (req, res) => {
  try {
    const factoryId = req.params.id;
    const requests = store.getRequests({ factoryId });
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/factory/:id/requests/:reqId/status', (req, res) => {
  try {
    const { id: factoryId, reqId } = req.params;
    const { action, payload } = req.body; // action: confirm, propose_alternative, reject, complete
    const updated = store.updateRequestStatus(reqId, factoryId, action, payload || {});
    res.json({ success: true, data: updated, message: 'تم تحديث حالة الطلب بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/factory/:id/toggle-status', (req, res) => {
  try {
    const updated = store.toggleFactoryAccepting(req.params.id);
    if (!updated) return res.status(404).json({ success: false, error: 'المصنع غير موجود' });
    res.json({
      success: true,
      data: updated,
      message: updated.isAcceptingRequests ? 'تم تفعيل استقبال طلبات الزيارة' : 'تم تعطيل استقبال الطلبات مؤقتًا'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/factory/:id/events', (req, res) => {
  try {
    const newEvent = store.createEvent(req.params.id, req.body);
    res.status(201).json({ success: true, data: newEvent, message: 'تم إنشاء الفعالية ونشرها بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/factory/:id/profile', (req, res) => {
  try {
    const updated = store.updateFactory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'المصنع غير موجود' });
    res.json({ success: true, data: updated, message: 'تم تحديث الملف العام للمصنع بنجاح' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 6. Onboarding (سجل مصنعك)
app.post('/api/onboarding', (req, res) => {
  try {
    const { factoryName, sector, city, contactName, phone, email, experienceSummary, capacityPerTour } = req.body;
    if (!factoryName || !sector || !city || !contactName || !phone || !email) {
      return res.status(400).json({ success: false, error: 'يرجى استكمال جميع بيانات طلب التسجيل' });
    }
    const appRecord = store.createOnboarding(req.body);
    res.status(201).json({
      success: true,
      data: appRecord,
      message: 'تم إرسال طلب تسجيل مصنعك لإدارة المنصة وسيتواصل معكم فريق الاعتماد قريبًا.'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 7. Platform Admin API
app.get('/api/admin/metrics', (req, res) => {
  try {
    const metrics = store.getAdminMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/onboarding', (req, res) => {
  try {
    const apps = store.getOnboardingApplications();
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/onboarding/:id/review', (req, res) => {
  try {
    const { approve, note } = req.body;
    const reviewed = store.reviewOnboarding(req.params.id, approve, note);
    res.json({
      success: true,
      data: reviewed,
      message: approve ? 'تم اعتماد المصنع ونشره في المنصة بنجاح!' : 'تم رفض الطلب وحفظ السبب.'
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/factories', (req, res) => {
  try {
    const all = store.getFactories(false);
    res.json({ success: true, data: all });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Notifications
app.get('/api/notifications', (req, res) => {
  try {
    const targetUser = req.query.targetUser || 'usr-visitor-demo';
    const notifs = store.getNotifications(targetUser);
    res.json({ success: true, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/notifications/:id/read', (req, res) => {
  try {
    store.markNotificationRead(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset data endpoint for demo purposes
app.post('/api/reset-data', (req, res) => {
  try {
    store.resetToSeed();
    res.json({ success: true, message: 'تمت استعادة البيانات التجريبية الأولية بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 كيف تُصنع؟ يعمل الآن بنجاح على المنفذ: ${PORT}`);
    console.log(`🌐 الرابط: http://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}

module.exports = app;
