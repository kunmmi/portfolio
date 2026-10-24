// Particle portrait. assets/headshot.png (transparent background) is
// sampled into ~17k points with a sculpted depth so the head can turn in 3D.
// The portrait forms from dust on load, follows the cursor, blinks, zooms in
// behind the About text, then a particle laptop assembles in front of it and
// Solidity types itself out on the screen while the head looks down at it.
// Everything is driven by scroll keyframes tied to the page sections.
(function () {
  const canvas = document.getElementById('scene');
  const done = () => { window.__sceneReady = true; };
  if (!canvas || typeof THREE === 'undefined') { done(); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  } catch (e) {
    canvas.remove();
    done();
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = () => window.innerWidth < 760;
  const pixelRatio = Math.min(window.devicePixelRatio, isSmall() ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  // rig: moved/scaled by scroll. head: rotates with cursor. laptop: own group.
  const rig = new THREE.Group();
  const head = new THREE.Group();
  const laptop = new THREE.Group();
  rig.add(head, laptop);
  scene.add(rig);

  const SIZE = 3.6;          // portrait height in world units
  const HEAD_Y = 0.25;       // head pivot, so turning rotates around the face
  head.position.y = HEAD_Y;

  const rand = (a, b) => a + Math.random() * (b - a);
  const scatterPoint = () => {
    const r = rand(4, 9), th = rand(0, Math.PI * 2), ph = Math.acos(rand(-1, 1));
    return [r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph) - 1];
  };

  const dotFrag = `
    uniform float uOpacity;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      float a = smoothstep(0.5, 0.05, d);
      gl_FragColor = vec4(vColor, a * vAlpha * uOpacity);
    }`;

  // ── Portrait ───────────────────────────────────────────────────────
  const portraitMat = new THREE.ShaderMaterial({
    uniforms: {
      uForm: { value: 0 }, uScatter: { value: 0 }, uTime: { value: 0 }, uBlink: { value: 0 },
      uSize: { value: 30 }, uPixelRatio: { value: pixelRatio }, uOpacity: { value: 1 },
    },
    vertexShader: `
      attribute vec3 aScatter;
      attribute float aBright;
      attribute float aEye;
      attribute float aEyeY;
      attribute float aRand;
      uniform float uForm, uScatter, uTime, uBlink, uSize, uPixelRatio;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float f = clamp(uForm * 1.5 - aRand * 0.5, 0.0, 1.0);
        f = f * f * (3.0 - 2.0 * f);
        float k = f * (1.0 - uScatter);
        vec3 tgt = position;
        tgt.y = mix(tgt.y, aEyeY, aEye * uBlink);
        vec3 p = mix(aScatter, tgt, k);
        p += vec3(sin(uTime * 0.8 + aRand * 20.0), cos(uTime * 0.7 + aRand * 13.0), sin(uTime * 0.6 + aRand * 7.0)) * 0.012;
        p += (1.0 - k) * vec3(sin(uTime * 0.15 + aRand * 30.0), cos(uTime * 0.12 + aRand * 17.0), 0.0) * 0.35;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPixelRatio * (0.5 + aBright * 0.9) / -mv.z;
        vec3 dim = vec3(0.30, 0.16, 0.52);
        vec3 lit = vec3(0.97, 0.91, 1.0);
        vec3 mid = vec3(0.77, 0.54, 1.0);
        vColor = mix(dim, lit, aBright);
        vColor = mix(vColor, mid, 0.35 * (1.0 - abs(aBright - 0.55) * 1.8));
        vAlpha = mix(0.2, 0.75, k);
      }`,
    fragmentShader: dotFrag,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });

  function buildPortrait(img) {
    const N = isSmall() ? 165 : 210;            // sample grid resolution
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0, N, N);
    const data = g.getImageData(0, 0, N, N).data;

    // Luminance + opacity per cell
    const lum = new Float32Array(N * N), on = new Uint8Array(N * N);
    const opaque = [];
    for (let i = 0; i < N * N; i++) {
      const a = data[i * 4 + 3];
      if (a < 140) continue;
      on[i] = 1;
      lum[i] = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
      opaque.push(lum[i]);
    }
    // Contrast-stretch between the 3rd and 97th percentile of the subject,
    // so a dark-on-dark portrait still reads on a black page.
    opaque.sort((a, b) => a - b);
    const lo = opaque[Math.floor(opaque.length * 0.03)], hi = opaque[Math.floor(opaque.length * 0.97)];
    const norm = v => Math.min(1, Math.max(0, (v - lo) / Math.max(hi - lo, 1e-3)));

    // Box blur over subject pixels only (the transparent background must not
    // drag the edges dark). Small blur kills skin texture; the large blur is
    // the local average that features are compared against.
    const blur = (src, r) => {
      const tmp = new Float32Array(N * N), out = new Float32Array(N * N);
      for (const [from, to, horiz] of [[src, tmp, true], [tmp, out, false]]) {
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          let s = 0, n = 0;
          for (let d = -r; d <= r; d++) {
            const xx = horiz ? x + d : x, yy = horiz ? y : y + d;
            if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue;
            const j = yy * N + xx;
            if (!on[j]) continue;
            s += from[j]; n++;
          }
          to[y * N + x] = n ? s / n : 0;
        }
      }
      return out;
    };
    const lumS = blur(lum, 1);
    const lumL = blur(lum, Math.round(N / 30));

    const pos = [], scat = [], bright = [], eye = [], eyeY = [], rnd = [];
    const unit = SIZE / N;
    // Eye centres in source-image fractions (670px headshot): used for blinks.
    const eyes = [[250 / 670, 283 / 670], [410 / 670, 283 / 670]];
    for (let y = 1; y < N - 1; y++) {
      for (let x = 1; x < N - 1; x++) {
        const i = y * N + x;
        if (!on[i]) continue;
        // Brightness = overall tone + local detail (how much lighter or darker
        // this spot is than its surroundings). Detail is what makes eyes,
        // brows, nostrils and the mouth line read on a dark-on-dark photo.
        const detail = lumS[i] - lumL[i];
        let b = Math.min(1, Math.max(0, 0.18 + norm(lumS[i]) * 0.5 + detail * 3.2));
        b = Math.pow(b, 1.3);
        // Fewer particles in shadow: dark features become hollows.
        if (Math.random() > 0.18 + b * 0.82) continue;

        const wx = (x / N - 0.5) * SIZE;
        const wy = (0.5 - y / N) * SIZE;
        // Sculpted depth: an ellipsoid for the head, a gentle curve for the
        // shoulders, plus a little relief from brightness (nose, cheeks).
        const hz = 1 - (wx / 1.05) ** 2 - ((wy - 0.25) / 1.45) ** 2;
        const bz = wy < -0.9 ? 1 - (wx / 2.1) ** 2 : 0;
        const z = Math.max(hz > 0 ? 0.62 * Math.sqrt(hz) : 0, bz > 0 ? 0.28 * Math.sqrt(bz) : 0) + norm(lum[i]) * 0.08;

        pos.push(wx + rand(-0.5, 0.5) * unit, wy - HEAD_Y + rand(-0.5, 0.5) * unit, z);
        scat.push(...scatterPoint());
        bright.push(b);
        rnd.push(Math.random());

        let w = 0, ey = 0;
        for (const [ex, eyf] of eyes) {
          const d = ((x / N - ex) / 0.07) ** 2 + ((y / N - eyf) / 0.035) ** 2;
          if (d < 1 && 1 - d > w) { w = 1 - d; ey = (0.5 - eyf) * SIZE - HEAD_Y; }
        }
        eye.push(w);
        eyeY.push(ey);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aScatter', new THREE.Float32BufferAttribute(scat, 3));
    geo.setAttribute('aBright', new THREE.Float32BufferAttribute(bright, 1));
    geo.setAttribute('aEye', new THREE.Float32BufferAttribute(eye, 1));
    geo.setAttribute('aEyeY', new THREE.Float32BufferAttribute(eyeY, 1));
    geo.setAttribute('aRand', new THREE.Float32BufferAttribute(rnd, 1));
    const pts = new THREE.Points(geo, portraitMat);
    pts.frustumCulled = false;
    head.add(pts);
  }

  // ── Laptop ─────────────────────────────────────────────────────────
  // Deck lies in the xz plane (z = 0 at the hinge, +z towards the viewer);
  // the lid rises from the hinge, tilted back. Code is laid out as one dot
  // per character so it can "type" by revealing dots in order.
  const CODE = [
    'contract Warden {',
    '  uint256 public cap;',
    '',
    '  function execute(Trade calldata t) external {',
    '    if (t.size > cap) revert OverCap();',
    '    if (drawdown() > limit) trip();',
    '    venue.swap(t);',
    '  }',
    '}',
  ];
  const KEYWORDS = new Set(['contract', 'uint256', 'public', 'function', 'calldata', 'external', 'if', 'revert']);

  const laptopMat = new THREE.ShaderMaterial({
    uniforms: {
      uAssemble: { value: 0 }, uTime: { value: 0 }, uTyped: { value: 0 }, uTyping: { value: 0 },
      uSize: { value: 30 }, uPixelRatio: { value: pixelRatio }, uOpacity: { value: 1 },
    },
    vertexShader: `
      attribute vec3 aScatter;
      attribute vec3 aColor;
      attribute float aType;   // 0 = body, 1 = key, 2 = code, 3 = screen glow
      attribute float aOrder;
      attribute float aRand;
      uniform float uAssemble, uTime, uTyped, uTyping, uSize, uPixelRatio;
      varying vec3 vColor;
      varying float vAlpha;
      float hash(float n) { return fract(sin(n) * 43758.5453); }
      void main() {
        float f = clamp(uAssemble * 1.4 - aRand * 0.4, 0.0, 1.0);
        f = f * f * (3.0 - 2.0 * f);
        vec3 p = mix(aScatter, position, f);
        vColor = aColor;
        float a = 0.85;
        float size = 1.0;
        if (aType > 0.5 && aType < 1.5) {
          // Keys: random presses while typing.
          float press = step(0.86, hash(floor(uTime * 11.0) + aOrder * 97.13)) * uTyping;
          p.y -= press * 0.03;
          vColor = mix(aColor, vec3(0.85, 0.62, 1.0), press);
          size = 1.0 + press * 0.6;
        } else if (aType > 1.5 && aType < 2.5) {
          // Code: visible once typed; the newest characters flare.
          float shown = step(aOrder, uTyped);
          float fresh = shown * (1.0 - smoothstep(0.0, 6.0, uTyped - aOrder));
          a *= shown;
          vColor = mix(aColor, vec3(1.0), fresh);
          size = 1.35 + fresh * 1.0;
        } else if (aType > 2.5) {
          a = 0.32 + 0.08 * sin(uTime * 3.0 + aRand * 6.0);
        }
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPixelRatio * size / -mv.z;
        vAlpha = a * f;
      }`,
    fragmentShader: dotFrag,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });

  let codeDots = 0;
  function buildLaptop() {
    const pos = [], col = [], type = [], order = [], scat = [], rnd = [];
    const add = (x, y, z, c, t, o) => {
      pos.push(x, y, z); col.push(...c); type.push(t); order.push(o);
      scat.push(...scatterPoint()); rnd.push(Math.random());
    };
    const body = [0.55, 0.42, 0.78];
    const W = 3.0, D = 1.9, H = 1.95, tilt = 0.28;
    const lid = (x, h) => [x, h * Math.cos(tilt), -h * Math.sin(tilt)];
    const line = (a, b, step, c, t) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      const n = Math.max(1, Math.round(len / step));
      for (let i = 0; i <= n; i++) {
        const k = i / n;
        add(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, c, t, 0);
      }
    };
    // Deck outline (two layers for thickness) + trackpad.
    for (const yy of [0, -0.06]) {
      line([-W / 2, yy, 0], [W / 2, yy, 0], 0.045, body, 0);
      line([W / 2, yy, 0], [W / 2, yy, D], 0.045, body, 0);
      line([W / 2, yy, D], [-W / 2, yy, D], 0.045, body, 0);
      line([-W / 2, yy, D], [-W / 2, yy, 0], 0.045, body, 0);
    }
    line([-0.45, 0, 1.35], [0.45, 0, 1.35], 0.05, body, 0);
    line([0.45, 0, 1.35], [0.45, 0, 1.8], 0.05, body, 0);
    line([0.45, 0, 1.8], [-0.45, 0, 1.8], 0.05, body, 0);
    line([-0.45, 0, 1.8], [-0.45, 0, 1.35], 0.05, body, 0);
    // Keys: 13 x 5 grid, 2x2 dots each.
    const keyCol = [0.62, 0.5, 0.86];
    let keyId = 0;
    for (let r = 0; r < 5; r++) {
      for (let k = 0; k < 13; k++) {
        const kx = -1.3 + k * (2.6 / 12), kz = 0.22 + r * 0.22;
        keyId++;
        for (const [ox, oz] of [[-0.04, -0.04], [0.04, -0.04], [-0.04, 0.04], [0.04, 0.04]]) {
          pos.push(kx + ox, 0.01, kz + oz); col.push(...keyCol); type.push(1); order.push(keyId);
          scat.push(...scatterPoint()); rnd.push(Math.random());
        }
      }
    }
    // Lid frame.
    line(lid(-W / 2, 0), lid(W / 2, 0), 0.045, body, 0);
    line(lid(W / 2, 0), lid(W / 2, H), 0.045, body, 0);
    line(lid(W / 2, H), lid(-W / 2, H), 0.045, body, 0);
    line(lid(-W / 2, H), lid(-W / 2, 0), 0.045, body, 0);
    // Faint screen glow fill.
    for (let i = 0; i < 260; i++) {
      const [x, y, z] = lid(rand(-1.38, 1.38), rand(0.1, H - 0.1));
      pos.push(x, y, z + 0.005); col.push(0.45, 0.28, 0.85); type.push(3); order.push(0);
      scat.push(...scatterPoint()); rnd.push(Math.random());
    }
    // Code, one dot per character, in typing order.
    const cw = 2.6 / 48, lh = 0.17;
    let idx = 0;
    CODE.forEach((src, row) => {
      const words = src.split(/(\b)/);
      let colIdx = 0;
      words.forEach(w => {
        const isKw = KEYWORDS.has(w);
        const isType = /^[A-Z]/.test(w);
        for (const ch of w) {
          if (ch !== ' ') {
            const c = isKw ? [0.78, 0.52, 1.0] : isType ? [1.0, 0.62, 0.86] : /[a-z0-9_]/i.test(ch) ? [0.92, 0.9, 0.98] : [0.62, 0.55, 0.72];
            const [x, y, z] = lid(-1.3 + colIdx * cw, H - 0.22 - row * lh);
            pos.push(x, y, z + 0.01); col.push(...c); type.push(2); order.push(idx++);
            scat.push(...scatterPoint()); rnd.push(Math.random());
          }
          colIdx++;
        }
      });
    });
    codeDots = idx;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3));
    geo.setAttribute('aType', new THREE.Float32BufferAttribute(type, 1));
    geo.setAttribute('aOrder', new THREE.Float32BufferAttribute(order, 1));
    geo.setAttribute('aScatter', new THREE.Float32BufferAttribute(scat, 3));
    geo.setAttribute('aRand', new THREE.Float32BufferAttribute(rnd, 1));
    const pts = new THREE.Points(geo, laptopMat);
    pts.frustumCulled = false;
    laptop.add(pts);
    // In front of and to the right of the bust, turned so the screen faces
    // both the viewer and the face.
    laptop.position.set(0.55, -2.6, 1.5);
    laptop.rotation.y = -0.3;
    laptop.scale.setScalar(0.8);
  }
  buildLaptop();

  // ── Scroll keyframes ───────────────────────────────────────────────
  // x/y: rig offset · z: camera distance (zoom) · s: scale · o: opacity
  // scatter: portrait dissolved into dust · lap: laptop assembled
  // look: head turned down to the laptop
  let keys = [];
  const $ = s => document.querySelector(s);
  function layoutKeys() {
    const vh = window.innerHeight;
    const small = isSmall();
    const top = el => (el ? el.getBoundingClientRect().top + window.scrollY : 0);
    const about = $('.about'), what = $('.whatido'), career = $('.career'), contact = $('.contact');
    const maxScroll = document.documentElement.scrollHeight - vh;
    const k = (at, st) => ({ at: Math.min(at, maxScroll), ...st });
    const X = v => (small ? 0 : v);
    keys = [
      k(0,                                    { x: X(0),    y: small ? 0.1 : -0.15, z: 7.2, s: 1,    o: 1,    scatter: 0, lap: 0, look: 0 }),
      k(top(about),                           { x: X(2.4),  y: 0.15,  z: 4.6, s: 1,    o: small ? 0.3 : 0.45, scatter: 0, lap: 0, look: 0 }),
      k(top(what) + vh * 0.15,                { x: X(-2.15), y: small ? 0.3 : 0.02, z: 8.8, s: 0.72, o: small ? 0.55 : 1, scatter: 0, lap: 1, look: 1 }),
      k(top(what) + (what ? what.offsetHeight : 0) - vh, { x: X(-2.15), y: small ? 0.3 : 0.02, z: 8.8, s: 0.72, o: small ? 0.55 : 1, scatter: 0, lap: 1, look: 1 }),
      k(top(career) + vh * 0.25,              { x: X(0),    y: 0,     z: 9,   s: 1,    o: 0.22, scatter: 1, lap: 0, look: 0 }),
      k(top(contact) - vh * 0.9,              { x: X(0),    y: 0,     z: 9,   s: 1,    o: 0.22, scatter: 1, lap: 0, look: 0 }),
      k(top(contact) - vh * 0.3,              { x: X(3.1),  y: -0.1,  z: 8,   s: 0.85, o: small ? 0.35 : 0.85, scatter: 0, lap: 0, look: 0 }),
    ].sort((a, b) => a.at - b.at);
  }

  const smooth = t => t * t * (3 - 2 * t);
  function stateAt(y) {
    if (!keys.length) return null;
    if (y <= keys[0].at) return keys[0];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (y <= b.at) {
        const t = smooth((y - a.at) / Math.max(b.at - a.at, 1));
        const out = {};
        for (const key of ['x', 'y', 'z', 's', 'o', 'scatter', 'lap', 'look']) out[key] = a[key] + (b[key] - a[key]) * t;
        return out;
      }
    }
    return keys[keys.length - 1];
  }

  // ── Resize, input ──────────────────────────────────────────────────
  let width = 1, height = 1, zoomFactor = 1;
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    // Keep the bust inside narrow (portrait) screens.
    zoomFactor = camera.aspect < 0.9 ? Math.min(2.1, 1.05 / camera.aspect) : 1;
    // Point sizes are in pixels, so scale them with the canvas: otherwise
    // dots merge into a blob on small screens and go sparse on big ones.
    // (Tuned at 900px tall; narrow screens are zoomed out by zoomFactor too.)
    const base = 22 * (height / 900) * zoomFactor;
    portraitMat.uniforms.uSize.value = base;
    laptopMat.uniforms.uSize.value = base;
    layoutKeys();
  }
  resize();
  window.addEventListener('resize', resize);
  if ('ResizeObserver' in window) new ResizeObserver(layoutKeys).observe(document.body);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', e => {
    mouse.tx = (e.clientX / width) * 2 - 1;
    mouse.ty = (e.clientY / height) * 2 - 1;
  });

  // Form the portrait once the loader wipes away.
  let formStart = null;
  document.addEventListener('site:ready', () => { formStart = performance.now(); layoutKeys(); });

  // ── Loop ───────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  const cur = { x: 0, y: 0, z: 12, s: 1, o: 1, scatter: 0, lap: 0, look: 0 };
  let nextBlink = 2.5, blinkAt = -1, typeClock = 0;

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    const target = stateAt(window.scrollY) || cur;
    const ease = 1 - Math.pow(0.002, dt);          // frame-rate independent lerp
    for (const k in cur) cur[k] += (target[k] - cur[k]) * ease;

    // Intro: dust → face, with the camera pulling in from far away.
    const form = formStart === null ? 0 : reduceMotion ? 1 : Math.min(1, (performance.now() - formStart) / 2600);
    const formE = 1 - Math.pow(1 - form, 3);
    portraitMat.uniforms.uForm.value = formE;
    portraitMat.uniforms.uScatter.value = cur.scatter;
    portraitMat.uniforms.uTime.value = t;
    camera.position.z = (cur.z + (1 - formE) * 6) * zoomFactor;

    rig.position.set(cur.x, cur.y, 0);
    rig.scale.setScalar(cur.s);
    canvas.style.opacity = cur.o.toFixed(3);

    // Head: follows the cursor; while typing, it turns down to the laptop
    // and bobs slightly with the keystrokes.
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    const free = 1 - cur.look;
    const idle = reduceMotion ? 0 : 1;
    head.rotation.y = (mouse.x * 0.42 + Math.sin(t * 0.5) * 0.06 * idle) * free + cur.look * 0.36;
    head.rotation.x = (mouse.y * 0.22 + Math.sin(t * 0.37) * 0.03 * idle) * free + cur.look * (0.3 + Math.sin(t * 7.5) * 0.012 * idle);
    head.rotation.z = -mouse.x * 0.04 * free;

    // Blink every few seconds (not while looking down at the screen).
    if (!reduceMotion) {
      if (t > nextBlink) { blinkAt = t; nextBlink = t + rand(2.8, 6); }
      const bt = (t - blinkAt) / 0.18;
      portraitMat.uniforms.uBlink.value = bt >= 0 && bt <= 1 ? Math.sin(bt * Math.PI) * free : 0;
    }

    // Laptop + typing loop: type the snippet, hold, clear, repeat.
    laptopMat.uniforms.uAssemble.value = cur.lap;
    laptopMat.uniforms.uTime.value = t;
    const typing = cur.lap > 0.85 ? 1 : 0;
    laptopMat.uniforms.uTyping.value = typing && !reduceMotion ? 1 : 0;
    if (cur.lap > 0.6) {
      typeClock += dt * (reduceMotion ? 1000 : 24);
      if (typeClock > codeDots + 60) typeClock = 0;
    } else {
      typeClock = 0;
    }
    laptopMat.uniforms.uTyped.value = reduceMotion && cur.lap > 0.6 ? codeDots : typeClock;
    laptop.visible = cur.lap > 0.01;

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  const img = new Image();
  img.onload = () => { buildPortrait(img); done(); requestAnimationFrame(frame); };
  img.onerror = () => { done(); requestAnimationFrame(frame); };
  img.src = 'assets/headshot.png';
})();
