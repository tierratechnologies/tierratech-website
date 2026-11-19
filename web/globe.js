// Turns the hero circle into a lit 3D globe that can be spun on any axis.
// Without JavaScript, or if anything here fails, the static logo circle stays in place.

const AUCKLAND = [-36.848, 174.763];
// Where Auckland sits in the logo, as a fraction of the globe radius (x right, y up).
const HOME_X = 0.4655;
const HOME_Y = -0.2333;
const HOME_TILT = (7 * Math.PI) / 180;
const RADIUS = 0.435; // Globe radius as a fraction of the circle's width.
const RETURN_DELAY = 10000;
const SURFACE_DOTS = 7000;

const CAMERA = 3.6; // Camera distance in globe radii. Closer gives stronger perspective.
const FOCAL = Math.sqrt(CAMERA * CAMERA - 1);
const HORIZON = 1 / CAMERA; // Points with a smaller z are out of sight.
const LAND_HEIGHT = 1.012; // Land sits slightly above the surface.
const LEVELS = [0.06, 0.12, 0.22, 0.38, 0.6, 0.92]; // Dot opacity, from shadow to full light.

const circle = document.querySelector('.hero__circle');
const ring = circle?.querySelector('img');
const marker = circle?.querySelector('.hero__marker');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const toVector = (lat, lon) => {
  const a = (lat * Math.PI) / 180;
  const o = (lon * Math.PI) / 180;
  return [Math.cos(a) * Math.sin(o), Math.sin(a), Math.cos(a) * Math.cos(o)];
};
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const unit = (a) => {
  const l = Math.hypot(...a) || 1;
  return a.map((v) => v / l);
};

// The sun stays fixed while the globe turns beneath it. It lights the right-hand side,
// leaving the headline over the globe's shadow.
const LIGHT = unit([0.8, -0.28, 0.53]);

// The point on the sphere seen at x, y, measured in globe radii from the centre.
const unproject = (x, y) => {
  const a = (x * x + y * y) / (FOCAL * FOCAL);
  const b = a * CAMERA;
  const z = (b + Math.sqrt(Math.max(0, b * b - (a + 1) * (a * CAMERA * CAMERA - 1)))) / (a + 1);
  const k = (CAMERA - z) / FOCAL;
  return [x * k, y * k, z];
};

// Quaternions are [w, x, y, z].
const multiply = (a, b) => [
  a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
  a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
  a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
  a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
];
const normalise = (q) => {
  const l = Math.hypot(...q) || 1;
  return q.map((v) => v / l);
};
const fromAxisAngle = (axis, angle) => {
  const s = Math.sin(angle / 2);
  return [Math.cos(angle / 2), axis[0] * s, axis[1] * s, axis[2] * s];
};
const between = (from, to) => normalise([1 + dot(from, to), ...cross(from, to)]);
const slerp = (a, b, t) => {
  let c = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  const target = c < 0 ? b.map((v) => -v) : b;
  c = Math.abs(c);
  if (c > 0.9995) return normalise(a.map((v, i) => v + (target[i] - v) * t));
  const angle = Math.acos(c);
  const s = Math.sin(angle);
  const p = Math.sin((1 - t) * angle) / s;
  const r = Math.sin(t * angle) / s;
  return a.map((v, i) => v * p + target[i] * r);
};
const toMatrix = ([w, x, y, z]) => [
  1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y),
  2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x),
  2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y),
];
const fromBasis = (r) => {
  // r is a row-major rotation matrix.
  const trace = r[0] + r[4] + r[8];
  if (trace > 0) {
    const s = Math.sqrt(trace + 1) * 2;
    return normalise([s / 4, (r[7] - r[5]) / s, (r[2] - r[6]) / s, (r[3] - r[1]) / s]);
  }
  if (r[0] > r[4] && r[0] > r[8]) {
    const s = Math.sqrt(1 + r[0] - r[4] - r[8]) * 2;
    return normalise([(r[7] - r[5]) / s, s / 4, (r[1] + r[3]) / s, (r[2] + r[6]) / s]);
  }
  if (r[4] > r[8]) {
    const s = Math.sqrt(1 + r[4] - r[0] - r[8]) * 2;
    return normalise([(r[2] - r[6]) / s, (r[1] + r[3]) / s, s / 4, (r[5] + r[7]) / s]);
  }
  const s = Math.sqrt(1 + r[8] - r[0] - r[4]) * 2;
  return normalise([(r[3] - r[1]) / s, (r[2] + r[6]) / s, (r[5] + r[7]) / s, s / 4]);
};

// The resting pose: north up with the logo's slight tilt, Auckland where the logo has it.
const homePose = (auckland) => {
  const target = unproject(HOME_X, HOME_Y);
  const tangent = (normal, up) => unit(up.map((v, i) => v - normal[i] * dot(normal, up)));
  const sourceUp = tangent(auckland, [0, 1, 0]);
  const targetUp = tangent(target, [Math.sin(HOME_TILT), Math.cos(HOME_TILT), 0]);
  const s = [auckland, sourceUp, cross(auckland, sourceUp)];
  const t = [target, targetUp, cross(target, targetUp)];
  const m = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      m.push(t[0][row] * s[0][col] + t[1][row] * s[1][col] + t[2][row] * s[2][col]);
    }
  }
  return fromBasis(m);
};

async function start() {
  if (!circle || !ring || navigator.connection?.saveData) return;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const response = await fetch('/globe-data.json');
  if (!response.ok) return;
  const data = await response.json();

  const raw = Uint8Array.from(atob(data.land), (c) => c.charCodeAt(0));
  const packed = new Int16Array(raw.buffer);
  const count = packed.length / 2;
  const land = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const v = toVector((packed[i * 2] / 32767) * 90, (packed[i * 2 + 1] / 32767) * 180);
    land.set(v, i * 3);
    sizes[i] = 0.78 + (((Math.imul(i + 1, 2654435761) >>> 0) % 1000) / 1000) * 0.62;
  }
  // Evenly spread specks over the whole sphere, so the oceans have a surface too.
  const surface = new Float32Array(SURFACE_DOTS * 3);
  const surfaceSizes = new Float32Array(SURFACE_DOTS);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < SURFACE_DOTS; i++) {
    const hash = (Math.imul(i + 11, 2654435761) >>> 0) / 4294967296;
    const y = 1 - (2 * (i + 0.5)) / SURFACE_DOTS;
    const r = Math.sqrt(1 - y * y);
    const angle = i * goldenAngle + hash * 0.05;
    surface.set([Math.sin(angle) * r, y, Math.cos(angle) * r], i * 3);
    surfaceSizes[i] = 0.55 + hash * 0.5;
  }
  const islands = data.nz.map((flat) => {
    const points = [];
    for (let i = 0; i < flat.length; i += 2) points.push(toVector(flat[i], flat[i + 1]));
    return points;
  });

  const auckland = toVector(...AUCKLAND);
  const home = homePose(auckland);
  let pose = home;
  let width = 0;
  let cx = 0;
  let cy = 0;
  let radius = 0;
  let body = null;
  let glow = null;
  let frame = 0;
  let last = 0;
  let tween = null;
  let drag = null;
  let spin = null;
  let returnTimer = 0;

  const draw = () => {
    const m = toMatrix(pose);
    ctx.clearRect(0, 0, width, width);

    // Atmosphere, then the shaded body of the sphere.
    ctx.globalAlpha = 1;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, width);
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    const paths = LEVELS.map(() => new Path2D());
    const base = Math.max(0.8, radius * 0.0072);
    const scale = radius * FOCAL;

    const plot = (points, dotSizes, total, height, sizeFactor, shade, step = 1) => {
      for (let i = 0; i < total; i += step) {
        const px = points[i * 3];
        const py = points[i * 3 + 1];
        const pz = points[i * 3 + 2];
        const z = m[6] * px + m[7] * py + m[8] * pz;
        if (z <= HORIZON) continue;
        const x = m[0] * px + m[1] * py + m[2] * pz;
        const y = m[3] * px + m[4] * py + m[5] * pz;
        const k = (scale * height) / (CAMERA - z * height);
        const sx = cx + x * k;
        const sy = cy - y * k;
        const facing = (z - HORIZON) / (1 - HORIZON);
        const light = Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
        const level = shade(light, 1 - facing);
        if (level < 0) continue;
        // Dots lie flat on the surface, so they narrow towards the edge of the globe.
        const r = base * dotSizes[i] * sizeFactor * (0.82 + 0.3 * z);
        const narrow = r * Math.max(0.2, facing);
        const angle = Math.atan2(sy - cy, sx - cx);
        const path = paths[Math.min(LEVELS.length - 1, level)];
        path.moveTo(sx + narrow * Math.cos(angle), sy + narrow * Math.sin(angle));
        path.ellipse(sx, sy, narrow, r, angle, 0, Math.PI * 2);
      }
    };

    // Ocean dots too faint to notice are skipped, and small globes need only half of them.
    plot(
      surface,
      surfaceSizes,
      SURFACE_DOTS,
      1,
      1,
      (light, edge) => Math.floor((0.05 + 0.42 * light ** 1.5 + 0.5 * edge ** 2.6 * (0.35 + light)) * 6) || -1,
      width < 560 ? 2 : 1,
    );
    plot(land, sizes, count, LAND_HEIGHT, 1.06, (light, edge) =>
      Math.floor((0.2 + 0.8 * light ** 1.05 + 0.12 * edge ** 2) * 6),
    );

    ctx.fillStyle = '#fff';
    paths.forEach((path, i) => {
      ctx.globalAlpha = LEVELS[i];
      ctx.fill(path);
    });

    // New Zealand stays solid, as it is in the logo, and takes the light with everything else.
    const rotate = ([x, y, z]) => [
      m[0] * x + m[1] * y + m[2] * z,
      m[3] * x + m[4] * y + m[5] * z,
      m[6] * x + m[7] * y + m[8] * z,
    ];
    const spot = rotate(auckland);
    ctx.globalAlpha = 0.34 + 0.66 * Math.max(0, dot(spot, LIGHT));
    ctx.beginPath();
    for (const island of islands) {
      const points = island.map(rotate);
      if (!points.some((p) => p[2] > HORIZON)) continue;
      points.forEach(([x, y, z], i) => {
        let px;
        let py;
        if (z > HORIZON) {
          const k = (FOCAL * LAND_HEIGHT) / (CAMERA - z * LAND_HEIGHT);
          px = x * k;
          py = y * k;
        } else {
          // Points just over the horizon are held on the globe's edge.
          const l = Math.hypot(x, y) || 1;
          px = x / l;
          py = y / l;
        }
        if (i === 0) ctx.moveTo(cx + radius * px, cy - radius * py);
        else ctx.lineTo(cx + radius * px, cy - radius * py);
      });
      ctx.closePath();
    }
    ctx.fill();
    ctx.globalAlpha = 1;

    if (marker) {
      const facing = spot[2] > HORIZON + 0.04;
      marker.style.visibility = facing ? 'visible' : 'hidden';
      if (facing) {
        const k = (radius * FOCAL * LAND_HEIGHT) / (CAMERA - spot[2] * LAND_HEIGHT);
        marker.style.left = `${((cx + spot[0] * k) / width) * 100}%`;
        marker.style.top = `${((cy - spot[1] * k) / width) * 100}%`;
      }
    }
  };

  const tick = (now) => {
    frame = 0;
    const dt = Math.min(48, now - last || 16);
    last = now;
    if (tween) {
      const t = Math.min(1, (now - (tween.start ??= now)) / tween.duration);
      pose = tween.at(t * t * (3 - 2 * t));
      if (t === 1) tween = null;
    } else if (spin && !drag) {
      pose = normalise(multiply(fromAxisAngle(spin.axis, spin.speed * dt), pose));
      spin.speed *= Math.exp(-dt / 1300);
      if (spin.speed < 0.00006) {
        spin = null;
        scheduleReturn();
      }
    }
    draw();
    if (tween || (spin && !drag)) request();
  };
  const request = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const goHome = () => {
    const from = pose;
    tween = { duration: 1700, at: (t) => slerp(from, home, t) };
    last = 0;
    request();
  };
  const scheduleReturn = () => {
    clearTimeout(returnTimer);
    if (!reducedMotion.matches) returnTimer = setTimeout(goHome, RETURN_DELAY);
  };
  const interrupt = () => {
    clearTimeout(returnTimer);
    tween = null;
    spin = null;
  };

  const toSphere = (event) => {
    const box = canvas.getBoundingClientRect();
    const x = (event.clientX - box.left - cx) / radius;
    const y = (cy - (event.clientY - box.top)) / radius;
    const d = Math.hypot(x, y);
    if (d < 1) return unproject(x, y);
    // Past the edge the drag rolls the globe around the line of sight.
    const rim = Math.sqrt(1 - HORIZON * HORIZON);
    return [(x / d) * rim, (y / d) * rim, HORIZON];
  };

  canvas.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    const box = canvas.getBoundingClientRect();
    const distance = Math.hypot(event.clientX - box.left - cx, event.clientY - box.top - cy);
    if (distance > radius * 1.1) return;
    interrupt();
    drag = { point: toSphere(event), time: event.timeStamp, axis: [0, 1, 0], speed: 0 };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('is-dragging');
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const point = toSphere(event);
    const delta = between(drag.point, point);
    pose = normalise(multiply(delta, pose));
    const angle = 2 * Math.acos(Math.min(1, delta[0]));
    const dt = Math.max(1, event.timeStamp - drag.time);
    if (angle > 0.00001) {
      drag.axis = unit(delta.slice(1));
      drag.speed = drag.speed * 0.6 + (angle / dt) * 0.4;
    }
    drag.point = point;
    drag.time = event.timeStamp;
    request();
  });
  const endDrag = (event) => {
    if (!drag) return;
    const moving = event.timeStamp - drag.time < 90;
    if (moving && !reducedMotion.matches && drag.speed > 0.0001) {
      spin = { axis: drag.axis, speed: Math.min(0.012, drag.speed) };
    }
    drag = null;
    canvas.classList.remove('is-dragging');
    if (spin) {
      last = 0;
      request();
    } else {
      scheduleReturn();
    }
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  const KEYS = {
    ArrowLeft: [[0, 1, 0], -1],
    ArrowRight: [[0, 1, 0], 1],
    ArrowUp: [[1, 0, 0], -1],
    ArrowDown: [[1, 0, 0], 1],
    q: [[0, 0, 1], 1],
    e: [[0, 0, 1], -1],
  };
  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'Home') {
      event.preventDefault();
      interrupt();
      goHome();
      return;
    }
    const key = KEYS[event.key];
    if (!key) return;
    event.preventDefault();
    interrupt();
    pose = normalise(multiply(fromAxisAngle(key[0], key[1] * 0.14), pose));
    request();
    scheduleReturn();
  });

  const measure = () => {
    width = circle.getBoundingClientRect().width;
    cx = cy = width / 2;
    radius = width * RADIUS;
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(width * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // The brightest part of the sphere faces the light.
    const k = (radius * FOCAL) / (CAMERA - LIGHT[2]);
    const lightX = cx + LIGHT[0] * k * 0.82;
    const lightY = cy - LIGHT[1] * k * 0.82;
    body = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, radius * 1.72);
    body.addColorStop(0, '#4a4644');
    body.addColorStop(0.3, '#302d2c');
    body.addColorStop(0.62, '#1a1919');
    body.addColorStop(1, '#0d0c0c');

    const glowX = cx + LIGHT[0] * radius * 0.035;
    const glowY = cy - LIGHT[1] * radius * 0.035;
    glow = ctx.createRadialGradient(glowX, glowY, radius * 0.95, glowX, glowY, radius * 1.13);
    glow.addColorStop(0, 'rgba(150, 190, 255, 0.24)');
    glow.addColorStop(0.35, 'rgba(150, 190, 255, 0.07)');
    glow.addColorStop(1, 'rgba(150, 190, 255, 0)');
    draw();
  };

  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute(
    'aria-label',
    'Globe with New Zealand marked. Drag to spin it, or use the arrow keys, Q and E. Press Home to reset.',
  );
  ring.after(canvas);
  circle.classList.add('has-globe');
  document.querySelector('.hero__hint')?.removeAttribute('hidden');
  new ResizeObserver(measure).observe(circle);
  measure();

  // One slow turn on load shows that it is a globe, and ends back on the logo's pose.
  if (!reducedMotion.matches) {
    const axis = unit([0.16, 0.97, 0.18]);
    setTimeout(() => {
      if (drag || tween || spin) return;
      tween = { duration: 4200, at: (t) => normalise(multiply(fromAxisAngle(axis, t * Math.PI * 2), home)) };
      last = 0;
      request();
    }, 700);
  }
}

start().catch(() => {});
