(function () {
  'use strict';

  window.buildRoastery = function buildRoastery(scene) {
    const model = new THREE.Group();
    scene.add(model);

    function material(color, metalness = 0, roughness = .6) {
      const surface = new THREE.MeshStandardMaterial({ color, metalness, roughness, envMapIntensity: .65 });
      surface.color.convertSRGBToLinear();
      return surface;
    }

    const materials = {
      castIron: material(0x3c3e3d, .53, .44),
      frame: material(0x272b2a, .35, .58),
      steel: material(0xa7aba4, .76, .34),
      copper: material(0xb87247, .72, .34),
      brass: material(0xc99b5f, .61, .41),
      rubber: material(0x20201c, .07, .8),
      concrete: material(0x766c5d, .05, .87),
      slate: material(0x353330, .16, .74),
      chalk: material(0xdcd1b3, .08, .57),
      green: material(0x4d6557, .27, .63),
      kraft: material(0xb1895c, .03, .91),
      wood: material(0x7d593b, .04, .9),
      rawBeans: material(0x85906c, .03, .81),
      roastedBeans: material(0x714328, .05, .72),
      screen: new THREE.MeshStandardMaterial({ color: 0x394d3d, emissive: 0x597b52, emissiveIntensity: .28 }),
      lamp: new THREE.MeshBasicMaterial({ color: 0xffd4a3 })
    };

    const boxShape = new THREE.BoxGeometry(1, 1, 1);
    const cylinderShape = new THREE.CylinderGeometry(1, 1, 1, 24);
    const rodShape = new THREE.CylinderGeometry(1, 1, 1, 8);
    const beanShape = new THREE.SphereGeometry(1, 8, 5);
    const batches = new Map();
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);

    function batch(geometry, surface, shadow, position, scale, rotation = null) {
      const key = `${geometry.id}/${surface.id}/${shadow}`;
      if (!batches.has(key)) batches.set(key, { geometry, surface, shadow, matrices: [] });
      dummy.position.set(...position);
      dummy.scale.set(...scale);
      if (rotation) dummy.quaternion.copy(rotation);
      else dummy.quaternion.identity();
      dummy.updateMatrix();
      batches.get(key).matrices.push(dummy.matrix.clone());
    }

    function box(surface, x, y, z, width, height, depth, shadow = true) {
      batch(boxShape, surface, shadow, [x, y, z], [width, height, depth]);
    }

    function cylinder(surface, x, y, z, radius, height, axis = 'y') {
      const direction = axis === 'x' ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
      const rotation = axis === 'y' ? null : new THREE.Quaternion().setFromUnitVectors(up, direction);
      batch(cylinderShape, surface, true, [x, y, z], [radius, height, radius], rotation);
    }

    function beam(surface, from, to, radius) {
      const start = new THREE.Vector3(...from);
      const end = new THREE.Vector3(...to);
      const direction = end.clone().sub(start);
      const rotation = new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize());
      batch(rodShape, surface, true, start.lerp(end, .5).toArray(), [radius, direction.length(), radius], rotation);
    }

    function mesh(parent, geometry, surface, x, y, z) {
      const item = new THREE.Mesh(geometry, surface);
      item.position.set(x, y, z);
      item.castShadow = true;
      item.receiveShadow = true;
      parent.add(item);
      return item;
    }

    function pipe(surface, points, radius) {
      const path = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)));
      mesh(model, new THREE.TubeGeometry(path, 32, radius, 10, false), surface, 0, 0, 0);
    }

    function flange(x, y, z, radius) {
      cylinder(materials.steel, x, y, z, radius, .09, 'z');
      for (let bolt = 0; bolt < 10; bolt++) {
        const angle = bolt * Math.PI / 5;
        cylinder(materials.castIron, x + Math.cos(angle) * radius * .88, y + Math.sin(angle) * radius * .88, z + .065, .047, .075, 'z');
      }
    }

    function plate(label, x, y, z, width, height) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 96;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#292622';
      ctx.fillRect(0, 0, 256, 96);
      ctx.strokeStyle = '#be956d';
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 6, 244, 84);
      ctx.fillStyle = '#f3d8b7';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 128, 49);
      const texture = new THREE.CanvasTexture(canvas);
      texture.encoding = THREE.sRGBEncoding;
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture }));
      sign.position.set(x, y, z);
      model.add(sign);
    }

    // Cutaway floor, walkways and the open steel structure along the rear wall.
    box(materials.frame, 0, -.46, 0, 25.6, .74, 13.3);
    box(materials.copper, 0, -.29, 0, 25.65, .045, 13.34, false);
    box(materials.concrete, 0, -.12, 0, 25.35, .24, 13.1);
    for (const x of [-9.5, -5, 0, 5, 9.5]) box(materials.slate, x, .005, 0, .022, .012, 13, false);
    for (const z of [-3, 0, 3.25]) box(materials.slate, 0, .005, z, 25.2, .012, .023, false);
    for (const z of [3.8, 5.5]) box(materials.brass, 0, .012, z, 24, .018, .045, false);
    for (let x = -10.6; x < 12; x += 2.7) {
      beam(materials.chalk, [x - .36, .024, 4.5], [x, .024, 4.65], .022);
      beam(materials.chalk, [x - .36, .024, 4.8], [x, .024, 4.65], .022);
    }

    box(materials.slate, 0, 1.7, -6.18, 24.7, 3.4, .19);
    for (const x of [-12, -6, 0, 6, 12]) {
      box(materials.frame, x, 3.65, -6.0, .27, 7.3, .31);
      box(materials.steel, x, .1, -6, .56, .2, .51);
      box(materials.frame, x, 7.22, -4.8, .25, .26, 2.7);
    }
    for (const y of [3.42, 5.4, 7.24]) box(materials.frame, 0, y, -5.98, 24.4, .17, .21);
    for (let x = -11.5; x < 12; x += 1.5) {
      box(materials.castIron, x, 1.68, -6.07, .025, 3.3, .035, false);
      box(materials.frame, x, 6.31, -5.98, .045, 1.73, .1, false);
    }
    for (const x of [-9, -3, 3, 9]) {
      box(materials.frame, x, 7.03, -3.7, 3.7, .17, .38);
      box(materials.lamp, x, 6.94, -3.7, 3.45, .035, .13, false);
    }
    plate('ROASTERY / 01', .15, 2.75, -6.04, 2.6, .74);

    // 01. Stainless storage silos, hoppers, gauges and loading platform.
    box(materials.slate, -9.5, .09, -2.55, 5.3, .18, 5);
    for (const x of [-10.72, -8.27]) {
      cylinder(materials.steel, x, 3.65, -3.12, .94, 2.9);
      mesh(model, new THREE.CylinderGeometry(.94, .24, .98, 24), materials.steel, x, 1.73, -3.12);
      mesh(model, new THREE.CylinderGeometry(.43, .94, .48, 24), materials.steel, x, 5.33, -3.12);
      cylinder(materials.castIron, x, 5.62, -3.12, .47, .13);
      for (const y of [2.24, 2.51, 4.67, 5.08]) cylinder(materials.castIron, x, y, -3.12, .961, .085);
      for (const offset of [-.62, .62]) {
        for (const z of [-3.7, -2.56]) box(materials.frame, x + offset, .84, z, .11, 1.5, .11);
      }
      box(materials.castIron, x + .34, 2.85, -2.2, .14, 1.0, .1);
      box(materials.chalk, x + .34, 2.85, -2.14, .045, .78, .025);
      cylinder(materials.copper, x, 1.13, -3.12, .26, .36);
    }
    box(materials.castIron, -9.48, 2.13, -1.84, 4.35, .13, .85);
    for (const x of [-11.56, -9.5, -7.4]) beam(materials.brass, [x, 2.2, -1.39], [x, 3.05, -1.39], .041);
    for (const y of [2.62, 3.03]) beam(materials.brass, [-11.56, y, -1.39], [-7.4, y, -1.39], .042);
    for (const x of [-11.65, -11.12]) beam(materials.steel, [x, .15, -.89], [x, 2.18, -1.42], .04);
    for (let rung = 0; rung < 8; rung++) {
      beam(materials.steel, [-11.65, .24 + rung * .245, -.93 - rung * .059], [-11.12, .24 + rung * .245, -.93 - rung * .059], .037);
    }
    plate('01 / RAW', -9.55, 1.78, -1.39, 1.12, .34);
    pipe(materials.copper, [[-10.72, 5.63, -3.12], [-10.7, 6.2, -3.12], [-9.85, 6.44, -3.14], [-7.7, 6.44, -3.25], [-6.55, 6.13, -3.25], [-6.26, 4.86, -3.25]], .145);
    pipe(materials.steel, [[-8.27, 5.61, -3.12], [-8.27, 6.08, -3.13], [-7.72, 6.43, -3.23]], .14);

    // 02. Drum roaster: frame, bolted face, sight glass, controls and exhaust.
    box(materials.slate, -4.68, .1, -.8, 5.1, .2, 5.5);
    box(materials.frame, -4.65, .78, -.91, 3.45, 1.08, 3.1);
    box(materials.castIron, -4.65, .68, .69, 2.87, .65, .14);
    cylinder(materials.castIron, -4.7, 2.47, -.94, 1.44, 3.0, 'z');
    for (const z of [-2.34, -1.67, -.3, .48]) cylinder(materials.copper, -4.7, 2.47, z, 1.468, .085, 'z');
    flange(-4.7, 2.47, .64, 1.41);
    cylinder(materials.castIron, -4.7, 2.47, .76, 1.19, .18, 'z');
    cylinder(materials.copper, -4.7, 2.52, .875, .73, .075, 'z');
    cylinder(materials.frame, -4.7, 2.52, .927, .648, .09, 'z');
    cylinder(materials.brass, -4.87, 2.7, .99, .22, .095, 'z');
    cylinder(materials.rubber, -4.87, 2.7, 1.052, .16, .055, 'z');
    cylinder(materials.lamp, -4.9, 2.735, 1.085, .045, .012, 'z');
    beam(materials.brass, [-4.4, 2.15, 1.03], [-4.11, 2.49, 1.28], .052);
    box(materials.steel, -4.7, 1.49, 1.11, .83, .23, .84);
    box(materials.copper, -4.7, 1.62, 1.47, .88, .09, .08);
    box(materials.frame, -2.91, 2.02, .12, .62, 1.2, .64);
    box(materials.screen, -2.91, 2.26, .45, .38, .33, .025);
    for (const x of [-3.08, -2.9, -2.72]) cylinder(materials.brass, x, 1.83, .48, .048, .05, 'z');
    mesh(model, new THREE.CylinderGeometry(.62, .22, .73, 24), materials.steel, -5.35, 4.26, -.28);
    cylinder(materials.copper, -5.35, 4.65, -.28, .638, .09);
    pipe(materials.copper, [[-4.03, 3.74, -1.35], [-4.03, 4.71, -1.35], [-4.02, 5.61, -1.48], [-3.97, 5.86, -2.42], [-3.85, 5.87, -3.79], [-3.82, 6.18, -4.39], [-3.82, 7.46, -4.39]], .235);
    cylinder(materials.castIron, -3.82, 7.45, -4.39, .37, .11);
    plate('02 / DRUM', -4.67, .67, .775, 1.04, .32);

    // 03. Cooling tray and motor-driven rake.
    cylinder(materials.frame, -3.82, .57, 2.21, 1.08, .86);
    cylinder(materials.castIron, -3.82, 1.11, 2.21, 1.32, .44);
    cylinder(materials.copper, -3.82, 1.33, 2.21, 1.37, .12);
    cylinder(materials.roastedBeans, -3.82, 1.39, 2.21, 1.22, .065);
    // The golden-angle distribution fills the tray without a texture or many draw calls.
    for (let index = 0; index < 195; index++) {
      const angle = index * 2.399963;
      const radius = Math.sqrt((index + .5) / 195) * 1.17;
      const rotation = new THREE.Quaternion().setFromAxisAngle(up, angle * 2.7);
      const surface = index % 4 ? materials.roastedBeans : materials.wood;
      batch(beanShape, surface, false, [-3.82 + Math.cos(angle) * radius, 1.435, 2.21 + Math.sin(angle) * radius], [.068, .029, .044], rotation);
    }
    const rake = new THREE.Group();
    rake.position.set(-3.82, 1.53, 2.21);
    model.add(rake);
    mesh(rake, new THREE.CylinderGeometry(.15, .18, .31, 16), materials.steel, 0, .02, 0);
    const rakeGeometry = new THREE.BoxGeometry(2.2, .06, .068);
    mesh(rake, rakeGeometry, materials.brass, 0, .026, 0);
    mesh(rake, rakeGeometry, materials.steel, 0, .026, 0).rotation.y = Math.PI / 2;
    for (const x of [-.96, -.64, -.31, .32, .67, .97]) {
      mesh(rake, new THREE.BoxGeometry(.052, .16, .19), materials.steel, x, -.03, .07);
    }
    box(materials.steel, -2.37, 1.11, 2.2, .71, .13, .52);
    plate('03 / COOL', -3.82, .81, 3.3, .93, .28);

    // 04. A real-scale quality bench with sample trays, cups and a mill.
    box(materials.green, 2.92, .07, -2.8, 5.0, .14, 3.84);
    box(materials.wood, 2.92, 1.22, -2.75, 3.92, .17, 1.65);
    box(materials.steel, 2.92, .46, -2.75, 3.7, .085, 1.4);
    for (const x of [1.15, 4.69]) {
      for (const z of [-3.39, -2.12]) box(materials.frame, x, .64, z, .13, 1.2, .13);
    }
    for (let sample = 0; sample < 4; sample++) {
      const x = 1.63 + sample * .58;
      cylinder(materials.steel, x, 1.33, -2.26, .212, .062);
      cylinder(sample < 2 ? materials.rawBeans : materials.roastedBeans, x, 1.37, -2.26, .171, .041);
      cylinder(materials.chalk, x, 1.4, -2.88, .15, .2);
      cylinder(materials.roastedBeans, x, 1.506, -2.88, .118, .022);
    }
    box(materials.castIron, 4.35, 1.56, -3.07, .49, .57, .44);
    mesh(model, new THREE.CylinderGeometry(.28, .13, .31, 16), materials.steel, 4.35, 1.995, -3.07);
    box(materials.screen, 4.35, 1.67, -2.841, .19, .085, .023);
    box(materials.frame, 2.75, 2.54, -3.4, 3.16, .12, .14);
    box(materials.lamp, 2.75, 2.465, -3.4, 2.9, .034, .11, false);
    for (const x of [1.23, 4.27]) box(materials.steel, x, 1.95, -3.4, .07, 1.13, .07);
    plate('04 / QC', 2.92, 1.22, -1.91, .93, .26);

    // 05. Conveyor, hopper, bag sealer, cartons and pallet.
    box(materials.slate, 5.62, .1, 1.18, 11.75, .2, 2.65);
    box(materials.castIron, 5.62, 1.0, 1.3, 10.8, .36, 1.27);
    box(materials.rubber, 5.62, 1.205, 1.3, 10.65, .095, .98);
    for (const z of [.7, 1.9]) box(materials.steel, 5.62, 1.14, z, 10.9, .19, .1);
    for (const x of [.57, 2.76, 5.2, 7.72, 10.56]) {
      for (const z of [.82, 1.78]) box(materials.frame, x, .55, z, .12, 1.03, .12);
      box(materials.steel, x, .49, 1.3, .09, .09, 1.05);
    }
    for (let roller = 0; roller < 25; roller++) cylinder(materials.castIron, .44 + roller * .43, 1.255, 1.3, .022, 1.0, 'z');
    box(materials.green, 6.7, 2.36, 1.3, 1.63, 2.19, 1.65);
    box(materials.frame, 6.7, 1.61, 2.135, 1.24, .78, .055);
    box(materials.steel, 6.7, 1.55, 2.177, .86, .13, .095);
    box(materials.castIron, 6.7, 2.56, 2.15, .91, .52, .12);
    box(materials.screen, 6.57, 2.56, 2.218, .52, .28, .021);
    cylinder(materials.brass, 6.99, 2.56, 2.23, .083, .045, 'z');
    mesh(model, new THREE.CylinderGeometry(.7, .25, .76, 20), materials.steel, 6.7, 3.81, 1.3);
    cylinder(materials.steel, 6.7, 4.22, 1.3, .72, .095);
    plate('05 / PACK', 6.7, 3.13, 2.15, .99, .29);
    for (let slat = 0; slat < 6; slat++) box(materials.wood, 9.85, .19, -3.34 + slat * .37, 2.72, .13, .29);
    for (const x of [8.78, 9.85, 10.92]) box(materials.wood, x, .075, -2.42, .22, .15, 2.15);
    for (const [x, y, z] of [[9.24, .62, -2.91], [10.47, .62, -2.91], [9.24, .62, -1.9], [10.47, .62, -1.9], [9.24, 1.35, -2.9], [10.47, 1.35, -2.9]]) {
      box(materials.kraft, x, y, z, 1.12, .72, .91);
      box(materials.chalk, x, y + .365, z, .13, .014, .91, false);
      box(materials.chalk, x, y + .035, z + .46, .26, .15, .015, false);
    }

    const packages = new THREE.InstancedMesh(boxShape, materials.kraft, 5);
    packages.castShadow = true;
    packages.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    packages.frustumCulled = false;
    model.add(packages);
    function movePackages(elapsed) {
      for (let i = 0; i < packages.count; i++) {
        dummy.position.set(.53 + ((i * 2.05 + elapsed * .59) % 10.16), 1.54, 1.3);
        dummy.scale.set(.43, .53, .31);
        dummy.quaternion.identity();
        dummy.updateMatrix();
        packages.setMatrixAt(i, dummy.matrix);
      }
      packages.instanceMatrix.needsUpdate = true;
    }

    // Keep the many static details batched by material and shadow behaviour.
    for (const { geometry, surface, shadow, matrices } of batches.values()) {
      const instances = new THREE.InstancedMesh(geometry, surface, matrices.length);
      matrices.forEach((matrix, index) => instances.setMatrixAt(index, matrix));
      instances.castShadow = shadow;
      instances.receiveShadow = true;
      // The vendored Three.js revision culls using the shared geometry's bounds.
      instances.frustumCulled = false;
      model.add(instances);
    }
    movePackages(0);

    const visibleSurfaces = new Set(Object.values(materials).filter(surface => surface.isMeshStandardMaterial));
    return {
      update(elapsed) {
        rake.rotation.y = elapsed * .72;
        movePackages(elapsed);
      },
      setWireframe(enabled) {
        for (const surface of visibleSurfaces) surface.wireframe = enabled;
      },
      setWet(enabled) {
        materials.concrete.roughness = enabled ? .4 : .87;
        materials.slate.roughness = enabled ? .37 : .74;
      }
    };
  };
})();
