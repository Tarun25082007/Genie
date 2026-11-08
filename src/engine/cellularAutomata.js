// 320x180 Falling-Sand Cellular Automata Engine + OBB Solid Mask Coupling & Ballistic Tracing
export const CELL_TYPES = {
  EMPTY: 0,
  WALL: 1,
  BLOOD: 2,
  FIRE: 3,
  ACID: 4,
  ASH: 5,
  GOLD: 6,
  SPARK: 7
};

export const CELL_COLORS = {
  // Little-Endian 0xAABBGGRR
  [CELL_TYPES.EMPTY]: 0x00000000,
  [CELL_TYPES.WALL]: [0xFF453530, 0xFF40302B, 0xFF382924, 0xFF4A3A35], // Brick variations
  [CELL_TYPES.BLOOD]: [0xFF180A9E, 0xFF1C0CB0, 0xFF14088C, 0xFF220EC2], // Rich arterial crimson
  [CELL_TYPES.FIRE]: [0xFF1044FF, 0xFF1565FF, 0xFF1A90FF, 0xFF20C5FF], // Red/Orange/Yellow core
  [CELL_TYPES.ACID]: [0xFF00E070, 0xFF05ED78, 0xFF00D165, 0xFF10F580], // Toxic radiant emerald
  [CELL_TYPES.ASH]: [0xFFA8B0B8, 0xFF9CA4AC, 0xFFB2BAC2, 0xFF9098A0], // Granular light grey
  [CELL_TYPES.GOLD]: [0xFF66D1FF, 0xFF55C0EE, 0xFF77E0FF, 0xFF44B0DD], // Gleaming gold
  [CELL_TYPES.SPARK]: [0xFF64F0FF, 0xFF80F5FF, 0xFF40EBFF, 0xFFFFFFFF] // Hot yellow-white sparks
};

export class CellularAutomataEngine {
  constructor(width = 320, height = 180) {
    this.width = width;
    this.height = height;
    this.totalCells = width * height; // 57,600

    this.cells = new Uint8Array(this.totalCells);
    this.vx = new Float32Array(this.totalCells);
    this.vy = new Float32Array(this.totalCells);
    this.life = new Uint16Array(this.totalCells);
    this.shade = new Uint8Array(this.totalCells);
    this.stainMask = new Uint8Array(this.totalCells);

    // OBB Collision Coupling Masks
    this.solidMask = new Uint8Array(this.totalCells); // 0=empty, 1=static body, 2=dynamic body
    this.bodyIndexMask = new Int16Array(this.totalCells);

    this.activeEmitters = [];
    this.frameCount = 0;
    this.imageData = null;
    this.pixelBuffer = null;

    // Randomize initial shades for textural depth
    for (let i = 0; i < this.totalCells; i++) {
      this.shade[i] = Math.floor(Math.random() * 4);
    }
  }

  get cols() {
    return this.width;
  }

  get rows() {
    return this.height;
  }

  getIndex(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
    return y * this.width + x;
  }

  get(x, y) {
    const idx = this.getIndex(x, y);
    return idx === -1 ? CELL_TYPES.WALL : this.cells[idx];
  }

  set(x, y, type, lifeVal = 0, initialVx = 0, initialVy = 0) {
    const idx = this.getIndex(x, y);
    if (idx !== -1 && this.solidMask[idx] !== 1) {
      this.cells[idx] = type;
      this.life[idx] = lifeVal;
      this.vx[idx] = initialVx;
      this.vy[idx] = initialVy;
      this.shade[idx] = Math.floor(Math.random() * 4);
    }
  }

  clear() {
    this.cells.fill(CELL_TYPES.EMPTY);
    this.vx.fill(0);
    this.vy.fill(0);
    this.life.fill(0);
    this.stainMask.fill(0);
    this.activeEmitters = [];
  }

  // Continuous Emitter Registration
  addEmitter(emitter) {
    this.activeEmitters.push({
      x: emitter.x || 160,
      y: emitter.y || 90,
      getPosition: emitter.getPosition || null,
      type: emitter.type || CELL_TYPES.BLOOD,
      countPerFrame: emitter.countPerFrame || 3,
      spread: emitter.spread || 4,
      vx: emitter.vx || 0,
      vy: emitter.vy || 0,
      framesRemaining: emitter.framesRemaining || 120
    });
  }

  spawnCircle(worldPhysX, worldPhysY, radiusWorld, type, count = 15, baseVx = 0, baseVy = 0) {
    const cx = worldPhysX <= 320 ? Math.floor(worldPhysX) : Math.max(0, Math.min(319, Math.floor(worldPhysX / 3)));
    const cy = worldPhysY <= 180 ? Math.floor(worldPhysY) : Math.max(0, Math.min(179, Math.floor(worldPhysY / 3)));
    const r = radiusWorld <= 50 ? Math.max(1, Math.floor(radiusWorld)) : Math.max(1, Math.floor(radiusWorld / 3));

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * r;
      const gx = Math.max(0, Math.min(319, Math.floor(cx + Math.cos(angle) * dist)));
      const gy = Math.max(0, Math.min(179, Math.floor(cy + Math.sin(angle) * dist)));

      let l = 0;
      if (type === CELL_TYPES.FIRE) l = 16 + Math.floor(Math.random() * 24);
      else if (type === CELL_TYPES.SPARK) l = 8 + Math.floor(Math.random() * 12);

      const jx = baseVx + (Math.random() - 0.5) * 2.0;
      const jy = baseVy + (Math.random() - 0.5) * 2.0;

      this.set(gx, gy, type, l, jx, jy);
    }
  }

  coupleMatterBodies(matterBodies) {
    this.syncMatterBodies(matterBodies);
  }

  // 4.1 OBB Solid Mask Synchronization (Matter.js -> 320x180 CA Grid)
  syncMatterBodies(matterBodies) {
    this.solidMask.fill(0);
    this.bodyIndexMask.fill(-1);

    if (!matterBodies || matterBodies.length === 0) return;

    for (let b = 0; b < matterBodies.length; b++) {
      const body = matterBodies[b];
      if (!body) continue;

      const bounds = body.bounds;
      const xMin = Math.max(0, Math.floor(bounds.min.x / 3));
      const xMax = Math.min(319, Math.ceil(bounds.max.x / 3));
      const yMin = Math.max(0, Math.floor(bounds.min.y / 3));
      const yMax = Math.min(179, Math.ceil(bounds.max.y / 3));

      const bx = body.position.x;
      const by = body.position.y;
      const theta = body.angle;
      const cosNeg = Math.cos(-theta);
      const sinNeg = Math.sin(-theta);

      // Width and height of body
      const w = (bounds.max.x - bounds.min.x);
      const h = (bounds.max.y - bounds.min.y);
      const halfW = w * 0.5;
      const halfH = h * 0.5;
      const solidVal = body.isStatic ? 1 : 2;

      for (let yca = yMin; yca <= yMax; yca++) {
        const yw = yca * 3 + 1.5;
        const rowOffset = yca * 320;
        for (let xca = xMin; xca <= xMax; xca++) {
          const xw = xca * 3 + 1.5;
          const dx = xw - bx;
          const dy = yw - by;

          const localX = dx * cosNeg - dy * sinNeg;
          const localY = dx * sinNeg + dy * cosNeg;

          if (Math.abs(localX) <= halfW && Math.abs(localY) <= halfH) {
            const idx = rowOffset + xca;
            this.solidMask[idx] = solidVal;
            this.bodyIndexMask[idx] = b;
          }
        }
      }
    }
  }

  // 4.2 Main Simulation Step Loop
  step(matterBodies, onAcidContact = null, onGoldWeight = null) {
    this.frameCount++;
    this.syncMatterBodies(matterBodies);

    // 1. Process Active Emitters (e.g. Severed Stump Blood)
    for (let e = 0; e < this.activeEmitters.length; e++) {
      const em = this.activeEmitters[e];
      if (em.framesRemaining > 0) {
        em.framesRemaining--;
        let emX = em.x;
        let emY = em.y;
        if (em.getPosition) {
          const pos = em.getPosition();
          emX = pos.x;
          emY = pos.y;
        }

        const cx = Math.max(0, Math.min(319, Math.floor(emX / 3)));
        const cy = Math.max(0, Math.min(179, Math.floor(emY / 3)));

        for (let k = 0; k < em.countPerFrame; k++) {
          const gx = Math.max(0, Math.min(319, cx + Math.floor((Math.random() - 0.5) * em.spread)));
          const gy = Math.max(0, Math.min(179, cy + Math.floor((Math.random() - 0.5) * em.spread)));
          const jx = em.vx + (Math.random() - 0.5) * 3.5;
          const jy = em.vy + (Math.random() - 0.5) * 3.5;
          this.set(gx, gy, em.type, 0, jx, jy);
        }
      }
    }
    this.activeEmitters = this.activeEmitters.filter((em) => em.framesRemaining > 0);

    // 2. Traversal Loop (Bottom-up, alternating scan direction)
    const leftToRight = (this.frameCount & 1) === 0;
    const startX = leftToRight ? 1 : 318;
    const endX = leftToRight ? 319 : 0;
    const stepX = leftToRight ? 1 : -1;

    for (let y = 178; y >= 1; y--) {
      const rowOffset = y * 320;
      for (let x = startX; x !== endX; x += stepX) {
        const idx = rowOffset + x;
        const cell = this.cells[idx];
        if (cell === CELL_TYPES.EMPTY || cell === CELL_TYPES.WALL) continue;

        // 3. Ballistic Mode for high-velocity cells
        if (Math.abs(this.vx[idx]) > 0.2 || Math.abs(this.vy[idx]) > 0.2) {
          this.updateBallisticCell(x, y, idx, cell, onAcidContact);
          continue;
        }

        // 4. Cellular Rules
        switch (cell) {
          case CELL_TYPES.BLOOD:
            this.updateBlood(x, y, idx);
            break;
          case CELL_TYPES.FIRE:
            this.updateFire(x, y, idx);
            break;
          case CELL_TYPES.ACID:
            this.updateAcid(x, y, idx, onAcidContact);
            break;
          case CELL_TYPES.ASH:
            this.updateAsh(x, y, idx);
            break;
          case CELL_TYPES.GOLD:
            this.updateGold(x, y, idx, onGoldWeight);
            break;
          case CELL_TYPES.SPARK:
            this.updateSpark(x, y, idx);
            break;
        }
      }
    }
  }

  updateBallisticCell(x, y, idx, cell, onAcidContact) {
    this.vy[idx] += 0.25; // Gravity
    this.vx[idx] *= 0.96; // Air drag

    let currX = x;
    let currY = y;
    let currIdx = idx;
    let hit = false;

    // Sub-step tracing up to 3 increments
    const subSteps = 3;
    const stepX = this.vx[idx] / subSteps;
    const stepY = this.vy[idx] / subSteps;

    for (let s = 0; s < subSteps; s++) {
      const nextX = Math.round(currX + stepX);
      const nextY = Math.round(currY + stepY);
      if (nextX < 1 || nextX >= 319 || nextY < 1 || nextY >= 179) {
        hit = true;
        break;
      }

      const nextIdx = nextY * 320 + nextX;
      if (this.solidMask[nextIdx] > 0 || (this.cells[nextIdx] !== CELL_TYPES.EMPTY && nextIdx !== currIdx)) {
        hit = true;
        // Impact Handling
        if (cell === CELL_TYPES.BLOOD) {
          this.stainMask[nextIdx] = 1;
        } else if (cell === CELL_TYPES.ACID && this.solidMask[nextIdx] === 2 && onAcidContact) {
          const bodyIdx = this.bodyIndexMask[nextIdx];
          if (bodyIdx >= 0) onAcidContact(bodyIdx);
        }
        break;
      }

      // Move into next cell
      this.swap(currIdx, nextIdx);
      currX = nextX;
      currY = nextY;
      currIdx = nextIdx;
    }

    if (hit) {
      this.vx[currIdx] = 0;
      this.vy[currIdx] = 0;
    }
  }

  updateBlood(x, y, idx) {
    // 1. Direct fall
    const below = idx + 320;
    if (this.cells[below] === CELL_TYPES.EMPTY && this.solidMask[below] === 0) {
      this.swap(idx, below);
      return;
    }

    // 2. Diagonal down (randomized order)
    const dir = Math.random() > 0.5 ? 1 : -1;
    const d1 = below + dir;
    const d2 = below - dir;

    if (this.cells[d1] === CELL_TYPES.EMPTY && this.solidMask[d1] === 0) {
      this.swap(idx, d1);
      return;
    }
    if (this.cells[d2] === CELL_TYPES.EMPTY && this.solidMask[d2] === 0) {
      this.swap(idx, d2);
      return;
    }

    // 3. Lateral surface flow & pooling (±1 and ±2)
    const side1 = idx + dir;
    const side2 = idx - dir;
    const sideFar = idx + dir * 2;

    if (this.cells[side1] === CELL_TYPES.EMPTY && this.solidMask[side1] === 0) {
      this.swap(idx, side1);
    } else if (this.cells[side2] === CELL_TYPES.EMPTY && this.solidMask[side2] === 0) {
      this.swap(idx, side2);
    } else if (this.cells[sideFar] === CELL_TYPES.EMPTY && this.solidMask[sideFar] === 0 && Math.random() < 0.6) {
      this.swap(idx, sideFar);
    }
  }

  updateFire(x, y, idx) {
    if (this.life[idx] <= 1) {
      this.cells[idx] = Math.random() < 0.12 ? CELL_TYPES.ASH : CELL_TYPES.EMPTY;
      this.life[idx] = 0;
      return;
    }
    this.life[idx]--;

    // Scorch dynamic ragdoll bodies in contact
    const neighbors = [idx - 1, idx + 1, idx - 320, idx + 320];
    for (let n = 0; n < neighbors.length; n++) {
      const nIdx = neighbors[n];
      if (this.solidMask[nIdx] === 2 && Math.random() < 0.1) {
        this.stainMask[nIdx] = 1; // Scorch mark
      }
    }

    // Upward drift
    const jx = Math.floor(Math.random() * 3) - 1;
    const up = idx - 320 + jx;
    if (up >= 0 && this.cells[up] === CELL_TYPES.EMPTY && this.solidMask[up] === 0) {
      this.swap(idx, up);
    }
  }

  updateAcid(x, y, idx, onAcidContact) {
    // Check contact with solids/walls/bodies to dissolve
    const neighbors = [idx + 320, idx - 1, idx + 1, idx - 320];
    for (let n = 0; n < neighbors.length; n++) {
      const nIdx = neighbors[n];
      if (this.solidMask[nIdx] > 0 || this.cells[nIdx] === CELL_TYPES.WALL) {
        if (Math.random() < 0.18) {
          // Dissolve target into green spark vapor
          this.cells[idx] = CELL_TYPES.SPARK;
          this.life[idx] = 12;
          if (this.solidMask[nIdx] === 2 && onAcidContact) {
            const bodyIdx = this.bodyIndexMask[nIdx];
            if (bodyIdx >= 0) onAcidContact(bodyIdx);
          }
          return;
        }
      }
    }

    // Downward & lateral fluid movement
    const below = idx + 320;
    if (this.cells[below] === CELL_TYPES.EMPTY && this.solidMask[below] === 0) {
      this.swap(idx, below);
      return;
    }

    const dir = Math.random() > 0.5 ? 1 : -1;
    const d1 = below + dir;
    const d2 = below - dir;

    if (this.cells[d1] === CELL_TYPES.EMPTY && this.solidMask[d1] === 0) {
      this.swap(idx, d1);
      return;
    }
    if (this.cells[d2] === CELL_TYPES.EMPTY && this.solidMask[d2] === 0) {
      this.swap(idx, d2);
      return;
    }

    const s1 = idx + dir;
    const s2 = idx - dir;
    if (this.cells[s1] === CELL_TYPES.EMPTY && this.solidMask[s1] === 0) {
      this.swap(idx, s1);
    } else if (this.cells[s2] === CELL_TYPES.EMPTY && this.solidMask[s2] === 0) {
      this.swap(idx, s2);
    }
  }

  updateAsh(x, y, idx) {
    if ((this.frameCount & 1) !== 0) return; // Falls at half rate

    const below = idx + 320;
    if (this.cells[below] === CELL_TYPES.EMPTY && this.solidMask[below] === 0) {
      this.swap(idx, below);
      return;
    }

    const dir = Math.random() > 0.5 ? 1 : -1;
    const d1 = below + dir;
    if (this.cells[d1] === CELL_TYPES.EMPTY && this.solidMask[d1] === 0) {
      this.swap(idx, d1);
    }
  }

  updateGold(x, y, idx, onGoldWeight) {
    // Check if resting on dynamic ragdoll body to apply real physical weight
    const below = idx + 320;
    if (this.solidMask[below] === 2 && onGoldWeight) {
      const bodyIdx = this.bodyIndexMask[below];
      if (bodyIdx >= 0) onGoldWeight(bodyIdx, 0.00045);
    }

    // High density sand physics: can displace BLOOD and ASH!
    const targetCell = this.cells[below];
    if (this.solidMask[below] === 0 && (targetCell === CELL_TYPES.EMPTY || targetCell === CELL_TYPES.BLOOD || targetCell === CELL_TYPES.ASH)) {
      this.swap(idx, below);
      return;
    }

    const dir = Math.random() > 0.5 ? 1 : -1;
    const d1 = below + dir;
    const d2 = below - dir;

    const t1 = this.cells[d1];
    if (this.solidMask[d1] === 0 && (t1 === CELL_TYPES.EMPTY || t1 === CELL_TYPES.BLOOD || t1 === CELL_TYPES.ASH)) {
      this.swap(idx, d1);
      return;
    }
    const t2 = this.cells[d2];
    if (this.solidMask[d2] === 0 && (t2 === CELL_TYPES.EMPTY || t2 === CELL_TYPES.BLOOD || t2 === CELL_TYPES.ASH)) {
      this.swap(idx, d2);
    }
  }

  updateSpark(x, y, idx) {
    if (this.life[idx] <= 1) {
      this.cells[idx] = CELL_TYPES.EMPTY;
      this.life[idx] = 0;
      return;
    }
    this.life[idx]--;

    const jx = Math.floor(Math.random() * 3) - 1;
    const jy = Math.floor(Math.random() * 2) - 1;
    const target = idx + jy * 320 + jx;

    if (target >= 0 && target < this.totalCells && this.cells[target] === CELL_TYPES.EMPTY && this.solidMask[target] === 0) {
      this.swap(idx, target);
    }
  }

  swap(i1, i2) {
    const c1 = this.cells[i1];
    const l1 = this.life[i1];
    const s1 = this.shade[i1];
    const vx1 = this.vx[i1];
    const vy1 = this.vy[i1];

    this.cells[i1] = this.cells[i2];
    this.life[i1] = this.life[i2];
    this.shade[i1] = this.shade[i2];
    this.vx[i1] = this.vx[i2];
    this.vy[i1] = this.vy[i2];

    this.cells[i2] = c1;
    this.life[i2] = l1;
    this.shade[i2] = s1;
    this.vx[i2] = vx1;
    this.vy[i2] = vy1;
  }

  // 4.2 Pixel Buffer Rendering (Zero-GC Uint32Array Little-Endian Hex)
  renderToImageData(ctx) {
    if (!this.imageData) {
      this.imageData = ctx.createImageData(this.width, this.height);
      this.pixelBuffer = new Uint32Array(this.imageData.data.buffer);
    }

    const buf = this.pixelBuffer;
    const total = this.totalCells;

    for (let i = 0; i < total; i++) {
      const type = this.cells[i];
      if (type === CELL_TYPES.EMPTY) {
        buf[i] = this.stainMask[i] ? 0xFF140866 : 0x00000000; // Blood stain on background
      } else {
        const colors = CELL_COLORS[type];
        if (Array.isArray(colors)) {
          const shadeIdx = this.shade[i] & 3;
          buf[i] = colors[shadeIdx];
        } else {
          buf[i] = colors;
        }
      }
    }

    ctx.putImageData(this.imageData, 0, 0);
  }

  render(ctx) {
    this.renderToImageData(ctx);
  }

  update(matterBodies, onAcidContact, onGoldWeight) {
    this.step(matterBodies, onAcidContact, onGoldWeight);
  }
}

// Alias for backwards compatibility
export const CellularGrid = CellularAutomataEngine;
