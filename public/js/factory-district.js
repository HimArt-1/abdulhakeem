(function () {
  'use strict';

  const viewport = document.getElementById('district-viewport');
  const status = document.getElementById('district-status');
  const placeholder = viewport.querySelector('.district-placeholder');
  const pins = [...viewport.querySelectorAll('.district-pin')];
  const compass = viewport.querySelector('.district-map-note b');
  const lighting = [...document.querySelectorAll('[data-district-light]')];
  const reset = document.getElementById('district-reset');
  const walkButton = document.getElementById('district-walk');
  const viewLabel = document.getElementById('district-view-label');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let scene, renderer, camera, controls, district, key, fill, rim, raycaster, walk;
  let visible = false;
  let lost = false;
  let frameId = 0;
  let elapsed = 0;
  let previousTime = 0;
  let pointerDown = null;
  let approach = null;

  function announce(message) {
    status.textContent = message;
    status.hidden = !message;
  }

  function resize() {
    if (!renderer || !viewport.clientWidth || !viewport.clientHeight) return;
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    const aspect = width / height;
    const span = Math.max(50, 88 / aspect);
    camera.left = -span * aspect / 2;
    camera.right = span * aspect / 2;
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.updateProjectionMatrix();
    const density = Math.min(devicePixelRatio || 1, width < 650 ? 1.35 : 1.65);
    if (renderer.getPixelRatio() !== density) renderer.setPixelRatio(density);
    renderer.setSize(width, height, false);
    walk?.resize();
    updatePins();
  }

  function setWalking(enabled, focus = false) {
    if (!walk) return;
    finishApproach();
    walk.setEnabled(enabled, focus);
    controls.enabled = !enabled;
    district.setWalking(enabled);
    scene.fog = enabled ? new THREE.Fog(0x273845, 32, 98) : null;
    walkButton.setAttribute('aria-pressed', String(enabled));
    walkButton.textContent = enabled ? 'عرض المخطط' : 'ابدأ التجوّل';
    viewLabel.textContent = enabled ? 'مستوى الشارع' : 'المخطط العام';
  }

  function resetView() {
    finishApproach();
    if (!camera) return;
    if (walk?.active()) setWalking(false);
    camera.position.set(29, 43, 64);
    controls.target.set(0, 1, 0);
    camera.zoom = 1;
    controls.update();
    resize();
  }

  function setLight(mode) {
    const day = mode === 'day';
    if (!district) return;
    viewport.dataset.light = mode;
    lighting.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.districtLight === mode)));
    key.color.setHex(day ? 0xffedcd : 0xc2d6fc);
    key.intensity = day ? 2.3 : 1.07;
    fill.color.setHex(day ? 0xe3efff : 0x99b9ec);
    fill.intensity = day ? .85 : .63;
    rim.intensity = day ? .28 : .64;
    district.setDay(day);
    renderer.shadowMap.needsUpdate = true;
  }

  function syncPlayback() {
    const running = visible && !document.hidden && !lost && !!renderer;
    if (running && !frameId) {
      previousTime = 0;
      frameId = requestAnimationFrame(render);
    } else if (!running && frameId) {
      cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  function updatePins() {
    if (walk?.active()) return;
    camera.updateMatrixWorld();
    for (const pin of pins) {
      const { anchor } = district.entrances[pin.hash.slice(1)];
      const projection = anchor.clone().project(camera);
      pin.hidden = Math.abs(projection.x) > .86 || Math.abs(projection.y) > .9 || Math.abs(projection.z) > 1;
      if (pin.hidden && document.activeElement === pin) {
        document.querySelector(`.district-destinations a[href="${pin.hash}"]`).focus({ preventScroll: true });
      }
      if (!pin.hidden) {
        pin.style.left = `${(projection.x + 1) * 50}%`;
        pin.style.top = `${(1 - projection.y) * 50}%`;
      }
    }
    const a = controls.target.clone().project(camera);
    const b = controls.target.clone().add(new THREE.Vector3(0, 0, -1)).project(camera);
    const angle = Math.atan2((b.x - a.x) * viewport.clientWidth, (b.y - a.y) * viewport.clientHeight);
    compass.style.transform = `rotate(${angle}rad)`;
  }

  function finishApproach() {
    if (!approach) return;
    clearTimeout(approach.timer);
    approach.resolve();
    approach = null;
    viewport.classList.remove('district-approaching');
  }

  function render(now) {
    const delta = previousTime ? Math.min((now - previousTime) / 1000, .05) : 0;
    previousTime = now;
    if (approach) {
      const progress = Math.min((now - approach.start) / 610, 1);
      const eased = progress * progress * (3 - 2 * progress);
      controls.target.lerpVectors(approach.fromTarget, approach.target, eased);
      camera.position.lerpVectors(approach.fromPosition, approach.position, eased);
      camera.zoom = THREE.MathUtils.lerp(approach.fromZoom, 2.1, eased);
      camera.updateProjectionMatrix();
      if (progress === 1) finishApproach();
    }
    if (walk.active()) walk.update(delta);
    else controls.update();
    district.updateDoors(delta);
    if (!reducedMotion.matches) {
      elapsed += delta;
      district.update(elapsed);
    }
    renderer.render(scene, walk.active() ? walk.camera : camera);
    frameId = requestAnimationFrame(render);
  }

  function hitEntrance(event) {
    if (!raycaster || !district || walk?.active()) return null;
    const { left, top, width, height } = viewport.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - left) / width * 2 - 1, 1 - (event.clientY - top) / height * 2), camera);
    const entries = Object.entries(district.entrances);
    const hit = raycaster.intersectObjects(entries.map(([, entry]) => entry.hit), false)[0];
    return hit && entries.find(([, entry]) => entry.hit === hit.object)[0];
  }

  function bindCanvas(canvas) {
    canvas.addEventListener('wheel', event => {
      if (!event.ctrlKey) event.stopImmediatePropagation();
    }, { capture: true, passive: true });
    for (const eventType of ['touchstart', 'touchmove']) {
      canvas.addEventListener(eventType, event => {
        if (event.touches.length < 2) event.stopImmediatePropagation();
      }, { capture: true, passive: true });
    }
    canvas.addEventListener('pointerdown', event => {
      pointerDown = event.isPrimary && event.button === 0 ? { x: event.clientX, y: event.clientY } : null;
    });
    canvas.addEventListener('pointermove', event => {
      if (event.buttons === 0 && event.pointerType !== 'touch') canvas.classList.toggle('over-building', Boolean(hitEntrance(event)));
    });
    canvas.addEventListener('pointerup', event => {
      const start = pointerDown;
      pointerDown = null;
      if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
      const id = hitEntrance(event);
      if (id) document.querySelector(`.district-destinations a[href="#${id}"]`).click();
    });
    canvas.addEventListener('pointercancel', () => { pointerDown = null; });
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      lost = true;
      setWalking(false);
      walkButton.disabled = true;
      finishApproach();
      syncPlayback();
      placeholder.hidden = false;
      canvas.hidden = true;
      pins.forEach(pin => { pin.hidden = true; });
      announce('توقّف عرض المخطط. اختر مصنعًا من القائمة للدخول.');
    });
    canvas.addEventListener('webglcontextrestored', () => {
      lost = false;
      placeholder.hidden = true;
      canvas.hidden = false;
      renderer.shadowMap.needsUpdate = true;
      walkButton.disabled = false;
      announce('');
      syncPlayback();
    });
  }

  function initialize() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.11;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;

    fill = new THREE.HemisphereLight(0x99b9ec, 0x676064, .7);
    scene.add(fill);
    key = new THREE.DirectionalLight(0xc2d6fc, 1.38);
    key.position.set(-32, 57, 21);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -51, right: 51, bottom: -42, top: 42, near: 1, far: 130 });
    key.shadow.normalBias = .035;
    key.shadow.bias = -.00011;
    scene.add(key);
    rim = new THREE.DirectionalLight(0xf9ba86, .64);
    rim.position.set(18, 20, -30);
    scene.add(rim);

    district = window.buildFactoryDistrict(scene);
    camera = new THREE.OrthographicCamera(-45, 45, 27, -27, .1, 220);
    raycaster = new THREE.Raycaster();
    const canvas = renderer.domElement;
    canvas.className = 'district-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = !reducedMotion.matches;
    controls.enablePan = false;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    controls.maxPolarAngle = 1.21;
    controls.minPolarAngle = .33;
    controls.minZoom = .78;
    controls.maxZoom = 2.55;
    controls.rotateSpeed = .64;
    controls.addEventListener('change', updatePins);

    walk = window.FactoryWalk.create(canvas, viewport, district.walkPlan, portal => {
      district.openDoor(portal.id);
      window.dispatchEvent(new CustomEvent('factory-door', { detail: { id: portal.id, from: 'factory-district' } }));
    });

    viewport.prepend(canvas);
    bindCanvas(canvas);
    resetView();
    setLight('dusk');
    new ResizeObserver(resize).observe(viewport);
    placeholder.hidden = true;
    lighting.forEach(button => { button.disabled = false; });
    reset.disabled = false;
    walkButton.disabled = false;
    announce('');
    syncPlayback();
  }

  let load;
  function loadDistrict() {
    load ||= window.Factory3D.loadEngine()
      .then(() => window.Factory3D.loadScript('/js/factory-district-model.js'))
      .then(initialize)
      .catch(error => {
        renderer?.domElement.remove();
        renderer?.dispose();
        renderer = null;
        announce('عرض المخطط غير متاح على هذا الجهاز. اختر مصنعًا من القائمة للدخول.');
        console.warn('The factory district could not be rendered.', error);
      });
    return load;
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) loadDistrict();
    syncPlayback();
  });
  observer.observe(viewport);
  document.addEventListener('visibilitychange', syncPlayback);
  reducedMotion.addEventListener('change', () => {
    if (controls) controls.enableDamping = !reducedMotion.matches;
    if (reducedMotion.matches) finishApproach();
  });
  lighting.forEach(button => {
    button.disabled = true;
    button.addEventListener('click', () => setLight(button.dataset.districtLight));
  });
  reset.disabled = true;
  reset.addEventListener('click', resetView);
  walkButton.disabled = true;
  walkButton.addEventListener('click', () => {
    if (walk.active()) resetView();
    else {
      district.closeDoors();
      walk.spawn();
      setWalking(true, true);
    }
  });

  window.FactoryDistrict = {
    resetView,
    leave() { if (walk?.active()) setWalking(false); },
    async returnToStreet(from) {
      await loadDistrict();
      if (!walk || lost || !viewport.getClientRects().length) return;
      district.closeDoors();
      const door = district.walkPlan.portals.find(portal => portal.id === from);
      if (door) walk.spawn([door.x, door.z + 1.1], [door.x, door.z + 8]);
      else walk.spawn();
      setWalking(true, true);
    },
    approach(id) {
      const entry = district?.entrances[id];
      if (!entry || !visible || lost || walk?.active() || document.hidden || reducedMotion.matches) return Promise.resolve();
      finishApproach();
      viewport.classList.add('district-approaching');
      return new Promise(resolve => {
        approach = {
          start: performance.now(),
          fromTarget: controls.target.clone(),
          fromPosition: camera.position.clone(),
          fromZoom: camera.zoom,
          target: entry.focus,
          position: entry.focus.clone().add(new THREE.Vector3(12, 17, 39)),
          resolve,
          timer: setTimeout(finishApproach, 720)
        };
      });
    }
  };
})();
