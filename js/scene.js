// 3D character hero. A CC0 Quaternius character ("Hoodie Character", Ultimate
// Modular Men pack) with its own CC0 clips (Wave, Idle...), plus procedural
// layers: a head that tracks the cursor, a seated typing pose at a glowing
// desk, and camera framing driven by page-section scroll keyframes.
// The particle-portrait version is kept in scene-particles.js.
(function () {
  const canvas = document.getElementById('scene');
  const done = () => { window.__sceneReady = true; };
  if (!canvas || typeof THREE === 'undefined' || !THREE.GLTFLoader) { done(); return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    canvas.remove();
    done();
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = () => window.innerWidth < 760;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall() ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);

  // Lighting: dim fill, a soft key from the front, violet rims from behind
  // so the silhouette glows against the black page.
  scene.add(new THREE.HemisphereLight(0xb9a6ff, 0x0d0814, 0.45));
  const key = new THREE.DirectionalLight(0xfff1ea, 0.95);
  key.position.set(1.4, 2.4, 3.0);
  scene.add(key);
  const rimL = new THREE.DirectionalLight(0xb47dff, 2.6);
  rimL.position.set(-2.4, 2.0, -2.0);
  scene.add(rimL);
  const rimR = new THREE.DirectionalLight(0x7442ff, 2.2);
  rimR.position.set(2.6, 1.3, -2.2);
  scene.add(rimR);

  const rig = new THREE.Group();          // character + desk set
  scene.add(rig);

  // ── Desk set (shown while seated) ──────────────────────────────────
  const desk = new THREE.Group();
  const lin = hex => new THREE.Color(hex).convertSRGBToLinear();
  const deskMat = new THREE.MeshStandardMaterial({ color: lin(0x15111c), roughness: 0.35, metalness: 0.3 });
  const glowMat = new THREE.MeshBasicMaterial({ color: lin(0x9b6bff) });
  const laptopMat = new THREE.MeshStandardMaterial({ color: lin(0x2a2236), roughness: 0.3, metalness: 0.6 });
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512; screenCanvas.height = 320;
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  screenTex.encoding = THREE.sRGBEncoding;
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false });
  const screenLight = new THREE.PointLight(0x8f6bff, 0, 1.6, 2);
  const parts = {};
  function buildDesk() {
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.045, 0.72), deskMat);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.006, 0.006), glowMat);
    edge.position.set(0, 0.0, 0.36);
    const legGeo = new THREE.BoxGeometry(0.04, 1, 0.04);
    const legs = [[-0.7, -0.32], [0.7, -0.32], [-0.7, 0.32], [0.7, 0.32]].map(([x, z]) => {
      const l = new THREE.Mesh(legGeo, deskMat); l.position.set(x, -0.5, z); return l;
    });
    const deskTop = new THREE.Group();
    deskTop.add(top, edge, ...legs);
    parts.deskTop = deskTop;

    // Laptop: base + lid hinged at the far edge, screen facing the character.
    const laptop = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.018, 0.28), laptopMat);
    const lid = new THREE.Group();
    const lidShell = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.012), laptopMat);
    lidShell.position.y = 0.14;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.39, 0.25), screenMat);
    screen.position.set(0, 0.14, -0.007);
    screen.rotation.y = Math.PI;                 // faces the character (-z)
    const logo = new THREE.Mesh(new THREE.CircleGeometry(0.03, 24), glowMat);
    logo.position.set(0, 0.15, 0.007);           // glowing badge on the lid back
    lid.add(lidShell, screen, logo);
    lid.position.set(0, 0.009, 0.14);
    lid.rotation.x = 0.32;                       // tilted back, away from the character
    laptop.add(base, lid);
    parts.laptop = laptop;

    // Chair: seat + back.
    const chair = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.5), deskMat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.05), deskMat);
    back.position.set(0, 0.32, -0.26);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 12), deskMat);
    stem.position.y = -0.22;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.006, 8, 48), glowMat);
    ring.rotation.x = Math.PI / 2; ring.position.y = -0.42;
    chair.add(seat, back, stem, ring);
    parts.chair = chair;

    desk.add(deskTop, laptop, chair, screenLight);
    desk.visible = false;
    rig.add(desk);
  }
  buildDesk();

  // Code that "types" onto the laptop screen (a canvas texture).
  const CODE = [
    ['k', 'contract '], ['t', 'Warden'], ['p', ' {'], ['\n'],
    ['p', '  '], ['k', 'function '], ['f', 'execute'], ['p', '(Trade t) '], ['k', 'external'], ['p', ' {'], ['\n'],
    ['p', '    '], ['k', 'if '], ['p', '(t.size > cap) '], ['k', 'revert '], ['t', 'OverCap'], ['p', '();'], ['\n'],
    ['p', '    '], ['k', 'if '], ['p', '('], ['f', 'drawdown'], ['p', '() > limit) '], ['f', 'trip'], ['p', '();'], ['\n'],
    ['p', '    venue.'], ['f', 'swap'], ['p', '(t);'], ['\n'],
    ['p', '  }'], ['\n'], ['p', '}'],
  ];
  const CODE_COLORS = { k: '#c58aff', t: '#ff9ed8', f: '#8fd3ff', p: '#d8d2e2' };
  const CODE_LEN = CODE.reduce((n, [, s]) => n + (s ? s.length : 0), 0);
  let lastTyped = -1;
  function drawScreen(typed, t) {
    if (typed === lastTyped && Math.floor(t * 2) % 2 === Math.floor((t - 0.016) * 2) % 2) return;
    lastTyped = typed;
    const g = screenCanvas.getContext('2d');
    g.fillStyle = '#0d0a14';
    g.fillRect(0, 0, 512, 320);
    g.fillStyle = 'rgba(155,107,255,0.18)';
    g.fillRect(0, 0, 512, 22);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(14 + i * 16, 11, 4.5, 0, 7); g.fill(); });
    g.font = '15px Consolas, "Courier New", monospace';
    let x = 14, y = 50, left = typed;
    for (const [kind, s] of CODE) {
      if (kind === '\n') { if (left <= 0) break; x = 14; y += 24; continue; }
      if (left <= 0) break;
      const part = s.slice(0, left);
      left -= s.length;
      g.fillStyle = CODE_COLORS[kind];
      g.fillText(part, x, y);
      x += g.measureText(part).width;
    }
    if (Math.floor(t * 2) % 2 === 0) { g.fillStyle = '#c58aff'; g.fillRect(x + 1, y - 13, 8, 16); }
    screenTex.needsUpdate = true;
  }
  drawScreen(0, 0);

  // ── Character ──────────────────────────────────────────────────────
  const loader = new THREE.GLTFLoader();
  const COLORS = { Skin: 0x5a3626, Hair: 0x121014, Eyebrows: 0x121014, Purple: 0x3d1c8f, LightBlue: 0x191622, White: 0xe9e4f0 };

  let model = null, mixer = null, current = null;
  // animPose: each bone's rotation as last written by the animation mixer,
  // before any procedural layer (see frame()).
  const bones = {}, rest = {}, animPose = {}, actions = {};
  const seated = { drop: 0 };

  loader.load('assets/avatar/hoodie.glb', gltf => {
    model = gltf.scene;
    model.traverse(o => {
      if (o.isMesh) {
        o.frustumCulled = false;
        if (COLORS[o.material.name] !== undefined) o.material.color.copy(lin(COLORS[o.material.name]));
        o.material.roughness = 0.75;
        o.material.metalness = 0.0;
        o.material.flatShading = false;
        // The source is flat-shaded; weld vertices and rebuild normals so
        // the low-poly shapes read softer under the rim lights.
        if (THREE.BufferGeometryUtils) {
          const geo = o.geometry.clone();
          geo.deleteAttribute('normal');
          const merged = THREE.BufferGeometryUtils.mergeVertices(geo, 1e-4);
          merged.computeVertexNormals();
          o.geometry = merged;
        }
        o.material.needsUpdate = true;
      }
      if (o.isBone) { bones[o.name] = o; }
    });
    const box = new THREE.Box3().setFromObject(model);
    const s = 1.8 / (box.max.y - box.min.y);
    model.scale.setScalar(s);
    model.position.y = -box.min.y * s;
    rig.add(model);
    for (const name in bones) { rest[name] = bones[name].quaternion.clone(); animPose[name] = bones[name].quaternion.clone(); }

    mixer = new THREE.AnimationMixer(model);
    for (const clip of gltf.animations) {
      const name = clip.name.replace('CharacterArmature|', '');
      if (name === 'Wave' || name === 'Idle' || name === 'Idle_Neutral') smoothClip(clip);
      actions[name] = mixer.clipAction(clip);
    }
    actions.Wave.setLoop(THREE.LoopOnce, 1);
    actions.Wave.clampWhenFinished = true;

    calibrateSeat();
    play('Idle', 0);                             // never show the bind (T) pose
    window.__avatarDebug = { model, bones, actions, rig, camera, desk, parts, wave: () => wave(), WAVE };
    done();
  }, undefined, err => { console.error('avatar load failed', err); done(); });

  // The source clips are keyed at 24fps with linear interpolation, so a fast
  // motion like the waving forearm turns direction in hard corners and the
  // odd single-key snap: visibly "skippy", worse when slowed down. Low-pass
  // the keys (removes snaps), then resample at 60fps along a Catmull-Rom
  // curve (rounds the corners).
  function smoothClip(clip, fps = 60) {
    for (const track of clip.tracks) {
      const size = track.getValueSize();
      const t = track.times, n = t.length;
      if (n < 4) continue;
      const v = Float32Array.from(track.values);
      if (size === 4) {
        // Keep consecutive quaternions in the same hemisphere so blending
        // components doesn't take the long way round.
        for (let i = 1; i < n; i++) {
          let dot = 0;
          for (let c = 0; c < 4; c++) dot += v[(i - 1) * 4 + c] * v[i * 4 + c];
          if (dot < 0) for (let c = 0; c < 4; c++) v[i * 4 + c] *= -1;
        }
      }
      // Two passes of a [1 2 1]/4 filter; endpoints kept so loops still close.
      for (let pass = 0; pass < 2; pass++) {
        const prev = Float32Array.from(v);
        for (let i = 1; i < n - 1; i++) {
          for (let c = 0; c < size; c++) {
            v[i * size + c] = 0.25 * prev[(i - 1) * size + c] + 0.5 * prev[i * size + c] + 0.25 * prev[(i + 1) * size + c];
          }
        }
      }
      const dur = t[n - 1], count = Math.max(2, Math.round(dur * fps) + 1);
      const times = new Float32Array(count), values = new Float32Array(count * size);
      let seg = 0;
      for (let k = 0; k < count; k++) {
        const time = (k / (count - 1)) * dur;
        while (seg < n - 2 && t[seg + 1] < time) seg++;
        const u = Math.min(1, Math.max(0, (time - t[seg]) / Math.max(t[seg + 1] - t[seg], 1e-6)));
        const i0 = Math.max(0, seg - 1), i1 = seg, i2 = seg + 1, i3 = Math.min(n - 1, seg + 2);
        const u2 = u * u, u3 = u2 * u;
        let len = 0;
        for (let c = 0; c < size; c++) {
          const p0 = v[i0 * size + c], p1 = v[i1 * size + c], p2 = v[i2 * size + c], p3 = v[i3 * size + c];
          const val = 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3);
          values[k * size + c] = val;
          len += val * val;
        }
        if (size === 4) { len = Math.sqrt(len) || 1; for (let c = 0; c < 4; c++) values[k * 4 + c] /= len; }
        times[k] = time;
      }
      track.times = times;
      track.values = values;
    }
    clip.resetDuration();
  }

  function play(name, fade = 0.4) {
    const next = actions[name];
    if (!next || next === current) return;
    next.reset().setEffectiveWeight(1).fadeIn(fade).play();
    if (current) current.fadeOut(fade);
    current = next;
  }
  const baseFor = sit => (sit > 0.5 ? 'Idle_Neutral' : 'Idle');

  // Wave, blended in from the idle. The way back is handled in frame():
  // it starts blending to idle while the arm is still coming down, instead
  // of waiting for the clip's last frame and snapping.
  // The clip's raise looks good but its hand swing is quick and uneven, so
  // the wave is driven in three phases: the clip raises the arm (its time is
  // scrubbed with easing, then held), a procedural sine sway does the
  // waving, and a crossfade back to idle lowers the arm.
  // Blends are done by hand with eased weights rather than three.js
  // fadeIn/fadeOut, which ramp linearly and so start/stop the arm with a jolt.
  const WAVE = { holdT: 0.78, blendIn: 0.55, raise: 1.0, sway: 1.6, hz: 1.9, amp: 0.42, lower: 1.0 };
  let waveT = -1, waveBase = null;               // seconds since the wave began; -1 = not waving
  function wave() {
    if (!actions.Wave || reduceMotion || !model || waveT >= 0) return;
    waveBase = current || actions.Idle;
    waveBase.stopFading().setEffectiveWeight(1);
    const w = actions.Wave;
    w.stopFading().reset().play();
    w.paused = true;                             // time is set by hand in frame()
    w.time = 0;
    w.setEffectiveWeight(0);
    current = w;
    waveT = 0;
  }
  const easeInOut = x => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const clamp01 = x => Math.min(1, Math.max(0, x));

  // Rotate a bone about an axis in the CHARACTER's frame (+z = facing),
  // independent of the bones' own local axes. Must be applied parent-first.
  // Using world axes instead breaks as soon as the rig turns toward the
  // camera: one arm stays on the keyboard and the other swings off it.
  const _q = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _axis = new THREE.Vector3();
  function rotWorld(bone, x, y, z, angle) {
    if (!bone || !angle) return;
    bone.parent.getWorldQuaternion(_pq);
    _q.setFromAxisAngle(_axis.set(x, y, z).normalize().applyQuaternion(rig.quaternion), angle);
    const local = _pq.clone().invert().multiply(_q).multiply(_pq);
    bone.quaternion.premultiply(local);
    bone.updateMatrixWorld(true);
  }

  // The idle clip holds the arms asymmetrically; while seated, ease the
  // arm chain back to the (symmetric) rest pose before posing the typing.
  const ARM = /^(Body|Hips|Abdomen|Torso|Chest|Shoulder|UpperArm|LowerArm|Wrist|Index|Middle|Ring|Pinky|Thumb)/;
  function calmArms(w) {
    if (w <= 0.001) return;
    for (const n in bones) if (ARM.test(n)) bones[n].quaternion.slerp(rest[n], w);
  }

  // Per-side forearm pitch correction, solved in calibrateSeat() so both
  // hands rest at the same height (the rig's arms don't respond identically).
  const armTrim = { L: 0, R: 0 };

  // Seated typing pose, layered over the idle clip. `w` blends it in.
  // The model faces +z, so "forward" is +z and pitching forward is a
  // negative rotation about world x.
  function applySeated(w, t, typing) {
    if (w <= 0.001) return;
    const B = bones;
    rotWorld(B.Abdomen, 1, 0, 0, 0.12 * w);                 // lean in a touch
    for (const side of ['L', 'R']) {
      rotWorld(B['UpperLeg' + side], 1, 0, 0, -1.5 * w);    // thighs forward
      rotWorld(B['LowerLeg' + side], 1, 0, 0, 1.45 * w);    // shins down
      rotWorld(B['Foot' + side], 1, 0, 0, 0.1 * w);
      const sgn = side === 'L' ? 1 : -1;
      // Arms forward and bent so the hands rest on the keyboard.
      rotWorld(B['UpperArm' + side], 1, 0, 0, -0.75 * w);
      rotWorld(B['UpperArm' + side], 0, 0, 1, -0.18 * sgn * w);
      // Keystrokes only ever LIFT the hand off its rest position on the
      // keyboard, so the hands can't dip through the desk.
      const lift = typing ? Math.max(0, Math.sin(t * 14 + (side === 'L' ? 0 : 1.7))) * 0.07 + Math.max(0, Math.sin(t * 23 + sgn)) * 0.04 : 0;
      rotWorld(B['LowerArm' + side], 1, 0, 0, (-0.85 - lift + armTrim[side]) * w);
      rotWorld(B['LowerArm' + side], 0, 1, 0, -0.35 * sgn * w);   // forearms angle in toward the keyboard
      rotWorld(B['Wrist' + side], 1, 0, 0, (0.25 + lift * 0.6) * w);
      for (const f of ['Index', 'Middle', 'Ring', 'Pinky']) {
        const press = typing ? Math.max(0, Math.sin(t * 17 + f.length * 1.3 + sgn)) * 0.35 : 0;
        rotWorld(B[f + '1' + side], 1, 0, 0, (0.35 + press) * w);
        rotWorld(B[f + '2' + side], 1, 0, 0, 0.3 * w);
      }
    }
  }

  // Measure where the seated pose puts the hips and hands, then place the
  // chair, desk and laptop around them. The hands are sampled over a full
  // typing cycle on top of the same idle clip used at runtime, and the
  // keyboard goes just under the LOWEST fingertip seen, so nothing clips.
  const TIPS = ['Index4', 'Middle4', 'Ring4', 'Pinky4', 'Thumb3'];
  function calibrateSeat() {
    for (const n in bones) bones[n].quaternion.copy(rest[n]);
    model.updateMatrixWorld(true);
    const footRest = new THREE.Vector3(); bones.FootL.getWorldPosition(footRest);
    applySeated(1, 0, false);
    model.updateMatrixWorld(true);
    const foot = new THREE.Vector3(), hips = new THREE.Vector3();
    bones.FootL.getWorldPosition(foot);
    bones.Hips.getWorldPosition(hips);
    seated.drop = foot.y - footRest.y;                 // lower the body so feet stay on the floor
    const hipY = hips.y - seated.drop;
    parts.chair.position.set(hips.x, hipY - 0.1, hips.z - 0.02);

    // A throwaway mixer, so the main one's write-cache isn't left believing
    // these sampled poses are already on the bones.
    const calMixer = new THREE.AnimationMixer(model);
    const idle = calMixer.clipAction(actions.Idle_Neutral.getClip());
    idle.play();
    const p = new THREE.Vector3();
    // Balance: find each forearm's pitch trim so both middle fingertips sit
    // at the same height (the lower of the two), by bisection.
    const tipY = side => {
      for (const b in bones) bones[b].quaternion.copy(rest[b]);
      calMixer.setTime(0);
      calmArms(1);
      model.updateMatrixWorld(true);
      applySeated(1, 0, false);
      model.updateMatrixWorld(true);
      bones['Middle4' + side].getWorldPosition(p);
      return p.y;
    };
    const goal = Math.min(tipY('L'), tipY('R'));
    for (const side of ['L', 'R']) {
      let lo = -0.6, hi = 0.8;
      for (let i = 0; i < 24; i++) {
        armTrim[side] = (lo + hi) / 2;
        if (tipY(side) > goal) lo = armTrim[side]; else hi = armTrim[side];
      }
    }
    let minY = Infinity, sx = 0, sz = 0, n = 0;
    const span = Math.max(idle.getClip().duration, 2.4);
    for (let i = 0; i < 96; i++) {
      const ts = (i / 96) * span;
      for (const b in bones) bones[b].quaternion.copy(rest[b]);
      calMixer.setTime(ts);
      calmArms(1);
      model.updateMatrixWorld(true);
      applySeated(1, ts, true);
      model.updateMatrixWorld(true);
      for (const side of ['L', 'R']) for (const tip of TIPS) {
        const bone = bones[tip + side];
        if (!bone) continue;
        bone.getWorldPosition(p);
        minY = Math.min(minY, p.y);
        sx += p.x; sz += p.z; n++;
      }
    }
    idle.stop();
    calMixer.uncacheRoot(model);

    const surface = minY - seated.drop - 0.006;        // keyboard top, just under the lowest fingertip (runtime keeps ~2cm clearance)
    const handX = sx / n, handZ = sz / n;
    parts.laptop.position.set(handX, surface - 0.009, handZ + 0.04);
    const deskY = surface - 0.018;                     // desk surface = laptop underside
    parts.deskTop.position.set(0, deskY - 0.0225, handZ + 0.18);
    // Desk legs reach the floor.
    parts.deskTop.children.filter(c => c.geometry && c.geometry.parameters && c.geometry.parameters.height === 1).forEach(l => {
      const h = deskY - 0.045; l.scale.y = h; l.position.y = -h / 2;
    });
    screenLight.position.set(parts.laptop.position.x, surface + 0.25, handZ + 0.05);
    for (const n in bones) bones[n].quaternion.copy(rest[n]);
  }

  // ── Scroll keyframes ───────────────────────────────────────────────
  // cam/look: camera position and target · o: canvas opacity
  // sit: seated at the desk (0..1)
  let keys = [];
  function layoutKeys() {
    const vh = window.innerHeight;
    const small = isSmall();
    const top = el => (el ? el.getBoundingClientRect().top + window.scrollY : 0);
    const $ = s => document.querySelector(s);
    const about = $('.about'), what = $('.whatido'), career = $('.career'), contact = $('.contact');
    const maxScroll = document.documentElement.scrollHeight - vh;
    const k = (at, st) => ({ at: Math.min(at, maxScroll), ...st });
    const S = (a, b) => (small ? b : a);
    keys = [
      k(0,                       { cx: 0,              cy: 1.22, cz: S(3.6, 5.2), lx: 0,              ly: 1.12, lz: 0, ry: 0,     o: 1,           sit: 0 }),
      k(top(about),              { cx: S(-0.62, 0),    cy: 1.6,  cz: S(2.05, 2.6), lx: S(-0.62, 0),    ly: 1.5,  lz: 0, ry: 0.15,  o: S(0.55, 0.3), sit: 0 }),
      k(top(what) + vh * 0.15,   { cx: S(1.45, 0),     cy: 1.75, cz: S(5.4, 6.4), lx: S(1.12, 0),     ly: 1.2,  lz: 0, ry: -0.3,  o: S(1, 0.5),   sit: 1 }),
      k(top(what) + (what ? what.offsetHeight : 0) - vh, { cx: S(1.45, 0), cy: 1.75, cz: S(5.4, 6.4), lx: S(1.12, 0), ly: 1.2, lz: 0, ry: -0.3, o: S(1, 0.5), sit: 1 }),
      k(top(career) + vh * 0.25, { cx: 0,              cy: 1.3,  cz: 4.2,          lx: 0,              ly: 1.0,  lz: 0, ry: -0.3,  o: 0.12,        sit: 1 }),
      k(top(contact) - vh * 0.9, { cx: 0,              cy: 1.3,  cz: 4.2,          lx: 0,              ly: 1.0,  lz: 0, ry: -0.3,  o: 0.12,        sit: 1 }),
      k(top(contact) - vh * 0.3, { cx: S(-1.55, 0),    cy: 1.3,  cz: S(4.4, 5.2), lx: S(-1.55, 0),    ly: 1.15,  lz: 0, ry: 0.1,   o: S(0.95, 0.35), sit: 0 }),
    ].sort((a, b) => a.at - b.at);
  }
  const smooth = t => t * t * (3 - 2 * t);
  const FIELDS = ['cx', 'cy', 'cz', 'lx', 'ly', 'lz', 'ry', 'o', 'sit'];
  function stateAt(y) {
    if (!keys.length) return null;
    if (y <= keys[0].at) return keys[0];
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (y <= b.at) {
        const t = smooth((y - a.at) / Math.max(b.at - a.at, 1));
        const out = {};
        for (const f of FIELDS) out[f] = a[f] + (b[f] - a[f]) * t;
        return out;
      }
    }
    return keys[keys.length - 1];
  }

  // ── Resize / input ─────────────────────────────────────────────────
  let width = 1, height = 1;
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
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

  // Wave hello once the loader has wiped away; wave again at the contact
  // section on the way in.
  let started = false, wavedAtContact = false;
  document.addEventListener('site:ready', () => {
    started = true;
    layoutKeys();
    // Wait for the loader's wipe (0.9s) to finish so the whole wave is seen.
    setTimeout(wave, 950);
  });

  // ── Loop ───────────────────────────────────────────────────────────
  const state = { cx: 0, cy: 1.22, cz: 6, lx: 0, ly: 1.12, lz: 0, ry: 0, o: 1, sit: 0 };
  const look = new THREE.Vector3();
  const clock = new THREE.Clock();
  let typeClock = 0;

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const target = stateAt(window.scrollY);
    const ease = 1 - Math.pow(0.004, dt);
    if (target) for (const f of FIELDS) state[f] += (target[f] - state[f]) * ease;

    camera.position.set(state.cx, state.cy, state.cz);
    look.set(state.lx, state.ly, state.lz);
    camera.lookAt(look);
    canvas.style.opacity = state.o.toFixed(3);
    rig.rotation.y = state.ry;

    if (model && mixer) {
      // Pick the base clip for the current pose (unless mid-wave).
      if (started && current !== actions.Wave) play(baseFor(state.sit));
      const atContact = target && target.sit < 0.2 && window.scrollY > (keys[keys.length - 1].at - window.innerHeight * 0.4);
      if (atContact && !wavedAtContact && !reduceMotion) { wavedAtContact = true; wave(); }
      if (waveT >= 0) {
        waveT += dt;
        const W = actions.Wave;
        W.time = WAVE.holdT * easeInOut(waveT / WAVE.raise);                    // raise, then hold
        const into = easeInOut(waveT / WAVE.blendIn);
        const out = easeInOut((waveT - WAVE.raise - WAVE.sway) / WAVE.lower);   // lower via blend to idle
        const ww = into * (1 - out);
        W.setEffectiveWeight(ww);
        waveBase.setEffectiveWeight(1 - ww);
        if (out >= 1) {                                                          // done
          W.stop();
          current = waveBase;
          waveT = -1;
        }
      }
      if (!atContact && window.scrollY < keys[keys.length - 1].at - window.innerHeight) wavedAtContact = false;

      // Undo last frame's procedural layers by restoring the last ANIMATED
      // pose, not the bind pose: three.js only writes a bone when its value
      // changes, so a held clip frame (or a constant track) would otherwise
      // never be re-applied and the bone would snap to the bind pose (this
      // dropped the arm mid-wave).
      for (const n in bones) bones[n].quaternion.copy(animPose[n]);
      mixer.update(dt);
      for (const n in bones) animPose[n].copy(bones[n].quaternion);
      model.updateMatrixWorld(true);

      // Procedural hand sway while the arm is held up: an even sine, eased
      // in and out, swinging the forearm about the character's forward axis.
      if (waveT > WAVE.raise && waveT < WAVE.raise + WAVE.sway) {
        const u = (waveT - WAVE.raise) / WAVE.sway;
        const env = Math.sin(Math.PI * u) ** 2;   // zero amplitude AND zero speed at both ends
        const ang = WAVE.amp * env * Math.sin(2 * Math.PI * WAVE.hz * (waveT - WAVE.raise));
        rotWorld(bones.LowerArmL, 0, 0, 1, ang);
        rotWorld(bones.WristL, 0, 0, 1, -ang * 0.35);
      }

      const sit = smooth(Math.min(1, Math.max(0, state.sit)));
      const typing = sit > 0.9 && !reduceMotion;
      calmArms(sit);
      model.updateMatrixWorld(true);
      applySeated(sit, t, typing);
      model.position.y = model.userData.baseY !== undefined ? model.userData.baseY : (model.userData.baseY = model.position.y);
      model.position.y = model.userData.baseY - seated.drop * sit;

      // Head: follow the cursor while standing; look down at the screen
      // while seated (with a little bob as the keys go).
      const free = 1 - sit;
      const yaw = (mouse.x * 0.55 + (reduceMotion ? 0 : Math.sin(t * 0.6) * 0.05)) * free;
      const pitch = mouse.y * 0.3 * free + sit * (0.32 + (typing ? Math.sin(t * 9) * 0.015 : 0));
      rotWorld(bones.Neck, 0, 1, 0, yaw * 0.4);
      rotWorld(bones.Neck, 1, 0, 0, pitch * 0.4);
      rotWorld(bones.Head, 0, 1, 0, yaw * 0.6);
      rotWorld(bones.Head, 1, 0, 0, pitch * 0.6);

      // Desk set fades in with the sit.
      desk.visible = sit > 0.02;
      desk.scale.setScalar(0.6 + 0.4 * sit);
      screenLight.intensity = 1.6 * sit;
      if (typing) {
        typeClock += dt * 20;
        if (typeClock > CODE_LEN + 40) typeClock = 0;
      } else if (sit < 0.5) typeClock = 0;
      if (desk.visible) drawScreen(Math.floor(typeClock), t);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
