(function () {
  'use strict';

  window.buildMadarFactory = function buildMadarFactory(scene) {
    const factory = new THREE.Group();
    factory.name = 'Madar EV Assembly Plant';
    scene.add(factory);

    function pbr(color, metalness, roughness) {
      const surface = new THREE.MeshStandardMaterial({ color, metalness, roughness, envMapIntensity: .64 });
      surface.color.convertSRGBToLinear();
      return surface;
    }

    const steel = pbr(0x9aaab2, .72, .37);
    const frame = pbr(0x384951, .49, .48);
    const dark = pbr(0x232b32, .38, .58);
    const concrete = pbr(0x758289, .12, .83);
    const deck = pbr(0x536670, .32, .68);
    const amber = pbr(0xc68533, .36, .49);
    const orange = pbr(0xe66d27, .36, .35);
    const white = pbr(0xd1dbde, .43, .34);
    const bodyPaint = pbr(0x447b8a, .56, .28);
    const rubber = pbr(0x161e23, .03, .93);
    const glass = pbr(0x2f4a5a, .63, .21);
    const teal = pbr(0x428692, .4, .42);
    const lamp = new THREE.MeshBasicMaterial({ color: 0xe2f4ff });
    const cyan = new THREE.MeshBasicMaterial({ color: 0x78e5ff });
    const red = new THREE.MeshBasicMaterial({ color: 0xff4d45 });
    const sparksMaterial = new THREE.MeshBasicMaterial({ color: 0xffc772 });
    const surfaces = [steel, frame, dark, concrete, deck, amber, orange, white, bodyPaint, rubber, glass, teal];

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const roundGeometry = new THREE.CylinderGeometry(1, 1, 1, 20);
    const jointGeometry = new THREE.CylinderGeometry(1, 1, 1, 10);
    const groups = new Map();
    const transform = new THREE.Object3D();
    const vertical = new THREE.Vector3(0, 1, 0);
    const horizontal = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    const lateral = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);

    function solid(parent, geometry, surface, point, size, rotation = null, shadow = true) {
      const key = `${parent.id}/${geometry.id}/${surface.id}/${shadow}`;
      if (!groups.has(key)) groups.set(key, { parent, geometry, surface, shadow, transforms: [] });
      transform.position.set(...point);
      transform.scale.set(...size);
      if (rotation) transform.quaternion.copy(rotation);
      else transform.quaternion.identity();
      transform.updateMatrix();
      groups.get(key).transforms.push(transform.matrix.clone());
    }

    function box(parent, surface, x, y, z, w, h, d, shadow = true) {
      solid(parent, boxGeometry, surface, [x, y, z], [w, h, d], null, shadow);
    }

    function cylinder(parent, surface, x, y, z, radius, height, rotation = null) {
      solid(parent, roundGeometry, surface, [x, y, z], [radius, height, radius], rotation);
    }

    function member(parent, surface, a, b, width, depth = width) {
      const start = new THREE.Vector3(...a);
      const direction = new THREE.Vector3(...b).sub(start);
      const length = direction.length();
      const rotation = new THREE.Quaternion().setFromUnitVectors(vertical, direction.normalize());
      solid(parent, boxGeometry, surface, start.addScaledVector(direction, length / 2).toArray(), [width, length, depth], rotation);
    }

    function addMesh(parent, geometry, surface, x = 0, y = 0, z = 0) {
      const mesh = new THREE.Mesh(geometry, surface);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    }

    function group(parent, name, x, y, z) {
      const component = new THREE.Group();
      component.name = name;
      component.position.set(x, y, z);
      parent.add(component);
      return component;
    }

    function plate(parent, label, x, y, z, width, height, floor = false) {
      const board = document.createElement('canvas');
      board.width = 384;
      board.height = 96;
      const ink = board.getContext('2d');
      ink.fillStyle = '#22313a';
      ink.fillRect(0, 0, 384, 96);
      ink.fillStyle = '#a5dce9';
      ink.fillRect(11, 12, 6, 72);
      ink.fillStyle = '#e5edf0';
      ink.font = '600 36px monospace';
      ink.textBaseline = 'middle';
      ink.fillText(label, 31, 48, 334);
      const texture = new THREE.CanvasTexture(board);
      texture.encoding = THREE.sRGBEncoding;
      const sign = addMesh(parent, new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture }), x, y, z);
      if (floor) sign.rotation.x = -Math.PI / 2;
      sign.castShadow = false;
      sign.receiveShadow = false;
    }

    function workCell(x, title, width = 5.6) {
      box(factory, deck, x, .027, .73, width, .054, 6.85);
      for (const z of [-2.66, 4.1]) {
        box(factory, amber, x, .057, z, width, .016, .075, false);
      }
      for (const side of [-1, 1]) {
        box(factory, amber, x + side * width / 2, .057, .73, .075, .016, 6.85, false);
      }
      plate(factory, title, x, .018, 5.42, 3.15, .78, true);
      const panel = group(factory, 'Cell control cabinet', x + width / 2 - .45, 0, -2.8);
      box(panel, frame, 0, .78, 0, .69, 1.56, .55);
      box(panel, dark, 0, 1.04, .291, .49, .66, .034);
      box(panel, cyan, -.015, 1.17, .314, .31, .205, .016, false);
      cylinder(panel, amber, .14, 1.65, 0, .075, .19);
    }

    // Open front, steel trusses and a service mezzanine provide a readable cross-section.
    box(factory, dark, 0, -.45, 0, 35.7, .85, 16.1);
    box(factory, concrete, 0, -.072, 0, 35.5, .144, 15.9);
    box(factory, teal, 0, -.36, 8.06, 35.45, .07, .045, false);
    box(factory, deck, 0, 1.42, -7.63, 35.4, 2.84, .21);
    box(factory, frame, 0, 3.02, -6.41, 35.28, .22, 2.44);
    box(factory, dark, 0, 2.8, -5.22, 35.28, .23, .15);
    for (const x of [-17.4, -11.6, -5.8, 0, 5.8, 11.6, 17.4]) {
      box(factory, frame, x, 3.77, -7.4, .29, 7.54, .36);
      box(factory, steel, x, .11, -7.4, .62, .22, .58);
      member(factory, steel, [x, 7.38, -7.3], [x, 7.15, -4.4], .16);
      member(factory, frame, [x, 6.13, -7.22], [x, 7.15, -4.65], .12);
    }
    for (const y of [4.2, 6.36, 7.4]) box(factory, frame, 0, y, -7.4, 35.25, .15, .25);
    box(factory, steel, 0, 7.14, -4.55, 35, .19, .29);
    for (let index = -5; index <= 5; index++) {
      const x = index * 3.13;
      box(factory, frame, x, 7.01, -4.52, 2.48, .19, .36, false);
      box(factory, lamp, x, 6.89, -4.52, 2.29, .055, .19, false);
      box(factory, steel, x, 3.53, -5.23, .06, .98, .07, false);
      box(factory, dark, x + .31, 1.13, -7.48, 2.07, 1.42, .1, false);
      for (let grille = 0; grille < 6; grille++) {
        box(factory, frame, x + .31, .6 + grille * .19, -7.407, 1.87, .06, .035, false);
      }
    }
    for (const y of [3.52, 4.0]) box(factory, steel, 0, y, -5.23, 35.1, .049, .062, false);
    box(factory, amber, 0, 3.25, -5.22, 35.1, .073, .064, false);
    plate(factory, 'MADAR / EV ASSEMBLY', 0, 5.21, -7.22, 7.5, 1.08);
    for (let step = 0; step < 13; step++) {
      box(factory, steel, -17.0 + step * .224, .14 + step * .222, -4.55, .31, .075, 1.03);
    }
    for (const z of [-5.1, -4.0]) {
      member(factory, frame, [-17.14, .1, z], [-14.13, 3.02, z], .14);
      member(factory, amber, [-17.14, .81, z], [-14.13, 3.75, z], .055);
      for (const i of [0, 4, 8, 12]) member(factory, frame, [-17 + i * .224, .15 + i * .222, z], [-17 + i * .224, .87 + i * .222, z], .047);
    }

    for (let x = -17; x <= 17; x += .74) {
      box(factory, dark, x, .13, 1.14, .22, .17, 1.96);
      if (Math.abs(x % 3) < .76) {
        for (const z of [6.27, 7.03]) box(factory, amber, x, .013, z, .39, .015, .035, false);
      }
    }
    for (const z of [.35, 1.93]) {
      box(factory, steel, 0, .26, z, 34.6, .115, .11);
      box(factory, frame, 0, .14, z, 34.6, .11, .28);
    }

    // 01 / Stamping press with guided hydraulic tooling and the sheet feeder.
    workCell(-13.3, '01 / PRESS', 6);
    for (const x of [-15.27, -11.2]) {
      for (const z of [-1.34, 2.67]) {
        box(factory, frame, x, 2.68, z, .45, 5.36, .47);
        box(factory, amber, x, 2.79, z + .249, .25, 4.35, .055, false);
        cylinder(factory, steel, x + (x < -13.3 ? .32 : -.32), 3.26, z, .09, 3.22);
      }
    }
    box(factory, frame, -13.235, 5.48, .665, 4.7, .55, 4.55);
    box(factory, teal, -13.235, 5.91, .665, 4.37, .33, 4.25);
    box(factory, white, -13.235, 5.5, 2.97, 3.6, .12, .05, false);
    plate(factory, 'STAMPING', -13.23, 5.51, 2.995, 2.03, .39);
    box(factory, frame, -13.235, .62, .65, 4.04, 1.09, 3.65);
    box(factory, steel, -13.24, 1.22, .65, 3.58, .17, 3.15);
    box(factory, dark, -13.24, 1.36, .65, 2.57, .13, 1.83);
    box(factory, white, -13.24, 1.46, .65, 2.23, .065, 1.58);
    const die = group(factory, 'Upper stamping die', -13.24, 3.08, .65);
    box(die, teal, 0, .39, 0, 3.62, .56, 3.22);
    box(die, steel, 0, .03, 0, 3.23, .19, 2.75);
    box(die, frame, 0, -.14, 0, 2.37, .19, 1.75);
    for (const x of [-1.11, 1.11]) {
      cylinder(die, steel, x, 1.48, 0, .14, 2.16);
      cylinder(factory, dark, -13.24 + x, 4.76, .65, .24, 1.09);
    }
    for (let roller = 0; roller < 8; roller++) cylinder(factory, steel, -16.8 + roller * .14, 1.13, .65, .045, 1.66, horizontal);
    box(factory, frame, -16.37, .69, .65, 1.5, .16, 1.84);

    // Side profiles are extruded with bevels so the bodies read as cars in silhouette.
    function silhouette(points, depth) {
      const outline = new THREE.Shape();
      points.forEach(([x, y], index) => index ? outline.lineTo(x, y) : outline.moveTo(x, y));
      outline.closePath();
      const geometry = new THREE.ExtrudeGeometry(outline, { depth, bevelEnabled: true, bevelSize: .075, bevelThickness: .07, bevelSegments: 2 });
      geometry.translate(0, 0, -depth / 2);
      return geometry;
    }

    const shellGeometry = silhouette([
      [-2.12, .43], [-2.18, .65], [-2.04, .91], [-1.67, 1.02], [-1.4, 1.05],
      [-.93, 1.13], [1.24, 1.11], [1.88, .94], [2.19, .7], [2.17, .48],
      [1.76, .38], [1.72, .66], [1.61, .77], [1.12, .77], [.98, .64], [.94, .38],
      [-.98, .38], [-1.02, .61], [-1.18, .76], [-1.68, .76], [-1.82, .58], [-1.86, .39]
    ], 1.79);
    const cabinGeometry = silhouette([
      [-1.56, 1], [-1.23, 1.58], [-.97, 1.73], [.43, 1.73], [.75, 1.55],
      [1.29, 1.03]
    ], 1.55);
    const roofGeometry = silhouette([[-1.21, 1.58], [-.97, 1.735], [.44, 1.735], [.72, 1.57], [.45, 1.66], [-.97, 1.66]], 1.64);

    function body(parent, paint, finished = false) {
      addMesh(parent, shellGeometry, paint);
      addMesh(parent, roofGeometry, paint);
      if (finished) addMesh(parent, cabinGeometry, glass);
      for (const z of [-.8, .8]) {
        member(parent, paint, [-1.58, 1.04, z], [-1.13, 1.63, z], .084);
        member(parent, paint, [.56, 1.64, z], [1.27, 1.045, z], .084);
        member(parent, paint, [-.27, 1.1, z], [-.22, 1.69, z], .067);
        box(parent, finished ? dark : steel, -.1, .87, z * 1.21, .31, .035, .025, false);
      }
      if (finished) {
        for (const z of [-.65, .65]) {
          box(parent, lamp, 2.146, .805, z, .065, .075, .47, false);
          box(parent, red, -2.105, .875, z, .055, .075, .46, false);
          box(parent, bodyPaint, .85, 1.18, z * 1.52, .24, .11, .18);
        }
        box(parent, dark, 2.175, .58, 0, .095, .13, 1.1);
      }
    }

    function wheels(parent) {
      for (const x of [-1.43, 1.34]) {
        for (const z of [-.91, .91]) {
          cylinder(parent, rubber, x, .39, z, .39, .27, horizontal);
          cylinder(parent, steel, x, .39, z * 1.16, .259, .07, horizontal);
          cylinder(parent, dark, x, .39, z * 1.2, .201, .03, horizontal);
          cylinder(parent, steel, x, .39, z * 1.227, .08, .026, horizontal);
          for (let spoke = 0; spoke < 5; spoke++) {
            const angle = spoke * Math.PI * 2 / 5;
            member(parent, steel, [x, .39, z * 1.227], [x + .211 * Math.cos(angle), .39 + .211 * Math.sin(angle), z * 1.227], .027);
          }
        }
      }
    }

    // 02 / Body-in-white fixture and two articulated spot-welding robots.
    workCell(-6.35, '02 / WELD', 6.15);
    box(factory, dark, -6.3, .5, 1.13, 4.78, .49, 2.19);
    for (const x of [-8.29, -4.33]) {
      for (const z of [.22, 2.01]) {
        box(factory, amber, x, .82, z, .18, .43, .2);
        box(factory, steel, x, 1.03, z, .34, .115, .24);
      }
    }
    body(group(factory, 'Unpainted vehicle shell', -6.3, .68, 1.13), white);

    function robot(x, z, side) {
      const pedestal = group(factory, 'Welding robot', x, 0, z);
      box(pedestal, frame, 0, .22, 0, 1.21, .44, 1.21);
      cylinder(pedestal, dark, 0, .56, 0, .57, .27);
      const turntable = group(pedestal, 'Robot base axis', 0, .66, 0);
      cylinder(turntable, orange, 0, .23, 0, .48, .38);
      box(turntable, orange, 0, .59, 0, .68, .56, .58);
      const shoulder = group(turntable, 'Robot shoulder axis', 0, .82, 0);
      cylinder(shoulder, dark, 0, 0, 0, .33, .75, horizontal);
      box(shoulder, orange, .71, 0, 0, 1.49, .45, .43);
      box(shoulder, dark, .67, .247, 0, 1.02, .11, .23);
      const elbow = group(shoulder, 'Robot elbow axis', 1.49, 0, 0);
      cylinder(elbow, dark, 0, 0, 0, .27, .57, horizontal);
      cylinder(elbow, steel, 0, 0, .29, .19, .055, horizontal);
      box(elbow, orange, .69, 0, 0, 1.46, .28, .32);
      box(elbow, dark, 1.37, 0, 0, .33, .31, .31);
      box(elbow, steel, 1.62, 0, 0, .26, .1, .1);
      const torch = group(elbow, 'Spot-welder tip', 1.76, 0, 0);
      const spark = group(torch, 'Welding sparks', 0, 0, 0);
      for (let i = 0; i < 9; i++) {
        const angle = i * 2.39996;
        member(spark, sparksMaterial, [0, 0, 0], [.23 * Math.cos(angle), .25 * Math.sin(angle), .12 * (i % 3 - 1)], .021);
      }
      spark.visible = false;
      return function weld(time) {
        const step = time * 1.21 + side;
        const offset = Math.sin(step) * .63;
        const dx = -6.15 + offset - x;
        const dz = 1.13 - side * .95 - z;
        const reach = Math.hypot(dx, dz);
        const dy = 1.83 + .13 * Math.cos(step * 2) - 1.48;
        const upperLength = 1.49;
        const lowerLength = 1.76;
        const bend = -Math.acos(THREE.MathUtils.clamp((reach * reach + dy * dy - upperLength ** 2 - lowerLength ** 2) / (2 * upperLength * lowerLength), -.99, .99));
        turntable.rotation.y = -Math.atan2(dz, dx);
        shoulder.rotation.z = Math.atan2(dy, reach) - Math.atan2(lowerLength * Math.sin(bend), upperLength + lowerLength * Math.cos(bend));
        elbow.rotation.z = bend;
        const pulse = (time + side * .43 + 3) % 1.38;
        spark.visible = pulse < .13;
        spark.scale.setScalar(Math.max(.1, 1 - pulse * 5));
      };
    }

    const welders = [robot(-7.42, -1.92, 1), robot(-5.22, 3.52, -1)];
    for (const x of [-9.16, -3.51]) {
      for (const z of [-2.4, -.8, .8, 2.4]) box(factory, amber, x, .65, z, .075, 1.26, .075);
      for (const y of [.34, 1.24]) box(factory, amber, x, y, 0, .075, .075, 4.83);
    }

    // 03 / Overhead trolley and exposed liquid-cooled battery pack.
    workCell(.3, '03 / PACK', 6.05);

    function pack(parent, exposed = true) {
      box(parent, steel, 0, 0, 0, 2.46, .17, 1.65);
      box(parent, dark, 0, .113, 0, 2.28, .09, 1.48);
      for (const x of [-.83, -.28, .28, .83]) {
        for (const z of [-.38, .38]) {
          box(parent, exposed ? teal : frame, x, .193, z, .49, .16, .66);
          if (exposed) {
            for (const offset of [-.14, .14]) box(parent, steel, x + offset, .28, z, .043, .026, .51, false);
          }
        }
      }
      for (const z of [-.78, .78]) box(parent, amber, 0, .13, z, 2.25, .07, .044);
    }

    function gantry(x, color) {
      for (const side of [-1, 1]) {
        const corner = x + side * 2.6;
        for (const z of [-1.77, 3.41]) {
          box(factory, frame, corner, 2.69, z, .26, 5.38, .31);
          box(factory, steel, corner, .11, z, .52, .22, .54);
        }
        box(factory, color, corner, 5.35, .82, .29, .33, 5.6);
        box(factory, steel, corner, 5.1, .82, .16, .095, 5.3);
      }
      for (const z of [-1.76, 3.41]) box(factory, color, x, 5.37, z, 5.56, .32, .31);
    }

    gantry(.3, teal);
    box(factory, frame, .3, .64, -.85, 2.96, 1.07, 1.97);
    box(factory, steel, .3, 1.225, -.85, 2.9, .12, 1.9);
    const trolley = group(factory, 'Battery lift trolley', .3, 4.99, 1.0);
    box(trolley, amber, 0, 0, 0, 5.35, .24, .22);
    box(trolley, dark, 0, -.24, 0, .56, .31, .55);
    const hangingPack = group(factory, 'Suspended battery modules', .3, 2.03, 1.0);
    pack(hangingPack);
    for (const side of [-1, 1]) {
      member(hangingPack, steel, [side * .91, .22, 0], [0, .79, 0], .053);
    }
    const liftCable = addMesh(factory, jointGeometry, dark);

    // 04 / Body drop station. Battery and axles sit on a rolling chassis.
    workCell(6.86, '04 / MARRY', 6.15);
    gantry(6.86, frame);
    const chassis = group(factory, 'Battery skate platform', 6.86, .33, 1.12);
    box(chassis, dark, 0, .31, 0, 4.06, .22, 1.6);
    pack(group(chassis, 'Installed battery', 0, .51, 0), false);
    for (const x of [-1.43, 1.34]) {
      cylinder(chassis, steel, x, .39, 0, .105, 1.82, horizontal);
      box(chassis, frame, x, .5, 0, .52, .38, .59);
    }
    wheels(chassis);
    const liftBody = group(factory, 'Descending finished body shell', 6.86, 2.18, 1.12);
    body(liftBody, bodyPaint, true);
    for (const x of [-1.54, 1.48]) {
      box(liftBody, steel, x, -.06, 0, .16, .16, 2.46);
      box(liftBody, amber, x, .11, -1.15, .23, .24, .16);
      box(liftBody, amber, x, .11, 1.15, .23, .24, .16);
    }
    box(factory, amber, 6.86, 5.03, 1.12, 4.7, .29, .35);
    const supportRod = [-1.54, 1.48].map(x => {
      const rod = addMesh(factory, jointGeometry, steel, 6.86 + x, 0, -1.15 + 1.12);
      return rod;
    });

    // 05 / Illuminated scanner cell, side sensors and a finished vehicle.
    workCell(13.32, '05 / SCAN', 6.15);
    for (const x of [11.15, 13.32, 15.5]) {
      for (const z of [-.78, 3.13]) {
        box(factory, frame, x, 2.14, z, .18, 4.28, .28);
        box(factory, cyan, x, 2.24, z + (z < 0 ? .15 : -.15), .07, 2.89, .036, false);
      }
      box(factory, frame, x, 4.27, 1.17, .24, .22, 4.2);
      box(factory, lamp, x, 4.11, 1.17, .09, .06, 3.43, false);
    }
    box(factory, teal, 13.32, 2.46, -.79, 4.59, .11, .11);
    box(factory, dark, 13.32, 1.75, 3.36, .9, .44, .18);
    box(factory, cyan, 13.32, 1.75, 3.46, .61, .24, .031, false);
    const finalCar = group(factory, 'Completed Madar EV', 13.2, .35, 1.14);
    body(finalCar, bodyPaint, true);
    wheels(finalCar);

    const scan = group(factory, 'Traveling scanner', 13.32, 0, 1.14);
    for (const z of [-1.57, 1.57]) box(scan, cyan, 0, 1.55, z, .032, 2.52, .032, false);
    box(scan, cyan, 0, 2.81, 0, .039, .039, 3.16, false);
    box(scan, cyan, 0, .065, 0, .039, .023, 3.16, false);

    for (const { parent, geometry, surface, shadow, transforms } of groups.values()) {
      const batch = new THREE.InstancedMesh(geometry, surface, transforms.length);
      transforms.forEach((matrix, index) => batch.setMatrixAt(index, matrix));
      // r128 culls against the untransformed shared geometry.
      batch.frustumCulled = false;
      batch.castShadow = shadow;
      batch.receiveShadow = true;
      parent.add(batch);
    }

    const cycle = (time, seconds) => .5 - .5 * Math.cos(time * Math.PI * 2 / seconds);
    function animate(time) {
      const press = cycle(time, 4.1);
      die.position.y = 3.14 - 1.4 * press ** 2;
      welders.forEach(weld => weld(time));

      trolley.position.z = .52 + 1.36 * cycle(time, 6.8);
      hangingPack.position.z = trolley.position.z;
      hangingPack.position.y = 1.54 + .82 * cycle(time + 1.45, 6.8);
      const cableTop = 4.59;
      const cableBottom = hangingPack.position.y + .79;
      liftCable.position.set(.3, (cableBottom + cableTop) / 2, trolley.position.z);
      liftCable.scale.set(.032, cableTop - cableBottom, .032);

      liftBody.position.y = .78 + 1.33 * cycle(time + 2.2, 7.4);
      for (const rod of supportRod) {
        rod.position.y = (4.89 + liftBody.position.y) / 2;
        rod.scale.set(.045, 4.89 - liftBody.position.y, .045);
      }

      scan.position.x = 11.25 + 4.06 * cycle(time, 4.85);
      finalCar.position.x = 13.25 + .34 * Math.sin(time * .7);
    }

    animate(1.1);
    return {
      update: animate,
      setWireframe(enabled) {
        for (const surface of surfaces) surface.wireframe = enabled;
      }
    };
  };
})();
