const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const springStep = (state, target, stiffness, damping, precision, dt) => {
  if (state.settled || dt === 0) return state.settled;
  const delta = target - state.value;
  const velocity = (state.value - state.previous) / dt;
  const displacement = (velocity + stiffness * delta - damping * velocity) * dt;
  const settled = Math.abs(displacement) < precision && Math.abs(delta) < precision;
  state.previous = state.value;
  state.value = settled ? target : state.value + displacement;
  state.velocity = velocity;
  state.settled = settled;
  return settled;
};

const springState = (value = 0) => ({
  value,
  previous: value,
  velocity: 0,
  settled: true,
});

export const createCardMotion = (surface, card) => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");
  const exitDelay = 500;
  const tiltSpring = { stiffness: 0.05, damping: 0.45, precision: 0.01 };
  const detailSpring = { stiffness: 0.066, damping: 0.25, precision: 0.01 };

  let tiltFactor = 1.5;
  let scaleFactor = 1.02;
  let active = false;
  let softSprings = false;
  let frame = null;
  let lastTime = performance.now();
  let enterTimer = null;
  let exitTimer = null;
  let pendingTarget = null;
  let destroyed = false;

  const x = springState(0.5);
  const y = springState(0.5);
  const activation = springState(0);
  const target = { x: 0.5, y: 0.5, activation: 0 };

  const writeVariables = () => {
    const rotation = tiltFactor * 10;
    const scale = 1 + (scaleFactor - 1) * activation.value;
    surface.style.setProperty("--hover-tilt-x", x.value.toFixed(6));
    surface.style.setProperty("--hover-tilt-y", y.value.toFixed(6));
    surface.style.setProperty("--hover-tilt-scale", scale.toFixed(6));
    surface.style.setProperty("--hover-tilt-opacity", activation.value.toFixed(6));
    surface.style.setProperty("--hover-tilt-rotation-x", `${rotation}deg`);
    surface.style.setProperty("--hover-tilt-rotation-y", `${rotation}deg`);
    surface.style.setProperty("--hover-tilt-at-edge", "0");
  };

  const tick = (now) => {
    frame = null;
    if (destroyed) return;

    const elapsed = clamp(now - lastTime, 0, 1000 / 30);
    const dt = (elapsed * 60) / 1000;
    lastTime = now;
    const positionStiffness = softSprings ? tiltSpring.stiffness * 0.2 : tiltSpring.stiffness;
    const positionDamping = softSprings ? tiltSpring.damping * 0.5 : tiltSpring.damping;
    const activationStiffness = softSprings ? detailSpring.stiffness * 0.2 : detailSpring.stiffness;
    const activationDamping = softSprings ? detailSpring.damping * 0.5 : detailSpring.damping;

    springStep(x, target.x, positionStiffness, positionDamping, tiltSpring.precision, dt);
    springStep(y, target.y, positionStiffness, positionDamping, tiltSpring.precision, dt);
    springStep(
      activation,
      target.activation,
      activationStiffness,
      activationDamping,
      detailSpring.precision,
      dt,
    );
    if (target.activation === 0 && activation.settled) active = false;
    writeVariables();

    if (!x.settled || !y.settled || !activation.settled) frame = requestAnimationFrame(tick);
  };

  const requestTick = (resetTime = true) => {
    if (frame === null && !destroyed) {
      if (resetTime) lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };

  const clearExitTimer = () => {
    if (exitTimer !== null) {
      clearTimeout(exitTimer);
      exitTimer = null;
    }
  };

  const applyActiveTarget = (nextX, nextY) => {
    clearExitTimer();
    active = true;
    softSprings = false;
    target.x = clamp(nextX, 0, 1);
    target.y = clamp(nextY, 0, 1);
    target.activation = 1;
    x.settled = false;
    y.settled = false;
    activation.settled = false;
    requestTick();
  };

  const setActiveTarget = (nextX, nextY) => {
    pendingTarget = { x: nextX, y: nextY };
    if (active) {
      pendingTarget = null;
      applyActiveTarget(nextX, nextY);
      return;
    }
    if (enterTimer !== null) return;
    enterTimer = setTimeout(() => {
      enterTimer = null;
      if (!pendingTarget) return;
      const next = pendingTarget;
      pendingTarget = null;
      applyActiveTarget(next.x, next.y);
    }, 0);
  };

  const setRestTarget = () => {
    softSprings = true;
    target.x = 0.5;
    target.y = 0.5;
    target.activation = 0;
    x.settled = false;
    y.settled = false;
    activation.settled = false;
    requestTick();
  };

  const scheduleRest = () => {
    clearExitTimer();
    if (enterTimer !== null) {
      clearTimeout(enterTimer);
      enterTimer = null;
    }
    pendingTarget = null;
    exitTimer = setTimeout(() => {
      exitTimer = null;
      setRestTarget();
    }, exitDelay);
  };

  const updatePointerTarget = (event) => {
    const rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    setActiveTarget(
      (event.clientX - rect.left) / rect.width,
      (event.clientY - rect.top) / rect.height,
    );
  };

  const handlePointerMove = (event) => {
    updatePointerTarget(event);
    if (event.isTrusted) gyro.suspend();
  };

  const handlePointerEnter = (event) => {
    updatePointerTarget(event);
  };

  const handlePointerLeave = () => {
    scheduleRest();
  };

  const handlePointerDown = (event) => {
    if (event.isTrusted) gyro.suspend();
  };

  const gyro = {
    listening: false,
    permissionRequested: false,
    permissionPending: false,
    source: null,
    baseBeta: null,
    baseGamma: null,
    filteredGamma: 0,
    filteredBeta: 0,
    lastEventAt: null,
    suspendedUntil: 0,
    frame: null,
    orientationListener: null,

    reset() {
      if (this.frame !== null) cancelAnimationFrame(this.frame);
      this.frame = null;
      this.source = null;
      this.baseBeta = null;
      this.baseGamma = null;
      this.filteredGamma = 0;
      this.filteredBeta = 0;
      this.lastEventAt = null;
    },

    suspend() {
      this.suspendedUntil = performance.now() + 1100;
      this.reset();
    },

    start() {
      if (this.listening || destroyed) return;
      this.listening = true;
      this.orientationListener ??= (event) => this.onOrientation(event);
      window.addEventListener("deviceorientation", this.orientationListener, true);
      window.addEventListener("deviceorientationabsolute", this.orientationListener, true);
    },

    async requestPermission() {
      if (this.listening || this.permissionRequested || this.permissionPending) return;
      if (typeof DeviceOrientationEvent === "undefined") return;
      if (typeof DeviceOrientationEvent.requestPermission !== "function") {
        this.start();
        return;
      }
      this.permissionPending = true;
      try {
        const state = await DeviceOrientationEvent.requestPermission();
        this.permissionRequested = true;
        if (state === "granted") this.start();
      } catch {
        // Pointer interaction remains fully functional without sensor permission.
      } finally {
        this.permissionPending = false;
      }
    },

    onOrientation(event) {
      if (destroyed || event.beta == null || event.gamma == null) return;
      if (performance.now() < this.suspendedUntil) return;
      if (this.source && event.type !== this.source) return;
      this.source = event.type;

      if (this.baseBeta === null || this.baseGamma === null) {
        this.baseBeta = event.beta;
        this.baseGamma = event.gamma;
        this.filteredGamma = 0;
        this.filteredBeta = 0;
        this.lastEventAt = performance.now();
      }

      const gamma = clamp(event.gamma - this.baseGamma, -24, 24);
      const beta = clamp(event.beta - this.baseBeta, -28, 28);
      const now = performance.now();
      const elapsed = clamp(now - this.lastEventAt, 0, 64);
      const easing = 1 - Math.exp(-elapsed / 140);
      this.lastEventAt = now;
      this.filteredGamma += (gamma - this.filteredGamma) * easing;
      this.filteredBeta += (beta - this.filteredBeta) * easing;

      if (this.frame !== null) return;
      this.frame = requestAnimationFrame(() => {
        this.frame = null;
        if (destroyed || performance.now() < this.suspendedUntil) return;
        setActiveTarget(
          0.5 - (this.filteredGamma / 24) * 0.35,
          0.5 - (this.filteredBeta / 28) * 0.35,
        );
      });
    },
  };

  const handleVisibility = () => {
    gyro.reset();
    if (document.hidden) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    } else {
      requestTick(false);
    }
  };

  const handleOrientationChange = () => gyro.reset();
  const handleReducedMotion = () => requestTick();
  const requestGyroPermission = () => {
    void gyro.requestPermission();
  };

  surface.addEventListener("pointerenter", handlePointerEnter, { passive: true });
  surface.addEventListener("pointermove", handlePointerMove, { passive: true });
  surface.addEventListener("pointerleave", handlePointerLeave, { passive: true });
  surface.addEventListener("pointerdown", handlePointerDown, { passive: true });
  window.addEventListener("orientationchange", handleOrientationChange);
  document.addEventListener("visibilitychange", handleVisibility);
  reducedMotion.addEventListener("change", handleReducedMotion);

  if (
    coarsePointer.matches ||
    "DeviceOrientationEvent" in window ||
    "ondeviceorientation" in window
  ) {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      window.addEventListener("pointerdown", requestGyroPermission, {
        capture: true,
      });
    } else {
      void gyro.requestPermission();
    }
  }

  writeVariables();
  requestTick();

  return {
    setTiltFactor(value) {
      tiltFactor = clamp(Number(value) || 0, 0, 1.5);
      writeVariables();
    },
    setScaleFactor(value) {
      scaleFactor = clamp(Number(value) || 1, 1, 1.08);
      writeVariables();
    },
    destroy() {
      destroyed = true;
      clearExitTimer();
      if (enterTimer !== null) clearTimeout(enterTimer);
      pendingTarget = null;
      gyro.reset();
      if (frame !== null) cancelAnimationFrame(frame);
      surface.removeEventListener("pointerenter", handlePointerEnter);
      surface.removeEventListener("pointermove", handlePointerMove);
      surface.removeEventListener("pointerleave", handlePointerLeave);
      surface.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("pointerdown", requestGyroPermission, true);
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotion.removeEventListener("change", handleReducedMotion);
      window.removeEventListener("deviceorientation", gyro.orientationListener, true);
      window.removeEventListener("deviceorientationabsolute", gyro.orientationListener, true);
    },
  };
};
