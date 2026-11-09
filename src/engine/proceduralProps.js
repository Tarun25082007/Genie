// Matter.js Rigid Body Prop Builder + Custom 16x16 Pixel Sprites + Tetris Shapes
import Matter from 'matter-js';
import { PIXEL_SPRITES } from '../data/themes.js';

const { Bodies, Body } = Matter;

const spriteCanvasCache = new Map();
const MAX_SPRITE_CANVAS_CACHE = 120;

/**
 * Converts a 16x16 or 24x24 string matrix into an offscreen HTMLCanvasElement
 */
export function getOffscreenPixelSprite(spriteKeyOrDef, pixelSize = 3) {
  let matrix;
  let palette;
  let cacheKey;

  if (typeof spriteKeyOrDef === 'string') {
    cacheKey = `${spriteKeyOrDef}_${pixelSize}`;
    if (spriteCanvasCache.has(cacheKey)) return spriteCanvasCache.get(cacheKey);

    const sprite = PIXEL_SPRITES[spriteKeyOrDef];
    if (!sprite) return null;
    matrix = sprite.matrix;
    palette = sprite.palette;
  } else if (spriteKeyOrDef && spriteKeyOrDef.matrix) {
    const matrixStr = Array.isArray(spriteKeyOrDef.matrix) ? spriteKeyOrDef.matrix.join('') : '';
    cacheKey = `${spriteKeyOrDef.name || 'custom'}_${matrixStr}_${pixelSize}`;
    if (spriteCanvasCache.has(cacheKey)) return spriteCanvasCache.get(cacheKey);
    matrix = spriteKeyOrDef.matrix;
    palette = spriteKeyOrDef.palette || {};
  } else {
    return null;
  }

  const rows = matrix.length;
  const cols = matrix[0]?.length || 16;

  const canvas = document.createElement('canvas');
  canvas.width = cols * pixelSize;
  canvas.height = rows * pixelSize;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  for (let r = 0; r < rows; r++) {
    const row = matrix[r];
    if (!row) continue;
    for (let c = 0; c < cols; c++) {
      const char = row[c];
      if (!char || char === '.') continue;
      const color = palette[char] || '#ffd166';
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  if (spriteCanvasCache.size >= MAX_SPRITE_CANVAS_CACHE) {
    const oldestKey = spriteCanvasCache.keys().next().value;
    if (oldestKey !== undefined) spriteCanvasCache.delete(oldestKey);
  }
  spriteCanvasCache.set(cacheKey, canvas);
  return canvas;
}

export const TETRIS_SHAPES = {
  TETRIS_I: {
    cells: [[0, 0], [1, 0], [2, 0], [3, 0]],
    color: '#00f5d4',
    border: '#00bbf9'
  },
  TETRIS_O: {
    cells: [[0, 0], [1, 0], [0, 1], [1, 1]],
    color: '#ffd166',
    border: '#ffb703'
  },
  TETRIS_T: {
    cells: [[1, 0], [0, 1], [1, 1], [2, 1]],
    color: '#9d4edd',
    border: '#7b2cbf'
  },
  TETRIS_L: {
    cells: [[2, 0], [0, 1], [1, 1], [2, 1]],
    color: '#f77f00',
    border: '#d62828'
  },
  TETRIS_Z: {
    cells: [[0, 0], [1, 0], [1, 1], [2, 1]],
    color: '#ef233c',
    border: '#d90429'
  }
};

export function createTetrisBody(shapeKey = 'TETRIS_T', x = 480, y = 90, tileSize = 20) {
  const shape = TETRIS_SHAPES[shapeKey] || TETRIS_SHAPES.TETRIS_T;
  const parts = shape.cells.map(([cx, cy]) => {
    return Bodies.rectangle(
      x + cx * tileSize,
      y + cy * tileSize,
      tileSize,
      tileSize,
      { render: { visible: false } }
    );
  });

  const compound = Body.create({
    parts,
    restitution: 0.15,
    friction: 0.8,
    density: 0.005,
    label: `tetris_${shapeKey}`
  });

  compound.customData = {
    propType: 'tetris',
    shape,
    tileSize
  };

  return compound;
}

/**
 * Builds Matter.js bodies according to SPAWN_OBJECT verb params & customPropDef
 */
export function createPropFromVerb(params = {}, customPropDef = null) {
  const bodies = [];
  const count = Math.max(1, Math.min(20, params.count ?? 1));
  const spreadX = params.spread_x ?? 40;
  const startX = params.x ?? 480;
  const startY = params.y ?? 90;

  const effectiveCustomProp = (params.custom_prop && params.custom_prop.matrix)
    ? params.custom_prop
    : (customPropDef && customPropDef.matrix ? customPropDef : null);

  for (let i = 0; i < count; i++) {
    const offsetX = count > 1 ? (i - (count - 1) / 2) * spreadX : 0;
    const rawX = startX + offsetX;
    const rawY = startY - i * 30;
    const rawProp = String(params.prop_type || 'CUSTOM_PROP').toUpperCase();
    let body;

    if (rawProp.startsWith('TETRIS_')) {
      const tileSize = (params.scale ?? 4) * 5;
      const clampedX = Math.max(80, Math.min(840, rawX));
      const clampedY = Math.max(60, Math.min(460, rawY));
      body = createTetrisBody(rawProp, clampedX, clampedY, tileSize);
    } else if (effectiveCustomProp && (rawProp === 'CUSTOM_PROP' || rawProp === 'CUSTOM' || !PIXEL_SPRITES[rawProp])) {
      // Whenever a custom prop is provided, render its unique 16x16 pixel sprite!
      const scale = params.scale ?? effectiveCustomProp.scale ?? 4.5;
      const w = 16 * scale;
      const h = 16 * scale;
      const clampedX = Math.max(36 + w / 2 + 4, Math.min(924 - w / 2 - 4, rawX));
      const clampedY = Math.max(36 + h / 2 + 4, Math.min(504 - h / 2 - 4, rawY));
      body = Bodies.rectangle(clampedX, clampedY, w, h, {
        mass: params.mass ?? effectiveCustomProp.mass ?? 350,
        restitution: params.restitution ?? effectiveCustomProp.restitution ?? 0.1,
        friction: 0.8,
        label: `prop_${(effectiveCustomProp.name || 'custom').toLowerCase()}`
      });
      body.customData = {
        propType: 'custom_sprite',
        customDef: effectiveCustomProp,
        scale,
        width: w,
        height: h
      };
    } else if (rawProp.includes('SANDWICH') || rawProp.includes('BLT') || rawProp.includes('SUB') || rawProp.includes('BURGER')) {
      const scale = params.scale ?? 4.5;
      const w = 18 * scale;
      const h = 16 * scale;
      const clampedX = Math.max(36 + w / 2 + 4, Math.min(924 - w / 2 - 4, rawX));
      const clampedY = Math.max(36 + h / 2 + 4, Math.min(504 - h / 2 - 4, rawY));
      body = Bodies.rectangle(clampedX, clampedY, w, h, {
        mass: params.mass ?? 400,
        restitution: 0.05,
        friction: 0.9,
        label: 'prop_sandwich'
      });
      body.customData = { propType: 'sandwich', width: w, height: h, spriteKey: 'GIANT_SANDWICH', scale };
    } else if (rawProp.includes('CAR') || rawProp.includes('VEHICLE') || rawProp.includes('AUTO')) {
      const scale = params.scale ?? 4;
      const w = 24 * scale;
      const h = 12 * scale;
      const clampedX = Math.max(36 + w / 2 + 4, Math.min(924 - w / 2 - 4, rawX));
      const clampedY = Math.max(36 + h / 2 + 4, Math.min(504 - h / 2 - 4, rawY));
      body = Bodies.rectangle(clampedX, clampedY, w, h, {
        mass: params.mass ?? 450,
        restitution: 0.2,
        friction: 0.7,
        label: 'prop_car'
      });
      body.customData = { propType: 'car', width: w, height: h, spriteKey: 'SPORTS_CAR', scale };
    } else if (rawProp.includes('BALLOON') || rawProp.includes('HELIUM')) {
      const scale = params.scale ?? 3.5;
      const r = 8 * scale;
      const clampedX = Math.max(36 + r + 4, Math.min(924 - r - 4, rawX));
      const clampedY = Math.max(36 + r + 4, Math.min(504 - r - 4, rawY));
      body = Bodies.circle(clampedX, clampedY, r, {
        mass: params.mass ?? 2,
        restitution: 0.6,
        frictionAir: 0.05,
        label: 'prop_balloon'
      });
      body.customData = { propType: 'balloon', radius: r, spriteKey: 'BALLOON', scale, buoyant: true };
    } else if (rawProp.includes('EXAM') || rawProp.includes('PAPER') || rawProp.includes('SHEET') || rawProp.includes('BOOK')) {
      const scale = params.scale ?? 3;
      const w = 16 * scale;
      const h = 18 * scale;
      const clampedX = Math.max(36 + w / 2 + 4, Math.min(924 - w / 2 - 4, rawX));
      const clampedY = Math.max(36 + h / 2 + 4, Math.min(504 - h / 2 - 4, rawY));
      body = Bodies.rectangle(clampedX, clampedY, w, h, {
        mass: params.mass ?? 1.5,
        frictionAir: 0.12,
        restitution: 0.2,
        label: 'prop_exam_sheet'
      });
      body.customData = { propType: 'exam_sheet', width: w, height: h, spriteKey: 'EXAM_SHEET', scale, flutter: true };
    } else if (rawProp.includes('DEER') || rawProp.includes('BUCK') || rawProp.includes('STAMPEDE') || rawProp.includes('STAG')) {
      const scale = params.scale ?? 3.5;
      const w = 18 * scale;
      const h = 16 * scale;
      const clampedX = Math.max(36 + w / 2 + 4, Math.min(924 - w / 2 - 4, rawX));
      const clampedY = Math.max(36 + h / 2 + 4, Math.min(504 - h / 2 - 4, rawY));
      body = Bodies.rectangle(clampedX, clampedY, w, h, {
        mass: params.mass ?? 180,
        restitution: 0.2,
        friction: 0.4,
        label: 'prop_deer'
      });
      body.customData = { propType: 'deer', width: w, height: h, spriteKey: 'HORNED_DEER', scale, charge: true };
    } else if (rawProp.includes('PIANO')) {
      const scale = params.scale ?? 4.5;
      const w = 22 * scale;
      const h = 16 * scale;
      const clampedX = Math.max(36 + w / 2 + 4, Math.min(924 - w / 2 - 4, rawX));
      const clampedY = Math.max(36 + h / 2 + 4, Math.min(504 - h / 2 - 4, rawY));
      body = Bodies.rectangle(clampedX, clampedY, w, h, {
        mass: params.mass ?? 550,
        restitution: 0.1,
        friction: 0.8,
        label: 'prop_piano'
      });
      body.customData = { propType: 'piano', width: w, height: h, spriteKey: 'GRAND_PIANO', scale };
    } else if (rawProp.includes('BELL')) {
      const scale = params.scale ?? 4.5;
      const w = 18 * scale;
      const h = 20 * scale;
      const clampedX = Math.max(36 + w / 2 + 4, Math.min(924 - w / 2 - 4, rawX));
      const clampedY = Math.max(36 + h / 2 + 4, Math.min(504 - h / 2 - 4, rawY));
      body = Bodies.rectangle(clampedX, clampedY, w, h, {
        mass: params.mass ?? 600,
        restitution: 0.15,
        friction: 0.85,
        label: 'prop_bell'
      });
      body.customData = { propType: 'bell', width: w, height: h, spriteKey: 'GIANT_BELL', scale };
    } else if (rawProp.includes('SARCOPHAGUS') || rawProp.includes('COFFIN') || rawProp.includes('TOMB')) {
      const scale = params.scale ?? 4.5;
      const w = 18 * scale;
      const h = 24 * scale;
      const clampedX = Math.max(36 + w / 2 + 4, Math.min(924 - w / 2 - 4, rawX));
      const clampedY = Math.max(36 + h / 2 + 4, Math.min(504 - h / 2 - 4, rawY));
      body = Bodies.rectangle(clampedX, clampedY, w, h, {
        mass: params.mass ?? 850,
        restitution: 0.05,
        friction: 0.9,
        label: 'prop_sarcophagus'
      });
      body.customData = { propType: 'sarcophagus', width: w, height: h, spriteKey: 'TUNGSTEN_SARCOPHAGUS', scale };
    } else if (rawProp.includes('SAFE') || rawProp.includes('VAULT') || rawProp.includes('CHEST')) {
      const scale = params.scale ?? 4.5;
      const w = 18 * scale;
      const h = 18 * scale;
      const clampedX = Math.max(36 + w / 2 + 4, Math.min(924 - w / 2 - 4, rawX));
      const clampedY = Math.max(36 + h / 2 + 4, Math.min(504 - h / 2 - 4, rawY));
      body = Bodies.rectangle(clampedX, clampedY, w, h, {
        mass: params.mass ?? 950,
        restitution: 0.05,
        friction: 0.95,
        label: 'prop_safe'
      });
      body.customData = { propType: 'safe', width: w, height: h, spriteKey: 'SAFE', scale };
    } else if (rawProp.includes('STATUE') || rawProp.includes('FRIEND') || rawProp.includes('MANNEQUIN') || rawProp.includes('GOLEM')) {
      const scale = params.scale ?? 4.5;
      const w = 18 * scale;
      const h = 26 * scale;
      const clampedX = Math.max(36 + w / 2 + 4, Math.min(924 - w / 2 - 4, rawX));
      const clampedY = Math.max(36 + h / 2 + 4, Math.min(504 - h / 2 - 4, rawY));
      body = Bodies.rectangle(clampedX, clampedY, w, h, {
        mass: params.mass ?? 650,
        restitution: 0.08,
        friction: 0.85,
        label: 'prop_statue'
      });
      body.customData = { propType: 'statue', width: w, height: h, spriteKey: 'STATUE_FRIEND', scale };
    } else if (rawProp.includes('METEOR') || rawProp.includes('ASTEROID') || rawProp.includes('ROCK') || rawProp.includes('BOULDER')) {
      const scale = params.scale ?? 4;
      const r = 10 * scale;
      const clampedX = Math.max(36 + r + 4, Math.min(924 - r - 4, rawX));
      const clampedY = Math.max(36 + r + 4, Math.min(504 - r - 4, rawY));
      body = Bodies.circle(clampedX, clampedY, r, {
        mass: params.mass ?? 320,
        restitution: 0.2,
        friction: 0.6,
        label: 'prop_meteor'
      });
      body.customData = { propType: 'meteor', radius: r, spriteKey: 'METEOR', scale };
    } else if (rawProp.includes('GOLD') || rawProp.includes('COIN') || rawProp.includes('BULLION') || rawProp.includes('CASH') || rawProp.includes('MONEY')) {
      const scale = params.scale ?? 3;
      const w = 16 * scale;
      const h = 8 * scale;
      const clampedX = Math.max(36 + w / 2 + 4, Math.min(924 - w / 2 - 4, rawX));
      const clampedY = Math.max(36 + h / 2 + 4, Math.min(504 - h / 2 - 4, rawY));
      body = Bodies.rectangle(clampedX, clampedY, w, h, {
        mass: params.mass ?? 60,
        restitution: 0.4,
        friction: 0.5,
        label: 'prop_gold_bar'
      });
      body.customData = { propType: 'gold_bar', width: w, height: h, spriteKey: 'GOLD_BAR', scale };
    } else if (rawProp.includes('SPIKE') || rawProp.includes('MACE') || rawProp.includes('BOMB')) {
      const scale = params.scale ?? 4;
      const r = 8 * scale;
      const clampedX = Math.max(36 + r + 4, Math.min(924 - r - 4, rawX));
      const clampedY = Math.max(36 + r + 4, Math.min(504 - r - 4, rawY));
      body = Bodies.circle(clampedX, clampedY, r, {
        mass: params.mass ?? 120,
        restitution: 0.3,
        friction: 0.6,
        label: 'prop_spike_ball'
      });
      body.customData = { propType: 'spike_ball', radius: r, spriteKey: 'SPIKE_BALL', scale };
    } else if (rawProp.includes('ANVIL') || rawProp.includes('WEIGHT') || rawProp.includes('HAMMER')) {
      const scale = params.scale ?? 4;
      const w = 18 * scale;
      const h = 14 * scale;
      const clampedX = Math.max(36 + w / 2 + 4, Math.min(924 - w / 2 - 4, rawX));
      const clampedY = Math.max(36 + h / 2 + 4, Math.min(504 - h / 2 - 4, rawY));
      body = Bodies.rectangle(clampedX, clampedY, w, h, {
        mass: params.mass ?? 200,
        density: 0.08,
        restitution: 0.05,
        friction: 0.9,
        label: 'prop_anvil'
      });
      body.customData = { propType: 'anvil', width: w, height: h, spriteKey: 'ANVIL', scale };
    } else if (PIXEL_SPRITES[rawProp]) {
      const scale = params.scale ?? 4;
      const w = 16 * scale;
      const h = 16 * scale;
      const clampedX = Math.max(36 + w / 2 + 4, Math.min(924 - w / 2 - 4, rawX));
      const clampedY = Math.max(36 + h / 2 + 4, Math.min(504 - h / 2 - 4, rawY));
      body = Bodies.rectangle(clampedX, clampedY, w, h, {
        mass: params.mass ?? 150,
        restitution: 0.1,
        friction: 0.8,
        label: `prop_${rawProp.toLowerCase()}`
      });
      body.customData = { propType: 'custom_sprite', spriteKey: rawProp, width: w, height: h, scale };
    } else {
      // Fallback
      const clampedX = Math.max(60, Math.min(900, rawX));
      const clampedY = Math.max(60, Math.min(480, rawY));
      body = Bodies.rectangle(clampedX, clampedY, 40, 40, {
        mass: params.mass ?? 50,
        restitution: 0.2,
        label: 'prop_generic'
      });
      body.customData = { propType: 'generic', width: 40, height: 40 };
    }

    // Set Initial Velocities (preserve 0 using nullish coalescing!)
    Body.setVelocity(body, {
      x: params.vx ?? 0,
      y: params.vy ?? 16
    });

    if (params.angularVelocity) {
      Body.setAngularVelocity(body, params.angularVelocity);
    }

    bodies.push(body);
  }

  return bodies;
}

export function renderPropBody(ctx, body) {
  const custom = body.customData || {};
  const { propType } = custom;

  ctx.save();
  ctx.translate(body.position.x, body.position.y);
  ctx.rotate(body.angle);

  if (propType === 'tetris') {
    const { shape, tileSize } = custom;
    ctx.lineWidth = 2;
    shape.cells.forEach(([cx, cy]) => {
      const px = cx * tileSize - tileSize;
      const py = cy * tileSize - tileSize;
      ctx.fillStyle = shape.color;
      ctx.fillRect(px, py, tileSize, tileSize);
      ctx.strokeStyle = shape.border;
      ctx.strokeRect(px, py, tileSize, tileSize);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
    });
  } else if (propType === 'custom_sprite' && custom.customDef) {
    const offscreen = getOffscreenPixelSprite(custom.customDef, custom.scale ?? custom.customDef.scale ?? 4);
    if (offscreen) {
      ctx.drawImage(offscreen, -offscreen.width / 2, -offscreen.height / 2);
    }
  } else if (custom.spriteKey) {
    const scale = custom.scale || 3;
    const offscreen = getOffscreenPixelSprite(custom.spriteKey, scale);
    if (offscreen) {
      if (propType === 'meteor') {
        const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
        glow.addColorStop(0, 'rgba(255, 100, 20, 0.8)');
        glow.addColorStop(1, 'rgba(255, 50, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.drawImage(offscreen, -offscreen.width / 2, -offscreen.height / 2);
      if (propType === 'balloon') {
        // Draw dangling wavy string
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, offscreen.height / 2 - 4);
        ctx.quadraticCurveTo(8, offscreen.height / 2 + 16, -4, offscreen.height / 2 + 36);
        ctx.stroke();
      }
    }
  } else if (propType === 'anvil') {
    const w = custom.width || 72;
    const h = custom.height || 56;
    ctx.fillStyle = '#212529';
    ctx.fillRect(-w / 2, -h / 2, w, h * 0.4);
    // Horn
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2);
    ctx.lineTo(-w / 2 - 16, -h / 2 + 6);
    ctx.lineTo(-w / 2, -h / 2 + h * 0.4);
    ctx.fill();
    // Base
    ctx.fillRect(-w * 0.4, -h / 2 + h * 0.4, w * 0.8, h * 0.6);
  } else {
    const w = custom.width || 40;
    const h = custom.height || 40;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-w / 2, -h / 2, w, h);
  }

  ctx.restore();
}

export const createPropSprite = getOffscreenPixelSprite;

export function spawnPropBody(world, params, customProp) {
  const bodies = createPropFromVerb(params, customProp);
  if (world && bodies.length > 0) {
    Matter.World.add(world, bodies);
  }
  return bodies;
}
