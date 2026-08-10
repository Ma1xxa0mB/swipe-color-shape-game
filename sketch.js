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
  maxResponsiveDesignHeight: 1080,
  maxCanvasCssWidth: 540,
  gravity: 1450, // 1450
  spawnImpulse: -1300, // -1120
  minSwipeDistance: 10,
  minThrowForce: 1800,
  maxThrowForce: 2400,
  upwardThrowBoost: 330,
  shapeRadius: 34,
  shapeSwipeHitboxMultiplier: 2.2,
  multiShapeSpawnDelayMs: 250,
  multiShapeGravityMultiplier: 0.75,
  multiShapeMinHorizontalSpacing: 110,
  multiShapeHorizontalImpulse: 200,
  burstShapeCount: 3,
  burstSecondShapeDelayMs: 400,
  burstThirdShapeDelayMs: 800,
  burstWaitingOpacity: 0.20,
  twinHorizontalOffset: 105,
  twinWaitingOpacity: 0.20,
  revealShuffleIntervalMs: 80,
  revealApexVelocityThreshold: 0,
  revealLockFlashDurationMs: 120,
  revealLockGlowMultiplier: 1.5,
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
  shortReceiverTrackLength: 160,
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
  bottomCornerSpawnInset: 105,
  bottomCornerSpawnHorizontalImpulse: 110,
  movingBottomSpawnHorizontalImpulse: 110,
  movingBottomSpawnCenterZoneWidth: 90,
  modifierIntroDurationMs: 2000,
  modifierIntroEffectDelayMs: 200,
  shapeRotationIntervalMs: 1000,
  shapeRotationDurationMs: 180,
  receiverRotationIntervalMs: 1000,
  receiverRotationDurationMs: 180,
  blinkVisibleDurationMs: 800,
  blinkNeutralDurationMs: 800,
  pulseCycleDurationMs: 2000,
  pulseMinLengthMultiplier: 0.02,
  waveCycleDurationMs: 3200,
  waveMinLengthMultiplier: 0.02,
  voidSpawnChance: 0.25,
  topSpawnGravityMultiplier: 0.65,
  gameOverHoldDurationMs: 250,
  gameOverTransitionDurationMs: 700,
};

const HOME_UI_DATA = {
  bestScore: 0,
  dailyAttemptsLeft: 4,
  dailyMaxAttempts: 4
};

const DEFAULT_COLOR_LAYOUT = {
  topLeft: "green",
  topRight: "red",
  bottomLeft: "blue",
  bottomRight: "yellow"
};

const DEFAULT_SHAPE_LAYOUT = {
  topLeft: "triangle",
  topRight: "star",
  bottomLeft: "square",
  bottomRight: "circle"
};


const GAME_PHASES = [
  { level: 1, ruleName: "COLOR", startScore: 0 }
  // { level: 2, ruleName: "SHAPE", startScore: 2 },
  // { level: 3, ruleName: "COLOR", startScore: 4 },
  // { level: 4, ruleName: "COLOR", startScore: 6 },
  // { level: 5, ruleName: "COLOR", startScore: 8 },
  // { level: 6, ruleName: "COLOR", startScore: 10 },
  // { level: 7, ruleName: "COLOR", startScore: 12 },
  // { level: 8, ruleName: "COLOR", startScore: GAME_CONFIG.level8StartScore },
  // { level: 9, ruleName: "COLOR", startScore: GAME_CONFIG.level9StartScore },
  // { level: 10, ruleName: "COLOR", startScore: GAME_CONFIG.level10StartScore },
  // { level: 11, ruleName: "COLOR", startScore: GAME_CONFIG.level11StartScore },
  // { level: 12, ruleName: "SHAPE", startScore: GAME_CONFIG.level12StartScore },
  // { level: 13, ruleName: "COLOR", startScore: GAME_CONFIG.level13StartScore },
  // { level: 14, ruleName: "COLOR", startScore: GAME_CONFIG.level14StartScore },
  // { level: 15, ruleName: "COLOR", startScore: GAME_CONFIG.level15StartScore },
  // { level: 16, ruleName: "COLOR", startScore: GAME_CONFIG.level16StartScore },
  // { level: 17, ruleName: "COLOR", startScore: GAME_CONFIG.level17StartScore },
  // { level: 18, ruleName: "COLOR", startScore: GAME_CONFIG.level18StartScore },
  // { level: 19, ruleName: "COLOR", startScore: GAME_CONFIG.level19StartScore }
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
  yellow: "#efff2e",

  pink: "#ff2bda",
  purple: "#9a4dff",
  white: "#ffffff"
};

const NEUTRAL_RECEIVER_VISUALS = {
  railColor: "rgba(190, 204, 220, 0.72)",
  iconColor: "rgba(205, 216, 230, 0.78)",
  railOpacityMultiplier: 0.55,
  iconOpacityMultiplier: 0.62,
  glowMultiplier: 0.34
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
const VOID_SHAPES = ["hexagon", "diamond", "rectangle"];
const VOID_COLOR_IDS = ["pink", "purple", "white"];
const RECEIVER_PERMUTATION_MODES = ["none", "color", "shape", "both"];
const SPAWN_MODES = ["bottom", "bottomCorners", "top", "side"];
const RECEIVER_ROTATION_MODES = ["none", "color", "shape", "both", "rule"];
const RULE_SEQUENCE_MODE_NAMES = ["none", "easy", "normal", "hard"];
const RULE_SEQUENCE_MODES = {
  none: null,
  easy: { minAnswers: 2, maxAnswers: 3 },
  normal: { minAnswers: 1, maxAnswers: 3 },
  hard: { minAnswers: 1, maxAnswers: 2 }
};

const DEFAULT_MODIFIERS = {
  blink: false,
  pulse: false,
  wave: false,
  burst: false,
  twin: false,
  reveal: false,
  spawn: "bottom",
  randomSpawn: false,
  slide: false,
  shortReceivers: false,
  permutation: "none",
  rotation: "none",
  ruleSequence: "easy",
  shapeSwipe: false,
  multiShapeCount: 1,
  rhythmDifficulty: "easy",
  void: false
};

// TEMP TEST MODIFIERS - remove this layer when level recipes become final.
const TEMP_TEST_MODIFIER_OVERRIDES = {
  wave: true
};

const LEVEL_MODIFIERS = {
  1: {}
  // 2: {},
  // 3: {},
  // 4: {},
  // 5: {},
  // 6: {},
  // 7: {},
  // 8: {},
  // 9: {},
  // 10: {},
  // 11: {},
  // 12: {},
  // 13: {},
  // 14: {},
  // 15: {},
  // 16: {},
  // 17: {},
  // 18: {},
  // 19: {
  //   shapeSwipe: true,
  //   shortReceivers: true,
  //   slide: true,
  //   multiShapeCount: 2
  // }
};

const RHYTHM_DIFFICULTIES = {
  easy: {
    trigger: "afterResolution",
    startDelayMs: 280,
    minDelayMs: 120,
    progressionPerScore: 4
  },
  medium: {
    trigger: "afterSwipe",
    startDelayMs: 120,
    minDelayMs: 50,
    progressionPerScore: 2
  },
  hard: {
    trigger: "afterSwipe",
    startDelayMs: 0,
    minDelayMs: 0,
    progressionPerScore: 0
  }
};

function getModifiersForLevel(level) {
  return {
    ...DEFAULT_MODIFIERS,
    ...(LEVEL_MODIFIERS[level] || {}),
    ...TEMP_TEST_MODIFIER_OVERRIDES
  };
}

function getRhythmConfig(rhythmDifficulty) {
  return RHYTHM_DIFFICULTIES[rhythmDifficulty] || RHYTHM_DIFFICULTIES.easy;
}

function getRhythmDelayMs(score, rhythmDifficulty) {
  const rhythmConfig = getRhythmConfig(rhythmDifficulty);

  return Math.max(
    rhythmConfig.startDelayMs -
    Math.max(score - 4, 0) * rhythmConfig.progressionPerScore,
    rhythmConfig.minDelayMs
  );
}

function usesColorPermutation(permutationMode) {
  return permutationMode === "color" || permutationMode === "both";
}

function usesShapePermutation(permutationMode) {
  return permutationMode === "shape" || permutationMode === "both";
}

function usesAnyPermutation(permutationMode) {
  return RECEIVER_PERMUTATION_MODES.includes(permutationMode) && permutationMode !== "none";
}

function usesColorRotation(rotationMode, ruleName) {
  return (
    rotationMode === "color" ||
    rotationMode === "both" ||
    (rotationMode === "rule" && ruleName === "COLOR")
  );
}

function usesShapeRotation(rotationMode, ruleName) {
  return (
    rotationMode === "shape" ||
    rotationMode === "both" ||
    (rotationMode === "rule" && ruleName === "SHAPE")
  );
}

function usesAnyRotation(rotationMode) {
  return RECEIVER_ROTATION_MODES.includes(rotationMode) && rotationMode !== "none";
}

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
  constructor(designWidth, designHeight, maxDesignHeight = designHeight) {
    this.designWidth = designWidth;
    this.baseDesignHeight = designHeight;
    this.maxDesignHeight = maxDesignHeight;
    this.designHeight = designHeight;
    this.canvasWidth = designWidth;
    this.canvasHeight = designHeight;
    this.scale = 1;
  }

  get minDesignHeight() {
    return this.baseDesignHeight;
  }

  get maxLogicalHeight() {
    return this.maxDesignHeight;
  }

  getLogicalHeightForCssSize(cssWidth, cssHeight) {
    if (!cssWidth || !cssHeight) return this.baseDesignHeight;

    return clamp(
      cssHeight / (cssWidth / this.designWidth),
      this.minDesignHeight,
      this.maxLogicalHeight
    );
  }

  getCssSizeForViewport(viewportWidth, viewportHeight, maxCssWidth) {
    const safeViewportWidth = Math.max(viewportWidth || this.designWidth, 1);
    const safeViewportHeight = Math.max(viewportHeight || this.baseDesignHeight, 1);
    const maxWidth = maxCssWidth || this.designWidth;

    let cssWidth = Math.min(safeViewportWidth, maxWidth);
    let logicalHeight = this.getLogicalHeightForCssSize(cssWidth, safeViewportHeight);
    let cssHeight = cssWidth * (logicalHeight / this.designWidth);

    if (cssHeight > safeViewportHeight) {
      cssHeight = safeViewportHeight;
      cssWidth = cssHeight * (this.designWidth / logicalHeight);
      logicalHeight = this.getLogicalHeightForCssSize(cssWidth, cssHeight);
    }

    return {
      width: cssWidth,
      height: cssHeight,
      logicalHeight
    };
  }

  updateFromCanvas(canvas) {
    const pixelRatio = window.devicePixelRatio || 1;
    const canvasBounds = canvas.getBoundingClientRect();

    canvas.width = Math.round(canvasBounds.width * pixelRatio);
    canvas.height = Math.round(canvasBounds.height * pixelRatio);

    this.canvasWidth = canvasBounds.width;
    this.canvasHeight = canvasBounds.height;
    this.scale = canvasBounds.width / this.designWidth;
    this.designHeight = this.getLogicalHeightForCssSize(
      canvasBounds.width,
      canvasBounds.height
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
  constructor({ x, y, radius, colorId, shapeName, velocityX = 0, velocityY, state = "active", isVoid = false }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colorId = colorId;
    this.shapeName = shapeName;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.state = state;
    this.isVoid = isVoid;
    this.hasBeenThrown = false;
    this.createdAt = performance.now();
    this.spawnAnimationStartedAt = null;
    this.swipeAnimationStartedAt = null;
    this.isRevealShape = false;
    this.isRevealLocked = false;
    this.revealDisplayShapeName = null;
    this.revealDisplayColorId = null;
    this.revealLastShuffleAt = 0;
    this.revealLockedAt = null;
  }

  update(deltaSeconds, gravity) {
    const previousVelocityY = this.velocityY;

    this.velocityY += gravity * deltaSeconds;
    this.velocityX *= 0.996;
    this.x += this.velocityX * deltaSeconds;
    this.y += this.velocityY * deltaSeconds;
    this.updateRevealState(previousVelocityY, performance.now());
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

  enableReveal(currentTime) {
    this.isRevealShape = true;
    this.isRevealLocked = false;
    this.revealDisplayShapeName = getRandomItemExcept(
      AVAILABLE_SHAPES,
      this.shapeName
    );

    this.revealDisplayColorId = getRandomItemExcept(
      AVAILABLE_COLOR_IDS,
      this.colorId
    );
    this.revealLastShuffleAt = currentTime;
    this.revealLockedAt = null;
  }

  updateRevealState(previousVelocityY, currentTime) {
    if (!this.isRevealShape || this.isRevealLocked) return;

    if (
      previousVelocityY < GAME_CONFIG.revealApexVelocityThreshold &&
      this.velocityY >= GAME_CONFIG.revealApexVelocityThreshold
    ) {
      this.lockReveal(currentTime);
      return;
    }

    if (currentTime - this.revealLastShuffleAt < GAME_CONFIG.revealShuffleIntervalMs) return;

    this.revealDisplayShapeName = getRandomItemExcept(
      AVAILABLE_SHAPES,
      this.revealDisplayShapeName
    );

    this.revealDisplayColorId = getRandomItemExcept(
      AVAILABLE_COLOR_IDS,
      this.revealDisplayColorId
    );

    this.revealLastShuffleAt = currentTime;
  }

  lockReveal(currentTime) {
    this.isRevealLocked = true;
    this.revealDisplayShapeName = this.shapeName;
    this.revealDisplayColorId = this.colorId;
    this.revealLockedAt = currentTime;
  }

  getRenderIdentity() {
    if (this.isRevealShape && !this.isRevealLocked) {
      return {
        shapeName: this.revealDisplayShapeName || this.shapeName,
        colorId: this.revealDisplayColorId || this.colorId
      };
    }

    return {
      shapeName: this.shapeName,
      colorId: this.colorId
    };
  }

  getRevealGlowMultiplier(currentTime) {
    if (!this.isRevealShape || !this.isRevealLocked || this.revealLockedAt === null) {
      return 1;
    }

    const elapsedMs = currentTime - this.revealLockedAt;

    if (elapsedMs >= GAME_CONFIG.revealLockFlashDurationMs) {
      return 1;
    }

    const progress = clamp(
      elapsedMs / GAME_CONFIG.revealLockFlashDurationMs,
      0,
      1
    );

    return (
      GAME_CONFIG.revealLockGlowMultiplier -
      (GAME_CONFIG.revealLockGlowMultiplier - 1) * progress
    );
  }

  get canReceiveSwipe() {
    if (this.isRevealShape && !this.isRevealLocked) {
      return false;
    }

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

  findReceiverHitByShape(fallingShape, currentPhase, modifierVisualState = null) {
    if (!fallingShape.canHitReceiver) return null;

    const collisionRadius = fallingShape.radius * 0.55;
    return this.receivers.find((receiver) => {
      return this.getReceiverHitAreas(receiver, currentPhase, modifierVisualState).some((hitArea) => {
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

      outerHeight: this.scaler.y(
        this.scaler.designHeight - 54
      ),

      innerX: this.scaler.x(layout.innerX),
      innerY: this.scaler.y(layout.innerY),
      innerWidth: this.scaler.x(layout.innerWidth),

      innerHeight: this.scaler.y(
        this.scaler.designHeight - 230
      ),

      railSize: this.scaler.x(layout.railSize),
      cornerRadius: this.scaler.x(layout.cornerRadius)
    };
  }

  getReceiverHitAreas(receiver, currentPhase, modifierVisualState = null) {
    return this.getReceiverTrackHitAreas(receiver, currentPhase, modifierVisualState);
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

  getRoundedTrackRadius() {
    const layout = this.getScaledLayout();
    const bounds = this.getOuterTrackBounds();
    const maxRadius = Math.min(
      (bounds.right - bounds.left) / 2,
      (bounds.bottom - bounds.top) / 2
    );

    return Math.min(
      Math.max(layout.cornerRadius - layout.railSize / 2, 0),
      maxRadius
    );
  }

  getRoundedTrackPieces() {
    const bounds = this.getOuterTrackBounds();
    const radius = this.getRoundedTrackRadius();
    const middleX = (bounds.left + bounds.right) / 2;
    const middleY = (bounds.top + bounds.bottom) / 2;
    const topRightCenter = { x: bounds.right - radius, y: bounds.top + radius };
    const bottomRightCenter = { x: bounds.right - radius, y: bounds.bottom - radius };
    const bottomLeftCenter = { x: bounds.left + radius, y: bounds.bottom - radius };
    const topLeftCenter = { x: bounds.left + radius, y: bounds.top + radius };

    return [
      {
        type: "line",
        side: "top",
        start: { x: middleX, y: bounds.top },
        end: { x: bounds.right - radius, y: bounds.top }
      },
      {
        type: "arc",
        side: "topRightArc",
        center: topRightCenter,
        radius,
        startAngle: -Math.PI / 2,
        endAngle: 0
      },
      {
        type: "line",
        side: "right",
        start: { x: bounds.right, y: bounds.top + radius },
        end: { x: bounds.right, y: middleY }
      },
      {
        type: "line",
        side: "right",
        start: { x: bounds.right, y: middleY },
        end: { x: bounds.right, y: bounds.bottom - radius }
      },
      {
        type: "arc",
        side: "bottomRightArc",
        center: bottomRightCenter,
        radius,
        startAngle: 0,
        endAngle: Math.PI / 2
      },
      {
        type: "line",
        side: "bottom",
        start: { x: bounds.right - radius, y: bounds.bottom },
        end: { x: middleX, y: bounds.bottom }
      },
      {
        type: "line",
        side: "bottom",
        start: { x: middleX, y: bounds.bottom },
        end: { x: bounds.left + radius, y: bounds.bottom }
      },
      {
        type: "arc",
        side: "bottomLeftArc",
        center: bottomLeftCenter,
        radius,
        startAngle: Math.PI / 2,
        endAngle: Math.PI
      },
      {
        type: "line",
        side: "left",
        start: { x: bounds.left, y: bounds.bottom - radius },
        end: { x: bounds.left, y: middleY }
      },
      {
        type: "line",
        side: "left",
        start: { x: bounds.left, y: middleY },
        end: { x: bounds.left, y: bounds.top + radius }
      },
      {
        type: "arc",
        side: "topLeftArc",
        center: topLeftCenter,
        radius,
        startAngle: Math.PI,
        endAngle: Math.PI * 1.5
      },
      {
        type: "line",
        side: "top",
        start: { x: bounds.left + radius, y: bounds.top },
        end: { x: middleX, y: bounds.top }
      }
    ].map((piece) => ({
      ...piece,
      length: this.getRoundedTrackPieceLength(piece)
    }));
  }

  getRoundedTrackPieceLength(piece) {
    if (piece.type === "arc") {
      return Math.abs(piece.endAngle - piece.startAngle) * piece.radius;
    }

    return Math.hypot(
      piece.end.x - piece.start.x,
      piece.end.y - piece.start.y
    );
  }

  getRoundedTrackPerimeterLength() {
    return this.getRoundedTrackPieces().reduce(
      (totalLength, piece) => totalLength + piece.length,
      0
    );
  }

  getOuterTrackPerimeterLength() {
    return this.getRoundedTrackPerimeterLength();
  }

  normalizeOuterTrackDistance(distance) {
    const perimeterLength = this.getRoundedTrackPerimeterLength();
    return ((distance % perimeterLength) + perimeterLength) % perimeterLength;
  }

  getPointOnRoundedTrack(distance) {
    const pieces = this.getRoundedTrackPieces();
    let normalizedDistance = this.normalizeOuterTrackDistance(distance);

    for (const piece of pieces) {
      if (normalizedDistance <= piece.length || piece === pieces[pieces.length - 1]) {
        return this.getPointOnRoundedTrackPiece(piece, normalizedDistance);
      }

      normalizedDistance -= piece.length;
    }

    return this.getPointOnRoundedTrackPiece(pieces[0], 0);
  }

  getPointOnRoundedTrackPiece(piece, distanceOnPiece) {
    const safeLength = piece.length || 1;
    const progress = clamp(distanceOnPiece / safeLength, 0, 1);

    if (piece.type === "arc") {
      const angle = piece.startAngle + (piece.endAngle - piece.startAngle) * progress;
      const radiusX = Math.cos(angle);
      const radiusY = Math.sin(angle);

      return {
        x: piece.center.x + radiusX * piece.radius,
        y: piece.center.y + radiusY * piece.radius,
        tangentX: -radiusY,
        tangentY: radiusX,
        inwardNormalX: -radiusX,
        inwardNormalY: -radiusY,
        side: piece.side
      };
    }

    const deltaX = piece.end.x - piece.start.x;
    const deltaY = piece.end.y - piece.start.y;
    const tangentLength = Math.hypot(deltaX, deltaY) || 1;
    const tangentX = deltaX / tangentLength;
    const tangentY = deltaY / tangentLength;

    return {
      x: piece.start.x + deltaX * progress,
      y: piece.start.y + deltaY * progress,
      tangentX,
      tangentY,
      inwardNormalX: -tangentY,
      inwardNormalY: tangentX,
      side: piece.side
    };
  }

  getPointOnOuterTrack(distance) {
    return this.getPointOnRoundedTrack(distance);
  }

  getRoundedTrackSegments(startDistance, length) {
    const segments = [];
    const layout = this.getScaledLayout();
    const segmentLength = Math.max(layout.railSize / 4, this.scaler.x(8));
    const segmentCount = Math.max(Math.ceil(length / segmentLength), 1);
    let previousPoint = this.getPointOnRoundedTrack(startDistance);

    for (let index = 1; index <= segmentCount; index += 1) {
      const currentDistance = startDistance + (length * index) / segmentCount;
      const currentPoint = this.getPointOnRoundedTrack(currentDistance);

      segments.push({
        start: previousPoint,
        end: currentPoint,
        side: previousPoint.side
      });

      previousPoint = currentPoint;
    }

    return segments;
  }

  getTrackSegmentsOnOuterPerimeter(startDistance, length) {
    return this.getRoundedTrackSegments(startDistance, length);
  }

  getReceiverTrackLength(isShortReceiver, modifierVisualState = null) {
    const pulseAdjustedLength = this.getReceiverPulseAdjustedTrackLength(
      isShortReceiver,
      modifierVisualState
    );
    const waveMultiplier = modifierVisualState?.wave?.lengthMultiplier ?? 1;

    return pulseAdjustedLength * waveMultiplier;
  }

  getReceiverBaseTrackLength(isShortReceiver) {
    if (isShortReceiver) {
      return this.scaler.x(GAME_CONFIG.shortReceiverTrackLength);
    }

    return this.getLongReceiverTrackLength();
  }

  getReceiverPulseAdjustedTrackLength(isShortReceiver, modifierVisualState = null) {
    const baseLength = this.getReceiverBaseTrackLength(isShortReceiver);
    const pulseMultiplier = modifierVisualState?.pulse?.lengthMultiplier ?? 1;

    return baseLength * pulseMultiplier;
  }

  getLongReceiverTrackLength() {
    return this.getRoundedTrackPerimeterLength() / this.receivers.length;
  }

  getReceiverBaseDistance(receiver) {
    const quarterLength = this.getRoundedTrackPerimeterLength() / this.receivers.length;
    const baseDistanceByReceiverId = {
      topRight: 0,
      bottomRight: quarterLength,
      bottomLeft: quarterLength * 2,
      topLeft: quarterLength * 3
    };

    return baseDistanceByReceiverId[receiver.id] || 0;
  }

  getReceiverTrackStartDistance(receiver, modifierVisualState = null) {
    const receiverModifierState = this.getReceiverModifierState(modifierVisualState);
    const offset = receiverModifierState.isSliding
      ? receiverModifierState.movingOffset
      : 0;
    const baseLength = this.getReceiverBaseTrackLength(receiverModifierState.isShort);
    const pulseAdjustedLength = this.getReceiverPulseAdjustedTrackLength(
      receiverModifierState.isShort,
      modifierVisualState
    );
    const currentLength = this.getReceiverTrackLength(
      receiverModifierState.isShort,
      modifierVisualState
    );
    const pulseCenteringOffset = (baseLength - pulseAdjustedLength) / 2;
    const waveStartOffset = modifierVisualState?.wave?.anchorSide === "end"
      ? pulseAdjustedLength - currentLength
      : 0;

    return this.getReceiverBaseDistance(receiver) + offset + pulseCenteringOffset + waveStartOffset;
  }

  getReceiverTrackSegments(receiver, currentPhase, modifierVisualState = null) {
    const receiverModifierState = this.getReceiverModifierState(modifierVisualState);

    return this.getRoundedTrackSegments(
      this.getReceiverTrackStartDistance(receiver, modifierVisualState),
      this.getReceiverTrackLength(receiverModifierState.isShort, modifierVisualState)
    );
  }

  getReceiverTrackHitAreas(receiver, currentPhase, modifierVisualState = null) {
    const layout = this.getScaledLayout();
    return this.getReceiverTrackSegments(receiver, currentPhase, modifierVisualState).map((segment) => {
      return this.getSegmentHitArea(segment.start, segment.end, layout.railSize);
    });
  }

  getMovingReceiverTrackLength(modifierVisualState = null) {
    const receiverModifierState = this.getReceiverModifierState(modifierVisualState);
    return this.getReceiverTrackLength(receiverModifierState.isShort, modifierVisualState);
  }

  getMovingReceiverBaseDistance(receiver) {
    return this.getReceiverBaseDistance(receiver);
  }

  getMovingReceiverStartDistance(receiver, currentPhase, modifierVisualState = null) {
    return this.getReceiverTrackStartDistance(receiver, modifierVisualState);
  }

  getMovingReceiverTrackSegments(receiver, currentPhase, modifierVisualState = null) {
    return this.getReceiverTrackSegments(receiver, currentPhase, modifierVisualState);
  }

  getMovingReceiverTrackHitAreas(receiver, currentPhase, modifierVisualState = null) {
    return this.getReceiverTrackHitAreas(receiver, currentPhase, modifierVisualState);
  }

  getMovingReceiverIconPoint(receiver, currentPhase, modifierVisualState = null) {
    if (modifierVisualState?.wave && !modifierVisualState.wave.iconVisible) {
      return null;
    }

    const receiverModifierState = this.getReceiverModifierState(modifierVisualState);
    const startDistance = this.getReceiverTrackStartDistance(receiver, modifierVisualState);
    const currentLength = this.getReceiverTrackLength(receiverModifierState.isShort, modifierVisualState);
    const iconDistance = modifierVisualState?.wave
      ? (modifierVisualState.wave.iconEdge === "start"
        ? startDistance
        : startDistance + currentLength)
      : startDistance + currentLength / 2;
    const iconPoint = this.getPointOnRoundedTrack(iconDistance);
    const iconInset = this.scaler.x(GAME_CONFIG.movingReceiverIconInset);

    return {
      x: iconPoint.x + iconPoint.inwardNormalX * iconInset,
      y: iconPoint.y + iconPoint.inwardNormalY * iconInset
    };
  }

  getMovingBottomGapSpawnOptions(currentPhase, modifierVisualState = null) {
    const bounds = this.getOuterTrackBounds();
    const occupiedIntervals = this.getMovingReceiverOccupiedBottomIntervals(
      currentPhase,
      modifierVisualState
    );
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

  getMovingReceiverOccupiedBottomIntervals(currentPhase, modifierVisualState = null) {
    const bounds = this.getOuterTrackBounds();
    const layout = this.getScaledLayout();
    const railCapMargin = layout.railSize / 2;
    const bottomCollisionBandTop = bounds.bottom - railCapMargin;

    const occupiedIntervals = this.receivers
      .flatMap((receiver) => this.getMovingReceiverTrackSegments(
        receiver,
        currentPhase,
        modifierVisualState
      ))
      .filter((segment) => {
        return (
          segment.start.y >= bottomCollisionBandTop ||
          segment.end.y >= bottomCollisionBandTop
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
    introVisualState = null,
    modifierVisualState = null
  ) {
    const railOpacity = introVisualState?.railOpacity ?? 1;
    const iconOpacity = introVisualState?.iconOpacity ?? 1;
    const receiverModifierState = this.getReceiverModifierState(modifierVisualState);

    if (receiverModifierState.isSliding) {
      if (wallColorAnimation && wallColorAnimation.progress < 1) {
        this.drawMovingReceiverTracksWithWallColorAnimation(
          context,
          currentPhase,
          wallColorAnimation,
          hitFeedbackByReceiverId,
          railOpacity,
          modifierVisualState
        );

        this.drawReceiverIconsWithWallColorAnimation(
          context,
          currentPhase,
          wallColorAnimation,
          hitFeedbackByReceiverId,
          iconOpacity,
          modifierVisualState
        );

        return;
      }

      this.receivers.forEach((receiver) =>
        this.drawMovingReceiverTrack(
          context,
          receiver,
          currentPhase,
          hitFeedbackByReceiverId[receiver.id] || 0,
          modifierVisualState,
          null,
          railOpacity
        )
      );

      this.drawReceiverIcons(
        context,
        currentPhase,
        iconOpacity,
        hitFeedbackByReceiverId,
        modifierVisualState
      );

      return;
    }

    if (wallColorAnimation && wallColorAnimation.progress < 1) {
      this.drawReceiverTracksWithWallColorAnimation(
        context,
        currentPhase,
        wallColorAnimation,
        hitFeedbackByReceiverId,
        railOpacity,
        modifierVisualState
      );

      this.drawReceiverIconsWithWallColorAnimation(
        context,
        currentPhase,
        wallColorAnimation,
        hitFeedbackByReceiverId,
        iconOpacity,
        modifierVisualState
      );

      return;
    }

    this.receivers.forEach((receiver) =>
      this.drawReceiverTrack(
        context,
        receiver,
        currentPhase,
        null,
        railOpacity,
        hitFeedbackByReceiverId[receiver.id] || 0,
        modifierVisualState
      )
    );

    this.drawReceiverIcons(
      context,
      currentPhase,
      iconOpacity,
      hitFeedbackByReceiverId,
      modifierVisualState
    );

  }

  drawMovingReceiverTracksWithWallColorAnimation(
    context,
    currentPhase,
    wallColorAnimation,
    hitFeedbackByReceiverId = {},
    opacity = 1,
    modifierVisualState = null
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

      this.drawMovingReceiverTrack(
        context,
        receiver,
        currentPhase,
        hitStrength,
        modifierVisualState,
        previousColor,
        (1 - wallColorAnimation.progress) * opacity
      );

      this.drawMovingReceiverTrack(
        context,
        receiver,
        currentPhase,
        hitStrength,
        modifierVisualState,
        currentColor,
        wallColorAnimation.progress * opacity
      );
    });
  }

  drawReceiverTracksWithWallColorAnimation(
    context,
    currentPhase,
    wallColorAnimation,
    hitFeedbackByReceiverId = {},
    opacity = 1,
    modifierVisualState = null
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
        hitStrength,
        modifierVisualState
      );

      this.drawReceiverTrack(
        context,
        receiver,
        currentPhase,
        currentColor,
        wallColorAnimation.progress * opacity,
        hitStrength,
        modifierVisualState
      );
    });
  }

  drawReceiverIconsWithWallColorAnimation(
    context,
    currentPhase,
    wallColorAnimation,
    hitFeedbackByReceiverId = {},
    opacity = 1,
    modifierVisualState = null
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
      hitFeedbackByReceiverId,
      modifierVisualState
    );

    this.drawReceiverIcons(
      context,
      currentPhase,
      wallColorAnimation.progress * opacity,
      hitFeedbackByReceiverId,
      modifierVisualState
    );
  }

  drawMovingReceiverTrack(
    context,
    receiver,
    currentPhase,
    hitStrength = 0,
    modifierVisualState = null,
    colorOverride = null,
    opacity = 1
  ) {
    const receiverVisual = this.getReceiverVisualStyle(
      receiver,
      currentPhase,
      opacity,
      modifierVisualState,
      colorOverride
    );
    const receiverNeonColor = receiverVisual.color;

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
    context.shadowBlur = this.scaler.x(48) * haloMultiplier * receiverVisual.glowMultiplier;
    context.strokeStyle = receiverNeonColor;
    context.lineCap = "round";
    context.lineJoin = "round";

    context.beginPath();
    this.getMovingReceiverTrackSegments(receiver, currentPhase, modifierVisualState).forEach((segment) => {
      context.moveTo(segment.start.x, segment.start.y);
      context.lineTo(segment.end.x, segment.end.y);
    });

    context.globalAlpha = receiverVisual.opacity;
    context.lineWidth = this.scaler.x(7) * thicknessMultiplier;
    context.stroke();
    context.restore();
  }

  drawReceiverTrack(context, receiver, currentPhase, colorOverride = null, opacity = 1, hitStrength = 0, modifierVisualState = null) {
    const receiverVisual = this.getReceiverVisualStyle(
      receiver,
      currentPhase,
      opacity,
      modifierVisualState,
      colorOverride
    );
    const receiverNeonColor = receiverVisual.color;

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
    context.shadowBlur = this.scaler.x(48) * haloMultiplier * receiverVisual.glowMultiplier;
    context.strokeStyle = receiverNeonColor;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = this.scaler.x(4);

    context.beginPath();

    const trackSegments = this.getReceiverTrackSegments(
      receiver,
      currentPhase,
      modifierVisualState
    );

    trackSegments.forEach((segment, index) => {
      if (index === 0) {
        context.moveTo(segment.start.x, segment.start.y);
      }

      context.lineTo(segment.end.x, segment.end.y);
    });


    context.globalAlpha = receiverVisual.opacity;
    context.lineWidth = this.scaler.x(7) * thicknessMultiplier;
    context.globalCompositeOperation = "lighter";
    context.stroke();
    context.restore();
  }

  drawReceiverIcons(context, currentPhase, opacity = 1, hitFeedbackByReceiverId = {}, modifierVisualState = null) {
    const receiverIconRadius =
      this.scaler.x(GAME_CONFIG.shapeRadius);

    const iconPositionsByReceiverId = this.receivers.reduce(
      (positionsByReceiverId, receiver) => {
        positionsByReceiverId[receiver.id] =
          this.getMovingReceiverIconPoint(
            receiver,
            currentPhase,
            modifierVisualState
          );

        return positionsByReceiverId;
      },
      {}
    );

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

      const iconVisual = this.getReceiverIconVisualStyle(
        receiver,
        currentPhase,
        opacity,
        modifierVisualState
      );

      const iconPosition = iconPositionsByReceiverId[receiver.id];

      if (!iconPosition) return;

      ShapeRenderer.draw(
        context,
        iconPosition,
        this.getReceiverShapeName(receiver, currentPhase),
        iconVisual.color,
        receiverIconRadius,
        iconVisual.opacity,
        glowMultiplier * iconVisual.glowMultiplier,
        strokeMultiplier
      );
    });
  }

  getReceiverModifierState(modifierVisualState) {
    return {
      isSliding: Boolean(modifierVisualState?.receivers?.isSliding),
      isShort: Boolean(modifierVisualState?.receivers?.isShort),
      movingOffset: modifierVisualState?.receivers?.movingOffset || 0
    };
  }

  getReceiverVisualStyle(receiver, currentPhase, opacity, modifierVisualState, colorOverride = null) {
    if (modifierVisualState?.blink?.isNeutral) {
      return {
        color: modifierVisualState.blink.railColor,
        opacity: opacity * modifierVisualState.blink.railOpacityMultiplier,
        glowMultiplier: modifierVisualState.blink.glowMultiplier
      };
    }

    return {
      color: colorOverride || this.getReceiverNeonColor(receiver, currentPhase),
      opacity,
      glowMultiplier: 1
    };
  }

  getReceiverIconVisualStyle(receiver, currentPhase, opacity, modifierVisualState) {
    if (modifierVisualState?.blink?.isNeutral) {
      return {
        color: modifierVisualState.blink.iconColor,
        opacity: 0,
        glowMultiplier: 0
      };
    }

    return {
      color: this.getReceiverNeonColor(receiver, currentPhase),
      opacity,
      glowMultiplier: 1
    };
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

    if (shapeName === "hexagon") {
      context.moveTo(center.x, center.y - radius * 1.18);
      context.lineTo(center.x + radius * 0.98, center.y - radius * 0.55);
      context.lineTo(center.x + radius * 0.98, center.y + radius * 0.55);
      context.lineTo(center.x, center.y + radius * 1.18);
      context.lineTo(center.x - radius * 0.98, center.y + radius * 0.55);
      context.lineTo(center.x - radius * 0.98, center.y - radius * 0.55);
      context.closePath();
      return;
    }

    if (shapeName === "diamond") {
      context.moveTo(center.x, center.y - radius * 1.45);
      context.lineTo(center.x + radius * 0.78, center.y);
      context.lineTo(center.x, center.y + radius * 1.45);
      context.lineTo(center.x - radius * 0.78, center.y);
      context.closePath();
      return;
    }

    if (shapeName === "rectangle") {
      context.rect(
        center.x - radius * 1.45,
        center.y - radius * 0.46,
        radius * 2.9,
        radius * 0.92
      );
      return;
    }

    ShapeRenderer.createStarPath(context, center.x, center.y, radius * 0.56, radius * 1.08, 5);
  }

  static createRegularPolygonPath(context, x, y, radius, sideCount, rotation = -Math.PI / 2) {
    for (let index = 0; index < sideCount; index += 1) {
      const angle = rotation + (Math.PI * 2 * index) / sideCount;
      const pointX = x + Math.cos(angle) * radius;
      const pointY = y + Math.sin(angle) * radius;

      if (index === 0) {
        context.moveTo(pointX, pointY);
      } else {
        context.lineTo(pointX, pointY);
      }
    }

    context.closePath();
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
    this.activeRuleSequenceMode = "none";
  }

  getRuleNameForPhase(phase, requestedRuleSequenceMode) {
    if (this.hasActiveSequence()) {
      return this.activeRuleName;
    }

    if (!this.isSequenceModeEnabled(requestedRuleSequenceMode)) {
      return phase.ruleName;
    }

    this.startSequence(phase.ruleName, requestedRuleSequenceMode);
    return this.activeRuleName;
  }

  getPhaseWithCurrentRule(phase, requestedRuleSequenceMode) {
    if (this.hasActiveSequence()) {
      return {
        ...phase,
        ruleName: this.activeRuleName
      };
    }

    if (!this.isSequenceModeEnabled(requestedRuleSequenceMode)) {
      return phase;
    }

    this.startSequence(phase.ruleName, requestedRuleSequenceMode);

    return {
      ...phase,
      ruleName: this.activeRuleName
    };
  }

  consumeSuccessfulAnswer(
    answeredPhase,
    nextPhase = answeredPhase,
    requestedNextRuleSequenceMode = "none"
  ) {
    if (!this.hasActiveSequence()) return null;

    this.remainingAnswersInSequence -= 1;

    if (this.remainingAnswersInSequence > 0) return null;

    if (!this.isSequenceModeEnabled(requestedNextRuleSequenceMode)) {
      this.clearSequence();
      return nextPhase.ruleName;
    }

    this.activeRuleName = this.getOppositeRuleName(this.activeRuleName);
    this.activeRuleSequenceMode = requestedNextRuleSequenceMode;
    this.remainingAnswersInSequence = this.createSequenceLength(requestedNextRuleSequenceMode);
    return this.activeRuleName;
  }

  startSequence(initialRuleName, ruleSequenceMode) {
    this.activeRuleName = initialRuleName;
    this.activeRuleSequenceMode = ruleSequenceMode;
    this.remainingAnswersInSequence = this.createSequenceLength(ruleSequenceMode);
  }

  createSequenceLength(ruleSequenceMode) {
    const sequenceConfig = RULE_SEQUENCE_MODES[ruleSequenceMode];
    if (!sequenceConfig) return 0;

    return (
      sequenceConfig.minAnswers +
      Math.floor(
        Math.random() *
        (sequenceConfig.maxAnswers - sequenceConfig.minAnswers + 1)
      )
    );
  }

  forceNewSequence(phase, ruleSequenceMode) {
    if (!this.isSequenceModeEnabled(ruleSequenceMode)) {
      this.clearSequence();
      return;
    }

    this.startSequence(phase.ruleName, ruleSequenceMode);
  }

  hasActiveSequence() {
    return Boolean(
      this.activeRuleName &&
      this.remainingAnswersInSequence > 0 &&
      this.activeRuleSequenceMode !== "none"
    );
  }

  willSwitchRuleAfterNextSuccessfulAnswer() {
    return this.hasActiveSequence() && this.remainingAnswersInSequence <= 1;
  }

  clearSequence() {
    this.activeRuleName = null;
    this.remainingAnswersInSequence = 0;
    this.activeRuleSequenceMode = "none";
  }

  isSequenceModeEnabled(ruleSequenceMode) {
    return Boolean(RULE_SEQUENCE_MODES[ruleSequenceMode]);
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

  startPermutation(currentTime, phase, permutationMode) {
    const shouldPermuteColors = usesColorPermutation(permutationMode);
    const shouldPermuteShapes = usesShapePermutation(permutationMode);

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

  getPhaseWithCurrentPermutation(phase, permutationMode) {
    return {
      ...phase,
      receiverColorsByPositionId: this.currentReceiverColorsByPositionId,
      receiverShapesByPositionId: this.currentReceiverShapesByPositionId
    };
  }


  get isActive() {
    return this.isAnimating && this.permutationProgress < 1;
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

  syncValues(valuesByPositionId) {
    this.currentValuesByPositionId = { ...valuesByPositionId };
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
    return GAME_CONFIG.spawnImpulse;
  }

  static getGravity(challengePhase, spawnEntryMode = "bottom") {
    if (spawnEntryMode === "top") {
      return GAME_CONFIG.gravity * GAME_CONFIG.topSpawnGravityMultiplier;
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

  get isShowingModifierIntro() {
    return this.is("modifierIntro");
  }
}

class BlinkController {
  constructor({ visibleDurationMs, neutralDurationMs }) {
    this.visibleDurationMs = visibleDurationMs;
    this.neutralDurationMs = neutralDurationMs;
    this.reset();
  }

  reset() {
    this.startedAt = performance.now();
  }

  getVisualState(currentTime, isEnabled) {
    if (!isEnabled) return null;

    const cycleDurationMs = this.visibleDurationMs + this.neutralDurationMs;
    const elapsedCycleMs = (currentTime - this.startedAt) % cycleDurationMs;

    if (elapsedCycleMs < this.visibleDurationMs) {
      return { isNeutral: false };
    }

    return {
      isNeutral: true,
      ...NEUTRAL_RECEIVER_VISUALS
    };
  }
}

class PulseController {
  constructor({ cycleDurationMs, minLengthMultiplier }) {
    this.cycleDurationMs = cycleDurationMs;
    this.minLengthMultiplier = minLengthMultiplier;
    this.reset();
  }

  reset() {
    this.startedAt = performance.now();
  }

  getVisualState(currentTime, isEnabled) {
    if (!isEnabled) return null;

    const elapsedCycleMs = (currentTime - this.startedAt) % this.cycleDurationMs;
    const cycleProgress = elapsedCycleMs / this.cycleDurationMs;
    const shrinkAmount = (1 - Math.cos(cycleProgress * Math.PI * 2)) / 2;
    const lengthMultiplier = 1 - (1 - this.minLengthMultiplier) * shrinkAmount;

    return { lengthMultiplier };
  }
}

class WaveController {
  constructor({ cycleDurationMs, minLengthMultiplier }) {
    this.cycleDurationMs = cycleDurationMs;
    this.minLengthMultiplier = minLengthMultiplier;
    this.reset();
  }

  reset() {
    this.startedAt = performance.now();
  }

  getVisualState(currentTime, isEnabled) {
    if (!isEnabled) return null;

    const elapsedCycleMs = (currentTime - this.startedAt) % this.cycleDurationMs;
    const cycleProgress = elapsedCycleMs / this.cycleDurationMs;
    const phaseProgress = (cycleProgress * 4) % 1;
    const phaseIndex = Math.floor(cycleProgress * 4);
    const isShrinking = phaseIndex === 0 || phaseIndex === 2;
    const lengthMultiplier = isShrinking
      ? this.interpolateLength(1, this.minLengthMultiplier, phaseProgress)
      : this.interpolateLength(this.minLengthMultiplier, 1, phaseProgress);
    const isAnchoredToStart = phaseIndex === 0 || phaseIndex === 1;

    return {
      lengthMultiplier,
      anchorSide: isAnchoredToStart ? "start" : "end",
      iconEdge: isAnchoredToStart ? "end" : "start",
      iconVisible: lengthMultiplier > this.minLengthMultiplier + 0.001
    };
  }

  interpolateLength(start, end, progress) {
    const easedProgress = (1 - Math.cos(progress * Math.PI)) / 2;
    return start + (end - start) * easedProgress;
  }
}

class SpawnController {
  constructor(game) {
    this.game = game;
    this.strategies = {
      bottom: () => this.getBottomSpawn(),
      bottomCorners: () => this.getBottomCornerSpawn(),
      top: () => this.getTopSpawn(),
      side: () => this.getSideSpawn()
    };
  }

  getSingleShapeSpawn(phase) {
    const spawnMode = this.game.getCurrentSpawnMode();
    const spawnStrategy =
      this.strategies[spawnMode] ||
      this.strategies.bottom;

    return spawnStrategy(phase);
  }

  getBottomSpawn() {
    const { scaler } = this.game;

    return {
      x: scaler.x(GAME_CONFIG.designWidth / 2),
      y: scaler.y(scaler.designHeight + 38),
      velocityX: 0,
      velocityY: scaler.y(this.game.currentChallengeSpawnImpulse),
      entryMode: "bottom"
    };
  }

  getBottomCornerSpawn() {
    const { scaler } = this.game;

    const spawnFromLeft =
      Math.random() < 0.5;

    const spawnX = spawnFromLeft
      ? GAME_CONFIG.bottomCornerSpawnInset
      : GAME_CONFIG.designWidth -
      GAME_CONFIG.bottomCornerSpawnInset;

    const horizontalImpulse = spawnFromLeft
      ? GAME_CONFIG.bottomCornerSpawnHorizontalImpulse
      : -GAME_CONFIG.bottomCornerSpawnHorizontalImpulse;

    return {
      x: scaler.x(spawnX),

      y: scaler.y(
        scaler.designHeight + 38
      ),

      velocityX: scaler.x(
        horizontalImpulse
      ),

      velocityY: scaler.y(
        this.game.currentChallengeSpawnImpulse
      ),

      entryMode: "bottom",
      physicalSide: spawnFromLeft
        ? "left"
        : "right"
    };
  }

  getTopSpawn() {
    const { scaler } = this.game;

    return {
      x: scaler.x(GAME_CONFIG.designWidth / 2),
      y: scaler.y(40),
      velocityX: 0,
      velocityY: 0,
      entryMode: "top"
    };
  }

  getSideSpawn() {
    return Math.random() < 0.5 ? this.getLeftSpawn() : this.getRightSpawn();
  }

  getLeftSpawn() {
    const { scaler } = this.game;
    const spawnY =
      scaler.y(
        scaler.designHeight *
        GAME_CONFIG.sideEntryHeightRatio
      );

    return {
      x: scaler.x(-GAME_CONFIG.shapeRadius - 8),
      y: spawnY,
      velocityX: scaler.x(GAME_CONFIG.sideEntryHorizontalImpulse),
      velocityY: scaler.y(GAME_CONFIG.sideEntryUpwardImpulse),
      entryMode: "side",
      physicalSide: "left"
    };
  }

  getRightSpawn() {
    const { scaler } = this.game;
    const spawnY =
      scaler.y(
        scaler.designHeight *
        GAME_CONFIG.sideEntryHeightRatio
      );

    return {
      x: scaler.x(GAME_CONFIG.designWidth + GAME_CONFIG.shapeRadius + 8),
      y: spawnY,
      velocityX: scaler.x(-GAME_CONFIG.sideEntryHorizontalImpulse),
      velocityY: scaler.y(GAME_CONFIG.sideEntryUpwardImpulse),
      entryMode: "side",
      physicalSide: "right"
    };
  }

  getMovingGapSpawn(phase) {
    const modifierVisualState = this.game.getModifierVisualState(performance.now());
    const spawnOptions = this.game.arena.getMovingBottomGapSpawnOptions(
      phase,
      modifierVisualState
    );
    const { spawnX } = getRandomItem(spawnOptions);

    return {
      x: spawnX,
      y: this.game.scaler.y(this.game.scaler.designHeight + 38),
      velocityX: this.getMovingBottomSpawnVelocityX(spawnX),
      velocityY: this.game.scaler.y(this.game.currentChallengeSpawnImpulse),
      entryMode: "bottom"
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
    this.multiShapeTimeoutIds = [];
    this.nextSingleShapeTimeoutId = null;
    this.burstShapeTimeoutIds = [];
    this.clear();
  }

  clear() {
    this.clearMultiShapeTimeouts();
    this.clearBurstShapeTimeouts();
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.currentChallengePhase = null;
    this.selectedShape = null;
    this.multiShapes = [];
    this.multiShapeCount = 0;
    this.burstShapes = [];
    this.burstActiveIndex = null;
    this.burstShapeCount = 0;
    this.twinShapes = [];
    this.twinActiveIndex = null;
    this.twinShapeCount = 0;
  }

  setSingleShape(fallingShape, challengePhase = null) {
    this.multiShapes = [];
    this.multiShapeCount = 0;
    this.burstShapes = [];
    this.burstActiveIndex = null;
    this.burstShapeCount = 0;
    this.twinShapes = [];
    this.twinActiveIndex = null;
    this.twinShapeCount = 0;
    this.currentShapes = this.currentShapes.filter((shape) => shape.state !== "resolved");
    this.activeShape = fallingShape;
    this.currentShapes.push(fallingShape);
    this.activeShapeIndex = this.currentShapes.indexOf(fallingShape);
    this.currentChallengePhase = challengePhase;
    this.selectedShape = null;
  }

  startBurstChallenge(firstShape, challengePhase, shapeCount) {
    this.multiShapes = [];
    this.multiShapeCount = 0;
    this.twinShapes = [];
    this.twinActiveIndex = null;
    this.twinShapeCount = 0;
    this.currentShapes = this.currentShapes.filter((shape) => shape.state !== "resolved");
    this.currentChallengePhase = challengePhase;
    this.burstShapes = [firstShape];
    this.burstActiveIndex = 0;
    this.burstShapeCount = shapeCount;
    this.currentShapes.push(firstShape);
    this.activeShape = firstShape;
    this.activeShapeIndex = this.currentShapes.indexOf(firstShape);
    this.selectedShape = null;
  }

  appendBurstShape(fallingShape, burstShapeIndex) {
    this.burstShapes[burstShapeIndex] = fallingShape;
    this.currentShapes.push(fallingShape);

    if (this.burstActiveIndex === burstShapeIndex && !this.activeShape) {
      this.activateBurstShapeAtIndex(burstShapeIndex);
    }
  }

  activateBurstShapeAtIndex(burstShapeIndex) {
    const nextShape = this.burstShapes[burstShapeIndex];

    if (!nextShape || nextShape.state === "resolved" || nextShape.hasBeenThrown) {
      this.activeShape = null;
      this.activeShapeIndex = null;
      return false;
    }

    nextShape.state = "active";
    this.activeShape = nextShape;
    this.activeShapeIndex = this.currentShapes.indexOf(nextShape);
    this.selectedShape = null;
    return true;
  }

  advanceBurstAfterActiveShape(fallingShape) {
    if (!this.isActiveBurstShape(fallingShape)) return false;

    this.activeShape = null;
    this.activeShapeIndex = null;
    this.selectedShape = null;
    this.burstActiveIndex += 1;

    while (
      this.burstActiveIndex < this.burstShapeCount &&
      this.burstShapes[this.burstActiveIndex]?.state === "resolved"
    ) {
      this.burstActiveIndex += 1;
    }

    if (this.burstActiveIndex >= this.burstShapeCount) {
      return true;
    }

    this.activateBurstShapeAtIndex(this.burstActiveIndex);
    return false;
  }

  isBurstChallengeActive() {
    return this.burstShapeCount > 0;
  }

  isBurstShape(fallingShape) {
    return Boolean(fallingShape?.isBurstShape) || this.burstShapes.includes(fallingShape);
  }

  isActiveBurstShape(fallingShape) {
    return this.isBurstChallengeActive() && this.burstShapes[this.burstActiveIndex] === fallingShape;
  }

  startTwinChallenge(firstShape, secondShape, challengePhase) {
    this.multiShapes = [];
    this.multiShapeCount = 0;
    this.burstShapes = [];
    this.burstActiveIndex = null;
    this.burstShapeCount = 0;
    this.currentShapes = this.currentShapes.filter((shape) => shape.state !== "resolved");
    this.currentChallengePhase = challengePhase;
    this.twinShapes = [firstShape, secondShape];
    this.twinActiveIndex = 0;
    this.twinShapeCount = 2;
    this.currentShapes.push(firstShape, secondShape);
    this.activeShape = firstShape;
    this.activeShapeIndex = this.currentShapes.indexOf(firstShape);
    this.selectedShape = null;
  }

  activateTwinShapeAtIndex(twinShapeIndex) {
    const nextShape = this.twinShapes[twinShapeIndex];

    if (!nextShape || nextShape.state === "resolved" || nextShape.hasBeenThrown) {
      this.activeShape = null;
      this.activeShapeIndex = null;
      return false;
    }

    nextShape.state = "active";
    this.activeShape = nextShape;
    this.activeShapeIndex = this.currentShapes.indexOf(nextShape);
    this.selectedShape = null;
    return true;
  }

  advanceTwinAfterActiveShape(fallingShape) {
    if (!this.isActiveTwinShape(fallingShape)) return false;

    this.activeShape = null;
    this.activeShapeIndex = null;
    this.selectedShape = null;
    this.twinActiveIndex += 1;

    while (
      this.twinActiveIndex < this.twinShapeCount &&
      this.twinShapes[this.twinActiveIndex]?.state === "resolved"
    ) {
      this.twinActiveIndex += 1;
    }

    if (this.twinActiveIndex >= this.twinShapeCount) {
      return true;
    }

    this.activateTwinShapeAtIndex(this.twinActiveIndex);
    return false;
  }

  isTwinChallengeActive() {
    return this.twinShapeCount > 0;
  }

  isTwinShape(fallingShape) {
    return Boolean(fallingShape?.isTwinShape) || this.twinShapes.includes(fallingShape);
  }

  isActiveTwinShape(fallingShape) {
    return this.isTwinChallengeActive() && this.twinShapes[this.twinActiveIndex] === fallingShape;
  }

  startMultiShapeChallenge(firstShape, challengePhase, shapeCount) {
    this.burstShapes = [];
    this.burstActiveIndex = null;
    this.burstShapeCount = 0;
    this.twinShapes = [];
    this.twinActiveIndex = null;
    this.twinShapeCount = 0;
    this.currentChallengePhase = challengePhase;
    this.currentShapes = [firstShape];
    this.multiShapes = [firstShape];
    this.multiShapeCount = shapeCount;
    this.activeShape = firstShape;
    this.activeShapeIndex = 0;
    this.selectedShape = null;
  }

  appendMultiShape(fallingShape, shapeIndex) {
    this.multiShapes[shapeIndex] = fallingShape;
    this.currentShapes.push(fallingShape);
  }

  isMultiShapeChallengeActive() {
    return this.multiShapeCount > 1;
  }

  isMultiShapeShape(fallingShape) {
    return Boolean(fallingShape?.isMultiShape) || this.multiShapes.includes(fallingShape);
  }

  areAllMultiShapesResolved() {
    const spawnedShapeCount = this.multiShapes.filter(Boolean).length;
    return (
      this.multiShapeCount > 1 &&
      spawnedShapeCount === this.multiShapeCount &&
      this.multiShapes.every((shape) => shape?.state === "resolved")
    );
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

  clearActiveShapeSelection() {
    this.activeShapeIndex = null;
    this.activeShape = null;
    this.selectedShape = null;
  }

  findSelectableShapeAtPoint(point) {
    return this.currentShapes.find((fallingShape) => {
      if (!fallingShape.canReceiveSwipe || fallingShape.hasBeenThrown) return false;

      const distanceFromShapeCenter = Math.hypot(point.x - fallingShape.x, point.y - fallingShape.y);
      return distanceFromShapeCenter <= fallingShape.radius * GAME_CONFIG.shapeSwipeHitboxMultiplier;
    }) || null;
  }

  areAllShapesResolved() {
    return this.currentShapes.length > 0 && this.currentShapes.every((fallingShape) => fallingShape.state === "resolved");
  }

  setMultiShapeTimeout(timeoutId) {
    this.multiShapeTimeoutIds.push(timeoutId);
  }

  removeMultiShapeTimeout(timeoutIdToRemove) {
    this.multiShapeTimeoutIds = this.multiShapeTimeoutIds.filter(
      (timeoutId) => timeoutId !== timeoutIdToRemove
    );
  }

  clearMultiShapeTimeouts() {
    this.multiShapeTimeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    this.multiShapeTimeoutIds = [];
  }

  setNextSingleShapeTimeout(timeoutId) {
    this.nextSingleShapeTimeoutId = timeoutId;
  }

  clearNextSingleShapeTimeout() {
    if (this.nextSingleShapeTimeoutId === null) return;

    window.clearTimeout(this.nextSingleShapeTimeoutId);
    this.nextSingleShapeTimeoutId = null;
  }

  setBurstShapeTimeout(timeoutId) {
    this.burstShapeTimeoutIds.push(timeoutId);
  }

  clearBurstShapeTimeouts() {
    this.burstShapeTimeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    this.burstShapeTimeoutIds = [];
  }

  removeBurstShapeTimeout(timeoutIdToRemove) {
    this.burstShapeTimeoutIds = this.burstShapeTimeoutIds.filter(
      (timeoutId) => timeoutId !== timeoutIdToRemove
    );
  }

  hasPendingNextSingleShape() {
    return this.nextSingleShapeTimeoutId !== null;
  }

  hasUnresolvedShapes() {
    return this.currentShapes.some((fallingShape) => fallingShape.state !== "resolved");
  }

  getVisibleShapes() {
    return this.currentShapes;
  }
}

class ThrowController {
  constructor({ scaler, arena, getActiveShape }) {
    this.scaler = scaler;
    this.arena = arena;
    this.getActiveShape = getActiveShape;
  }

  throwFromSwipe(swipeGesture) {
    const activeShape = this.getActiveShape();
    if (!activeShape || !activeShape.canReceiveSwipe || swipeGesture.distance < this.scaler.x(GAME_CONFIG.minSwipeDistance)) return;

    const direction = {
      x: swipeGesture.deltaX,
      y: swipeGesture.deltaY
    };
    const throwForce = this.calculateSwipeThrowForce(swipeGesture.distance, swipeGesture.durationMs);

    activeShape.throwToward(
      direction,
      throwForce,
      Boolean(activeShape.isMultiShape)
    );

    return activeShape;
  }

  throwAtTarget(target, gestureDistance = this.scaler.x(120), gestureDurationMs = 110) {
    const activeShape = this.getActiveShape();
    if (!activeShape || !activeShape.canReceiveSwipe) return;

    const direction = this.resolveThrowDirection(target);
    if (!direction) return;

    const throwForce = this.calculateThrowForce(direction, gestureDistance, gestureDurationMs);
    activeShape.throwToward(direction, throwForce, Boolean(activeShape.isMultiShape));
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
      initialReceiverColorsByPositionId: DEFAULT_COLOR_LAYOUT,
      initialReceiverShapesByPositionId: DEFAULT_SHAPE_LAYOUT
    });
    this.colorRotation = new ReceiverRotationController({
      initialValuesByPositionId: DEFAULT_COLOR_LAYOUT,
      intervalMs: GAME_CONFIG.receiverRotationIntervalMs,
      durationMs: GAME_CONFIG.receiverRotationDurationMs
    });
    this.shapeRotation = new ReceiverRotationController({
      initialValuesByPositionId: DEFAULT_SHAPE_LAYOUT,
      intervalMs: GAME_CONFIG.shapeRotationIntervalMs,
      durationMs: GAME_CONFIG.shapeRotationDurationMs
    });

    this.lastColorRotationSyncKey = null;
    this.lastShapeRotationSyncKey = null;
    this.hitFeedbacks = [];
  }

  reset() {
    this.permutation.reset();
    this.colorRotation.reset();
    this.shapeRotation.reset();
    this.lastColorRotationSyncKey = null;
    this.lastShapeRotationSyncKey = null;
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

  startPermutation(currentTime, phase, permutationMode) {
    this.permutation.startPermutation(currentTime, phase, permutationMode);
  }

  updatePermutation(currentTime) {
    return this.permutation.update(currentTime);
  }

  get isPermutationAnimating() {
    return this.permutation.isActive;
  }

  updateRotations(currentTime, phase, gameState, rotationMode, permutationMode) {
    const permutationPhase = this.getPhaseWithCurrentPermutationOnly(
      phase,
      permutationMode
    );
    const shouldRunColorRotation =
      gameState === "playing" &&
      this.usesColorRotation(rotationMode, phase.ruleName);

    const shouldRunShapeRotation =
      gameState === "playing" &&
      this.usesShapeRotation(rotationMode, phase.ruleName);

    if (shouldRunColorRotation) {
      this.syncColorRotationIfNeeded(permutationPhase);
    }

    if (shouldRunShapeRotation) {
      this.syncShapeRotationIfNeeded(permutationPhase);
    }

    this.colorRotation.update(currentTime, shouldRunColorRotation);
    this.shapeRotation.update(currentTime, shouldRunShapeRotation);
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

  syncRotationsToPhase(phase, permutationMode) {
    const permutationPhase = this.getPhaseWithCurrentPermutationOnly(
      phase,
      permutationMode
    );

    this.colorRotation.syncValues(permutationPhase.receiverColorsByPositionId);
    this.shapeRotation.syncValues(permutationPhase.receiverShapesByPositionId);
    this.lastColorRotationSyncKey = this.createRotationSyncKey(
      permutationPhase.receiverColorsByPositionId
    );
    this.lastShapeRotationSyncKey = this.createRotationSyncKey(
      permutationPhase.receiverShapesByPositionId
    );
  }

  syncColorRotationIfNeeded(permutationPhase) {
    const nextSyncKey = this.createRotationSyncKey(
      permutationPhase.receiverColorsByPositionId
    );

    if (this.colorRotation.isActive && this.lastColorRotationSyncKey === nextSyncKey) return;

    this.colorRotation.syncValues(permutationPhase.receiverColorsByPositionId);
    this.lastColorRotationSyncKey = nextSyncKey;
  }

  syncShapeRotationIfNeeded(permutationPhase) {
    const nextSyncKey = this.createRotationSyncKey(
      permutationPhase.receiverShapesByPositionId
    );

    if (this.shapeRotation.isActive && this.lastShapeRotationSyncKey === nextSyncKey) return;

    this.shapeRotation.syncValues(permutationPhase.receiverShapesByPositionId);
    this.lastShapeRotationSyncKey = nextSyncKey;
  }

  getPhaseWithCurrentPermutationOnly(phase, permutationMode = "none") {
    return this.permutation.getPhaseWithCurrentPermutation(
      phase,
      permutationMode
    );
  }

  createRotationSyncKey(valuesByPositionId) {
    return RECEIVER_DEFINITIONS
      .map((receiverDefinition) => `${receiverDefinition.id}:${valuesByPositionId[receiverDefinition.id]}`)
      .join("|");
  }

  getPhaseWithCurrentReceiverState(phase, permutationMode = "none", rotationMode = "none") {
    const receiverPermutationPhase = this.getPhaseWithCurrentPermutationOnly(
      phase,
      permutationMode
    );

    return {
      ...receiverPermutationPhase,
      receiverColorsByPositionId: this.usesColorRotationLayout(
        rotationMode,
        receiverPermutationPhase.ruleName
      )
        ? this.colorRotation.currentValuesByPositionId
        : receiverPermutationPhase.receiverColorsByPositionId,
      receiverShapesByPositionId: this.usesShapeRotationLayout(
        rotationMode,
        receiverPermutationPhase.ruleName
      )
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

  usesColorRotation(rotationMode, ruleName) {
    return usesColorRotation(rotationMode, ruleName);
  }

  usesShapeRotation(rotationMode, ruleName) {
    return usesShapeRotation(rotationMode, ruleName);
  }

  usesColorRotationLayout(rotationMode, ruleName) {
    return this.usesColorRotation(rotationMode, ruleName);
  }

  usesShapeRotationLayout(rotationMode, ruleName) {
    return this.usesShapeRotation(rotationMode, ruleName);
  }

  usesReceiverRotation(rotationMode) {
    return usesAnyRotation(rotationMode);
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

class ModifierIntroController {
  constructor(receiverEffects) {
    this.receiverEffects = receiverEffects;
    this.reset();
  }

  reset() {
    this.startedAt = 0;
    this.endsAt = 0;
    this.activeIntro = null;
    this.activeRuleName = null;
    this.hasStartedColorRotation = false;
    this.hasStartedShapeRotation = false;
  }

  shouldStart(previousModifiers, nextModifiers) {
    return Boolean(
      this.getIntroForModifierTransition(
        previousModifiers,
        nextModifiers
      )
    );
  }

  getIntroForModifierTransition(previousModifiers, nextModifiers) {
    return this.getRotationIntroForTransition(
      previousModifiers?.rotation || "none",
      nextModifiers?.rotation || "none"
    );
  }

  getRotationIntroForTransition(previousRotationMode, nextRotationMode) {
    if (previousRotationMode === nextRotationMode) return null;

    const previousCapabilities = this.getRotationCapabilities(previousRotationMode);
    const nextCapabilities = this.getRotationCapabilities(nextRotationMode);
    const addedCapabilities = nextCapabilities.filter(
      (capability) => !previousCapabilities.includes(capability)
    );

    if (addedCapabilities.length === 0) return null;

    if (nextRotationMode === "both" && previousRotationMode === "none") {
      return {
        type: "rotation",
        mode: "both",
        label: "DUAL ROTATION"
      };
    }

    if (nextRotationMode === "rule") {
      return {
        type: "rotation",
        mode: "rule",
        label: "RULE ROTATION"
      };
    }

    if (addedCapabilities.includes("color") && addedCapabilities.includes("shape")) {
      return {
        type: "rotation",
        mode: "both",
        label: "DUAL ROTATION"
      };
    }

    if (addedCapabilities.includes("color")) {
      return {
        type: "rotation",
        mode: "color",
        label: "COLOR ROTATION"
      };
    }

    if (addedCapabilities.includes("shape")) {
      return {
        type: "rotation",
        mode: "shape",
        label: "SHAPE ROTATION"
      };
    }

    return null;
  }

  getRotationCapabilities(rotationMode) {
    if (rotationMode === "color") return ["color"];
    if (rotationMode === "shape") return ["shape"];
    if (rotationMode === "both") return ["color", "shape"];
    if (rotationMode === "rule") return ["rule"];
    return [];
  }

  start(currentTime, intro, activeRuleName) {
    if (!intro) return null;

    this.startedAt = currentTime;
    this.endsAt = currentTime + GAME_CONFIG.modifierIntroDurationMs;
    this.activeIntro = { ...intro };
    this.activeRuleName = activeRuleName;
    this.hasStartedColorRotation = false;
    this.hasStartedShapeRotation = false;

    return "modifierIntro";
  }

  update(currentTime) {
    if (!this.activeIntro) return true;

    const elapsedMs = currentTime - this.startedAt;

    if (elapsedMs >= GAME_CONFIG.modifierIntroEffectDelayMs) {
      this.updateRotationIntro(currentTime);
    }

    return currentTime >= this.endsAt;
  }

  updateRotationIntro(currentTime) {
    if (this.activeIntro?.type !== "rotation") return;

    if (this.shouldDemonstrateColorRotation()) {
      this.updateColorRotationIntro(currentTime);
    }

    if (this.shouldDemonstrateShapeRotation()) {
      this.updateShapeRotationIntro(currentTime);
    }
  }

  shouldDemonstrateColorRotation() {
    return (
      this.activeIntro.mode === "color" ||
      this.activeIntro.mode === "both" ||
      (this.activeIntro.mode === "rule" && this.activeRuleName === "COLOR")
    );
  }

  shouldDemonstrateShapeRotation() {
    return (
      this.activeIntro.mode === "shape" ||
      this.activeIntro.mode === "both" ||
      (this.activeIntro.mode === "rule" && this.activeRuleName === "SHAPE")
    );
  }

  updateColorRotationIntro(currentTime) {
    if (!this.hasStartedColorRotation) {
      this.receiverEffects.startColorRotation(currentTime);
      this.hasStartedColorRotation = true;
    }

    this.receiverEffects.updateColorRotation(currentTime, true);
  }

  updateShapeRotationIntro(currentTime) {
    if (!this.hasStartedShapeRotation) {
      this.receiverEffects.startShapeRotation(currentTime);
      this.hasStartedShapeRotation = true;
    }

    this.receiverEffects.updateShapeRotation(currentTime, true);
  }

  getLines() {
    return [this.activeIntro?.label || ""];
  }
}
class HomeScreen {
  constructor(scaler) {
    this.scaler = scaler;
    this.hitTargets = {};
  }

  draw(context, data, currentTime) {
    this.hitTargets = this.getLayout();

    this.drawBorder(context);
    this.drawCornerShapes(context, currentTime);
    this.drawSettingsButton(context);
    this.drawLogo(context, currentTime, this.hitTargets);
    this.drawPlayButton(context, currentTime);
    this.drawBestScore(context, data.bestScore, this.hitTargets);
    this.drawDailyCard(context, data, currentTime);

  }

  getLayout() {
    const centerX = this.scaler.canvasWidth / 2;
    const extraHeight = this.getResponsiveExtraHeight();
    const logoY = 235 + extraHeight * 0.2;
    const playY = 420 + extraHeight * 0.45;
    const bestOffsetY = extraHeight * 0.45;
    const dailyY = this.scaler.designHeight - 230;

    return {
      settings: this.rectFromCenter(this.scaler.x(42), this.scaler.y(38), this.scaler.x(46), this.scaler.y(46)),
      logoY: this.scaler.y(logoY),
      play: this.rectFromCenter(centerX, this.scaler.y(playY), this.scaler.x(294), this.scaler.y(76)),
      bestLabelY: this.scaler.y(530 + bestOffsetY),
      bestScoreY: this.scaler.y(580 + bestOffsetY),
      daily: this.rectFromCenter(centerX, this.scaler.y(dailyY), this.scaler.x(300), this.scaler.y(80))
    };
  }

  getResponsiveExtraHeight() {
    return Math.max(this.scaler.designHeight - this.scaler.baseDesignHeight, 0);
  }

  rectFromCenter(centerX, centerY, width, height) {
    return {
      x: centerX - width / 2,
      y: centerY - height / 2,
      width,
      height
    };
  }

  getHitTarget(point) {
    return ["play", "daily", "settings"].find((targetName) => {
      const target = this.hitTargets[targetName] || this.getLayout()[targetName];
      return this.isPointInRect(point, target);
    }) || null;
  }

  isPointInRect(point, rect) {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  drawBorder(context) {
    const layout = this.getArenaLikeLayout();
    const middleX = layout.outerX + layout.outerWidth / 2;
    const rightX = layout.outerX + layout.outerWidth;
    const bottomY = layout.outerY + layout.outerHeight;

    this.drawBorderSegment(context, NEON_COLORS.green, (ctx) => {
      ctx.moveTo(middleX, layout.outerY + layout.railSize / 2);
      ctx.lineTo(layout.outerX + layout.cornerRadius, layout.outerY + layout.railSize / 2);
      ctx.quadraticCurveTo(layout.outerX + layout.railSize / 2, layout.outerY + layout.railSize / 2, layout.outerX + layout.railSize / 2, layout.outerY + layout.cornerRadius);
      ctx.lineTo(layout.outerX + layout.railSize / 2, layout.outerY + layout.outerHeight / 2);
    });

    this.drawBorderSegment(context, NEON_COLORS.red, (ctx) => {
      ctx.moveTo(middleX, layout.outerY + layout.railSize / 2);
      ctx.lineTo(rightX - layout.cornerRadius, layout.outerY + layout.railSize / 2);
      ctx.quadraticCurveTo(rightX - layout.railSize / 2, layout.outerY + layout.railSize / 2, rightX - layout.railSize / 2, layout.outerY + layout.cornerRadius);
      ctx.lineTo(rightX - layout.railSize / 2, layout.outerY + layout.outerHeight / 2);
    });

    this.drawBorderSegment(context, NEON_COLORS.blue, (ctx) => {
      ctx.moveTo(layout.outerX + layout.railSize / 2, layout.outerY + layout.outerHeight / 2);
      ctx.lineTo(layout.outerX + layout.railSize / 2, bottomY - layout.cornerRadius);
      ctx.quadraticCurveTo(layout.outerX + layout.railSize / 2, bottomY - layout.railSize / 2, layout.outerX + layout.cornerRadius, bottomY - layout.railSize / 2);
      ctx.lineTo(middleX, bottomY - layout.railSize / 2);
    });

    this.drawBorderSegment(context, NEON_COLORS.yellow, (ctx) => {
      ctx.moveTo(rightX - layout.railSize / 2, layout.outerY + layout.outerHeight / 2);
      ctx.lineTo(rightX - layout.railSize / 2, bottomY - layout.cornerRadius);
      ctx.quadraticCurveTo(rightX - layout.railSize / 2, bottomY - layout.railSize / 2, rightX - layout.cornerRadius, bottomY - layout.railSize / 2);
      ctx.lineTo(middleX, bottomY - layout.railSize / 2);
    });
  }

  getArenaLikeLayout() {
    return {
      outerX: this.scaler.x(2),
      outerY: this.scaler.y(52),
      outerWidth: this.scaler.x(536),
      outerHeight: this.scaler.y(this.scaler.designHeight - 54),
      railSize: this.scaler.x(48),
      cornerRadius: this.scaler.x(150)
    };
  }

  drawBorderSegment(context, color, drawPath) {
    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";
    context.shadowColor = color;
    context.shadowBlur = this.scaler.x(28);
    context.strokeStyle = color;
    context.lineWidth = this.scaler.x(7);
    context.globalCompositeOperation = "lighter";
    context.beginPath();
    drawPath(context);
    context.stroke();
    context.restore();
  }

  drawCornerShapes(context, currentTime) {
    const layout = this.getArenaLikeLayout();
    const iconRadius = this.scaler.x(20);
    const insetX = this.scaler.x(85);
    const insetY = this.scaler.y(100);

    const floatAmount = this.scaler.y(6);
    const speed = 550;

    const triangleOffset = Math.sin(currentTime / speed) * floatAmount;
    const starOffset = Math.sin(currentTime / speed + 1.5) * floatAmount;
    const squareOffset = Math.sin(currentTime / speed + 3) * floatAmount;
    const circleOffset = Math.sin(currentTime / speed + 4.5) * floatAmount;

    ShapeRenderer.draw(
      context,
      {
        x: layout.outerX + insetX,
        y: layout.outerY + insetY + triangleOffset
      },
      "triangle",
      NEON_COLORS.green,
      iconRadius,
      0.9,
      1.25
    );

    ShapeRenderer.draw(
      context,
      {
        x: layout.outerX + layout.outerWidth - insetX,
        y: layout.outerY + insetY + starOffset
      },
      "star",
      NEON_COLORS.red,
      iconRadius,
      0.9,
      1.25
    );

    ShapeRenderer.draw(
      context,
      {
        x: layout.outerX + insetX,
        y: layout.outerY + layout.outerHeight - insetY + squareOffset
      },
      "square",
      NEON_COLORS.blue,
      iconRadius,
      0.9,
      1.25
    );

    ShapeRenderer.draw(
      context,
      {
        x: layout.outerX + layout.outerWidth - insetX,
        y: layout.outerY + layout.outerHeight - insetY + circleOffset
      },
      "circle",
      NEON_COLORS.yellow,
      iconRadius,
      0.9,
      1.25
    );
  }

  drawSettingsButton(context) {
    const target = this.hitTargets.settings;
    const center = {
      x: target.x + target.width / 2,
      y: target.y + target.height / 2
    };
    const radius = this.scaler.x(12);

    context.save();
    context.strokeStyle = "rgba(238, 244, 255, 0.72)";
    context.shadowColor = "rgba(238, 244, 255, 0.38)";
    context.shadowBlur = this.scaler.x(8);
    context.lineWidth = this.scaler.x(2);
    context.beginPath();
    context.arc(center.x, center.y, radius, 0, Math.PI * 2);
    context.stroke();

    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8;
      const inner = radius + this.scaler.x(3);
      const outer = radius + this.scaler.x(7);
      context.beginPath();
      context.moveTo(center.x + Math.cos(angle) * inner, center.y + Math.sin(angle) * inner);
      context.lineTo(center.x + Math.cos(angle) * outer, center.y + Math.sin(angle) * outer);
      context.stroke();
    }

    context.restore();
  }

  drawTrackedText(context, text, centerX, y, options = {}) {
    const {
      fontSize = 40,
      fontFamily = "Oxanium",
      fontWeight = 400,
      tracking = 10,
      fillStyle = "#ffffff",
      shadowColor = "rgba(255,255,255,0.5)",
      shadowBlur = 10
    } = options;

    context.save();
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    context.textBaseline = "middle";
    context.textAlign = "left";
    context.fillStyle = fillStyle;
    context.shadowColor = shadowColor;
    context.shadowBlur = shadowBlur;

    const letters = text.split("");
    const widths = letters.map(letter => context.measureText(letter).width);
    const totalWidth =
      widths.reduce((sum, width) => sum + width, 0) + tracking * (letters.length - 1);

    let x = centerX - totalWidth / 2;

    letters.forEach((letter, index) => {
      context.fillText(letter, x, y);
      x += widths[index] + tracking;
    });

    context.restore();
  }

  drawLogo(context, currentTime, layout) {
    const centerX = this.scaler.canvasWidth / 2;
    const topY = layout.logoY;

    const neonLetters = [
      { letter: "N", color: NEON_COLORS.red },
      { letter: "E", color: NEON_COLORS.green },
      { letter: "O", color: NEON_COLORS.yellow },
      { letter: "N", color: NEON_COLORS.blue }
    ];

    const neonFontSize = this.scaler.x(54);
    const neonTracking = this.scaler.x(8);

    context.save();

    context.font =
      `400 ${neonFontSize}px Orbitron`;

    context.textBaseline = "middle";
    context.textAlign = "left";

    const widths =
      neonLetters.map(
        item =>
          context.measureText(item.letter).width
      );

    const totalWidth =
      widths.reduce(
        (sum, width) => sum + width,
        0
      ) +
      neonTracking *
      (neonLetters.length - 1);

    let x =
      centerX - totalWidth / 2;


    const drawNeonLetter = (
      letter,
      x,
      y,
      color
    ) => {
      context.save();

      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur =
        this.scaler.x(28);

      context.globalAlpha = 1;

      context.globalCompositeOperation =
        "lighter";

      context.fillText(
        letter,
        x,
        y
      );

      context.restore();
    };


    neonLetters.forEach(
      (item, index) => {
        drawNeonLetter(
          item.letter,
          x,
          topY,
          item.color
        );

        x +=
          widths[index] +
          neonTracking;
      }
    );

    context.restore();


    this.drawTrackedText(
      context,
      "SWIPE",
      centerX,
      topY + this.scaler.y(56),
      {
        fontSize: this.scaler.x(25),
        fontFamily: "Orbitron",
        fontWeight: 400,
        tracking: this.scaler.x(25),
        fillStyle:
          "rgba(245,248,255,0.96)",
        shadowColor:
          "rgba(255,255,255,0.42)",
        shadowBlur: this.scaler.x(10)
      }
    );
  }

  drawPlayButton(context, currentTime) {
    const target = this.hitTargets.play;

    const centerX = target.x + target.width / 2;
    const centerY = target.y + target.height / 2;

    const pulse =
      (Math.sin(currentTime / 350) + 1) / 2;

    const opacity =
      0.72 + pulse * 0.28;

    const scale =
      1 + pulse * 0.025;

    const glow =
      this.scaler.x(8 + pulse * 14);

    context.save();

    context.translate(centerX, centerY);
    context.scale(scale, scale);

    context.globalAlpha = opacity;

    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillStyle = "#f8fbff";

    //context.shadowColor = "rgba(255,255,255,0.95)";
    context.shadowBlur = glow;

    context.font =
      `800 ${this.scaler.x(26)}px Orbitron`;

    context.letterSpacing =
      `${this.scaler.x(6)}px`;

    context.fillText(
      "TAP TO PLAY",
      0,
      0
    );

    context.restore();
  }
  drawBestScore(context, bestScore, layout) {
    const centerX = this.scaler.canvasWidth / 2;
    context.save();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "rgba(127, 141, 163, 0.9)";
    context.font = `600 ${this.scaler.x(20)}px Orbitron`;
    context.letterSpacing = `${this.scaler.x(5)}px`;
    context.fillText("BEST", centerX, layout.bestLabelY);

    context.fillStyle = "rgba(248, 251, 255, 0.96)";
    context.shadowColor = "rgba(255, 255, 255, 0.55)";
    context.shadowBlur = this.scaler.x(10);
    context.font = `400 ${this.scaler.x(48)}px "Bebas Neue"`;
    context.letterSpacing = "0px";
    context.fillText(String(bestScore), centerX, layout.bestScoreY);
    context.restore();
  }

  drawDailyCard(context, data, currentTime) {
    const target = this.hitTargets.daily;

    // Fond noir
    context.save();

    context.fillStyle = "rgba(0, 4, 7, 0.94)";

    ShapeRenderer.roundRect(
      context,
      target.x,
      target.y,
      target.width,
      target.height,
      this.scaler.x(12)
    );

    context.fill();
    context.restore();


    // Contour 4 coins colorés
    const radius = this.scaler.x(12);
    const lineWidth = this.scaler.x(1.7);

    const left = target.x;
    const top = target.y;
    const right = target.x + target.width;
    const bottom = target.y + target.height;

    // HAUT : vert -> rouge
    let edgeGradient = context.createLinearGradient(
      left + radius,
      top,
      right - radius,
      top
    );

    edgeGradient.addColorStop(0, NEON_COLORS.green);
    edgeGradient.addColorStop(1, NEON_COLORS.red);

    context.save();
    context.strokeStyle = edgeGradient;
    context.lineWidth = lineWidth;
    context.shadowColor = "rgba(255,255,255,0.18)";
    context.shadowBlur = this.scaler.x(10);
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(left + radius, top);
    context.lineTo(right - radius, top);
    context.stroke();

    context.restore();


    // DROITE : rouge -> jaune
    edgeGradient = context.createLinearGradient(
      right,
      top + radius,
      right,
      bottom - radius
    );

    edgeGradient.addColorStop(0, NEON_COLORS.red);
    edgeGradient.addColorStop(1, NEON_COLORS.yellow);

    context.save();
    context.strokeStyle = edgeGradient;
    context.lineWidth = lineWidth;
    context.shadowColor = "rgba(255,255,255,0.18)";
    context.shadowBlur = this.scaler.x(10);
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(right, top + radius);
    context.lineTo(right, bottom - radius);
    context.stroke();

    context.restore();


    // BAS : bleu -> jaune
    edgeGradient = context.createLinearGradient(
      left + radius,
      bottom,
      right - radius,
      bottom
    );

    edgeGradient.addColorStop(0, NEON_COLORS.blue);
    edgeGradient.addColorStop(1, NEON_COLORS.yellow);

    context.save();
    context.strokeStyle = edgeGradient;
    context.lineWidth = lineWidth;
    context.shadowColor = "rgba(255,255,255,0.18)";
    context.shadowBlur = this.scaler.x(10);
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(left + radius, bottom);
    context.lineTo(right - radius, bottom);
    context.stroke();

    context.restore();


    // GAUCHE : vert -> bleu
    edgeGradient = context.createLinearGradient(
      left,
      top + radius,
      left,
      bottom - radius
    );

    edgeGradient.addColorStop(0, NEON_COLORS.green);
    edgeGradient.addColorStop(1, NEON_COLORS.blue);

    context.save();
    context.strokeStyle = edgeGradient;
    context.lineWidth = lineWidth;
    context.shadowColor = "rgba(255,255,255,0.18)";
    context.shadowBlur = this.scaler.x(10);
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(left, top + radius);
    context.lineTo(left, bottom - radius);
    context.stroke();

    context.restore();


    // COIN HAUT GAUCHE = vert
    context.save();
    context.strokeStyle = NEON_COLORS.green;
    context.lineWidth = lineWidth;
    context.shadowColor = NEON_COLORS.green;
    context.shadowBlur = this.scaler.x(10);

    context.beginPath();
    context.arc(
      left + radius,
      top + radius,
      radius,
      Math.PI,
      Math.PI * 1.5
    );
    context.stroke();

    context.restore();


    // COIN HAUT DROIT = rouge
    context.save();
    context.strokeStyle = NEON_COLORS.red;
    context.lineWidth = lineWidth;
    context.shadowColor = NEON_COLORS.red;
    context.shadowBlur = this.scaler.x(10);

    context.beginPath();
    context.arc(
      right - radius,
      top + radius,
      radius,
      Math.PI * 1.5,
      Math.PI * 2
    );
    context.stroke();

    context.restore();


    // COIN BAS DROIT = jaune
    context.save();
    context.strokeStyle = NEON_COLORS.yellow;
    context.lineWidth = lineWidth;
    context.shadowColor = NEON_COLORS.yellow;
    context.shadowBlur = this.scaler.x(10);

    context.beginPath();
    context.arc(
      right - radius,
      bottom - radius,
      radius,
      0,
      Math.PI * 0.5
    );
    context.stroke();

    context.restore();


    // COIN BAS GAUCHE = bleu
    context.save();
    context.strokeStyle = NEON_COLORS.blue;
    context.lineWidth = lineWidth;
    context.shadowColor = NEON_COLORS.blue;
    context.shadowBlur = this.scaler.x(10);

    context.beginPath();
    context.arc(
      left + radius,
      bottom - radius,
      radius,
      Math.PI * 0.5,
      Math.PI
    );
    context.stroke();

    context.restore();


    // DAILY CHALLENGE
    context.save();

    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillStyle = "rgba(248, 251, 255, 0.92)";
    context.shadowColor = "rgba(255,255,255,0.18)";
    context.shadowBlur = this.scaler.x(6);

    context.font =
      `600 ${this.scaler.x(20)}px Oxanium`;

    context.letterSpacing =
      `${this.scaler.x(3)}px`;

    context.fillText(
      "DAILY CHALLENGE",
      target.x + target.width / 2,
      target.y + target.height / 2
    );

    context.restore();


    // Shimmer blanc toutes les ~4 secondes
    const shimmerCycle = 3800;
    const shimmerDuration = 850;

    const shimmerTime =
      currentTime % shimmerCycle;

    if (shimmerTime < shimmerDuration) {
      const progress =
        shimmerTime / shimmerDuration;

      const shimmerX =
        target.x -
        this.scaler.x(55) +
        progress *
        (target.width + this.scaler.x(110));

      const shimmerWidth =
        this.scaler.x(52);

      const shimmerGradient =
        context.createLinearGradient(
          shimmerX - shimmerWidth,
          0,
          shimmerX + shimmerWidth,
          0
        );

      shimmerGradient.addColorStop(
        0,
        "rgba(255,255,255,0)"
      );

      shimmerGradient.addColorStop(
        0.38,
        "rgba(255,255,255,0.10)"
      );

      shimmerGradient.addColorStop(
        0.5,
        "rgba(255,255,255,0.95)"
      );

      shimmerGradient.addColorStop(
        0.62,
        "rgba(255,255,255,0.10)"
      );

      shimmerGradient.addColorStop(
        1,
        "rgba(255,255,255,0)"
      );

      context.save();

      context.strokeStyle =
        shimmerGradient;

      context.lineWidth =
        this.scaler.x(2.5);

      context.shadowColor =
        "rgba(255,255,255,0.75)";

      context.shadowBlur =
        this.scaler.x(12);

      ShapeRenderer.roundRect(
        context,
        target.x,
        target.y,
        target.width,
        target.height,
        this.scaler.x(12)
      );

      context.stroke();

      context.restore();
    }
  }
  // drawDailyCard(context, data, currentTime) {
  //   const target = this.hitTargets.daily;

  //   const cyan = "#35f4ff";

  //   // Fond noir + contour cyan
  //   context.save();

  //   context.fillStyle = "rgba(0, 5, 8, 0.92)";
  //   context.strokeStyle = cyan;
  //   context.shadowColor = cyan;
  //   context.shadowBlur = this.scaler.x(14);
  //   context.lineWidth = this.scaler.x(1.5);

  //   ShapeRenderer.roundRect(
  //     context,
  //     target.x,
  //     target.y,
  //     target.width,
  //     target.height,
  //     this.scaler.x(12)
  //   );

  //   context.fill();
  //   context.stroke();

  //   context.restore();


  //   // DAILY CHALLENGE
  //   context.save();

  //   context.textAlign = "center";
  //   context.textBaseline = "middle";

  //   context.fillStyle = "rgba(53, 244, 255, 0.78)";
  //   context.shadowColor = "rgba(53, 244, 255, 0.35)";
  //   context.shadowBlur = this.scaler.x(7);

  //   context.font =
  //     `400 ${this.scaler.x(16)}px Orbitron`;

  //   context.letterSpacing =
  //     `${this.scaler.x(4)}px`;

  //   context.fillText(
  //     "DAILY CHALLENGE",
  //     target.x + target.width / 2,
  //     target.y + this.scaler.y(42)
  //   );

  //   context.restore();


  //   // 30 IN A ROW
  //   context.save();

  //   context.textAlign = "center";
  //   context.textBaseline = "middle";

  //   context.fillStyle = "#ffffff";
  //   context.shadowColor = "rgba(255,255,255,0.72)";
  //   context.shadowBlur = this.scaler.x(13);

  //   context.font =
  //     `400 ${this.scaler.x(34)}px Orbitron`;

  //   context.letterSpacing =
  //     `${this.scaler.x(5)}px`;

  //   context.fillText(
  //     "30 IN A ROW",
  //     target.x + target.width / 2,
  //     target.y + this.scaler.y(96)
  //   );

  //   context.restore();


  //   // Vies / attempts
  //   const dotY =
  //     target.y + this.scaler.y(145);

  //   const dotStartX =
  //     target.x + this.scaler.x(75);

  //   const dotSpacing =
  //     this.scaler.x(28);

  //   const dotRadius =
  //     this.scaler.x(6);

  //   for (
  //     let index = 0;
  //     index < data.dailyMaxAttempts;
  //     index += 1
  //   ) {
  //     const isAvailable =
  //       index < data.dailyAttemptsLeft;

  //     context.save();

  //     if (isAvailable) {
  //       context.fillStyle = cyan;
  //       context.shadowColor = cyan;
  //       context.shadowBlur = this.scaler.x(11);
  //     } else {
  //       context.fillStyle = "rgba(53,244,255,0.12)";
  //       context.strokeStyle = "rgba(53,244,255,0.42)";
  //       context.lineWidth = this.scaler.x(1.5);
  //       context.shadowColor = "transparent";
  //     }

  //     context.beginPath();

  //     context.arc(
  //       dotStartX + index * dotSpacing,
  //       dotY,
  //       dotRadius,
  //       0,
  //       Math.PI * 2
  //     );

  //     if (isAvailable) {
  //       context.fill();
  //     } else {
  //       context.fill();
  //       context.stroke();
  //     }

  //     context.restore();
  //   }


  //   // 4 ATTEMPTS
  //   context.save();

  //   context.textAlign = "left";
  //   context.textBaseline = "middle";

  //   context.fillStyle = cyan;
  //   context.shadowColor = "rgba(53,244,255,0.38)";
  //   context.shadowBlur = this.scaler.x(7);

  //   context.font =
  //     `400 ${this.scaler.x(15)}px Orbitron`;

  //   context.letterSpacing =
  //     `${this.scaler.x(2.5)}px`;

  //   context.fillText(
  //     `${data.dailyAttemptsLeft} ATTEMPTS`,
  //     target.x + this.scaler.x(220),
  //     dotY
  //   );

  //   context.restore();

  //   // Shimmer du contour toutes les ~4 secondes
  //   const shimmerCycle = 3800;
  //   const shimmerDuration = 850;

  //   const shimmerTime =
  //     currentTime % shimmerCycle;

  //   if (shimmerTime < shimmerDuration) {
  //     const progress =
  //       shimmerTime / shimmerDuration;

  //     const shimmerX =
  //       target.x -
  //       this.scaler.x(50) +
  //       progress *
  //       (target.width + this.scaler.x(100));

  //     const shimmerWidth =
  //       this.scaler.x(55);

  //     const gradient =
  //       context.createLinearGradient(
  //         shimmerX - shimmerWidth,
  //         0,
  //         shimmerX + shimmerWidth,
  //         0
  //       );

  //     gradient.addColorStop(
  //       0,
  //       "rgba(255,255,255,0)"
  //     );

  //     gradient.addColorStop(
  //       0.32,
  //       "rgba(53,244,255,0.15)"
  //     );

  //     gradient.addColorStop(
  //       0.5,
  //       "rgba(255,255,255,1)"
  //     );

  //     gradient.addColorStop(
  //       0.68,
  //       "rgba(53,244,255,0.15)"
  //     );

  //     gradient.addColorStop(
  //       1,
  //       "rgba(255,255,255,0)"
  //     );

  //     context.save();

  //     context.strokeStyle = gradient;
  //     context.lineWidth =
  //       this.scaler.x(2.5);

  //     context.shadowColor =
  //       "#35f4ff";

  //     context.shadowBlur =
  //       this.scaler.x(14);

  //     ShapeRenderer.roundRect(
  //       context,
  //       target.x,
  //       target.y,
  //       target.width,
  //       target.height,
  //       this.scaler.x(12)
  //     );

  //     context.stroke();

  //     context.restore();
  //   }
  // }

  drawSecondaryButtons(context) {
    this.drawSecondaryButton(context, this.hitTargets.badges, "BADGES", "diamond", NEON_COLORS.blue);
    this.drawSecondaryButton(context, this.hitTargets.skins, "SKINS", "circle", NEON_COLORS.yellow);
  }

  drawSecondaryButton(context, target, label, shapeName, color) {
    this.drawThinPanel(context, target, "rgba(238, 244, 255, 0.22)", "rgba(238, 244, 255, 0.05)");

    const iconX = target.x + this.scaler.x(34);
    const iconY = target.y + target.height / 2;
    const iconSize = this.scaler.x(18);

    if (shapeName === "badge") {
      this.drawBadgeIcon(context, iconX, iconY, iconSize);
    } else if (shapeName === "skin") {
      this.drawSkinIcon(context, iconX, iconY, iconSize);
    }

    context.save();
    context.fillStyle = "rgba(238, 244, 255, 0.78)";
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.font = `600 ${this.scaler.x(13)}px Oxanium`;
    context.letterSpacing = `${this.scaler.x(2)}px`;
    context.fillText(label, target.x + this.scaler.x(52), target.y + target.height / 2);
    context.restore();
  }

  drawThinPanel(context, rect, strokeColor, fillColor) {
    context.save();
    context.fillStyle = fillColor;
    context.strokeStyle = strokeColor;
    context.shadowColor = strokeColor;
    context.shadowBlur = this.scaler.x(12);
    context.lineWidth = this.scaler.x(1.2);
    ShapeRenderer.roundRect(context, rect.x, rect.y, rect.width, rect.height, this.scaler.x(8));
    context.fill();
    context.stroke();
    context.restore();
  }

}

class GameOverScreen {
  constructor(scaler) {
    this.scaler = scaler;
    this.hitTargets = {};
  }

  draw(context, data, currentTime) {
    this.hitTargets = this.getLayout();

    const progress =
      data.transitionProgress ?? 1;

    const eased =
      1 - Math.pow(1 - progress, 3);

    this.drawOverlay(context, eased);


    // GAME OVER
    const titleProgress = clamp(
      progress / 0.45,
      0,
      1
    );

    if (titleProgress > 0) {
      context.save();

      context.globalAlpha =
        titleProgress;

      context.translate(
        0,
        this.scaler.y(
          12 * (1 - titleProgress)
        )
      );

      this.drawTitle(context, this.hitTargets);

      context.restore();
    }


    // SCORE
    const scoreProgress = clamp(
      (progress - 0.18) / 0.55,
      0,
      1
    );

    if (scoreProgress > 0) {
      context.save();

      context.globalAlpha =
        scoreProgress;

      context.translate(
        0,
        this.scaler.y(
          10 * (1 - scoreProgress)
        )
      );

      this.drawScore(
        context,
        data.score,
        this.hitTargets
      );

      context.restore();
    }


    // BEST
    const bestProgress = clamp(
      (progress - 0.38) / 0.45,
      0,
      1
    );

    if (bestProgress > 0) {
      context.save();

      context.globalAlpha =
        bestProgress;

      context.translate(
        0,
        this.scaler.y(
          8 * (1 - bestProgress)
        )
      );

      this.drawBest(
        context,
        data,
        currentTime,
        this.hitTargets
      );

      context.restore();
    }


    // HOME
    const homeProgress = clamp(
      (progress - 0.35) / 0.45,
      0,
      1
    );

    if (homeProgress > 0) {
      context.save();
      context.globalAlpha = homeProgress;

      this.drawHomeButton(context);

      context.restore();
    }


    // TAP TO RESTART
    const restartProgress = clamp(
      (progress - 0.60) / 0.40,
      0,
      1
    );

    if (restartProgress > 0) {
      context.save();

      context.globalAlpha =
        restartProgress;

      this.drawRestartHint(
        context,
        currentTime,
        this.hitTargets
      );

      context.restore();
    }
  }

  getLayout() {
    const extraHeight = this.getResponsiveExtraHeight();
    const groupOffsetY = extraHeight * 0.35;
    const restartOffsetY = extraHeight * 0.7;

    return {
      home: {
        x: this.scaler.x(22),
        y: this.scaler.y(34),
        width: this.scaler.x(58),
        height: this.scaler.y(58)
      },
      titleY: this.scaler.y(315 + groupOffsetY),
      scoreLabelY: this.scaler.y(375 + groupOffsetY),
      scoreNumberY: this.scaler.y(455 + groupOffsetY),
      bestLabelY: this.scaler.y(565 + groupOffsetY),
      bestNumberY: this.scaler.y(615 + groupOffsetY),
      restartY: this.scaler.y(735 + restartOffsetY)
    };
  }

  getResponsiveExtraHeight() {
    return Math.max(this.scaler.designHeight - this.scaler.baseDesignHeight, 0);
  }

  getHitTarget(point) {
    const homeTarget = this.hitTargets.home || this.getLayout().home;

    if (this.isPointInRect(point, homeTarget)) {
      return "home";
    }

    return null;
  }

  isPointInRect(point, rect) {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  drawOverlay(context, progress = 1) {
    context.save();

    const opacity =
      0.56 * progress;

    context.fillStyle =
      `rgba(0, 0, 0, ${opacity})`;

    context.fillRect(
      0,
      0,
      this.scaler.canvasWidth,
      this.scaler.canvasHeight
    );

    context.restore();
  }

  drawHomeButton(context) {
    const target = this.hitTargets.home;
    const centerX = target.x + target.width / 2;
    const centerY = target.y + target.height / 2;
    const iconSize = this.scaler.x(22);

    context.save();
    context.strokeStyle = "rgba(238, 244, 255, 0.72)";
    context.shadowColor = "rgba(255, 255, 255, 0.28)";
    context.shadowBlur = this.scaler.x(8);
    context.lineWidth = this.scaler.x(2.1);
    context.lineCap = "round";
    context.lineJoin = "round";

    context.beginPath();
    context.moveTo(centerX - iconSize * 0.62, centerY - iconSize * 0.06);
    context.lineTo(centerX, centerY - iconSize * 0.62);
    context.lineTo(centerX + iconSize * 0.62, centerY - iconSize * 0.06);
    context.moveTo(centerX - iconSize * 0.42, centerY - iconSize * 0.02);
    context.lineTo(centerX - iconSize * 0.42, centerY + iconSize * 0.55);
    context.lineTo(centerX + iconSize * 0.42, centerY + iconSize * 0.55);
    context.lineTo(centerX + iconSize * 0.42, centerY - iconSize * 0.02);
    context.stroke();

    context.restore();
  }

  drawTitle(context, layout) {
    context.save();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "rgba(245, 248, 255, 0.96)";
    context.shadowColor = "rgba(255, 255, 255, 0.38)";
    context.shadowBlur = this.scaler.x(12);
    context.font = `800 ${this.scaler.x(40)}px Orbitron`;
    context.letterSpacing = `${this.scaler.x(8)}px`;
    context.fillText("GAME OVER", this.scaler.canvasWidth / 2, layout.titleY);
    context.restore();
  }

  drawScore(context, score, layout) {
    const centerX = this.scaler.canvasWidth / 2;

    context.save();
    context.textAlign = "center";
    context.textBaseline = "middle";


    // SCORE label
    context.fillStyle = "rgba(127, 141, 163, 0.92)";
    context.shadowColor = "transparent";
    context.shadowBlur = 0;

    context.font =
      `600 ${this.scaler.x(18)}px Oxanium`;

    context.letterSpacing =
      `${this.scaler.x(5)}px`;

    context.fillText(
      "SCORE",
      centerX,
      layout.scoreLabelY
    );


    // Score principal
    context.fillStyle = "#ffffff";

    context.shadowColor =
      "rgba(255,255,255,0.65)";

    context.shadowBlur =
      this.scaler.x(18);

    context.font =
      `400 ${this.scaler.x(100)}px "Bebas Neue"`;

    context.letterSpacing = "0px";

    context.fillText(
      String(score),
      centerX,
      layout.scoreNumberY
    );

    context.restore();
  }

  drawBest(context, data, currentTime, layout) {
    const centerX =
      this.scaler.canvasWidth / 2;

    const pulse =
      (Math.sin(currentTime / 320) + 1) / 2;

    const wasNewBest =
      Boolean(data.wasNewBest);

    context.save();
    context.textAlign = "center";
    context.textBaseline = "middle";


    // BEST / NEW BEST label
    context.fillStyle = wasNewBest
      ? "#ffffff"
      : "rgba(127, 141, 163, 0.9)";

    context.shadowColor = wasNewBest
      ? "rgba(255,255,255,0.8)"
      : "transparent";

    context.shadowBlur = wasNewBest
      ? this.scaler.x(8 + pulse * 8)
      : 0;

    context.font =
      `600 ${this.scaler.x(17)}px Oxanium`;

    context.letterSpacing =
      `${this.scaler.x(5)}px`;

    context.fillText(
      wasNewBest ? "NEW BEST" : "BEST",
      centerX,
      layout.bestLabelY
    );


    // Best number
    context.fillStyle =
      "rgba(248,251,255,0.96)";

    context.shadowColor = wasNewBest
      ? "rgba(255,255,255,0.7)"
      : "rgba(255,255,255,0.25)";

    context.shadowBlur = wasNewBest
      ? this.scaler.x(12 + pulse * 5)
      : this.scaler.x(6);

    context.font =
      `400 ${this.scaler.x(54)}px "Bebas Neue"`;

    context.letterSpacing = "0px";

    context.fillText(
      String(data.bestScore),
      centerX,
      layout.bestNumberY
    );

    context.restore();
  }

  drawRestartHint(context, currentTime, layout) {
    const pulse = (Math.sin(currentTime / 420) + 1) / 2;

    context.save();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.globalAlpha = 0.62 + pulse * 0.26;
    context.fillStyle = "rgba(245, 248, 255, 0.95)";
    context.shadowColor = "rgba(255, 255, 255, 0.44)";
    context.shadowBlur = this.scaler.x(8 + pulse * 8);
    context.font = `600 ${this.scaler.x(20)}px Oxanium`;
    context.letterSpacing = `${this.scaler.x(5)}px`;
    context.fillText("TAP TO RESTART", this.scaler.canvasWidth / 2, layout.restartY);
    context.restore();
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

    if (this.game.isWaitingToStart()) {
      this.game.handleHomeTap(this.getCanvasPoint(event));
      return;
    }

    if (this.game.state === "ended") {
      this.game.handleGameOverTap(this.getCanvasPoint(event));
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
    this.scaler = new GeometryScaler(
      GAME_CONFIG.designWidth,
      GAME_CONFIG.designHeight,
      GAME_CONFIG.maxResponsiveDesignHeight
    );
    this.arena = new Arena(this.scaler, RECEIVER_DEFINITIONS);
    this.homeScreen = new HomeScreen(this.scaler);
    this.gameOverScreen = new GameOverScreen(this.scaler);
    this.rules = new GameRules(this.arena);
    this.dynamicRuleSequence = new DynamicRuleSequenceController();
    this.receiverEffects = new ReceiverEffectsController();
    this.modifierIntro = new ModifierIntroController(
      this.receiverEffects
    );
    this.blinkController = new BlinkController({
      visibleDurationMs: GAME_CONFIG.blinkVisibleDurationMs,
      neutralDurationMs: GAME_CONFIG.blinkNeutralDurationMs
    });
    this.pulseController = new PulseController({
      cycleDurationMs: GAME_CONFIG.pulseCycleDurationMs,
      minLengthMultiplier: GAME_CONFIG.pulseMinLengthMultiplier
    });
    this.waveController = new WaveController({
      cycleDurationMs: GAME_CONFIG.waveCycleDurationMs,
      minLengthMultiplier: GAME_CONFIG.waveMinLengthMultiplier
    });
    this.spawnController = new SpawnController(this);
    this.challengeManager = new ChallengeManager();
    this.throwController = new ThrowController({
      scaler: this.scaler,
      arena: this.arena,
      getActiveShape: () => this.activeShape
    });
    this.particleSystem = new ParticleSystem(this.scaler);
    this.stateController = new GameStateController("ready");
    this.inputController = new InputController(this.canvas, this);

    this.score = 0;
    this.runReceiverColorsByPositionId = { ...DEFAULT_COLOR_LAYOUT };
    this.runReceiverShapesByPositionId = { ...DEFAULT_SHAPE_LAYOUT };
    this.lastAnimationTime = 0;
    this.centerMessage = "SWIPE";
    this.centerMessageUntil = 0;
    this.previousBestScore = HOME_UI_DATA.bestScore;
    this.gameOverWasNewBest = false;
    this.gameOverStartedAt = 0;
    this.activeShapeRuleName = null;
    this.pendingModifierIntro = null;
    this.deferredNextChallengeBoundaryPhase = null;
    this.movingReceiverOffset = 0;
  }

  start() {
    this.resize();
    this.showWaitingScreen();
    requestAnimationFrame((time) => this.gameLoop(time));

    this.restartButton.addEventListener("click", () => this.reset());
    window.addEventListener("resize", () => this.resize());
    window.visualViewport?.addEventListener?.("resize", () => this.resize());
  }

  resize() {
    const viewportSize = this.getViewportSize();
    const canvasSize = this.scaler.getCssSizeForViewport(
      viewportSize.width,
      viewportSize.height,
      GAME_CONFIG.maxCanvasCssWidth
    );

    this.canvas.style.width = `${canvasSize.width}px`;
    this.canvas.style.height = `${canvasSize.height}px`;

    const pixelRatio = this.scaler.updateFromCanvas(this.canvas);
    this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  getViewportSize() {
    return {
      width: window.visualViewport?.width ?? window.innerWidth,
      height: window.visualViewport?.height ?? window.innerHeight
    };
  }

  createRandomRunReceiverLayouts() {
    this.runReceiverColorsByPositionId = createRandomReceiverLayout(AVAILABLE_COLOR_IDS);
    this.runReceiverShapesByPositionId = createRandomReceiverLayout(AVAILABLE_SHAPES);
  }

  reset() {
    this.clearAllPendingSpawnTimeouts();
    this.receiverEffects.reset();
    this.dynamicRuleSequence.reset();
    this.blinkController.reset();
    this.pulseController.reset();
    this.waveController.reset();
    // TEMP TEST BLINK LEVEL 14 - restore to 0 after validation
    this.score = 0;
    this.createRandomRunReceiverLayouts();
    this.state = "playing";
    this.resetRuntimeState();
    this.movingReceiverOffset = 0;
    this.receiverEffects.syncPermutationToPhase(this.currentPhase);
    this.receiverEffects.syncRotationsToPhase(
      this.currentPhase,
      this.activeModifiers.permutation
    );
    this.clearCurrentChallenge();
    this.activeShapeRuleName = null;
    this.pendingModifierIntro = null;
    this.deferredNextChallengeBoundaryPhase = null;
    this.particleSystem.clear();
    this.previousBestScore = HOME_UI_DATA.bestScore;
    this.gameOverWasNewBest = false;
    this.gameOverStartedAt = 0;
    this.showCenterMessage("COLOR", 1100);

    this.spawnNextChallenge();
  }

  showWaitingScreen() {
    this.clearAllPendingSpawnTimeouts();
    this.receiverEffects.reset();
    this.dynamicRuleSequence.reset();
    this.blinkController.reset();
    this.pulseController.reset();
    this.waveController.reset();
    this.score = 0;
    this.runReceiverColorsByPositionId = { ...DEFAULT_COLOR_LAYOUT };
    this.runReceiverShapesByPositionId = { ...DEFAULT_SHAPE_LAYOUT };
    this.state = "waiting";
    this.resetRuntimeState();
    this.movingReceiverOffset = 0;
    this.clearCurrentChallenge();
    this.activeShapeRuleName = null;
    this.pendingModifierIntro = null;
    this.deferredNextChallengeBoundaryPhase = null;
    this.particleSystem.clear();
    this.previousBestScore = HOME_UI_DATA.bestScore;
    this.gameOverWasNewBest = false;
    this.gameOverStartedAt = 0;
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
      this.updateMovingReceiverTracks(deltaSeconds);
      this.updateActiveShape(deltaSeconds);
    } else if (this.isShowingModifierIntro) {
      this.updateModifierIntro(currentTime);
    } else {
      this.updateReceiverRotations(currentTime);
    }

    this.particleSystem.update(deltaSeconds);
    this.draw(currentTime);
    requestAnimationFrame((nextTime) => this.gameLoop(nextTime));
  }

  updateActiveShape(deltaSeconds) {
    if (this.activeChallengeUsesMultipleShapes) {
      this.updateMultiShapes(deltaSeconds);
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

      const touchedReceiver = this.arena.findReceiverHitByShape(
        shape,
        this.getCollisionPhaseForShape(shape),
        this.getModifierVisualState(performance.now())
      );
      if (touchedReceiver) {
        this.resolveReceiverTouch(shape, touchedReceiver);
        return;
      }

      if (shape.isBelowScreen(this.scaler.canvasHeight, this.scaler.y(28))) {
        if (shape.isVoid && !shape.hasBeenThrown) {
          this.resolveIgnoredVoidShape(shape);
          return;
        }

        this.endGame("GAME OVER");
        return;
      }
    }
  }

  spawnNextChallenge() {
    if (this.activeModifiers.multiShapeCount > 1) {
      this.spawnMultiShapes(
        this.activeModifiers.multiShapeCount
      );
      return;
    }

    if (this.shouldUseBurstModifierForCurrentChallenge()) {
      this.spawnBurstShapes();
      return;
    }

    if (this.shouldUseTwinModifierForCurrentChallenge()) {
      this.spawnTwinShapes();
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
    const fallingShape = this.createConfiguredShapeFromSpawn(
      spawn,
      this.currentChallengePhase
    );
    const previousActiveShapeRuleName = this.activeShapeRuleName;

    this.challengeManager.setSingleShape(fallingShape, fallingShape.challengePhase);
    this.updateVisibleRuleForActiveShape(
      fallingShape.challengePhase.ruleName,
      previousActiveShapeRuleName
    );
  }

  createConfiguredShapeFromSpawn(spawn, challengePhase) {
    const challengePhaseSnapshot = this.createPhaseSnapshot(challengePhase);
    const validationPhaseSnapshot = this.createPhaseSnapshot(
      this.getPhaseWithCurrentWallColors(challengePhase)
    );
    const fallingShape = this.createShapeFromSpawn(spawn);

    fallingShape.spawnEntryMode = spawn.entryMode || "bottom";
    fallingShape.spawnPhysicalSide = spawn.physicalSide || null;

    this.applyVoidModifierToShape(fallingShape, challengePhaseSnapshot);
    this.applyRevealModifierToShape(fallingShape, challengePhaseSnapshot);
    fallingShape.challengePhase = challengePhaseSnapshot;
    fallingShape.validationPhase = validationPhaseSnapshot;
    fallingShape.gravity = this.scaler.x(ChallengePhysics.getGravity(
      challengePhaseSnapshot,
      fallingShape.spawnEntryMode
    ));
    fallingShape.advancedSpawnState = "none";

    return fallingShape;
  }

  shouldUseBurstModifierForCurrentChallenge() {
    return Boolean(
      this.activeModifiers.burst &&
      this.activeModifiers.multiShapeCount === 1
    );
  }

  shouldUseTwinModifierForCurrentChallenge() {
    return Boolean(
      this.activeModifiers.twin &&
      !this.activeModifiers.burst &&
      this.activeModifiers.multiShapeCount === 1 &&
      !this.activeModifiers.randomSpawn &&
      this.activeModifiers.spawn === "bottom"
    );
  }

  shouldApplyRevealModifierToShape(challengePhase, fallingShape) {
    const challengeModifiers = this.getChallengeModifiers(challengePhase);

    return Boolean(
      challengeModifiers.reveal &&
      fallingShape.spawnEntryMode === "bottom" &&
      fallingShape.velocityY < GAME_CONFIG.revealApexVelocityThreshold
    );
  }

  spawnBurstShapes() {
    this.currentChallengePhase = this.currentPhase;
    const previousActiveShapeRuleName = this.activeShapeRuleName;
    const firstShape = this.createConfiguredShapeFromSpawn(
      this.getSingleShapeSpawn(this.currentChallengePhase),
      this.currentChallengePhase
    );
    firstShape.isBurstShape = true;

    this.challengeManager.startBurstChallenge(
      firstShape,
      firstShape.challengePhase,
      GAME_CONFIG.burstShapeCount
    );
    this.updateVisibleRuleForActiveShape(
      firstShape.challengePhase.ruleName,
      previousActiveShapeRuleName
    );

    this.scheduleBurstShapeSpawn(1, GAME_CONFIG.burstSecondShapeDelayMs);
    this.scheduleBurstShapeSpawn(2, GAME_CONFIG.burstThirdShapeDelayMs);
  }

  spawnTwinShapes() {
    this.currentChallengePhase = this.currentPhase;
    const previousActiveShapeRuleName = this.activeShapeRuleName;
    const leftShape = this.createConfiguredShapeFromSpawn(
      this.getTwinShapeSpawn("left"),
      this.currentChallengePhase
    );
    const rightShape = this.createConfiguredShapeFromSpawn(
      this.getTwinShapeSpawn("right"),
      this.currentChallengePhase
    );

    leftShape.isTwinShape = true;
    rightShape.isTwinShape = true;
    rightShape.state = "inactive";

    this.challengeManager.startTwinChallenge(
      leftShape,
      rightShape,
      leftShape.challengePhase
    );
    this.updateVisibleRuleForActiveShape(
      leftShape.challengePhase.ruleName,
      previousActiveShapeRuleName
    );
  }

  getTwinShapeSpawn(side) {
    const spawn = this.getSingleShapeSpawn(this.currentChallengePhase);
    const centerX = this.scaler.x(GAME_CONFIG.designWidth / 2);
    const horizontalOffset = this.scaler.x(GAME_CONFIG.twinHorizontalOffset);

    return {
      ...spawn,
      x: side === "left"
        ? centerX - horizontalOffset
        : centerX + horizontalOffset
    };
  }

  scheduleBurstShapeSpawn(burstShapeIndex, delayMs) {
    const burstChallengePhase = this.currentChallengePhase;
    const timeoutId = window.setTimeout(() => {
      this.challengeManager.removeBurstShapeTimeout(timeoutId);

      if (this.state !== "playing") return;
      if (!this.challengeManager.isBurstChallengeActive()) return;
      if (this.currentChallengePhase !== burstChallengePhase) return;

      const fallingShape = this.createConfiguredShapeFromSpawn(
        this.getSingleShapeSpawn(burstChallengePhase),
        burstChallengePhase
      );
      fallingShape.isBurstShape = true;
      fallingShape.state = "inactive";
      this.challengeManager.appendBurstShape(fallingShape, burstShapeIndex);
    }, delayMs);

    this.challengeManager.setBurstShapeTimeout(timeoutId);
  }

  applyVoidModifierToShape(fallingShape, challengePhase) {
    const challengeModifiers = this.getChallengeModifiers(challengePhase);

    fallingShape.isVoid = false;

    if (!challengeModifiers.void) return;
    if (Math.random() >= GAME_CONFIG.voidSpawnChance) return;

    fallingShape.isVoid = true;

    if (challengePhase.ruleName === "SHAPE") {
      fallingShape.shapeName = getRandomItem(VOID_SHAPES);
      fallingShape.colorId = getRandomItem(AVAILABLE_COLOR_IDS);
      return;
    }

    fallingShape.shapeName = getRandomItem(AVAILABLE_SHAPES);
    fallingShape.colorId = getRandomItem(VOID_COLOR_IDS);
  }

  applyRevealModifierToShape(fallingShape, challengePhase) {
    if (!this.shouldApplyRevealModifierToShape(challengePhase, fallingShape)) return;

    fallingShape.enableReveal(performance.now());
  }

  getChallengeModifiers(challengePhase) {
    return challengePhase?.modifierSnapshot || this.activeModifiers;
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

  getCurrentSpawnMode() {
    if (this.activeModifiers.randomSpawn) {
      return getRandomItem(SPAWN_MODES);
    }

    return SPAWN_MODES.includes(this.activeModifiers.spawn)
      ? this.activeModifiers.spawn
      : "bottom";
  }

  createPhaseSnapshot(phase) {
    if (!phase) return null;

    return {
      ...phase,
      modifierSnapshot: phase.modifierSnapshot
        ? { ...phase.modifierSnapshot }
        : undefined,
      receiverColorsByPositionId: { ...phase.receiverColorsByPositionId },
      receiverShapesByPositionId: { ...phase.receiverShapesByPositionId }
    };
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

  spawnMultiShapes(shapeCount) {
    this.clearPendingMultiShapeSpawn();
    const clampedShapeCount = clamp(Math.round(shapeCount), 2, 4);
    this.currentChallengePhase = this.createPhaseSnapshot(this.currentPhase);
    this.currentChallengePhase.multiShapeCount = clampedShapeCount;
    this.currentChallengePhase.modifierSnapshot = { ...this.activeModifiers };

    const previousActiveShapeRuleName = this.activeShapeRuleName;
    const spawnXPositions = this.createMultiShapeSpawnXPositions(clampedShapeCount);

    spawnXPositions.forEach((spawnX, shapeIndex) => {
      const spawnDelayMs = shapeIndex * GAME_CONFIG.multiShapeSpawnDelayMs;

      if (spawnDelayMs === 0) {
        const firstShape = this.createMultiShapeFromSpawnX(spawnX, shapeIndex);
        this.challengeManager.startMultiShapeChallenge(
          firstShape,
          firstShape.challengePhase,
          clampedShapeCount
        );
        this.updateVisibleRuleForActiveShape(
          firstShape.challengePhase.ruleName,
          previousActiveShapeRuleName
        );
        return;
      }

      this.scheduleMultiShapeSpawn(shapeIndex, spawnX, spawnDelayMs);
    });
  }

  scheduleMultiShapeSpawn(shapeIndex, preferredSpawnX, delayMs) {
    const multiShapeChallengePhase = this.currentChallengePhase;
    const timeoutId = window.setTimeout(() => {
      this.challengeManager.removeMultiShapeTimeout(timeoutId);

      if (this.state !== "playing") return;
      if (!this.challengeManager.isMultiShapeChallengeActive()) return;
      if (this.currentChallengePhase !== multiShapeChallengePhase) return;

      const fallingShape = this.createMultiShapeFromSpawnX(
        preferredSpawnX,
        shapeIndex
      );
      this.challengeManager.appendMultiShape(fallingShape, shapeIndex);
    }, delayMs);

    this.challengeManager.setMultiShapeTimeout(timeoutId);
  }

  createMultiShapeFromSpawnX(preferredSpawnX, shapeIndex) {
    const spawn = this.createMultiShapeSpawn(preferredSpawnX);
    const fallingShape = this.createConfiguredShapeFromSpawn(
      spawn,
      this.currentChallengePhase
    );

    fallingShape.isMultiShape = true;
    fallingShape.multiShapeIndex = shapeIndex;
    fallingShape.gravity *= GAME_CONFIG.multiShapeGravityMultiplier;
    return fallingShape;
  }

  createMultiShapeSpawn(preferredSpawnX) {
    const spawnX = this.activeModifiers.slide
      ? this.getSafeMultiShapeSlideSpawnX(preferredSpawnX)
      : preferredSpawnX;

    return {
      x: spawnX,
      y: this.scaler.y(this.scaler.designHeight + 38),
      velocityX: this.getMultiShapeHorizontalVelocity(spawnX),
      velocityY: this.scaler.y(this.currentChallengeSpawnImpulse),
      entryMode: "bottom"
    };
  }

  getSafeMultiShapeSlideSpawnX(preferredSpawnX) {
    const modifierVisualState = this.getModifierVisualState(performance.now());
    const spawnOptions = this.arena.getMovingBottomGapSpawnOptions(
      this.currentChallengePhase,
      modifierVisualState
    );

    if (!spawnOptions.length) return preferredSpawnX;

    return spawnOptions.reduce((closestSpawnX, spawnOption) => {
      const currentDistance = Math.abs(spawnOption.spawnX - preferredSpawnX);
      const closestDistance = Math.abs(closestSpawnX - preferredSpawnX);
      return currentDistance < closestDistance
        ? spawnOption.spawnX
        : closestSpawnX;
    }, spawnOptions[0].spawnX);
  }

  createMultiShapeSpawnXPositions(shapeCount) {
    const safeMargin = this.scaler.x(
      GAME_CONFIG.shapeRadius +
      GAME_CONFIG.movingBottomSpawnSafetyMargin
    );
    const minX = safeMargin;
    const maxX = this.scaler.x(GAME_CONFIG.designWidth) - safeMargin;
    const spacing = this.scaler.x(GAME_CONFIG.multiShapeMinHorizontalSpacing);
    const availableWidth = Math.max(maxX - minX, spacing * (shapeCount - 1));
    const slotWidth = availableWidth / shapeCount;

    const positions = Array.from({ length: shapeCount }, (_, index) => {
      const slotStart = minX + index * slotWidth;
      const slotEnd = index === shapeCount - 1
        ? maxX
        : Math.min(maxX, slotStart + slotWidth);
      const jitterInset = Math.min(slotWidth * 0.24, spacing * 0.35);
      const randomMin = Math.min(slotEnd, slotStart + jitterInset);
      const randomMax = Math.max(randomMin, slotEnd - jitterInset);
      return randomMin + Math.random() * (randomMax - randomMin || 1);
    });

    for (let index = 1; index < positions.length; index += 1) {
      if (positions[index] - positions[index - 1] < spacing) {
        positions[index] = Math.min(maxX, positions[index - 1] + spacing);
      }
    }

    return this.shuffleMultiShapeSpawnOrder(positions);
  }

  shuffleMultiShapeSpawnOrder(positions) {
    const shuffledPositions = [...positions];

    for (let index = shuffledPositions.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffledPositions[index], shuffledPositions[randomIndex]] = [
        shuffledPositions[randomIndex],
        shuffledPositions[index]
      ];
    }

    return shuffledPositions;
  }

  getMultiShapeHorizontalVelocity(spawnX) {
    const centerX = this.scaler.x(GAME_CONFIG.designWidth / 2);
    const centerZoneHalfWidth = this.scaler.x(
      GAME_CONFIG.movingBottomSpawnCenterZoneWidth / 2
    );
    const impulse = this.scaler.x(GAME_CONFIG.multiShapeHorizontalImpulse);

    if (spawnX < centerX - centerZoneHalfWidth) return impulse;
    if (spawnX > centerX + centerZoneHalfWidth) return -impulse;

    return (Math.random() < 0.5 ? -1 : 1) * impulse * 0.35;
  }

  getCollisionPhaseForShape(shape) {
    return shape.challengePhase || this.currentChallengePhase || this.currentPhase;
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
      this.usesReceiverRotation() ||
      this.usesReceiverPermutation()
    );
  }

  resolveIgnoredVoidShape(resolvedShape) {
    resolvedShape.state = "resolved";

    if (this.challengeManager.isActiveBurstShape(resolvedShape)) {
      this.advanceBurstSequenceAfterResolvedActiveShape(
        resolvedShape,
        false
      );
      return;
    }

    if (this.challengeManager.isActiveTwinShape(resolvedShape)) {
      this.advanceTwinSequenceAfterResolvedActiveShape(
        resolvedShape,
        false
      );
      return;
    }

    if (this.challengeManager.isTwinShape(resolvedShape)) {
      return;
    }

    if (this.challengeManager.isMultiShapeShape(resolvedShape)) {
      this.finishMultiShapeIfResolved(
        false,
        resolvedShape.challengePhase || this.currentChallengePhase || this.currentPhase
      );
      return;
    }

    if (this.tryStartPendingModifierIntro()) return;

    this.scheduleNextChallengeAfterResolution(
      resolvedShape.challengePhase ||
      this.currentChallengePhase ||
      this.currentPhase
    );
  }

  resolveReceiverTouch(resolvedShape, touchedReceiver) {
    if (resolvedShape.isVoid) {
      this.endGame("GAME OVER");
      return;
    }

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

    if (this.challengeManager.isBurstShape(resolvedShape)) {
      this.finishBurstShapeIfResolved(challengePhase);
      return;
    }

    if (this.challengeManager.isTwinShape(resolvedShape)) {
      this.finishTwinShapeIfResolved(challengePhase);
      return;
    }


    const didRuleChange = false;

    if (this.challengeManager.isMultiShapeShape(resolvedShape)) {
      this.finishMultiShapeIfResolved(
        didRuleChange,
        challengePhase
      );
      return;
    }

    const didAlreadyAdvanceSpawn = [
      "scheduled",
      "spawned"
    ].includes(resolvedShape.advancedSpawnState);
    this.continueAfterResolvedChallenge(didRuleChange, challengePhase, {
      skipSpawn: didAlreadyAdvanceSpawn
    });
  }

  finishBurstShapeIfResolved(resolvedChallengePhase) {
    const didCompleteBurst = this.isBurstChallengeFullyResolved();

    if (didCompleteBurst) {
      const didRuleChange = false;
      const didAlreadyAdvanceSpawn = this.challengeManager.hasPendingNextSingleShape();
      this.continueAfterResolvedChallenge(didRuleChange, resolvedChallengePhase, {
        skipSpawn: didAlreadyAdvanceSpawn
      });
      return;
    }

    if (this.usesReceiverPermutation()) {
      this.startReceiverPermutation(resolvedChallengePhase);
    }
  }

  finishTwinShapeIfResolved(resolvedChallengePhase) {
    const didCompleteTwin = this.isTwinChallengeFullyResolved();

    if (didCompleteTwin) {
      const didRuleChange = false;
      const didAlreadyAdvanceSpawn = this.challengeManager.hasPendingNextSingleShape();
      this.continueAfterResolvedChallenge(didRuleChange, resolvedChallengePhase, {
        skipSpawn: didAlreadyAdvanceSpawn
      });
      return;
    }

    if (this.usesReceiverPermutation()) {
      this.startReceiverPermutation(resolvedChallengePhase);
    }
  }

  isBurstChallengeFullyResolved() {
    const hasAllBurstShapes =
      this.challengeManager.burstShapes.filter(Boolean).length ===
      this.challengeManager.burstShapeCount;

    const areAllBurstShapesResolved =
      hasAllBurstShapes &&
      this.challengeManager.burstShapes.every(
        (shape) => shape?.state === "resolved"
      );

    if (!areAllBurstShapesResolved) return false;

    return true;
  }

  isTwinChallengeFullyResolved() {
    const hasAllTwinShapes =
      this.challengeManager.twinShapes.filter(Boolean).length ===
      this.challengeManager.twinShapeCount;

    const areAllTwinShapesResolved =
      hasAllTwinShapes &&
      this.challengeManager.twinShapes.every(
        (shape) => shape?.state === "resolved"
      );

    if (!areAllTwinShapesResolved) return false;

    return true;
  }

  advanceBurstSequenceAfterResolvedActiveShape(resolvedShape, shouldScheduleNextChallenge) {
    const didCompleteBurst = this.challengeManager.advanceBurstAfterActiveShape(resolvedShape);

    if (!didCompleteBurst || !shouldScheduleNextChallenge) return;
  }

  advanceTwinSequenceAfterResolvedActiveShape(resolvedShape, shouldScheduleNextChallenge) {
    const didCompleteTwin = this.challengeManager.advanceTwinAfterActiveShape(resolvedShape);

    if (!didCompleteTwin || !shouldScheduleNextChallenge) return;
  }

  updateMultiShapes(deltaSeconds) {
    if (this.currentShapes.length === 0) return;

    this.currentShapes.forEach((shape) => {
      if (shape.state !== "resolved") {
        shape.update(deltaSeconds, shape.gravity || this.currentGravity);
      }
    });

    for (const shape of this.currentShapes) {
      if (shape.state === "resolved") continue;

      const touchedReceiver = this.arena.findReceiverHitByShape(
        shape,
        this.getCollisionPhaseForShape(shape),
        this.getModifierVisualState(performance.now())
      );
      if (touchedReceiver) {
        this.resolveReceiverTouch(shape, touchedReceiver);
        return;
      }

      if (shape.isBelowScreen(this.scaler.canvasHeight, this.scaler.y(28))) {
        if (shape.isVoid && !shape.hasBeenThrown) {
          this.resolveIgnoredVoidShape(shape);
          return;
        }

        this.endGame("GAME OVER");
        return;
      }
    }
  }

  finishMultiShapeIfResolved(
    shouldStartRuleTransition,
    resolvedChallengePhase
  ) {
    const areAllShapesResolved =
      this.challengeManager.areAllMultiShapesResolved();

    if (areAllShapesResolved) {
      this.continueAfterResolvedChallenge(
        shouldStartRuleTransition,
        resolvedChallengePhase
      );
      return;
    }

    if (this.usesReceiverPermutation()) {
      this.startReceiverPermutation(
        resolvedChallengePhase
      );
    }
  }

  advanceRuleSequenceForNextLogicalChallenge(previousChallengePhase) {
    this.dynamicRuleSequence.consumeSuccessfulAnswer(
      previousChallengePhase,
      this.currentPhase,
      this.activeModifiers.ruleSequence
    );
  }

  continueAfterResolvedChallenge(shouldStartRuleTransition, resolvedChallengePhase = this.currentChallengePhase || this.currentPhase, options = {}) {

    const isEasyRhythm =
      this.getCurrentRhythmConfig().trigger === "afterResolution";

    if (isEasyRhythm) {
      const previousRuleName = this.currentRuleName;

      this.advanceRuleSequenceForNextLogicalChallenge(
        resolvedChallengePhase
      );

      const nextRuleName = this.currentRuleName;

      if (previousRuleName !== nextRuleName) {
        this.activeShapeRuleName = nextRuleName;
        this.showRuleTransitionFeedback(nextRuleName);
      }
    }

    if (this.tryStartPendingModifierIntro()) return;

    if (!this.currentPhaseUsesReceiverRotation) {
      this.receiverEffects.stopRotations();
    }

    if (shouldStartRuleTransition && !options.skipSpawn) {
      this.showRuleTransitionFeedback(this.currentRuleName);
    }

    const modifierIntroContext =
      this.getModifierIntroContext(resolvedChallengePhase);

    if (modifierIntroContext) {
      this.deferredNextChallengeBoundaryPhase = resolvedChallengePhase;
      this.startModifierIntroWhenReady(modifierIntroContext);
      return;
    }

    if (this.usesReceiverPermutation()) {
      this.startReceiverPermutation(resolvedChallengePhase);
      return;
    }

    if (!options.skipSpawn) {
      this.scheduleNextChallengeAfterResolution(
        resolvedChallengePhase
      );
    }
  }



  scheduleNextChallengeAfterResolution(
    previousChallengePhase =
      this.currentChallengePhase ||
      this.currentPhase,
    options = {}
  ) {
    const isEasyRhythm =
      this.getCurrentRhythmConfig().trigger === "afterResolution";

    this.scheduleNextChallengeWithDelay(
      this.getCurrentRhythmDelayMs(),
      previousChallengePhase,
      {
        ...options,
        shouldAdvanceRuleAtSpawn: !isEasyRhythm
      }
    );
  }

  scheduleNextChallengeWithDelay(
    nextSpawnDelayMs,
    previousChallengePhase,
    options = {}
  ) {
    if (this.challengeManager.hasPendingNextSingleShape()) return;

    const nextSingleShapeTimeoutId = window.setTimeout(() => {
      this.challengeManager.nextSingleShapeTimeoutId = null;

      this.spawnNextChallengeAtBoundary(
        previousChallengePhase,
        options
      );
    }, nextSpawnDelayMs);

    this.challengeManager.setNextSingleShapeTimeout(
      nextSingleShapeTimeoutId
    );
  }

  spawnNextChallengeAtBoundary(
    previousChallengePhase,
    options = {}
  ) {
    if (
      this.state === "ended" ||
      this.state === "waiting"
    ) return;

    if (
      this.isShowingModifierIntro ||
      this.pendingModifierIntro
    ) {
      this.deferredNextChallengeBoundaryPhase =
        previousChallengePhase;
      return;
    }

    if (
      this.state === "receiverPermutation" ||
      this.receiverEffects.isPermutationAnimating
    ) {
      this.deferredNextChallengeBoundaryPhase =
        previousChallengePhase;
      return;
    }

    if (options.shouldAdvanceRuleAtSpawn !== false) {
      this.advanceRuleSequenceForNextLogicalChallenge(
        previousChallengePhase
      );
    }

    this.spawnNextChallenge();
  }

  showRuleTransitionFeedback(nextRuleName) {
    navigator.vibrate?.(50);
    this.showCenterMessage(nextRuleName, GAME_CONFIG.ruleTransitionFeedbackDurationMs);
  }

  clearPendingGroupSpawnTimeouts() {
    this.challengeManager.clearMultiShapeTimeouts();
    this.challengeManager.clearBurstShapeTimeouts();
  }

  clearAllPendingSpawnTimeouts() {
    this.clearPendingGroupSpawnTimeouts();
    this.challengeManager.clearNextSingleShapeTimeout();
  }

  clearPendingMultiShapeSpawn() {
    this.challengeManager.clearMultiShapeTimeouts();
  }

  resetRuntimeState() {
    this.modifierIntro.reset();
    this.movingReceiverOffset = 0;
  }

  updateReceiverPermutation(currentTime) {
    const wasBlockingPermutation = this.state === "receiverPermutation";
    const didFinishPermutation = this.receiverEffects.updatePermutation(currentTime);
    if (!didFinishPermutation) return;

    if (wasBlockingPermutation) {
      this.state = "playing";
    }

    if (this.deferredNextChallengeBoundaryPhase) {
      const deferredBoundaryPhase =
        this.deferredNextChallengeBoundaryPhase;

      this.deferredNextChallengeBoundaryPhase = null;

      if (
        this.getCurrentRhythmConfig().trigger === "afterResolution"
      ) {
        this.scheduleNextChallengeAfterResolution(
          deferredBoundaryPhase
        );
        return;
      }

      this.spawnNextChallengeAtBoundary(
        deferredBoundaryPhase
      );

      return;
    }

    if (wasBlockingPermutation) {
      this.scheduleNextChallengeAfterResolution();
    }
  }

  startReceiverPermutation(permutationPhase) {
    const permutationMode = this.activeModifiers.permutation;

    if (this.hasEngagedShapes()) {
      this.receiverEffects.startPermutation(
        performance.now(),
        permutationPhase,
        permutationMode
      );
      return;
    }

    this.clearPendingGroupSpawnTimeouts();
    this.deferredNextChallengeBoundaryPhase =
      permutationPhase;

    this.state = "receiverPermutation";
    this.clearCurrentChallenge();

    this.receiverEffects.startPermutation(
      performance.now(),
      permutationPhase,
      permutationMode
    );
  }

  updateModifierIntro(currentTime) {
    const didFinishIntro = this.modifierIntro.update(currentTime);
    if (!didFinishIntro) return;

    this.state = "playing";

    if (this.deferredNextChallengeBoundaryPhase) {
      const deferredBoundaryPhase = this.deferredNextChallengeBoundaryPhase;
      this.deferredNextChallengeBoundaryPhase = null;
      this.spawnNextChallengeAtBoundary(
        deferredBoundaryPhase,
        {
          shouldAdvanceRuleAtSpawn:
            this.getCurrentRhythmConfig().trigger !== "afterResolution"
        }
      );
      return;
    }

    this.spawnNextChallenge();
  }

  startModifierIntroWhenReady(modifierIntroContext) {
    this.pendingModifierIntro = modifierIntroContext;

    if (this.hasEngagedShapes()) return;

    this.startModifierIntro();
  }

  tryStartPendingModifierIntro() {
    if (!this.pendingModifierIntro || this.hasEngagedShapes()) return false;

    this.startModifierIntro();
    return true;
  }

  startModifierIntro() {
    const introStartedAt = performance.now();
    const modifierIntroContext = this.pendingModifierIntro;
    if (!modifierIntroContext?.intro) return;

    const introPhase = modifierIntroContext.phase || this.currentPhase;
    const intro = modifierIntroContext.intro;

    this.pendingModifierIntro = null;
    this.clearPendingGroupSpawnTimeouts();
    this.receiverEffects.stopRotations();
    this.receiverEffects.syncRotationsToPhase(
      introPhase,
      modifierIntroContext.modifiers?.permutation || this.activeModifiers.permutation
    );
    this.clearCurrentChallenge();
    this.state = this.modifierIntro.start(
      introStartedAt,
      intro,
      introPhase.ruleName
    );
  }

  updateReceiverRotations(currentTime) {
    const rotationPhase = this.currentChallengePhase || this.currentPhase;

    this.receiverEffects.updateRotations(
      currentTime,
      rotationPhase,
      this.state,
      this.activeModifiers.rotation,
      this.activeModifiers.permutation
    );
  }

  updateMovingReceiverTracks(deltaSeconds) {
    if (!this.activeModifiers.slide) {
      this.movingReceiverOffset = 0;
      return;
    }

    const perimeterLength = this.arena.getOuterTrackPerimeterLength();
    this.movingReceiverOffset = (this.movingReceiverOffset + GAME_CONFIG.movingReceiverSpeed * deltaSeconds) % perimeterLength;
  }

  prepareSwipeFromPoint(startPoint) {
    if (!this.requiresPreciseShapeSelection) {
      return Boolean(this.activeShape?.canReceiveSwipe);
    }

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
    if (!thrownShape) return;

    if (thrownShape.isVoid) {
      this.endGame("GAME OVER");
      return;
    }

    if (this.pendingModifierIntro) return;

    if (this.challengeManager.isMultiShapeShape(thrownShape)) {
      this.challengeManager.clearActiveShapeSelection();
      return;
    }

    if (this.challengeManager.isActiveBurstShape(thrownShape)) {
      this.advanceBurstSequenceAfterResolvedActiveShape(
        thrownShape,
        false
      );
      return;
    }

    if (this.challengeManager.isActiveTwinShape(thrownShape)) {
      this.advanceTwinSequenceAfterResolvedActiveShape(
        thrownShape,
        false
      );
      return;
    }

    if (!this.shouldAdvanceSingleChallengeAfterSwipe()) return;

    this.challengeManager.moveActiveShapeToLaunchedShapes();
    this.scheduleNextSingleShapeAfterThrow(
      thrownShape,
      this.getCurrentRhythmDelayMs()
    );
  }

  shouldAdvanceChallengeAfterSwipe() {
    return this.getCurrentRhythmConfig().trigger === "afterSwipe";
  }

  shouldAdvanceSingleChallengeAfterSwipe() {
    return this.shouldAdvanceChallengeAfterSwipe();
  }

  getCurrentRhythmConfig() {
    return getRhythmConfig(this.activeModifiers.rhythmDifficulty);
  }

  getCurrentRhythmDelayMs() {
    return getRhythmDelayMs(
      this.score,
      this.activeModifiers.rhythmDifficulty
    );
  }

  scheduleNextSingleShapeAfterThrow(thrownShape, nextSpawnDelayMs) {
    if (thrownShape.advancedSpawnState !== "none") return;

    thrownShape.advancedSpawnState = "scheduled";
    const nextSingleShapeTimeoutId = window.setTimeout(() => {
      this.challengeManager.nextSingleShapeTimeoutId = null;
      thrownShape.advancedSpawnState = "spawned";
      this.spawnNextChallengeAtBoundary(thrownShape.challengePhase);
    }, nextSpawnDelayMs);

    this.challengeManager.setNextSingleShapeTimeout(nextSingleShapeTimeoutId);
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

  handleHomeTap(point) {
    const hitTarget =
      this.homeScreen.getHitTarget(point);

    // Daily reste un bouton séparé
    if (hitTarget === "daily") {
      console.log("daily clicked");
      return;
    }

    // Settings reste aussi séparé
    if (hitTarget === "settings") {
      console.log("settings clicked");
      return;
    }

    // Tout le reste de l'écran lance la partie
    this.reset();
  }

  startOrRestartFromKeyboard() {
    if (this.state === "waiting" || this.state === "ended") {
      this.reset();
    }
  }

  handleGameOverTap(point) {
    const hitTarget = this.gameOverScreen.getHitTarget(point);

    if (hitTarget === "home") {
      this.showWaitingScreen();
      return;
    }

    this.reset();
  }

  endGame(message) {
    if (this.state === "ended") return;

    this.previousBestScore = HOME_UI_DATA.bestScore;

    this.gameOverWasNewBest =
      this.score > HOME_UI_DATA.bestScore;

    if (this.gameOverWasNewBest) {
      HOME_UI_DATA.bestScore = this.score;
    }

    this.gameOverStartedAt = performance.now();

    this.clearAllPendingSpawnTimeouts();
    this.receiverEffects.stopAll();

    this.state = "ended";

    this.centerMessage = message;
    this.centerMessageUntil = Infinity;

    this.activeShapeRuleName = null;
    this.pendingModifierIntro = null;
    this.deferredNextChallengeBoundaryPhase = null;

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

    if (this.isWaitingToStart()) {
      this.homeScreen.draw(this.context, HOME_UI_DATA, currentTime);
      return;
    }

    this.arena.draw(
      this.context,
      this.visiblePhase,
      this.wallColorAnimationState,
      this.receiverEffects.getHitFeedbackByReceiverId(currentTime),
      this.introVisualState,
      this.getModifierVisualState(currentTime)
    );

    if (this.state === "ended") {
      // Garde la dernière forme figée à l'écran
      this.drawActiveShape(currentTime);

      // Laisse l'impact / les particules finir leur animation
      this.particleSystem.draw(this.context);

      const elapsedGameOverMs =
        currentTime - this.gameOverStartedAt;

      const transitionElapsedMs =
        Math.max(
          elapsedGameOverMs -
          GAME_CONFIG.gameOverHoldDurationMs,
          0
        );

      const transitionProgress = clamp(
        transitionElapsedMs /
        GAME_CONFIG.gameOverTransitionDurationMs,
        0,
        1
      );

      this.gameOverScreen.draw(
        this.context,
        {
          score: this.score,
          bestScore: HOME_UI_DATA.bestScore,
          previousBestScore: this.previousBestScore,
          wasNewBest: this.gameOverWasNewBest,
          transitionProgress
        },
        currentTime
      );

      return;
    }

    this.drawHud();
    this.drawActiveShape(currentTime);
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
    this.context.font = `400 ${this.scaler.x(56)}px "Bebas Neue"`;
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

      const renderIdentity = shape.getRenderIdentity();

      ShapeRenderer.draw(
        this.context,
        { x: 0, y: 0 },
        renderIdentity.shapeName,
        NEON_COLORS[renderIdentity.colorId],
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
    const visibleShapes = this.challengeManager.getVisibleShapes();

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
        const renderIdentity = shape.getRenderIdentity();
        const revealGlowMultiplier = shape.getRevealGlowMultiplier(currentTime);

        ShapeRenderer.draw(
          this.context,
          { x: 0, y: 0 },
          renderIdentity.shapeName,
          NEON_COLORS[renderIdentity.colorId],
          this.scaler.x(shape.state === "active" ? GAME_CONFIG.shapeRadius * 1.08 : GAME_CONFIG.shapeRadius),
          this.getShapeRenderOpacity(shape),
          (shape.hasBeenThrown
            ? swipeGlowMultiplier
            : spawnGlowMultiplier) * revealGlowMultiplier
        );
        this.context.restore();
      });
  }

  getShapeRenderOpacity(shape) {
    if (shape.state === "inactive" && !shape.hasBeenThrown) {
      if (this.challengeManager.isBurstShape(shape)) {
        return GAME_CONFIG.burstWaitingOpacity;
      }

      if (this.challengeManager.isTwinShape(shape)) {
        return GAME_CONFIG.twinWaitingOpacity;
      }
    }

    return shape.state === "inactive" ? 0.7 : 1;
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
    if (this.isShowingModifierIntro) {
      this.drawModifierIntroLabel();
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

  drawModifierIntroLabel() {
    const [firstWord, secondWord] = this.modifierIntroLines[0].split(" ");
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

  getModifierVisualState(currentTime) {
    return {
      blink: this.blinkController.getVisualState(
        currentTime,
        this.activeModifiers.blink
      ),
      pulse: this.pulseController.getVisualState(
        currentTime,
        this.activeModifiers.pulse
      ),
      wave: this.waveController.getVisualState(
        currentTime,
        this.activeModifiers.wave
      ),
      receivers: {
        isSliding: Boolean(this.activeModifiers.slide),
        isShort: Boolean(this.activeModifiers.shortReceivers),
        movingOffset: this.movingReceiverOffset
      }
    };
  }

  getCenterLabelY(isRuleLabel) {
    if (this.state === "ended") {
      return this.scaler.canvasHeight / 2 - this.scaler.y(58);
    }

    const extraHeight = Math.max(this.scaler.designHeight - this.scaler.baseDesignHeight, 0);
    const ruleLabelY = 486 + extraHeight * 0.5;

    return this.scaler.y(isRuleLabel ? ruleLabelY : 376);
  }

  get visiblePhase() {
    return this.getPhaseWithCurrentWallColors(this.currentChallengePhase || this.currentPhase);
  }

  get visibleRuleName() {
    return this.activeShape?.challengePhase?.ruleName || this.activeShapeRuleName || this.visiblePhase.ruleName;
  }

  get wallColorAnimationState() {
    return this.receiverEffects.animationState;
  }

  getPhaseWithCurrentWallColors(phase) {
    return this.receiverEffects.getPhaseWithCurrentReceiverState(
      phase,
      this.activeModifiers.permutation,
      this.activeModifiers.rotation
    );
  }

  get activeChallengeUsesMultipleShapes() {
    return this.challengeManager.isMultiShapeChallengeActive() || this.activeModifiers.multiShapeCount > 1;
  }

  get requiresPreciseShapeSelection() {
    return this.activeModifiers.shapeSwipe || this.activeChallengeUsesMultipleShapes;
  }

  get currentChallengeSpawnImpulse() {
    return ChallengePhysics.getSpawnImpulse(this.currentChallengePhase || this.currentPhase);
  }

  usesReceiverPermutation() {
    return usesAnyPermutation(this.activeModifiers.permutation);
  }

  usesReceiverRotation() {
    return usesAnyRotation(this.activeModifiers.rotation);
  }

  hasEngagedShapes() {
    return (
      this.challengeManager.hasUnresolvedShapes() ||
      this.challengeManager.hasPendingNextSingleShape()
    );
  }

  getModifierIntroContext(resolvedChallengePhase) {
    const previousLevel = resolvedChallengePhase?.level;
    const nextLevel = this.currentLevel;

    if (!previousLevel || previousLevel === nextLevel) return null;

    const previousModifiers = getModifiersForLevel(previousLevel);
    const nextModifiers = getModifiersForLevel(nextLevel);
    const intro = this.modifierIntro.getIntroForModifierTransition(
      previousModifiers,
      nextModifiers
    );

    if (!intro) return null;

    return {
      intro,
      phase: this.createPhaseSnapshot(this.currentPhase),
      modifiers: { ...nextModifiers }
    };
  }

  shouldStartModifierIntro(resolvedChallengePhase) {
    return Boolean(this.getModifierIntroContext(resolvedChallengePhase));
  }

  get currentPhaseUsesReceiverRotation() {
    return this.usesReceiverRotation();
  }

  get isShowingModifierIntro() {
    return this.stateController.isShowingModifierIntro;
  }

  get modifierIntroLines() {
    return this.modifierIntro.getLines();
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
    const phaseWithRunLayout = {
      ...basePhase,
      receiverColorsByPositionId: { ...this.runReceiverColorsByPositionId },
      receiverShapesByPositionId: { ...this.runReceiverShapesByPositionId }
    };

    return this.dynamicRuleSequence.getPhaseWithCurrentRule(
      phaseWithRunLayout,
      this.activeModifiers.ruleSequence
    );
  }

  get currentLevel() {
    return this.rules.getLevel(this.score);
  }

  get activeModifiers() {
    return getModifiersForLevel(this.currentLevel);
  }

  get currentGravity() {
    return this.scaler.x(ChallengePhysics.getGravity(this.currentChallengePhase || this.currentPhase));
  }

  get introVisualState() {
    if (!this.isShowingModifierIntro) {
      return null;
    }

    return {
      railOpacity: 0.18,
      iconOpacity: 0.18
    };
  }

}

function createRandomReceiverLayout(values) {
  const shuffledValues = [...values];

  for (let index = shuffledValues.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledValues[index], shuffledValues[randomIndex]] = [
      shuffledValues[randomIndex],
      shuffledValues[index]
    ];
  }

  return RECEIVER_DEFINITIONS.reduce((layoutByReceiverId, receiverDefinition, index) => {
    layoutByReceiverId[receiverDefinition.id] = shuffledValues[index];
    return layoutByReceiverId;
  }, {});
}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomItemExcept(items, excludedItem) {
  const availableItems = items.filter(
    (item) => item !== excludedItem
  );

  return getRandomItem(availableItems);
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
