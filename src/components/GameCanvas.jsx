// Dual-Layer 960x540 Matter.js Canvas + 320x180 Pixelated CA Overlay + Animated Genie + Camera FX
import React, { useRef, useEffect } from 'react';
import Matter from 'matter-js';
import { CellularGrid, CELL_TYPES } from '../engine/cellularAutomata';
import { MatterRagdoll } from '../engine/ragdoll';
import { createPropFromVerb, renderPropBody } from '../engine/proceduralProps';
import { choreographyRunner } from '../engine/choreographyRunner';
import { drawPixelSprite } from '../data/themes';
import { audioSynth } from '../engine/audioSynth';
import { vfxSystem } from '../engine/vfxSystem';

const { Engine, World, Bodies, Body, Composite, Constraint, Mouse, MouseConstraint, Events } = Matter;

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

export default function GameCanvas({
  theme,
  settings,
  customization,
  wishNumber,
  onDialogueUpdate,
  onWishCompleted,
  resetTrigger
}) {
  const containerRef = useRef(null);
  const matterCanvasRef = useRef(null);
  const caCanvasRef = useRef(null);

  // Engine singletons stored in refs
  const engineRef = useRef(null);
  const floorRef = useRef(null);
  const ceilingSpikesRef = useRef(null);
  const ragdollRef = useRef(null);
  const cellularGridRef = useRef(null);
  const propsRef = useRef([]);
  const activeConstraintsRef = useRef([]);
  const animFrameRef = useRef(null);
  const prevWishNumberRef = useRef(wishNumber);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Animated Genie State (floats at x = 220, y = 220)
  const genieAnimRef = useRef({
    x: 220,
    y: 220,
    targetY: 220,
    frame: 0,
    smokeParticles: []
  });

  // Re-spawns player ragdoll and clears chamber props on next wish or reset
  const resetSandboxStage = (engine, custom) => {
    if (!engine) return;

    vfxSystem.debris = [];
    vfxSystem.shockwaves = [];

    // Remove existing dynamic props
    propsRef.current.forEach((b) => World.remove(engine.world, b));
    propsRef.current = [];

    // Remove active constraints
    activeConstraintsRef.current.forEach((c) => World.remove(engine.world, c));
    activeConstraintsRef.current = [];

    // Remove ceiling spikes if created
    if (ceilingSpikesRef.current) {
      ceilingSpikesRef.current.forEach((s) => World.remove(engine.world, s));
      ceilingSpikesRef.current = null;
    }

    // Restore floor if removed by DELETE_FLOOR modifier
    if (floorRef.current && !engine.world.bodies.includes(floorRef.current)) {
      World.add(engine.world, floorRef.current);
    }

    // Clear falling sand & stains
    if (cellularGridRef.current) {
      cellularGridRef.current.clear();
    }

    // Ensure gravity resets back to normal downward pull
    engine.gravity.x = 0;
    engine.gravity.y = settingsRef.current?.gravity ?? 1.0;

    // Resurrect player ragdoll as a living, pristine human
    if (ragdollRef.current) {
      ragdollRef.current.resurrect(480, 440, custom);
    } else {
      ragdollRef.current = new MatterRagdoll(engine.world, 480, 440, custom || {});
    }
  };

  // Initialize Matter.js Physics Engine & 320x180 Cellular Grid
  useEffect(() => {
    const engine = Engine.create({
      gravity: { x: 0, y: settings?.gravity ?? 1.0 }
    });
    engineRef.current = engine;

    // Chamber Walls (Exact Inner Arena: x=36..924, y=36..504; 300px thick to completely prevent high-speed tunneling)
    const wallOpts = { isStatic: true, restitution: 0.2, friction: 0.9, render: { visible: false } };
    const floor = Bodies.rectangle(CANVAS_WIDTH / 2, 504 + 150, CANVAS_WIDTH + 600, 300, wallOpts); // Top surface at y = 504
    const ceiling = Bodies.rectangle(CANVAS_WIDTH / 2, 36 - 150, CANVAS_WIDTH + 600, 300, wallOpts); // Bottom surface at y = 36
    const leftWall = Bodies.rectangle(36 - 150, CANVAS_HEIGHT / 2, 300, CANVAS_HEIGHT + 600, wallOpts); // Right surface at x = 36
    const rightWall = Bodies.rectangle(924 + 150, CANVAS_HEIGHT / 2, 300, CANVAS_HEIGHT + 600, wallOpts); // Left surface at x = 924

    floorRef.current = floor;
    World.add(engine.world, [floor, ceiling, leftWall, rightWall]);

    // Create 320x180 Cellular Automata Grid
    const cellularGrid = new CellularGrid(320, 180);
    cellularGridRef.current = cellularGrid;

    // Build Player Ragdoll standing at x = 480, y = 440
    const ragdoll = new MatterRagdoll(engine.world, 480, 440, customization || {});
    ragdollRef.current = ragdoll;

    // Mouse Constraint for dragging bodies
    const canvas = matterCanvasRef.current;
    if (canvas) {
      const mouse = Mouse.create(canvas);
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.6,
          render: { visible: false }
        }
      });
      World.add(engine.world, mouseConstraint);
    }

    // Collision Listener: Props impacting the human deal physical damage & trigger fatal events
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        const isRagA = bodyA.label && bodyA.label.startsWith('ragdoll_');
        const isRagB = bodyB.label && bodyB.label.startsWith('ragdoll_');

        if (isRagA || isRagB) {
          const other = isRagA ? bodyB : bodyA;
          const rag = ragdollRef.current;
          if (!rag || rag.isDead) return;

          // If hit by lethal ceiling spikes
          if (other.label === 'ceiling_spike' || other.customData?.isSpike) {
            rag.takeDamage(100, other.position, audioSynth, cellularGridRef.current);
            rag.severJoint('neck', cellularGridRef.current, audioSynth);
          }
          // If hit by falling props (e.g. 2-ton anvil, monster sandwich, car, meteor, safe)
          else if (propsRef.current.includes(other)) {
            const relVel = Math.hypot(
              bodyA.velocity.x - bodyB.velocity.x,
              bodyA.velocity.y - bodyB.velocity.y
            );
            if (relVel > 3.0) {
              const impactDmg = Math.floor(Math.min(100, (other.mass || 10) * relVel * 0.12 + 25));
              rag.takeDamage(impactDmg, other.position, audioSynth, cellularGridRef.current);
              if (impactDmg >= 75 || relVel > 12.0) {
                rag.squash(cellularGridRef.current, audioSynth);
              }
            }
          }
        }
      });
    });

    // Connect Choreography Runner Handlers
    choreographyRunner.handlers = {
      // 1. SPAWN_OBJECT
      onSpawnObject: (params, customPropDef) => {
        if (!engineRef.current) return;
        const newBodies = createPropFromVerb(params, customPropDef);
        newBodies.forEach((body) => {
          propsRef.current.push(body);
          World.add(engineRef.current.world, body);
        });
        // Threat of summoned entity drains human sanity
        ragdollRef.current?.reduceSanity(25, 'PROP_SUMMONED');
      },

      // 2. DESTROY_JOINT
      onDestroyJoint: (joint, bloodBurst) => {
        if (!ragdollRef.current) return;
        ragdollRef.current.severJoint(joint, cellularGridRef.current, audioSynth);
      },

      // 3. APPLY_FORCE
      onApplyForce: (target, fx, fy) => {
        if (!ragdollRef.current) return;
        ragdollRef.current.applyForceToPart(target, fx, fy);
      },

      // 4. MUTATE_PART
      onMutatePart: (params) => {
        if (!ragdollRef.current) return;
        ragdollRef.current.mutatePart(params, cellularGridRef.current, audioSynth);
      },

      // 5. EMIT_PARTICLES
      onEmitParticles: (params) => {
        if (!cellularGridRef.current) return;
        const typeMap = {
          BLOOD: CELL_TYPES.BLOOD,
          FIRE: CELL_TYPES.FIRE,
          ACID: CELL_TYPES.ACID,
          ASH: CELL_TYPES.ASH,
          GOLD: CELL_TYPES.GOLD,
          SPARK: CELL_TYPES.SPARK,
          WATER: CELL_TYPES.WATER,
          LAVA: CELL_TYPES.LAVA,
          OIL: CELL_TYPES.OIL,
          ICE: CELL_TYPES.ICE,
          SMOKE: CELL_TYPES.SMOKE,
          SAND: CELL_TYPES.SAND
        };
        const cellType = typeMap[params.type?.toUpperCase()] || CELL_TYPES.SPARK;
        cellularGridRef.current.spawnCircle(
          params.x ?? 480,
          params.y ?? 440,
          params.spread || 24,
          cellType,
          params.count || 20
        );
      },

      // 6. ATTACH_CONSTRAINT
      onAttachConstraint: (params) => {
        if (!engineRef.current || !ragdollRef.current) return;
        const rag = ragdollRef.current;
        const partBody = rag.parts[params.part] || rag.parts.torso;
        let targetBody = null;
        let pointB = { x: params.world_x || 480, y: params.world_y || 120 };

        if (params.target_type === 'LAST_SPAWNED_PROP' && propsRef.current.length > 0) {
          targetBody = propsRef.current[propsRef.current.length - 1];
          pointB = { x: 0, y: 0 };
        }

        const constr = Constraint.create({
          bodyA: partBody,
          pointA: { x: 0, y: 0 },
          bodyB: targetBody,
          pointB,
          stiffness: params.stiffness || 0.8,
          length: params.length || 10,
          render: { visible: false }
        });

        activeConstraintsRef.current.push(constr);
        World.add(engineRef.current.world, constr);
      },

      // 7. Dialogue & Taunt
      onDialogueUpdate: (dialogue) => {
        if (onDialogueUpdate) onDialogueUpdate(dialogue);
        // Genie's sinister mocking words erode human sanity
        if (dialogue?.speaker && dialogue.speaker.toLowerCase().includes('genie')) {
          ragdollRef.current?.reduceSanity(20, 'GENIE_SPEAKS');
        }
      },

      // 8. Wish Outcome
      onWishCompleted: (scenario) => {
        if (onWishCompleted) onWishCompleted(scenario);
      }
    };

    return () => {
      World.clear(engine.world);
      Engine.clear(engine);
    };
  }, []);

  // Reset sandbox stage on wish sequence change
  useEffect(() => {
    if (wishNumber !== prevWishNumberRef.current) {
      prevWishNumberRef.current = wishNumber;
      if (engineRef.current) {
        choreographyRunner.reset();
        resetSandboxStage(engineRef.current, customization);
      }
    }
  }, [wishNumber, customization]);

  // Handle explicit reset & resurrection trigger from App (Try Again / Reset Sandbox)
  useEffect(() => {
    if (engineRef.current && resetTrigger > 0) {
      choreographyRunner.reset();
      resetSandboxStage(engineRef.current, customization);
    }
  }, [resetTrigger, customization]);

  // Update Ragdoll customization dynamically
  useEffect(() => {
    if (ragdollRef.current && customization?.player) {
      const p = customization.player;
      ragdollRef.current.colors = {
        skin: p.skinColor,
        shirt: p.shirtColor,
        pants: p.pantsColor,
        hair: '#3d2618',
        boots: '#0f172a'
      };
      ragdollRef.current.hatStyle = p.hatStyle || 'NONE';
    }
  }, [customization]);

  // Main 60FPS Game & Physics Render Loop
  useEffect(() => {
    const matterCanvas = matterCanvasRef.current;
    const caCanvas = caCanvasRef.current;
    if (!matterCanvas || !caCanvas) return;

    const mCtx = matterCanvas.getContext('2d');
    const caCtx = caCanvas.getContext('2d');
    if (!mCtx || !caCtx) return;

    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min(0.04, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const engine = engineRef.current;
      const cellular = cellularGridRef.current;
      const ragdoll = ragdollRef.current;

      // 1. Advance Choreography Runner
      choreographyRunner.update(dt);
      const fx = choreographyRunner.cameraFX;
      const mods = choreographyRunner.worldModifiers;

      // Advance Terraria/Stardew VFX Engine (Returns true during crunchy hit-stop micro-freeze)
      const isFrozen = vfxSystem.update(dt);

      // Apply Persistent World Modifiers
      if (engine) {
        engine.gravity.x = mods.gravityActive ? mods.gravity.x : 0;
        engine.gravity.y = mods.gravityActive ? mods.gravity.y : (settingsRef.current?.gravity ?? 1.0);

        // BLACK_HOLE: Accretion disk attractive force + spaghettification
        if (mods.blackHole) {
          const hx = mods.blackHole.x;
          const hy = mods.blackHole.y;
          const strength = mods.blackHole.strength || 0.008;
          const allBodies = Composite.allBodies(engine.world);

          allBodies.forEach((b) => {
            if (b.isStatic) return;
            const dx = hx - b.position.x;
            const dy = hy - b.position.y;
            const dist = Math.hypot(dx, dy) || 1;
            const cappedDist = Math.max(dist, 30);
            const m = b.mass || 1;
            const forceMag = strength * m * 14;

            Body.applyForce(b, b.position, {
              x: (dx / cappedDist) * forceMag,
              y: (dy / cappedDist) * forceMag
            });

            // Spaghettify ragdoll limb if within 45px of event horizon
            if (dist < 45 && ragdoll) {
              const partKey = Object.keys(ragdoll.parts).find((k) => ragdoll.parts[k] === b);
              if (partKey) {
                ragdoll.mutatePart(
                  {
                    part: partKey,
                    scale_x: 0.85,
                    scale_y: 1.25,
                    explode_if_scale_above: 3.0
                  },
                  cellular,
                  audioSynth
                );

                if (partKey === 'head') ragdoll.severJoint('neck', cellular, audioSynth);
                else if (partKey === 'leftArm') ragdoll.severJoint('leftShoulder', cellular, audioSynth);
                else if (partKey === 'rightArm') ragdoll.severJoint('rightShoulder', cellular, audioSynth);
                else if (partKey === 'leftLeg') ragdoll.severJoint('leftHip', cellular, audioSynth);
                else if (partKey === 'rightLeg') ragdoll.severJoint('rightHip', cellular, audioSynth);
              }
            }
          });
        }

        // DELETE_FLOOR: Remove floor static slab and fill bottom with FIRE & ACID
        if (mods.deleteFloor) {
          if (floorRef.current && engine.world.bodies.includes(floorRef.current)) {
            World.remove(engine.world, floorRef.current);
          }
          if (cellular) {
            for (let y = 168; y < 180; y++) {
              for (let x = 1; x < 319; x++) {
                if (Math.random() < 0.2) {
                  const cType = Math.random() < 0.6 ? CELL_TYPES.FIRE : CELL_TYPES.ACID;
                  cellular.set(x, y, cType, 25, (Math.random() - 0.5) * 2, -Math.random() * 2.5);
                }
              }
            }
          }
        }

        // CEILING_SPIKES: Spawn lethal spike bodies along y = 54
        if (mods.ceilingSpikes && !ceilingSpikesRef.current) {
          ceilingSpikesRef.current = [];
          const spikeCount = 20;
          const spacing = (CANVAS_WIDTH - 72) / spikeCount;
          for (let i = 0; i < spikeCount; i++) {
            const sx = 36 + i * spacing + spacing / 2;
            const spike = Bodies.polygon(sx, 54, 3, 14, {
              isStatic: true,
              label: 'ceiling_spike',
              render: { visible: false }
            });
            Body.setAngle(spike, Math.PI); // Point downward into chamber
            ceilingSpikesRef.current.push(spike);
            World.add(engine.world, spike);
          }
        }
      }

      // 2. Physics Step & Aerodynamic/Buoyant custom forces (Pauses during hit-stop)
      if (engine && !isFrozen) {
        propsRef.current.forEach((b) => {
          // Record aerodynamic speed lines & re-entry friction glow
          vfxSystem.recordSpeedStreak(b, b.customData?.spriteKey);

          // Terraria Ground Impact Detection (Shockwave + Food/Spark Debris Explosion)
          if (b.position.y >= 470 && b.velocity.y > 4.5 && !b.hasImpactedFloor) {
            b.hasImpactedFloor = true;
            const intensity = Math.min(2.5, (b.mass || 100) / 110);
            vfxSystem.spawnImpactDebris(b.position.x, 504, b.customData?.spriteKey || b.customData?.propType, intensity);
            vfxSystem.triggerHitStop(2);

            const pKey = String(b.customData?.spriteKey || b.customData?.propType || '').toUpperCase();
            if (pKey.includes('PIANO')) {
              audioSynth.playPianoCrash();
            } else if (pKey.includes('BELL')) {
              audioSynth.playBellGong();
            } else if (pKey.includes('CAR')) {
              audioSynth.playCarCrash();
            } else if (pKey.includes('SANDWICH')) {
              audioSynth.playSplat();
            } else if (pKey.includes('DEER')) {
              audioSynth.playStampede();
            } else if (pKey.includes('SAFE')) {
              audioSynth.playSafeImpact();
            } else {
              audioSynth.playThud(Math.min(1.0, intensity * 0.45));
            }
          }

          if (b.customData?.buoyant) {
            Body.applyForce(b, b.position, {
              x: Math.sin(currentTime * 0.003) * 0.0004 * (b.mass || 1),
              y: -0.00125 * (b.mass || 1)
            });
          } else if (b.customData?.flutter) {
            Body.applyForce(b, b.position, {
              x: Math.sin(currentTime * 0.008 + b.position.y * 0.05) * 0.0005 * (b.mass || 1),
              y: -0.00065 * (b.mass || 1)
            });
          } else if (b.customData?.charge) {
            Body.applyForce(b, b.position, {
              x: -0.012 * (b.mass || 1),
              y: 0
            });
          }
        });

        // Fixed <=16.67ms sub-stepping for rock-solid constraint stability
        let remainingMs = dt * 1000;
        const stepMs = 1000 / 60;
        while (remainingMs > 0) {
          const curStep = Math.min(stepMs, remainingMs);
          Engine.update(engine, curStep);
          remainingMs -= curStep;
        }

        // Safety clamp: keep ragdoll parts inside the visible arena (unless floor deleted)
        Object.values(ragdoll?.parts || {}).forEach((b) => {
          if (!b || b.isStatic) return;
          let clamped = false;
          let nx = b.position.x;
          let ny = b.position.y;
          let vx = b.velocity.x;
          let vy = b.velocity.y;

          if (nx < 42) { nx = 42; vx = Math.abs(vx) * 0.3; clamped = true; }
          if (nx > 918) { nx = 918; vx = -Math.abs(vx) * 0.3; clamped = true; }
          if (ny < 44) { ny = 44; vy = Math.max(0, Math.abs(vy) * 0.25); clamped = true; }
          if (!mods.deleteFloor && ny > 498) { ny = 498; vy = Math.min(0, -Math.abs(vy) * 0.2); clamped = true; }

          if (clamped) {
            Body.setPosition(b, { x: nx, y: ny });
            Body.setVelocity(b, { x: vx, y: vy });
          }
        });

        // Prevent props from vertically escaping above ceiling or tunneling past floor
        propsRef.current.forEach((b) => {
          if (!b || b.isStatic) return;
          if (b.position.y < 38) {
            Body.setPosition(b, { x: b.position.x, y: 38 });
            Body.setVelocity(b, { x: b.velocity.x, y: Math.max(0, Math.abs(b.velocity.y) * 0.2) });
          } else if (!mods.deleteFloor && b.position.y > 504) {
            Body.setPosition(b, { x: b.position.x, y: 500 });
            Body.setVelocity(b, { x: b.velocity.x, y: Math.min(0, b.velocity.y) });
          }
        });
      }

      // 3. Update Ragdoll Stress Severing, Stumps & Posture (with overhead danger tracking)
      if (ragdoll) {
        const nearestFallingProp = propsRef.current.find(
          (b) => b.position.y < 420 && Math.abs(b.position.x - 480) < 160 && b.velocity.y > 2.5
        );
        ragdoll.update(
          cellular,
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
          nearestFallingProp ? nearestFallingProp.position : null
        );
      }

      // 4. Update Cellular Automata Grid & Solid Mask Coupling
      if (cellular && engine) {
        const activeBodies = [...Object.values(ragdoll?.parts || {}), ...propsRef.current];
        cellular.step(
          activeBodies,
          (bodyIdx) => {
            if (ragdoll) ragdoll.onAcidContact(bodyIdx, cellular, audioSynth);
          },
          (bodyIdx, weight) => {
            if (ragdoll) ragdoll.onGoldWeight(bodyIdx, weight);
          }
        );
      }

      // 5. Update Genie Procedural Animation
      const genie = genieAnimRef.current;
      genie.frame++;
      genie.targetY = 220 + Math.sin(genie.frame * 0.05) * 16;
      genie.y += (genie.targetY - genie.y) * 0.05;

      const genieCustom = customization?.genie || theme.genieDefaults;
      if (genie.frame % 3 === 0) {
        genie.smokeParticles.push({
          x: genie.x + (Math.random() * 14 - 7),
          y: genie.y + 36,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 2.2 + Math.random() * 1.2,
          radius: 14 + Math.random() * 8,
          color: Math.random() > 0.5 ? genieCustom.primaryColor : genieCustom.secondaryColor,
          alpha: 0.7,
          life: 40
        });
      }
      genie.smokeParticles.forEach((sp) => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.radius *= 0.97;
        sp.alpha -= 0.016;
      });
      genie.smokeParticles = genie.smokeParticles.filter((sp) => sp.alpha > 0 && sp.radius > 2);

      // ==========================================
      // LAYER 1: 960x540 Matter.js Physics Canvas
      // ==========================================
      mCtx.save();
      mCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Camera FX: Screen Shake
      if (fx.shake > 0) {
        const sx = (Math.random() - 0.5) * fx.shake;
        const sy = (Math.random() - 0.5) * fx.shake;
        mCtx.translate(sx, sy);
      }

      // Camera FX: Zoom on Player
      if (fx.zoomOnPlayer) {
        mCtx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        mCtx.scale(1.15, 1.15);
        mCtx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
      }

      // Chamber Background
      const chamber = theme.chamberColors;
      const bgGrad = mCtx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGrad.addColorStop(0, chamber.bgTop);
      bgGrad.addColorStop(1, chamber.bgBottom);
      mCtx.fillStyle = bgGrad;
      mCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Chamber Stone Wall Brickwork
      mCtx.fillStyle = chamber.brickPrimary;
      mCtx.fillRect(0, 0, 36, CANVAS_HEIGHT); // Left Wall
      mCtx.fillRect(CANVAS_WIDTH - 36, 0, 36, CANVAS_HEIGHT); // Right Wall
      mCtx.fillRect(0, 0, CANVAS_WIDTH, 36); // Ceiling Wall

      // Floor rendering (respects DELETE_FLOOR modifier)
      if (!mods.deleteFloor) {
        mCtx.fillRect(0, 504, CANVAS_WIDTH, 36); // Floor Stone Slab
      } else {
        // Pit of fire & acid
        mCtx.fillStyle = '#2b0938';
        mCtx.fillRect(0, 504, CANVAS_WIDTH, 36);
      }

      // Ceiling Spikes Rendering
      if (ceilingSpikesRef.current && ceilingSpikesRef.current.length > 0) {
        mCtx.fillStyle = '#64748b';
        mCtx.strokeStyle = '#334155';
        mCtx.lineWidth = 1.5;
        ceilingSpikesRef.current.forEach((spike) => {
          mCtx.save();
          mCtx.translate(spike.position.x, spike.position.y);
          mCtx.beginPath();
          mCtx.moveTo(0, 14);
          mCtx.lineTo(-10, -10);
          mCtx.lineTo(10, -10);
          mCtx.closePath();
          mCtx.fill();
          mCtx.stroke();
          mCtx.restore();
        });
      }

      // Animated 16-Bit Torches on Walls (Dynamic radial lighting gradient + flickering flame tongue)
      const flameFlicker = Math.sin(currentTime * 0.014) * 4;
      [50, CANVAS_WIDTH - 50].forEach((tx) => {
        // Torch Dynamic Radial Light Gradient (Terraria Wall Torch Lighting)
        const torchLight = mCtx.createRadialGradient(tx, 220, 4, tx, 220, 115 + flameFlicker);
        torchLight.addColorStop(0, (chamber.torchFlame || '#f97316') + '55');
        torchLight.addColorStop(0.5, (chamber.torchFlame || '#f97316') + '15');
        torchLight.addColorStop(1, 'rgba(0,0,0,0)');
        mCtx.fillStyle = torchLight;
        mCtx.beginPath();
        mCtx.arc(tx, 220, 115 + flameFlicker, 0, Math.PI * 2);
        mCtx.fill();

        // Pixel Torch Iron Bracket
        mCtx.fillStyle = '#475569';
        mCtx.fillRect(tx - 3, 224, 6, 14);

        // Animated Multi-Stage Flame Tongue
        mCtx.fillStyle = chamber.torchFlame || '#f97316';
        mCtx.beginPath();
        mCtx.moveTo(tx - 5, 224);
        mCtx.quadraticCurveTo(tx + flameFlicker * 0.5, 206 - Math.abs(flameFlicker), tx, 200);
        mCtx.quadraticCurveTo(tx - flameFlicker * 0.5, 206, tx + 5, 224);
        mCtx.fill();

        // Inner Yellow/White Hot Core
        mCtx.fillStyle = '#fef08a';
        mCtx.beginPath();
        mCtx.arc(tx, 218, 2.5, 0, Math.PI * 2);
        mCtx.fill();
      });

      // Procedural Floor Cracks from Heavy Impact Collisions
      vfxSystem.renderCracks(mCtx);

      // BLACK_HOLE Accretion Disk Rendering
      if (mods.blackHole) {
        const hx = mods.blackHole.x;
        const hy = mods.blackHole.y;
        mCtx.save();
        mCtx.translate(hx, hy);
        const t = performance.now() * 0.005;
        mCtx.rotate(t);

        const vortexGrad = mCtx.createRadialGradient(0, 0, 8, 0, 0, 75);
        vortexGrad.addColorStop(0, '#000000');
        vortexGrad.addColorStop(0.35, '#7928ca');
        vortexGrad.addColorStop(0.7, '#ff0080');
        vortexGrad.addColorStop(1, 'rgba(0,0,0,0)');
        mCtx.fillStyle = vortexGrad;
        mCtx.beginPath();
        mCtx.ellipse(0, 0, 80, 42, t * 0.4, 0, Math.PI * 2);
        mCtx.fill();

        mCtx.fillStyle = '#000000';
        mCtx.beginPath();
        mCtx.arc(0, 0, 18, 0, Math.PI * 2);
        mCtx.fill();
        mCtx.strokeStyle = '#ffffff';
        mCtx.lineWidth = 2;
        mCtx.stroke();
        mCtx.restore();
      }

      // Render Floating Genie Entity at x = 220, y = 220
      renderGenieEntity(mCtx, genie, theme, genieCustom, currentTime);

      // Render Active Constraints
      mCtx.strokeStyle = '#f8f9fa';
      mCtx.lineWidth = 2;
      activeConstraintsRef.current.forEach((c) => {
        const pA = c.bodyA ? c.bodyA.position : c.pointA;
        const pB = c.bodyB ? c.bodyB.position : c.pointB;
        mCtx.beginPath();
        mCtx.moveTo(pA.x, pA.y);
        mCtx.lineTo(pB.x, pB.y);
        mCtx.stroke();
      });

      // Render Matter Props
      propsRef.current.forEach((body) => {
        renderPropBody(mCtx, body);
      });

      // Render Matter Ragdoll
      if (ragdoll) {
        ragdoll.render(mCtx);
      }

      // Render Terraria & Stardew Valley Layer (Debris, Shockwaves, Emotes, Combat Text, Dust Motes)
      vfxSystem.render(mCtx);

      // Camera FX: Red Gore Flash
      if (fx.redGoreFlash > 0) {
        mCtx.fillStyle = `rgba(239, 35, 60, ${fx.redGoreFlash})`;
        mCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      mCtx.restore();

      // ==========================================
      // LAYER 2: 320x180 Pixelated CA Overlay Canvas
      // ==========================================
      caCtx.clearRect(0, 0, caCanvas.width, caCanvas.height);
      if (cellular) {
        cellular.renderToImageData(caCtx);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [theme, customization, settings]);

  const renderGenieEntity = (ctx, genie, th, genieCustom, currentTime = 0) => {
    ctx.save();
    const archetype = genieCustom.archetype || th.genieDefaults?.archetype || 'DJINN_CLASSIC';
    const primary = genieCustom.primaryColor || th.genieDefaults?.primaryColor || '#06b6d4';
    const secondary = genieCustom.secondaryColor || th.genieDefaults?.secondaryColor || '#f59e0b';
    const eyeColor = genieCustom.eyeColor || th.genieDefaults?.eyeColor || '#fef08a';
    const isCasting = choreographyRunner.isPlaying;
    const relic = genieCustom.relic || th.genieDefaults?.relic || (
      th.id === 'shenron_dragon' ? 'DRAGON_BALL' : th.id === 'corporate_demon' ? 'BLOOD_CONTRACT' : 'MAGIC_LAMP'
    );

    // Relic on ground below Genie
    drawPixelSprite(ctx, relic, genie.x - 24, 456, 48);

    // Relic radiant glow rings when casting
    if (isCasting) {
      const relicPulse = Math.sin(currentTime * 0.008) * 8;
      ctx.save();
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.arc(genie.x, 480, 24 + relicPulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Cosmic Energy Lightning Conduit from Genie to Prop Spawn Rift
    if (isCasting) {
      ctx.save();
      ctx.strokeStyle = primary;
      ctx.lineWidth = 3;
      ctx.shadowColor = primary;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(genie.x + 24, genie.y - 24);
      const steps = 7;
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const lx = (genie.x + 24) + (480 - (genie.x + 24)) * t + (Math.random() - 0.5) * 16;
        const ly = (genie.y - 24) + (80 - (genie.y - 24)) * t + (Math.random() - 0.5) * 16;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Smoke Tail Particles
    genie.smokeParticles.forEach((sp) => {
      ctx.save();
      ctx.globalAlpha = sp.alpha;
      ctx.fillStyle = sp.color;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Swirling Smoky Tail Curve
    ctx.save();
    ctx.strokeStyle = primary;
    ctx.lineWidth = archetype.includes('DRAGON') ? 16 : 12;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(genie.x, 470);
    ctx.bezierCurveTo(genie.x - 45, 380, genie.x - 30, genie.y + 70, genie.x, genie.y + 30);
    ctx.stroke();
    ctx.restore();

    // Genie Torso & Head
    ctx.save();
    ctx.translate(genie.x, genie.y);

    // Aura Glow
    const auraRadius = archetype === 'DRAGON_SUPER' ? 95 : isCasting ? 85 : 65;
    const aura = ctx.createRadialGradient(0, 0, 8, 0, 0, auraRadius);
    aura.addColorStop(0, primary + (isCasting ? 'bb' : '88'));
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Special: Super Shenron Golden Celestial Wings
    if (archetype === 'DRAGON_SUPER') {
      ctx.fillStyle = primary + 'cc';
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.bezierCurveTo(-60, -40, -85, -10, -50, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.bezierCurveTo(60, -40, 85, -10, 50, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Torso: Porunga is much broader and more muscular
    ctx.fillStyle = primary;
    ctx.beginPath();
    if (archetype === 'DRAGON_PORUNGA') {
      ctx.ellipse(0, 10, 36, 24, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(0, 10, 26, 20, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    // Torso Muscle / Accent lines / Spellcasting Arms
    if (archetype === 'DRAGON_PORUNGA') {
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-14, 8, 10, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(14, 8, 10, 0.2, Math.PI - 0.2);
      ctx.stroke();
      // Shoulder spikes
      ctx.fillStyle = '#0f172a';
      [[-36, 4], [36, 4]].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx * 1.25, sy - 14);
        ctx.lineTo(sx * 0.8, sy - 8);
        ctx.closePath();
        ctx.fill();
      });
    } else {
      // Arms: If casting, raise in Boss Spellcasting Stance; otherwise crossed arms
      if (isCasting) {
        ctx.strokeStyle = secondary;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        // Left arm raised
        ctx.beginPath();
        ctx.moveTo(-16, 8);
        ctx.quadraticCurveTo(-34, -10, -26, -24);
        ctx.stroke();
        // Right arm raised
        ctx.beginPath();
        ctx.moveTo(16, 8);
        ctx.quadraticCurveTo(34, -10, 26, -24);
        ctx.stroke();

        // Glowing Spellcasting Hand Orbs
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = secondary;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(-26, -24, 6, 0, Math.PI * 2);
        ctx.arc(26, -24, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Crossed Arms (Calm Idle)
        ctx.strokeStyle = secondary;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 16, 20, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
    }

    // Rotating 3D Arcane Summoning Glyphs (Terraria Boss Aura)
    if (isCasting) {
      const glyphs = ['✦', '룬', '✧', '◈', '⬡', '★'];
      const time = currentTime * 0.0035;
      glyphs.forEach((gl, idx) => {
        const gAngle = time + (idx / glyphs.length) * Math.PI * 2;
        const gx = Math.cos(gAngle) * 50;
        const gy = -26 + Math.sin(gAngle) * 14;
        const gScale = 0.7 + Math.sin(gAngle + Math.PI / 2) * 0.35;
        ctx.save();
        ctx.font = `bold ${Math.floor(14 * gScale)}px sans-serif`;
        ctx.fillStyle = secondary;
        ctx.shadowColor = secondary;
        ctx.shadowBlur = 10;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(gl, gx, gy);
        ctx.restore();
      });
    }

    // Head
    ctx.fillStyle = primary;
    ctx.beginPath();
    ctx.arc(0, -26, archetype === 'DRAGON_PORUNGA' ? 18 : 15, 0, Math.PI * 2);
    ctx.fill();

    // Archetype Horns & Head Adornments
    if (archetype === 'DRAGON_PORUNGA') {
      // Massive horizontal curved black Namekian horns
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-12, -30);
      ctx.bezierCurveTo(-38, -32, -50, -48, -42, -58);
      ctx.bezierCurveTo(-32, -45, -20, -38, -8, -34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(12, -30);
      ctx.bezierCurveTo(38, -32, 50, -48, 42, -58);
      ctx.bezierCurveTo(32, -45, 20, -38, 8, -34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Dorsal Head Fin
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.moveTo(-4, -42);
      ctx.lineTo(0, -52);
      ctx.lineTo(4, -42);
      ctx.closePath();
      ctx.fill();
    } else if (archetype === 'DRAGON_SHENRON' || archetype === 'DRAGON_SHADOW' || archetype === 'DRAGON') {
      // Antler deer horns
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-8, -38);
      ctx.lineTo(-20, -56);
      ctx.moveTo(-15, -48);
      ctx.lineTo(-8, -54);
      ctx.moveTo(8, -38);
      ctx.lineTo(20, -56);
      ctx.moveTo(15, -48);
      ctx.lineTo(8, -54);
      ctx.stroke();

      // Dragon Whiskers
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, -20);
      ctx.bezierCurveTo(-22, -14, -30, -4, -34, 12);
      ctx.moveTo(8, -20);
      ctx.bezierCurveTo(22, -14, 30, -4, 34, 12);
      ctx.stroke();
    } else if (archetype === 'DJINN_IFRIT') {
      // Blazing Magma Horns
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-10, -36);
      ctx.lineTo(-20, -55);
      ctx.lineTo(-6, -42);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, -36);
      ctx.lineTo(20, -55);
      ctx.lineTo(6, -42);
      ctx.closePath();
      ctx.fill();
    } else if (archetype === 'DEMON_BAPHOMET') {
      // Curved Ram Horns
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(-16, -26, 12, Math.PI * 0.8, Math.PI * 1.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(16, -26, 12, -Math.PI * 0.8, -Math.PI * 1.8, true);
      ctx.stroke();
    } else if (archetype.includes('DEMON')) {
      // Classic Devil Horns
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.moveTo(-10, -36);
      ctx.lineTo(-18, -50);
      ctx.lineTo(-4, -40);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, -36);
      ctx.lineTo(18, -50);
      ctx.lineTo(4, -40);
      ctx.closePath();
      ctx.fill();
    } else if (archetype === 'DJINN_CLASSIC' || archetype === 'DJINN') {
      // Turban Crest Jewel
      ctx.fillStyle = secondary;
      ctx.beginPath();
      ctx.arc(0, -40, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing Eyes
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(-5, -26, archetype === 'DRAGON_PORUNGA' ? 4 : 3, 0, Math.PI * 2);
    ctx.arc(5, -26, archetype === 'DRAGON_PORUNGA' ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  };

  return (
    <div
      ref={containerRef}
      onClick={() => audioSynth.unlock()}
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none"
    >
      <div className="relative w-full max-w-[960px] aspect-[960/540] shadow-2xl overflow-hidden border-2 border-slate-800">
        <canvas
          ref={matterCanvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="absolute inset-0 w-full h-full"
        />

        <canvas
          ref={caCanvasRef}
          width={320}
          height={180}
          className="absolute inset-0 w-full h-full pixel-perfect pointer-events-none"
        />

        <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />
        <div className="absolute inset-0 vignette pointer-events-none" />
      </div>
    </div>
  );
}
