// Dual-Layer 960x540 Matter.js Canvas + 320x180 Pixelated CA Overlay + Animated Genie + Camera FX
import React, { useRef, useEffect } from 'react';
import Matter from 'matter-js';
import { CellularGrid, CELL_TYPES } from '../engine/cellularAutomata';
import { MatterRagdoll } from '../engine/ragdoll';
import { createPropFromVerb, renderPropBody } from '../engine/proceduralProps';
import { choreographyRunner } from '../engine/choreographyRunner';
import { drawPixelSprite } from '../data/themes';
import { audioSynth } from '../engine/audioSynth';

const { Engine, World, Bodies, Body, Composite, Constraint, Mouse, MouseConstraint } = Matter;

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

export default function GameCanvas({
  theme,
  settings,
  activeTool,
  customization,
  wishNumber,
  onDialogueUpdate,
  onWishCompleted
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

  // Animated Genie State (floats at x = 220, y = 220)
  const genieAnimRef = useRef({
    x: 220,
    y: 220,
    targetY: 220,
    frame: 0,
    smokeParticles: []
  });

  // Pointer state for sandbox brush
  const pointerRef = useRef({
    isDown: false,
    x: 0,
    y: 0
  });

  // Re-spawns player ragdoll and clears chamber props on next wish or reset
  const resetSandboxStage = (engine, custom) => {
    if (!engine) return;

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

    // Remove old ragdoll parts and constraints
    if (ragdollRef.current) {
      Object.values(ragdollRef.current.parts).forEach((p) => {
        if (p) World.remove(engine.world, p);
      });
      Object.values(ragdollRef.current.constraints).forEach((c) => {
        if (c) World.remove(engine.world, c);
      });
      ragdollRef.current.meatChunks.forEach((chunk) => {
        World.remove(engine.world, chunk.body);
      });
    }

    // Spawn fresh player ragdoll at x = 480, y = 440
    ragdollRef.current = new MatterRagdoll(engine.world, 480, 440, custom || {});
  };

  // Initialize Matter.js Physics Engine & 320x180 Cellular Grid
  useEffect(() => {
    const engine = Engine.create({
      gravity: { x: 0, y: settings?.gravity ?? 1.0 }
    });
    engineRef.current = engine;

    // Chamber Walls (Exact Coordinates: 0..36px left/top, 924..960px right, floor surface at y = 504px)
    const wallOpts = { isStatic: true, restitution: 0.2, friction: 0.9, render: { visible: false } };
    const floor = Bodies.rectangle(CANVAS_WIDTH / 2, 522, CANVAS_WIDTH, 36, wallOpts); // Top surface at y = 504
    const ceiling = Bodies.rectangle(CANVAS_WIDTH / 2, 18, CANVAS_WIDTH, 36, wallOpts); // Bottom at y = 36
    const leftWall = Bodies.rectangle(18, CANVAS_HEIGHT / 2, 36, CANVAS_HEIGHT, wallOpts); // Right at x = 36
    const rightWall = Bodies.rectangle(942, CANVAS_HEIGHT / 2, 36, CANVAS_HEIGHT, wallOpts); // Left at x = 924

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
          SPARK: CELL_TYPES.SPARK
        };
        const cellType = typeMap[params.type] || CELL_TYPES.SPARK;
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
        resetSandboxStage(engineRef.current, customization);
      }
    }
  }, [wishNumber, customization]);

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

      // Apply Persistent World Modifiers
      if (engine) {
        engine.gravity.x = mods.gravity.x;
        engine.gravity.y = mods.gravity.y;

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

      // 2. Physics Step
      if (engine) {
        Engine.update(engine, dt * 1000);
      }

      // 3. Update Ragdoll Stress Severing, Stumps & Posture
      if (ragdoll) {
        ragdoll.update(cellular, CANVAS_WIDTH, CANVAS_HEIGHT);
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

      // 5. Handle Pointer Sandbox Brush Painting
      if (pointerRef.current.isDown && activeTool !== 'none' && cellular) {
        const scaleX = cellular.cols / CANVAS_WIDTH;
        const scaleY = cellular.rows / CANVAS_HEIGHT;
        const gx = Math.floor(pointerRef.current.x * scaleX);
        const gy = Math.floor(pointerRef.current.y * scaleY);

        const toolTypeMap = {
          blood: CELL_TYPES.BLOOD,
          fire: CELL_TYPES.FIRE,
          acid: CELL_TYPES.ACID,
          ash: CELL_TYPES.ASH,
          gold: CELL_TYPES.GOLD,
          wall: CELL_TYPES.WALL,
          spark: CELL_TYPES.SPARK
        };
        const cType = toolTypeMap[activeTool];
        if (cType !== undefined) {
          cellular.spawnCircle(gx, gy, 6, cType, 8);
        }
      }

      // 6. Update Genie Procedural Animation
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

      // Decorative Torches on Walls
      mCtx.fillStyle = chamber.torchFlame;
      mCtx.shadowColor = chamber.torchFlame;
      mCtx.shadowBlur = 15;
      mCtx.beginPath();
      mCtx.arc(50, 220, 6, 0, Math.PI * 2);
      mCtx.arc(CANVAS_WIDTH - 50, 220, 6, 0, Math.PI * 2);
      mCtx.fill();
      mCtx.shadowBlur = 0;

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
      renderGenieEntity(mCtx, genie, theme, genieCustom);

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
  }, [theme, customization, activeTool, settings]);

  const renderGenieEntity = (ctx, genie, th, genieCustom) => {
    ctx.save();
    const archetype = genieCustom.archetype || th.genieDefaults?.archetype || 'DJINN_CLASSIC';
    const primary = genieCustom.primaryColor || th.genieDefaults?.primaryColor || '#06b6d4';
    const secondary = genieCustom.secondaryColor || th.genieDefaults?.secondaryColor || '#f59e0b';
    const eyeColor = genieCustom.eyeColor || th.genieDefaults?.eyeColor || '#fef08a';
    const relic = genieCustom.relic || th.genieDefaults?.relic || (
      th.id === 'shenron_dragon' ? 'DRAGON_BALL' : th.id === 'corporate_demon' ? 'BLOOD_CONTRACT' : 'MAGIC_LAMP'
    );

    // Relic on ground below Genie
    drawPixelSprite(ctx, relic, genie.x - 24, 456, 48);

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
    const auraRadius = archetype === 'DRAGON_SUPER' ? 85 : 65;
    const aura = ctx.createRadialGradient(0, 0, 8, 0, 0, auraRadius);
    aura.addColorStop(0, primary + '88');
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

    // Torso Muscle / Accent lines
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
      ctx.fillStyle = '#1e293b';
      [[-36, 4], [36, 4]].forEach(([sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx * 1.25, sy - 14);
        ctx.lineTo(sx * 0.8, sy - 8);
        ctx.closePath();
        ctx.fill();
      });
    } else {
      // Crossed Arms
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 16, 20, 0.2, Math.PI - 0.2);
      ctx.stroke();
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

  const handlePointerDown = (e) => {
    audioSynth.unlock();
    const rect = matterCanvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    pointerRef.current.x = (e.clientX - rect.left) * scaleX;
    pointerRef.current.y = (e.clientY - rect.top) * scaleY;
    pointerRef.current.isDown = true;
  };

  const handlePointerMove = (e) => {
    const rect = matterCanvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    pointerRef.current.x = (e.clientX - rect.left) * scaleX;
    pointerRef.current.y = (e.clientY - rect.top) * scaleY;
  };

  const handlePointerUp = () => {
    pointerRef.current.isDown = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
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
