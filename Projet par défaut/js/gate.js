/* ============================================================
   CALISTHENIX â€” le Portail
   gate.js â€” anneaux 3D, membrane d'Ã©nergie, poussiÃ¨re orbitale.
   WebGL 1 sans dÃ©pendance ; repli Canvas 2D ; respect du
   mouvement rÃ©duit et de la visibilitÃ© de l'onglet.
   Expose CX.gate.create(canvas).
   ============================================================ */
(function () {
  "use strict";

  const CX = (window.CX = window.CX || {});

  const REDUCED = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------
     MathÃ©matiques minimales (matrices colonne-major)
     ------------------------------------------------------------ */
  function perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    const m = new Float32Array(16);
    m[0] = f / aspect;
    m[5] = f;
    m[10] = (far + near) * nf;
    m[11] = -1;
    m[14] = 2 * far * near * nf;
    return m;
  }
  function lookAt(eye, center, up) {
    let zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
    let l = Math.hypot(zx, zy, zz) || 1;
    zx /= l; zy /= l; zz /= l;
    let xx = up[1] * zz - up[2] * zy;
    let xy = up[2] * zx - up[0] * zz;
    let xz = up[0] * zy - up[1] * zx;
    l = Math.hypot(xx, xy, xz) || 1;
    xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy;
    const yy = zz * xx - zx * xz;
    const yz = zx * xy - zy * xx;
    const m = new Float32Array(16);
    m[0] = xx; m[1] = yx; m[2] = zx; m[3] = 0;
    m[4] = xy; m[5] = yy; m[6] = zy; m[7] = 0;
    m[8] = xz; m[9] = yz; m[10] = zz; m[11] = 0;
    m[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
    m[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
    m[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
    m[15] = 1;
    return m;
  }
  function mul(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c += 1) {
      for (let r = 0; r < 4; r += 1) {
        o[c * 4 + r] =
          a[r] * b[c * 4] +
          a[4 + r] * b[c * 4 + 1] +
          a[8 + r] * b[c * 4 + 2] +
          a[12 + r] * b[c * 4 + 3];
      }
    }
    return o;
  }
  function rotX(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
  }
  function rotY(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]);
  }
  function rotZ(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }
  function scale(s) {
    return new Float32Array([s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1]);
  }
  function normalFrom(model) {
    const m = new Float32Array(9);
    const cols = [
      [model[0], model[1], model[2]],
      [model[4], model[5], model[6]],
      [model[8], model[9], model[10]],
    ];
    cols.forEach((col, i) => {
      const l = Math.hypot(col[0], col[1], col[2]) || 1;
      m[i * 3] = col[0] / l;
      m[i * 3 + 1] = col[1] / l;
      m[i * 3 + 2] = col[2] / l;
    });
    return m;
  }

  /* ------------------------------------------------------------
     GÃ©omÃ©tries
     ------------------------------------------------------------ */
  function torus(radius, tube, radialSeg, tubularSeg, arc, start) {
    const ARC = arc === undefined ? Math.PI * 2 : arc;
    const START = start || 0;
    const RS = radialSeg || 120;
    const TS = tubularSeg || 26;
    const pos = [];
    const nrm = [];
    const uv = [];
    const idx = [];
    for (let i = 0; i <= RS; i += 1) {
      const u = START + (i / RS) * ARC;
      const cu = Math.cos(u), su = Math.sin(u);
      for (let j = 0; j <= TS; j += 1) {
        const v = (j / TS) * Math.PI * 2;
        const cv = Math.cos(v), sv = Math.sin(v);
        pos.push((radius + tube * cv) * cu, (radius + tube * cv) * su, tube * sv);
        nrm.push(cv * cu, cv * su, sv);
        uv.push(i / RS, j / TS);
      }
    }
    for (let i = 0; i < RS; i += 1) {
      for (let j = 0; j < TS; j += 1) {
        const a = i * (TS + 1) + j;
        const b = a + TS + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    return { pos: new Float32Array(pos), nrm: new Float32Array(nrm), uv: new Float32Array(uv), idx: new Uint16Array(idx) };
  }

  function disc(segments) {
    const SEG = segments || 128;
    const pos = [0, 0, 0];
    const uv = [0, 0];
    const idx = [];
    for (let i = 0; i <= SEG; i += 1) {
      const a = (i / SEG) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      pos.push(c, s, 0);
      uv.push(c, s);
    }
    for (let i = 1; i <= SEG; i += 1) idx.push(0, i, i + 1);
    return { pos: new Float32Array(pos), uv: new Float32Array(uv), idx: new Uint16Array(idx) };
  }

  /* ------------------------------------------------------------
     Shaders
     ------------------------------------------------------------ */
  const TORUS_VS = `
    attribute vec3 aPos;
    attribute vec3 aNrm;
    attribute vec2 aUv;
    uniform mat4 uProj, uView, uModel;
    uniform mat3 uNorm;
    uniform float uTime;
    varying vec3 vN;
    varying vec3 vView;
    varying float vPulse;
    void main() {
      vec4 wp = uModel * vec4(aPos, 1.0);
      vec4 vp = uView * wp;
      vN = uNorm * aNrm;
      vView = -vp.xyz;
      float band = 0.5 + 0.5 * sin(aUv.x * 18.8495559 - uTime * 1.35);
      float band2 = 0.5 + 0.5 * sin(aUv.x * 6.2831853 + uTime * 0.55 + 1.7);
      vPulse = pow(band, 7.0) * 0.9 + pow(band2, 10.0) * 0.5;
      gl_Position = uProj * vp;
    }
  `;

  const TORUS_FS = `
    precision highp float;
    varying vec3 vN;
    varying vec3 vView;
    varying float vPulse;
    uniform vec3 uColA, uColB;
    uniform float uAlpha;
    void main() {
      vec3 n = normalize(vN);
      vec3 v = normalize(vView);
      float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.1);
      float key = clamp(dot(n, normalize(vec3(-0.45, 0.72, 0.55))), 0.0, 1.0);
      vec3 col = mix(uColA, uColB, clamp(fres * 1.2, 0.0, 1.0));
      col *= 0.22 + 0.85 * key + 0.4 * fres;
      col += uColB * (fres * 0.55 + vPulse * 0.85);
      float a = uAlpha * (0.3 + 0.85 * fres + 0.22 * key + vPulse * 0.5);
      gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    }
  `;

  const DISC_VS = `
    attribute vec3 aPos;
    attribute vec2 aUv;
    uniform mat4 uProj, uView, uModel;
    varying vec2 vUv;
    void main() {
      vUv = aUv;
      gl_Position = uProj * uView * uModel * vec4(aPos, 1.0);
    }
  `;

  const DISC_FS = `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime, uAlpha;
    uniform vec3 uColA, uColB;
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = p * 2.03 + vec2(3.1, 1.7);
        a *= 0.5;
      }
      return v;
    }
    void main() {
      vec2 p = vUv;
      float r = length(p);
      if (r > 1.0) discard;
      float ang = atan(p.y, p.x);
      float turb = fbm(vec2(cos(ang + uTime * 0.16), sin(ang + uTime * 0.16)) * 2.4 + uTime * 0.05);
      vec2 q = p * 2.7 + vec2(cos(ang * 3.0 + uTime * 0.4), sin(ang * 2.0 - uTime * 0.3)) * 0.22;
      float n = fbm(q + turb * 0.75);
      float edge = smoothstep(1.0, 0.55, r);
      float core = smoothstep(0.64, 0.0, r);
      float rim = smoothstep(0.8, 0.995, r) * 0.6;
      vec3 col = mix(uColB, uColA, clamp(n * 0.9 + core * 0.35, 0.0, 1.0));
      float a = (edge * (0.09 + 0.32 * n * n) + core * 0.3 + rim * 0.22) * uAlpha;
      gl_FragColor = vec4(col, a);
    }
  `;

  const DUST_VS = `
    attribute vec4 aOrbit;
    attribute vec2 aLook;
    uniform mat4 uProj, uView, uModel;
    uniform float uTime, uPixel;
    varying float vTint;
    varying float vFade;
    void main() {
      float ang = aOrbit.y + uTime * aOrbit.z;
      vec3 p = vec3(cos(ang) * aOrbit.x, sin(ang) * aOrbit.x * 0.9,
                    aOrbit.w + sin(uTime * 0.7 + aOrbit.y * 3.0) * 0.06);
      vec4 mv = uView * uModel * vec4(p, 1.0);
      gl_Position = uProj * mv;
      float depth = max(0.2, -mv.z);
      gl_PointSize = aLook.x * uPixel * (9.0 / depth);
      vTint = aLook.y;
      vFade = clamp(1.0 - (depth - 3.4) * 0.2, 0.18, 1.0);
    }
  `;

  const DUST_FS = `
    precision mediump float;
    varying float vTint;
    varying float vFade;
    uniform vec3 uColA, uColB;
    void main() {
      vec2 d = gl_PointCoord - vec2(0.5);
      float r = length(d);
      if (r > 0.5) discard;
      float a = smoothstep(0.5, 0.04, r) * vFade * 0.85;
      gl_FragColor = vec4(mix(uColA, uColB, vTint), a);
    }
  `;

  function compile(gl, type, source) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("[Portail] shader:", gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function program(gl, vsSource, fsSource) {
    const vs = compile(gl, gl.VERTEX_SHADER, vsSource);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn("[Portail] link:", gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  /* ------------------------------------------------------------
     Rendu WebGL
     ------------------------------------------------------------ */
  function createWebGL(canvas) {
    let gl = null;
    try {
      gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        powerPreference: "high-performance",
      });
    } catch (err) {
      gl = null;
    }
    if (!gl) return null;

    const progRing = program(gl, TORUS_VS, TORUS_FS);
    const progDisc = program(gl, DISC_VS, DISC_FS);
    const progDust = program(gl, DUST_VS, DUST_FS);
    if (!progRing || !progDisc || !progDust) return null;

    function makeMesh(data, attributes) {
      const mesh = { count: data.idx.length };
      mesh.vbo = gl.createBuffer();
      const parts = [];
      if (attributes.pos) parts.push({ name: "aPos", size: 3, data: data.pos });
      if (attributes.nrm) parts.push({ name: "aNrm", size: 3, data: data.nrm });
      if (attributes.uv) parts.push({ name: "aUv", size: 2, data: data.uv });
      const stride = parts.reduce((s, p) => s + p.size, 0);
      const interleaved = new Float32Array((data.pos.length / 3) * stride);
      let offset = 0;
      for (let i = 0; i < data.pos.length / 3; i += 1) {
        for (const p of parts) {
          for (let k = 0; k < p.size; k += 1) interleaved[offset++] = p.data[i * p.size + k];
        }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
      gl.bufferData(gl.ARRAY_BUFFER, interleaved, gl.STATIC_DRAW);
      mesh.ibo = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.idx, gl.STATIC_DRAW);
      mesh.parts = parts;
      mesh.stride = stride;
      return mesh;
    }

    function bindMesh(mesh, prog, names) {
      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo);
      let offset = 0;
      for (const part of mesh.parts) {
        const name = names[part.name] || part.name;
        const loc = gl.getAttribLocation(prog, name);
        if (loc >= 0) {
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, part.size, gl.FLOAT, false, mesh.stride * 4, offset * 4);
        }
        offset += part.size;
      }
    }

    function drawMesh(mesh, prog, mode) {
      bindMesh(mesh, prog, { aPos: "aPos", aNrm: "aNrm", aUv: "aUv" });
      gl.drawElements(mode || gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
    }

    /* anneaux */
    const ringCore = makeMesh(torus(1.31, 0.046, 140, 28), { pos: 1, nrm: 1, uv: 1 });
    const ringInner = makeMesh(torus(1.045, 0.011, 140, 18), { pos: 1, nrm: 1, uv: 1 });
    const ringOrbit = makeMesh(torus(1.66, 0.007, 150, 14), { pos: 1, nrm: 1, uv: 1 });
    const ringArc = makeMesh(torus(1.52, 0.019, 92, 18, Math.PI * 1.28, 0.4), { pos: 1, nrm: 1, uv: 1 });
    const membrane = makeMesh(disc(160), { pos: 1, uv: 1 });

    /* poussiÃ¨re */
    const DUST = 320;
    const dust = new Float32Array(DUST * 6);
    for (let i = 0; i < DUST; i += 1) {
      const radius = 0.9 + Math.random() * 1.15;
      dust[i * 6] = radius;
      dust[i * 6 + 1] = Math.random() * Math.PI * 2;
      dust[i * 6 + 2] = (0.05 + Math.random() * 0.22) * (Math.random() > 0.5 ? 1 : -1);
      dust[i * 6 + 3] = (Math.random() - 0.5) * 0.5;
      dust[i * 6 + 4] = 0.8 + Math.random() * 2.4;
      dust[i * 6 + 5] = Math.random();
    }
    const dustVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dustVbo);
    gl.bufferData(gl.ARRAY_BUFFER, dust, gl.STATIC_DRAW);

    const uniforms = new Map();
    [progRing, progDisc, progDust].forEach((p) => {
      uniforms.set(p, {
        proj: gl.getUniformLocation(p, "uProj"),
        view: gl.getUniformLocation(p, "uView"),
        model: gl.getUniformLocation(p, "uModel"),
        norm: gl.getUniformLocation(p, "uNorm"),
        time: gl.getUniformLocation(p, "uTime"),
        colA: gl.getUniformLocation(p, "uColA"),
        colB: gl.getUniformLocation(p, "uColB"),
        alpha: gl.getUniformLocation(p, "uAlpha"),
        pixel: gl.getUniformLocation(p, "uPixel"),
      });
    });

    const COL_A = [0.37, 0.91, 1.0];
    const COL_B = [0.61, 0.48, 1.0];
    const CAM = [0, 0, 4.7];
    const view = lookAt(CAM, [0, 0, 0], [0, 1, 0]);

    const state = {
      t: 0,
      mx: 0,
      my: 0,
      tx: 0,
      ty: 0,
      proj: perspective((42 * Math.PI) / 180, 1, 0.1, 40),
      w: 0,
      h: 0,
    };

    const api = {
      resize() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = Math.max(1, Math.round(rect.width * dpr));
        const h = Math.max(1, Math.round(rect.height * dpr));
        if (w === state.w && h === state.h) return;
        state.w = w;
        state.h = h;
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        state.proj = perspective((42 * Math.PI) / 180, w / h, 0.1, 40);
      },
      pointer(nx, ny) {
        state.tx = nx;
        state.ty = ny;
      },
      render(dt) {
        state.t += dt;
        state.mx += (state.tx - state.mx) * Math.min(1, dt * 3);
        state.my += (state.ty - state.my) * Math.min(1, dt * 3);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

        const t = state.t;
        const tilt = mul(rotY(state.mx * 0.26), rotX(state.my * 0.18));

        /* membrane */
        gl.useProgram(progDisc);
        const du = uniforms.get(progDisc);
        gl.uniformMatrix4fv(du.proj, false, state.proj);
        gl.uniformMatrix4fv(du.view, false, view);
        gl.uniformMatrix4fv(du.model, false, mul(tilt, rotZ(t * 0.02)));
        gl.uniform1f(du.time, t);
        gl.uniform1f(du.alpha, 1);
        gl.uniform3fv(du.colA, COL_A);
        gl.uniform3fv(du.colB, COL_B);
        drawMesh(membrane, progDisc);

        /* anneaux */
        gl.useProgram(progRing);
        const ru = uniforms.get(progRing);
        gl.uniformMatrix4fv(ru.proj, false, state.proj);
        gl.uniformMatrix4fv(ru.view, false, view);
        gl.uniform1f(ru.time, t);
        gl.uniform3fv(ru.colA, COL_A);
        gl.uniform3fv(ru.colB, COL_B);

        function ring(mesh, model, alpha) {
          gl.uniformMatrix4fv(ru.model, false, model);
          gl.uniformMatrix3fv(ru.norm, false, normalFrom(model));
          gl.uniform1f(ru.alpha, alpha);
          drawMesh(mesh, progRing);
        }

        /* halo extÃ©rieur */
        ring(ringOrbit, mul(tilt, mul(rotX(1.22 + Math.sin(t * 0.21) * 0.06), mul(rotZ(-t * 0.1), rotY(0.18)))), 0.5);
        ring(ringArc, mul(tilt, mul(rotX(0.32), rotZ(t * 0.06 + 0.4))), 0.75);
        ring(ringInner, mul(tilt, mul(rotX(-0.14), rotZ(-t * 0.04))), 0.6);

        /* halo du cÅ“ur, puis cÅ“ur */
        ring(ringCore, mul(tilt, mul(rotX(0.16 + Math.sin(t * 0.3) * 0.02), scale(1.035))), 0.14);
        ring(ringCore, mul(tilt, rotX(0.16)), 1.0);

        /* poussiÃ¨re */
        gl.useProgram(progDust);
        const pu = uniforms.get(progDust);
        gl.uniformMatrix4fv(pu.proj, false, state.proj);
        gl.uniformMatrix4fv(pu.view, false, view);
        gl.uniformMatrix4fv(pu.model, false, tilt);
        gl.uniform1f(pu.time, t);
        gl.uniform1f(pu.pixel, Math.min(window.devicePixelRatio || 1, 1.5));
        gl.uniform3fv(pu.colA, [0.55, 0.95, 1.0]);
        gl.uniform3fv(pu.colB, [0.72, 0.55, 1.0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, dustVbo);
        const aOrbit = gl.getAttribLocation(progDust, "aOrbit");
        const aLook = gl.getAttribLocation(progDust, "aLook");
        gl.enableVertexAttribArray(aOrbit);
        gl.vertexAttribPointer(aOrbit, 4, gl.FLOAT, false, 24, 0);
        gl.enableVertexAttribArray(aLook);
        gl.vertexAttribPointer(aLook, 2, gl.FLOAT, false, 24, 16);
        gl.drawArrays(gl.POINTS, 0, DUST);
      },
      dispose() {
        [ringCore, ringInner, ringOrbit, ringArc, membrane].forEach((m) => {
          gl.deleteBuffer(m.vbo);
          gl.deleteBuffer(m.ibo);
        });
        gl.deleteBuffer(dustVbo);
        gl.deleteProgram(progRing);
        gl.deleteProgram(progDisc);
        gl.deleteProgram(progDust);
      },
    };

    api.resize();
    return api;
  }

  /* ------------------------------------------------------------
     Repli Canvas 2D
     ------------------------------------------------------------ */
  function createCanvas2D(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    let w = 1, h = 1, dpr = 1;
    const stars = Array.from({ length: 90 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: 0.86 + Math.random() * 0.72,
      s: (0.04 + Math.random() * 0.16) * (Math.random() > 0.5 ? 1 : -1),
      z: (Math.random() - 0.5) * 0.3,
      size: 0.6 + Math.random() * 1.7,
      tint: Math.random(),
    }));
    const state = { t: 0, mx: 0, my: 0, tx: 0, ty: 0 };

    const api = {
      resize() {
        const rect = canvas.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        w = Math.max(1, rect.width);
        h = Math.max(1, rect.height);
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      },
      pointer(nx, ny) {
        state.tx = nx;
        state.ty = ny;
      },
      render(dt) {
        state.t += dt;
        state.mx += (state.tx - state.mx) * Math.min(1, dt * 3);
        state.my += (state.ty - state.my) * Math.min(1, dt * 3);
        const t = state.t;
        const cx = w / 2 + state.mx * w * 0.012;
        const cy = h / 2 + state.my * h * 0.012;
        const R = Math.min(w, h) * 0.36;
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";

        /* membrane */
        const mem = ctx.createRadialGradient(cx, cy, R * 0.04, cx, cy, R * 0.96);
        mem.addColorStop(0, "rgba(150, 240, 255, 0.34)");
        mem.addColorStop(0.42, "rgba(75, 141, 255, 0.2)");
        mem.addColorStop(0.78, "rgba(155, 123, 255, 0.12)");
        mem.addColorStop(1, "rgba(4, 7, 12, 0)");
        ctx.fillStyle = mem;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 0.97, 0, Math.PI * 2);
        ctx.fill();

        /* filaments */
        for (let i = 0; i < 5; i += 1) {
          const rot = t * 0.06 + i * 1.26;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(120, 225, 255, ${0.07 + i * 0.012})`;
          ctx.lineWidth = 1;
          ctx.ellipse(cx, cy, R * (0.3 + i * 0.12), R * (0.24 + i * 0.11), rot, 0, Math.PI * 2);
          ctx.stroke();
        }

        /* anneaux */
        const rings = [
          { r: 1.0, ry: 0.97, rot: 0.03, w: 2.2, a: 0.55, c: "95, 233, 255" },
          { r: 0.8, ry: 0.78, rot: -0.04, w: 1, a: 0.4, c: "155, 123, 255" },
          { r: 1.26, ry: 1.2, rot: 1.22 + Math.sin(t * 0.21) * 0.05, w: 0.9, a: 0.3, c: "120, 190, 255" },
        ];
        rings.forEach((ring) => {
          const grad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
          grad.addColorStop(0, `rgba(${ring.c}, ${ring.a})`);
          grad.addColorStop(0.5, `rgba(230, 252, 255, ${ring.a * 0.7})`);
          grad.addColorStop(1, `rgba(95, 233, 255, ${ring.a * 0.45})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = ring.w;
          ctx.beginPath();
          ctx.ellipse(cx, cy, R * ring.r, R * ring.ry, ring.rot, 0, Math.PI * 2);
          ctx.stroke();
        });

        /* arc brisÃ© */
        ctx.beginPath();
        ctx.strokeStyle = "rgba(150, 240, 255, 0.5)";
        ctx.lineWidth = 1.6;
        ctx.ellipse(cx, cy, R * 1.14, R * 1.1, 0.34, t * 0.1 + 0.4, t * 0.1 + 0.4 + 2.1);
        ctx.stroke();

        /* poussiÃ¨re */
        stars.forEach((p) => {
          const ang = p.a + t * p.s;
          const rx = R * p.r * 1.06;
          const ry = R * p.r * 0.94;
          const x = cx + Math.cos(ang) * rx;
          const y = cy + Math.sin(ang) * ry + p.z * R * 0.2;
          const alpha = 0.25 + (Math.sin(ang * 2 + t) + 1) * 0.2;
          ctx.fillStyle =
            p.tint > 0.5
              ? `rgba(175, 150, 255, ${alpha})`
              : `rgba(160, 240, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, p.size * (Math.min(w, h) / 600), 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalCompositeOperation = "source-over";
      },
      dispose() {},
    };

    api.resize();
    return api;
  }

  /* ------------------------------------------------------------
     ContrÃ´leur commun
     ------------------------------------------------------------ */
  CX.gate = {
    create(canvas) {
      if (!canvas) return null;
      let renderer = createWebGL(canvas);
      const mode = renderer ? "webgl" : "canvas2d";
      if (!renderer) renderer = createCanvas2D(canvas);
      if (!renderer) return null;

      let raf = 0;
      let last = 0;
      let active = true;
      let visible = true;
      const reduced = REDUCED();

      function frame(now) {
        raf = 0;
        if (!active || !visible) return;
        const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
        last = now;
        renderer.render(reduced ? 0 : dt);
        if (reduced) return;
        raf = window.requestAnimationFrame(frame);
      }

      function play() {
        if (reduced || !active || !visible || raf) return;
        last = 0;
        raf = window.requestAnimationFrame(frame);
      }

      function pause() {
        if (raf) window.cancelAnimationFrame(raf);
        raf = 0;
      }

      const onPointer = (event) => {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        renderer.pointer(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          ((event.clientY - rect.top) / rect.height) * 2 - 1
        );
      };
      const onVisibility = () => {
        visible = !document.hidden;
        if (visible) play();
        else pause();
      };
      const onResize = () => {
        renderer.resize();
        if (reduced) renderer.render(0);
      };

      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("resize", onResize);

      if (typeof ResizeObserver === "function") {
        const ro = new ResizeObserver(onResize);
        ro.observe(canvas);
        canvas.__cxRO = ro;
      } else {
        window.setTimeout(onResize, 60);
      }

      renderer.resize();
      if (reduced) renderer.render(0);
      else play();

      return {
        mode,
        play,
        pause,
        resize: onResize,
        setActive(next) {
          active = Boolean(next);
          if (active) play();
          else pause();
        },
        destroy() {
          pause();
          window.removeEventListener("pointermove", onPointer);
          document.removeEventListener("visibilitychange", onVisibility);
          window.removeEventListener("resize", onResize);
          if (canvas.__cxRO) canvas.__cxRO.disconnect();
          renderer.dispose();
        },
      };
    },
  };
})();
