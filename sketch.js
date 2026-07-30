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
  level7HorizontalImpulse: 64,
  level7SpawnImpulseMultiplier: 0.65, // 0.75
  ruleTransitionDurationMs: 700,
  level9StartScore: 55,
  level9EndScore: 62,
  level9WallRotationIntervalMs: 1000,
  level9WallRotationDurationMs: 180,
  level9GravityMultiplier: 0.55,
  level9SpawnImpulseMultiplier: 0.78
};

const DEFAULT_RECEIVER_COLORS_BY_POSITION_ID = {
  topLeft: "green",
  topRight: "red",
  bottomLeft: "blue",
  bottomRight: "yellow"
};

const PHASE_4_RECEIVER_COLORS_BY_POSITION_ID = {
  topLeft: "blue",
  topRight: "yellow",
  bottomLeft: "red",
  bottomRight: "green"
};

const PHASE_6_RECEIVER_COLORS_BY_POSITION_ID = {
  topLeft: "red",
  topRight: "green",
  bottomLeft: "yellow",
  bottomRight: "blue"
};

const LEVEL_9_INITIAL_RECEIVER_COLORS_BY_POSITION_ID = PHASE_6_RECEIVER_COLORS_BY_POSITION_ID;

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

const PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID = {
  topLeft: "circle",
  topRight: "square",
  bottomLeft: "star",
  bottomRight: "triangle"
};

const GAME_PHASES = [
  { level: 1, ruleName: "COLOR", startScore: 0, receiverColorsByPositionId: DEFAULT_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID },
  { level: 2, ruleName: "SHAPE", startScore: 5, receiverColorsByPositionId: DEFAULT_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID },
  { level: 3, ruleName: "COLOR", startScore: 12, receiverColorsByPositionId: DEFAULT_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID },
  { level: 4, ruleName: "COLOR", startScore: 19, receiverColorsByPositionId: PHASE_4_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: DEFAULT_RECEIVER_SHAPES_BY_POSITION_ID },
  { level: 5, ruleName: "SHAPE", startScore: 26, receiverColorsByPositionId: PHASE_4_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_5_RECEIVER_SHAPES_BY_POSITION_ID },
  { level: 6, ruleName: "COLOR", startScore: 33, receiverColorsByPositionId: PHASE_6_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID },
  { level: 7, ruleName: "COLOR", startScore: 40, receiverColorsByPositionId: PHASE_6_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDuoShapes: true },
  { level: 8, ruleName: "SHAPE", startScore: 48, receiverColorsByPositionId: PHASE_6_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDuoShapes: true },
  { level: 9, ruleName: "COLOR", startScore: GAME_CONFIG.level9StartScore, receiverColorsByPositionId: LEVEL_9_INITIAL_RECEIVER_COLORS_BY_POSITION_ID, receiverShapesByPositionId: PHASE_6_RECEIVER_SHAPES_BY_POSITION_ID, usesDynamicWallColors: true }
];

const NEON_COLORS = {
  green: "#39ff72",
  red: "#ff3048",
  blue: "#3192ff",
  yellow: "#ffbd3f"
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
      const previousColor = NEON_COLORS[wallColorAnimation.previousColorsByPositionId[receiver.id]];
      const currentColor = this.getReceiverNeonColor(receiver, currentPhase);
      this.drawReceiverTrack(context, receiver, currentPhase, previousColor, 1 - wallColorAnimation.progress);
      this.drawReceiverTrack(context, receiver, currentPhase, currentColor, wallColorAnimation.progress);
    });
  }

  drawReceiverIconsWithWallColorAnimation(context, currentPhase, wallColorAnimation) {
    const previousIconPhase = {
      ...currentPhase,
      receiverColorsByPositionId: wallColorAnimation.previousColorsByPositionId
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
      ShapeRenderer.draw(
        context,
        iconPositionsByReceiverId[receiver.id],
        this.getReceiverShapeName(receiver, currentPhase),
        this.getReceiverNeonColor(receiver, currentPhase),
        receiverIconRadius,
        opacity
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

    return this.arena.findReceiverByCurrentShape(fallingShape.shapeName, currentPhase);
  }
}

class Level9WallRotationController {
  constructor(initialReceiverColorsByPositionId) {
    this.initialReceiverColorsByPositionId = initialReceiverColorsByPositionId;
    this.reset();
  }

  reset() {
    this.currentReceiverColorsByPositionId = { ...this.initialReceiverColorsByPositionId };
    this.previousReceiverColorsByPositionId = null;
    this.isActive = false;
    this.lastWallRotationTime = 0;
    this.wallRotationStartedAt = 0;
    this.wallRotationProgress = 1;
  }

  stop() {
    this.isActive = false;
    this.previousReceiverColorsByPositionId = null;
    this.lastWallRotationTime = 0;
    this.wallRotationStartedAt = 0;
    this.wallRotationProgress = 1;
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

    if (currentTime - this.lastWallRotationTime >= GAME_CONFIG.level9WallRotationIntervalMs) {
      this.rotateClockwise(currentTime);
    }
  }

  start(currentTime) {
    this.isActive = true;
    this.currentReceiverColorsByPositionId = { ...this.initialReceiverColorsByPositionId };
    this.previousReceiverColorsByPositionId = null;
    this.lastWallRotationTime = currentTime;
    this.wallRotationStartedAt = 0;
    this.wallRotationProgress = 1;
  }

  updateAnimationProgress(currentTime) {
    if (this.wallRotationProgress >= 1) return;

    const elapsedRotationMs = currentTime - this.wallRotationStartedAt;
    this.wallRotationProgress = clamp(elapsedRotationMs / GAME_CONFIG.level9WallRotationDurationMs, 0, 1);

    if (this.wallRotationProgress === 1) {
      this.previousReceiverColorsByPositionId = null;
    }
  }

  rotateClockwise(currentTime) {
    const previousReceiverColorsByPositionId = { ...this.currentReceiverColorsByPositionId };
    const nextReceiverColorsByPositionId = {};

    Object.entries(CLOCKWISE_RECEIVER_ROTATION_BY_POSITION_ID).forEach(([fromReceiverId, toReceiverId]) => {
      nextReceiverColorsByPositionId[toReceiverId] = previousReceiverColorsByPositionId[fromReceiverId];
    });

    this.previousReceiverColorsByPositionId = previousReceiverColorsByPositionId;
    this.currentReceiverColorsByPositionId = nextReceiverColorsByPositionId;
    this.wallRotationStartedAt = currentTime;
    this.lastWallRotationTime = currentTime;
    this.wallRotationProgress = 0;
  }

  getPhaseWithCurrentColors(phase) {
    if (!phase.usesDynamicWallColors) return phase;

    return {
      ...phase,
      receiverColorsByPositionId: this.currentReceiverColorsByPositionId
    };
  }

  get animationState() {
    if (!this.previousReceiverColorsByPositionId || this.wallRotationProgress >= 1) return null;

    return {
      previousColorsByPositionId: this.previousReceiverColorsByPositionId,
      progress: this.wallRotationProgress
    };
  }
}

class ChallengePhysics {
  static getSpawnImpulse(challengePhase) {
    if (challengePhase.usesDynamicWallColors) {
      return GAME_CONFIG.spawnImpulse * GAME_CONFIG.level9SpawnImpulseMultiplier;
    }

    return GAME_CONFIG.spawnImpulse;
  }

  static getGravity(challengePhase) {
    if (challengePhase.usesDynamicWallColors) {
      return GAME_CONFIG.gravity * GAME_CONFIG.level9GravityMultiplier;
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
    this.level9WallRotation = new Level9WallRotationController(LEVEL_9_INITIAL_RECEIVER_COLORS_BY_POSITION_ID);
    this.particleSystem = new ParticleSystem(this.scaler);
    this.inputController = new InputController(this.canvas, this);

    this.score = 0;
    this.state = "ready";
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.secondDuoShapeTimeoutId = null;
    this.ruleTransitionTimeoutId = null;
    this.transitionRuleName = null;
    this.currentChallengePhase = null;
    this.lastAnimationTime = 0;
    this.centerMessage = "SWIPE";
    this.centerMessageUntil = 0;
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
    this.clearPendingRuleTransition();
    this.resetLevel9WallRotation();
    this.score = 0;
    this.state = "playing";
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
    this.clearPendingRuleTransition();
    this.resetLevel9WallRotation();
    this.score = 0;
    this.state = "waiting";
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
      this.updateLevel9WallRotation(currentTime);
      this.updateActiveShape(deltaSeconds);
    } else {
      this.updateLevel9WallRotation(currentTime);
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
    const validationPhase = this.getPhaseWithCurrentLevel9Colors(challengePhase);
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

    const didRuleChange = this.currentRuleName !== challengePhase.ruleName;

    if (challengePhase.usesDuoShapes) {
      this.finishDuoIfResolved(didRuleChange);
      return;
    }

    this.continueAfterResolvedChallenge(didRuleChange);
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

      if (shape.state !== "resolved" && shape.isBelowScreen(this.scaler.canvasHeight, this.scaler.y(28))) {
        this.endGame("GAME OVER");
        return;
      }
    }
  }

  finishDuoIfResolved(shouldStartRuleTransition) {
    const hasBothShapesSpawned = this.currentShapes.length === 2;
    const areBothShapesResolved = hasBothShapesSpawned && this.currentShapes.every((shape) => shape.state === "resolved");

    if (areBothShapesResolved) {
      this.continueAfterResolvedChallenge(shouldStartRuleTransition);
    }
  }

  continueAfterResolvedChallenge(shouldStartRuleTransition) {
    if (!this.isLevel9ScoreActive) {
      this.stopLevel9WallRotation();
    }

    if (shouldStartRuleTransition) {
      this.startRuleTransition(this.currentRuleName);
      return;
    }

    this.spawnNextChallenge();
  }

  startRuleTransition(nextRuleName) {
    this.stopLevel9WallRotation();

    this.clearPendingDuoSpawn();
    this.clearPendingRuleTransition();
    this.state = "transition";
    navigator.vibrate?.(50);
    this.activeShape = null;
    this.currentShapes = [];
    this.activeShapeIndex = null;
    this.currentChallengePhase = null;
    this.transitionRuleName = nextRuleName;
    this.centerMessage = nextRuleName;
    this.centerMessageUntil = Infinity;

    this.ruleTransitionTimeoutId = window.setTimeout(() => {
      if (this.state !== "transition" || this.transitionRuleName !== nextRuleName) return;

      this.ruleTransitionTimeoutId = null;
      this.transitionRuleName = null;
      this.state = "playing";
      this.showCenterMessage(nextRuleName, 0);
      this.spawnNextChallenge();
    }, GAME_CONFIG.ruleTransitionDurationMs);
  }

  clearPendingDuoSpawn() {
    if (this.secondDuoShapeTimeoutId === null) return;

    window.clearTimeout(this.secondDuoShapeTimeoutId);
    this.secondDuoShapeTimeoutId = null;
  }

  clearPendingRuleTransition() {
    if (this.ruleTransitionTimeoutId === null) return;

    window.clearTimeout(this.ruleTransitionTimeoutId);
    this.ruleTransitionTimeoutId = null;
    this.transitionRuleName = null;
  }

  resetLevel9WallRotation() {
    this.level9WallRotation.reset();
  }

  stopLevel9WallRotation() {
    this.level9WallRotation.stop();
  }

  updateLevel9WallRotation(currentTime) {
    this.level9WallRotation.update(currentTime, this.shouldRunLevel9WallRotation);
  }

  startLevel9WallRotation(currentTime) {
    this.level9WallRotation.rotateClockwise(currentTime);
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
    this.clearPendingRuleTransition();
    this.stopLevel9WallRotation();
    this.state = "ended";
    this.centerMessage = message;
    this.centerMessageUntil = Infinity;
    this.activeShape = null;
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

    if (this.state === "transition") {
      this.drawHud();
      this.drawCenterLabel(currentTime);
      return;
    }

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
    const visibleShapes = this.activeChallengeUsesDuoShapes ? this.currentShapes : [this.activeShape].filter(Boolean);

    visibleShapes
      .filter((shape) => shape.state !== "resolved")
      .forEach((shape) => {
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
    const shouldShowTemporaryMessage = currentTime < this.centerMessageUntil || this.state === "ended" || this.state === "waiting" || this.state === "transition";
    const label = this.state === "transition" ? this.transitionRuleName : (shouldShowTemporaryMessage ? this.centerMessage : this.visibleRuleName);
    const isRuleLabel = label === "COLOR" || label === "SHAPE";
    const isStartLabel = this.state === "waiting";
    const isTransitionLabel = this.state === "transition";
    const labelSize = isStartLabel ? 21 : (isRuleLabel ? 50 : 35);
    const shadowBlur = isTransitionLabel ? 22 : (isStartLabel ? 24 : (isRuleLabel ? 0 : 18));

    this.context.save();
    this.context.globalAlpha = isStartLabel ? 0.82 : 1;
    this.context.fillStyle = isTransitionLabel ? "#f8fbff" : (isRuleLabel ? "#8f98a8" : "#eef4ff");
    this.context.shadowColor = isTransitionLabel ? "rgba(255, 255, 255, 0.95)" : (isRuleLabel ? "transparent" : "rgba(255, 255, 255, 0.95)");
    this.context.shadowBlur = this.scaler.x(shadowBlur);
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.font = `900 ${this.scaler.x(labelSize)}px ui-sans-serif, system-ui`;
    this.context.letterSpacing = `${this.scaler.x(isRuleLabel ? 13 : (isStartLabel ? 10 : 4))}px`;
    this.context.fillText(label, this.scaler.canvasWidth / 2, this.getCenterLabelY(isRuleLabel));
    this.context.restore();
  }

  getCenterLabelY(isRuleLabel) {
    if (this.state === "ended") {
      return this.scaler.canvasHeight / 2 - this.scaler.y(58);
    }

    return this.scaler.y(isRuleLabel ? 486 : 376);
  }

  get visiblePhase() {
    return this.getPhaseWithCurrentLevel9Colors(this.currentChallengePhase || this.currentPhase);
  }

  get visibleRuleName() {
    return this.visiblePhase.ruleName;
  }

  get wallColorAnimationState() {
    return this.level9WallRotation.animationState;
  }

  get level9ReceiverColorsByPositionId() {
    return this.level9WallRotation.currentReceiverColorsByPositionId;
  }

  get level9PreviousReceiverColorsByPositionId() {
    return this.level9WallRotation.previousReceiverColorsByPositionId;
  }

  get isLevel9WallRotationActive() {
    return this.level9WallRotation.isActive;
  }

  get wallRotationProgress() {
    return this.level9WallRotation.wallRotationProgress;
  }

  getPhaseWithCurrentLevel9Colors(phase) {
    return this.level9WallRotation.getPhaseWithCurrentColors(phase);
  }

  get activeChallengeUsesDuoShapes() {
    return Boolean((this.currentChallengePhase || this.currentPhase).usesDuoShapes);
  }

  get currentChallengeUsesLevel9Physics() {
    return Boolean((this.currentChallengePhase || this.currentPhase).usesDynamicWallColors);
  }

  get currentChallengeSpawnImpulse() {
    return ChallengePhysics.getSpawnImpulse(this.currentChallengePhase || this.currentPhase);
  }

  get isLevel9ScoreActive() {
    return this.score >= GAME_CONFIG.level9StartScore && this.score < GAME_CONFIG.level9EndScore;
  }

  get shouldRunLevel9WallRotation() {
    return this.state === "playing" && this.isLevel9ScoreActive && Boolean(this.visiblePhase.usesDynamicWallColors);
  }

  get currentRuleName() {
    return this.rules.getCurrentRuleName(this.score);
  }

  get currentPhase() {
    return this.rules.getCurrentPhase(this.score);
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
