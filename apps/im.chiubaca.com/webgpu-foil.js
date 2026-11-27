const shaderSource = /* wgsl */ `
  struct Uniforms {
    resolution: vec2f,
    oilTime: f32,
    circuitTime: f32,
    reduced: f32,
    padding: vec2f,
  };

  @group(0) @binding(0) var<uniform> uniforms: Uniforms;

  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
  };

  @vertex
  fn vs(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var positions = array<vec2f, 3>(
      vec2f(-1.0, -1.0),
      vec2f(3.0, -1.0),
      vec2f(-1.0, 3.0),
    );
    let position = positions[vertexIndex];
    var output: VertexOutput;
    output.position = vec4f(position, 0.0, 1.0);
    output.uv = vec2f(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
    return output;
  }

  fn screen(base: vec3f, layer: vec3f) -> vec3f {
    return vec3f(1.0) - (vec3f(1.0) - base) * (vec3f(1.0) - layer);
  }

  fn palette(value: f32) -> vec3f {
    let phase = fract(value) * 6.0;
    if (phase < 1.0) { return vec3f(1.0, 0.302, 0.427); }
    if (phase < 2.0) { return vec3f(1.0, 0.624, 0.110); }
    if (phase < 3.0) { return vec3f(1.0, 0.878, 0.400); }
    if (phase < 4.0) { return vec3f(0.180, 0.769, 0.714); }
    if (phase < 5.0) { return vec3f(0.263, 0.380, 0.933); }
    return vec3f(0.710, 0.090, 0.620);
  }

  fn saturate(color: vec3f, amount: f32) -> vec3f {
    let luma = dot(color, vec3f(0.213, 0.715, 0.072));
    return mix(vec3f(luma), color, amount);
  }

  fn hueRotate(color: vec3f) -> vec3f {
    let angle = radians(55.0);
    let cosine = cos(angle);
    let sine = sin(angle);
    return vec3f(
      dot(color, vec3f(
        0.213 + cosine * 0.787 - sine * 0.213,
        0.715 - cosine * 0.715 - sine * 0.715,
        0.072 - cosine * 0.072 + sine * 0.928,
      )),
      dot(color, vec3f(
        0.213 - cosine * 0.213 + sine * 0.143,
        0.715 + cosine * 0.285 + sine * 0.140,
        0.072 - cosine * 0.072 - sine * 0.283,
      )),
      dot(color, vec3f(
        0.213 - cosine * 0.213 - sine * 0.787,
        0.715 - cosine * 0.715 + sine * 0.715,
        0.072 + cosine * 0.928 + sine * 0.072,
      )),
    );
  }

  fn radial(uv: vec2f, center: vec2f, radius: vec2f, stop: f32) -> f32 {
    let distance = length((uv - center) / radius);
    return 1.0 - clamp(distance / stop, 0.0, 1.0);
  }

  fn screenOver(base: vec4f, source: vec3f, alpha: f32) -> vec4f {
    let backdrop = select(vec3f(0.0), base.rgb / max(base.a, 0.0001), base.a > 0.0001);
    let blended = vec3f(1.0) - (vec3f(1.0) - backdrop) * (vec3f(1.0) - source);
    let rgb = alpha * ((1.0 - base.a) * source + base.a * blended)
      + (1.0 - alpha) * base.rgb;
    return vec4f(rgb, alpha + base.a * (1.0 - alpha));
  }

  fn normalOver(base: vec4f, source: vec3f, alpha: f32) -> vec4f {
    return vec4f(source * alpha + base.rgb * (1.0 - alpha), alpha + base.a * (1.0 - alpha));
  }

  fn oilSlick(uv: vec2f) -> vec4f {
    let angle = atan2(uv.x - 0.5, -(uv.y - 0.5));
    let conic = palette(angle / 6.28318530718 + 200.0 / 360.0);
    var color = normalOver(vec4f(0.0), conic, 0.26);
    color = screenOver(color, vec3f(0.263, 0.380, 0.933), radial(uv, vec2f(0.82, 0.86), vec2f(0.80, 0.60), 0.60) * 0.36);
    color = screenOver(color, vec3f(0.180, 0.769, 0.714), radial(uv, vec2f(0.28, 0.82), vec2f(0.90, 0.70), 0.62) * 0.40);
    color = screenOver(color, vec3f(1.0, 0.820, 0.400), radial(uv, vec2f(0.78, 0.32), vec2f(0.80, 0.60), 0.60) * 0.34);
    color = screenOver(color, vec3f(1.0, 0.302, 0.427), radial(uv, vec2f(0.22, 0.18), vec2f(0.85, 0.65), 0.62) * 0.42);
    return color;
  }

  fn filterLayer(layer: vec4f, saturation: f32, brightness: f32, hue: f32) -> vec4f {
    let unpremultiplied = select(vec3f(0.0), layer.rgb / max(layer.a, 0.0001), layer.a > 0.0001);
    var color = clamp(saturate(unpremultiplied, saturation), vec3f(0.0), vec3f(1.0));
    color = clamp(color * brightness, vec3f(0.0), vec3f(1.0));
    if (hue > 0.0) {
      color = clamp(hueRotate(color), vec3f(0.0), vec3f(1.0));
    }
    return vec4f(color * layer.a, layer.a);
  }

  fn easeInOut(phase: f32) -> f32 {
    var estimate = clamp(phase, 0.0, 1.0);
    for (var iteration = 0; iteration < 5; iteration = iteration + 1) {
      let inverse = 1.0 - estimate;
      let x = 3.0 * inverse * inverse * estimate * 0.42
        + 3.0 * inverse * estimate * estimate * 0.58
        + estimate * estimate * estimate;
      let derivative = 3.0 * inverse * inverse * 0.42
        + 6.0 * inverse * estimate * (0.58 - 0.42)
        + 3.0 * estimate * estimate * (1.0 - 0.58);
      if (abs(derivative) > 0.0001) {
        estimate = estimate - (x - phase) / derivative;
      }
    }
    let inverse = 1.0 - estimate;
    return 3.0 * inverse * estimate * estimate + estimate * estimate * estimate;
  }

  fn segmentDistance(point: vec2f, start: vec2f, end: vec2f) -> f32 {
    let segment = end - start;
    let amount = clamp(dot(point - start, segment) / dot(segment, segment), 0.0, 1.0);
    return length(point - start - segment * amount);
  }

  fn stroke(distance: f32, width: f32) -> f32 {
    let halfWidth = width * 0.5;
    let antialias = max(fwidth(distance), 0.0001);
    return 1.0 - smoothstep(halfWidth, halfWidth + antialias * 1.5, distance);
  }

  fn filledCircle(point: vec2f, center: vec2f, radius: f32) -> f32 {
    let distance = length(point - center);
    let antialias = max(fwidth(distance), 0.0001) * 1.5;
    return 1.0 - smoothstep(radius - antialias, radius + antialias, distance);
  }

  fn circuits(uv: vec2f) -> f32 {
    let aspect = uniforms.resolution.y / uniforms.resolution.x;
    let point = fract(uv * vec2f(1.0 / 0.34, aspect / 0.34)) * 160.0;
    var mask = stroke(abs(point.y - 30.0), 0.8);
    mask = max(mask, stroke(abs(point.y - 120.0), 0.8));
    mask = max(mask, stroke(abs(point.x - 80.0), 0.8));
    mask = max(mask, stroke(segmentDistance(point, vec2f(40.0, 30.0), vec2f(40.0, 75.0)), 0.8));
    mask = max(mask, stroke(segmentDistance(point, vec2f(40.0, 75.0), vec2f(80.0, 75.0)), 0.8));
    mask = max(mask, stroke(segmentDistance(point, vec2f(120.0, 120.0), vec2f(120.0, 85.0)), 0.8));
    mask = max(mask, stroke(segmentDistance(point, vec2f(120.0, 85.0), vec2f(80.0, 85.0)), 0.8));
    mask = max(mask, filledCircle(point, vec2f(80.0, 30.0), 2.4));
    mask = max(mask, filledCircle(point, vec2f(80.0, 120.0), 2.4));
    mask = max(mask, filledCircle(point, vec2f(40.0, 75.0), 2.0));
    mask = max(mask, filledCircle(point, vec2f(120.0, 85.0), 2.0));
    return mask;
  }

  @fragment
  fn fs(input: VertexOutput) -> @location(0) vec4f {
    let slick = oilSlick(input.uv);
    let base = filterLayer(slick, 1.15, 0.9, 0.0);
    let shifted = filterLayer(slick, 1.5, 1.08, 55.0);
    let circuitMask = circuits(input.uv);
    var beforeOpacity = 0.24;
    var afterOpacity = 0.0;
    var circuitBefore = 0.08;
    var circuitAfter = 0.0;

    if (uniforms.reduced > 0.5) {
      beforeOpacity = 0.34;
      afterOpacity = 1.0;
      circuitBefore = 0.14;
      circuitAfter = 1.0;
    } else {
      let oilWave = easeInOut(fract(fract(uniforms.oilTime / 7.0) * 2.0));
      let circuitWave = easeInOut(fract(fract(uniforms.circuitTime / 5.5) * 2.0));
      beforeOpacity = 0.24 * (1.0 - oilWave);
      afterOpacity = 0.46 * oilWave;
      circuitBefore = 0.08 * (1.0 - circuitWave);
      circuitAfter = 0.24 * circuitWave;
    }

    let before = vec4f(base.rgb * beforeOpacity, base.a * beforeOpacity);
    let after = vec4f(shifted.rgb * afterOpacity, shifted.a * afterOpacity);
    let holo = after.rgb + before.rgb * (1.0 - after.a);
    let firstCircuit = circuitMask * circuitBefore;
    let secondCircuit = circuitMask * circuitAfter;
    let circuitColor = vec3f(secondCircuit + firstCircuit * (1.0 - secondCircuit));
    let color = screen(clamp(holo, vec3f(0.0), vec3f(1.0)), circuitColor);
    return vec4f(color, 1.0);
  }
`;

const animationSeconds = (animation, fallback) => {
  const currentTime = animation?.currentTime;
  if (typeof currentTime === "number") return currentTime / 1000;
  if (typeof currentTime?.value === "number") return currentTime.value / 1000;
  return fallback;
};

export const createHoloRenderer = async (canvas, card) => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!canvas || !navigator.gpu || reducedMotion.matches) return null;

  let adapter;
  try {
    adapter = await navigator.gpu.requestAdapter({ powerPreference: "low-power" });
  } catch {
    return null;
  }
  if (!adapter) return null;

  let device;
  try {
    device = await adapter.requestDevice();
  } catch {
    return null;
  }

  let context;
  try {
    context = canvas.getContext("webgpu");
  } catch {
    device.destroy();
    return null;
  }
  if (!context) {
    device.destroy();
    return null;
  }

  const format = navigator.gpu.getPreferredCanvasFormat();
  const uniforms = new Float32Array(8);
  let uniformBuffer;
  try {
    uniformBuffer = device.createBuffer({
      size: uniforms.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  } catch {
    device.destroy();
    return null;
  }

  let destroyed = false;
  let frame = null;
  let visible = !document.hidden;
  let ready = false;
  let observer = null;
  const startedAt = performance.timeOrigin;

  function handleDeviceError() {
    fallback();
  }

  const fallback = () => {
    if (destroyed) return;
    destroyed = true;
    if (frame !== null) cancelAnimationFrame(frame);
    observer?.disconnect();
    device.removeEventListener("uncapturederror", handleDeviceError);
    reducedMotion.removeEventListener("change", handleReducedMotion);
    document.removeEventListener("visibilitychange", handleVisibility);
    card.classList.remove("webgpu-ready");
    device.destroy();
  };

  const handleVisibility = () => {
    visible = !document.hidden;
    if (!visible && frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    } else if (visible) {
      requestRender();
    }
  };

  const handleReducedMotion = () => {
    if (reducedMotion.matches) fallback();
    else if (frame === null) requestRender();
  };

  const module = device.createShaderModule({
    label: "CHIUBACA holographic foil",
    code: shaderSource,
  });
  if (typeof module.getCompilationInfo === "function") {
    const info = await module.getCompilationInfo();
    if (info.messages.some((message) => message.type === "error")) {
      device.destroy();
      return null;
    }
  }

  device.pushErrorScope("validation");
  const pipeline = device.createRenderPipeline({
    label: "CHIUBACA foil pipeline",
    layout: "auto",
    vertex: { module, entryPoint: "vs" },
    fragment: { module, entryPoint: "fs", targets: [{ format }] },
    primitive: { topology: "triangle-list" },
  });
  const pipelineError = await device.popErrorScope();
  if (pipelineError) {
    device.destroy();
    return null;
  }

  let bindGroup;
  try {
    bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
    });
  } catch {
    device.destroy();
    return null;
  }

  if (reducedMotion.matches) {
    device.destroy();
    return null;
  }

  try {
    context.configure({ device, format, alphaMode: "opaque" });
  } catch {
    device.destroy();
    return null;
  }
  device.addEventListener("uncapturederror", handleDeviceError);

  const animations = document.getAnimations();
  const oilAnimation = animations.find(
    (animation) => animation.animationName === "oil-slick-fade-out",
  );
  const circuitAnimation = animations.find(
    (animation) => animation.animationName === "circuit-fade-out",
  );

  const resize = (entries) => {
    const contentRect = entries?.[0]?.contentRect;
    const layoutWidth = contentRect?.width ?? canvas.parentElement.clientWidth;
    const layoutHeight = contentRect?.height ?? canvas.parentElement.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(layoutWidth * pixelRatio));
    const height = Math.max(1, Math.round(layoutHeight * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    uniforms[0] = canvas.width;
    uniforms[1] = canvas.height;
    if (frame === null) requestRender();
  };

  const render = (now) => {
    frame = null;
    if (destroyed || !visible) return;
    if (reducedMotion.matches) {
      fallback();
      return;
    }

    const fallbackTime = (now - startedAt) / 1000;
    uniforms[2] = animationSeconds(oilAnimation, fallbackTime);
    uniforms[3] = animationSeconds(circuitAnimation, fallbackTime);
    uniforms[4] = reducedMotion.matches ? 1 : 0;

    try {
      device.queue.writeBuffer(uniformBuffer, 0, uniforms);
      const encoder = device.createCommandEncoder({ label: "CHIUBACA foil frame" });
      const pass = encoder.beginRenderPass({
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    } catch {
      fallback();
      return;
    }

    if (!ready) {
      ready = true;
      card.classList.add("webgpu-ready");
    }
    if (!reducedMotion.matches) frame = requestAnimationFrame(render);
  };

  function requestRender() {
    if (frame === null && !destroyed && visible) frame = requestAnimationFrame(render);
  }

  try {
    observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement);
  } catch {
    fallback();
    return null;
  }
  document.addEventListener("visibilitychange", handleVisibility);
  reducedMotion.addEventListener("change", handleReducedMotion);
  void device.lost.then((info) => {
    if (!destroyed && info.reason !== "destroyed") fallback();
  });

  resize();
  requestRender();

  return {
    destroy() {
      fallback();
    },
  };
};
