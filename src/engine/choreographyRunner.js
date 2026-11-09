// Millisecond Choreography Runner Executing the 8 Atomic Verbs & Stage Sequencer
import { audioSynth } from './audioSynth.js';

export class ChoreographyRunner {
  constructor() {
    this.timeline = [];
    this.elapsedMs = 0;
    this.isPlaying = false;
    this.currentScenario = null;

    // Camera FX state
    this.cameraFX = {
      shake: 0,
      redGoreFlash: 0,
      slowMotion: false,
      slowMotionEndMs: null,
      zoomOnPlayer: false,
      zoomEndMs: null,
      crtGlitch: 0
    };

    // World Modifiers
    this.worldModifiers = {
      gravityActive: false,
      gravity: { x: 0, y: 1.0 },
      gravityRestoreAtMs: null,
      deleteFloor: false,
      blackHole: null,
      blackHoleRestoreAtMs: null,
      ceilingSpikes: false
    };

    // External Event Handlers wired by GameCanvas / App
    this.handlers = {
      onScenarioStart: null,
      onSpawnObject: null,
      onDestroyJoint: null,
      onApplyForce: null,
      onMutatePart: null,
      onEmitParticles: null,
      onAttachConstraint: null,
      onDialogueUpdate: null,
      onWishCompleted: null
    };
  }

  startScenario(scenario) {
    this.currentScenario = scenario;
    this.elapsedMs = 0;
    this.isPlaying = true;

    if (this.handlers.onScenarioStart) {
      this.handlers.onScenarioStart(scenario);
    }

    // Reset camera & world modifiers
    this.cameraFX = {
      shake: 0,
      redGoreFlash: 0,
      slowMotion: false,
      slowMotionEndMs: null,
      zoomOnPlayer: false,
      zoomEndMs: null,
      crtGlitch: 0
    };

    this.worldModifiers = {
      gravityActive: false,
      gravity: { x: 0, y: 1.0 },
      gravityRestoreAtMs: null,
      deleteFloor: false,
      blackHole: null,
      blackHoleRestoreAtMs: null,
      ceilingSpikes: false
    };

    // Load timeline events sorted by time_ms
    const rawTimeline = scenario.choreography_timeline || [];
    this.timeline = [...rawTimeline].sort((a, b) => a.time_ms - b.time_ms);

    // Initial taunt dialogue
    if (this.handlers.onDialogueUpdate) {
      this.handlers.onDialogueUpdate({
        speaker: 'The Genie',
        text: scenario.genie_taunt || 'Your wish is granted...',
        loopholeScore: scenario.loophole_score ?? 95,
        loopholeExplanation: scenario.loophole_explanation || '',
        voicePitch: scenario.voice_pitch || 1.0,
        survived: scenario.survived
      });
    }

    audioSynth.playVoiceBlip((scenario.voice_pitch || 1.0) * 440);
  }

  update(dt) {
    if (!this.isPlaying) return;

    // Apply slow motion if active
    const effectiveDt = this.cameraFX.slowMotion ? dt * 0.35 : dt;
    this.elapsedMs += effectiveDt * 1000;

    // Decay camera effects
    if (this.cameraFX.shake > 0) {
      this.cameraFX.shake = Math.max(0, this.cameraFX.shake - dt * 25);
    }
    if (this.cameraFX.redGoreFlash > 0) {
      this.cameraFX.redGoreFlash = Math.max(0, this.cameraFX.redGoreFlash - dt * 2.0);
    }
    if (this.cameraFX.crtGlitch > 0) {
      this.cameraFX.crtGlitch = Math.max(0, this.cameraFX.crtGlitch - dt * 3.0);
    }

    // Execute scheduled events
    while (this.timeline.length > 0 && this.timeline[0].time_ms <= this.elapsedMs) {
      const event = this.timeline.shift();
      this.executeVerb(event);
    }

    // Expire deterministic Camera FX timers
    if (this.cameraFX.slowMotion && this.cameraFX.slowMotionEndMs !== null && this.elapsedMs >= this.cameraFX.slowMotionEndMs) {
      this.cameraFX.slowMotion = false;
      this.cameraFX.slowMotionEndMs = null;
    }
    if (this.cameraFX.zoomOnPlayer && this.cameraFX.zoomEndMs !== null && this.elapsedMs >= this.cameraFX.zoomEndMs) {
      this.cameraFX.zoomOnPlayer = false;
      this.cameraFX.zoomEndMs = null;
    }

    // Auto-restore temporary gravity inversion / anti-gravity overrides so models fall back down
    if (this.worldModifiers.gravityActive && this.worldModifiers.gravityRestoreAtMs !== null && this.elapsedMs >= this.worldModifiers.gravityRestoreAtMs) {
      this.worldModifiers.gravityActive = false;
      this.worldModifiers.gravity = { x: 0, y: 1.0 };
      this.worldModifiers.gravityRestoreAtMs = null;
    }
    if (this.worldModifiers.blackHole && this.worldModifiers.blackHoleRestoreAtMs !== null && this.elapsedMs >= this.worldModifiers.blackHoleRestoreAtMs) {
      this.worldModifiers.blackHole = null;
      this.worldModifiers.blackHoleRestoreAtMs = null;
    }

    // Completion check
    const maxTime = 4500;
    if (this.timeline.length === 0 && this.elapsedMs > maxTime) {
      this.isPlaying = false;
      this.cameraFX.slowMotion = false;
      this.cameraFX.slowMotionEndMs = null;
      this.cameraFX.zoomOnPlayer = false;
      this.cameraFX.zoomEndMs = null;
      // Ensure negative gravity / singularity never stays stuck permanently after scenario completes
      this.worldModifiers.gravityActive = false;
      this.worldModifiers.gravity = { x: 0, y: 1.0 };
      this.worldModifiers.gravityRestoreAtMs = null;
      this.worldModifiers.blackHole = null;
      this.worldModifiers.blackHoleRestoreAtMs = null;
      if (this.handlers.onWishCompleted && this.currentScenario) {
        this.handlers.onWishCompleted(this.currentScenario);
      }
    }
  }

  executeVerb(event) {
    const { verb, params = {} } = event;

    switch (verb) {
      case 'SPAWN_OBJECT':
        if (this.handlers.onSpawnObject) {
          this.handlers.onSpawnObject(params, this.currentScenario?.custom_prop);
        }
        audioSynth.playThud(0.6);
        break;

      case 'DESTROY_JOINT':
        if (this.handlers.onDestroyJoint) {
          this.handlers.onDestroyJoint(params.joint || 'neck', params.blood_burst ?? 120);
        }
        audioSynth.playBoneCrunch();
        audioSynth.playBloodSpray();
        break;

      case 'APPLY_FORCE':
        if (this.handlers.onApplyForce) {
          this.handlers.onApplyForce(params.target || 'all', params.fx ?? 0, params.fy ?? 0);
        }
        break;

      case 'MUTATE_PART':
        if (this.handlers.onMutatePart) {
          this.handlers.onMutatePart(params);
        }
        break;

      case 'EMIT_PARTICLES':
        if (this.handlers.onEmitParticles) {
          this.handlers.onEmitParticles(params);
        }
        if (params.type === 'FIRE') audioSynth.playLaser();
        else if (params.type === 'GOLD') audioSynth.playCoin();
        else if (params.type === 'BLOOD') audioSynth.playBloodSpray();
        break;

      case 'ATTACH_CONSTRAINT':
        if (this.handlers.onAttachConstraint) {
          this.handlers.onAttachConstraint(params);
        }
        break;

      case 'WORLD_MODIFIER':
        this.executeWorldModifier(params);
        break;

      case 'CAMERA_FX':
        this.executeCameraFX(params);
        break;

      default:
        console.warn('Unknown atomic verb:', verb);
        break;
    }
  }

  executeWorldModifier(params) {
    const { modifier } = params;

    if (modifier === 'GRAVITY') {
      const gy = params.gravity_y ?? 1.0;
      const gx = params.gravity_x ?? 0;
      const duration = typeof params.duration_ms === 'number' ? params.duration_ms : 2600;
      this.worldModifiers.gravityActive = true;
      this.worldModifiers.gravity = { x: gx, y: gy };
      this.worldModifiers.gravityRestoreAtMs = this.elapsedMs + duration;
      audioSynth.playLaser();
    } else if (modifier === 'DELETE_FLOOR') {
      this.worldModifiers.deleteFloor = true;
      audioSynth.playExplosion();
    } else if (modifier === 'BLACK_HOLE') {
      const duration = typeof params.duration_ms === 'number' ? params.duration_ms : 2800;
      this.worldModifiers.blackHole = {
        x: params.x ?? 480,
        y: params.y ?? 250,
        strength: params.strength ?? 0.008
      };
      this.worldModifiers.blackHoleRestoreAtMs = this.elapsedMs + duration;
      audioSynth.playExplosion();
    } else if (modifier === 'CEILING_SPIKES') {
      this.worldModifiers.ceilingSpikes = true;
    }
  }

  executeCameraFX(params) {
    const { effect, intensity = 16, duration_ms = 800 } = params;

    if (effect === 'SCREEN_SHAKE') {
      this.cameraFX.shake = Math.max(this.cameraFX.shake, intensity);
    } else if (effect === 'RED_GORE_FLASH' || effect === 'RED_FLASH') {
      this.cameraFX.redGoreFlash = 0.8;
      audioSynth.playBloodSpray();
    } else if (effect === 'SLOW_MOTION') {
      this.cameraFX.slowMotion = true;
      this.cameraFX.slowMotionEndMs = this.elapsedMs + duration_ms;
    } else if (effect === 'ZOOM_ON_PLAYER') {
      this.cameraFX.zoomOnPlayer = true;
      this.cameraFX.zoomEndMs = this.elapsedMs + duration_ms;
    } else if (effect === 'CRT_GLITCH') {
      this.cameraFX.crtGlitch = 1.0;
    }
  }

  reset() {
    this.timeline = [];
    this.elapsedMs = 0;
    this.isPlaying = false;
    this.currentScenario = null;
    this.cameraFX = {
      shake: 0,
      redGoreFlash: 0,
      slowMotion: false,
      slowMotionEndMs: null,
      zoomOnPlayer: false,
      zoomEndMs: null,
      crtGlitch: 0
    };
    this.worldModifiers = {
      gravityActive: false,
      gravity: { x: 0, y: 1.0 },
      gravityRestoreAtMs: null,
      deleteFloor: false,
      blackHole: null,
      blackHoleRestoreAtMs: null,
      ceilingSpikes: false
    };
  }
}

export const choreographyRunner = new ChoreographyRunner();
