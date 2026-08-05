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
  minSwipeDistance: 32,
  minThrowForce: 880,
  maxThrowForce: 1560,
  upwardThrowBoost: 330,
  shapeRadius: 34,
  level7GravityMultiplier: 0.4, // 0.36
  level7SecondShapeDelayMs: 500,
  doubleSecondShapeDelayMs: 650,
  level7HorizontalImpulse: 64,
  level7SpawnImpulseMultiplier: 0.65, // 0.75
  ruleTransitionFeedbackDurationMs: 650,
  receiverPermutationDurationMs: 280,
  level8StartScore: 17,
  level9StartScore: 21,
  level10StartScore: 25,
  level11StartScore: 35,
  level12StartScore: 41,
  level13StartScore: 47,
  level14StartScore: 55,
  level15StartScore: 62,
  level16StartScore: 65,
  level17StartScore: 68,
  level18StartScore: 77,
  level19StartScore: 81,
  level20StartScore: 85,
  level21StartScore: 91,
  level22StartScore: 95,
  level23StartScore: 99,
  doubleEndScore: 115,
  stroopIntroDurationMs: 1400,
  memoryIntroDurationMs: 1400,
  doubleIntroDurationMs: 1400,
  memoryRevealDurationMs: 3000,
  level11IntroDurationMs: 1400,
  level12IntroDurationMs: 1400,
  level13IntroDurationMs: 1600,
  shapeRotationIntervalMs: 1000,
  shapeRotationDurationMs: 180,
  level10WallRotationIntervalMs: 1000,
  level10WallRotationDurationMs: 180,
  level10GravityMultiplier: 0.55,
  level10SpawnImpulseMultiplier: 0.78
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
  { level: 4, ruleName: "COLOR", startScore: 7, receiverColorsByPositionId: WALL_LAYOUT_B_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 2, dynamicRuleMaxAnswers: 3 },
  { level: 5, ruleName: "COLOR", startScore: 9, receiverColorsByPositionId: WALL_LAYOUT_B_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_5_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 2, dynamicRuleMaxAnswers: 3 },
  { level: 6, ruleName: "COLOR", startScore: 11, receiverColorsByPositionId: WALL_LAYOUT_C_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: LEVEL_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 3 },
  { level: 7, ruleName: "COLOR", startScore: 14, receiverColorsByPositionId: WALL_LAYOUT_D_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: LEVEL_7_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 3 },
  { level: 8, ruleName: "COLOR", startScore: GAME_CONFIG.level8StartScore, receiverColorsByPositionId: LEVEL_8_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: LEVEL_7_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 3, permutesReceiverColorsAfterSuccess: true },
  { level: 9, ruleName: "COLOR", startScore: GAME_CONFIG.level9StartScore, receiverColorsByPositionId: LEVEL_9_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: LEVEL_7_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 3, permutesReceiverShapesAfterSuccess: true },
  { level: 10, ruleName: "COLOR", startScore: GAME_CONFIG.level10StartScore, receiverColorsByPositionId: LEVEL_10_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: LEVEL_7_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 3, permutesReceiverColorsAfterSuccess: true, permutesReceiverShapesAfterSuccess: true },
  { level: 11, ruleName: "COLOR", startScore: GAME_CONFIG.level11StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicWallColors: true, usesMobileReceiverPhysics: true },
  { level: 12, ruleName: "SHAPE", startScore: GAME_CONFIG.level12StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicReceiverShapes: true, usesMobileReceiverPhysics: true },
  { level: 13, ruleName: "COLOR", startScore: GAME_CONFIG.level13StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 2, usesRuleControlledReceiverRotation: true, usesMobileReceiverPhysics: true },
  { level: 14, ruleName: "COLOR", startScore: GAME_CONFIG.level14StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 2, usesSimultaneousReceiverRotations: true, usesMobileReceiverPhysics: true },
  { level: 15, ruleName: "WORD", startScore: GAME_CONFIG.level15StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID, usesStroopChallenge: true },
  { level: 16, ruleName: "INK", startScore: GAME_CONFIG.level16StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID, usesStroopChallenge: true },
  { level: 17, ruleName: "WORD", startScore: GAME_CONFIG.level17StartScore, receiverColorsByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID, usesStroopChallenge: true, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 2, dynamicRuleNames: ["WORD", "INK"] },
  { level: 18, ruleName: "COLOR", startScore: GAME_CONFIG.level18StartScore, receiverColorsByPositionId: WALL_LAYOUT_A_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID, usesMemoryChallenge: true, memorySeriesLength: 4, hidesMemoryColorsAfterReveal: true, usesNeutralReceiverIcons: true },
  { level: 19, ruleName: "SHAPE", startScore: GAME_CONFIG.level19StartScore, receiverColorsByPositionId: WALL_LAYOUT_A_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID, usesMemoryChallenge: true, memorySeriesLength: 4, hidesMemoryShapesAfterReveal: true },
  { level: 20, ruleName: "COLOR", startScore: GAME_CONFIG.level20StartScore, receiverColorsByPositionId: WALL_LAYOUT_A_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID, usesMemoryChallenge: true, memorySeriesLength: 6, hidesMemoryColorsAfterReveal: true, hidesMemoryShapesAfterReveal: true, usesDynamicRuleSequence: true, dynamicRuleMinAnswers: 1, dynamicRuleMaxAnswers: 2 },
  { level: 21, ruleName: "COLOR", startScore: GAME_CONFIG.level21StartScore, receiverColorsByPositionId: WALL_LAYOUT_A_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID, usesDoubleMode: true, permutesReceiverColorsAfterSuccess: true },
  { level: 22, ruleName: "COLOR", startScore: GAME_CONFIG.level22StartScore, receiverColorsByPositionId: WALL_LAYOUT_A_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID, usesDoubleMode: true, permutesReceiverShapesAfterSuccess: true },
  { level: 23, ruleName: "COLOR", startScore: GAME_CONFIG.level23StartScore, receiverColorsByPositionId: WALL_LAYOUT_A_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID, usesDoubleMode: true, permutesReceiverColorsAfterSuccess: true, permutesReceiverShapesAfterSuccess: true }
];

const NEON_COLORS = {
  green: "#39ff72",
  red: "#ff3048",
  blue: "#3192ff",
  yellow: "#e2ff05",
  memoryNeutral: "#f8fbff"
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

const COUNTERCLOCKWISE_RECEIVER_ROTATION_BY_POSITION_ID = {
  topLeft: "bottomLeft",
  bottomLeft: "bottomRight",
  bottomRight: "topRight",
  topRight: "topLeft"
};

const AVAILABLE_SHAPES = ["circle", "square", "triangle", "star"];
const AVAILABLE_COLOR_IDS = ["red", "yellow", "green", "blue"];
const MEMORY_NEUTRAL_COLOR_ID = "memoryNeutral";
const MEMORY_QUESTION_SHAPE_NAME = "question";

const MEMORY_NEUTRAL_RECEIVER_COLORS_BY_POSITION_ID = {
  topLeft: MEMORY_NEUTRAL_COLOR_ID,
  topRight: MEMORY_NEUTRAL_COLOR_ID,
  bottomLeft: MEMORY_NEUTRAL_COLOR_ID,
  bottomRight: MEMORY_NEUTRAL_COLOR_ID
};

const MEMORY_QUESTION_RECEIVER_SHAPES_BY_POSITION_ID = {
  topLeft: MEMORY_QUESTION_SHAPE_NAME,
  topRight: MEMORY_QUESTION_SHAPE_NAME,
  bottomLeft: MEMORY_QUESTION_SHAPE_NAME,
  bottomRight: MEMORY_QUESTION_SHAPE_NAME
};

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
  constructor({ x, y, radius, colorId, shapeName, velocityX = 0, velocityY, state = "active", stroopWordColorId = null, stroopInkColorId = null }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.colorId = colorId;
    this.shapeName = shapeName;
    this.stroopWordColorId = stroopWordColorId;
    this.stroopInkColorId = stroopInkColorId;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.state = state;
    this.hasBeenThrown = false;
    this.createdAt = performance.now();
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

    if (shouldLockAfterThrow) {
      this.state = "launched";
    }
  }

  isBelowScreen(canvasHeight, extraMargin) {
    const hasBeenVisibleLongEnough = performance.now() - this.createdAt > 500;
    return hasBeenVisibleLongEnough && this.y - this.radius > canvasHeight + extraMargin;
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

class ParticleSystem {
  constructor(scaler) {
    this.scaler = scaler;
    this.particles = [];
  }

  clear() {
    this.particles = [];
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

  update(deltaSeconds) {
    this.particles.forEach((particle) => particle.update(deltaSeconds));
    this.particles = this.particles.filter((particle) => particle.isAlive);
  }

  draw(context) {
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
      outerX: 18,
      outerY: 78,
      outerWidth: 504,
      outerHeight: 874,
      innerX: 66,
      innerY: 152,
      innerWidth: 408,
      innerHeight: 730,
      railSize: 48,
      cornerRadius: 28
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

  findReceiverHitByShape(fallingShape) {
    if (!fallingShape.canHitReceiver) return null;

    const collisionRadius = fallingShape.radius * 0.55;
    return this.receivers.find((receiver) => {
      return this.getReceiverHitAreas(receiver).some((hitArea) => {
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

  getReceiverHitAreas(receiver) {
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

  circleOverlapsRect(circleX, circleY, radius, rectangle) {
    return (
      circleX + radius >= rectangle.x &&
      circleX - radius <= rectangle.x + rectangle.width &&
      circleY + radius >= rectangle.y &&
      circleY - radius <= rectangle.y + rectangle.height
    );
  }

  draw(context, currentPhase, wallColorAnimation = null) {
    if (wallColorAnimation && wallColorAnimation.progress < 1) {
      this.drawReceiverTracksWithWallColorAnimation(context, currentPhase, wallColorAnimation);
      this.drawReceiverIconsWithWallColorAnimation(context, currentPhase, wallColorAnimation);
      this.drawInnerGuide(context);
      return;
    }

    this.receivers.forEach((receiver) => this.drawReceiverTrack(context, receiver, currentPhase));
    this.drawReceiverIcons(context, currentPhase);
    this.drawInnerGuide(context);
  }

  drawReceiverTracksWithWallColorAnimation(context, currentPhase, wallColorAnimation) {
    this.receivers.forEach((receiver) => {
      const previousColor = wallColorAnimation.previousColorsByPositionId
        ? NEON_COLORS[wallColorAnimation.previousColorsByPositionId[receiver.id]]
        : this.getReceiverNeonColor(receiver, currentPhase);
      const currentColor = this.getReceiverNeonColor(receiver, currentPhase);
      this.drawReceiverTrack(context, receiver, currentPhase, previousColor, 1 - wallColorAnimation.progress);
      this.drawReceiverTrack(context, receiver, currentPhase, currentColor, wallColorAnimation.progress);
    });
  }

  drawReceiverIconsWithWallColorAnimation(context, currentPhase, wallColorAnimation) {
    const previousIconPhase = {
      ...currentPhase,
      receiverColorsByPositionId: wallColorAnimation.previousColorsByPositionId || currentPhase.receiverColorsByPositionId,
      receiverShapesByPositionId: wallColorAnimation.previousShapesByPositionId || currentPhase.receiverShapesByPositionId
    };

    this.drawReceiverIcons(context, previousIconPhase, 1 - wallColorAnimation.progress);
    this.drawReceiverIcons(context, currentPhase, wallColorAnimation.progress);
  }

  drawReceiverTrack(context, receiver, currentPhase, colorOverride = null, opacity = 1) {
    const layout = this.getScaledLayout();
    const middleX = layout.outerX + layout.outerWidth / 2;
    const middleY = layout.outerY + layout.outerHeight / 2;
    const rightX = layout.outerX + layout.outerWidth;
    const bottomY = layout.outerY + layout.outerHeight;

    const receiverNeonColor = colorOverride || this.getReceiverNeonColor(receiver, currentPhase);

    context.save();
    context.shadowColor = receiverNeonColor;
    context.shadowBlur = this.scaler.x(18);
    context.strokeStyle = receiverNeonColor;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = this.scaler.x(4);

    context.beginPath();

    if (receiver.id === "topLeft") {
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

    // Double stroke : un trait large flou pour le halo, puis un trait fin lumineux.
    context.globalAlpha = 0.45 * opacity;
    context.lineWidth = this.scaler.x(15);
    context.stroke();
    context.globalAlpha = opacity;
    context.lineWidth = this.scaler.x(4);
    context.stroke();
    context.restore();
  }

  drawReceiverIcons(context, currentPhase, opacity = 1) {
    if (currentPhase.usesStroopChallenge) return;

    const layout = this.layout;
    const iconMargin = 64;
    const receiverIconRadius = this.scaler.x(GAME_CONFIG.shapeRadius);
    const iconPositionsByReceiverId = {
      topLeft: this.scaler.point(layout.innerX + iconMargin, layout.innerY + iconMargin),
      topRight: this.scaler.point(layout.innerX + layout.innerWidth - iconMargin, layout.innerY + iconMargin),
      bottomLeft: this.scaler.point(layout.innerX + iconMargin, layout.innerY + layout.innerHeight - iconMargin),
      bottomRight: this.scaler.point(layout.innerX + layout.innerWidth - iconMargin, layout.innerY + layout.innerHeight - iconMargin)
    };

    // Les symboles de reference sont dans les coins du carre interieur,
    // separes des rails neon pour ne pas donner l'impression qu'ils sont sur le mur.
    this.receivers.forEach((receiver) => {
      const receiverShapeName = this.getReceiverShapeName(receiver, currentPhase);
      const shouldUseNeutralIconColor = receiverShapeName === MEMORY_QUESTION_SHAPE_NAME || currentPhase.usesNeutralReceiverIcons;
      const receiverIconColor = shouldUseNeutralIconColor
        ? NEON_COLORS[MEMORY_NEUTRAL_COLOR_ID]
        : this.getReceiverNeonColor(receiver, currentPhase);

      if (receiverShapeName === MEMORY_QUESTION_SHAPE_NAME) {
        this.drawReceiverQuestionIcon(context, iconPositionsByReceiverId[receiver.id], receiverIconRadius, opacity);
        return;
      }

      ShapeRenderer.draw(
        context,
        iconPositionsByReceiverId[receiver.id],
        receiverShapeName,
        receiverIconColor,
        receiverIconRadius,
        opacity
      );
    });
  }

  drawReceiverQuestionIcon(context, center, radius, opacity) {
    const questionColor = NEON_COLORS[MEMORY_NEUTRAL_COLOR_ID];

    context.save();
    context.globalAlpha = opacity;
    context.fillStyle = questionColor;
    context.shadowColor = questionColor;
    context.shadowBlur = radius * 0.55;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `900 ${radius * 1.65}px ui-sans-serif, system-ui`;
    context.fillText("?", center.x, center.y + radius * 0.03);
    context.restore();
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
  static draw(context, center, shapeName, color, radius, opacity = 1) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = Math.max(radius * 0.06, 1.8);
    context.shadowColor = color;
    context.shadowBlur = radius * 0.38;
    context.lineJoin = "round";
    context.lineCap = "round";

    ShapeRenderer.createPath(context, center, shapeName, radius);

    context.globalAlpha = 0.28 * opacity;
    context.lineWidth = Math.max(radius * 0.19, 4);
    context.stroke();
    context.globalAlpha = opacity;
    context.lineWidth = Math.max(radius * 0.06, 1.8);
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

    if (currentPhase.ruleName === "WORD") {
      return this.arena.findReceiverByCurrentColor(fallingShape.stroopWordColorId, currentPhase);
    }

    if (currentPhase.ruleName === "INK") {
      return this.arena.findReceiverByCurrentColor(fallingShape.stroopInkColorId, currentPhase);
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

    this.activeRuleName = this.getOppositeRuleName(this.activeRuleName, nextPhase);
    this.remainingAnswersInSequence = nextPhase.usesDynamicRuleSequence
      ? this.createSequenceLength(nextPhase)
      : 0;
    return this.activeRuleName;
  }

  ensureSequenceHasStarted(phase) {
    const allowedRuleNames = this.getAllowedRuleNames(phase);
    const canContinueCurrentSequence = (
      this.activeRuleName &&
      allowedRuleNames.includes(this.activeRuleName) &&
      this.remainingAnswersInSequence > 0
    );

    if (canContinueCurrentSequence) return;

    this.activeRuleName = allowedRuleNames[0];
    this.remainingAnswersInSequence = this.createSequenceLength(phase);
  }

  createSequenceLength(phase) {
    const minAnswers = phase.dynamicRuleMinAnswers;
    const maxAnswers = phase.dynamicRuleMaxAnswers;
    return minAnswers + Math.floor(Math.random() * (maxAnswers - minAnswers + 1));
  }

  forceNewSequence(phase) {
    if (!phase.usesDynamicRuleSequence) return;

    const allowedRuleNames = this.getAllowedRuleNames(phase);
    this.activeRuleName = allowedRuleNames.includes(this.activeRuleName) ? this.activeRuleName : allowedRuleNames[0];
    this.remainingAnswersInSequence = this.createSequenceLength(phase);
  }

  getAllowedRuleNames(phase) {
    return phase.dynamicRuleNames || [phase.ruleName, this.getOppositeRuleName(phase.ruleName)];
  }

  getOppositeRuleName(ruleName, phase = null) {
    if (phase?.dynamicRuleNames?.length === 2) {
      return phase.dynamicRuleNames.find((dynamicRuleName) => dynamicRuleName !== ruleName) || phase.dynamicRuleNames[0];
    }

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

  update(currentTime, shouldRunRotation, direction = "clockwise") {
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
      this.rotate(currentTime, direction);
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

  rotate(currentTime, direction = "clockwise") {
    const receiverRotationByPositionId = direction === "counterclockwise"
      ? COUNTERCLOCKWISE_RECEIVER_ROTATION_BY_POSITION_ID
      : CLOCKWISE_RECEIVER_ROTATION_BY_POSITION_ID;
    const previousValuesByPositionId = { ...this.currentValuesByPositionId };
    const nextValuesByPositionId = {};

    Object.entries(receiverRotationByPositionId).forEach(([fromReceiverId, toReceiverId]) => {
      nextValuesByPositionId[toReceiverId] = previousValuesByPositionId[fromReceiverId];
    });

    this.previousValuesByPositionId = previousValuesByPositionId;
    this.currentValuesByPositionId = nextValuesByPositionId;
    this.rotationStartedAt = currentTime;
    this.lastRotationTime = currentTime;
    this.rotationProgress = 0;
  }

  rotateClockwise(currentTime) {
    this.rotate(currentTime, "clockwise");
  }

  rotateCounterclockwise(currentTime) {
    this.rotate(currentTime, "counterclockwise");
  }

  get animationProgress() {
    return this.rotationProgress;
  }

  get previousValues() {
    if (!this.previousValuesByPositionId || this.rotationProgress >= 1) return null;
    return this.previousValuesByPositionId;
  }
}


class MemoryModeController {
  constructor(receiverIds) {
    this.receiverIds = receiverIds;
    this.reset();
  }

  reset() {
    this.currentSeriesLevel = null;
    this.remainingAnswersInSeries = 0;
    this.receiverColorsByPositionId = { ...WALL_LAYOUT_A_RECEIVER_COLORS_BY_POSITION_ID };
    this.receiverShapesByPositionId = { ...DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID };
    this.revealEndsAt = 0;
  }

  shouldStartNewSeries(phase) {
    if (!phase.usesMemoryChallenge) return false;

    return this.currentSeriesLevel !== phase.level;
  }

  startSeries(phase, currentTime) {
    this.currentSeriesLevel = phase.level;
    this.remainingAnswersInSeries = phase.memorySeriesLength;
    this.receiverColorsByPositionId = phase.hidesMemoryColorsAfterReveal
      ? this.createRandomColorLayout()
      : { ...phase.receiverColorsByPositionId };
    this.receiverShapesByPositionId = phase.hidesMemoryShapesAfterReveal
      ? this.createRandomShapeLayout()
      : { ...phase.receiverShapesByPositionId };
    this.revealEndsAt = currentTime + GAME_CONFIG.memoryRevealDurationMs;
  }

  consumeSuccessfulAnswer(phase) {
    if (!phase.usesMemoryChallenge || this.currentSeriesLevel !== phase.level) return;

    this.remainingAnswersInSeries = Math.max(this.remainingAnswersInSeries - 1, 0);
  }

  getPhaseWithMemoryLayout(phase) {
    if (!phase.usesMemoryChallenge || this.currentSeriesLevel !== phase.level) return phase;

    return {
      ...phase,
      receiverColorsByPositionId: this.receiverColorsByPositionId,
      receiverShapesByPositionId: this.receiverShapesByPositionId
    };
  }

  getVisiblePhase(phase, isRevealingMemory) {
    const phaseWithMemoryLayout = this.getPhaseWithMemoryLayout(phase);
    if (!phase.usesMemoryChallenge || isRevealingMemory) return phaseWithMemoryLayout;

    return {
      ...phaseWithMemoryLayout,
      receiverColorsByPositionId: phase.hidesMemoryColorsAfterReveal
        ? MEMORY_NEUTRAL_RECEIVER_COLORS_BY_POSITION_ID
        : phaseWithMemoryLayout.receiverColorsByPositionId,
      receiverShapesByPositionId: phase.hidesMemoryShapesAfterReveal
        ? MEMORY_QUESTION_RECEIVER_SHAPES_BY_POSITION_ID
        : phaseWithMemoryLayout.receiverShapesByPositionId
    };
  }

  createRandomColorLayout() {
    return this.mapValuesToReceivers(this.shuffleValues(AVAILABLE_COLOR_IDS));
  }

  createRandomShapeLayout() {
    return this.mapValuesToReceivers(this.shuffleValues(AVAILABLE_SHAPES));
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
}

class ChallengePhysics {
  static getSpawnImpulse(challengePhase) {
    if (challengePhase.usesMobileReceiverPhysics || challengePhase.usesDynamicWallColors) {
      return GAME_CONFIG.spawnImpulse * GAME_CONFIG.level10SpawnImpulseMultiplier;
    }

    return GAME_CONFIG.spawnImpulse;
  }

  static getGravity(challengePhase) {
    if (challengePhase.usesMobileReceiverPhysics || challengePhase.usesDynamicWallColors) {
      return GAME_CONFIG.gravity * GAME_CONFIG.level10GravityMultiplier;
    }

    const gravityMultiplier = challengePhase.usesDuoShapes ? GAME_CONFIG.level7GravityMultiplier : 1;
    return GAME_CONFIG.gravity * gravityMultiplier;
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
      this.game.reset();
      return;
    }

    if (!this.game.canReceiveInput()) return;

    this.activeSwipeGesture = new SwipeGesture(event.pointerId, this.getCanvasPoint(event));
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
    this.memoryMode = new MemoryModeController(RECEIVER_DEFINITIONS.map((receiver) => receiver.id));
    this.receiverPermutation = new ReceiverPermutationController({
      initialReceiverColorsByPositionId: LEVEL_8_INITIAL_RECEIVER_COLORS_BY_POSITION_ID,
      initialReceiverShapesByPositionId: LEVEL_7_RECEIVER_SHAPES_BY_POSITION_ID
    });
    this.receiverColorRotation = new ReceiverRotationController({
      initialValuesByPositionId: LEVEL_11_INITIAL_RECEIVER_COLORS_BY_POSITION_ID,
      intervalMs: GAME_CONFIG.level10WallRotationIntervalMs,
      durationMs: GAME_CONFIG.level10WallRotationDurationMs
    });
    this.receiverShapeRotation = new ReceiverRotationController({
      initialValuesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID,
      intervalMs: GAME_CONFIG.shapeRotationIntervalMs,
      durationMs: GAME_CONFIG.shapeRotationDurationMs
    });
    this.particleSystem = new ParticleSystem(this.scaler);
    this.inputController = new InputController(this.canvas, this);

    this.score = 0;
    this.state = "ready";
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.secondDuoShapeTimeoutId = null;
    this.currentChallengePhase = null;
    this.lastAnimationTime = 0;
    this.centerMessage = "SWIPE";
    this.centerMessageUntil = 0;
    this.hasPlayedLevel11Intro = false;
    this.hasPlayedLevel12Intro = false;
    this.hasPlayedLevel13Intro = false;
    this.levelIntroEndsAt = 0;
    this.level13IntroStartedAt = 0;
    this.hasStartedLevel13ShapeIntroRotation = false;
    this.hasPlayedStroopIntro = false;
    this.hasPlayedMemoryIntro = false;
    this.hasPlayedDoubleIntro = false;
    this.doubleRuleName = "COLOR";
    this.remainingObjectsInDoublePair = 0;
    this.pendingReceiverPermutationAction = "nextChallenge";
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
    this.resetWallColorMechanics();
    this.dynamicRuleSequence.reset();
    this.memoryMode.reset();
    this.resetDoubleMode();
    this.score = 90;
    this.state = "playing";
    this.resetLevelIntroFlags();
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.currentChallengePhase = null;
    this.particleSystem.clear();
    this.showCenterMessage("COLOR", 1100);
    this.restartButton.classList.remove("is-visible");
    this.spawnNextChallenge();
  }

  showWaitingScreen() {
    this.clearPendingDuoSpawn();
    this.resetWallColorMechanics();
    this.dynamicRuleSequence.reset();
    this.memoryMode.reset();
    this.resetDoubleMode();
    this.score = 0;
    this.state = "waiting";
    this.resetLevelIntroFlags();
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.currentChallengePhase = null;
    this.particleSystem.clear();
    this.centerMessage = "PRESS TO START";
    this.centerMessageUntil = Infinity;
    this.restartButton.classList.remove("is-visible");
  }

  gameLoop(currentTime) {
    const deltaSeconds = Math.min((currentTime - this.lastAnimationTime) / 1000 || 0, 0.033);
    this.lastAnimationTime = currentTime;

    if (this.state === "playing") {
      this.updateReceiverRotations(currentTime);
      this.updateActiveShape(deltaSeconds);
    } else if (this.state === "receiverPermutation") {
      this.updateReceiverPermutation(currentTime);
    } else if (this.state === "memoryReveal") {
      this.updateMemoryReveal(currentTime);
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
    if (this.activeChallengeUsesMultipleVisibleShapes) {
      this.updateDuoShapes(deltaSeconds);
      return;
    }

    if (!this.activeShape) return;

    this.activeShape.update(deltaSeconds, this.currentGravity);

    const touchedReceiver = this.arena.findReceiverHitByShape(this.activeShape);
    if (touchedReceiver) {
      this.resolveReceiverTouch(this.activeShape, touchedReceiver);
      return;
    }

    if (this.activeShape.isBelowScreen(this.scaler.canvasHeight, this.scaler.y(28))) {
      this.endGame("GAME OVER");
    }
  }

  spawnNextChallenge() {
    if (this.hasCompletedDoubleMode) {
      this.showUpcomingSurvivalMode();
      return;
    }

    if (this.shouldStartMemoryRevealBeforeNextChallenge()) {
      this.startMemoryReveal();
      return;
    }

    if (this.currentPhase.usesStroopChallenge) {
      this.spawnStroopChallenge();
      return;
    }

    if (this.currentPhase.usesDoubleMode) {
      this.spawnDoublePair();
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
    this.activeShape = new FallingShape({
      x: this.scaler.x(GAME_CONFIG.designWidth / 2),
      y: this.scaler.y(GAME_CONFIG.designHeight + 38),
      radius: this.scaler.x(GAME_CONFIG.shapeRadius),
      colorId: getRandomItem(AVAILABLE_COLOR_IDS),
      shapeName: getRandomItem(AVAILABLE_SHAPES),
      velocityY: this.scaler.y(this.currentChallengeSpawnImpulse)
    });
    this.currentShapes = [this.activeShape];
    this.activeShapeIndex = 0;
  }

  spawnStroopChallenge() {
    this.currentChallengePhase = this.currentPhase;
    const wordColorId = getRandomItem(AVAILABLE_COLOR_IDS);
    const inkColorId = getRandomItem(AVAILABLE_COLOR_IDS.filter((colorId) => colorId !== wordColorId));

    this.activeShape = new FallingShape({
      x: this.scaler.x(GAME_CONFIG.designWidth / 2),
      y: this.scaler.y(GAME_CONFIG.designHeight + 38),
      radius: this.scaler.x(GAME_CONFIG.shapeRadius),
      colorId: inkColorId,
      shapeName: "circle",
      stroopWordColorId: wordColorId,
      stroopInkColorId: inkColorId,
      velocityY: this.scaler.y(this.currentChallengeSpawnImpulse)
    });
    this.currentShapes = [this.activeShape];
    this.activeShapeIndex = 0;
  }

  spawnDoublePair() {
    this.clearPendingDuoSpawn();
    this.remainingObjectsInDoublePair = 2;
    this.currentChallengePhase = this.currentPhase;

    const firstShape = this.createDoubleShape({
      x: this.scaler.x(GAME_CONFIG.designWidth * 0.27),
      velocityX: this.scaler.x(GAME_CONFIG.level7HorizontalImpulse),
      state: "active"
    });
    this.currentShapes = [firstShape];
    this.activeShape = firstShape;
    this.activeShapeIndex = 0;
    this.scheduleSecondDoubleObject();
  }

  spawnDoubleObject() {
    this.currentChallengePhase = this.currentPhase;
    const nextShape = this.createDoubleShape({
      x: this.scaler.x(GAME_CONFIG.designWidth * 0.73),
      velocityX: this.scaler.x(-GAME_CONFIG.level7HorizontalImpulse),
      state: "active"
    });
    this.currentShapes = [nextShape];
    this.activeShape = nextShape;
    this.activeShapeIndex = 0;
  }

  createDoubleShape({ x, velocityX, state }) {
    return new FallingShape({
      x,
      y: this.scaler.y(GAME_CONFIG.designHeight + 42),
      radius: this.scaler.x(GAME_CONFIG.shapeRadius),
      colorId: getRandomItem(AVAILABLE_COLOR_IDS),
      shapeName: getRandomItem(AVAILABLE_SHAPES),
      velocityX,
      velocityY: this.scaler.y(this.currentChallengeSpawnImpulse),
      state
    });
  }

  scheduleSecondDoubleObject() {
    if (!this.currentChallengePhase?.usesDoubleMode || this.currentShapes[1]) return;

    this.clearPendingDuoSpawn();
    this.secondDuoShapeTimeoutId = window.setTimeout(() => {
      if (!this.currentChallengePhase?.usesDoubleMode || this.currentShapes[1]) return;

      this.currentShapes.push(this.createDoubleShape({
        x: this.scaler.x(GAME_CONFIG.designWidth * 0.73),
        velocityX: this.scaler.x(-GAME_CONFIG.level7HorizontalImpulse),
        state: "inactive"
      }));
      this.secondDuoShapeTimeoutId = null;
    }, GAME_CONFIG.doubleSecondShapeDelayMs);
  }

  activateNextDoubleObject() {
    this.clearPendingDuoSpawn();
    const waitingShape = this.currentShapes.find((shape) => shape.state === "inactive");
    const nextShape = waitingShape || this.createDoubleShape({
      x: this.scaler.x(GAME_CONFIG.designWidth * 0.73),
      velocityX: this.scaler.x(-GAME_CONFIG.level7HorizontalImpulse),
      state: "inactive"
    });

    if (!waitingShape) {
      this.currentShapes.push(nextShape);
    }

    nextShape.state = "active";
    this.activeShape = nextShape;
    this.activeShapeIndex = this.currentShapes.indexOf(nextShape);
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

    this.currentShapes = [firstShape];
    this.activeShape = firstShape;
    this.activeShapeIndex = 0;

    this.secondDuoShapeTimeoutId = window.setTimeout(() => {
      if (this.state !== "playing" || !this.activeChallengeUsesDuoShapes) return;

      const secondShape = this.createDuoShape({
        x: this.scaler.x(GAME_CONFIG.designWidth * 0.73),
        y: this.scaler.y(GAME_CONFIG.designHeight + 42),
        velocityX: this.scaler.x(-GAME_CONFIG.level7HorizontalImpulse),
        velocityY: this.scaler.y(GAME_CONFIG.spawnImpulse * GAME_CONFIG.level7SpawnImpulseMultiplier),
        state: "inactive"
      });

      this.currentShapes.push(secondShape);
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

  resolveReceiverTouch(resolvedShape, touchedReceiver) {
    const challengePhase = this.currentChallengePhase || this.currentPhase;
    const validationPhase = this.getPhaseWithCurrentWallColors(challengePhase);
    const expectedReceiver = this.rules.getExpectedReceiver(resolvedShape, validationPhase);
    const isCorrectReceiver = touchedReceiver.id === expectedReceiver.id;

    this.particleSystem.createBurst(
      resolvedShape.x,
      resolvedShape.y,
      this.arena.getReceiverNeonColor(touchedReceiver, validationPhase),
      isCorrectReceiver
    );

    if (!isCorrectReceiver) {
      this.endGame("GAME OVER");
      return;
    }

    resolvedShape.state = "resolved";
    this.score += 1;

    if (challengePhase.usesDoubleMode) {
      this.handleResolvedDoubleObject(challengePhase);
      return;
    }

    this.dynamicRuleSequence.consumeSuccessfulAnswer(challengePhase, this.currentPhase);
    this.memoryMode.consumeSuccessfulAnswer(challengePhase);
    const didRuleChange = this.currentRuleName !== challengePhase.ruleName;

    if (challengePhase.usesDuoShapes) {
      this.finishDuoIfResolved(didRuleChange, challengePhase);
      return;
    }

    this.continueAfterResolvedChallenge(didRuleChange, challengePhase);
  }

  handleResolvedDoubleObject(resolvedChallengePhase) {
    this.remainingObjectsInDoublePair = Math.max(this.remainingObjectsInDoublePair - 1, 0);

    if (this.shouldStartDoubleIntro(resolvedChallengePhase)) {
      this.startDoubleIntro();
      return;
    }

    if (this.remainingObjectsInDoublePair > 0) {
      this.activateNextDoubleObject();
      return;
    }

    if (this.hasCompletedDoubleMode) {
      this.showUpcomingSurvivalMode();
      return;
    }

    this.switchDoubleRule();
    this.showRuleTransitionFeedback(this.doubleRuleName);

    if (this.phasePermutesReceiversAfterSuccess(resolvedChallengePhase)) {
      this.startReceiverPermutation(resolvedChallengePhase);
      return;
    }

    this.spawnNextChallenge();
  }

  switchDoubleRule() {
    this.doubleRuleName = this.doubleRuleName === "COLOR" ? "SHAPE" : "COLOR";
  }

  updateDuoShapes(deltaSeconds) {
    if (this.currentShapes.length === 0) return;

    this.currentShapes.forEach((shape) => {
      if (shape.state !== "resolved") {
        shape.update(deltaSeconds, this.currentGravity);
      }
    });

    for (const shape of this.currentShapes) {
      const touchedReceiver = this.arena.findReceiverHitByShape(shape);
      if (touchedReceiver) {
        this.resolveReceiverTouch(shape, touchedReceiver);
        return;
      }

      if (shape.state !== "resolved" && shape.state !== "inactive" && shape.isBelowScreen(this.scaler.canvasHeight, this.scaler.y(28))) {
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

  continueAfterResolvedChallenge(shouldStartRuleTransition, resolvedChallengePhase = this.currentChallengePhase || this.currentPhase) {
    if (!this.currentPhaseUsesReceiverRotation) {
      this.stopReceiverRotations();
    }

    if (shouldStartRuleTransition) {
      this.showRuleTransitionFeedback(this.currentRuleName);
    }

    if (this.shouldStartLevelIntro(resolvedChallengePhase)) {
      this.startLevelIntro();
      return;
    }

    if (this.shouldStartStroopIntro(resolvedChallengePhase)) {
      this.startStroopIntro();
      return;
    }

    if (this.shouldStartMemoryIntro(resolvedChallengePhase)) {
      this.startMemoryIntro();
      return;
    }

    if (this.shouldStartDoubleIntro(resolvedChallengePhase)) {
      this.startDoubleIntro();
      return;
    }

    if (this.shouldStartMemoryRevealBeforeNextChallenge()) {
      this.startMemoryReveal();
      return;
    }

    if (this.phasePermutesReceiversAfterSuccess(resolvedChallengePhase)) {
      this.startReceiverPermutation(resolvedChallengePhase);
      return;
    }

    this.spawnNextChallenge();
  }

  startRuleTransition(nextRuleName) {
    this.showRuleTransitionFeedback(nextRuleName);
    this.spawnNextChallenge();
  }

  showRuleTransitionFeedback(nextRuleName) {
    navigator.vibrate?.(50);
    this.showCenterMessage(nextRuleName, GAME_CONFIG.ruleTransitionFeedbackDurationMs);
  }

  clearPendingDuoSpawn() {
    if (this.secondDuoShapeTimeoutId === null) return;

    window.clearTimeout(this.secondDuoShapeTimeoutId);
    this.secondDuoShapeTimeoutId = null;
  }

  resetWallColorMechanics() {
    this.receiverPermutation.reset();
    this.receiverColorRotation.reset();
    this.receiverShapeRotation.reset();
    this.pendingReceiverPermutationAction = "nextChallenge";
  }

  stopWallColorMechanics() {
    this.receiverPermutation.reset();
    this.receiverColorRotation.reset();
    this.receiverShapeRotation.reset();
    this.pendingReceiverPermutationAction = "nextChallenge";
  }

  stopReceiverRotations() {
    this.receiverColorRotation.stop();
    this.receiverShapeRotation.stop();
  }

  resetLevelIntroFlags() {
    this.hasPlayedLevel11Intro = false;
    this.hasPlayedLevel12Intro = false;
    this.hasPlayedLevel13Intro = false;
    this.levelIntroEndsAt = 0;
    this.level13IntroStartedAt = 0;
    this.hasStartedLevel13ShapeIntroRotation = false;
    this.hasPlayedStroopIntro = false;
    this.hasPlayedMemoryIntro = false;
    this.hasPlayedDoubleIntro = false;
  }

  resetDoubleMode() {
    this.clearPendingDuoSpawn();
    this.doubleRuleName = "COLOR";
    this.remainingObjectsInDoublePair = 0;
    this.pendingReceiverPermutationAction = "nextChallenge";
  }

  updateReceiverPermutation(currentTime) {
    const didFinishPermutation = this.receiverPermutation.update(currentTime);
    if (!didFinishPermutation || this.state !== "receiverPermutation") return;

    const nextAction = this.pendingReceiverPermutationAction;
    this.pendingReceiverPermutationAction = "nextChallenge";
    this.state = "playing";

    if (nextAction === "doubleObject") {
      this.activateNextDoubleObject();
      return;
    }

    this.spawnNextChallenge();
  }

  startReceiverPermutation(permutationPhase, options = {}) {
    this.pendingReceiverPermutationAction = options.afterPermutation || "nextChallenge";
    const shouldKeepWaitingDoubleObject = this.pendingReceiverPermutationAction === "doubleObject";

    this.clearPendingDuoSpawn();

    if (shouldKeepWaitingDoubleObject && !this.currentShapes.some((shape) => shape.state === "inactive")) {
      this.currentShapes.push(this.createDoubleShape({
        x: this.scaler.x(GAME_CONFIG.designWidth * 0.73),
        velocityX: this.scaler.x(-GAME_CONFIG.level7HorizontalImpulse),
        state: "inactive"
      }));
    }

    this.state = "receiverPermutation";
    this.activeShape = null;
    this.currentShapes = shouldKeepWaitingDoubleObject ? this.currentShapes : [];
    this.activeShapeIndex = null;
    this.currentChallengePhase = shouldKeepWaitingDoubleObject ? this.currentPhase : null;
    this.receiverPermutation.startPermutation(performance.now(), permutationPhase);
  }

  updateLevelIntro(currentTime) {
    if (this.state === "level11Intro") {
      this.receiverColorRotation.update(currentTime, true);
    } else if (this.state === "level12Intro") {
      this.receiverShapeRotation.update(currentTime, true);
    } else if (this.state === "level13Intro") {
      this.updateLevel13IntroDemo(currentTime);
    }

    if (currentTime < this.levelIntroEndsAt) return;

    if (this.state === "level13Intro") {
      this.dynamicRuleSequence.forceNewSequence(this.currentPhase);
    }

    if (this.state === "memoryIntro") {
      this.startMemoryReveal();
      return;
    }

    this.state = "playing";
    this.spawnNextChallenge();
  }

  updateLevel13IntroDemo(currentTime) {
    const elapsedIntroMs = currentTime - this.level13IntroStartedAt;
    const shapeDemoStartsAt = GAME_CONFIG.level13IntroDurationMs / 2;

    if (elapsedIntroMs < shapeDemoStartsAt) {
      this.receiverColorRotation.update(currentTime, true);
      this.receiverShapeRotation.stop();
      return;
    }

    this.receiverColorRotation.stop();

    if (!this.hasStartedLevel13ShapeIntroRotation) {
      this.receiverShapeRotation.start(currentTime);
      this.receiverShapeRotation.rotateClockwise(currentTime);
      this.hasStartedLevel13ShapeIntroRotation = true;
    }

    this.receiverShapeRotation.update(currentTime, true);
  }

  startLevelIntro() {
    const introStartedAt = performance.now();
    const introPhase = this.currentPhase;

    this.clearPendingDuoSpawn();
    this.stopReceiverRotations();
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.currentChallengePhase = null;

    if (introPhase.level === 11) {
      this.receiverColorRotation.start(introStartedAt);
      this.receiverColorRotation.rotateClockwise(introStartedAt);
      this.hasPlayedLevel11Intro = true;
      this.levelIntroEndsAt = introStartedAt + GAME_CONFIG.level11IntroDurationMs;
      this.state = "level11Intro";
      return;
    }

    if (introPhase.level === 12) {
      this.receiverShapeRotation.start(introStartedAt);
      this.receiverShapeRotation.rotateClockwise(introStartedAt);
      this.hasPlayedLevel12Intro = true;
      this.levelIntroEndsAt = introStartedAt + GAME_CONFIG.level12IntroDurationMs;
      this.state = "level12Intro";
      return;
    }

    this.receiverColorRotation.start(introStartedAt);
    this.receiverColorRotation.rotateClockwise(introStartedAt);
    this.hasPlayedLevel13Intro = true;
    this.hasStartedLevel13ShapeIntroRotation = false;
    this.level13IntroStartedAt = introStartedAt;
    this.levelIntroEndsAt = introStartedAt + GAME_CONFIG.level13IntroDurationMs;
    this.state = "level13Intro";
  }

  startStroopIntro() {
    const introStartedAt = performance.now();

    this.clearPendingDuoSpawn();
    this.stopReceiverRotations();
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.currentChallengePhase = null;
    this.hasPlayedStroopIntro = true;
    this.levelIntroEndsAt = introStartedAt + GAME_CONFIG.stroopIntroDurationMs;
    this.state = "stroopIntro";
  }

  startMemoryIntro() {
    const introStartedAt = performance.now();

    this.clearPendingDuoSpawn();
    this.stopReceiverRotations();
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.currentChallengePhase = null;
    this.hasPlayedMemoryIntro = true;
    this.levelIntroEndsAt = introStartedAt + GAME_CONFIG.memoryIntroDurationMs;
    this.state = "memoryIntro";
  }

  startDoubleIntro() {
    const introStartedAt = performance.now();

    this.clearPendingDuoSpawn();
    this.stopReceiverRotations();
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.currentChallengePhase = null;
    this.hasPlayedDoubleIntro = true;
    this.levelIntroEndsAt = introStartedAt + GAME_CONFIG.doubleIntroDurationMs;
    this.state = "doubleIntro";
  }

  startMemoryReveal() {
    this.clearPendingDuoSpawn();
    this.stopReceiverRotations();
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.currentChallengePhase = null;
    this.memoryMode.startSeries(this.currentPhase, performance.now());
    this.state = "memoryReveal";
  }

  updateMemoryReveal(currentTime) {
    if (currentTime < this.memoryMode.revealEndsAt) return;

    this.state = "playing";
    this.spawnNextChallenge();
  }

  updateReceiverRotations(currentTime) {
    this.receiverColorRotation.update(currentTime, this.shouldRunReceiverColorRotation, "clockwise");
    this.receiverShapeRotation.update(currentTime, this.shouldRunReceiverShapeRotation, this.receiverShapeRotationDirection);
  }

  throwActiveShapeFromSwipe(swipeGesture) {
    if (!this.activeShape || !this.activeShape.canReceiveSwipe || swipeGesture.distance < this.scaler.x(GAME_CONFIG.minSwipeDistance)) return;

    const targetReceiverId = this.inferReceiverIdFromSwipe(swipeGesture.deltaX, swipeGesture.deltaY);
    this.throwActiveShapeAtTarget(targetReceiverId, swipeGesture.distance, swipeGesture.durationMs);
  }

  throwActiveShapeAtTarget(target, gestureDistance = this.scaler.x(120), gestureDurationMs = 110) {
    if (!this.canReceiveInput() || !this.activeShape || !this.activeShape.canReceiveSwipe) return;

    const direction = this.resolveThrowDirection(target);
    if (!direction) return;

    const throwForce = this.calculateThrowForce(direction, gestureDistance, gestureDurationMs);
    this.activeShape.throwToward(direction, throwForce, this.activeChallengeUsesDuoShapes);
    this.activateNextDuoShape();
  }

  activateNextDuoShape() {
    if (!this.activeChallengeUsesDuoShapes) return;

    if (this.activeShapeIndex === 0 && this.currentShapes[1]) {
      this.currentShapes[1].state = "active";
      this.activeShapeIndex = 1;
      this.activeShape = this.currentShapes[1];
      return;
    }

    if (this.activeShapeIndex === 1) {
      this.activeShapeIndex = null;
      this.activeShape = null;
    }
  }

  resolveThrowDirection(target) {
    const basicDirections = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };

    if (basicDirections[target]) return basicDirections[target];

    const receiver = this.arena.findReceiverById(target);
    if (!receiver || !this.activeShape) return null;

    const aimPoint = this.arena.getReceiverAimPoint(receiver);
    return {
      x: aimPoint.x - this.activeShape.x,
      y: aimPoint.y - this.activeShape.y
    };
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

  inferReceiverIdFromSwipe(deltaX, deltaY) {
    const isSwipeGoingUp = deltaY < 0;
    const isSwipeGoingLeft = deltaX < 0;

    if (isSwipeGoingUp && isSwipeGoingLeft) return "topLeft";
    if (isSwipeGoingUp) return "topRight";
    if (isSwipeGoingLeft) return "bottomLeft";
    return "bottomRight";
  }

  canReceiveInput() {
    return this.state === "playing";
  }

  isWaitingToStart() {
    return this.state === "waiting";
  }

  startOrRestartFromKeyboard() {
    if (this.state === "waiting" || this.state === "ended") {
      this.reset();
    }
  }

  endGame(message) {
    this.clearPendingDuoSpawn();
    this.stopWallColorMechanics();
    this.memoryMode.reset();
    this.resetDoubleMode();
    this.state = "ended";
    this.centerMessage = message;
    this.centerMessageUntil = Infinity;
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.currentChallengePhase = null;
    this.restartButton.classList.add("is-visible");
  }

  showUpcomingSurvivalMode() {
    this.clearPendingDuoSpawn();
    this.stopWallColorMechanics();
    this.resetDoubleMode();
    this.state = "ended";
    this.centerMessage = "SURVIVAL MIX\nCOMING NEXT";
    this.centerMessageUntil = Infinity;
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.currentChallengePhase = null;
    this.restartButton.classList.add("is-visible");
  }

  showCenterMessage(message, durationMs) {
    this.centerMessage = message;
    this.centerMessageUntil = performance.now() + durationMs;
  }

  draw(currentTime) {
    this.context.clearRect(0, 0, this.scaler.canvasWidth, this.scaler.canvasHeight);
    this.drawBackground();
    this.arena.draw(this.context, this.visiblePhase, this.wallColorAnimationState);

    this.drawHud();
    this.drawActiveShape();
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
    this.context.font = `900 ${this.scaler.x(52)}px ui-sans-serif, system-ui`;
    this.context.fillText(String(this.score).padStart(2, "0"), this.scaler.canvasWidth / 2, this.scaler.y(42));

    this.context.shadowBlur = this.scaler.x(3);
    this.context.font = `800 ${this.scaler.x(15)}px ui-sans-serif, system-ui`;
    this.context.textAlign = "right";
    this.context.fillText(`LEVEL ${this.currentLevel}`, this.scaler.x(512), this.scaler.y(38));
    this.context.restore();
  }

  drawActiveShape() {
    const visibleShapes = this.activeChallengeUsesMultipleVisibleShapes ? this.currentShapes : [this.activeShape].filter(Boolean);

    visibleShapes
      .filter((shape) => shape.state !== "resolved")
      .forEach((shape) => {
        if (this.currentChallengePhase?.usesStroopChallenge) {
          this.drawMovingStroopWord(shape);
          return;
        }

        this.context.save();
        this.context.globalAlpha = shape.state === "inactive" ? 0.7 : 1;
        ShapeRenderer.draw(
          this.context,
          { x: shape.x, y: shape.y },
          shape.shapeName,
          NEON_COLORS[shape.colorId],
          this.scaler.x(shape.state === "active" ? GAME_CONFIG.shapeRadius * 1.08 : GAME_CONFIG.shapeRadius)
        );
        this.context.restore();
      });
  }

  drawMovingStroopWord(shape) {
    const wordText = shape.stroopWordColorId.toUpperCase();
    const inkColor = NEON_COLORS[shape.stroopInkColorId];

    this.context.save();
    this.context.globalAlpha = shape.state === "inactive" ? 0.7 : 1;
    this.context.fillStyle = inkColor;
    this.context.shadowColor = inkColor;
    this.context.shadowBlur = this.scaler.x(16);
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.font = `900 ${this.scaler.x(42)}px ui-sans-serif, system-ui`;
    this.context.letterSpacing = `${this.scaler.x(5)}px`;
    this.context.fillText(wordText, shape.x, shape.y);
    this.context.restore();
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

  drawCenterLabel(currentTime) {
    if (this.state === "memoryReveal") {
      this.drawMemoryCountdown(currentTime);
      return;
    }

    if (this.isShowingLevelIntro) {
      this.drawLevelIntroLabel();
      return;
    }

    const shouldShowTemporaryMessage = currentTime < this.centerMessageUntil || this.state === "ended" || this.state === "waiting";
    const label = shouldShowTemporaryMessage ? this.centerMessage : this.visibleRuleName;
    const isRuleLabel = label === "COLOR" || label === "SHAPE" || label === "WORD" || label === "INK";
    const isStartLabel = this.state === "waiting";
    const isTemporaryRuleFeedback = isRuleLabel && shouldShowTemporaryMessage && !isStartLabel;
    const labelSize = isStartLabel ? 21 : (isRuleLabel ? 50 : 35);
    const shadowBlur = isTemporaryRuleFeedback ? 22 : (isStartLabel ? 24 : (isRuleLabel ? 0 : 18));

    this.context.save();
    this.context.globalAlpha = isStartLabel ? 0.82 : 1;
    this.context.fillStyle = isTemporaryRuleFeedback ? "#f8fbff" : (isRuleLabel ? "#8f98a8" : "#eef4ff");
    this.context.shadowColor = isTemporaryRuleFeedback ? "rgba(255, 255, 255, 0.95)" : (isRuleLabel ? "transparent" : "rgba(255, 255, 255, 0.95)");
    this.context.shadowBlur = this.scaler.x(shadowBlur);
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.font = `900 ${this.scaler.x(labelSize)}px ui-sans-serif, system-ui`;
    this.context.letterSpacing = `${this.scaler.x(isRuleLabel ? 13 : (isStartLabel ? 10 : 4))}px`;
    this.drawCenterTextLines(String(label).split("\n"), this.getCenterLabelY(isRuleLabel), this.scaler.y(44));
    this.context.restore();
  }

  drawCenterTextLines(lines, centerY, lineGap) {
    lines.forEach((line, index) => {
      const lineOffset = index - (lines.length - 1) / 2;
      this.context.fillText(line, this.scaler.canvasWidth / 2, centerY + lineOffset * lineGap);
    });
  }

  drawMemoryCountdown(currentTime) {
    const remainingMs = Math.max(this.memoryMode.revealEndsAt - currentTime, 0);
    const countdownValue = Math.max(1, Math.ceil(remainingMs / 1000));
    const instructionText = this.memoryCountdownInstructionText;

    this.context.save();
    this.context.fillStyle = "#f8fbff";
    this.context.shadowColor = "rgba(255, 255, 255, 0.95)";
    this.context.shadowBlur = this.scaler.x(18);
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.font = `900 ${this.scaler.x(24)}px ui-sans-serif, system-ui`;
    this.context.letterSpacing = `${this.scaler.x(4)}px`;
    this.context.fillText(instructionText, this.scaler.canvasWidth / 2, this.scaler.canvasHeight / 2 - this.scaler.y(78));

    this.context.shadowBlur = this.scaler.x(22);
    this.context.font = `900 ${this.scaler.x(72)}px ui-sans-serif, system-ui`;
    this.context.letterSpacing = "0px";
    this.context.fillText(String(countdownValue), this.scaler.canvasWidth / 2, this.scaler.canvasHeight / 2);
    this.context.restore();
  }

  get memoryCountdownInstructionText() {
    if (this.currentLevel === 18) return "MEMORIZE COLORS";
    if (this.currentLevel === 19) return "MEMORIZE SHAPES";
    return "MEMORIZE BOTH";
  }

  drawLevelIntroLabel() {
    const lines = this.levelIntroLines;
    const centerY = this.scaler.canvasHeight / 2 - this.scaler.y(28);
    const lineGap = this.scaler.y(52);

    this.context.save();
    this.context.fillStyle = "#f8fbff";
    this.context.shadowColor = "rgba(255, 255, 255, 0.92)";
    this.context.shadowBlur = this.scaler.x(18);
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    lines.forEach((line, index) => {
      const isTitle = index === 0;
      this.context.font = `900 ${this.scaler.x(isTitle ? 38 : 28)}px ui-sans-serif, system-ui`;
      this.context.letterSpacing = `${this.scaler.x(isTitle ? 5 : 3)}px`;
      this.context.fillText(line, this.scaler.canvasWidth / 2, centerY + (index - 1) * lineGap);
    });

    if (this.state === "level13Intro") {
      const elapsedIntroMs = performance.now() - this.level13IntroStartedAt;
      const activeRuleLabel = elapsedIntroMs < GAME_CONFIG.level13IntroDurationMs / 2 ? "COLOR" : "SHAPE";
      this.context.font = `900 ${this.scaler.x(24)}px ui-sans-serif, system-ui`;
      this.context.letterSpacing = `${this.scaler.x(8)}px`;
      this.context.fillText(activeRuleLabel, this.scaler.canvasWidth / 2, centerY + lineGap * 1.9);
    }

    this.context.restore();
  }

  getCenterLabelY(isRuleLabel) {
    if (this.state === "ended") {
      return this.scaler.canvasHeight / 2 - this.scaler.y(58);
    }

    const ruleName = this.visibleRuleName;

    if (ruleName === "WORD" || ruleName === "INK") {
      return this.scaler.y(390);
    }

    return this.scaler.y(isRuleLabel ? 486 : 376);
  }

  get visiblePhase() {
    const phaseWithCurrentLayouts = this.getPhaseWithCurrentWallColors(this.currentChallengePhase || this.currentPhase);
    return this.memoryMode.getVisiblePhase(phaseWithCurrentLayouts, this.state === "memoryReveal");
  }

  get visibleRuleName() {
    return this.visiblePhase.ruleName;
  }

  get wallColorAnimationState() {
    return this.receiverPermutation.animationState || this.receiverRotationAnimationState;
  }

  get receiverRotationAnimationState() {
    const previousColorsByPositionId = this.receiverColorRotation.previousValues;
    const previousShapesByPositionId = this.receiverShapeRotation.previousValues;

    if (!previousColorsByPositionId && !previousShapesByPositionId) return null;

    const colorRotationProgress = previousColorsByPositionId ? this.receiverColorRotation.animationProgress : 0;
    const shapeRotationProgress = previousShapesByPositionId ? this.receiverShapeRotation.animationProgress : 0;

    return {
      previousColorsByPositionId,
      previousShapesByPositionId,
      progress: Math.max(colorRotationProgress, shapeRotationProgress)
    };
  }

  getPhaseWithCurrentWallColors(phase) {
    const memoryPhase = this.memoryMode.getPhaseWithMemoryLayout(phase);
    const receiverPermutationPhase = this.receiverPermutation.getPhaseWithCurrentPermutation(memoryPhase);

    return {
      ...receiverPermutationPhase,
      receiverColorsByPositionId: this.phaseUsesReceiverColorRotationLayout(receiverPermutationPhase)
        ? this.receiverColorRotation.currentValuesByPositionId
        : receiverPermutationPhase.receiverColorsByPositionId,
      receiverShapesByPositionId: this.phaseUsesReceiverShapeRotationLayout(receiverPermutationPhase)
        ? this.receiverShapeRotation.currentValuesByPositionId
        : receiverPermutationPhase.receiverShapesByPositionId
    };
  }

  get activeChallengeUsesDuoShapes() {
    return Boolean((this.currentChallengePhase || this.currentPhase).usesDuoShapes);
  }

  get activeChallengeUsesMultipleVisibleShapes() {
    const challengePhase = this.currentChallengePhase || this.currentPhase;
    return Boolean(challengePhase.usesDuoShapes || challengePhase.usesDoubleMode);
  }

  get currentChallengeSpawnImpulse() {
    return ChallengePhysics.getSpawnImpulse(this.currentChallengePhase || this.currentPhase);
  }

  phasePermutesReceiversAfterSuccess(phase) {
    return Boolean(phase?.permutesReceiverColorsAfterSuccess || phase?.permutesReceiverShapesAfterSuccess);
  }

  shouldStartLevelIntro(resolvedChallengePhase) {
    const nextLevel = this.currentPhase.level;
    const previousLevel = resolvedChallengePhase?.level;

    if (previousLevel === nextLevel) return false;
    if (nextLevel === 11) return !this.hasPlayedLevel11Intro;
    if (nextLevel === 12) return !this.hasPlayedLevel12Intro;
    if (nextLevel === 13) return !this.hasPlayedLevel13Intro;
    return false;
  }

  shouldStartStroopIntro(resolvedChallengePhase) {
    const nextLevel = this.currentPhase.level;
    const previousLevel = resolvedChallengePhase?.level;

    return (
      previousLevel !== nextLevel &&
      nextLevel === 15 &&
      !this.hasPlayedStroopIntro
    );
  }

  shouldStartMemoryIntro(resolvedChallengePhase) {
    const nextLevel = this.currentPhase.level;
    const previousLevel = resolvedChallengePhase?.level;

    return (
      previousLevel !== nextLevel &&
      nextLevel === 18 &&
      !this.hasPlayedMemoryIntro
    );
  }

  shouldStartMemoryRevealBeforeNextChallenge() {
    return this.memoryMode.shouldStartNewSeries(this.currentPhase);
  }

  shouldStartDoubleIntro(resolvedChallengePhase) {
    const nextLevel = this.currentPhase.level;
    const previousLevel = resolvedChallengePhase?.level;

    return (
      previousLevel !== nextLevel &&
      nextLevel === 21 &&
      !this.hasPlayedDoubleIntro
    );
  }

  phaseUsesReceiverColorRotation(phase) {
    return Boolean(
      phase.usesDynamicWallColors ||
      phase.usesSimultaneousReceiverRotations ||
      (phase.usesRuleControlledReceiverRotation && phase.ruleName === "COLOR")
    );
  }

  phaseUsesReceiverShapeRotation(phase) {
    return Boolean(
      phase.usesDynamicReceiverShapes ||
      phase.usesSimultaneousReceiverRotations ||
      (phase.usesRuleControlledReceiverRotation && phase.ruleName === "SHAPE")
    );
  }

  phaseUsesReceiverColorRotationLayout(phase) {
    return Boolean(phase.usesDynamicWallColors || phase.usesDynamicReceiverShapes || phase.usesRuleControlledReceiverRotation || phase.usesSimultaneousReceiverRotations);
  }

  phaseUsesReceiverShapeRotationLayout(phase) {
    return Boolean(phase.usesDynamicReceiverShapes || phase.usesRuleControlledReceiverRotation || phase.usesSimultaneousReceiverRotations);
  }

  get hasCompletedDoubleMode() {
    return this.score >= GAME_CONFIG.doubleEndScore;
  }

  get currentPhaseUsesReceiverRotation() {
    return this.phaseUsesReceiverColorRotation(this.currentPhase) || this.phaseUsesReceiverShapeRotation(this.currentPhase);
  }

  get shouldRunReceiverColorRotation() {
    return this.state === "playing" && this.phaseUsesReceiverColorRotation(this.visiblePhase);
  }

  get shouldRunReceiverShapeRotation() {
    return this.state === "playing" && this.phaseUsesReceiverShapeRotation(this.visiblePhase);
  }

  get receiverShapeRotationDirection() {
    return this.visiblePhase.usesSimultaneousReceiverRotations ? "counterclockwise" : "clockwise";
  }

  get isShowingLevelIntro() {
    return this.state === "level11Intro" || this.state === "level12Intro" || this.state === "level13Intro" || this.state === "stroopIntro" || this.state === "memoryIntro" || this.state === "doubleIntro";
  }

  get levelIntroLines() {
    if (this.state === "level12Intro") return ["LEVEL 12", "SHAPES ROTATE", "↻ CLOCKWISE"];
    if (this.state === "level13Intro") return ["LEVEL 13", "RULE CONTROLS", "THE ROTATION"];
    if (this.state === "stroopIntro") return ["DYNAMIC COMPLETE", "STROOP MODE"];
    if (this.state === "memoryIntro") return ["MEMORY MODE"];
    if (this.state === "doubleIntro") return ["DOUBLE MODE"];

    return ["LEVEL 11", "COLORS ROTATE", "↻ CLOCKWISE"];
  }

  get currentRuleName() {
    return this.currentPhase.ruleName;
  }

  get currentPhase() {
    const basePhase = this.rules.getCurrentPhase(this.score);

    if (basePhase.usesDoubleMode) {
      return {
        ...basePhase,
        ruleName: this.doubleRuleName
      };
    }

    return this.dynamicRuleSequence.getPhaseWithCurrentRule(basePhase);
  }

  get currentLevel() {
    return this.rules.getLevel(this.score);
  }

  get currentGravity() {
    return this.scaler.x(ChallengePhysics.getGravity(this.currentChallengePhase || this.currentPhase));
  }
}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
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
