// 6-Part Segmented Matter.js Ragdoll (Exact Coordinates, Joint Destruction, Mutation & Hat Rendering)
import Matter from 'matter-js';
import { audioSynth } from './audioSynth.js';
import { CELL_TYPES } from './cellularAutomata.js';

const { Bodies, Body, Constraint, Composite } = Matter;

export class PlayerRagdoll {
  constructor(world, startX = 480, startY = 440, customization = {}) {
    this.world = world;
    this.startX = startX;
    this.startY = startY;

    this.playerCustom = customization.player || customization;
    this.colors = {
      skin: this.playerCustom.skinColor || '#f5cba7',
      shirt: this.playerCustom.shirtColor || '#3b82f6',
      pants: this.playerCustom.pantsColor || '#1e293b',
      hair: '#3d2618',
      boots: '#0f172a'
    };
    this.hatStyle = this.playerCustom.hatStyle || 'NONE';

    this.parts = {};
    this.constraints = {};
    this.stumps = [];
    this.meatChunks = [];
    this.partTints = {};
    this.acidCorrosion = {
      head: 0,
      torso: 0,
      leftArm: 0,
      rightArm: 0,
      leftLeg: 0,
      rightLeg: 0
    };
    this.isDead = false;

    this.initRagdoll(startX, startY);
  }

  initRagdoll(x, y) {
    const group = -1;

    // Exact Body Geometry according to Section 4.3:
    // head: rectangle(480, 400, 24, 24)
    // torso: rectangle(480, 438, 28, 44)
    // leftArm: rectangle(456, 436, 12, 36)
    // rightArm: rectangle(504, 436, 12, 36)
    // leftLeg: rectangle(472, 482, 12, 40)
    // rightLeg: rectangle(488, 482, 12, 40)
    this.parts = {
      head: Bodies.rectangle(x, 400, 24, 24, {
        collisionFilter: { group },
        density: 0.002,
        friction: 0.5,
        restitution: 0.2,
        label: 'ragdoll_head'
      }),
      torso: Bodies.rectangle(x, 438, 28, 44, {
        collisionFilter: { group },
        density: 0.004,
        friction: 0.6,
        restitution: 0.1,
        label: 'ragdoll_torso'
      }),
      leftArm: Bodies.rectangle(x - 24, 436, 12, 36, {
        collisionFilter: { group },
        density: 0.0015,
        friction: 0.4,
        restitution: 0.1,
        label: 'ragdoll_leftArm'
      }),
      rightArm: Bodies.rectangle(x + 24, 436, 12, 36, {
        collisionFilter: { group },
        density: 0.0015,
        friction: 0.4,
        restitution: 0.1,
        label: 'ragdoll_rightArm'
      }),
      leftLeg: Bodies.rectangle(x - 8, 482, 12, 40, {
        collisionFilter: { group },
        density: 0.0025,
        friction: 0.8,
        restitution: 0.1,
        label: 'ragdoll_leftLeg'
      }),
      rightLeg: Bodies.rectangle(x + 8, 482, 12, 40, {
        collisionFilter: { group },
        density: 0.0025,
        friction: 0.8,
        restitution: 0.1,
        label: 'ragdoll_rightLeg'
      })
    };

    const p = this.parts;

    // Exact 5 Breakable Constraints according to Section 4.3:
    this.constraints = {
      neck: Constraint.create({
        bodyA: p.torso,
        pointA: { x: 0, y: -22 },
        bodyB: p.head,
        pointB: { x: 0, y: 12 },
        stiffness: 0.85,
        damping: 0.1,
        length: 4,
        render: { visible: false }
      }),
      leftShoulder: Constraint.create({
        bodyA: p.torso,
        pointA: { x: -14, y: -18 },
        bodyB: p.leftArm,
        pointB: { x: 6, y: -16 },
        stiffness: 0.8,
        damping: 0.1,
        length: 4,
        render: { visible: false }
      }),
      rightShoulder: Constraint.create({
        bodyA: p.torso,
        pointA: { x: 14, y: -18 },
        bodyB: p.rightArm,
        pointB: { x: -6, y: -16 },
        stiffness: 0.8,
        damping: 0.1,
        length: 4,
        render: { visible: false }
      }),
      leftHip: Constraint.create({
        bodyA: p.torso,
        pointA: { x: -8, y: 22 },
        bodyB: p.leftLeg,
        pointB: { x: 0, y: -20 },
        stiffness: 0.85,
        damping: 0.1,
        length: 2,
        render: { visible: false }
      }),
      rightHip: Constraint.create({
        bodyA: p.torso,
        pointA: { x: 8, y: 22 },
        bodyB: p.rightLeg,
        pointB: { x: 0, y: -20 },
        stiffness: 0.85,
        damping: 0.1,
        length: 2,
        render: { visible: false }
      })
    };

    this.constraints.neck.maxStretch = 15;
    this.constraints.leftShoulder.maxStretch = 18;
    this.constraints.rightShoulder.maxStretch = 18;
    this.constraints.leftHip.maxStretch = 18;
    this.constraints.rightHip.maxStretch = 18;

    Object.values(this.constraints).forEach((c) => {
      c.isBroken = false;
    });

    Composite.add(this.world, Object.values(this.parts));
    Composite.add(this.world, Object.values(this.constraints));
  }

  // Upright posture stabilization keeping alive player standing
  updatePosture() {
    if (this.isDead || !this.constraints.neck || this.constraints.neck.isBroken) return;

    // Torso upright torque
    const torso = this.parts.torso;
    if (torso) {
      torso.torque = -torso.angle * 0.08;
    }

    // Head upright torque
    const head = this.parts.head;
    if (head) {
      head.torque = -head.angle * 0.05;
    }

    // Legs gentle stabilization
    ['leftLeg', 'rightLeg'].forEach((legKey) => {
      const leg = this.parts[legKey];
      if (leg) {
        leg.torque = -leg.angle * 0.04;
      }
    });
  }

  // Automatic Force/Stress Joint Severing
  checkJointStress(caEngine = null, synth = audioSynth) {
    this.updatePosture();

    Object.entries(this.constraints).forEach(([jointName, c]) => {
      if (c.isBroken) return;
      const bodyA = c.bodyA;
      const bodyB = c.bodyB;
      if (!bodyA || !bodyB) return;

      // Endpoint 1 in world coords
      const cosA = Math.cos(bodyA.angle);
      const sinA = Math.sin(bodyA.angle);
      const p1 = {
        x: bodyA.position.x + (c.pointA.x * cosA - c.pointA.y * sinA),
        y: bodyA.position.y + (c.pointA.x * sinA + c.pointA.y * cosA)
      };

      // Endpoint 2 in world coords
      const cosB = Math.cos(bodyB.angle);
      const sinB = Math.sin(bodyB.angle);
      const p2 = {
        x: bodyB.position.x + (c.pointB.x * cosB - c.pointB.y * sinB),
        y: bodyB.position.y + (c.pointB.x * sinB + c.pointB.y * cosB)
      };

      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const vRel = Math.hypot(
        bodyA.velocity.x - bodyB.velocity.x,
        bodyA.velocity.y - bodyB.velocity.y
      );

      const maxStretch = c.maxStretch || 18;
      if (dist > maxStretch || vRel > 26) {
        this.severJoint(jointName, caEngine, synth);
      }
    });
  }

  // Sever Joint Atomic Action
  severJoint(jointName, caEngine = null, synth = audioSynth) {
    const jointMap = {
      head: 'neck',
      neck: 'neck',
      leftArm: 'leftShoulder',
      leftShoulder: 'leftShoulder',
      rightArm: 'rightShoulder',
      rightShoulder: 'rightShoulder',
      leftLeg: 'leftHip',
      leftHip: 'leftHip',
      rightLeg: 'rightHip',
      rightHip: 'rightHip'
    };
    const targetJoint = jointMap[jointName] || jointName;

    if (targetJoint === 'all') {
      ['neck', 'leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'].forEach((j) => {
        this.severJoint(j, caEngine, synth);
      });
      return;
    }

    const c = this.constraints[targetJoint];
    if (c && !c.isBroken) {
      c.isBroken = true;
      Composite.remove(this.world, c);

      if (synth) {
        synth.playGoreCrunch();
        synth.playBloodSpray();
      }

      const bodyA = c.bodyA || this.parts.torso;
      const offset = c.pointA;

      // Register local stump for persistent rendering and spurts
      this.stumps.push({
        parentBody: bodyA,
        offset,
        bloodTicks: 160
      });

      // Register continuous blood emitter in Cellular Automata Engine locked to moving stump coords
      if (caEngine && typeof caEngine.addEmitter === 'function') {
        caEngine.addEmitter({
          getPosition: () => {
            const cos = Math.cos(bodyA.angle);
            const sin = Math.sin(bodyA.angle);
            return {
              x: bodyA.position.x + (offset.x * cos - offset.y * sin),
              y: bodyA.position.y + (offset.x * sin + offset.y * cos)
            };
          },
          type: CELL_TYPES.BLOOD,
          countPerFrame: 4,
          spread: 4,
          vx: bodyA.velocity.x * 0.4,
          vy: bodyA.velocity.y * 0.4 - 1.5,
          framesRemaining: 160
        });
      }

      if (jointName === 'neck') {
        this.isDead = true;
      }
    }
  }

  // Alias for backward compatibility with choreography runner
  destroyJoint(jointName, bloodBurst = 120, caEngine = null) {
    this.severJoint(jointName, caEngine, audioSynth);
  }

  // APPLY_FORCE Atomic Verb
  applyForceToPart(target, fx, fy) {
    if (target === 'all') {
      Object.values(this.parts).forEach((part) => {
        if (part) Body.applyForce(part, part.position, { x: fx, y: fy });
      });
    } else if (this.parts[target]) {
      Body.applyForce(this.parts[target], this.parts[target].position, { x: fx, y: fy });
    }
  }

  // MUTATE_PART Atomic Verb
  mutatePart(params, caEngine = null, synth = audioSynth) {
    const { part, scale_x = 1.0, scale_y = 1.0, tint, explode_if_scale_above = 2.4 } = params;

    const mutateSingle = (bodyKey) => {
      const body = this.parts[bodyKey];
      if (!body) return;

      Body.scale(body, scale_x, scale_y);
      if (tint) {
        this.partTints[bodyKey] = tint;
      }

      if (Math.max(scale_x, scale_y) >= explode_if_scale_above) {
        this.explodePart(bodyKey, caEngine, synth);
      }
    };

    if (part === 'all') {
      Object.keys(this.parts).forEach(mutateSingle);
    } else {
      mutateSingle(part);
    }
  }

  // Gib Explosion
  explodePart(partName, caEngine = null, synth = audioSynth) {
    const body = this.parts[partName];
    if (!body) return;

    if (synth) {
      synth.playExplosion();
      synth.playBloodSpray();
      synth.playGoreCrunch();
    }

    // Sever all attached joints
    if (partName === 'head') this.severJoint('neck', caEngine, synth);
    else if (partName === 'leftArm') this.severJoint('leftShoulder', caEngine, synth);
    else if (partName === 'rightArm') this.severJoint('rightShoulder', caEngine, synth);
    else if (partName === 'leftLeg') this.severJoint('leftHip', caEngine, synth);
    else if (partName === 'rightLeg') this.severJoint('rightHip', caEngine, synth);
    else if (partName === 'torso') {
      ['neck', 'leftShoulder', 'rightShoulder', 'leftHip', 'rightHip'].forEach((j) => {
        this.severJoint(j, caEngine, synth);
      });
      this.isDead = true;
    }

    const pos = { x: body.position.x, y: body.position.y };

    // Emit 450 BLOOD cells in CA engine
    if (caEngine) {
      caEngine.spawnCircle(pos.x, pos.y, 45, CELL_TYPES.BLOOD, 60, 0, 0);
    }

    // Remove the part body from Matter.js world
    Composite.remove(this.world, body);
    delete this.parts[partName];

    // Spawn 8 small meat-chunk rigid bodies with radial outward velocity
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const speed = 6 + Math.random() * 8;
      const chunk = Bodies.rectangle(
        pos.x + Math.cos(angle) * 12,
        pos.y + Math.sin(angle) * 12,
        8,
        8,
        {
          density: 0.003,
          restitution: 0.3,
          friction: 0.8,
          label: 'meat_chunk'
        }
      );
      Body.setVelocity(chunk, {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed - 4
      });
      Body.setAngularVelocity(chunk, (Math.random() - 0.5) * 0.3);

      this.meatChunks.push({
        body: chunk,
        life: 240
      });

      Composite.add(this.world, chunk);
    }
  }

  // Acid contact handler called by CellularAutomataEngine
  onAcidContact(bodyOrIdx, caEngine = null, synth = audioSynth) {
    let partKey = null;

    if (typeof bodyOrIdx === 'string') {
      partKey = bodyOrIdx;
    } else if (typeof bodyOrIdx === 'object' && bodyOrIdx?.label) {
      partKey = bodyOrIdx.label.replace('ragdoll_', '');
    } else {
      // Find body by index
      const keys = Object.keys(this.parts);
      partKey = keys[bodyOrIdx % keys.length];
    }

    if (partKey && this.acidCorrosion[partKey] !== undefined) {
      this.acidCorrosion[partKey] += 1;
      this.partTints[partKey] = '#10b981'; // Emerald acid corrosion tint

      if (this.acidCorrosion[partKey] > 45) {
        this.explodePart(partKey, caEngine, synth);
      }
    }
  }

  // Downward force from piles of gold resting on ragdoll
  onGoldWeight(bodyOrIdx, force = 0.00045) {
    const target = this.parts.torso || this.parts.head;
    if (target) {
      Body.applyForce(target, target.position, { x: 0, y: force });
    }
  }

  update(cellularGrid = null, worldWidth = 960, worldHeight = 540) {
    // 1. Natural Stress Severing & Posture Update
    this.checkJointStress(cellularGrid, audioSynth);

    // 2. Stump Blood Spurts
    if (cellularGrid) {
      const scaleX = (cellularGrid.cols || 320) / worldWidth;
      const scaleY = (cellularGrid.rows || 180) / worldHeight;

      this.stumps.forEach((stump) => {
        if (stump.bloodTicks > 0) {
          stump.bloodTicks--;

          const body = stump.parentBody;
          if (body) {
            const cos = Math.cos(body.angle);
            const sin = Math.sin(body.angle);
            const wx = body.position.x + (stump.offset.x * cos - stump.offset.y * sin);
            const wy = body.position.y + (stump.offset.x * sin + stump.offset.y * cos);

            const gx = Math.floor(wx * scaleX);
            const gy = Math.floor(wy * scaleY);

            cellularGrid.spawnCircle(gx, gy, 3, CELL_TYPES.BLOOD, 2);

            if (stump.bloodTicks % 30 === 0) {
              audioSynth.playBloodSpray();
            }
          }
        }
      });

      this.stumps = this.stumps.filter((s) => s.bloodTicks > 0);
    }

    // 3. Clean up decaying meat chunks
    this.meatChunks.forEach((chunk) => {
      chunk.life--;
      if (chunk.life <= 0) {
        Composite.remove(this.world, chunk.body);
      }
    });
    this.meatChunks = this.meatChunks.filter((chunk) => chunk.life > 0);
  }

  // 100% Procedural Pixel Limb & Hat Rendering
  render(ctx) {
    const p = this.parts;
    const c = this.colors;

    const renderBox = (body, w, h, defaultColor, border = null) => {
      if (!body) return;
      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);

      const bodyKey = Object.keys(this.parts).find((k) => this.parts[k] === body);
      ctx.fillStyle = this.partTints[bodyKey] || defaultColor;
      ctx.fillRect(-w / 2, -h / 2, w, h);

      if (border) {
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
      }
      ctx.restore();
    };

    // Render Meat Chunks
    this.meatChunks.forEach((chunk) => {
      ctx.save();
      ctx.translate(chunk.body.position.x, chunk.body.position.y);
      ctx.rotate(chunk.body.angle);
      ctx.fillStyle = '#9d0208';
      ctx.fillRect(-4, -4, 8, 8);
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(-1, -1, 3, 3);
      ctx.restore();
    });

    // Legs
    renderBox(p.leftLeg, 12, 40, c.pants, c.boots);
    renderBox(p.rightLeg, 12, 40, c.pants, c.boots);

    // Torso
    renderBox(p.torso, 28, 44, c.shirt);

    // Arms
    renderBox(p.leftArm, 12, 36, c.shirt, c.skin);
    renderBox(p.rightArm, 12, 36, c.shirt, c.skin);

    // Head
    if (p.head) {
      ctx.save();
      ctx.translate(p.head.position.x, p.head.position.y);
      ctx.rotate(p.head.angle);

      const headTint = this.partTints.head || c.skin;
      ctx.fillStyle = headTint;
      ctx.fillRect(-12, -12, 24, 24);

      // Hair cap
      ctx.fillStyle = c.hair;
      ctx.fillRect(-12, -12, 24, 6);

      // Eyes & Expression
      const speed = Math.hypot(p.head.velocity.x, p.head.velocity.y);
      const isPanicking = speed > 4 || this.constraints.neck?.isBroken;

      if (this.isDead || this.constraints.neck?.isBroken) {
        // Dead X eyes
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        [[-6, -2], [6, -2]].forEach(([ex, ey]) => {
          ctx.beginPath();
          ctx.moveTo(ex - 3, ey - 3);
          ctx.lineTo(ex + 3, ey + 3);
          ctx.moveTo(ex + 3, ey - 3);
          ctx.lineTo(ex - 3, ey + 3);
          ctx.stroke();
        });
        // Squashed mouth
        ctx.fillStyle = '#ef233c';
        ctx.beginPath();
        ctx.arc(0, 5, 4, 0, Math.PI);
        ctx.fill();
      } else if (isPanicking) {
        // Panic wide eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-8, -4, 5, 5);
        ctx.fillRect(3, -4, 5, 5);
        ctx.fillStyle = '#000000';
        ctx.fillRect(-6, -3, 2, 2);
        ctx.fillRect(5, -3, 2, 2);
        // Screaming open mouth
        ctx.fillStyle = '#000000';
        ctx.fillRect(-3, 3, 6, 6);
      } else {
        // Normal calm eyes
        ctx.fillStyle = '#000000';
        ctx.fillRect(-7, -3, 3, 3);
        ctx.fillRect(4, -3, 3, 3);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 3, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      // Hat Styles
      if (this.hatStyle === 'CROWN') {
        ctx.fillStyle = '#ffd166';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-12, -12);
        ctx.lineTo(-12, -22);
        ctx.lineTo(-6, -16);
        ctx.lineTo(0, -25);
        ctx.lineTo(6, -16);
        ctx.lineTo(12, -22);
        ctx.lineTo(12, -12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (this.hatStyle === 'WIZARD') {
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.ellipse(0, -12, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-10, -14);
        ctx.lineTo(6, -35);
        ctx.lineTo(10, -14);
        ctx.closePath();
        ctx.fill();
      } else if (this.hatStyle === 'HARDHAT') {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(0, -12, 16, 7, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-18, -12, 36, 3);
      }

      ctx.restore();
    }

    // Severed Bone Stumps
    this.stumps.forEach((stump) => {
      const body = stump.parentBody;
      if (!body) return;
      ctx.save();
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle);
      ctx.fillStyle = '#f8f9fa';
      ctx.beginPath();
      ctx.arc(stump.offset.x, stump.offset.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9d0208';
      ctx.beginPath();
      ctx.arc(stump.offset.x, stump.offset.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}

// Aliases for compatibility
export const MatterRagdoll = PlayerRagdoll;
