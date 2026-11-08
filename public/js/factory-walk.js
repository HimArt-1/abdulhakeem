(function () {
  'use strict';

  const directions = {
    KeyW: [0, 1], ArrowUp: [0, 1], KeyS: [0, -1], ArrowDown: [0, -1],
    KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0]
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  function create(canvas, viewport, plan, enter) {
    const camera = new THREE.PerspectiveCamera(65, 1, .07, 155);
    camera.rotation.order = 'YXZ';
    const panel = document.getElementById('factory-walk-hud').content.firstElementChild.cloneNode(true);
    viewport.append(panel);
    const pad = panel.querySelector('.walk-pad');
    const stick = panel.querySelector('.walk-stick');
    const interact = panel.querySelector('.walk-interact');
    const lock = panel.querySelector('.walk-lock');
    const place = panel.querySelector('.walk-place');
    const keys = new Set();
    const velocity = new THREE.Vector2();
    const touch = new THREE.Vector2();
    let enabled = false;
    let pending = false;
    let nearest = null;
    let look = null;
    let joystick = null;
    let aimYaw = 0;
    let aimPitch = 0;
    let travel = 0;

    canvas.tabIndex = -1;
    lock.hidden = !canvas.requestPointerLock;
    place.textContent = plan.label;

    function resize() {
      if (!viewport.clientWidth || !viewport.clientHeight) return;
      camera.aspect = viewport.clientWidth / viewport.clientHeight;
      camera.fov = camera.aspect < 1.13 ? 73 : 62;
      camera.updateProjectionMatrix();
    }

    function face(x, z) {
      aimYaw = Math.atan2(camera.position.x - x, camera.position.z - z);
      camera.rotation.set(0, aimYaw, 0, 'YXZ');
      aimPitch = 0;
    }

    function spawn(position = plan.spawn, lookAt = plan.lookAt) {
      camera.position.set(position[0], plan.height || 1.66, position[1]);
      face(lookAt[0], lookAt[1]);
      velocity.set(0, 0);
    }

    function resetInput() {
      keys.clear();
      look = joystick = null;
      touch.set(0, 0);
      velocity.set(0, 0);
      stick.style.transform = '';
    }

    function setEnabled(value, focus = false) {
      enabled = value;
      pending = false;
      nearest = null;
      interact.hidden = true;
      panel.hidden = !value;
      viewport.classList.toggle('is-walking', value);
      canvas.setAttribute('aria-hidden', String(!value));
      if (value) canvas.setAttribute('aria-label', plan.label + '، استخدم مفاتيح الاتجاهات للمشي');
      resetInput();
      if (!value && document.pointerLockElement === canvas) document.exitPointerLock();
      if (value && focus) {
        viewport.scrollIntoView({ block: 'nearest', behavior: 'instant' });
        canvas.focus({ preventScroll: true });
      }
    }

    function point(dx, dy, touchInput = false) {
      const sensitivity = touchInput ? .0055 : .0035;
      aimYaw -= dx * sensitivity;
      aimPitch = THREE.MathUtils.clamp(aimPitch - dy * sensitivity, -1.22, 1.22);
    }

    function collision(x, z) {
      const radius = .28;
      const [minX, minZ, maxX, maxZ] = plan.bounds;
      if (x < minX + radius || x > maxX - radius || z < minZ + radius || z > maxZ - radius) return true;
      for (const [left, back, right, front] of plan.obstacles) {
        const dx = x - THREE.MathUtils.clamp(x, left, right);
        const dz = z - THREE.MathUtils.clamp(z, back, front);
        if (dx * dx + dz * dz < radius * radius) return true;
      }
      return false;
    }

    function activate(portal = nearest) {
      if (!portal || pending || !enabled) return;
      pending = true;
      resetInput();
      interact.hidden = true;
      if (document.pointerLockElement === canvas) document.exitPointerLock();
      enter(portal);
    }

    function update(delta) {
      if (!enabled) return;
      const ease = reduced.matches ? 1 : 1 - Math.exp(-delta * 24);
      camera.rotation.y += (aimYaw - camera.rotation.y) * ease;
      camera.rotation.x += (aimPitch - camera.rotation.x) * ease;

      let side = touch.x;
      let forward = -touch.y;
      for (const key of keys) {
        const direction = directions[key];
        if (!direction) continue;
        side += direction[0];
        forward += direction[1];
      }
      const magnitude = Math.max(1, Math.hypot(side, forward));
      const speed = plan.speed * (keys.has('ShiftLeft') || keys.has('ShiftRight') ? 1.45 : 1);
      const yaw = camera.rotation.y;
      const dx = (side * Math.cos(yaw) - forward * Math.sin(yaw)) * speed / magnitude;
      const dz = (-side * Math.sin(yaw) - forward * Math.cos(yaw)) * speed / magnitude;
      const acceleration = 1 - Math.exp(-delta * 14);
      velocity.x += (dx - velocity.x) * acceleration;
      velocity.y += (dz - velocity.y) * acceleration;

      const position = camera.position;
      const oldX = position.x;
      const oldZ = position.z;
      const steps = Math.max(1, Math.ceil(velocity.length() * delta / .13));
      for (let step = 0; step < steps; step++) {
        const x = position.x + velocity.x * delta / steps;
        const z = position.z + velocity.y * delta / steps;
        if (!collision(x, position.z)) position.x = x;
        if (!collision(position.x, z)) position.z = z;
      }
      const moved = Math.hypot(position.x - oldX, position.z - oldZ);
      travel += moved;
      const eye = plan.height || 1.66;
      position.y = eye + (reduced.matches ? 0 : Math.sin(travel * 7) * .025 * Math.min(moved / Math.max(delta, .001), 1));
      if (pending) return;

      let best = null;
      let distance = 2.8;
      for (const portal of plan.portals) {
        const gap = Math.hypot(position.x - portal.x, position.z - portal.z);
        if (gap < distance) {
          distance = gap;
          best = portal;
        }
      }
      const facingDoor = best && ((position.x - best.x) * Math.sin(yaw) + (position.z - best.z) * Math.cos(yaw)) > distance * .12;
      const target = facingDoor ? best : null;
      if (target !== nearest) {
        nearest = target;
        interact.hidden = !nearest;
        if (nearest) interact.textContent = nearest.label;
      }
      if (best && moved > .002 && distance < .77 && Math.hypot(oldX - best.x, oldZ - best.z) > distance) activate(best);
    }

    function acceptsInput() {
      return enabled && viewport.getClientRects().length && (document.activeElement === canvas || document.pointerLockElement === canvas);
    }

    document.addEventListener('keydown', event => {
      if (!acceptsInput() || event.metaKey || event.ctrlKey || event.altKey) return;
      if (directions[event.code] || event.code.startsWith('Shift')) {
        event.preventDefault();
        keys.add(event.code);
      } else if (event.code === 'KeyE' || event.code === 'Enter') {
        event.preventDefault();
        if (!event.repeat) activate();
      }
    });
    document.addEventListener('keyup', event => keys.delete(event.code));
    canvas.addEventListener('blur', resetInput);
    window.addEventListener('blur', resetInput);
    document.addEventListener('visibilitychange', () => { if (document.hidden) resetInput(); });

    canvas.addEventListener('pointerdown', event => {
      if (!enabled || event.button !== 0 || look || document.pointerLockElement === canvas) return;
      canvas.focus({ preventScroll: true });
      look = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: 0 };
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', event => {
      if (look?.id !== event.pointerId) return;
      const dx = event.clientX - look.x;
      const dy = event.clientY - look.y;
      look.x = event.clientX;
      look.y = event.clientY;
      look.moved += Math.hypot(dx, dy);
      point(dx, dy, event.pointerType === 'touch');
    });
    canvas.addEventListener('pointerup', event => {
      if (look?.id !== event.pointerId) return;
      const tapped = look.moved < 7;
      look = null;
      if (tapped && nearest && event.pointerType !== 'mouse') activate();
    });
    canvas.addEventListener('lostpointercapture', () => { look = null; });
    document.addEventListener('mousemove', event => {
      if (enabled && document.pointerLockElement === canvas) point(event.movementX, event.movementY);
    });
    lock.addEventListener('click', async () => {
      canvas.focus({ preventScroll: true });
      try {
        if (document.pointerLockElement === canvas) document.exitPointerLock();
        else await canvas.requestPointerLock();
      } catch {
        lock.hidden = true;
      }
    });
    document.addEventListener('pointerlockchange', () => {
      lock.textContent = document.pointerLockElement === canvas ? 'حرّر المؤشر' : 'تحكم بالفأرة';
      keys.clear();
    });

    pad.addEventListener('pointerdown', event => {
      if (joystick !== null) return;
      event.preventDefault();
      canvas.focus({ preventScroll: true });
      joystick = event.pointerId;
      pad.setPointerCapture(event.pointerId);
      moveStick(event);
    });

    function moveStick(event) {
      if (event.pointerId !== joystick) return;
      const rect = pad.getBoundingClientRect();
      const reach = rect.width * .37;
      touch.set((event.clientX - rect.left - rect.width / 2) / reach, (event.clientY - rect.top - rect.height / 2) / reach);
      if (touch.lengthSq() > 1) touch.normalize();
      stick.style.transform = `translate(${touch.x * reach}px, ${touch.y * reach}px)`;
    }

    pad.addEventListener('pointermove', moveStick);
    pad.addEventListener('lostpointercapture', () => {
      joystick = null;
      touch.set(0, 0);
      stick.style.transform = '';
    });
    interact.addEventListener('click', () => activate());

    spawn();
    resize();
    return { camera, resize, spawn, setEnabled, update, active: () => enabled };
  }

  // Add only the walls and doorway needed at eye level, leaving the cutaway intact.
  function interiorShell(scene, room, color) {
    const group = new THREE.Group();
    group.visible = false;
    scene.add(group);
    const wall = new THREE.MeshStandardMaterial({ color: 0x53606a, roughness: .8 });
    wall.color.convertSRGBToLinear();
    const frame = new THREE.MeshStandardMaterial({ color: 0x27323b, roughness: .58 });
    frame.color.convertSRGBToLinear();
    const strip = new THREE.MeshBasicMaterial({ color });
    const glass = new THREE.MeshStandardMaterial({ color: 0x54758a, roughness: .4, transparent: true, opacity: .42, depthWrite: false });
    function box(material, x, y, z, w, h, d) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    const [left, rear, right, front] = room.bounds;
    const mid = (left + right) / 2;
    const width = right - left;
    const depth = front - rear;
    for (const x of [left, right]) {
      box(wall, x, 3.15, (front + rear) / 2, .2, 6.3, depth);
    }
    box(wall, mid, 4.8, rear, width, 3.4, .15);
    for (const side of [-1, 1]) {
      box(wall, side * (width / 4 + .59), .46, front, width / 2 - 1.17, .92, .2);
      box(glass, side * (width / 4 + .59), 2.28, front, width / 2 - 1.17, 2.75, .10);
      for (let x = 1.18; x < width / 2; x += 2.28) box(frame, side * x, 2.26, front, .09, 2.78, .23);
    }
    box(wall, mid, 4.95, front, width, 2.6, .2);
    box(frame, 0, 2.67, front - .055, 2.41, .18, .26);
    for (const x of [-1.18, 1.18]) box(frame, x, 1.32, front - .055, .13, 2.63, .24);
    box(strip, 0, 2.81, front - .18, 1.92, .063, .09);
    box(frame, mid, 6.3, (front + rear) / 2, width, .14, depth);
    for (let x = left + 2; x < right; x += 4.2) {
      for (const z of [rear + depth * .27, rear + depth * .75]) box(strip, x, 6.17, z, 2.35, .07, .16);
    }
    return group;
  }

  window.FactoryWalk = { create, interiorShell };
})();
