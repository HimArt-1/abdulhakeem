(function () {
  'use strict';

  let engineLoad;

  function loadScript(source) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = source;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }

  function loadEngine() {
    engineLoad ||= loadScript('/js/vendor/three.min.js').then(() => loadScript('/js/vendor/OrbitControls.js'));
    return engineLoad;
  }

  function createTour(section, definition) {
    const template = document.getElementById('factory-studio-template');
    const stage = template.content.firstElementChild.cloneNode(true);
    section.querySelector('.studio-mount').append(stage);
    const container = stage.querySelector('.studio-canvas');
    const message = stage.querySelector('.studio-message');
    const poster = container.querySelector('.studio-poster');
    const settings = stage.querySelector('.studio-settings');
    const stationList = stage.querySelector('.studio-stations');
    const stationNumber = stage.querySelector('.studio-station-number');
    const stationTitle = stage.querySelector('.studio-station-title');
    const stationDescription = stage.querySelector('.studio-station-description');
    const stationDetail = stage.querySelector('.studio-detail');
    const action = name => stage.querySelector(`[data-studio-action="${name}"]`);
    const previous = action('previous');
    const next = action('next');
    const fullscreen = action('fullscreen');
    const walkButton = action('walk');
    const orbit = action('orbit');
    const wireframe = action('wireframe');
    const weather = action('weather');
    const motion = action('motion');
    const audio = action('audio');
    const lightingButtons = [...stage.querySelectorAll('[data-time-preset]')];
    const modelControls = [orbit, wireframe, weather, motion, ...lightingButtons];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const { overview, stations, name } = definition;
    const formatNumber = new Intl.NumberFormat('ar-SA', { minimumIntegerDigits: 2, useGrouping: false });
    stage.querySelector('.studio-name').textContent = name;
    if (definition.studioLighting) lightingButtons[0].textContent = 'إضاءة الورشة';
    container.setAttribute('aria-label', `نموذج ثلاثي الأبعاد · ${name}`);
    stationList.setAttribute('aria-label', `محطات ${name}`);
    weather.hidden = !definition.weather;
    const stationButtons = stations.map((station, index) => {
      const button = document.createElement('button');
      const number = document.createElement('span');
      button.type = 'button';
      number.textContent = formatNumber.format(index + 1);
      button.append(number, ` ${station.title}`);
      stationList.append(button);
      return button;
    });

    const presets = {
      golden: definition.studioLighting || { key: 0xffddba, power: 2.03, fill: 0xa8bac0, ambient: .59, exposure: 1.06 },
      day: { key: 0xfff4e5, power: 2.25, fill: 0xd4e6ef, ambient: .79, exposure: 1.1 },
      night: { key: 0xc8d8ff, power: .82, fill: 0x7c91b8, ambient: .39, exposure: 1.03 }
    };

    let activeStation = -1;
    let renderer, scene, camera, controls, model, keyLight, hemisphere, rimLight, environment, walk, shell;
    let rain, rainPositions, weatherOn = false;
    let transition;
    let projectionWidth = overview.width;
    let viewWidth = 1;
    let viewHeight = 1;
    let visible = false;
    let frameId = 0;
    let contextLost = false;
    let lastFrameTime = 0;
    let elapsed = 0;
    let sceneLoad;
    let markers = [];
    let audioContext, audioGain;

    let motionPaused = reducedMotion.matches;
    let shadowDirty = true;
    let lastShadowUpdate = 0;
    walkButton.disabled = true;
    modelControls.forEach(button => { button.disabled = true; });

    function showMessage(text) {
      message.textContent = text;
      message.hidden = !text;
    }

    function selectStation(index) {
      activeStation = index;
      const view = stations[index] || overview;
      stationNumber.textContent = index < 0 ? 'خريطة الجولة' : `المحطة ${formatNumber.format(index + 1)} / ${formatNumber.format(stations.length)}`;
      stationTitle.textContent = view.title;
      stationDescription.textContent = view.description;
      stationDetail.textContent = view.detail || '';
      stationDetail.hidden = !view.detail;
      previous.hidden = index < 0;
      next.textContent = index < 0 ? 'ابدأ الجولة ←' : index === stations.length - 1 ? 'النظرة العامة ↺' : 'المحطة التالية ←';
      stationButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      markers.forEach(({ button }, i) => button.setAttribute('aria-pressed', String(i === index)));

      if (walk?.active()) {
        if (index < 0) walk.spawn();
        else walk.spawn(definition.walk.stationSpots[index], [view.target[0], view.target[2]]);
      } else if (renderer) {
        setOrbit(false);
        moveCamera(view);
      }
    }

    function setWalking(enabled, focus = false) {
      if (!walk) return;
      transition = null;
      setOrbit(false);
      controls.enabled = !enabled;
      walk.setEnabled(enabled, focus);
      shell.visible = enabled;
      scene.fog = enabled ? new THREE.Fog(0x2d3841, 17, 48) : null;
      walkButton.setAttribute('aria-pressed', String(enabled));
      walkButton.textContent = enabled ? 'عرض النموذج' : 'تجوّل بالداخل';
      container.querySelector('.studio-hotspots').hidden = enabled;
      if (!enabled) moveCamera(stations[activeStation] || overview, true);
    }

    function setOrbit(enabled) {
      controls.autoRotate = enabled;
      if (enabled) transition = null;
      orbit.setAttribute('aria-pressed', String(enabled));
    }

    function moveCamera(view, immediate = reducedMotion.matches) {
      const position = new THREE.Vector3(...view.position);
      const target = new THREE.Vector3(...view.target);

      if (immediate) {
        transition = null;
        camera.position.copy(position);
        camera.zoom = 1;
        controls.target.copy(target);
        projectionWidth = view.width;
        updateProjection();
        controls.update();
        return;
      }

      transition = {
        fromPosition: camera.position.clone(),
        fromTarget: controls.target.clone(),
        fromWidth: projectionWidth,
        fromZoom: camera.zoom,
        position,
        target,
        width: view.width,
        progress: 0
      };
    }

    function updateProjection() {
      const aspect = viewWidth / viewHeight;
      const minimumHeight = activeStation < 0 ? 14.5 : 4.6;
      const height = Math.max(projectionWidth / aspect, minimumHeight);
      camera.left = -height * aspect / 2;
      camera.right = height * aspect / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
    }

    function resize() {
      if (!renderer || !container.clientWidth || !container.clientHeight) return;
      viewWidth = container.clientWidth;
      viewHeight = container.clientHeight;
      const mobile = viewWidth < 600;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.4 : 1.65));
      renderer.setSize(viewWidth, viewHeight, false);
      walk?.resize();
      updateProjection();
    }

    function applyLighting(preset) {
      const choice = presets[preset];
      keyLight.color.setHex(choice.key);
      keyLight.intensity = choice.power;
      hemisphere.color.setHex(choice.fill);
      hemisphere.intensity = choice.ambient;
      rimLight.intensity = preset === 'night' ? 1.12 : .7;
      shadowDirty = true;
      renderer.toneMappingExposure = choice.exposure;
      lightingButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.timePreset === preset)));
    }

    function makeEnvironment() {
      const environmentScene = new THREE.Scene();
      environmentScene.background = new THREE.Color(0x92877a);
      const lightBox = new THREE.BoxGeometry(1, 1, 1);
      const bright = new THREE.MeshBasicMaterial({ color: 0xffe0b6, toneMapped: false });
      const neutral = new THREE.MeshBasicMaterial({ color: 0xd7e4ec, toneMapped: false });
      for (const [surface, position, scale] of [
        [bright, [2, 7, 2], [9, .15, 5]],
        [neutral, [-6, 2, 1], [.15, 4, 8]],
        [bright, [5, 3, -6], [8, 4, .15]]
      ]) {
        const panel = new THREE.Mesh(lightBox, surface);
        panel.position.set(...position);
        panel.scale.set(...scale);
        environmentScene.add(panel);
      }
      const pmrem = new THREE.PMREMGenerator(renderer);
      try {
        return pmrem.fromScene(environmentScene, .11, .1, 35);
      } finally {
        pmrem.dispose();
        lightBox.dispose();
        bright.dispose();
        neutral.dispose();
      }
    }

    function createRain() {
      const count = 210;
      rainPositions = new Float32Array(count * 6);
      for (let index = 0; index < rainPositions.length; index += 6) {
        const x = Math.random() * 34 - 17;
        const y = Math.random() * 15;
        const z = Math.random() * 20 - 10;
        rainPositions.set([x, y, z, x + .08, y + .55, z], index);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3).setUsage(THREE.DynamicDrawUsage));
      rain = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0xc4d6dc, transparent: true, opacity: .25, depthWrite: false }));
      rain.frustumCulled = false;
      rain.visible = false;
      scene.add(rain);
    }

    function createMarkers() {
      const layer = stage.querySelector('.studio-hotspots');
      markers = stations.map((station, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'studio-hotspot';
        button.textContent = formatNumber.format(index + 1);
        button.title = station.title;
        button.setAttribute('aria-label', `المحطة ${button.textContent}، ${station.title}`);
        button.setAttribute('aria-pressed', String(index === activeStation));
        button.addEventListener('click', () => selectStation(index));
        layer.append(button);
        return { button, position: new THREE.Vector3(...station.marker) };
      });
    }

    function updateMarkers() {
      const projected = new THREE.Vector3();
      camera.updateMatrixWorld();
      markers.forEach(({ button, position }, index) => {
        projected.copy(position).project(camera);
        const withinCanvas = Math.abs(projected.x) < .94 && Math.abs(projected.y) < .92 && Math.abs(projected.z) < 1;
        const show = withinCanvas && (activeStation < 0 || index === activeStation);
        if (!show && document.activeElement === button) stationButtons[index].focus({ preventScroll: true });
        button.hidden = !show;
        if (show) {
          button.style.left = `${(projected.x + 1) * 50}%`;
          button.style.top = `${(1 - projected.y) * 50}%`;
        }
      });
    }

    function render(now) {
      const delta = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, .05) : 0;
      lastFrameTime = now;
      if (transition) {
        transition.progress = Math.min(transition.progress + delta / .84, 1);
        const ease = transition.progress * transition.progress * (3 - 2 * transition.progress);
        camera.position.lerpVectors(transition.fromPosition, transition.position, ease);
        controls.target.lerpVectors(transition.fromTarget, transition.target, ease);
        projectionWidth = THREE.MathUtils.lerp(transition.fromWidth, transition.width, ease);
        camera.zoom = THREE.MathUtils.lerp(transition.fromZoom, 1, ease);
        updateProjection();
        if (transition.progress === 1) transition = null;
      }

      if (walk.active()) walk.update(delta);
      else controls.update();
      if (!motionPaused) {
        elapsed += delta;
        model.update(elapsed);
        if (weatherOn) {
          for (let index = 0; index < rainPositions.length; index += 6) {
            const y = rainPositions[index + 1] - delta * 13;
            rainPositions[index + 1] = y < 0 ? 15 : y;
            rainPositions[index + 4] = rainPositions[index + 1] + .55;
          }
          rain.geometry.attributes.position.needsUpdate = true;
        }
      }

      if (shadowDirty || elapsed - lastShadowUpdate > .055) {
        renderer.shadowMap.needsUpdate = true;
        lastShadowUpdate = elapsed;
        shadowDirty = false;
      }
      renderer.render(scene, walk.active() ? walk.camera : camera);
      if (!walk.active()) updateMarkers();
      frameId = requestAnimationFrame(render);
    }

    function syncPlayback() {
      const running = visible && !document.hidden && !!renderer && !contextLost;
      if (running && !frameId) {
        lastFrameTime = 0;
        frameId = requestAnimationFrame(render);
      } else if (!running && frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
      if (audioGain) audioGain.gain.setTargetAtTime(running && audio.getAttribute('aria-pressed') === 'true' ? .095 : 0, audioContext.currentTime, .15);
    }

    function initScene() {
      scene = new THREE.Scene();
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false;
      renderer.shadowMap.needsUpdate = true;

      environment = makeEnvironment();
      scene.environment = environment.texture;
      hemisphere = new THREE.HemisphereLight(0xa8bac0, 0x76573d, .68);
      scene.add(hemisphere);
      keyLight = new THREE.DirectionalLight(0xffddba, 2.35);
      keyLight.position.set(-11, 17, 9);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      const span = definition.floorSpan;
      Object.assign(keyLight.shadow.camera, { left: -span, right: span, top: span * .72, bottom: -span * .72, near: 1, far: 55 });
      keyLight.shadow.normalBias = .035;
      keyLight.shadow.bias = -.00015;
      scene.add(keyLight);
      rimLight = new THREE.DirectionalLight(0xdba477, .7);
      rimLight.position.set(9, 10, -11);
      scene.add(rimLight);

      model = window[definition.builder](scene);
      if (definition.weather) createRain();
      camera = new THREE.OrthographicCamera(-15, 15, 9, -9, .1, 130);
      const canvas = renderer.domElement;
      canvas.className = 'factory-3d-webgl-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      controls = new THREE.OrbitControls(camera, canvas);
      controls.enableDamping = !reducedMotion.matches;
      controls.enablePan = false;
      controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
      canvas.addEventListener('wheel', event => {
        if (!event.ctrlKey) event.stopImmediatePropagation();
      }, { capture: true, passive: true });
      for (const eventType of ['touchstart', 'touchmove']) {
        canvas.addEventListener(eventType, event => {
          if (event.touches.length < 2) event.stopImmediatePropagation();
        }, { capture: true, passive: true });
      }
      controls.autoRotateSpeed = .62;
      controls.minZoom = .72;
      controls.maxZoom = 2.4;
      controls.maxPolarAngle = Math.PI / 2.08;
      controls.addEventListener('start', () => { transition = null; setOrbit(false); });
      shell = window.FactoryWalk.interiorShell(scene, definition.walk, definition.weather ? 0xffca87 : 0x99e9f5);
      walk = window.FactoryWalk.create(canvas, container, definition.walk, portal => {
        window.dispatchEvent(new CustomEvent('factory-door', { detail: { id: portal.id, from: section.id } }));
      });
      moveCamera(stations[activeStation] || overview, true);
      resize();
      applyLighting('golden');
      renderer.render(scene, camera);

      canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        contextLost = true;
        setWalking(false);
        walkButton.disabled = true;
        syncPlayback();
        canvas.hidden = true;
        poster.hidden = false;
        markers.forEach(({ button }) => { button.hidden = true; });
        modelControls.forEach(button => { button.disabled = true; });
        showMessage('توقّف عرض المجسّم مؤقتًا. يمكنك متابعة المحطات من القائمة.');
      });
      canvas.addEventListener('webglcontextrestored', () => {
        contextLost = false;
        canvas.hidden = false;
        walkButton.disabled = false;
        poster.hidden = true;
        shadowDirty = true;
        modelControls.forEach(button => { button.disabled = false; });
        showMessage('');
        syncPlayback();
      });

      container.prepend(canvas);
      walkButton.disabled = false;
      poster.hidden = true;
      createMarkers();
      stage.querySelector('.studio-hint').hidden = false;
      audio.disabled = !window.AudioContext;
      modelControls.forEach(button => { button.disabled = false; });
      new ResizeObserver(resize).observe(container);
    }

    function loadScene() {
      if (sceneLoad) return sceneLoad;
      showMessage('جارٍ تحميل نموذج المصنع…');
      sceneLoad = (async () => {
        try {
          await loadEngine();
          await loadScript(definition.model);
          initScene();
          showMessage('');
          syncPlayback();
        } catch (error) {
          if (renderer) {
            renderer.dispose();
            renderer = null;
          }
          if (environment) environment.dispose();
          showMessage('العرض ثلاثي الأبعاد غير متاح على هذا الجهاز. يمكنك متابعة المحطات من القائمة.');
          console.warn(`Could not load ${definition.model}`, error);
        }
      })();
      return sceneLoad;
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) loadScene();
      syncPlayback();
    });
    observer.observe(container);
    document.addEventListener('visibilitychange', syncPlayback);

    reducedMotion.addEventListener('change', () => {
      if (!renderer) return;
      controls.enableDamping = !reducedMotion.matches;
      setMotionPaused(reducedMotion.matches);
      if (reducedMotion.matches) {
        setOrbit(false);
        moveCamera(stations[activeStation] || overview, true);
      }
    });

    stationButtons.forEach((button, index) => button.addEventListener('click', () => selectStation(index)));
    previous.addEventListener('click', () => {
      selectStation(activeStation - 1);
      if (previous.hidden) next.focus({ preventScroll: true });
    });
    next.addEventListener('click', () => selectStation(activeStation === stations.length - 1 ? -1 : activeStation + 1));
    action('reset').addEventListener('click', () => {
      if (walk?.active()) setWalking(false);
      selectStation(-1);
    });
    walkButton.addEventListener('click', () => {
      if (walk.active()) setWalking(false);
      else {
        walk.spawn();
        setWalking(true, true);
      }
    });
    orbit.addEventListener('click', () => setOrbit(!controls.autoRotate));
    lightingButtons.forEach(button => button.addEventListener('click', () => applyLighting(button.dataset.timePreset)));
    wireframe.addEventListener('click', () => {
      const enabled = wireframe.getAttribute('aria-pressed') !== 'true';
      model.setWireframe(enabled);
      shadowDirty = true;
      wireframe.setAttribute('aria-pressed', String(enabled));
    });
    weather.addEventListener('click', () => {
      weatherOn = !weatherOn;
      rain.visible = weatherOn;
      model.setWet(weatherOn);
      weather.setAttribute('aria-pressed', String(weatherOn));
    });

    function setMotionPaused(paused) {
      motionPaused = paused;
      motion.setAttribute('aria-pressed', String(paused));
      motion.textContent = paused ? 'استئناف حركة المعدات' : 'إيقاف حركة المعدات';
    }

    setMotionPaused(motionPaused);
    motion.addEventListener('click', () => setMotionPaused(!motionPaused));

    audio.disabled = true;
    audio.addEventListener('click', async () => {
      try {
        if (!audioContext) {
          audioContext = new AudioContext();
          audioGain = audioContext.createGain();
          audioGain.gain.value = 0;
          audioGain.connect(audioContext.destination);
          for (const frequency of [49, 73, 98]) {
            const hum = audioContext.createOscillator();
            const voice = audioContext.createGain();
            hum.frequency.value = frequency;
            hum.type = 'sine';
            voice.gain.value = .19;
            hum.connect(voice);
            voice.connect(audioGain);
            hum.start();
          }
        }
        await audioContext.resume();
        audio.setAttribute('aria-pressed', String(audio.getAttribute('aria-pressed') !== 'true'));
        syncPlayback();
      } catch {
        showMessage('تعذّر تشغيل الصوت المحيطي.');
      }
    });

    const backgroundElements = [];
    function setExpanded(enabled) {
      stage.classList.toggle('studio-expanded', enabled);
      document.body.classList.toggle('studio-expanded-page', enabled);
      if (enabled) {
        for (let element = stage; element !== document.body; element = element.parentElement) {
          for (const sibling of element.parentElement.children) {
            if (sibling !== element && sibling instanceof HTMLElement && !sibling.inert) {
              sibling.inert = true;
              backgroundElements.push(sibling);
            }
          }
        }
      } else {
        backgroundElements.splice(0).forEach(element => { element.inert = false; });
      }
      updateFullscreenButton();
      fullscreen.focus({ preventScroll: true });
    }

    function updateFullscreenButton() {
      const enabled = document.fullscreenElement === stage || stage.classList.contains('studio-expanded');
      fullscreen.setAttribute('aria-pressed', String(enabled));
      fullscreen.textContent = enabled ? 'إنهاء ملء الشاشة' : 'ملء الشاشة';
      resize();
    }

    fullscreen.addEventListener('click', async () => {
      if (stage.classList.contains('studio-expanded')) {
        setExpanded(false);
      } else if (document.fullscreenElement === stage) {
        await document.exitFullscreen();
      } else if (stage.requestFullscreen) {
        try {
          await stage.requestFullscreen();
        } catch {
          setExpanded(true);
        }
      } else {
        setExpanded(true);
      }
    });
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    stage.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (settings.open) {
        settings.open = false;
        settings.querySelector('summary').focus();
      } else if (stage.classList.contains('studio-expanded')) {
        setExpanded(false);
      }
    });
    document.addEventListener('click', event => {
      if (settings.open && !settings.contains(event.target)) settings.open = false;
    });

    selectStation(-1);
    return {
      async open(walking) {
        await loadScene();
        if (walking && walk && !contextLost && container.getClientRects().length) {
          walk.spawn();
          setWalking(true, true);
        } else if (walk?.active()) setWalking(false);
      },
      leave() {
        if (walk?.active()) setWalking(false);
      }
    };
  }

  const tours = Object.fromEntries(Object.entries(window.factoryTourDefinitions).map(([id, definition]) =>
    [id, createTour(document.getElementById(id), definition)]
  ));
  window.Factory3D = {
    loadEngine,
    loadScript,
    openTour(id, walking = false) {
      tours[id]?.open(walking);
    },
    leaveExcept(id) {
      Object.entries(tours).forEach(([key, tour]) => {
        if (key !== id) tour.leave();
      });
    }
  };
})();
