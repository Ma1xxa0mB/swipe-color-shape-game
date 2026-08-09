// Neon Swipe Arena
// -----------------
// Le jeu est volontairement en JavaScript pur : pas de librairie, pas de build.
// Toute la logique importante est rangee en classes pour faciliter l'ajout de modes.

const canvasElement = document.querySelector("#gameCanvas");
const restartButtonElement = document.querySelector("#restartButton");
const drawingContext = canvasElement.getContext("2d");

const GAME_CONFIG = {
  designWidth: 540,
  designHeight: 960,
  gravity: 1450, // 1450
  spawnImpulse: -1300, // -1120
  minSwipeDistance: 15,
  minThrowForce: 1800,
  maxThrowForce: 2400,
  upwardThrowBoost: 330,
  shapeRadius: 34,
  level19SecondShapeDelayMs: 500,
  level19SpawnImpulseMultiplier: 0.75,
  level19GravityMultiplier: 0.4,
  level19SelectionHitboxMultiplier: 1.75,
  spawnSquashStretchDurationMs: 350,
  spawnHaloAnimationDurationMs: 430,
  spawnHaloMaxMultiplier: 3.0,
  spawnTrailDurationMs: 600,
  spawnTrailCopies: 3,
  spawnTrailSpacing: 25,
  spawnTrailMaxOpacity: 0.7,
  swipeStretchDurationMs: 120,
  swipeStretchAmount: 3,
  swipeTrailDurationMs: 200,
  swipeTrailCopies: 4,
  swipeTrailSpacing: 20,
  swipeTrailMaxOpacity: 0.25,
  swipeHaloDurationMs: 170,
  swipeHaloMaxMultiplier: 2.2,
  ruleTransitionFeedbackDurationMs: 650,
  receiverPermutationDurationMs: 280,
  receiverHitFeedbackDurationMs: 180,
  receiverHitThicknessMultiplier: 1.65,
  receiverIconHitThicknessMultiplier: 2,
  receiverHitHaloMultiplier: 4.8,
  receiverIconHitHaloMultiplier: 5.2,
  impactRingDurationMs: 180,
  impactRingStartRadius: 12,
  impactRingEndRadius: 85,
  impactRingMaxOpacity: 0.85,
  impactRingLineWidth: 4,
  level8StartScore: 14,
  level9StartScore: 17,
  level10StartScore: 20,
  level11StartScore: 24,
  level12StartScore: 27,
  level13StartScore: 30,
  level14StartScore: 36,
  level14ReceiverTrackLength: 160,
  level15StartScore: 39,
  level16StartScore: 42,
  level17StartScore: 48,
  level18StartScore: 53,
  level19StartScore: 58,
  sideEntryHeightRatio: 0.58,
  sideEntryHorizontalImpulse: 460,
  sideEntryUpwardImpulse: -920,
  movingReceiverSpeed: 90,
  movingGapSpawnOffset: 42,
  movingGapEntryImpulse: 460,
  movingReceiverIconInset: 72,
  movingBottomSpawnSafetyMargin: 14,
  movingBottomSpawnHorizontalImpulse: 110,
  movingBottomSpawnCenterZoneWidth: 90,
  level11IntroDurationMs: 2000,
  level12IntroDurationMs: 2000,
  shapeRotationIntervalMs: 1000,
  shapeRotationDurationMs: 180,
  level10WallRotationIntervalMs: 1000,
  level10WallRotationDurationMs: 180
};

const WALL_LAYOUT_A_RECEIVER_COLORS_BY_POSITION_ID = {
  topLeft: "green",
  topRight: "red",
  bottomLeft: "blue",
  bottomRight: "yellow"
};

const WALL_LAYOUT_B_RECEIVER_COLORS_BY_POSITION_ID = {
  topLeft: "blue",
  topRight: "yellow",
  bottomLeft: "red",
  bottomRight: "green"
};

const WALL_LAYOUT_C_RECEIVER_COLORS_BY_POSITION_ID = {
  topLeft: "yellow",
  topRight: "blue",
  bottomLeft: "green",
  bottomRight: "red"
};

const WALL_LAYOUT_D_RECEIVER_COLORS_BY_POSITION_ID = {
  topLeft: "red",
  topRight: "green",
  bottomLeft: "yellow",
  bottomRight: "blue"
};

const PHASE_6_RECEIVER_COLORS_BY_POSITION_ID = WALL_LAYOUT_D_RECEIVER_COLORS_BY_POSITION_ID;

const LEVEL_8_INITIAL_RECEIVER_COLORS_BY_POSITION_ID = WALL_LAYOUT_D_RECEIVER_COLORS_BY_POSITION_ID;
const LEVEL_9_INITIAL_RECEIVER_COLORS_BY_POSITION_ID = WALL_LAYOUT_D_RECEIVER_COLORS_BY_POSITION_ID;
const LEVEL_10_INITIAL_RECEIVER_COLORS_BY_POSITION_ID = WALL_LAYOUT_D_RECEIVER_COLORS_BY_POSITION_ID;
const LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID = PHASE_6_RECEIVER_COLORS_BY_POSITION_ID;

const DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID = {
  topLeft: "triangle",
  topRight: "star",
  bottomLeft: "square",
  bottomRight: "circle"
};

const PHASE_5_RECEIVER_SHAPES_BY_POSITION_ID = {
  topLeft: "star",
  topRight: "square",
  bottomLeft: "triangle",
  bottomRight: "circle"
};

const LEVEL_6_RECEIVER_SHAPES_BY_POSITION_ID = {
  topLeft: "circle",
  topRight: "triangle",
  bottomLeft: "star",
  bottomRight: "square"
};

const LEVEL_7_RECEIVER_SHAPES_BY_POSITION_ID = {
  topLeft: "square",
  topRight: "circle",
  bottomLeft: "triangle",
  bottomRight: "star"
};

const PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID = {
  topLeft: "circle",
  topRight: "square",
  bottomLeft: "star",
  bottomRight: "triangle"
};

const GAME_PHASES = [
  { level: 1, ruleName: "COLOR", startScore: 0, receiverColorsByPositionId: WALL_LAYOUT_A_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID },
  { level: 2, ruleName: "SHAPE", startScore: 2, receiverColorsByPositionId: WALL_LAYOUT_A_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID },
  { level: 3, ruleName: "COLOR", startScore: 4, receiverColorsByPositionId: WALL_LAYOUT_A_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 2, dynamicRuleMaxAnswers: 3 },
  { level: 4, ruleName: "COLOR", startScore: 6, receiverColorsByPositionId: WALL_LAYOUT_B_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 2, dynamicRuleMaxAnswers: 3 },
  { level: 5, ruleName: "COLOR", startScore: 8, receiverColorsByPositionId: WALL_LAYOUT_B_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_5_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 2, dynamicRuleMaxAnswers: 3 },
  { level: 6, ruleName: "COLOR", startScore: 10, receiverColorsByPositionId: WALL_LAYOUT_C_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: LEVEL_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 3 },
  { level: 7, ruleName: "COLOR", startScore: 12, receiverColorsByPositionId: WALL_LAYOUT_D_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: LEVEL_7_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 3 },
  { level: 8, ruleName: "COLOR", startScore: GAME_CONFIG.level8StartScore, receiverColorsByPositionId: LEVEL_8_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: LEVEL_7_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 3, permutesReceiverColorsAfterSuccess: true },
  { level: 9, ruleName: "COLOR", startScore: GAME_CONFIG.level9StartScore, receiverColorsByPositionId: LEVEL_9_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: LEVEL_7_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 3, permutesReceiverShapesAfterSuccess: true },
  { level: 10, ruleName: "COLOR", startScore: GAME_CONFIG.level10StartScore, receiverColorsByPositionId: LEVEL_10_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: LEVEL_7_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 3, permutesReceiverColorsAfterSuccess: true, permutesReceiverShapesAfterSuccess: true },
  { level: 11, ruleName: "COLOR", startScore: GAME_CONFIG.level11StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicWallColors: true },
  { level: 12, ruleName: "SHAPE", startScore: GAME_CONFIG.level12StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicReceiverShapes: true },
  { level: 13, ruleName: "COLOR", startScore: GAME_CONFIG.level13StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 2, usesRuleControlledReceiverRotation: true },
  { level: 14, ruleName: "COLOR", startScore: GAME_CONFIG.level14StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 2, permutesReceiverColorsAfterSuccess: true, permutesReceiverShapesAfterSuccess: true, usesShortReceiverTracks: true },
  { level: 15, ruleName: "COLOR", startScore: GAME_CONFIG.level15StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 2, permutesReceiverColorsAfterSuccess: true, permutesReceiverShapesAfterSuccess: true, usesShortReceiverTracks: true, projectileEntry: "top" },
  { level: 16, ruleName: "COLOR", startScore: GAME_CONFIG.level16StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 2, permutesReceiverColorsAfterSuccess: true, permutesReceiverShapesAfterSuccess: true, usesShortReceiverTracks: true, projectileEntry: "side" },
  { level: 17, ruleName: "COLOR", startScore: GAME_CONFIG.level17StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 2, permutesReceiverColorsAfterSuccess: true, permutesReceiverShapesAfterSuccess: true, usesShortReceiverTracks: true, projectileEntry: "random" },
  { level: 18, ruleName: "COLOR", startScore: GAME_CONFIG.level18StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 2, usesShortReceiverTracks: true, usesMovingReceiverTracks: true, projectileEntry: "movingGap" },
  { level: 19, ruleName: "COLOR", startScore: GAME_CONFIG.level19StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 2, usesShortReceiverTracks: true, usesMovingReceiverTracks: true, usesPreciseDuoSelection: true, projectileEntry: "movingGapDuo" }
];

// const NEON_COLORS = {
//   green: "#39ff72",
//   red: "#ff3048",
//   blue: "#3192ff",
//   yellow: "#e2ff05"
// };

const NEON_COLORS = {
  green: "#4dff88",
  red: "#ff4560",
  blue: "#4da6ff",
  yellow: "#efff2e"
};

const RECEIVER_DEFINITIONS = [
  { id: "topLeft", horizontalSide: "left", verticalSide: "top" },
  { id: "topRight", horizontalSide: "right", verticalSide: "top" },
  { id: "bottomLeft", horizontalSide: "left", verticalSide: "bottom" },
  { id: "bottomRight", horizontalSide: "right", verticalSide: "bottom" }
];

const CLOCKWISE_RECEIVER_ROTATION_BY_POSITION_ID = {
  topLeft: "topRight",
  topRight: "bottomRight",
  bottomRight: "bottomLeft",
  bottomLeft: "topLeft"
};

const AVAILABLE_SHAPES = ["circle", "square", "triangle", "star"];
const AVAILABLE_COLOR_IDS = ["red", "yellow", "green", "blue"];

const KEYBOARD_TARGETS = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
  KeyQ: "topLeft",
  KeyE: "topRight",
  KeyZ: "bottomLeft",
  KeyC: "bottomRight"
};

class GeometryScaler {
  constructor(designWidth, designHeight) {
    this.designWidth = designWidth;
    this.designHeight = designHeight;
    this.canvasWidth = designWidth;
    this.canvasHeight = designHeight;
    this.scale = 1;
  }

  updateFromCanvas(canvas) {
    const pixelRatio = window.devicePixelRatio || 1;
    const canvasBounds = canvas.getBoundingClientRect();

    canvas.width = Math.round(canvasBounds.width * pixelRatio);
    canvas.height = Math.round(canvasBounds.height * pixelRatio);

    this.canvasWidth = canvasBounds.width;
    this.canvasHeight = canvasBounds.height;
    this.scale = Math.min(
      canvasBounds.width / this.designWidth,
      canvasBounds.height / this.designHeight
    );

    return pixelRatio;
  }

  x(designValue) {
    return designValue * this.scale;
  }

  y(designValue) {
    return designValue * this.scale;
  }

  point(designX, designY) {
    return {
      x: this.x(designX),
      y: this.y(designY)
    };
  }
}

class SwipeGesture {
  constructor(pointerId, startPoint) {
    this.pointerId = pointerId;
    this.startX = startPoint.x;
    this.startY = startPoint.y;
    this.currentX = startPoint.x;
    this.currentY = startPoint.y;
    this.startedAt = performance.now();
  }

  update(currentPoint) {
    this.currentX = currentPoint.x;
    this.currentY = currentPoint.y;
  }

  get deltaX() {
    return this.currentX - this.startX;
  }

  get deltaY() {
    return this.currentY - this.startY;
  }

  get distance() {
    return Math.hypot(this.deltaX, this.deltaY);
  }

  get durationMs() {
    return Math.max(performance.now() - this.startedAt, 1);
  }
}

class FallingShape {
  constructor({ x, y, radius, colorId, shapeName, velocityX = 0, velocityY, state = "active" }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colorId = colorId;
    this.shapeName = shapeName;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.state = state;
    this.hasBeenThrown = false;
    this.createdAt = performance.now();
    this.spawnAnimationStartedAt = null;
    this.swipeAnimationStartedAt = null;
  }

  update(deltaSeconds, gravity) {
    this.velocityY += gravity * deltaSeconds;
    this.velocityX *= 0.996;
    this.x += this.velocityX * deltaSeconds;
    this.y += this.velocityY * deltaSeconds;
  }

  throwToward(direction, force, shouldLockAfterThrow) {
    const length = Math.hypot(direction.x, direction.y) || 1;
    this.velocityX = (direction.x / length) * force;
    this.velocityY = (direction.y / length) * force;
    this.hasBeenThrown = true;
    this.swipeAnimationStartedAt = performance.now();

    if (shouldLockAfterThrow) {
      this.state = "launched";
    }
  }

  isBelowScreen(canvasHeight, extraMargin) {
    const hasBeenVisibleLongEnough = performance.now() - this.createdAt > 500;
    return hasBeenVisibleLongEnough && this.y - this.radius > canvasHeight + extraMargin;
  }

  getSpawnRenderScale(currentTime) {
    if (this.spawnAnimationStartedAt === null) {
      return {
        scaleX: 1,
        scaleY: 1
      };
    }
    const elapsedMs = currentTime - this.spawnAnimationStartedAt;

    if (elapsedMs >= GAME_CONFIG.spawnSquashStretchDurationMs) {
      return {
        scaleX: 1,
        scaleY: 1
      };
    }

    const scaleKeyframes = [
      { timeMs: 0, scaleX: 1.85, scaleY: 0.30 },
      { timeMs: 100, scaleX: 0.52, scaleY: 1.90 },
      { timeMs: 230, scaleX: 1.22, scaleY: 0.82 },
      { timeMs: GAME_CONFIG.spawnSquashStretchDurationMs, scaleX: 1, scaleY: 1 }
    ];

    const nextKeyframeIndex = scaleKeyframes.findIndex((keyframe) => elapsedMs <= keyframe.timeMs);
    const nextKeyframe = scaleKeyframes[nextKeyframeIndex];
    const previousKeyframe = scaleKeyframes[Math.max(nextKeyframeIndex - 1, 0)];
    const segmentDurationMs = nextKeyframe.timeMs - previousKeyframe.timeMs || 1;
    const segmentProgress = clamp((elapsedMs - previousKeyframe.timeMs) / segmentDurationMs, 0, 1);

    let easedProgress;

    if (previousKeyframe.timeMs === 0) {
      // Squash -> Stretch : départ rapide, arrivée plus douce
      easedProgress = 1 - Math.pow(1 - segmentProgress, 3);
    } else if (nextKeyframe.timeMs === GAME_CONFIG.spawnSquashStretchDurationMs) {
      // Dernier rebond -> normal : stabilisation douce
      easedProgress =
        segmentProgress < 0.5
          ? 2 * segmentProgress * segmentProgress
          : 1 - Math.pow(-2 * segmentProgress + 2, 2) / 2;
    } else {
      // Stretch -> rebond inverse : ralentit en arrivant
      easedProgress = 1 - Math.pow(1 - segmentProgress, 2);
    }

    return {
      scaleX: previousKeyframe.scaleX + (nextKeyframe.scaleX - previousKeyframe.scaleX) * easedProgress,
      scaleY: previousKeyframe.scaleY + (nextKeyframe.scaleY - previousKeyframe.scaleY) * easedProgress
    };
  }

  getSpawnHaloMultiplier(currentTime) {
    if (this.spawnAnimationStartedAt === null) {
      return 1;
    }

    const elapsedMs = currentTime - this.spawnAnimationStartedAt;

    if (elapsedMs >= GAME_CONFIG.spawnHaloAnimationDurationMs) {
      return 1;
    }

    // Le halo monte très vite pendant le stretch.
    if (elapsedMs <= 100) {
      const progress = elapsedMs / 100;

      return 1 + (GAME_CONFIG.spawnHaloMaxMultiplier - 1) * progress;
    }

    // Puis il redescend plus lentement et continue légèrement
    // après la fin du squash & stretch.
    const returnProgress = clamp(
      (elapsedMs - 100) /
      (GAME_CONFIG.spawnHaloAnimationDurationMs - 100),
      0,
      1
    );

    return (
      GAME_CONFIG.spawnHaloMaxMultiplier -
      (GAME_CONFIG.spawnHaloMaxMultiplier - 1) * returnProgress
    );
  }

  getSpawnTrailStrength(currentTime) {
    if (
      this.spawnAnimationStartedAt === null ||
      this.hasBeenThrown
    ) {
      return 0;
    }

    const elapsedMs = currentTime - this.spawnAnimationStartedAt;

    if (elapsedMs >= GAME_CONFIG.spawnTrailDurationMs) {
      return 0;
    }

    const progress = clamp(
      elapsedMs / GAME_CONFIG.spawnTrailDurationMs,
      0,
      1
    );

    // Forte au début puis disparaît progressivement.
    return 1 - progress;
  }

  getSwipeRenderScale(currentTime) {
    if (this.swipeAnimationStartedAt === null) {
      return {
        scaleAlongMovement: 1,
        scalePerpendicular: 1
      };
    }

    const elapsedMs =
      currentTime - this.swipeAnimationStartedAt;

    if (elapsedMs >= GAME_CONFIG.swipeStretchDurationMs) {
      return {
        scaleAlongMovement: 1,
        scalePerpendicular: 1
      };
    }

    const progress = clamp(
      elapsedMs / GAME_CONFIG.swipeStretchDurationMs,
      0,
      1
    );

    const easedProgress =
      1 - Math.pow(1 - progress, 3);

    return {
      scaleAlongMovement:
        GAME_CONFIG.swipeStretchAmount -
        (GAME_CONFIG.swipeStretchAmount - 1) *
        easedProgress,

      scalePerpendicular:
        1 / (
          GAME_CONFIG.swipeStretchAmount -
          (GAME_CONFIG.swipeStretchAmount - 1) *
          easedProgress
        )
    };
  }

  getSwipeHaloMultiplier(currentTime) {
    if (this.swipeAnimationStartedAt === null) {
      return 1;
    }

    const elapsedMs =
      currentTime - this.swipeAnimationStartedAt;

    if (elapsedMs >= GAME_CONFIG.swipeHaloDurationMs) {
      return 1;
    }

    const progress = clamp(
      elapsedMs / GAME_CONFIG.swipeHaloDurationMs,
      0,
      1
    );

    return (
      GAME_CONFIG.swipeHaloMaxMultiplier -
      (GAME_CONFIG.swipeHaloMaxMultiplier - 1) *
      progress
    );
  }

  getSwipeTrailStrength(currentTime) {
    if (
      this.swipeAnimationStartedAt === null ||
      !this.hasBeenThrown
    ) {
      return 0;
    }

    const elapsedMs =
      currentTime - this.swipeAnimationStartedAt;

    if (elapsedMs >= GAME_CONFIG.swipeTrailDurationMs) {
      return 0;
    }

    const progress = clamp(
      elapsedMs / GAME_CONFIG.swipeTrailDurationMs,
      0,
      1
    );

    return 1 - progress;
  }

  get canReceiveSwipe() {
    return this.state === "active";
  }

  get canHitReceiver() {
    return this.hasBeenThrown && this.state !== "resolved";
  }
}

class Particle {
  constructor(x, y, velocityX, velocityY, color, lifeSeconds) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.color = color;
    this.lifeSeconds = lifeSeconds;
    this.maxLifeSeconds = lifeSeconds;
  }

  update(deltaSeconds) {
    this.lifeSeconds -= deltaSeconds;
    this.x += this.velocityX * deltaSeconds;
    this.y += this.velocityY * deltaSeconds;
    this.velocityX *= 0.96;
    this.velocityY *= 0.96;
  }

  get isAlive() {
    return this.lifeSeconds > 0;
  }

  get alpha() {
    return Math.max(this.lifeSeconds / this.maxLifeSeconds, 0);
  }
}

class ImpactRing {
  constructor(x, y, color, startedAt) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.startedAt = startedAt;
  }

  getProgress(currentTime) {
    return clamp(
      (currentTime - this.startedAt) /
      GAME_CONFIG.impactRingDurationMs,
      0,
      1
    );
  }

  get isAlive() {
    return (
      performance.now() - this.startedAt <
      GAME_CONFIG.impactRingDurationMs
    );
  }
}


class ParticleSystem {
  constructor(scaler) {
    this.scaler = scaler;
    this.particles = [];
    this.impactRings = [];
  }

  clear() {
    this.particles = [];
    this.impactRings = [];
  }

  createBurst(x, y, color, isSuccess) {
    const particleCount = 22;
    const lifeSeconds = isSuccess ? 0.5 : 0.32;

    for (let index = 0; index < particleCount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = this.scaler.x(isSuccess ? 160 + Math.random() * 260 : 90 + Math.random() * 120);

      this.particles.push(new Particle(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        lifeSeconds
      ));
    }
  }

  createImpactRing(x, y, color) {
    this.impactRings.push(
      new ImpactRing(
        x,
        y,
        color,
        performance.now()
      )
    );
  }

  update(deltaSeconds) {
    this.particles.forEach((particle) => particle.update(deltaSeconds));
    this.particles = this.particles.filter((particle) => particle.isAlive);
    this.impactRings = this.impactRings.filter((ring) => ring.isAlive);
  }

  draw(context) {

    const currentTime = performance.now();

    this.impactRings.forEach((ring) => {
      const progress =
        ring.getProgress(currentTime);

      const easedProgress =
        1 - Math.pow(1 - progress, 3);

      const radius =
        this.scaler.x(
          GAME_CONFIG.impactRingStartRadius +
          (
            GAME_CONFIG.impactRingEndRadius -
            GAME_CONFIG.impactRingStartRadius
          ) *
          easedProgress
        );

      const opacity =
        GAME_CONFIG.impactRingMaxOpacity *
        (1 - progress);

      context.save();

      context.globalAlpha = opacity;
      context.strokeStyle = ring.color;
      context.shadowColor = ring.color;
      context.shadowBlur = this.scaler.x(18);

      context.lineWidth =
        this.scaler.x(
          GAME_CONFIG.impactRingLineWidth
        ) *
        (1 - progress * 0.55);

      context.beginPath();

      context.arc(
        ring.x,
        ring.y,
        radius,
        0,
        Math.PI * 2
      );

      context.stroke();
      context.restore();
    });

    this.particles.forEach((particle) => {
      context.save();
      context.globalAlpha = particle.alpha;
      context.fillStyle = particle.color;
      context.shadowColor = particle.color;
      context.shadowBlur = this.scaler.x(14);
      context.beginPath();
      context.arc(particle.x, particle.y, this.scaler.x(2.3), 0, Math.PI * 2);
      context.fill();
      context.restore();
    });
  }
}



class Arena {
  constructor(scaler, receiverDefinitions) {
    this.scaler = scaler;
    this.receivers = receiverDefinitions;

    // Les valeurs sont exprimees dans la taille de reference 540x960.
    this.layout = {
      outerX: 2,
      outerY: 52,
      outerWidth: 536,
      outerHeight: 906,
      innerX: 66,
      innerY: 152,
      innerWidth: 408,
      innerHeight: 730,
      railSize: 48,
      cornerRadius: 150
    };
  }

  findReceiverById(receiverId) {
    return this.receivers.find((receiver) => receiver.id === receiverId);
  }

  findReceiverByCurrentShape(shapeName, currentPhase) {
    return this.receivers.find((receiver) => this.getReceiverShapeName(receiver, currentPhase) === shapeName);
  }

  findReceiverByCurrentColor(colorId, currentPhase) {
    return this.receivers.find((receiver) => this.getReceiverColorId(receiver, currentPhase) === colorId);
  }

  getReceiverShapeName(receiver, currentPhase) {
    return currentPhase.receiverShapesByPositionId[receiver.id];
  }

  getReceiverColorId(receiver, currentPhase) {
    return currentPhase.receiverColorsByPositionId[receiver.id];
  }

  getReceiverNeonColor(receiver, currentPhase) {
    return NEON_COLORS[this.getReceiverColorId(receiver, currentPhase)];
  }

  findReceiverHitByShape(fallingShape, currentPhase) {
    if (!fallingShape.canHitReceiver) return null;

    const collisionRadius = fallingShape.radius * 0.55;
    return this.receivers.find((receiver) => {
      return this.getReceiverHitAreas(receiver, currentPhase).some((hitArea) => {
        return this.circleOverlapsRect(fallingShape.x, fallingShape.y, collisionRadius, hitArea);
      });
    });
  }

  getReceiverAimPoint(receiver) {
    const scaledLayout = this.getScaledLayout();
    const aimX = receiver.horizontalSide === "left"
      ? scaledLayout.outerX + scaledLayout.railSize * 0.72
      : scaledLayout.outerX + scaledLayout.outerWidth - scaledLayout.railSize * 0.72;
    const aimY = receiver.verticalSide === "top"
      ? scaledLayout.outerY + scaledLayout.railSize * 0.72
      : scaledLayout.outerY + scaledLayout.outerHeight - scaledLayout.railSize * 0.72;

    return { x: aimX, y: aimY };
  }

  getScaledLayout() {
    const layout = this.layout;
    return {
      outerX: this.scaler.x(layout.outerX),
      outerY: this.scaler.y(layout.outerY),
      outerWidth: this.scaler.x(layout.outerWidth),
      outerHeight: this.scaler.y(layout.outerHeight),
      innerX: this.scaler.x(layout.innerX),
      innerY: this.scaler.y(layout.innerY),
      innerWidth: this.scaler.x(layout.innerWidth),
      innerHeight: this.scaler.y(layout.innerHeight),
      railSize: this.scaler.x(layout.railSize),
      cornerRadius: this.scaler.x(layout.cornerRadius)
    };
  }

  getReceiverHitAreas(receiver, currentPhase) {
    if (currentPhase?.usesMovingReceiverTracks) {
      return this.getMovingReceiverTrackHitAreas(receiver, currentPhase);
    }

    if (currentPhase?.usesShortReceiverTracks) {
      return this.getShortReceiverTrackHitAreas(receiver);
    }

    const layout = this.getScaledLayout();
    const middleX = layout.outerX + layout.outerWidth / 2;
    const middleY = layout.outerY + layout.outerHeight / 2;
    const rightRailX = layout.outerX + layout.outerWidth - layout.railSize;
    const bottomRailY = layout.outerY + layout.outerHeight - layout.railSize;

    if (receiver.id === "topLeft") {
      return [
        { x: layout.outerX, y: layout.outerY, width: layout.outerWidth / 2, height: layout.railSize },
        { x: layout.outerX, y: layout.outerY, width: layout.railSize, height: layout.outerHeight / 2 }
      ];
    }

    if (receiver.id === "topRight") {
      return [
        { x: middleX, y: layout.outerY, width: layout.outerWidth / 2, height: layout.railSize },
        { x: rightRailX, y: layout.outerY, width: layout.railSize, height: layout.outerHeight / 2 }
      ];
    }

    if (receiver.id === "bottomLeft") {
      return [
        { x: layout.outerX, y: middleY, width: layout.railSize, height: layout.outerHeight / 2 },
        { x: layout.outerX, y: bottomRailY, width: layout.outerWidth / 2, height: layout.railSize }
      ];
    }

    return [
      { x: rightRailX, y: middleY, width: layout.railSize, height: layout.outerHeight / 2 },
      { x: middleX, y: bottomRailY, width: layout.outerWidth / 2, height: layout.railSize }
    ];
  }

  getOuterTrackBounds() {
    const layout = this.getScaledLayout();
    return {
      left: layout.outerX + layout.railSize / 2,
      top: layout.outerY + layout.railSize / 2,
      right: layout.outerX + layout.outerWidth - layout.railSize / 2,
      bottom: layout.outerY + layout.outerHeight - layout.railSize / 2
    };
  }

  getOuterTrackPerimeterLength() {
    const bounds = this.getOuterTrackBounds();
    return 2 * ((bounds.right - bounds.left) + (bounds.bottom - bounds.top));
  }

  normalizeOuterTrackDistance(distance) {
    const perimeterLength = this.getOuterTrackPerimeterLength();
    return ((distance % perimeterLength) + perimeterLength) % perimeterLength;
  }

  getPointOnOuterTrack(distance) {
    const bounds = this.getOuterTrackBounds();
    const horizontalLength = bounds.right - bounds.left;
    const verticalLength = bounds.bottom - bounds.top;
    let normalizedDistance = this.normalizeOuterTrackDistance(distance);

    if (normalizedDistance <= horizontalLength) {
      return {
        x: bounds.left + normalizedDistance,
        y: bounds.top,
        side: "top",
        inwardNormalX: 0,
        inwardNormalY: 1
      };
    }

    normalizedDistance -= horizontalLength;
    if (normalizedDistance <= verticalLength) {
      return {
        x: bounds.right,
        y: bounds.top + normalizedDistance,
        side: "right",
        inwardNormalX: -1,
        inwardNormalY: 0
      };
    }

    normalizedDistance -= verticalLength;
    if (normalizedDistance <= horizontalLength) {
      return {
        x: bounds.right - normalizedDistance,
        y: bounds.bottom,
        side: "bottom",
        inwardNormalX: 0,
        inwardNormalY: -1
      };
    }

    normalizedDistance -= horizontalLength;
    return {
      x: bounds.left,
      y: bounds.bottom - normalizedDistance,
      side: "left",
      inwardNormalX: 1,
      inwardNormalY: 0
    };
  }

  getDistanceToOuterTrackCorner(distance) {
    const bounds = this.getOuterTrackBounds();
    const horizontalLength = bounds.right - bounds.left;
    const verticalLength = bounds.bottom - bounds.top;
    const normalizedDistance = this.normalizeOuterTrackDistance(distance);

    if (normalizedDistance < horizontalLength) return horizontalLength - normalizedDistance;
    if (normalizedDistance < horizontalLength + verticalLength) return horizontalLength + verticalLength - normalizedDistance;
    if (normalizedDistance < horizontalLength * 2 + verticalLength) return horizontalLength * 2 + verticalLength - normalizedDistance;
    return this.getOuterTrackPerimeterLength() - normalizedDistance;
  }

  getTrackSegmentsOnOuterPerimeter(startDistance, length) {
    const segments = [];
    let remainingLength = length;
    let currentDistance = this.normalizeOuterTrackDistance(startDistance);

    while (remainingLength > 0.001) {
      let distanceToCorner = this.getDistanceToOuterTrackCorner(currentDistance);
      if (distanceToCorner <= 0.001) {
        currentDistance += 0.001;
        distanceToCorner = this.getDistanceToOuterTrackCorner(currentDistance);
      }

      const segmentLength = Math.min(remainingLength, distanceToCorner);
      const segmentStart = this.getPointOnOuterTrack(currentDistance);
      const segmentEnd = this.getPointOnOuterTrack(currentDistance + segmentLength);

      segments.push({
        start: segmentStart,
        end: segmentEnd,
        side: segmentStart.side
      });

      remainingLength -= segmentLength;
      currentDistance += segmentLength;
    }

    return segments;
  }

  getMovingReceiverTrackLength() {
    return this.scaler.x(GAME_CONFIG.level14ReceiverTrackLength);
  }

  getMovingReceiverBaseDistance(receiver) {
    const receiverIndex = this.receivers.findIndex((candidate) => candidate.id === receiver.id);
    return (this.getOuterTrackPerimeterLength() / this.receivers.length) * receiverIndex;
  }

  getMovingReceiverStartDistance(receiver, currentPhase) {
    return this.getMovingReceiverBaseDistance(receiver) + (currentPhase.movingReceiverOffset || 0);
  }

  getMovingReceiverTrackSegments(receiver, currentPhase) {
    return this.getTrackSegmentsOnOuterPerimeter(
      this.getMovingReceiverStartDistance(receiver, currentPhase),
      this.getMovingReceiverTrackLength()
    );
  }

  getMovingReceiverTrackHitAreas(receiver, currentPhase) {
    const layout = this.getScaledLayout();
    return this.getMovingReceiverTrackSegments(receiver, currentPhase).map((segment) => {
      return this.getSegmentHitArea(segment.start, segment.end, layout.railSize);
    });
  }

  getMovingReceiverIconPoint(receiver, currentPhase) {
    const centerDistance = this.getMovingReceiverStartDistance(receiver, currentPhase) + this.getMovingReceiverTrackLength() / 2;
    const centerPoint = this.getPointOnOuterTrack(centerDistance);
    const iconInset = this.scaler.x(GAME_CONFIG.movingReceiverIconInset);

    return {
      x: centerPoint.x + centerPoint.inwardNormalX * iconInset,
      y: centerPoint.y + centerPoint.inwardNormalY * iconInset
    };
  }

  getMovingBottomGapSpawnOptions(currentPhase) {
    const bounds = this.getOuterTrackBounds();
    const occupiedIntervals = this.getMovingReceiverOccupiedBottomIntervals(currentPhase);
    const freeIntervals = this.getFreeBottomIntervals(bounds, occupiedIntervals);
    const safeSpawnOptions = this.getSafeBottomSpawnOptions(freeIntervals);

    if (safeSpawnOptions.length > 0) return safeSpawnOptions;

    const fallbackInterval = this.getLargestHorizontalInterval(freeIntervals);
    if (fallbackInterval) {
      console.warn("No safe moving bottom spawn gap found; using largest bottom gap fallback.");
      return [{
        spawnX: (fallbackInterval.leftX + fallbackInterval.rightX) / 2
      }];
    }

    console.warn("No moving bottom spawn gap found; using arena center fallback.");
    return [{
      spawnX: (bounds.left + bounds.right) / 2
    }];
  }

  getMovingReceiverOccupiedBottomIntervals(currentPhase) {
    const bounds = this.getOuterTrackBounds();
    const layout = this.getScaledLayout();
    const bottomEdgeEpsilon = this.scaler.x(0.5);
    const railCapMargin = layout.railSize / 2;

    const occupiedIntervals = this.receivers
      .flatMap((receiver) => this.getMovingReceiverTrackSegments(receiver, currentPhase))
      .filter((segment) => {
        return (
          Math.abs(segment.start.y - bounds.bottom) <= bottomEdgeEpsilon &&
          Math.abs(segment.end.y - bounds.bottom) <= bottomEdgeEpsilon
        );
      })
      .map((segment) => {
        const leftX = Math.min(segment.start.x, segment.end.x);
        const rightX = Math.max(segment.start.x, segment.end.x);

        return {
          leftX: clamp(leftX - railCapMargin, bounds.left, bounds.right),
          rightX: clamp(rightX + railCapMargin, bounds.left, bounds.right)
        };
      })
      .filter((interval) => interval.rightX > interval.leftX)
      .sort((firstInterval, secondInterval) => firstInterval.leftX - secondInterval.leftX);

    return this.mergeHorizontalIntervals(occupiedIntervals);
  }

  getFreeBottomIntervals(bounds, occupiedIntervals) {
    const freeIntervals = [];
    let nextFreeLeftX = bounds.left;

    occupiedIntervals.forEach((occupiedInterval) => {
      if (occupiedInterval.leftX > nextFreeLeftX) {
        freeIntervals.push({
          leftX: nextFreeLeftX,
          rightX: occupiedInterval.leftX
        });
      }

      nextFreeLeftX = Math.max(nextFreeLeftX, occupiedInterval.rightX);
    });

    if (nextFreeLeftX < bounds.right) {
      freeIntervals.push({
        leftX: nextFreeLeftX,
        rightX: bounds.right
      });
    }

    return freeIntervals;
  }

  mergeHorizontalIntervals(intervals) {
    const mergeEpsilon = this.scaler.x(0.5);

    return intervals.reduce((mergedIntervals, interval) => {
      const previousInterval = mergedIntervals[mergedIntervals.length - 1];

      if (!previousInterval || interval.leftX > previousInterval.rightX + mergeEpsilon) {
        mergedIntervals.push({ ...interval });
        return mergedIntervals;
      }

      previousInterval.rightX = Math.max(previousInterval.rightX, interval.rightX);
      return mergedIntervals;
    }, []);
  }

  getSafeBottomSpawnOptions(freeIntervals) {
    const shapeRadius = this.scaler.x(GAME_CONFIG.shapeRadius);
    const safetyMargin = this.scaler.x(GAME_CONFIG.movingBottomSpawnSafetyMargin);
    const minimumBottomSpawnWidth = shapeRadius * 2 + safetyMargin * 2;

    return freeIntervals
      .filter((freeInterval) => freeInterval.rightX - freeInterval.leftX >= minimumBottomSpawnWidth)
      .map((freeInterval) => {
        const safeLeftX = freeInterval.leftX + shapeRadius + safetyMargin;
        const safeRightX = freeInterval.rightX - shapeRadius - safetyMargin;
        return {
          spawnX: (safeLeftX + safeRightX) / 2
        };
      });
  }

  getLargestHorizontalInterval(intervals) {
    return intervals.reduce((largestInterval, interval) => {
      if (!largestInterval) return interval;

      const largestWidth = largestInterval.rightX - largestInterval.leftX;
      const intervalWidth = interval.rightX - interval.leftX;

      return intervalWidth > largestWidth ? interval : largestInterval;
    }, null);
  }

  getShortReceiverTrackGeometry(receiver) {
    const layout = this.getScaledLayout();
    const trackLength = this.scaler.x(GAME_CONFIG.level14ReceiverTrackLength);
    const rightX = layout.outerX + layout.outerWidth;
    const bottomY = layout.outerY + layout.outerHeight;
    const leftTrackX = layout.outerX + layout.railSize / 2;
    const rightTrackX = rightX - layout.railSize / 2;
    const topTrackY = layout.outerY + layout.railSize / 2;
    const bottomTrackY = bottomY - layout.railSize / 2;

    if (receiver.id === "topLeft") {
      return {
        horizontalStart: { x: leftTrackX + layout.cornerRadius, y: topTrackY },
        horizontalEnd: { x: leftTrackX + trackLength, y: topTrackY },
        curveControl: { x: leftTrackX, y: topTrackY },
        curveEnd: { x: leftTrackX, y: layout.outerY + layout.cornerRadius },
        verticalStart: { x: leftTrackX, y: layout.outerY + layout.cornerRadius },
        verticalEnd: { x: leftTrackX, y: topTrackY + trackLength }
      };
    }

    if (receiver.id === "topRight") {
      return {
        horizontalStart: { x: rightTrackX - layout.cornerRadius, y: topTrackY },
        horizontalEnd: { x: rightTrackX - trackLength, y: topTrackY },
        curveControl: { x: rightTrackX, y: topTrackY },
        curveEnd: { x: rightTrackX, y: layout.outerY + layout.cornerRadius },
        verticalStart: { x: rightTrackX, y: layout.outerY + layout.cornerRadius },
        verticalEnd: { x: rightTrackX, y: topTrackY + trackLength }
      };
    }

    if (receiver.id === "bottomLeft") {
      return {
        horizontalStart: { x: leftTrackX + layout.cornerRadius, y: bottomTrackY },
        horizontalEnd: { x: leftTrackX + trackLength, y: bottomTrackY },
        curveControl: { x: leftTrackX, y: bottomTrackY },
        curveEnd: { x: leftTrackX, y: bottomY - layout.cornerRadius },
        verticalStart: { x: leftTrackX, y: bottomY - layout.cornerRadius },
        verticalEnd: { x: leftTrackX, y: bottomTrackY - trackLength }
      };
    }

    return {
      horizontalStart: { x: rightTrackX - layout.cornerRadius, y: bottomTrackY },
      horizontalEnd: { x: rightTrackX - trackLength, y: bottomTrackY },
      curveControl: { x: rightTrackX, y: bottomTrackY },
      curveEnd: { x: rightTrackX, y: bottomY - layout.cornerRadius },
      verticalStart: { x: rightTrackX, y: bottomY - layout.cornerRadius },
      verticalEnd: { x: rightTrackX, y: bottomTrackY - trackLength }
    };
  }

  getShortReceiverTrackHitAreas(receiver) {
    const geometry = this.getShortReceiverTrackGeometry(receiver);
    const layout = this.getScaledLayout();

    const hitAreas = [];

    // Partie horizontale
    hitAreas.push(
      this.getSegmentHitArea(
        geometry.horizontalStart,
        geometry.horizontalEnd,
        layout.railSize
      )
    );

    // Partie arrondie du récepteur
    const curveSteps = 10;
    let previousPoint = geometry.horizontalStart;

    for (let step = 1; step <= curveSteps; step += 1) {
      const t = step / curveSteps;
      const inverseT = 1 - t;

      const curvePoint = {
        x:
          inverseT * inverseT * geometry.horizontalStart.x +
          2 * inverseT * t * geometry.curveControl.x +
          t * t * geometry.curveEnd.x,

        y:
          inverseT * inverseT * geometry.horizontalStart.y +
          2 * inverseT * t * geometry.curveControl.y +
          t * t * geometry.curveEnd.y
      };

      hitAreas.push(
        this.getSegmentHitArea(
          previousPoint,
          curvePoint,
          layout.railSize
        )
      );

      previousPoint = curvePoint;
    }

    // Partie verticale
    hitAreas.push(
      this.getSegmentHitArea(
        geometry.verticalStart,
        geometry.verticalEnd,
        layout.railSize
      )
    );

    return hitAreas;
  }
  getSegmentHitArea(startPoint, endPoint, thickness) {
    const halfThickness = thickness / 2;

    return {
      x: Math.min(startPoint.x, endPoint.x) - halfThickness,
      y: Math.min(startPoint.y, endPoint.y) - halfThickness,
      width: Math.abs(endPoint.x - startPoint.x) + thickness,
      height: Math.abs(endPoint.y - startPoint.y) + thickness
    };
  }

  circleOverlapsRect(circleX, circleY, radius, rectangle) {
    return (
      circleX + radius >= rectangle.x &&
      circleX - radius <= rectangle.x + rectangle.width &&
      circleY + radius >= rectangle.y &&
      circleY - radius <= rectangle.y + rectangle.height
    );
  }

  draw(
    context,
    currentPhase,
    wallColorAnimation = null,
    hitFeedbackByReceiverId = {},
    introVisualState = null
  ) {
    const railOpacity = introVisualState?.railOpacity ?? 1;
    const iconOpacity = introVisualState?.iconOpacity ?? 1;

    if (currentPhase.usesMovingReceiverTracks) {
      this.receivers.forEach((receiver) =>
        this.drawMovingReceiverTrack(
          context,
          receiver,
          currentPhase,
          hitFeedbackByReceiverId[receiver.id] || 0
        )
      );

      this.drawReceiverIcons(
        context,
        currentPhase,
        iconOpacity,
        hitFeedbackByReceiverId
      );

      this.drawInnerGuide(context);
      return;
    }

    if (wallColorAnimation && wallColorAnimation.progress < 1) {
      this.drawReceiverTracksWithWallColorAnimation(
        context,
        currentPhase,
        wallColorAnimation,
        hitFeedbackByReceiverId,
        railOpacity
      );

      this.drawReceiverIconsWithWallColorAnimation(
        context,
        currentPhase,
        wallColorAnimation,
        hitFeedbackByReceiverId,
        iconOpacity
      );

      this.drawInnerGuide(context);
      return;
    }

    this.receivers.forEach((receiver) =>
      this.drawReceiverTrack(
        context,
        receiver,
        currentPhase,
        null,
        railOpacity,
        hitFeedbackByReceiverId[receiver.id] || 0
      )
    );

    this.drawReceiverIcons(
      context,
      currentPhase,
      iconOpacity,
      hitFeedbackByReceiverId
    );

    this.drawInnerGuide(context);
  }

  drawReceiverTracksWithWallColorAnimation(
    context,
    currentPhase,
    wallColorAnimation,
    hitFeedbackByReceiverId = {},
    opacity = 1
  ) {
    this.receivers.forEach((receiver) => {
      const previousColor = wallColorAnimation.previousColorsByPositionId
        ? NEON_COLORS[
        wallColorAnimation.previousColorsByPositionId[receiver.id]
        ]
        : this.getReceiverNeonColor(receiver, currentPhase);

      const currentColor =
        this.getReceiverNeonColor(receiver, currentPhase);

      const hitStrength =
        hitFeedbackByReceiverId[receiver.id] || 0;

      this.drawReceiverTrack(
        context,
        receiver,
        currentPhase,
        previousColor,
        (1 - wallColorAnimation.progress) * opacity,
        hitStrength
      );

      this.drawReceiverTrack(
        context,
        receiver,
        currentPhase,
        currentColor,
        wallColorAnimation.progress * opacity,
        hitStrength
      );
    });
  }

  drawReceiverIconsWithWallColorAnimation(
    context,
    currentPhase,
    wallColorAnimation,
    hitFeedbackByReceiverId = {},
    opacity = 1
  ) {
    const previousIconPhase = {
      ...currentPhase,
      receiverColorsByPositionId:
        wallColorAnimation.previousColorsByPositionId ||
        currentPhase.receiverColorsByPositionId,

      receiverShapesByPositionId:
        wallColorAnimation.previousShapesByPositionId ||
        currentPhase.receiverShapesByPositionId
    };

    this.drawReceiverIcons(
      context,
      previousIconPhase,
      (1 - wallColorAnimation.progress) * opacity,
      hitFeedbackByReceiverId
    );

    this.drawReceiverIcons(
      context,
      currentPhase,
      wallColorAnimation.progress * opacity,
      hitFeedbackByReceiverId
    );
  }

  drawShortReceiverTrackPath(context, receiver) {
    const geometry = this.getShortReceiverTrackGeometry(receiver);

    context.moveTo(geometry.horizontalEnd.x, geometry.horizontalEnd.y);
    context.lineTo(geometry.horizontalStart.x, geometry.horizontalStart.y);
    context.quadraticCurveTo(geometry.curveControl.x, geometry.curveControl.y, geometry.curveEnd.x, geometry.curveEnd.y);
    context.lineTo(geometry.verticalEnd.x, geometry.verticalEnd.y);
  }

  drawMovingReceiverTrack(context, receiver, currentPhase, hitStrength = 0) {
    const receiverNeonColor = this.getReceiverNeonColor(receiver, currentPhase);

    const thicknessMultiplier =
      1 +
      hitStrength *
      (GAME_CONFIG.receiverHitThicknessMultiplier - 1);

    const haloMultiplier =
      1 +
      hitStrength *
      (GAME_CONFIG.receiverHitHaloMultiplier - 1);

    context.save();
    context.shadowColor = receiverNeonColor;
    context.shadowBlur = this.scaler.x(48) * haloMultiplier;
    context.strokeStyle = receiverNeonColor;
    context.lineCap = "round";
    context.lineJoin = "round";

    context.beginPath();
    this.getMovingReceiverTrackSegments(receiver, currentPhase).forEach((segment) => {
      context.moveTo(segment.start.x, segment.start.y);
      context.lineTo(segment.end.x, segment.end.y);
    });

    context.globalAlpha = 1;
    context.lineWidth = this.scaler.x(7) * thicknessMultiplier;
    context.stroke();
    context.restore();
  }

  drawReceiverTrack(context, receiver, currentPhase, colorOverride = null, opacity = 1, hitStrength = 0) {
    const layout = this.getScaledLayout();
    const middleX = layout.outerX + layout.outerWidth / 2;
    const middleY = layout.outerY + layout.outerHeight / 2;
    const rightX = layout.outerX + layout.outerWidth;
    const bottomY = layout.outerY + layout.outerHeight;

    const receiverNeonColor = colorOverride || this.getReceiverNeonColor(receiver, currentPhase);

    const thicknessMultiplier =
      1 +
      hitStrength *
      (GAME_CONFIG.receiverHitThicknessMultiplier - 1);

    const haloMultiplier =
      1 +
      hitStrength *
      (GAME_CONFIG.receiverHitHaloMultiplier - 1);

    context.save();
    context.shadowColor = receiverNeonColor;
    context.shadowBlur = this.scaler.x(48) * haloMultiplier;
    context.strokeStyle = receiverNeonColor;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = this.scaler.x(4);

    context.beginPath();

    if (currentPhase.usesShortReceiverTracks) {
      this.drawShortReceiverTrackPath(context, receiver);
    } else if (receiver.id === "topLeft") {
      context.moveTo(middleX, layout.outerY + layout.railSize / 2);
      context.lineTo(layout.outerX + layout.cornerRadius, layout.outerY + layout.railSize / 2);
      context.quadraticCurveTo(layout.outerX + layout.railSize / 2, layout.outerY + layout.railSize / 2, layout.outerX + layout.railSize / 2, layout.outerY + layout.cornerRadius);
      context.lineTo(layout.outerX + layout.railSize / 2, middleY);
    } else if (receiver.id === "topRight") {
      context.moveTo(middleX, layout.outerY + layout.railSize / 2);
      context.lineTo(rightX - layout.cornerRadius, layout.outerY + layout.railSize / 2);
      context.quadraticCurveTo(rightX - layout.railSize / 2, layout.outerY + layout.railSize / 2, rightX - layout.railSize / 2, layout.outerY + layout.cornerRadius);
      context.lineTo(rightX - layout.railSize / 2, middleY);
    } else if (receiver.id === "bottomLeft") {
      context.moveTo(layout.outerX + layout.railSize / 2, middleY);
      context.lineTo(layout.outerX + layout.railSize / 2, bottomY - layout.cornerRadius);
      context.quadraticCurveTo(layout.outerX + layout.railSize / 2, bottomY - layout.railSize / 2, layout.outerX + layout.cornerRadius, bottomY - layout.railSize / 2);
      context.lineTo(middleX, bottomY - layout.railSize / 2);
    } else {
      context.moveTo(rightX - layout.railSize / 2, middleY);
      context.lineTo(rightX - layout.railSize / 2, bottomY - layout.cornerRadius);
      context.quadraticCurveTo(rightX - layout.railSize / 2, bottomY - layout.railSize / 2, rightX - layout.cornerRadius, bottomY - layout.railSize / 2);
      context.lineTo(middleX, bottomY - layout.railSize / 2);
    }


    context.globalAlpha = opacity;
    context.lineWidth = this.scaler.x(7) * thicknessMultiplier;
    context.globalCompositeOperation = "lighter";
    context.stroke();
    context.restore();
  }

  drawReceiverIcons(context, currentPhase, opacity = 1, hitFeedbackByReceiverId = {}) {
    const layout = this.layout;
    const iconMargin = 64;
    const receiverIconRadius = this.scaler.x(GAME_CONFIG.shapeRadius);
    const iconPositionsByReceiverId = currentPhase.usesMovingReceiverTracks
      ? this.receivers.reduce((positionsByReceiverId, receiver) => {
        positionsByReceiverId[receiver.id] = this.getMovingReceiverIconPoint(receiver, currentPhase);
        return positionsByReceiverId;
      }, {})
      : {
        topLeft: this.scaler.point(layout.innerX + iconMargin, layout.innerY + iconMargin),
        topRight: this.scaler.point(layout.innerX + layout.innerWidth - iconMargin, layout.innerY + iconMargin),
        bottomLeft: this.scaler.point(layout.innerX + iconMargin, layout.innerY + layout.innerHeight - iconMargin),
        bottomRight: this.scaler.point(layout.innerX + layout.innerWidth - iconMargin, layout.innerY + layout.innerHeight - iconMargin)
      };

    // Les symboles de reference sont dans les coins du carre interieur,
    // separes des rails neon pour ne pas donner l'impression qu'ils sont sur le mur.
    this.receivers.forEach((receiver) => {
      const hitStrength =
        hitFeedbackByReceiverId[receiver.id] || 0;

      const strokeMultiplier =
        1 +
        hitStrength *
        (GAME_CONFIG.receiverIconHitThicknessMultiplier - 1);

      const glowMultiplier =
        1 +
        hitStrength *
        (GAME_CONFIG.receiverIconHitHaloMultiplier - 1);

      ShapeRenderer.draw(
        context,
        iconPositionsByReceiverId[receiver.id],
        this.getReceiverShapeName(receiver, currentPhase),
        this.getReceiverNeonColor(receiver, currentPhase),
        receiverIconRadius,
        opacity,
        glowMultiplier,
        strokeMultiplier
      );
    });
  }

  drawInnerGuide(context) {
    const layout = this.getScaledLayout();

    context.save();
    context.strokeStyle = "rgba(255,255,255,0.07)";
    context.lineWidth = this.scaler.x(1);
    ShapeRenderer.roundRect(context, layout.innerX, layout.innerY, layout.innerWidth, layout.innerHeight, layout.cornerRadius);
    context.stroke();
    context.restore();
  }
}

class ShapeRenderer {
  static draw(context, center, shapeName, color, radius, opacity = 1, glowMultiplier = 1, strokeMultiplier = 1) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = Math.max(radius * 0.06, 1.8);
    context.shadowColor = color;
    context.shadowBlur = radius * 0.75 * glowMultiplier;
    context.lineJoin = "round";
    context.lineCap = "round";

    ShapeRenderer.createPath(context, center, shapeName, radius);

    context.globalAlpha = opacity;
    context.lineWidth = Math.max(radius * 0.09, 2.6) * strokeMultiplier;
    context.globalCompositeOperation = "lighter";
    context.stroke();
    context.restore();
  }

  static createPath(context, center, shapeName, radius) {
    context.beginPath();

    if (shapeName === "circle") {
      context.arc(center.x, center.y, radius, 0, Math.PI * 2);
      return;
    }

    if (shapeName === "square") {
      const sideLength = radius * 1.45;
      context.rect(center.x - sideLength / 2, center.y - sideLength / 2, sideLength, sideLength);
      return;
    }

    if (shapeName === "triangle") {
      const triangleRadius = radius * 1.35;
      context.moveTo(center.x, center.y - triangleRadius);
      context.lineTo(center.x + triangleRadius * 0.9, center.y + triangleRadius * 0.72);
      context.lineTo(center.x - triangleRadius * 0.9, center.y + triangleRadius * 0.72);
      context.closePath();
      return;
    }

    ShapeRenderer.createStarPath(context, center.x, center.y, radius * 0.56, radius * 1.08, 5);
  }

  static createStarPath(context, x, y, innerRadius, outerRadius, spikeCount) {
    let angle = -Math.PI / 2;
    const angleStep = Math.PI / spikeCount;

    for (let index = 0; index < spikeCount * 2; index += 1) {
      const radius = index % 2 === 0 ? outerRadius : innerRadius;
      const pointX = x + Math.cos(angle) * radius;
      const pointY = y + Math.sin(angle) * radius;

      if (index === 0) {
        context.moveTo(pointX, pointY);
      } else {
        context.lineTo(pointX, pointY);
      }

      angle += angleStep;
    }

    context.closePath();
  }

  static roundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }
}

class GameRules {
  constructor(arena) {
    this.arena = arena;
  }

  getCurrentPhase(score) {
    return [...GAME_PHASES]
      .reverse()
      .find((phase) => score >= phase.startScore);
  }

  getCurrentRuleName(score) {
    return this.getCurrentPhase(score).ruleName;
  }

  getLevel(score) {
    return this.getCurrentPhase(score).level;
  }

  getExpectedReceiver(fallingShape, currentPhase) {
    if (currentPhase.ruleName === "COLOR") {
      return this.arena.findReceiverByCurrentColor(fallingShape.colorId, currentPhase);
    }

    return this.arena.findReceiverByCurrentShape(fallingShape.shapeName, currentPhase);
  }
}

class DynamicRuleSequenceController {
  constructor() {
    this.reset();
  }

  reset() {
    this.activeRuleName = null;
    this.remainingAnswersInSequence = 0;
  }

  getRuleNameForPhase(phase) {
    if (!phase.usesDynamicRuleSequence) return phase.ruleName;

    this.ensureSequenceHasStarted(phase);
    return this.activeRuleName;
  }

  getPhaseWithCurrentRule(phase) {
    if (!phase.usesDynamicRuleSequence) return phase;

    return {
      ...phase,
      ruleName: this.getRuleNameForPhase(phase)
    };
  }

  consumeSuccessfulAnswer(answeredPhase, nextPhase = answeredPhase) {
    if (!answeredPhase.usesDynamicRuleSequence) return null;

    this.ensureSequenceHasStarted(answeredPhase);
    this.remainingAnswersInSequence -= 1;

    if (this.remainingAnswersInSequence > 0) return null;

    this.activeRuleName = this.getOppositeRuleName(this.activeRuleName);
    this.remainingAnswersInSequence = nextPhase.usesDynamicRuleSequence
      ? this.createSequenceLength(nextPhase)
      : 0;
    return this.activeRuleName;
  }

  ensureSequenceHasStarted(phase) {
    if (this.activeRuleName && this.remainingAnswersInSequence > 0) return;

    this.activeRuleName = phase.ruleName;
    this.remainingAnswersInSequence = this.createSequenceLength(phase);
  }

  createSequenceLength(phase) {
    const minAnswers = phase.dynamicRuleMinAnswers;
    const maxAnswers = phase.dynamicRuleMaxAnswers;
    return minAnswers + Math.floor(Math.random() * (maxAnswers - minAnswers + 1));
  }

  forceNewSequence(phase) {
    if (!phase.usesDynamicRuleSequence) return;

    this.activeRuleName = this.activeRuleName || phase.ruleName;
    this.remainingAnswersInSequence = this.createSequenceLength(phase);
  }

  getOppositeRuleName(ruleName) {
    return ruleName === "COLOR" ? "SHAPE" : "COLOR";
  }
}

class ReceiverPermutationController {
  constructor({ initialReceiverColorsByPositionId, initialReceiverShapesByPositionId }) {
    this.initialReceiverColorsByPositionId = initialReceiverColorsByPositionId;
    this.initialReceiverShapesByPositionId = initialReceiverShapesByPositionId;
    this.receiverIds = Object.keys(initialReceiverColorsByPositionId);
    this.reset();
  }

  reset() {
    this.currentReceiverColorsByPositionId = { ...this.initialReceiverColorsByPositionId };
    this.currentReceiverShapesByPositionId = { ...this.initialReceiverShapesByPositionId };
    this.previousReceiverColorsByPositionId = null;
    this.previousReceiverShapesByPositionId = null;
    this.permutationStartedAt = 0;
    this.permutationProgress = 1;
    this.isAnimating = false;
  }

  syncToPhase(phase) {
    this.currentReceiverColorsByPositionId = { ...phase.receiverColorsByPositionId };
    this.currentReceiverShapesByPositionId = { ...phase.receiverShapesByPositionId };
    this.previousReceiverColorsByPositionId = null;
    this.previousReceiverShapesByPositionId = null;
    this.permutationStartedAt = 0;
    this.permutationProgress = 1;
    this.isAnimating = false;
  }

  startPermutation(currentTime, phase) {
    const shouldPermuteColors = Boolean(phase.permutesReceiverColorsAfterSuccess);
    const shouldPermuteShapes = Boolean(phase.permutesReceiverShapesAfterSuccess);

    this.previousReceiverColorsByPositionId = shouldPermuteColors ? { ...this.currentReceiverColorsByPositionId } : null;
    this.previousReceiverShapesByPositionId = shouldPermuteShapes ? { ...this.currentReceiverShapesByPositionId } : null;

    if (shouldPermuteColors) {
      this.currentReceiverColorsByPositionId = this.createForcedPermutation(this.previousReceiverColorsByPositionId);
    }

    if (shouldPermuteShapes) {
      this.currentReceiverShapesByPositionId = this.createForcedPermutation(this.previousReceiverShapesByPositionId);
    }

    this.permutationStartedAt = currentTime;
    this.permutationProgress = 0;
    this.isAnimating = shouldPermuteColors || shouldPermuteShapes;
  }

  update(currentTime) {
    if (!this.isAnimating) return false;

    const elapsedPermutationMs = currentTime - this.permutationStartedAt;
    this.permutationProgress = clamp(elapsedPermutationMs / GAME_CONFIG.receiverPermutationDurationMs, 0, 1);

    if (this.permutationProgress < 1) return false;

    this.previousReceiverColorsByPositionId = null;
    this.previousReceiverShapesByPositionId = null;
    this.isAnimating = false;
    return true;
  }

  createForcedPermutation(previousValuesByPositionId) {
    const previousValues = this.receiverIds.map((receiverId) => previousValuesByPositionId[receiverId]);

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const shuffledValues = this.shuffleValues(previousValues);
      const isForcedPermutation = shuffledValues.every((value, index) => {
        return value !== previousValuesByPositionId[this.receiverIds[index]];
      });

      if (isForcedPermutation) {
        return this.mapValuesToReceivers(shuffledValues);
      }
    }

    return this.rotateValuesClockwise(previousValuesByPositionId);
  }

  shuffleValues(values) {
    const shuffledValues = [...values];

    for (let index = shuffledValues.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffledValues[index], shuffledValues[randomIndex]] = [shuffledValues[randomIndex], shuffledValues[index]];
    }

    return shuffledValues;
  }

  mapValuesToReceivers(values) {
    return this.receiverIds.reduce((valuesByReceiverId, receiverId, index) => {
      valuesByReceiverId[receiverId] = values[index];
      return valuesByReceiverId;
    }, {});
  }

  rotateValuesClockwise(previousValuesByPositionId) {
    const nextValuesByPositionId = {};

    Object.entries(CLOCKWISE_RECEIVER_ROTATION_BY_POSITION_ID).forEach(([fromReceiverId, toReceiverId]) => {
      nextValuesByPositionId[toReceiverId] = previousValuesByPositionId[fromReceiverId];
    });

    return nextValuesByPositionId;
  }

  getPhaseWithCurrentPermutation(phase) {
    if (!this.phaseUsesReceiverPermutation(phase)) return phase;

    return {
      ...phase,
      receiverColorsByPositionId: this.currentReceiverColorsByPositionId,
      receiverShapesByPositionId: this.currentReceiverShapesByPositionId
    };
  }

  phaseUsesReceiverPermutation(phase) {
    return Boolean(phase.permutesReceiverColorsAfterSuccess || phase.permutesReceiverShapesAfterSuccess);
  }

  get animationState() {
    if (!this.isAnimating || this.permutationProgress >= 1) return null;

    return {
      previousColorsByPositionId: this.previousReceiverColorsByPositionId,
      previousShapesByPositionId: this.previousReceiverShapesByPositionId,
      progress: this.permutationProgress
    };
  }
}

class ReceiverRotationController {
  constructor({ initialValuesByPositionId, intervalMs, durationMs }) {
    this.initialValuesByPositionId = initialValuesByPositionId;
    this.intervalMs = intervalMs;
    this.durationMs = durationMs;
    this.reset();
  }

  reset() {
    this.currentValuesByPositionId = { ...this.initialValuesByPositionId };
    this.previousValuesByPositionId = null;
    this.isActive = false;
    this.lastRotationTime = 0;
    this.rotationStartedAt = 0;
    this.rotationProgress = 1;
  }

  stop() {
    this.isActive = false;
    this.previousValuesByPositionId = null;
    this.lastRotationTime = 0;
    this.rotationStartedAt = 0;
    this.rotationProgress = 1;
  }

  update(currentTime, shouldRunRotation) {
    if (!shouldRunRotation) {
      if (this.isActive) {
        this.stop();
      }
      return;
    }

    if (!this.isActive) {
      this.start(currentTime);
      return;
    }

    this.updateAnimationProgress(currentTime);

    if (currentTime - this.lastRotationTime >= this.intervalMs) {
      this.rotateClockwise(currentTime);
    }
  }

  start(currentTime) {
    this.isActive = true;
    this.previousValuesByPositionId = null;
    this.lastRotationTime = currentTime;
    this.rotationStartedAt = 0;
    this.rotationProgress = 1;
  }

  updateAnimationProgress(currentTime) {
    if (this.rotationProgress >= 1) return;

    const elapsedRotationMs = currentTime - this.rotationStartedAt;
    this.rotationProgress = clamp(elapsedRotationMs / this.durationMs, 0, 1);

    if (this.rotationProgress === 1) {
      this.previousValuesByPositionId = null;
    }
  }

  rotateClockwise(currentTime) {
    const previousValuesByPositionId = { ...this.currentValuesByPositionId };
    const nextValuesByPositionId = {};

    Object.entries(CLOCKWISE_RECEIVER_ROTATION_BY_POSITION_ID).forEach(([fromReceiverId, toReceiverId]) => {
      nextValuesByPositionId[toReceiverId] = previousValuesByPositionId[fromReceiverId];
    });

    this.previousValuesByPositionId = previousValuesByPositionId;
    this.currentValuesByPositionId = nextValuesByPositionId;
    this.rotationStartedAt = currentTime;
    this.lastRotationTime = currentTime;
    this.rotationProgress = 0;
  }

  get animationProgress() {
    return this.rotationProgress;
  }

  get previousValues() {
    if (!this.previousValuesByPositionId || this.rotationProgress >= 1) return null;
    return this.previousValuesByPositionId;
  }
}


class ChallengePhysics {
  static getSpawnImpulse(challengePhase) {
    if (challengePhase.usesPreciseDuoSelection) {
      return GAME_CONFIG.spawnImpulse * GAME_CONFIG.level19SpawnImpulseMultiplier;
    }

    return GAME_CONFIG.spawnImpulse;
  }

  static getGravity(challengePhase) {
    if (challengePhase.usesPreciseDuoSelection) {
      return GAME_CONFIG.gravity * GAME_CONFIG.level19GravityMultiplier;
    }
    return GAME_CONFIG.gravity;
  }
}

class GameStateController {
  constructor(initialState = "ready") {
    this.currentState = initialState;
  }

  set(stateName) {
    this.currentState = stateName;
  }

  is(stateName) {
    return this.currentState === stateName;
  }

  get value() {
    return this.currentState;
  }

  get canReceiveInput() {
    return this.is("playing");
  }

  get isWaitingToStart() {
    return this.is("waiting");
  }

  get isShowingLevelIntro() {
    return this.is("level11Intro") || this.is("level12Intro")
  }
}

class SpawnController {
  constructor(game) {
    this.game = game;
    this.strategies = {
      bottom: (phase) => this.getBottomSpawn(phase),
      top: () => this.getTopSpawn(),
      left: () => this.getLeftSpawn(),
      right: () => this.getRightSpawn(),
      side: () => this.getSideSpawn(),
      random: (phase) => this.getRandomEntrySpawn(phase),
      movingGap: (phase) => this.getMovingGapSpawn(phase),
      movingGapDuo: (phase) => this.getMovingGapSpawn(phase)
    };
  }

  getSingleShapeSpawn(phase) {
    const projectileEntry = phase.projectileEntry || "bottom";
    const spawnStrategy = this.strategies[projectileEntry] || this.strategies.bottom;
    return spawnStrategy(phase);
  }

  getBottomSpawn() {
    const { scaler } = this.game;

    return {
      x: scaler.x(GAME_CONFIG.designWidth / 2),
      y: scaler.y(GAME_CONFIG.designHeight + 38),
      velocityX: 0,
      velocityY: scaler.y(this.game.currentChallengeSpawnImpulse)
    };
  }

  getTopSpawn() {
    const { scaler } = this.game;

    return {
      x: scaler.x(GAME_CONFIG.designWidth / 2),
      y: scaler.y(40),
      velocityX: 0,
      velocityY: 0
    };
  }

  getSideSpawn() {
    return Math.random() < 0.5 ? this.getLeftSpawn() : this.getRightSpawn();
  }

  getLeftSpawn() {
    const { scaler } = this.game;
    const spawnY = scaler.y(GAME_CONFIG.designHeight * GAME_CONFIG.sideEntryHeightRatio);

    return {
      x: scaler.x(-GAME_CONFIG.shapeRadius - 8),
      y: spawnY,
      velocityX: scaler.x(GAME_CONFIG.sideEntryHorizontalImpulse),
      velocityY: scaler.y(GAME_CONFIG.sideEntryUpwardImpulse)
    };
  }

  getRightSpawn() {
    const { scaler } = this.game;
    const spawnY = scaler.y(GAME_CONFIG.designHeight * GAME_CONFIG.sideEntryHeightRatio);

    return {
      x: scaler.x(GAME_CONFIG.designWidth + GAME_CONFIG.shapeRadius + 8),
      y: spawnY,
      velocityX: scaler.x(-GAME_CONFIG.sideEntryHorizontalImpulse),
      velocityY: scaler.y(GAME_CONFIG.sideEntryUpwardImpulse)
    };
  }

  getRandomEntrySpawn(phase) {
    const randomEntry = getRandomItem(["bottom", "top", "left", "right"]);
    return this.getSingleShapeSpawn({
      ...phase,
      projectileEntry: randomEntry
    });
  }

  getMovingGapSpawn(phase) {
    const movingPhase = {
      ...phase,
      movingReceiverOffset: this.game.movingReceiverOffset
    };
    const spawnOptions = this.game.arena.getMovingBottomGapSpawnOptions(movingPhase);
    const { spawnX } = getRandomItem(spawnOptions);

    return {
      x: spawnX,
      y: this.game.scaler.y(GAME_CONFIG.designHeight + 38),
      velocityX: this.getMovingBottomSpawnVelocityX(spawnX),
      velocityY: this.game.scaler.y(this.game.currentChallengeSpawnImpulse)
    };
  }

  getMovingBottomSpawnVelocityX(spawnX) {
    const { scaler } = this.game;
    const arenaCenterX = scaler.x(GAME_CONFIG.designWidth / 2);
    const centerZoneHalfWidth = scaler.x(GAME_CONFIG.movingBottomSpawnCenterZoneWidth / 2);

    if (spawnX < arenaCenterX - centerZoneHalfWidth) {
      return scaler.x(GAME_CONFIG.movingBottomSpawnHorizontalImpulse);
    }

    if (spawnX > arenaCenterX + centerZoneHalfWidth) {
      return -scaler.x(GAME_CONFIG.movingBottomSpawnHorizontalImpulse);
    }

    return 0;
  }
}

class ChallengeManager {
  constructor() {
    this.clear();
    this.secondDuoShapeTimeoutId = null;
    this.nextSingleShapeTimeoutId = null;
  }

  clear() {
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.currentChallengePhase = null;
    this.selectedShape = null;
  }

  setSingleShape(fallingShape, challengePhase = null) {
    this.currentShapes = this.currentShapes.filter((shape) => shape.state !== "resolved");
    this.activeShape = fallingShape;
    this.currentShapes.push(fallingShape);
    this.activeShapeIndex = this.currentShapes.indexOf(fallingShape);
    this.currentChallengePhase = challengePhase;
    this.selectedShape = null;
  }

  setFirstDuoShape(fallingShape, challengePhase) {
    this.currentChallengePhase = challengePhase;
    this.currentShapes = [fallingShape];
    this.activeShape = fallingShape;
    this.activeShapeIndex = 0;
    this.selectedShape = null;
  }

  appendSecondDuoShape(fallingShape) {
    this.currentShapes.push(fallingShape);
  }

  moveActiveShapeToLaunchedShapes() {
    const launchedShape = this.activeShape;
    if (!launchedShape) return null;

    this.activeShape = null;
    this.activeShapeIndex = null;
    this.selectedShape = null;
    return launchedShape;
  }

  selectShapeForSwipe(fallingShape) {
    this.selectedShape = fallingShape;
    this.activeShape = fallingShape;
    this.activeShapeIndex = this.currentShapes.indexOf(fallingShape);
  }

  clearSelectedShape() {
    this.selectedShape = null;
  }

  findSelectableShapeAtPoint(point) {
    return this.currentShapes.find((fallingShape) => {
      if (!fallingShape.canReceiveSwipe || fallingShape.hasBeenThrown) return false;

      const distanceFromShapeCenter = Math.hypot(point.x - fallingShape.x, point.y - fallingShape.y);
      return distanceFromShapeCenter <= fallingShape.radius * GAME_CONFIG.level19SelectionHitboxMultiplier;
    }) || null;
  }

  areAllShapesResolved() {
    return this.currentShapes.length > 0 && this.currentShapes.every((fallingShape) => fallingShape.state === "resolved");
  }

  clearActiveDuoShape() {
    this.activeShapeIndex = null;
    this.activeShape = null;
  }

  setSecondShapeTimeout(timeoutId) {
    this.secondDuoShapeTimeoutId = timeoutId;
  }

  clearSecondShapeTimeout() {
    if (this.secondDuoShapeTimeoutId === null) return;

    window.clearTimeout(this.secondDuoShapeTimeoutId);
    this.secondDuoShapeTimeoutId = null;
  }

  setNextSingleShapeTimeout(timeoutId) {
    this.nextSingleShapeTimeoutId = timeoutId;
  }

  clearNextSingleShapeTimeout() {
    if (this.nextSingleShapeTimeoutId === null) return;

    window.clearTimeout(this.nextSingleShapeTimeoutId);
    this.nextSingleShapeTimeoutId = null;
  }

  hasPendingNextSingleShape() {
    return this.nextSingleShapeTimeoutId !== null;
  }

  hasUnresolvedShapes() {
    return this.currentShapes.some((fallingShape) => fallingShape.state !== "resolved");
  }

  getVisibleShapes(usesDuoShapes) {
    return usesDuoShapes ? this.currentShapes : this.currentShapes;
  }
}

class ThrowController {
  constructor({ scaler, arena, getActiveShape, usesDuoShapes, activateNextDuoShape }) {
    this.scaler = scaler;
    this.arena = arena;
    this.getActiveShape = getActiveShape;
    this.usesDuoShapes = usesDuoShapes;
    this.activateNextDuoShape = activateNextDuoShape;
  }

  throwFromSwipe(swipeGesture) {
    const activeShape = this.getActiveShape();
    if (!activeShape || !activeShape.canReceiveSwipe || swipeGesture.distance < this.scaler.x(GAME_CONFIG.minSwipeDistance)) return;

    const direction = {
      x: swipeGesture.deltaX,
      y: swipeGesture.deltaY
    };
    const throwForce = this.calculateSwipeThrowForce(swipeGesture.distance, swipeGesture.durationMs);

    activeShape.throwToward(direction, throwForce, this.usesDuoShapes());
    this.activateNextDuoShape();
    return activeShape;
  }

  throwAtTarget(target, gestureDistance = this.scaler.x(120), gestureDurationMs = 110) {
    const activeShape = this.getActiveShape();
    if (!activeShape || !activeShape.canReceiveSwipe) return;

    const direction = this.resolveThrowDirection(target);
    if (!direction) return;

    const throwForce = this.calculateThrowForce(direction, gestureDistance, gestureDurationMs);
    activeShape.throwToward(direction, throwForce, this.usesDuoShapes());
    this.activateNextDuoShape();
    return activeShape;
  }

  resolveThrowDirection(target) {
    const basicDirections = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };

    if (basicDirections[target]) return basicDirections[target];

    const activeShape = this.getActiveShape();
    const receiver = this.arena.findReceiverById(target);
    if (!receiver || !activeShape) return null;

    const aimPoint = this.arena.getReceiverAimPoint(receiver);
    return {
      x: aimPoint.x - activeShape.x,
      y: aimPoint.y - activeShape.y
    };
  }

  calculateSwipeThrowForce(gestureDistance, gestureDurationMs) {
    const gestureForce = (gestureDistance / Math.max(gestureDurationMs, 1)) * this.scaler.x(760);

    return clamp(
      gestureForce,
      this.scaler.x(GAME_CONFIG.minThrowForce),
      this.scaler.x(GAME_CONFIG.maxThrowForce)
    );
  }

  calculateThrowForce(direction, gestureDistance, gestureDurationMs) {
    const directionLength = Math.hypot(direction.x, direction.y) || 1;
    const normalizedY = direction.y / directionLength;
    const gestureForce = (gestureDistance / Math.max(gestureDurationMs, 1)) * this.scaler.x(760);
    const upwardBoost = normalizedY < -0.2 ? this.scaler.x(GAME_CONFIG.upwardThrowBoost) : 0;

    return clamp(
      gestureForce + upwardBoost,
      this.scaler.x(GAME_CONFIG.minThrowForce),
      this.scaler.x(GAME_CONFIG.maxThrowForce)
    );
  }
}

class ReceiverEffectsController {
  constructor() {
    this.permutation = new ReceiverPermutationController({
      initialReceiverColorsByPositionId: LEVEL_8_INITIAL_RECEIVER_COLORS_BY_POSITION_ID,
      initialReceiverShapesByPositionId: LEVEL_7_RECEIVER_SHAPES_BY_POSITION_ID
    });
    this.colorRotation = new ReceiverRotationController({
      initialValuesByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID,
      intervalMs: GAME_CONFIG.level10WallRotationIntervalMs,
      durationMs: GAME_CONFIG.level10WallRotationDurationMs
    });
    this.shapeRotation = new ReceiverRotationController({
      initialValuesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID,
      intervalMs: GAME_CONFIG.shapeRotationIntervalMs,
      durationMs: GAME_CONFIG.shapeRotationDurationMs
    });
    this.hitFeedbacks = [];
  }

  reset() {
    this.permutation.reset();
    this.colorRotation.reset();
    this.shapeRotation.reset();
    this.hitFeedbacks = [];
  }

  stopAll() {
    this.reset();
  }

  stopRotations() {
    this.colorRotation.stop();
    this.shapeRotation.stop();
  }

  syncPermutationToPhase(phase) {
    this.permutation.syncToPhase(phase);
  }

  startPermutation(currentTime, phase) {
    this.permutation.startPermutation(currentTime, phase);
  }

  updatePermutation(currentTime) {
    return this.permutation.update(currentTime);
  }

  updateRotations(currentTime, phase, gameState) {
    this.colorRotation.update(currentTime, gameState === "playing" && this.phaseUsesColorRotation(phase));
    this.shapeRotation.update(currentTime, gameState === "playing" && this.phaseUsesShapeRotation(phase));
  }

  startColorRotation(currentTime) {
    this.colorRotation.start(currentTime);
    this.colorRotation.rotateClockwise(currentTime);
  }

  startShapeRotation(currentTime) {
    this.shapeRotation.start(currentTime);
    this.shapeRotation.rotateClockwise(currentTime);
  }

  updateColorRotation(currentTime, shouldRunRotation) {
    this.colorRotation.update(currentTime, shouldRunRotation);
  }

  updateShapeRotation(currentTime, shouldRunRotation) {
    this.shapeRotation.update(currentTime, shouldRunRotation);
  }

  stopColorRotation() {
    this.colorRotation.stop();
  }

  stopShapeRotation() {
    this.shapeRotation.stop();
  }

  getPhaseWithCurrentReceiverState(phase) {
    const receiverPermutationPhase = this.permutation.getPhaseWithCurrentPermutation(phase);

    return {
      ...receiverPermutationPhase,
      receiverColorsByPositionId: this.phaseUsesColorRotationLayout(receiverPermutationPhase)
        ? this.colorRotation.currentValuesByPositionId
        : receiverPermutationPhase.receiverColorsByPositionId,
      receiverShapesByPositionId: this.phaseUsesShapeRotationLayout(receiverPermutationPhase)
        ? this.shapeRotation.currentValuesByPositionId
        : receiverPermutationPhase.receiverShapesByPositionId
    };
  }

  get animationState() {
    return this.permutation.animationState || this.rotationAnimationState;
  }

  get rotationAnimationState() {
    const previousColorsByPositionId = this.colorRotation.previousValues;
    const previousShapesByPositionId = this.shapeRotation.previousValues;

    if (!previousColorsByPositionId && !previousShapesByPositionId) return null;

    return {
      previousColorsByPositionId,
      previousShapesByPositionId,
      progress: previousColorsByPositionId
        ? this.colorRotation.animationProgress
        : this.shapeRotation.animationProgress
    };
  }

  phaseUsesColorRotation(phase) {
    return Boolean(phase.usesDynamicWallColors || (phase.usesRuleControlledReceiverRotation && phase.ruleName === "COLOR"));
  }

  phaseUsesShapeRotation(phase) {
    return Boolean(phase.usesDynamicReceiverShapes || (phase.usesRuleControlledReceiverRotation && phase.ruleName === "SHAPE"));
  }

  phaseUsesColorRotationLayout(phase) {
    return Boolean(phase.usesDynamicWallColors || phase.usesDynamicReceiverShapes || phase.usesRuleControlledReceiverRotation);
  }

  phaseUsesShapeRotationLayout(phase) {
    return Boolean(phase.usesDynamicReceiverShapes || phase.usesRuleControlledReceiverRotation);
  }

  phaseUsesReceiverRotation(phase) {
    return this.phaseUsesColorRotation(phase) || this.phaseUsesShapeRotation(phase);
  }

  startHitFeedback(receiverId, currentTime) {
    this.hitFeedbacks.push({
      receiverId,
      startedAt: currentTime
    });
  }

  getHitFeedbackByReceiverId(currentTime) {
    this.hitFeedbacks = this.hitFeedbacks.filter(
      (feedback) =>
        currentTime - feedback.startedAt <
        GAME_CONFIG.receiverHitFeedbackDurationMs
    );

    return this.hitFeedbacks.reduce(
      (feedbackByReceiverId, feedback) => {
        const elapsedMs =
          currentTime - feedback.startedAt;

        const progress = clamp(
          elapsedMs / GAME_CONFIG.receiverHitFeedbackDurationMs,
          0,
          1
        );

        // Monte très vite, puis redescend doucement.
        let strength;

        if (progress < 0.3) {
          strength = progress / 0.3;
        } else {
          strength = 1 - (progress - 0.3) / 0.7;
        }

        feedbackByReceiverId[feedback.receiverId] =
          Math.max(
            feedbackByReceiverId[feedback.receiverId] || 0,
            strength
          );

        return feedbackByReceiverId;
      },
      {}
    );
  }

}

class LevelIntroController {
  constructor(receiverEffects, dynamicRuleSequence) {
    this.receiverEffects = receiverEffects;
    this.dynamicRuleSequence = dynamicRuleSequence;
    this.reset();
  }

  reset() {
    this.playedIntroByLevel = {
      11: false,
      12: false
    };

    this.startedAt = 0;
    this.endsAt = 0;

    this.hasStartedColorRotation = false;
    this.hasStartedShapeRotation = false;
  }

  shouldStart(resolvedChallengePhase, nextPhase) {
    const nextLevel = nextPhase.level;
    const previousLevel = resolvedChallengePhase?.level;

    if (previousLevel === nextLevel) return false;

    return Boolean(
      this.playedIntroByLevel[nextLevel] === false
    );
  }

  start(currentTime, introPhase) {
    this.startedAt = currentTime;

    this.hasStartedColorRotation = false;
    this.hasStartedShapeRotation = false;

    if (introPhase.level === 11) {
      this.playedIntroByLevel[11] = true;

      this.endsAt =
        currentTime +
        GAME_CONFIG.level11IntroDurationMs;

      return "level11Intro";
    }

    if (introPhase.level === 12) {
      this.playedIntroByLevel[12] = true;

      this.endsAt =
        currentTime +
        GAME_CONFIG.level12IntroDurationMs;

      return "level12Intro";
    }

    return null;
  }

  update(currentTime, state) {
    const elapsedMs =
      currentTime - this.startedAt;

    if (state === "level11Intro") {
      if (
        elapsedMs >= 200 &&
        !this.hasStartedColorRotation
      ) {
        this.receiverEffects.startColorRotation(
          currentTime
        );

        this.hasStartedColorRotation = true;
      }

      if (this.hasStartedColorRotation) {
        this.receiverEffects.updateColorRotation(
          currentTime,
          true
        );
      }
    }

    if (state === "level12Intro") {
      if (
        elapsedMs >= 200 &&
        !this.hasStartedShapeRotation
      ) {
        this.receiverEffects.startShapeRotation(
          currentTime
        );

        this.hasStartedShapeRotation = true;
      }

      if (this.hasStartedShapeRotation) {
        this.receiverEffects.updateShapeRotation(
          currentTime,
          true
        );
      }
    }

    return currentTime >= this.endsAt;
  }

  getLines(state) {
    if (state === "level12Intro") {
      return ["SHAPE ROTATION"];
    }

    return ["COLOR ROTATION"];
  }
}

class InputController {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.activeSwipeGesture = null;

    this.canvas.addEventListener("pointerdown", (event) => this.handlePointerDown(event));
    this.canvas.addEventListener("pointermove", (event) => this.handlePointerMove(event));
    this.canvas.addEventListener("pointerup", (event) => this.handlePointerUp(event));
    this.canvas.addEventListener("pointercancel", () => this.cancelSwipe());
    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
  }

  handlePointerDown(event) {
    event.preventDefault();

    if (
      this.game.isWaitingToStart() ||
      this.game.state === "ended"
    ) {
      this.game.reset();
      return;
    }

    if (!this.game.canReceiveInput()) return;

    const startPoint = this.getCanvasPoint(event);
    if (!this.game.prepareSwipeFromPoint(startPoint)) return;

    this.activeSwipeGesture = new SwipeGesture(event.pointerId, startPoint);
    this.canvas.setPointerCapture(event.pointerId);
  }

  handlePointerMove(event) {
    if (!this.isEventFromActivePointer(event)) return;

    event.preventDefault();
    this.activeSwipeGesture.update(this.getCanvasPoint(event));
  }

  handlePointerUp(event) {
    if (!this.isEventFromActivePointer(event)) return;

    event.preventDefault();
    this.activeSwipeGesture.update(this.getCanvasPoint(event));

    const finishedGesture = this.activeSwipeGesture;
    this.activeSwipeGesture = null;
    this.game.throwActiveShapeFromSwipe(finishedGesture);
  }

  handleKeyDown(event) {
    if (event.code === "Space") {
      this.game.startOrRestartFromKeyboard();
      event.preventDefault();
      return;
    }

    const target = KEYBOARD_TARGETS[event.code];
    if (!target) return;

    event.preventDefault();
    this.game.throwActiveShapeAtTarget(target);
  }

  cancelSwipe() {
    this.activeSwipeGesture = null;
  }

  isEventFromActivePointer(event) {
    return this.activeSwipeGesture && this.activeSwipeGesture.pointerId === event.pointerId;
  }

  getCanvasPoint(event) {
    const canvasBounds = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - canvasBounds.left,
      y: event.clientY - canvasBounds.top
    };
  }
}

class NeonSwipeGame {
  constructor({ canvas, restartButton, context }) {
    this.canvas = canvas;
    this.restartButton = restartButton;
    this.context = context;
    this.scaler = new GeometryScaler(GAME_CONFIG.designWidth, GAME_CONFIG.designHeight);
    this.arena = new Arena(this.scaler, RECEIVER_DEFINITIONS);
    this.rules = new GameRules(this.arena);
    this.dynamicRuleSequence = new DynamicRuleSequenceController();
    this.receiverEffects = new ReceiverEffectsController();
    this.levelIntro = new LevelIntroController(this.receiverEffects, this.dynamicRuleSequence);
    this.spawnController = new SpawnController(this);
    this.challengeManager = new ChallengeManager();
    this.throwController = new ThrowController({
      scaler: this.scaler,
      arena: this.arena,
      getActiveShape: () => this.activeShape,
      usesDuoShapes: () => this.activeChallengeUsesDuoShapes,
      activateNextDuoShape: () => this.activateNextDuoShape()
    });
    this.particleSystem = new ParticleSystem(this.scaler);
    this.stateController = new GameStateController("ready");
    this.inputController = new InputController(this.canvas, this);

    this.score = 0;
    this.lastAnimationTime = 0;
    this.centerMessage = "SWIPE";
    this.centerMessageUntil = 0;
    this.activeShapeRuleName = null;
    this.pendingLevelIntroPhase = null;
    this.movingReceiverOffset = 0;
  }

  start() {
    this.resize();
    this.showWaitingScreen();
    requestAnimationFrame((time) => this.gameLoop(time));

    this.restartButton.addEventListener("click", () => this.reset());
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const pixelRatio = this.scaler.updateFromCanvas(this.canvas);
    this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  reset() {
    this.clearPendingDuoSpawn();
    this.receiverEffects.reset();
    this.dynamicRuleSequence.reset();
    // TEMP TEST LEVEL 18 - restore to 0 after validation
    this.score = 23;
    this.state = "playing";
    this.resetLevelRuntime();
    this.movingReceiverOffset = 0;
    this.receiverEffects.syncPermutationToPhase(this.currentPhase);
    this.clearCurrentChallenge();
    this.activeShapeRuleName = null;
    this.pendingLevelIntroPhase = null;
    this.particleSystem.clear();
    this.showCenterMessage("COLOR", 1100);

    this.spawnNextChallenge();
  }

  showWaitingScreen() {
    this.clearPendingDuoSpawn();
    this.receiverEffects.reset();
    this.dynamicRuleSequence.reset();
    this.score = 0;
    this.state = "waiting";
    this.resetLevelRuntime();
    this.movingReceiverOffset = 0;
    this.clearCurrentChallenge();
    this.activeShapeRuleName = null;
    this.pendingLevelIntroPhase = null;
    this.particleSystem.clear();
    this.centerMessage = "PRESS TO START";
    this.centerMessageUntil = Infinity;

  }

  gameLoop(currentTime) {
    const deltaSeconds = Math.min((currentTime - this.lastAnimationTime) / 1000 || 0, 0.033);
    this.lastAnimationTime = currentTime;

    if (this.state === "playing") {
      this.updateReceiverRotations(currentTime);
      this.updateReceiverPermutation(currentTime);
      this.updateMovingReceiverTracks(deltaSeconds);
      this.updateActiveShape(deltaSeconds);
    } else if (this.state === "receiverPermutation") {
      this.updateReceiverPermutation(currentTime);
    } else if (this.isShowingLevelIntro) {
      this.updateLevelIntro(currentTime);
    } else {
      this.updateReceiverRotations(currentTime);
    }

    this.particleSystem.update(deltaSeconds);
    this.draw(currentTime);
    requestAnimationFrame((nextTime) => this.gameLoop(nextTime));
  }

  updateActiveShape(deltaSeconds) {
    if (this.activeChallengeUsesDuoShapes) {
      this.updateDuoShapes(deltaSeconds);
      return;
    }

    if (this.currentShapes.length === 0) return;

    this.currentShapes.forEach((shape) => {
      if (shape.state !== "resolved") {
        shape.update(deltaSeconds, shape.gravity || this.currentGravity);
      }
    });

    for (const shape of this.currentShapes) {
      if (shape.state === "resolved") continue;

      const touchedReceiver = this.arena.findReceiverHitByShape(shape, this.getCollisionPhaseForShape(shape));
      if (touchedReceiver) {
        this.resolveReceiverTouch(shape, touchedReceiver);
        return;
      }

      if (shape.isBelowScreen(this.scaler.canvasHeight, this.scaler.y(28))) {
        this.endGame("GAME OVER");
        return;
      }
    }
  }

  spawnNextChallenge() {
    if (this.currentPhase.usesPreciseDuoSelection) {
      this.spawnPreciseDuoShapes();
      return;
    }

    if (this.currentPhase.usesDuoShapes) {
      this.spawnDuoShapes();
      return;
    }

    this.spawnSingleShape();
  }

  spawnSingleShape() {
    this.currentChallengePhase = this.currentPhase;
    const spawn = this.getSingleShapeSpawn(this.currentChallengePhase);

    this.createSingleShapeFromSpawn(spawn);
  }

  createSingleShapeFromSpawn(spawn) {
    const challengePhaseSnapshot = this.createPhaseSnapshot(this.currentChallengePhase);
    const validationPhaseSnapshot = this.createPhaseSnapshot(
      this.getPhaseWithCurrentWallColors(this.currentChallengePhase)
    );
    const fallingShape = this.createShapeFromSpawn(spawn);
    const previousActiveShapeRuleName = this.activeShapeRuleName;

    fallingShape.challengePhase = challengePhaseSnapshot;
    fallingShape.validationPhase = validationPhaseSnapshot;
    fallingShape.gravity = this.scaler.x(ChallengePhysics.getGravity(challengePhaseSnapshot));
    fallingShape.advancedSpawnState = "none";

    this.challengeManager.setSingleShape(fallingShape, challengePhaseSnapshot);
    this.updateVisibleRuleForActiveShape(
      challengePhaseSnapshot.ruleName,
      previousActiveShapeRuleName
    );
  }

  updateVisibleRuleForActiveShape(nextRuleName, previousRuleName = this.activeShapeRuleName) {
    this.activeShapeRuleName = nextRuleName;

    if (previousRuleName && previousRuleName !== nextRuleName) {
      this.showRuleTransitionFeedback(nextRuleName);
    }
  }

  getSingleShapeSpawn(phase) {
    return this.spawnController.getSingleShapeSpawn(phase);
  }

  createPhaseSnapshot(phase) {
    if (!phase) return null;

    return {
      ...phase,
      receiverColorsByPositionId: { ...phase.receiverColorsByPositionId },
      receiverShapesByPositionId: { ...phase.receiverShapesByPositionId }
    };
  }

  spawnPreciseDuoShapes() {
    this.clearPendingDuoSpawn();
    this.currentChallengePhase = this.currentPhase;

    const firstShape = this.createShapeFromSpawn(this.getSingleShapeSpawn(this.currentChallengePhase));
    this.challengeManager.setFirstDuoShape(firstShape, this.currentChallengePhase);

    const secondShapeTimeoutId = window.setTimeout(() => {
      if (this.state !== "playing" || this.currentChallengePhase !== this.challengeManager.currentChallengePhase) return;
      if (!this.currentChallengePhase?.usesPreciseDuoSelection) return;

      const secondShape = this.createShapeFromSpawn(this.getSingleShapeSpawn(this.currentChallengePhase));
      this.challengeManager.appendSecondDuoShape(secondShape);
      this.secondDuoShapeTimeoutId = null;
    }, GAME_CONFIG.level19SecondShapeDelayMs);

    this.challengeManager.setSecondShapeTimeout(secondShapeTimeoutId);
  }

  createShapeFromSpawn(spawn, state = "active") {
    return new FallingShape({
      x: spawn.x,
      y: spawn.y,
      radius: this.scaler.x(GAME_CONFIG.shapeRadius),
      colorId: getRandomItem(AVAILABLE_COLOR_IDS),
      shapeName: getRandomItem(AVAILABLE_SHAPES),
      velocityX: spawn.velocityX,
      velocityY: spawn.velocityY,
      state
    });
  }

  spawnDuoShapes() {
    this.clearPendingDuoSpawn();
    this.currentChallengePhase = this.currentPhase;
    const firstShape = this.createDuoShape({
      x: this.scaler.x(GAME_CONFIG.designWidth * 0.27),
      y: this.scaler.y(GAME_CONFIG.designHeight + 42),
      velocityX: this.scaler.x(GAME_CONFIG.level7HorizontalImpulse),
      velocityY: this.scaler.y(GAME_CONFIG.spawnImpulse * GAME_CONFIG.level7SpawnImpulseMultiplier),
      state: "active"
    });

    this.challengeManager.setFirstDuoShape(firstShape, this.currentChallengePhase);

    this.secondDuoShapeTimeoutId = window.setTimeout(() => {
      if (this.state !== "playing" || !this.activeChallengeUsesDuoShapes) return;

      const secondShape = this.createDuoShape({
        x: this.scaler.x(GAME_CONFIG.designWidth * 0.73),
        y: this.scaler.y(GAME_CONFIG.designHeight + 42),
        velocityX: this.scaler.x(-GAME_CONFIG.level7HorizontalImpulse),
        velocityY: this.scaler.y(GAME_CONFIG.spawnImpulse * GAME_CONFIG.level7SpawnImpulseMultiplier),
        state: "inactive"
      });

      this.challengeManager.appendSecondDuoShape(secondShape);
      if (this.activeShapeIndex === 0 && this.currentShapes[0].hasBeenThrown) {
        secondShape.state = "active";
        this.activeShapeIndex = 1;
        this.activeShape = secondShape;
      }
    }, GAME_CONFIG.level7SecondShapeDelayMs);
  }

  createDuoShape({ x, y, velocityX, velocityY, state }) {
    return new FallingShape({
      x,
      y,
      radius: this.scaler.x(GAME_CONFIG.shapeRadius),
      colorId: getRandomItem(AVAILABLE_COLOR_IDS),
      shapeName: getRandomItem(AVAILABLE_SHAPES),
      velocityX,
      velocityY,
      state
    });
  }

  getCollisionPhaseForShape(shape) {
    const shapeChallengePhase = shape.challengePhase || this.currentChallengePhase || this.currentPhase;

    if (!shapeChallengePhase.usesMovingReceiverTracks) return shapeChallengePhase;

    return {
      ...shapeChallengePhase,
      movingReceiverOffset: this.movingReceiverOffset
    };
  }

  getValidationPhaseForShape(shape) {
    const shapeChallengePhase = shape.challengePhase || this.currentChallengePhase || this.currentPhase;

    if (this.phaseUsesLiveReceiverStateForValidation(shapeChallengePhase)) {
      const liveReceiverPhase = this.getPhaseWithCurrentWallColors(shapeChallengePhase);
      return this.createPhaseSnapshot({
        ...liveReceiverPhase,
        ruleName: shapeChallengePhase.ruleName
      });
    }

    return shape.validationPhase || this.getPhaseWithCurrentWallColors(shapeChallengePhase);
  }

  phaseUsesLiveReceiverStateForValidation(phase) {
    return Boolean(
      phase?.usesDynamicWallColors ||
      phase?.usesDynamicReceiverShapes ||
      phase?.usesRuleControlledReceiverRotation ||
      this.phasePermutesReceiversAfterSuccess(phase)
    );
  }

  resolveReceiverTouch(resolvedShape, touchedReceiver) {
    const challengePhase = resolvedShape.challengePhase || this.currentChallengePhase || this.currentPhase;
    const validationPhase = this.getValidationPhaseForShape(resolvedShape);
    const expectedReceiver = this.rules.getExpectedReceiver(resolvedShape, validationPhase);
    const isCorrectReceiver = touchedReceiver.id === expectedReceiver.id;

    this.particleSystem.createBurst(
      resolvedShape.x,
      resolvedShape.y,
      this.arena.getReceiverNeonColor(touchedReceiver, validationPhase),
      isCorrectReceiver
    );

    if (isCorrectReceiver) {
      this.particleSystem.createImpactRing(
        resolvedShape.x,
        resolvedShape.y,
        this.arena.getReceiverNeonColor(
          touchedReceiver,
          validationPhase
        )
      );
    }

    if (!isCorrectReceiver) {
      this.endGame("GAME OVER");
      return;
    }

    this.receiverEffects.startHitFeedback(
      touchedReceiver.id,
      performance.now()
    );

    resolvedShape.state = "resolved";
    this.score += 1;

    if (challengePhase.usesPreciseDuoSelection) {
      this.finishPreciseDuoIfResolved(challengePhase);
      return;
    }

    this.dynamicRuleSequence.consumeSuccessfulAnswer(challengePhase, this.currentPhase);
    const didRuleChange = this.currentRuleName !== challengePhase.ruleName;

    if (challengePhase.usesDuoShapes) {
      this.finishDuoIfResolved(didRuleChange, challengePhase);
      return;
    }

    const didAlreadyAdvanceSpawn = resolvedShape.advancedSpawnState === "scheduled" || resolvedShape.advancedSpawnState === "created";
    this.continueAfterResolvedChallenge(didRuleChange, challengePhase, {
      skipSpawn: didAlreadyAdvanceSpawn
    });
  }

  updateDuoShapes(deltaSeconds) {
    if (this.currentShapes.length === 0) return;

    this.currentShapes.forEach((shape) => {
      if (shape.state !== "resolved") {
        shape.update(deltaSeconds, this.currentGravity);
      }
    });

    for (const shape of this.currentShapes) {
      const touchedReceiver = this.arena.findReceiverHitByShape(shape, this.visiblePhase);
      if (touchedReceiver) {
        this.resolveReceiverTouch(shape, touchedReceiver);
        return;
      }

      if (shape.state !== "resolved" && shape.isBelowScreen(this.scaler.canvasHeight, this.scaler.y(28))) {
        this.endGame("GAME OVER");
        return;
      }
    }
  }

  finishDuoIfResolved(shouldStartRuleTransition, resolvedChallengePhase) {
    const hasBothShapesSpawned = this.currentShapes.length === 2;
    const areBothShapesResolved = hasBothShapesSpawned && this.currentShapes.every((shape) => shape.state === "resolved");

    if (areBothShapesResolved) {
      this.continueAfterResolvedChallenge(shouldStartRuleTransition, resolvedChallengePhase);
    }
  }

  finishPreciseDuoIfResolved(resolvedChallengePhase) {
    const hasBothShapesSpawned = this.currentShapes.length === 2;
    if (!hasBothShapesSpawned || !this.challengeManager.areAllShapesResolved()) return;

    this.clearPendingDuoSpawn();
    this.dynamicRuleSequence.consumeSuccessfulAnswer(resolvedChallengePhase, this.currentPhase);
    const didRuleChange = this.currentRuleName !== resolvedChallengePhase.ruleName;
    this.continueAfterResolvedChallenge(didRuleChange, resolvedChallengePhase);
  }

  continueAfterResolvedChallenge(shouldStartRuleTransition, resolvedChallengePhase = this.currentChallengePhase || this.currentPhase, options = {}) {
    if (this.tryStartPendingLevelIntro()) return;

    if (!this.currentPhaseUsesReceiverRotation) {
      this.receiverEffects.stopRotations();
    }

    if (shouldStartRuleTransition && !options.skipSpawn) {
      this.showRuleTransitionFeedback(this.currentRuleName);
    }

    if (this.shouldStartLevelIntro(resolvedChallengePhase)) {
      this.startLevelIntroWhenReady();
      return;
    }

    if (resolvedChallengePhase?.level !== this.currentPhase.level && this.currentPhase.usesShortReceiverTracks) {
      this.receiverEffects.syncPermutationToPhase(this.currentPhase);
    }

    if (resolvedChallengePhase?.level !== this.currentPhase.level && this.currentPhase.usesMovingReceiverTracks) {
      this.receiverEffects.syncPermutationToPhase(this.currentPhase);
      this.movingReceiverOffset = 0;
      if (!options.skipSpawn) {
        this.spawnNextChallenge();
      }
      return;
    }

    if (this.phasePermutesReceiversAfterSuccess(resolvedChallengePhase)) {
      this.startReceiverPermutation(resolvedChallengePhase);
      return;
    }

    if (!options.skipSpawn) {
      this.spawnNextChallenge();
    }
  }

  showRuleTransitionFeedback(nextRuleName) {
    navigator.vibrate?.(50);
    this.showCenterMessage(nextRuleName, GAME_CONFIG.ruleTransitionFeedbackDurationMs);
  }

  clearPendingDuoSpawn() {
    this.challengeManager.clearSecondShapeTimeout();
    this.challengeManager.clearNextSingleShapeTimeout();
  }

  resetLevelRuntime() {
    this.levelIntro.reset();
    this.movingReceiverOffset = 0;
  }

  updateReceiverPermutation(currentTime) {
    const didFinishPermutation = this.receiverEffects.updatePermutation(currentTime);
    if (!didFinishPermutation || this.state !== "receiverPermutation") return;

    this.state = "playing";
    this.spawnNextChallenge();
  }

  startReceiverPermutation(permutationPhase) {
    if (this.hasEngagedSingleShapes()) {
      this.receiverEffects.startPermutation(performance.now(), permutationPhase);
      return;
    }

    this.clearPendingDuoSpawn();
    this.state = "receiverPermutation";
    this.clearCurrentChallenge();
    this.receiverEffects.startPermutation(performance.now(), permutationPhase);
  }

  updateLevelIntro(currentTime) {
    const didFinishIntro = this.levelIntro.update(currentTime, this.state, this.currentPhase);
    if (!didFinishIntro) return;

    this.state = "playing";
    this.spawnNextChallenge();
  }

  startLevelIntroWhenReady() {
    this.pendingLevelIntroPhase = this.currentPhase;

    if (this.hasEngagedSingleShapes()) return;

    this.startLevelIntro();
  }

  tryStartPendingLevelIntro() {
    if (!this.pendingLevelIntroPhase || this.hasEngagedSingleShapes()) return false;

    this.startLevelIntro();
    return true;
  }

  startLevelIntro() {
    const introStartedAt = performance.now();
    const introPhase = this.pendingLevelIntroPhase || this.currentPhase;

    this.pendingLevelIntroPhase = null;
    this.clearPendingDuoSpawn();
    this.receiverEffects.stopRotations();
    this.clearCurrentChallenge();
    this.state = this.levelIntro.start(introStartedAt, introPhase);
  }

  updateReceiverRotations(currentTime) {
    this.receiverEffects.updateRotations(currentTime, this.visiblePhase, this.state);
  }

  updateMovingReceiverTracks(deltaSeconds) {
    if (!this.visiblePhase.usesMovingReceiverTracks) return;

    const perimeterLength = this.arena.getOuterTrackPerimeterLength();
    this.movingReceiverOffset = (this.movingReceiverOffset + GAME_CONFIG.movingReceiverSpeed * deltaSeconds) % perimeterLength;
  }

  prepareSwipeFromPoint(startPoint) {
    if (!this.currentChallengePhase?.usesPreciseDuoSelection) return true;

    const selectedShape = this.challengeManager.findSelectableShapeAtPoint(startPoint);
    if (!selectedShape) return false;

    this.challengeManager.selectShapeForSwipe(selectedShape);
    return true;
  }

  throwActiveShapeFromSwipe(swipeGesture) {
    const thrownShape = this.throwController.throwFromSwipe(swipeGesture);
    this.handleShapeThrown(thrownShape);
    this.challengeManager.clearSelectedShape();
  }

  throwActiveShapeAtTarget(target, gestureDistance = this.scaler.x(120), gestureDurationMs = 110) {
    if (!this.canReceiveInput()) return;

    const thrownShape = this.throwController.throwAtTarget(target, gestureDistance, gestureDurationMs);
    this.handleShapeThrown(thrownShape);
  }

  handleShapeThrown(thrownShape) {
    if (!thrownShape || this.activeChallengeUsesDuoShapes) return;
    if (this.pendingLevelIntroPhase) return;

    const nextSpawnDelayMs = getNextSpawnDelayMs(this.score);
    if (nextSpawnDelayMs === null) return;

    this.challengeManager.moveActiveShapeToLaunchedShapes();
    this.scheduleNextSingleShapeAfterThrow(thrownShape, nextSpawnDelayMs);
  }

  scheduleNextSingleShapeAfterThrow(thrownShape, nextSpawnDelayMs) {
    if (thrownShape.advancedSpawnState !== "none") return;

    thrownShape.advancedSpawnState = "scheduled";
    const nextSingleShapeTimeoutId = window.setTimeout(() => {
      this.challengeManager.nextSingleShapeTimeoutId = null;

      if (this.state !== "playing") return;
      if (this.currentPhase.usesPreciseDuoSelection || this.currentPhase.usesDuoShapes) return;

      thrownShape.advancedSpawnState = "created";
      this.spawnNextChallenge();
    }, nextSpawnDelayMs);

    this.challengeManager.setNextSingleShapeTimeout(nextSingleShapeTimeoutId);
  }

  activateNextDuoShape() {
    if (!this.activeChallengeUsesDuoShapes) return;
    if (this.currentChallengePhase?.usesPreciseDuoSelection) return;

    if (this.activeShapeIndex === 0 && this.currentShapes[1]) {
      this.currentShapes[1].state = "active";
      this.activeShapeIndex = 1;
      this.activeShape = this.currentShapes[1];
      return;
    }

    if (this.activeShapeIndex === 1) {
      this.challengeManager.clearActiveDuoShape();
    }
  }

  resolveThrowDirection(target) {
    return this.throwController.resolveThrowDirection(target);
  }

  calculateSwipeThrowForce(gestureDistance, gestureDurationMs) {
    return this.throwController.calculateSwipeThrowForce(gestureDistance, gestureDurationMs);
  }

  calculateThrowForce(direction, gestureDistance, gestureDurationMs) {
    return this.throwController.calculateThrowForce(direction, gestureDistance, gestureDurationMs);
  }

  canReceiveInput() {
    return this.stateController.canReceiveInput;
  }

  isWaitingToStart() {
    return this.stateController.isWaitingToStart;
  }

  startOrRestartFromKeyboard() {
    if (this.state === "waiting" || this.state === "ended") {
      this.reset();
    }
  }

  endGame(message) {
    this.clearPendingDuoSpawn();
    this.receiverEffects.stopAll();
    this.state = "ended";
    this.centerMessage = message;
    this.centerMessageUntil = Infinity;
    this.activeShapeRuleName = null;
    this.pendingLevelIntroPhase = null;
    this.clearCurrentChallenge();
  }

  clearCurrentChallenge() {
    this.challengeManager.clear();
  }

  showCenterMessage(message, durationMs) {
    this.centerMessage = message;
    this.centerMessageUntil = performance.now() + durationMs;
  }

  draw(currentTime) {
    this.context.clearRect(0, 0, this.scaler.canvasWidth, this.scaler.canvasHeight);
    this.drawBackground();
    this.arena.draw(this.context, this.visiblePhase, this.wallColorAnimationState, this.receiverEffects.getHitFeedbackByReceiverId(currentTime), this.introVisualState);

    this.drawHud();
    this.drawActiveShape(currentTime);
    this.drawSwipeGuide();
    this.particleSystem.draw(this.context);
    this.drawCenterLabel(currentTime);
  }

  drawBackground() {
    const gradient = this.context.createRadialGradient(
      this.scaler.canvasWidth / 2,
      this.scaler.y(260),
      0,
      this.scaler.canvasWidth / 2,
      this.scaler.y(260),
      this.scaler.x(430)
    );

    gradient.addColorStop(0, "rgba(20, 28, 38, 0.52)");
    gradient.addColorStop(0.56, "rgba(2, 3, 5, 0.96)");
    gradient.addColorStop(1, "#000");
    this.context.fillStyle = gradient;
    this.context.fillRect(0, 0, this.scaler.canvasWidth, this.scaler.canvasHeight);
  }

  drawHud() {
    this.context.save();
    this.context.fillStyle = "#f8fbff";
    this.context.shadowColor = "rgba(255, 255, 255, 0.75)";
    this.context.shadowBlur = this.scaler.x(9);
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.font = `400 ${this.scaler.x(56)}px Orbitron`;
    this.context.fillText(String(this.score).padStart(2, "0"), this.scaler.canvasWidth / 2, this.scaler.y(42));

    this.context.restore();
  }

  drawSpawnTrail(shape, currentTime, spawnRenderScale) {
    const trailStrength = shape.getSpawnTrailStrength(currentTime);

    if (trailStrength <= 0) return;

    const velocityLength = Math.hypot(
      shape.velocityX,
      shape.velocityY
    );

    if (velocityLength < 1) return;

    const directionX = shape.velocityX / velocityLength;
    const directionY = shape.velocityY / velocityLength;

    for (
      let index = GAME_CONFIG.spawnTrailCopies;
      index >= 1;
      index -= 1
    ) {
      const distance = this.scaler.x(
        GAME_CONFIG.spawnTrailSpacing * index
      );

      const trailX =
        shape.x - directionX * distance;

      const trailY =
        shape.y - directionY * distance;

      const copyProgress =
        index / GAME_CONFIG.spawnTrailCopies;

      const opacity =
        GAME_CONFIG.spawnTrailMaxOpacity *
        trailStrength *
        (1 - copyProgress * 0.65);

      this.context.save();

      this.context.translate(trailX, trailY);

      this.context.scale(
        spawnRenderScale.scaleX,
        spawnRenderScale.scaleY
      );

      ShapeRenderer.draw(
        this.context,
        { x: 0, y: 0 },
        shape.shapeName,
        NEON_COLORS[shape.colorId],
        this.scaler.x(
          shape.state === "active"
            ? GAME_CONFIG.shapeRadius * 1.08
            : GAME_CONFIG.shapeRadius
        ),
        opacity,
        0.8
      );

      this.context.restore();
    }
  }

  drawActiveShape(currentTime) {
    const visibleShapes = this.challengeManager.getVisibleShapes(this.activeChallengeUsesDuoShapes);

    visibleShapes
      .filter((shape) => shape.state !== "resolved")
      .forEach((shape) => {

        if (
          shape.spawnAnimationStartedAt === null &&
          shape.y <= this.scaler.canvasHeight
        ) {
          shape.spawnAnimationStartedAt = currentTime;
        }

        const spawnRenderScale = shape.getSpawnRenderScale(currentTime);
        const spawnGlowMultiplier = shape.getSpawnHaloMultiplier(currentTime);

        const swipeRenderScale = shape.getSwipeRenderScale(currentTime);
        const swipeGlowMultiplier = shape.getSwipeHaloMultiplier(currentTime);

        this.drawSpawnTrail(
          shape,
          currentTime,
          spawnRenderScale
        );

        this.drawSwipeTrail(shape, currentTime);

        this.context.save();
        this.context.globalAlpha = shape.state === "inactive" ? 0.7 : 1;
        this.context.translate(shape.x, shape.y);
        const velocityAngle =
          Math.atan2(shape.velocityY, shape.velocityX);

        if (shape.hasBeenThrown) {
          this.context.rotate(velocityAngle);

          this.context.scale(
            swipeRenderScale.scaleAlongMovement,
            swipeRenderScale.scalePerpendicular
          );

          this.context.rotate(-velocityAngle);
        } else {
          this.context.scale(spawnRenderScale.scaleX, spawnRenderScale.scaleY);
        }
        ShapeRenderer.draw(
          this.context,
          { x: 0, y: 0 },
          shape.shapeName,
          NEON_COLORS[shape.colorId],
          this.scaler.x(shape.state === "active" ? GAME_CONFIG.shapeRadius * 1.08 : GAME_CONFIG.shapeRadius),
          1,
          shape.hasBeenThrown
            ? swipeGlowMultiplier
            : spawnGlowMultiplier
        );
        this.context.restore();
      });
  }

  drawSwipeGuide() {
    const swipeGesture = this.inputController.activeSwipeGesture;
    if (!swipeGesture || !this.activeShape || this.state !== "playing") return;
    if (swipeGesture.distance < this.scaler.x(12)) return;

    this.context.save();
    this.context.strokeStyle = "rgba(238, 244, 255, 0.72)";
    this.context.shadowColor = NEON_COLORS[this.activeShape.colorId];
    this.context.shadowBlur = this.scaler.x(12);
    this.context.lineWidth = this.scaler.x(2);
    this.context.setLineDash([this.scaler.x(8), this.scaler.x(8)]);
    this.context.beginPath();
    this.context.moveTo(swipeGesture.startX, swipeGesture.startY);
    this.context.lineTo(swipeGesture.currentX, swipeGesture.currentY);
    this.context.stroke();
    this.context.restore();
  }

  drawSwipeTrail(shape, currentTime) {
    const trailStrength =
      shape.getSwipeTrailStrength(currentTime);

    if (trailStrength <= 0) return;

    const velocityLength = Math.hypot(
      shape.velocityX,
      shape.velocityY
    );

    if (velocityLength < 1) return;

    const directionX =
      shape.velocityX / velocityLength;

    const directionY =
      shape.velocityY / velocityLength;

    for (
      let index = GAME_CONFIG.swipeTrailCopies;
      index >= 1;
      index -= 1
    ) {
      const distance = this.scaler.x(
        GAME_CONFIG.swipeTrailSpacing * index
      );

      const opacity =
        GAME_CONFIG.swipeTrailMaxOpacity *
        trailStrength *
        (1 - index / GAME_CONFIG.swipeTrailCopies * 0.55);

      this.context.save();

      this.context.translate(
        shape.x - directionX * distance,
        shape.y - directionY * distance
      );

      ShapeRenderer.draw(
        this.context,
        { x: 0, y: 0 },
        shape.shapeName,
        NEON_COLORS[shape.colorId],
        this.scaler.x(GAME_CONFIG.shapeRadius),
        opacity,
        1.5
      );

      this.context.restore();
    }
  }

  drawCenterLabel(currentTime) {
    if (this.isShowingLevelIntro) {
      this.drawLevelIntroLabel();
      return;
    }

    const shouldShowTemporaryMessage = currentTime < this.centerMessageUntil || this.state === "ended" || this.state === "waiting";
    const label = shouldShowTemporaryMessage ? this.centerMessage : this.visibleRuleName;
    const isRuleLabel = label === "COLOR" || label === "SHAPE";
    const isStartLabel = this.state === "waiting";
    const isTemporaryRuleFeedback = isRuleLabel && shouldShowTemporaryMessage && !isStartLabel;
    const isGameOver = this.state === "ended";
    const labelSize = isGameOver ? 48 : isStartLabel ? 21 : isRuleLabel ? 42 : 35;
    const shadowBlur = isGameOver ? 12 : isTemporaryRuleFeedback ? 26 : isStartLabel ? 24 : 0;

    this.context.save();
    this.context.globalAlpha = isStartLabel ? 0.82 : 1;
    this.context.fillStyle = isTemporaryRuleFeedback ? "#ffffff" : (isRuleLabel ? "#7f8da3" : "#eef4ff");
    this.context.shadowColor = isTemporaryRuleFeedback ? "rgba(255, 255, 255, 0.95)" : (isRuleLabel ? "transparent" : "rgba(255, 255, 255, 0.95)");
    this.context.shadowBlur = this.scaler.x(shadowBlur);
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    if (isRuleLabel) {
      this.context.font = `600 ${this.scaler.x(50)}px Oxanium`;
    } else {
      this.context.font = `600 ${this.scaler.x(labelSize)}px Oxanium`;
    }
    this.context.letterSpacing = `${this.scaler.x(isRuleLabel ? 20 : (isStartLabel ? 10 : 4))}px`;

    this.context.fillText(
      label,
      this.scaler.canvasWidth / 2,
      this.getCenterLabelY(isRuleLabel)
    );

    if (isGameOver) {
      this.context.font = `400 ${this.scaler.x(20)}px Oxanium`;
      this.context.letterSpacing = `${this.scaler.x(4)}px`;
      this.context.fillStyle = "#7f8da3";
      this.context.shadowColor = "transparent";
      this.context.shadowBlur = 0;

      this.context.fillText(
        "TAP TO RESTART",
        this.scaler.canvasWidth / 2,
        this.getCenterLabelY(false) + this.scaler.y(70)
      );
    }

    //this.context.fillText(label, this.scaler.canvasWidth / 2, this.getCenterLabelY(isRuleLabel));
    this.context.restore();
  }

  drawLevelIntroLabel() {
    const [firstWord, secondWord] = this.levelIntroLines[0].split(" ");
    const centerY = this.scaler.canvasHeight / 2;

    this.context.save();

    this.context.fillStyle = "#ffffff";
    this.context.shadowColor = "rgba(255, 255, 255, 0.95)";
    this.context.shadowBlur = this.scaler.x(26);

    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    this.context.font = `600 ${this.scaler.x(44)}px Oxanium`;
    this.context.letterSpacing = `${this.scaler.x(10)}px`;

    this.context.fillText(
      firstWord,
      this.scaler.canvasWidth / 2,
      centerY - this.scaler.y(30)
    );

    this.context.fillText(
      secondWord,
      this.scaler.canvasWidth / 2,
      centerY + this.scaler.y(30)
    );

    this.context.restore();
  }

  getCenterLabelY(isRuleLabel) {
    if (this.state === "ended") {
      return this.scaler.canvasHeight / 2 - this.scaler.y(58);
    }

    return this.scaler.y(isRuleLabel ? 486 : 376);
  }

  get visiblePhase() {
    const visiblePhase = this.getPhaseWithCurrentWallColors(this.currentChallengePhase || this.currentPhase);

    if (!visiblePhase.usesMovingReceiverTracks) return visiblePhase;

    return {
      ...visiblePhase,
      movingReceiverOffset: this.movingReceiverOffset
    };
  }

  get visibleRuleName() {
    return this.activeShape?.challengePhase?.ruleName || this.activeShapeRuleName || this.visiblePhase.ruleName;
  }

  get wallColorAnimationState() {
    return this.receiverEffects.animationState;
  }

  getPhaseWithCurrentWallColors(phase) {
    return this.receiverEffects.getPhaseWithCurrentReceiverState(phase);
  }

  get activeChallengeUsesDuoShapes() {
    const challengePhase = this.currentChallengePhase || this.currentPhase;
    return Boolean(challengePhase.usesDuoShapes || challengePhase.usesPreciseDuoSelection);
  }

  get currentChallengeSpawnImpulse() {
    return ChallengePhysics.getSpawnImpulse(this.currentChallengePhase || this.currentPhase);
  }

  phasePermutesReceiversAfterSuccess(phase) {
    return Boolean(phase?.permutesReceiverColorsAfterSuccess || phase?.permutesReceiverShapesAfterSuccess);
  }

  hasEngagedSingleShapes() {
    if (this.activeChallengeUsesDuoShapes) return false;

    return this.challengeManager.hasUnresolvedShapes() || this.challengeManager.hasPendingNextSingleShape();
  }

  shouldStartLevelIntro(resolvedChallengePhase) {
    return this.levelIntro.shouldStart(resolvedChallengePhase, this.currentPhase);
  }

  get currentPhaseUsesReceiverRotation() {
    return this.receiverEffects.phaseUsesReceiverRotation(this.currentPhase);
  }

  get isShowingLevelIntro() {
    return this.stateController.isShowingLevelIntro;
  }

  get levelIntroLines() {
    return this.levelIntro.getLines(this.state);
  }

  get activeShape() {
    return this.challengeManager.activeShape;
  }

  set activeShape(nextShape) {
    this.challengeManager.activeShape = nextShape;
  }

  get currentShapes() {
    return this.challengeManager.currentShapes;
  }

  set currentShapes(nextShapes) {
    this.challengeManager.currentShapes = nextShapes;
  }

  get activeShapeIndex() {
    return this.challengeManager.activeShapeIndex;
  }

  set activeShapeIndex(nextShapeIndex) {
    this.challengeManager.activeShapeIndex = nextShapeIndex;
  }

  get currentChallengePhase() {
    return this.challengeManager.currentChallengePhase;
  }

  set currentChallengePhase(nextChallengePhase) {
    this.challengeManager.currentChallengePhase = nextChallengePhase;
  }

  get secondDuoShapeTimeoutId() {
    return this.challengeManager.secondDuoShapeTimeoutId;
  }

  set secondDuoShapeTimeoutId(nextTimeoutId) {
    this.challengeManager.secondDuoShapeTimeoutId = nextTimeoutId;
  }

  get state() {
    return this.stateController.value;
  }

  set state(nextState) {
    this.stateController.set(nextState);
  }

  get currentRuleName() {
    return this.currentPhase.ruleName;
  }

  get currentPhase() {
    const basePhase = this.rules.getCurrentPhase(this.score);
    return this.dynamicRuleSequence.getPhaseWithCurrentRule(basePhase);
  }

  get currentLevel() {
    return this.rules.getLevel(this.score);
  }

  get currentGravity() {
    return this.scaler.x(ChallengePhysics.getGravity(this.currentChallengePhase || this.currentPhase));
  }

  get introVisualState() {
    if (!this.isShowingLevelIntro) {
      return null;
    }

    if (
      this.state === "level11Intro" ||
      this.state === "level12Intro"
    ) {
      return {
        railOpacity: 0.18,
        iconOpacity: 0.18
      };
    }

    return null;
  }

}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getNextSpawnDelayMs(score) {
  if (score < 4) return null;

  return Math.max(
    200 - (score - 4) * 3,
    50
  );
}

function clamp(value, minValue, maxValue) {
  return Math.min(maxValue, Math.max(minValue, value));
}

const game = new NeonSwipeGame({
  canvas: canvasElement,
  restartButton: restartButtonElement,
  context: drawingContext
});

// Expose l'objet pendant le developpement : pratique pour tester depuis la console.
window.game = game;

game.start();
