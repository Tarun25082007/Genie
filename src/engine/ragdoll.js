// 6-Part Segmented Matter.js Ragdoll (Exact Coordinates, Joint Destruction, Mutation & Hat Rendering)
import Matter from 'matter-js';
import { audioSynth } from './audioSynth.js';
import { CELL_TYPES } from './cellularAutomata.js';
import { vfxSystem } from './vfxSystem.js';

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
    this.health = 100;
    this.maxHealth = 100;
    this.sanity = 100;
    this.sanityStage = 'SANE'; // 'SANE' | 'NERVOUS' | 'PARANOID' | 'INSANE'
    this.state = 'CALM'; // 'CALM' | 'PANIC' | 'SQUASHED' | 'BURNING' | 'FROZEN' | 'STRETCHED'

    // Terraria & Stardew Valley expressive life properties
    this.spawnImmunityFrames = 90; // Immunity window on resurrection so joints settle smoothly
    this.hurtFlashFrames = 0;
    this.breathCycle = Math.random() * Math.PI * 2;
    this.breathScale = 1.0;
    this.isLookingUp = false;
    this.hasAlerted = false;
    this.hasPanicked = false;
    this.insanityTimer = 0;
    this.insanityAuraAngle = 0;
    this.eyeWander = { x: 0, y: 0 };

    this.initRagdoll(startX, startY);
  }

  setRagdollState(newState, synth = audioSynth) {
    this.state = newState;
    if (newState === 'SQUASHED') {
      synth.playSplat();
    } else if (newState === 'FROZEN') {
      synth.playFreeze();
      Object.keys(this.parts).forEach((k) => {
        this.partTints[k] = '#a5f3fc';
      });
    } else if (newState === 'BURNING') {
      synth.playLaser();
      Object.keys(this.parts).forEach((k) => {
        this.partTints[k] = '#f97316';
      });
    } else if (newState === 'STRETCHED') {
      synth.playBoing();
      Object.values(this.constraints).forEach((c) => {
        if (c) c.length = 18;
      });
    }
  }

  squash(caEngine = null, synth = audioSynth) {
    this.setRagdollState('SQUASHED', synth);
    this.hurtFlashFrames = 8;
    this.isDead = true;
    vfxSystem.triggerHitStop(4);

    if (this.parts.torso) {
      vfxSystem.spawnFloatingText(this.parts.torso.position.x, this.parts.torso.position.y - 15, 'SPLAT!', '#ef233c', 20);
      vfxSystem.spawnSoul(this.parts.torso.position.x, this.parts.torso.position.y);
    }

    if (caEngine && this.parts.torso) {
      const gx = Math.floor(this.parts.torso.position.x / 3);
      const gy = Math.floor(this.parts.torso.position.y / 3);
      caEngine.spawnCircleGrid(gx, gy, 8, CELL_TYPES.BLOOD, 6);
    }
  }

  freeze(synth = audioSynth) {
    this.setRagdollState('FROZEN', synth);
  }

  burn(synth = audioSynth) {
    this.setRagdollState('BURNING', synth);
  }

  stretch(synth = audioSynth) {
    this.setRagdollState('STRETCHED', synth);
  }

  // =========================================================================
  // RESURRECTION & HEALING
  // =========================================================================
  resurrect(x = 480, y = 440, custom = null) {
    // 1. Remove all remnants of previous body & gibs from physics world
    Object.values(this.parts).forEach((p) => {
      if (p) Composite.remove(this.world, p);
    });
    Object.values(this.constraints).forEach((c) => {
      if (c) Composite.remove(this.world, c);
    });
    this.meatChunks.forEach((chunk) => {
      if (chunk.body) Composite.remove(this.world, chunk.body);
    });

    // 2. Reset health, sanity, and bodily integrity to 100% pristine normal human
    this.parts = {};
    this.constraints = {};
    this.stumps = [];
    this.meatChunks = [];
    this.partTints = {};
    this.acidCorrosion = { head: 0, torso: 0, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0 };
    this.isDead = false;
    this.health = 100;
    this.maxHealth = 100;
    this.sanity = 100;
    this.sanityStage = 'SANE';
    this.state = 'CALM';
    this.hurtFlashFrames = 0;
    this.isLookingUp = false;
    this.hasAlerted = false;
    this.hasPanicked = false;
    this.spawnImmunityFrames = 90;
    this.insanityTimer = 0;

    if (custom) {
      this.playerCustom = custom.player || custom;
      this.colors = {
        skin: this.playerCustom.skinColor || '#f5cba7',
        shirt: this.playerCustom.shirtColor || '#3b82f6',
        pants: this.playerCustom.pantsColor || '#1e293b',
        hair: '#3d2618',
        boots: '#0f172a'
      };
      this.hatStyle = this.playerCustom?.hatStyle || 'NONE';
    }

    // 3. Spawn pristine physical ragdoll bodies
    this.initRagdoll(x, y);

    // 4. Divine Resurrection Golden Chime & Aura Burst
    vfxSystem.spawnResurrectionAura(x, y - 10);
    audioSynth.playResurrectionChime();
  }

  // =========================================================================
  // SANITY & MADNESS DESCENT
  // =========================================================================
  reduceSanity(amount, reason = '') {
    if (this.isDead) return;
    const oldStage = this.sanityStage;
    this.sanity = Math.max(0, this.sanity - amount);

    if (this.sanity >= 75) this.sanityStage = 'SANE';
    else if (this.sanity >= 50) this.sanityStage = 'NERVOUS';
    else if (this.sanity >= 25) this.sanityStage = 'PARANOID';
    else this.sanityStage = 'INSANE';

    const hx = this.parts.head?.position?.x || 480;
    const hy = this.parts.head?.position?.y || 400;

    // Trigger stage transition effects
    if (oldStage !== this.sanityStage) {
      if (this.sanityStage === 'NERVOUS') {
        vfxSystem.spawnEmote(hx, hy, 'SWEAT');
        const phrases = ["Wait... what?", "Is it safe?", "What's happening?"];
        vfxSystem.spawnFloatingText(hx, hy - 25, phrases[Math.floor(Math.random() * phrases.length)], '#38bdf8', 13);
      } else if (this.sanityStage === 'PARANOID') {
        this.state = 'PANIC';
        vfxSystem.spawnEmote(hx, hy, 'ALERT');
        audioSynth.playHeartbeat();
        const phrases = ["CANCEL THE WISH!", "WHAT IS THAT?!", "NO NO NO!"];
        vfxSystem.spawnFloatingText(hx, hy - 25, phrases[Math.floor(Math.random() * phrases.length)], '#f97316', 15);
      } else if (this.sanityStage === 'INSANE') {
        this.state = 'PANIC';
        vfxSystem.spawnEmote(hx, hy, 'INSANITY');
        audioSynth.playInsaneLaugh();
        audioSynth.playHeartbeat();
        const phrases = ["HE HE HE...", "THE EYES ARE WATCHING!", "I CAN'T LOOK AWAY!"];
        vfxSystem.spawnFloatingText(hx, hy - 25, phrases[Math.floor(Math.random() * phrases.length)], '#c084fc', 16);
      }
    }
  }

  restoreSanity(amount) {
    this.sanity = Math.min(100, this.sanity + amount);
    if (this.sanity >= 75) this.sanityStage = 'SANE';
    else if (this.sanity >= 50) this.sanityStage = 'NERVOUS';
    else if (this.sanity >= 25) this.sanityStage = 'PARANOID';
    else this.sanityStage = 'INSANE';
  }

  // =========================================================================
  // DAMAGE & ACTUAL DEATH
  // =========================================================================
  takeDamage(amount, sourcePos = null, synth = audioSynth, caEngine = null) {
    if (this.isDead) return;

    this.health = Math.max(0, this.health - amount);
    this.hurtFlashFrames = 10;
    vfxSystem.triggerHitStop(3);

    const hx = this.parts.torso?.position?.x || 480;
    const hy = this.parts.torso?.position?.y || 440;

    vfxSystem.spawnFloatingText(hx, hy - 20, `-${amount}`, '#ef233c', 18);
    synth.playBoneCrunch();

    // Damage also deteriorates sanity
    this.reduceSanity(amount * 0.5);

    if (this.health <= 0) {
      // NOW HE DIES!
      this.isDead = true;
      this.state = 'SQUASHED';
      vfxSystem.spawnSoul(hx, hy);
      vfxSystem.spawnFloatingText(hx, hy - 40, 'R.I.P.', '#fef08a', 20);
      synth.playGoreCrunch();
      synth.playBloodSpray();

      // Dismember neck and limb on fatal trauma
      this.severJoint('neck', caEngine, synth);
      if (Math.random() < 0.6) this.severJoint('leftShoulder', caEngine, synth);
      if (Math.random() < 0.6) this.severJoint('rightShoulder', caEngine, synth);
    }
  }

  initRagdoll(x, y) {
    this.startX = x;
    this.startY = y;
    const dy = y - 440;
    const group = -1;

    // Exact Body Geometry anchored relative to (x, y), matching 480, 440 defaults
    this.parts = {
      head: Bodies.rectangle(x, 400 + dy, 24, 24, {
        collisionFilter: { group },
        density: 0.002,
        friction: 0.5,
        restitution: 0.2,
        label: 'ragdoll_head'
      }),
      torso: Bodies.rectangle(x, 438 + dy, 28, 44, {
        collisionFilter: { group },
        density: 0.004,
        friction: 0.6,
        restitution: 0.1,
        label: 'ragdoll_torso'
      }),
      leftArm: Bodies.rectangle(x - 24, 436 + dy, 12, 36, {
        collisionFilter: { group },
        density: 0.0015,
        friction: 0.4,
        restitution: 0.1,
        label: 'ragdoll_leftArm'
      }),
      rightArm: Bodies.rectangle(x + 24, 436 + dy, 12, 36, {
        collisionFilter: { group },
        density: 0.0015,
        friction: 0.4,
        restitution: 0.1,
        label: 'ragdoll_rightArm'
      }),
      leftLeg: Bodies.rectangle(x - 8, 482 + dy, 12, 40, {
        collisionFilter: { group },
        density: 0.0025,
        friction: 0.8,
        restitution: 0.1,
        label: 'ragdoll_leftLeg'
      }),
      rightLeg: Bodies.rectangle(x + 8, 482 + dy, 12, 40, {
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

    this.constraints.neck.maxStretch = 75;
    this.constraints.leftShoulder.maxStretch = 85;
    this.constraints.rightShoulder.maxStretch = 85;
    this.constraints.leftHip.maxStretch = 85;
    this.constraints.rightHip.maxStretch = 85;

    Object.values(this.constraints).forEach((c) => {
      c.isBroken = false;
    });

    Composite.add(this.world, Object.values(this.parts));
    Composite.add(this.world, Object.values(this.constraints));
  }

  // Active procedural upright standing balance controller
  // Keeps human standing firmly on two feet like a living character
  updatePosture() {
    if (this.isDead || !this.constraints.neck || this.constraints.neck.isBroken) return;

    const torso = this.parts.torso;
    const head = this.parts.head;
    const leftLeg = this.parts.leftLeg;
    const rightLeg = this.parts.rightLeg;
    if (!torso || !head) return;

    const legsIntact =
      leftLeg &&
      rightLeg &&
      !this.constraints.leftHip?.isBroken &&
      !this.constraints.rightHip?.isBroken;

    const legsOnFloor =
      legsIntact && (leftLeg.position.y > this.startY + 26 || rightLeg.position.y > this.startY + 26);

    // 1. Upright torso & head balance torque (gently scaled so it never explodes)
    torso.torque = -torso.angle * 0.08;
    head.torque = -head.angle * 0.06;

    // 2. Active vertical standing spring (ONLY when legs are intact and resting near the floor)
    // Matter.js gravity force per unit mass is ~0.001 at 1G; clamp strictly so ragdoll never rockets upward
    if (legsOnFloor && torso.position.y > this.startY - 8 && torso.position.y < this.startY + 55 && Math.abs(torso.velocity.y) < 6) {
      const targetY = this.startY;
      const dy = targetY - torso.position.y;
      const vy = torso.velocity.y;
      const rawLift = (dy * 0.00012) - (vy * 0.00025);
      const clampedLift = Math.max(-0.0016, Math.min(0.0006, rawLift));
      Body.applyForce(torso, torso.position, { x: 0, y: clampedLift * (torso.mass || 4.9) });
    }

    // 3. Legs posture & horizontal stance stabilization
    if (legsIntact) {
      leftLeg.torque = -leftLeg.angle * 0.05;
      rightLeg.torque = -rightLeg.angle * 0.05;

      // Keep feet planted horizontally under hips when on the floor
      if (leftLeg.position.y > this.startY + 30) {
        Body.setVelocity(leftLeg, { x: leftLeg.velocity.x * 0.85, y: leftLeg.velocity.y });
      }
      if (rightLeg.position.y > this.startY + 30) {
        Body.setVelocity(rightLeg, { x: rightLeg.velocity.x * 0.85, y: rightLeg.velocity.y });
      }
    }

    // 4. Subtle idle breath sway when sane, manic twitches when insane
    if (this.sanityStage === 'SANE') {
      const idleSway = Math.sin(this.breathCycle) * 0.00015;
      Body.applyForce(torso, torso.position, { x: idleSway, y: 0 });
    } else if (this.sanityStage === 'INSANE') {
      if (Math.random() < 0.28) {
        Body.applyForce(torso, torso.position, {
          x: (Math.random() - 0.5) * 0.0015,
          y: Math.random() * 0.0006
        });
      }
    }
  }

  // Automatic Force/Stress Joint Severing (Protected against premature death)
  checkJointStress(caEngine = null, synth = audioSynth) {
    this.updatePosture();

    // Spawn immunity: no breaking during initial physics settling
    if (this.spawnImmunityFrames > 0) {
      this.spawnImmunityFrames--;
      return;
    }

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

      const maxStretch = c.maxStretch || 75;
      // Joint breaking only triggers under extreme impact or tearing trauma
      if ((dist > maxStretch && vRel > 25) || vRel > 65) {
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

      this.hurtFlashFrames = 6;
      vfxSystem.spawnFloatingText(bodyA.position.x, bodyA.position.y - 12, 'CRUNCH!', '#ffd166', 15);
      vfxSystem.triggerHitStop(2);

      if (targetJoint === 'neck') {
        this.isDead = true;
        vfxSystem.spawnSoul(bodyA.position.x, bodyA.position.y);
        vfxSystem.spawnFloatingText(bodyA.position.x, bodyA.position.y - 30, '-999,999', '#ef233c', 18);
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
    const safeSx = Number.isFinite(scale_x) && scale_x > 0 ? Math.max(0.25, Math.min(3.5, scale_x)) : 1.0;
    const safeSy = Number.isFinite(scale_y) && scale_y > 0 ? Math.max(0.25, Math.min(3.5, scale_y)) : 1.0;

    const mutateSingle = (bodyKey) => {
      const body = this.parts[bodyKey];
      if (!body) return;

      const curW = Math.abs(body.bounds.max.x - body.bounds.min.x);
      const curH = Math.abs(body.bounds.max.y - body.bounds.min.y);
      const nextW = curW * safeSx;
      const nextH = curH * safeSy;

      // Guard Matter.js Body.scale against shrinking to a degenerate 0-area sliver or exploding bounds
      if (nextW >= 6 && nextH >= 6 && nextW <= 320 && nextH <= 320 && (safeSx !== 1.0 || safeSy !== 1.0)) {
        Body.scale(body, safeSx, safeSy);
      }
      if (tint) {
        this.partTints[bodyKey] = tint;
      }

      if (Math.max(safeSx, safeSy) >= explode_if_scale_above) {
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

    vfxSystem.spawnFloatingText(pos.x, pos.y - 20, 'GIBBED!', '#ef233c', 20);
    vfxSystem.triggerHitStop(4);
    vfxSystem.spawnSoul(pos.x, pos.y);

    // Emit 450 BLOOD cells in CA engine
    if (caEngine) {
      caEngine.spawnCircle(pos.x, pos.y, 45, CELL_TYPES.BLOOD, 60, 0, 0);
    }

    // Remove the part body from Matter.js world
    Composite.remove(this.world, body);
    delete this.parts[partName];

    // Spawn 8 Terraria gib rigid bodies (bones with marrow, rolling eyeballs, flesh chunks)
    const gibTypes = ['bone', 'eyeball', 'flesh', 'flesh', 'bone', 'flesh', 'flesh', 'flesh'];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const speed = 6 + Math.random() * 8;
      const gibType = gibTypes[i % gibTypes.length];
      const chunk = Bodies.rectangle(
        pos.x + Math.cos(angle) * 12,
        pos.y + Math.sin(angle) * 12,
        gibType === 'bone' ? 12 : gibType === 'eyeball' ? 8 : 8,
        gibType === 'bone' ? 6 : gibType === 'eyeball' ? 8 : 8,
        {
          density: 0.003,
          restitution: gibType === 'eyeball' ? 0.6 : 0.25,
          friction: 0.8,
          label: `gib_${gibType}`
        }
      );
      Body.setVelocity(chunk, {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed - 4
      });
      Body.setAngularVelocity(chunk, (Math.random() - 0.5) * 0.4);

      this.meatChunks.push({
        body: chunk,
        gibType,
        life: 280
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
    } else if (typeof bodyOrIdx === 'number') {
      const keys = Object.keys(this.parts);
      if (bodyOrIdx < 0 || bodyOrIdx >= keys.length) return;
      partKey = keys[bodyOrIdx];
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
    if (typeof bodyOrIdx === 'number' && (bodyOrIdx < 0 || bodyOrIdx >= Object.keys(this.parts).length)) {
      return;
    }
    const target = this.parts.torso || this.parts.head;
    if (target) {
      Body.applyForce(target, target.position, { x: 0, y: force });
    }
  }

  update(cellularGrid = null, worldWidth = 960, worldHeight = 540, dangerPos = null) {
    // 1. Idle breathing cycle when alive and intact
    if (!this.isDead && this.state !== 'SQUASHED') {
      this.breathCycle = (this.breathCycle || 0) + 0.055;
      this.breathScale = 1.0 + Math.sin(this.breathCycle) * 0.038;
    } else {
      this.breathScale = 1.0;
    }

    if (this.hurtFlashFrames > 0) {
      this.hurtFlashFrames--;
    }

    // 2. Sanity behaviors and idle ticks
    if (!this.isDead) {
      this.insanityTimer = (this.insanityTimer || 0) + 1;
      this.insanityAuraAngle = (this.insanityAuraAngle || 0) + 0.08;

      if (this.sanityStage === 'NERVOUS') {
        if (this.insanityTimer % 35 === 0) {
          this.eyeWander = {
            x: (Math.random() - 0.5) * 3,
            y: (Math.random() - 0.5) * 2
          };
        }
      } else if (this.sanityStage === 'INSANE') {
        // Periodic madness screams every 2.5 seconds
        if (this.insanityTimer % 150 === 0 && this.parts.head) {
          const screams = ["HEHEHE!", "TOO LATE!", "THE PAW DEMANDS IT!", "I CAN'T LOOK!"];
          vfxSystem.spawnFloatingText(
            this.parts.head.position.x,
            this.parts.head.position.y - 30,
            screams[Math.floor(Math.random() * screams.length)],
            '#c084fc',
            14
          );
          if (Math.random() < 0.4) audioSynth.playInsaneLaugh();
        }
      }
    }

    // 3. Terraria / Stardew Eye Tracking & Dread from Falling Danger
    if (dangerPos && this.parts.head && !this.isDead && this.state !== 'SQUASHED') {
      const headX = this.parts.head.position.x;
      const headY = this.parts.head.position.y;
      const dx = dangerPos.x - headX;
      const dy = dangerPos.y - headY;
      const dist = Math.hypot(dx, dy);

      if (dy < 0 && Math.abs(dx) < 220) {
        this.isLookingUp = true;

        // Approaching danger drains sanity rapidly
        if (dist < 320) {
          this.reduceSanity(0.4, 'DANGER_APPROACHING');
        }
        if (dist < 180) {
          this.reduceSanity(0.9, 'DANGER_IMMINENT');
        }

        if (dist < 260 && !this.hasAlerted) {
          this.hasAlerted = true;
          vfxSystem.spawnEmote(headX, headY, 'SWEAT');
        }

        if (dist < 130 && !this.hasPanicked) {
          this.hasPanicked = true;
          this.state = 'PANIC';
          vfxSystem.spawnEmote(headX, headY, 'SKULL');
        }
      } else {
        this.isLookingUp = false;
      }
    } else {
      this.isLookingUp = false;
      if (!dangerPos) {
        this.hasAlerted = false;
        this.hasPanicked = false;
      }
    }

    // 4. Natural Stress Severing & Upright Posture Update
    this.checkJointStress(cellularGrid, audioSynth);

    // 4. Stump Blood Spurts
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

            cellularGrid.spawnCircleGrid(gx, gy, 3, CELL_TYPES.BLOOD, 2);

            if (stump.bloodTicks % 30 === 0) {
              audioSynth.playBloodSpray();
            }
          }
        }
      });

      this.stumps = this.stumps.filter((s) => s.bloodTicks > 0);
    }

    // 5. Clean up decaying meat chunks
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

      // Idle chest breathing
      if (body === p.torso && !this.isDead && this.state !== 'SQUASHED') {
        ctx.scale(1.0, this.breathScale || 1.0);
      }

      if (this.state === 'SQUASHED') {
        ctx.scale(3.2, 0.16);
      }

      // Terraria Hurt Flash White/Red
      if (this.hurtFlashFrames > 0) {
        ctx.fillStyle = this.hurtFlashFrames % 2 === 0 ? '#ffffff' : '#ef233c';
      } else {
        const bodyKey = Object.keys(this.parts).find((k) => this.parts[k] === body);
        ctx.fillStyle = this.partTints[bodyKey] || defaultColor;
      }
      ctx.fillRect(-w / 2, -h / 2, w, h);

      if (this.state === 'FROZEN') {
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
      } else if (border) {
        ctx.strokeStyle = border;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
      }

      if (this.state === 'BURNING') {
        ctx.fillStyle = Math.random() > 0.5 ? '#ff4500' : '#ffd700';
        ctx.fillRect(-w / 2 + Math.random() * w, -h / 2 - 6, 4, 6);
      }

      ctx.restore();
    };

    // Render Meat Chunks (Terraria Gibs: Bones with marrow, bouncing eyeballs, flesh)
    this.meatChunks.forEach((chunk) => {
      ctx.save();
      ctx.translate(chunk.body.position.x, chunk.body.position.y);
      ctx.rotate(chunk.body.angle);

      if (chunk.gibType === 'bone') {
        // Pixel Bone with crimson joints
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-6, -2, 12, 4);
        ctx.fillStyle = '#ef233c';
        ctx.fillRect(-7, -3, 3, 6);
        ctx.fillRect(4, -3, 3, 6);
      } else if (chunk.gibType === 'eyeball') {
        // Eyeball rolling along floor
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-1, -2, 3, 3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, -1, 1.5, 1.5);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-3, 1);
        ctx.lineTo(-7, 3);
        ctx.stroke();
      } else {
        // Flesh chunk
        ctx.fillStyle = '#9d0208';
        ctx.fillRect(-4, -4, 8, 8);
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(-1, -1, 3, 3);
      }

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

      if (this.state === 'SQUASHED') {
        ctx.scale(3.2, 0.16);
      }

      // Hurt flash or skin tint
      const headTint = this.hurtFlashFrames > 0
        ? (this.hurtFlashFrames % 2 === 0 ? '#ffffff' : '#ef233c')
        : (this.partTints.head || (this.state === 'FROZEN' ? '#a5f3fc' : c.skin));

      ctx.fillStyle = headTint;
      ctx.fillRect(-12, -12, 24, 24);

      // Hair cap
      ctx.fillStyle = c.hair;
      ctx.fillRect(-12, -12, 24, 6);

      // Eyes & Expression Rendering based on Health and Sanity Stage
      if (this.isDead || this.constraints.neck?.isBroken || this.state === 'SQUASHED') {
        // Dead or Squashed X_X eyes
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        [[-6, -2], [6, -2]].forEach(([ex, ey]) => {
          ctx.beginPath();
          ctx.moveTo(ex - 3, ey - 3); ctx.lineTo(ex + 3, ey + 3);
          ctx.moveTo(ex + 3, ey - 3); ctx.lineTo(ex - 3, ey + 3);
          ctx.stroke();
        });
        // Squashed tongue/mouth
        ctx.fillStyle = '#ef233c';
        ctx.beginPath();
        ctx.arc(0, 5, 4, 0, Math.PI);
        ctx.fill();
      } else if (this.sanityStage === 'INSANE') {
        // ========================================================
        // STAGE 4: COMPLETE MADNESS / INSANITY
        // ========================================================
        // Purple Eldritch paranoia aura
        ctx.save();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#d946ef';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 16 + Math.sin(this.insanityAuraAngle) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Mismatched crazy eyes (Left: large hypnotic eye, Right: twitching pinprick)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6, -2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.arc(-6, -2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-6 + Math.sin(this.insanityAuraAngle * 2) * 1.5, -2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(6, -2, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(5 + (Math.random() - 0.5) * 1.5, -3 + (Math.random() - 0.5) * 1.5, 2, 2);

        // Manic jagged grin with teeth
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, 4, 6, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, 4, 2, 2);
        ctx.fillRect(0, 4, 2, 2);
        ctx.fillRect(3, 4, 2, 2);
      } else if (this.isLookingUp || this.sanityStage === 'PARANOID') {
        // ========================================================
        // STAGE 3: PARANOID / PANIC (Looking up in dread at doom)
        // ========================================================
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-8, -6, 6, 6);
        ctx.fillRect(2, -6, 6, 6);
        // Pupils rolled straight up
        ctx.fillStyle = '#000000';
        ctx.fillRect(-6, -6, 2.5, 2.5);
        ctx.fillRect(4, -6, 2.5, 2.5);

        // Sweating forehead droplet
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-10, -6, 2, 0, Math.PI * 2);
        ctx.fill();

        // Screaming oval mouth
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(0, 4, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.sanityStage === 'NERVOUS') {
        // ========================================================
        // STAGE 2: NERVOUS / UNEASY
        // ========================================================
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-7, -4, 5, 5);
        ctx.fillRect(3, -4, 5, 5);
        // Darting pupils
        const wx = this.eyeWander?.x || 0;
        const wy = this.eyeWander?.y || 0;
        ctx.fillStyle = '#000000';
        ctx.fillRect(-6 + wx, -3 + wy, 2.5, 2.5);
        ctx.fillRect(4 + wx, -3 + wy, 2.5, 2.5);

        // Uneasy wavy mouth
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-4, 4);
        ctx.quadraticCurveTo(-1, 2, 1, 4);
        ctx.quadraticCurveTo(3, 6, 5, 4);
        ctx.stroke();
      } else {
        // ========================================================
        // STAGE 1: SANE / HOPEFUL (Normal living human)
        // ========================================================
        const isBlinking = (Math.floor(performance.now() / 140) % 24) === 0;
        if (isBlinking) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-8, -2); ctx.lineTo(-3, -2);
          ctx.moveTo(3, -2); ctx.lineTo(8, -2);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#000000';
          ctx.fillRect(-7, -3, 3, 3);
          ctx.fillRect(4, -3, 3, 3);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-7, -3, 1, 1);
          ctx.fillRect(4, -3, 1, 1);
        }
        // Peaceful curved smile
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 3, 4, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Rosy cheeks
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.beginPath();
        ctx.arc(-8, 2, 2, 0, Math.PI * 2);
        ctx.arc(8, 2, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Miniature Sanity / Mind Bar above head when alive
      if (!this.isDead && this.sanity < 100) {
        const barW = 28;
        const barH = 3.5;
        const barY = -22;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(-barW / 2 - 1, barY - 1, barW + 2, barH + 2);

        const sanityPct = Math.max(0, this.sanity / 100);
        const fillW = Math.floor(barW * sanityPct);
        const barColor = this.sanityStage === 'INSANE'
          ? '#c084fc'
          : this.sanityStage === 'PARANOID'
          ? '#f97316'
          : this.sanityStage === 'NERVOUS'
          ? '#06b6d4'
          : '#10b981';

        ctx.fillStyle = barColor;
        ctx.fillRect(-barW / 2, barY, fillW, barH);
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
