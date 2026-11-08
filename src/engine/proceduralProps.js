// Matter.js Rigid Body Prop Builder + Custom 16x16 Pixel Sprites + Tetris Shapes
import Matter from 'matter-js';
import { PIXEL_SPRITES } from '../data/themes.js';

const { Bodies, Body } = Matter;

const spriteCanvasCache = new Map();

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
    cacheKey = `${spriteKeyOrDef.name || 'custom'}_${pixelSize}`;
    if (spriteCanvasCache.has(cacheKey)) return spriteCanvasCache.get(cacheKey);
    matrix = spriteKeyOrDef.matrix;
    palette = spriteKeyOrDef.palette;
  } else {
    return null;
  }

  const rows = matrix.length;
  const cols = matrix[0].length;

  const canvas = document.createElement('canvas');
  canvas.width = cols * pixelSize;
  canvas.height = rows * pixelSize;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  for (let r = 0; r < rows; r++) {
    const row = matrix[r];
    for (let c = 0; c < cols; c++) {
      const color = palette[row[c]];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
      }
    }
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
export function createPropFromVerb(params, customPropDef) {
  const bodies = [];
  const count = params.count || 1;
  const spreadX = params.spread_x || 40;
  const startX = params.x ?? 480;
  const startY = params.y ?? 90;

  for (let i = 0; i < count; i++) {
    const offsetX = count > 1 ? (i - (count - 1) / 2) * spreadX : 0;
    const x = startX + offsetX;
    const y = startY - i * 30;
    const propType = params.prop_type || 'ANVIL';

    let body;

    if (propType.startsWith('TETRIS_')) {
      const tileSize = (params.scale || 4) * 5;
      body = createTetrisBody(propType, x, y, tileSize);
    } else if (propType === 'CUSTOM_PROP' && customPropDef) {
      const scale = customPropDef.scale || params.scale || 4;
      const w = 16 * scale;
      const h = 16 * scale;
      body = Bodies.rectangle(x, y, w, h, {
        mass: customPropDef.mass || params.mass || 150,
        restitution: customPropDef.restitution || 0.1,
        friction: 0.8,
        label: 'prop_custom'
      });
      body.customData = {
        propType: 'custom_sprite',
        customDef: customPropDef,
        width: w,
        height: h
      };
    } else if (propType === 'ANVIL') {
      const scale = params.scale || 4;
      const w = 18 * scale;
      const h = 14 * scale;
      body = Bodies.rectangle(x, y, w, h, {
        mass: params.mass || 200,
        density: 0.08,
        restitution: 0.05,
        friction: 0.9,
        label: 'prop_anvil'
      });
      body.customData = { propType: 'anvil', width: w, height: h };
    } else if (propType === 'SPIKE_BALL') {
      const scale = params.scale || 4;
      const r = 8 * scale;
      body = Bodies.circle(x, y, r, {
        mass: params.mass || 120,
        restitution: 0.3,
        friction: 0.6,
        label: 'prop_spike_ball'
      });
      body.customData = { propType: 'spike_ball', radius: r, spriteKey: 'SPIKE_BALL' };
    } else if (propType === 'GOLD_BAR') {
      const scale = params.scale || 3;
      const w = 16 * scale;
      const h = 8 * scale;
      body = Bodies.rectangle(x, y, w, h, {
        mass: params.mass || 60,
        restitution: 0.4,
        friction: 0.5,
        label: 'prop_gold_bar'
      });
      body.customData = { propType: 'gold_bar', width: w, height: h, spriteKey: 'GOLD_BAR' };
    } else {
      // Fallback
      body = Bodies.rectangle(x, y, 40, 40, {
        mass: params.mass || 50,
        restitution: 0.2,
        label: 'prop_generic'
      });
      body.customData = { propType: 'generic', width: 40, height: 40 };
    }

    // Set Initial Velocities
    Body.setVelocity(body, {
      x: params.vx || 0,
      y: params.vy || 16
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
    const offscreen = getOffscreenPixelSprite(custom.customDef, custom.customDef.scale || 4);
    if (offscreen) {
      ctx.drawImage(offscreen, -offscreen.width / 2, -offscreen.height / 2);
    }
  } else if (custom.spriteKey) {
    const offscreen = getOffscreenPixelSprite(custom.spriteKey, 3);
    if (offscreen) {
      ctx.drawImage(offscreen, -offscreen.width / 2, -offscreen.height / 2);
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
