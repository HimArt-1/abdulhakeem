(function () {
  'use strict';

  window.buildFactoryDistrict = function buildFactoryDistrict(scene) {
    const city = new THREE.Group();
    city.name = 'Factory District';
    scene.add(city);

    function pbr(color, roughness = .75, metalness = .12) {
      const surface = new THREE.MeshStandardMaterial({ color, roughness, metalness });
      surface.color.convertSRGBToLinear();
      return surface;
    }

    function light(color, strength) {
      const surface = pbr(color, .42, .15);
      surface.emissive.setHex(color).convertSRGBToLinear();
      surface.emissiveIntensity = strength;
      return surface;
    }

    const asphalt = pbr(0x334151, .93);
    const concrete = pbr(0x788791, .9);
    const curb = pbr(0xa8b2b0, .9);
    const graphite = pbr(0x2d3945, .64, .35);
    const darkSteel = pbr(0x414f5d, .58, .4);
    const silver = pbr(0x829ba8, .43, .5);
    const copper = pbr(0xb27951, .36, .51);
    const limestone = pbr(0xc8ac87, .83);
    const blue = pbr(0x365c68, .49, .38);
    const roof = pbr(0x576674, .74, .25);
    const sand = pbr(0x7f7768, .97);
    const green = pbr(0x445f51, .96);
    const trunks = pbr(0x6c5645, .94);
    const solar = pbr(0x25466c, .27, .49);
    const whitePaint = pbr(0xe1ded0, .84);
    const yellowPaint = pbr(0xdea750, .9);
    const warmGlass = light(0xffb970, .9);
    const coolGlass = light(0x72cbef, .57);
    const bulbs = light(0xffd9a1, 1.3);
    const red = light(0xf76848, 1.1);
    const cyanLine = light(0x64cbd7, .8);

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const roundGeometry = new THREE.CylinderGeometry(1, 1, 1, 16);
    const topGeometry = new THREE.CylinderGeometry(.42, 1, 1, 16);
    const bushGeometry = new THREE.IcosahedronGeometry(1, 1);
    const matrices = new Map();
    const transform = new THREE.Object3D();
    const quarterTurn = Math.PI / 2;

    function add(geometry, surface, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) {
      const key = `${geometry.id}/${surface.id}`;
      if (!matrices.has(key)) matrices.set(key, { geometry, surface, items: [] });
      transform.position.set(x, y, z);
      transform.rotation.set(rx, ry, rz);
      transform.scale.set(sx, sy, sz);
      transform.updateMatrix();
      matrices.get(key).items.push(transform.matrix.clone());
    }

    function box(surface, x, y, z, w, h, d, rx = 0, ry = 0, rz = 0) {
      add(boxGeometry, surface, x, y, z, w, h, d, rx, ry, rz);
    }

    function cylinder(surface, x, y, z, radius, height, rx = 0, rz = 0) {
      add(roundGeometry, surface, x, y, z, radius, height, radius, rx, 0, rz);
    }

    function makeTexture(draw, width, height = width) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      draw(canvas.getContext('2d'), width, height);
      const texture = new THREE.CanvasTexture(canvas);
      texture.encoding = THREE.sRGBEncoding;
      return texture;
    }

    const roadMap = makeTexture((ctx, w, h) => {
      ctx.fillStyle = '#f1eeee';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1950; i++) {
        ctx.fillStyle = i % 3 ? '#808c9a24' : '#ffffff9a';
        ctx.fillRect((i * 97 + i * i * 43) % w, (i * 61 + i * i * 7) % h, 1 + i % 2, 1);
      }
    }, 128);
    roadMap.wrapS = roadMap.wrapT = THREE.RepeatWrapping;
    roadMap.repeat.set(13, 9);
    asphalt.map = roadMap;

    const haloTexture = makeTexture((ctx, w) => {
      const halo = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
      halo.addColorStop(0, '#ffd08ea0');
      halo.addColorStop(.32, '#f6a64f52');
      halo.addColorStop(1, '#f6a64f00');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, w);
    }, 64);
    const haloMaterial = new THREE.MeshBasicMaterial({ map: haloTexture, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .73 });
    const haloGeometry = new THREE.PlaneGeometry(1, 1);

    function lamp(x, z, side = 1) {
      cylinder(graphite, x, .18, z, .21, .35);
      cylinder(silver, x, 1.87, z, .055, 3.38);
      box(silver, x + side * .34, 3.56, z, .72, .062, .068);
      box(graphite, x + side * .65, 3.55, z, .33, .13, .22);
      box(bulbs, x + side * .65, 3.472, z, .22, .023, .14);
      add(haloGeometry, haloMaterial, x + side * .65, .046, z, 3.9, 3.9, 1, -quarterTurn);
    }

    function sign(text, color, x, y, z, width) {
      const map = makeTexture((ctx, w, h) => {
        ctx.fillStyle = '#1c252e';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = color;
        ctx.fillRect(w - 24, 9, 13, h - 18);
        ctx.font = 'bold 58px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.direction = 'rtl';
        ctx.fillText(text, w - 42, h / 2 + 5, w - 65);
      }, 512, 112);
      const board = new THREE.Mesh(new THREE.PlaneGeometry(width, width * 112 / 512), new THREE.MeshBasicMaterial({ map }));
      board.position.set(x, y, z);
      city.add(board);
    }

    // Cast slab, perimeter drives and the crossroads that organizes the estate.
    box(graphite, 0, -.7, 0, 75, 1.1, 50);
    box(darkSteel, 0, -.28, 0, 75.13, .10, 50.14);
    box(cyanLine, 0, -.48, 25.06, 74.55, .045, .035);
    box(cyanLine, 37.57, -.48, 0, .035, .045, 49.5);
    box(asphalt, 0, -.075, 0, 74.8, .15, 49.8);
    for (const x of [-17.7, 17.7]) {
      box(curb, x, .045, -7.25, 26, .09, 20.3);
      box(sand, x, .085, -7.25, 25.45, .03, 19.77);
      box(curb, x, .045, 14.4, 26, .09, 9.85);
      box(concrete, x, .087, 14.4, 25.44, .03, 9.25);
    }

    for (let z = -22.5; z < 24; z += 2.25) {
      if (Math.abs(z - 6.1) > 3.6) box(whitePaint, 0, .016, z, .09, .021, 1.05);
      for (const x of [-33.6, 33.6]) {
        if (Math.abs(z - 6.1) > 3.7) box(whitePaint, x, .016, z, .073, .021, .97);
      }
    }
    for (let x = -34; x < 35; x += 2.3) {
      if (Math.abs(x) > 4.4) box(yellowPaint, x, .015, 6.15, 1.09, .02, .086);
      for (const z of [-20.65, 21.85]) {
        if (Math.abs(x) > 4.4) box(whitePaint, x, .016, z, 1.02, .02, .078);
      }
    }
    for (const side of [-1, 1]) {
      for (let mark = -3; mark <= 3; mark++) {
        box(whitePaint, mark * .6, .017, 6.15 + side * 3.49, .29, .023, 1.14);
        box(whitePaint, side * 4.65, .017, 6.15 + mark * .53, 1.15, .023, .25);
      }
      for (const z of [-15.8, -7.0, 2.0, 10.4, 17.7]) lamp(side * 4.5, z, -side);
      for (const x of [14.4, 25.6]) {
        lamp(side * x, 9.8, side);
        lamp(side * x, -17.0, -side);
      }
    }

    // Dock furniture, rooftop ventilation and repeatable warehouse bays.
    function hvac(x, y, z, scale = 1) {
      box(graphite, x, y + .20 * scale, z, 1.32 * scale, .4 * scale, 1.02 * scale);
      box(silver, x, y + .42 * scale, z, 1.29 * scale, .075 * scale, 1.0 * scale);
      for (const offset of [-.31, .31]) {
        cylinder(darkSteel, x + offset * scale, y + .47 * scale, z, .22 * scale, .034 * scale);
      }
    }

    function loadingDoors(x, z, width, count) {
      for (let index = 0; index < count; index++) {
        const px = x + (index - (count - 1) / 2) * width / count;
        box(graphite, px, 1.02, z, 1.89, 1.98, .092);
        box(silver, px, 1.01, z + .06, 1.61, 1.79, .05);
        for (let slat = 0; slat < 7; slat++) {
          box(darkSteel, px, .28 + slat * .236, z + .092, 1.6, .034, .025);
        }
        box(warmGlass, px, 2.18, z + .19, .57, .09, .18);
        box(concrete, px, .14, z + .7, 2.04, .26, 1.13);
        for (const end of [-1, 1]) {
          cylinder(yellowPaint, px + end * 1.05, .42, z + .31, .062, .7);
        }
      }
    }

    function warehouse(x, z, w, d, h, top, bays, south = true) {
      box(darkSteel, x, h / 2, z, w, h, d);
      box(top, x, h + .1, z, w + .35, .22, d + .32);
      box(graphite, x, h - .32, z + d / 2 + .03, w, .18, .08);
      for (let px = x - w / 2 + .4; px <= x + w / 2; px += .48) {
        box(silver, px, h / 2, z + d / 2 + .027, .034, h * .83, .055);
      }
      if (south) loadingDoors(x, z + d / 2 + .07, w - .65, bays);
      for (let index = 0; index < 3; index++) {
        box(solar, x + (index - 1) * w / 4, h + .31, z - .48, w / 4.4, .075, d * .42, .14);
        box(silver, x + (index - 1) * w / 4, h + .35, z - .5, .045, .03, d * .42, .14);
      }
      hvac(x + w * .32, h + .23, z + d * .31, .65);
    }

    warehouse(-24, -13.65, 10.7, 4.65, 3.3, roof, 3);
    warehouse(23.8, -13.8, 10.8, 4.8, 3.55, roof, 3);
    warehouse(-23.65, 15.12, 9.4, 5.5, 2.65, roof, 3);
    warehouse(23.65, 15.12, 9.4, 5.5, 2.65, blue, 3);
    warehouse(-11.6, 15.5, 6.1, 4.55, 2.38, roof, 2, false);
    warehouse(12.25, 15.65, 6.5, 4.55, 2.38, roof, 2, false);

    function plant(x, z, size) {
      box(concrete, x, .12, z, size * 1.29, .2, size * 1.16);
      box(sand, x, .23, z, size * 1.13, .05, size);
      cylinder(trunks, x, .6, z, .07, .81);
      add(bushGeometry, green, x, 1.14, z, size * .49, size * .59, size * .44, 0, .7, .15);
      add(bushGeometry, green, x + .26, .94, z - .16, size * .34, size * .42, size * .35);
    }

    for (const side of [-1, 1]) {
      for (const z of [-14.4, -5.5, .25, 13.55, 17.55]) plant(side * 29.5, z, 1.04);
      for (const x of [6.2, 16.2, 18.0, 27.5]) plant(side * x, 11.25, .86);
      for (let index = 0; index < 5; index++) {
        const x = side * (6.65 + index * 1.27);
        box(whitePaint, x, .115, 18.4, .045, .018, 1.58);
      }
    }

    // The roastery silhouette combines limestone, a copper volume and three grain silos.
    const rx = -13.8;
    box(concrete, rx, .16, -5.5, 17.8, .16, 11.5);
    box(limestone, rx, 2.2, -6.1, 12.7, 4.17, 8.65);
    box(graphite, rx, .52, -1.73, 12.71, .76, .12);
    box(copper, rx - 1.4, 4.57, -6.4, 10.8, .82, 8.15);
    box(graphite, rx - 1.4, 5.01, -6.4, 10.94, .13, 8.24);
    box(graphite, rx + 2.46, 2.43, -1.64, 5.2, 3.13, .2);
    box(warmGlass, rx + 2.46, 2.45, -1.52, 4.89, 2.77, .06);
    box(copper, rx + 2.46, 3.93, -.92, 5.54, .18, 1.37);
    for (let index = 0; index < 7; index++) {
      box(graphite, rx + .09 + index * .79, 2.45, -1.465, .067, 2.88, .10);
    }
    for (const offset of [-5.72, -4.64, -3.56, -2.48, -1.4]) {
      box(warmGlass, rx + offset, 2.75, -1.75, .48, 1.59, .14);
      box(copper, rx + offset + .28, 2.75, -1.63, .05, 1.74, .09);
    }
    for (let rib = 0; rib < 12; rib++) {
      box(silver, rx - 6.28 + rib * .87, 4.57, -2.294, .052, .66, .04);
    }
    for (const x of [rx + 5.42, rx + 7.43, rx + 9.41]) {
      cylinder(silver, x, 3.08, -8.37, .84, 4.46);
      add(topGeometry, silver, x, 5.56, -8.37, .84, .56, .84);
      cylinder(copper, x, 5.92, -8.37, .43, .19);
      for (const height of [1.03, 2.82, 4.44, 5.08]) cylinder(darkSteel, x, height, -8.37, .862, .066);
    }
    cylinder(copper, rx + 3.71, 5.94, -8.37, .14, 3.44, 0, quarterTurn);
    cylinder(copper, rx + 2.07, 5.47, -8.37, .14, 1.03);
    for (const x of [rx - 3.9, rx - 2.85]) {
      cylinder(graphite, x, 5.96, -7.76, .27, 1.8);
      cylinder(silver, x, 6.86, -7.76, .37, .16);
    }
    hvac(rx - 1.2, 5.08, -5.9);
    hvac(rx + .34, 5.08, -5.9);
    sign('المحمصة', '#f0b37a', rx + 2.48, 4.23, -1.43, 4.14);
    for (let i = 0; i < 4; i++) box(concrete, rx + 2.47, .17 - .027 * i, -.53 + i * .27, 5.15, .23 - .04 * i, .31);

    // Madar has a long sawtooth roof, cooler clerestory glazing and a loading wing.
    const mx = 14.4;
    box(concrete, mx, .16, -5.3, 19.5, .16, 11.3);
    box(graphite, mx, 2.55, -6.46, 15.5, 4.84, 9.23);
    box(silver, mx, 4.87, -6.46, 15.62, .22, 9.4);
    const saw = new THREE.Shape();
    saw.moveTo(-1.21, 0);
    saw.lineTo(1.21, 0);
    saw.lineTo(.71, 1.29);
    saw.closePath();
    const sawGeometry = new THREE.ExtrudeGeometry(saw, { depth: 1, bevelEnabled: false });
    sawGeometry.translate(0, 0, -.5);
    for (let ridge = 0; ridge < 6; ridge++) {
      const x = mx - 6.45 + ridge * 2.58;
      add(sawGeometry, roof, x, 4.99, -6.47, 1, 1, 9.37);
      box(coolGlass, x + .96, 5.64, -6.47, .054, 1.34, 8.95, 0, 0, .365);
      for (let line = 0; line < 8; line++) {
        box(silver, x + .98, 5.64, -10.63 + line * 1.19, .073, 1.39, .045, 0, 0, .365);
      }
      box(solar, x - .29, 5.63, -7.45, 1.17, .075, 4.48, 0, 0, .59);
    }
    box(blue, mx - 1.65, 2.36, -1.63, 10.9, 3.93, .48);
    box(coolGlass, mx - 1.64, 2.14, -1.36, 9.98, 3.18, .13);
    for (let i = 0; i < 12; i++) {
      box(graphite, mx - 6.58 + i * .9, 2.17, -1.275, .10, 3.25, .13);
    }
    box(graphite, mx - 1.66, 1.5, -1.276, 10.03, .09, .15);
    box(graphite, mx - 1.66, 3.05, -1.276, 10.03, .09, .15);
    box(silver, mx - 1.65, 3.86, -.96, 11, .12, 1.0);
    box(cyanLine, mx - 1.65, 3.79, -.58, 10.83, .032, .06);
    box(graphite, mx + 6.4, 1.39, -1.03, 5.28, 2.55, 1.57);
    loadingDoors(mx + 6.34, -.19, 4.73, 2);
    sign('مدار', '#9ce8f3', mx - 1.65, 4.41, -1.23, 4.62);
    hvac(mx + 5.9, 2.69, -.89, .64);

    // Containers and trailers mark the yards without obscuring the main buildings.
    function container(x, z, material) {
      box(material, x, .62, z, 2.85, 1.18, 1.16);
      for (let rib = 0; rib < 11; rib++) {
        box(graphite, x - 1.3 + rib * .26, .63, z + .588, .042, 1.06, .05);
      }
      for (const offset of [-.58, .58]) box(silver, x, 1.228, z + offset, 2.9, .044, .062);
    }

    container(-27.22, 1.36, copper);
    container(-26.05, -.02, blue);
    container(26.6, -.33, silver);
    container(27.6, 1.02, blue);
    container(27.45, 2.38, copper);

    // Yard markings, bollards and local street furniture tie the buildings to the roads.
    for (const side of [-1, 1]) {
      for (const z of [2.33, 10.18]) {
        const x = side * 5.33;
        cylinder(graphite, x, 1.28, z, .06, 2.49);
        box(graphite, x, 2.41, z, .26, .57, .29);
        box(red, x, 2.56, z + (z < 6 ? .15 : -.15), .105, .10, .035);
      }
      for (const x of [22.55, 24.2, 25.85]) {
        box(whitePaint, side * x, .111, 1.66, .04, .012, 3.15);
        box(yellowPaint, side * x, .119, 3.3, 1.37, .015, .055);
      }
      for (let i = 0; i < 6; i++) {
        cylinder(graphite, side * (9.3 + i * .72), .42, .86, .043, .51);
        cylinder(yellowPaint, side * (9.3 + i * .72), .61, .86, .046, .10);
      }
    }
    for (const x of [-28.25, -27.37, 27.72, 28.57]) {
      box(graphite, x, .58, -6.71, .56, .96, .71);
      box(silver, x, .79, -6.34, .42, .17, .047);
      box(cyanLine, x + .13, .91, -6.31, .046, .033, .018);
    }

    // Recessed, lit entrance frames read clearly at pedestrian height.
    const doors = [
      { id: 'roastery-tour', label: 'ادخل المحمصة', x: rx + 2.46, z: -1.26, accent: copper, glass: warmGlass },
      { id: 'madar-tour', label: 'ادخل مصنع مدار', x: mx - 1.65, z: -1.10, accent: blue, glass: coolGlass }
    ];

    for (const door of doors) {
      box(graphite, door.x, 1.38, door.z - .055, 2.46, 2.58, .15);
      box(door.accent, door.x, 2.68, door.z + .09, 2.7, .15, .31);
      box(door.glass, door.x, 2.59, door.z + .16, 2.35, .04, .23);
      for (const side of [-1, 1]) {
        box(door.accent, door.x + side * 1.24, 1.39, door.z + .085, .15, 2.58, .30);
        box(whitePaint, door.x + side * 1.05, .255, door.z + .77, .05, .025, 1.26);
      }
      const leaves = [-1, 1].map(side => {
        const leaf = new THREE.Group();
        city.add(leaf);
        leaf.position.set(door.x + side * .56, 0, door.z + .10);
        const pane = new THREE.Mesh(boxGeometry, door.accent);
        pane.scale.set(1.09, 2.34, .095);
        pane.position.y = 1.43;
        leaf.add(pane);
        const windowPane = new THREE.Mesh(boxGeometry, door.glass);
        windowPane.scale.set(.84, 1.33, .025);
        windowPane.position.set(0, 1.74, .057);
        leaf.add(windowPane);
        const handle = new THREE.Mesh(boxGeometry, silver);
        handle.scale.set(.047, .29, .085);
        handle.position.set(side * -.40, 1.25, .094);
        leaf.add(handle);
        return leaf;
      });
      door.leaves = leaves;
      door.open = 0;
      door.target = 0;
      sign(door.label, '#e5e8e3', door.x, 3.05, door.z + .19, 2.6);
    }

    for (const { geometry, surface, items } of matrices.values()) {
      const batch = new THREE.InstancedMesh(geometry, surface, items.length);
      items.forEach((matrix, index) => batch.setMatrixAt(index, matrix));
      batch.frustumCulled = false;
      batch.castShadow = geometry !== haloGeometry && surface !== asphalt;
      batch.receiveShadow = geometry !== haloGeometry;
      city.add(batch);
    }

    function vehicle(color, truck) {
      const group = new THREE.Group();
      city.add(group);
      function part(surface, x, y, z, w, h, d) {
        const mesh = new THREE.Mesh(boxGeometry, surface);
        mesh.scale.set(w, h, d);
        mesh.position.set(x, y, z);
        group.add(mesh);
      }
      part(graphite, 0, .20, 0, truck ? 2.12 : 1.33, .24, .62);
      part(color, .28, .36, 0, .78, .34, .68);
      part(truck ? silver : color, -.47, truck ? .64 : .39, 0, truck ? 1.49 : .75, truck ? .76 : .21, .69);
      part(graphite, .37, .6, 0, .32, .16, .59);
      part(bulbs, .69, .35, 0, .03, .086, .59);
      part(red, truck ? -1.23 : -.855, .31, 0, .035, .065, .56);
      return group;
    }

    const lorry = vehicle(copper, true);
    const service = vehicle(blue, false);
    const depotTruck = vehicle(silver, true);
    depotTruck.position.set(21.4, 0, 1.54);
    depotTruck.rotation.y = -quarterTurn;

    const trafficPath = [[-32, 4.55], [32, 4.55], [32, 22.75], [-32, 22.75], [-32, 4.55]];
    function placeVehicle(vehicle, offset) {
      const loop = 164.4;
      let remaining = ((offset % loop) + loop) % loop;
      for (let index = 1; index < trafficPath.length; index++) {
        const [x, z] = trafficPath[index - 1];
        const [nextX, nextZ] = trafficPath[index];
        const dx = nextX - x;
        const dz = nextZ - z;
        const length = Math.hypot(dx, dz);
        if (remaining <= length) {
          vehicle.position.set(x + dx * remaining / length, 0, z + dz * remaining / length);
          vehicle.rotation.y = -Math.atan2(dz, dx);
          return;
        }
        remaining -= length;
      }
    }

    function entrance(anchor, focus, position, size) {
      const hit = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(...position);
      city.add(hit);
      return { anchor: new THREE.Vector3(...anchor), focus: new THREE.Vector3(...focus), hit };
    }

    const entrances = {
      'roastery-tour': entrance([rx + .2, 6.75, -2.75], [rx + 1.8, 2.4, -1.25], [rx + .2, 2.7, -6.3], [16, 5.4, 9.6]),
      'madar-tour': entrance([mx -.8, 7.05, -2.05], [mx - 1.6, 2.35, -1.0], [mx, 2.9, -6.02], [17.4, 5.8, 10.25])
    };

    const terrain = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), pbr(0x414952, .98));
    terrain.rotation.x = -quarterTurn;
    terrain.position.y = -1.28;
    terrain.visible = false;
    scene.add(terrain);

    const obstacles = [
      [-20.2, -10.5, -7.45, -1.37], [-9.5, -9.28, -3.53, -7.48],
      [6.64, -11.14, 22.18, -1.16], [18.14, -1.84, 23.45, -.26],
      [-29.45, -16, -18.6, -11.2], [18.36, -16.26, 29.27, -11.32],
      [-28.4, 12.33, -18.92, 17.91], [18.92, 12.33, 28.4, 17.91],
      [-14.7, 13.19, -8.5, 17.81], [8.96, 13.34, 15.56, 17.96],
      [-28.7, .75, -25.78, 1.97], [-27.52, -.63, -24.58, .59], [25.12, -.94, 29.0, 3.0]
    ];

    function updateDoors(delta) {
      for (const door of doors) {
        if (door.open === door.target) continue;
        const gap = door.target - door.open;
        door.open += Math.sign(gap) * Math.min(Math.abs(gap), delta * 3.2);
        door.leaves[0].position.x = door.x - .56 - door.open * .95;
        door.leaves[1].position.x = door.x + .56 + door.open * .95;
      }
    }

    function update(time) {
      placeVehicle(lorry, 19 + time * 2.0);
      placeVehicle(service, 102 + time * 2.7);
    }

    update(0);
    return {
      entrances,
      walkPlan: {
        label: 'شارع المصانع',
        spawn: [0, 16],
        lookAt: [0, -3],
        bounds: [-36.7, -24.1, 36.7, 24.1],
        obstacles,
        portals: doors.map(door => ({ id: door.id, x: door.x, z: door.z + .19, label: door.label })),
        speed: 6.0
      },
      openDoor(id) {
        const door = doors.find(item => item.id === id);
        door.target = 1;
      },
      closeDoors() { doors.forEach(door => { door.target = 0; }); },
      updateDoors,
      setWalking(enabled) { terrain.visible = enabled; },
      update,
      setDay(day) {
        warmGlass.emissiveIntensity = day ? .19 : .92;
        coolGlass.emissiveIntensity = day ? .19 : .64;
        bulbs.emissiveIntensity = day ? .12 : 1.38;
        cyanLine.emissiveIntensity = day ? .16 : .73;
        haloMaterial.opacity = day ? 0 : .78;
      }
    };
  };
})();
