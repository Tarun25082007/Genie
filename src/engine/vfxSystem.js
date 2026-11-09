// Terraria & Stardew Valley Tier Retro Animation & VFX Engine for GENIE
// Manages: Emote Bubbles, Bouncy Combat Text, Atmospheric Speed Lines, Debris Explosions,
// Shockwaves, Ground Fractures, Ascending Souls, Ambient Dust Motes & Hit-Stop Micro-Freezes

import { audioSynth } from './audioSynth.js';

export class VFXSystem {
  constructor() {
    this.emotes = [];         // Above-head emotion bubbles (!, ?, 💦, 💀, 💖, 💫)
    this.floatingTexts = [];   // Bouncy Terraria damage/slapstick popups (CRUNCH!, SPLAT!, -999,999)
    this.debris = [];          // Food slices, metal sparks, coins, bone fragments, dust puffs
    this.shockwaves = [];      // Expanding impact rings along floor
    this.cracks = [];          // Persistent stone impact fractures
    this.dustMotes = [];       // Ambient drifting dungeon dust & embers
    this.ghosts = [];          // Ascending pixel souls on ragdoll demise
    this.speedLines = [];      // High-speed re-entry friction trails
    this.hitStopFrames = 0;    // Micro-freeze frames for crunchy physical impacts

    this.initAmbientMotes(32);
  }

  // Populate floating ambient dungeon dust motes
  initAmbientMotes(count = 32) {
    this.dustMotes = [];
    for (let i = 0; i < count; i++) {
      this.dustMotes.push({
        x: Math.random() * 960,
        y: Math.random() * 540,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.15 - Math.random() * 0.25,
        radius: 1 + Math.random() * 1.5,
        alpha: 0.2 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        isEmber: Math.random() < 0.25
      });
    }
  }

  // Trigger hit-stop micro-freeze (e.g. 3-4 frames = 50-70ms)
  triggerHitStop(frames = 3) {
    this.hitStopFrames = Math.max(this.hitStopFrames, frames);
  }

  // =========================================================================
  // 1. STARDEW / TERRARIA EMOTE BUBBLES
  // =========================================================================
  spawnEmote(x, y, type = 'ALERT') {
    // Types: 'ALERT' (!), 'SWEAT' (💦), 'QUESTION' (?), 'SKULL' (💀), 'HEART' (💖), 'DIZZY' (💫)
    this.emotes.push({
      x,
      y: y - 48,
      type,
      scale: 0.1,
      targetScale: 1.0,
      alpha: 1.0,
      life: 90,
      maxLife: 90,
      vy: -0.4,
      bounceOffset: 0
    });

    if (type === 'ALERT') {
      audioSynth.playVoiceBlip(580);
    } else if (type === 'HEART') {
      audioSynth.playChime();
    }
  }

  // =========================================================================
  // 2. TERRARIA BOUNCY COMBAT & SLAPSTICK TEXT
  // =========================================================================
  spawnFloatingText(x, y, text, color = '#ffd166', size = 14) {
    const angle = (Math.random() - 0.5) * 0.6;
    const speed = 4.5 + Math.random() * 2.5;
    this.floatingTexts.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y - 10,
      text,
      color,
      size,
      vx: Math.sin(angle) * speed * 0.6,
      vy: -Math.cos(angle) * speed,
      scale: 1.4,
      alpha: 1.0,
      bounces: 2,
      life: 80,
      maxLife: 80
    });
  }

  // =========================================================================
  // 3. PROP-SPECIFIC IMPACT DEBRIS EXPLOSION
  // =========================================================================
  spawnImpactDebris(x, y, propType = 'GENERIC', intensity = 1.0) {
    const count = Math.floor(18 * intensity);

    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.1 - Math.random() * Math.PI * 0.8;
      const speed = (4 + Math.random() * 9) * intensity;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      let debrisType = 'dust';
      let color = '#94a3b8';
      let size = 3 + Math.random() * 3;
      let rotation = Math.random() * Math.PI * 2;
      let rotSpeed = (Math.random() - 0.5) * 0.4;
      let bounce = 0.45;

      const pUpper = String(propType).toUpperCase();

      if (pUpper.includes('SANDWICH') || pUpper.includes('BLT') || pUpper.includes('SUB')) {
        // Bacon slice, tomato wedge, lettuce shred, cheese, bread crumb
        const r = Math.random();
        if (r < 0.25) { debrisType = 'lettuce'; color = '#38b000'; size = 7; }
        else if (r < 0.5) { debrisType = 'tomato'; color = '#d90429'; size = 6; }
        else if (r < 0.75) { debrisType = 'bacon'; color = '#7f1d1d'; size = 8; }
        else { debrisType = 'crumb'; color = '#e9c46a'; size = 4; }
      } else if (pUpper.includes('GOLD') || pUpper.includes('COIN') || pUpper.includes('MONEY')) {
        debrisType = 'coin';
        color = '#ffd166';
        size = 5;
        bounce = 0.7;
      } else if (pUpper.includes('PIANO')) {
        debrisType = Math.random() < 0.6 ? 'piano_key' : 'sheet_music';
        color = Math.random() < 0.5 ? '#ffffff' : '#0f172a';
        size = 6;
        bounce = 0.6;
      } else if (pUpper.includes('BELL')) {
        debrisType = 'bronze_spark';
        color = '#d97706';
        size = 5;
        bounce = 0.65;
      } else if (pUpper.includes('CAR') || pUpper.includes('SAFE') || pUpper.includes('ANVIL')) {
        debrisType = Math.random() < 0.6 ? 'spark' : 'shrapnel';
        color = Math.random() < 0.5 ? '#f8f9fa' : '#fbbf24';
        size = 3;
        bounce = 0.55;
      } else if (
        pUpper.includes('METEOR') ||
        pUpper.includes('FIRE') ||
        pUpper.includes('DRAGON') ||
        pUpper.includes('WYRM') ||
        pUpper.includes('NUKE') ||
        pUpper.includes('BOMB') ||
        pUpper.includes('LAVA')
      ) {
        debrisType = 'fire_spark';
        color = Math.random() < 0.5 ? '#ef4444' : '#f97316';
        size = 4;
        bounce = 0.3;
      } else {
        debrisType = 'stone_chip';
        color = '#64748b';
        size = 3;
      }

      this.debris.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y - 4,
        vx,
        vy,
        debrisType,
        color,
        size,
        rotation,
        rotSpeed,
        bounce,
        gravity: 0.38,
        alpha: 1.0,
        life: 60 + Math.random() * 40,
        maxLife: 90
      });
    }

    // Expanding Ground Shockwave Ring
    this.spawnShockwave(x, 504, intensity, '#f8fafc');

    // Procedural Ground Fractures
    if (intensity > 0.8) {
      this.spawnFracture(x, 504, 3 + Math.floor(intensity * 2));
    }
  }

  spawnShockwave(x, y = 504, intensity = 1.0, color = '#f8fafc') {
    const safeIntensity = Math.max(0.4, Math.min(3.0, Number(intensity) || 1.0));
    this.shockwaves.push({
      x,
      y,
      radiusX: 8,
      radiusY: 4,
      maxRadiusX: 110 * Math.min(2.0, safeIntensity),
      maxRadiusY: 18 * Math.min(2.0, safeIntensity),
      speed: 7.5 * safeIntensity,
      alpha: 0.85,
      color
    });
  }

  reset() {
    this.emotes = [];
    this.floatingTexts = [];
    this.debris = [];
    this.shockwaves = [];
    this.cracks = [];
    this.ghosts = [];
    this.speedLines = [];
    this.hitStopFrames = 0;
    this.dustMotes = this.dustMotes.filter((m) => m.life === undefined);
  }

  // Stone slab fracture cracks on massive collisions
  spawnFracture(originX, originY, branches = 3) {
    for (let b = 0; b < branches; b++) {
      const pts = [{ x: originX, y: originY }];
      let cx = originX;
      let cy = originY;
      const dirX = (Math.random() - 0.5) * 2;
      const length = 20 + Math.random() * 35;

      for (let s = 0; s < 5; s++) {
        cx += (dirX * (length / 5)) + (Math.random() - 0.5) * 8;
        cy += (Math.random() * 4) + 1;
        pts.push({ x: cx, y: Math.min(522, cy) });
      }

      this.cracks.push({
        points: pts,
        alpha: 0.85,
        life: 600 // Fades very slowly over 10 seconds
      });
    }
  }

  // =========================================================================
  // 4. ASCENDING PIXEL SOUL (STARDEW/TERRARIA GHOST ON DEATH)
  // =========================================================================
  spawnSoul(x, y) {
    this.ghosts.push({
      x,
      y,
      baseX: x,
      vy: -1.2,
      alpha: 0.85,
      phase: 0,
      haloColor: '#fef08a',
      life: 140
    });
  }

  // Divine Golden Pillar & Sparkle Burst on Human Resurrection
  spawnResurrectionAura(x, y) {
    // Expanding golden shockwaves
    this.spawnShockwave(x, y + 20, 2.2, '#ffd166');
    this.spawnShockwave(x, y + 20, 1.4, '#ffffff');

    // Rising divine spark motes
    for (let i = 0; i < 18; i++) {
      this.dustMotes.push({
        x: x + (Math.random() - 0.5) * 36,
        y: y + 20 + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -2.5 - Math.random() * 3.0,
        radius: 2 + Math.random() * 2,
        alpha: 0.9,
        phase: Math.random() * Math.PI * 2,
        life: 45 + Math.floor(Math.random() * 25),
        isEmber: true
      });
    }

    // Bouncy Gold Floating Text
    this.spawnFloatingText(x, y - 50, 'RESURRECTED!', '#ffd166', 17);
  }

  // =========================================================================
  // 5. HIGH-SPEED ATMOSPHERIC STREAKS
  // =========================================================================
  recordSpeedStreak(body, spriteKey = 'GENERIC') {
    const speed = Math.hypot(body.velocity.x, body.velocity.y);
    if (speed > 8.0) {
      if (this.speedLines.length >= 160) {
        this.speedLines.shift();
      }
      this.speedLines.push({
        x: body.position.x + (Math.random() - 0.5) * 28,
        y: body.position.y - 20 - Math.random() * 10,
        vx: -body.velocity.x * 0.25,
        vy: -body.velocity.y * 0.35,
        length: speed * 3.5,
        angle: Math.atan2(body.velocity.y, body.velocity.x) + Math.PI,
        color: speed > 16 ? '#f97316' : '#94a3b8',
        alpha: Math.min(0.85, speed * 0.04),
        life: 14
      });
    }
  }

  // =========================================================================
  // MAIN UPDATE LOOP (Called every 60FPS frame)
  // =========================================================================
  update(dt = 0.016) {
    // Decrement hit-stop micro-freeze
    if (this.hitStopFrames > 0) {
      this.hitStopFrames--;
      return true; // Indicates physics should pause for this frame
    }

    // 1. Update Emote Bubbles
    this.emotes.forEach((em) => {
      em.scale += (em.targetScale - em.scale) * 0.25;
      em.y += em.vy;
      em.bounceOffset = Math.sin(em.life * 0.15) * 2.5;
      em.life--;
      if (em.life < 20) {
        em.alpha = em.life / 20;
      }
    });
    this.emotes = this.emotes.filter((em) => em.life > 0);

    // 2. Update Bouncy Combat Text
    this.floatingTexts.forEach((ft) => {
      ft.x += ft.vx;
      ft.y += ft.vy;
      ft.vy += 0.22; // Gravity
      ft.scale = Math.max(1.0, ft.scale - 0.04);

      // Bounce on floor at y = 500
      if (ft.y >= 500 && ft.bounces > 0) {
        ft.y = 500;
        ft.vy = -ft.vy * 0.55;
        ft.bounces--;
      }

      ft.life--;
      if (ft.life < 25) {
        ft.alpha = ft.life / 25;
      }
    });
    this.floatingTexts = this.floatingTexts.filter((ft) => ft.life > 0);

    // 3. Update Debris Particles
    this.debris.forEach((deb) => {
      deb.x += deb.vx;
      deb.y += deb.vy;
      deb.vy += deb.gravity;
      deb.rotation += deb.rotSpeed;

      // Bounce on chamber floor at y = 504
      if (deb.y >= 502) {
        deb.y = 502;
        deb.vy = -deb.vy * deb.bounce;
        deb.vx *= 0.75;
        deb.rotSpeed *= 0.6;
      }

      // Chamber walls bounce
      if (deb.x <= 40 || deb.x >= 920) {
        deb.vx = -deb.vx * 0.6;
      }

      deb.life--;
      if (deb.life < 20) {
        deb.alpha = deb.life / 20;
      }
    });
    this.debris = this.debris.filter((deb) => deb.life > 0);

    // 4. Update Shockwaves
    this.shockwaves.forEach((sw) => {
      sw.radiusX += sw.speed;
      sw.radiusY += sw.speed * 0.18;
      sw.alpha = Math.max(0, 1.0 - (sw.radiusX / sw.maxRadiusX));
    });
    this.shockwaves = this.shockwaves.filter((sw) => sw.radiusX < sw.maxRadiusX && sw.alpha > 0);

    // 5. Update Ambient Dust Motes
    this.dustMotes.forEach((mote) => {
      mote.phase = (mote.phase || 0) + 0.03;
      mote.x += mote.vx + Math.sin(mote.phase) * 0.35;
      mote.y += mote.vy;

      if (mote.life !== undefined) {
        mote.life--;
        if (mote.life < 20) mote.alpha = Math.max(0, mote.life / 20);
      } else {
        // Wrap around bounds for permanent ambient dust
        if (mote.y < 36) mote.y = 500;
        if (mote.x < 36) mote.x = 920;
        if (mote.x > 920) mote.x = 36;
      }
    });
    this.dustMotes = this.dustMotes.filter((m) => m.life === undefined || m.life > 0);

    // 6. Update Ascending Souls
    this.ghosts.forEach((g) => {
      g.phase += 0.08;
      g.x = g.baseX + Math.sin(g.phase) * 12;
      g.y += g.vy;
      g.life--;
      if (g.life < 30) {
        g.alpha = g.life / 30;
      }
    });
    this.ghosts = this.ghosts.filter((g) => g.life > 0 && g.y > 20);

    // 7. Update Speed Lines
    this.speedLines.forEach((sl) => {
      sl.x += sl.vx;
      sl.y += sl.vy;
      sl.life--;
      sl.alpha *= 0.88;
    });
    this.speedLines = this.speedLines.filter((sl) => sl.life > 0 && sl.alpha > 0.05);

    // 8. Decay Ground Cracks
    this.cracks.forEach((c) => {
      c.life--;
      if (c.life < 60) {
        c.alpha = c.life / 60;
      }
    });
    this.cracks = this.cracks.filter((c) => c.life > 0);

    return false;
  }

  // =========================================================================
  // RENDER ALL VFX LAYERS TO 960x540 CANVAS
  // =========================================================================
  render(ctx) {
    ctx.save();

    // 1. Render Expanding Shockwaves (Ground cracks are rendered prior on floor layer)
    this.renderShockwaves(ctx);

    // 3. Render Speed Lines & High-Speed Drag
    this.renderSpeedLines(ctx);

    // 4. Render Ambient Dust Motes & Embers
    this.renderDustMotes(ctx);

    // 5. Render Debris Particles (Food, Sparks, Coins, Stones)
    this.renderDebris(ctx);

    // 6. Render Ascending Souls (Ghosts)
    this.renderGhosts(ctx);

    // 7. Render Emote Speech Bubbles
    this.renderEmotes(ctx);

    // 8. Render Bouncy Combat Pop-Up Text
    this.renderFloatingText(ctx);

    ctx.restore();
  }

  // --- Sub-renderers ---

  renderCracks(ctx) {
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#1e293b';
    this.cracks.forEach((c) => {
      ctx.save();
      ctx.globalAlpha = c.alpha * 0.75;
      ctx.beginPath();
      c.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.restore();
    });
  }

  renderShockwaves(ctx) {
    this.shockwaves.forEach((sw) => {
      ctx.save();
      ctx.globalAlpha = sw.alpha * 0.8;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(sw.x, sw.y, sw.radiusX, sw.radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  renderSpeedLines(ctx) {
    this.speedLines.forEach((sl) => {
      ctx.save();
      ctx.globalAlpha = sl.alpha;
      ctx.strokeStyle = sl.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sl.x, sl.y);
      ctx.lineTo(
        sl.x + Math.cos(sl.angle) * sl.length,
        sl.y + Math.sin(sl.angle) * sl.length
      );
      ctx.stroke();
      ctx.restore();
    });
  }

  renderDustMotes(ctx) {
    this.dustMotes.forEach((mote) => {
      ctx.save();
      ctx.globalAlpha = mote.alpha;
      ctx.fillStyle = mote.isEmber ? '#fbbf24' : '#e2e8f0';
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  renderDebris(ctx) {
    this.debris.forEach((deb) => {
      ctx.save();
      ctx.globalAlpha = deb.alpha;
      ctx.translate(deb.x, deb.y);
      ctx.rotate(deb.rotation);

      if (deb.debrisType === 'coin') {
        // Pixel Gold Coin
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(-deb.size / 2, -deb.size / 2, deb.size, deb.size);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-deb.size / 4, -deb.size / 4, deb.size / 2, deb.size / 2);
      } else if (deb.debrisType === 'bacon') {
        // Wavy bacon strip
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(-deb.size / 2, -2, deb.size, 4);
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(-deb.size / 2 + 2, -1, deb.size - 4, 2);
      } else if (deb.debrisType === 'tomato') {
        // Tomato wedge
        ctx.fillStyle = '#d90429';
        ctx.beginPath();
        ctx.arc(0, 0, deb.size / 2, 0, Math.PI);
        ctx.fill();
      } else if (deb.debrisType === 'lettuce') {
        // Ruffled lettuce leaf
        ctx.fillStyle = '#38b000';
        ctx.fillRect(-deb.size / 2, -deb.size / 2, deb.size, deb.size);
        ctx.fillStyle = '#70e000';
        ctx.fillRect(-deb.size / 4, -deb.size / 4, deb.size / 2, deb.size / 2);
      } else if (deb.debrisType === 'piano_key') {
        // Pixel ivory piano key
        ctx.fillStyle = deb.color;
        ctx.fillRect(-2, -deb.size / 2, 4, deb.size);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(-2, -deb.size / 2, 4, deb.size);
      } else if (deb.debrisType === 'sheet_music') {
        // Fluttering sheet of music
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-deb.size / 2, -deb.size / 2, deb.size, deb.size * 1.2);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-deb.size / 4, -deb.size / 4, deb.size / 2, 1);
        ctx.fillRect(-deb.size / 4, 0, deb.size / 2, 1);
      } else if (deb.debrisType === 'spark' || deb.debrisType === 'fire_spark') {
        ctx.fillStyle = deb.color;
        ctx.shadowColor = deb.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(-deb.size / 2, -deb.size / 2, deb.size, deb.size);
        ctx.shadowBlur = 0;
      } else {
        // Generic chip / crumb
        ctx.fillStyle = deb.color;
        ctx.fillRect(-deb.size / 2, -deb.size / 2, deb.size, deb.size);
      }

      ctx.restore();
    });
  }

  renderGhosts(ctx) {
    this.ghosts.forEach((g) => {
      ctx.save();
      ctx.globalAlpha = g.alpha;
      ctx.translate(g.x, g.y);

      // Glowing Halo
      ctx.strokeStyle = g.haloColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, -18, 9, 3, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Ghost Sheet Body (Stardew Style)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(0, -8, 10, Math.PI, 0); // Head dome
      ctx.lineTo(10, 8);
      // Ruffled bottom skirt
      ctx.quadraticCurveTo(5, 12, 0, 8);
      ctx.quadraticCurveTo(-5, 12, -10, 8);
      ctx.closePath();
      ctx.fill();

      // Cute Ghost Eyes
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-5, -9, 2.5, 4);
      ctx.fillRect(2.5, -9, 2.5, 4);

      // Little flapping wings
      const wingFlap = Math.sin(g.phase * 2) * 4;
      ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
      ctx.beginPath();
      ctx.ellipse(-12, -4 + wingFlap * 0.2, 5, 2.5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(12, -4 + wingFlap * 0.2, 5, 2.5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  renderEmotes(ctx) {
    this.emotes.forEach((em) => {
      ctx.save();
      ctx.globalAlpha = em.alpha;
      ctx.translate(em.x, em.y + em.bounceOffset);
      ctx.scale(em.scale, em.scale);

      // Bubble Background (White pixel card with dark border)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;
      ctx.fillRect(-12, -14, 24, 20);
      ctx.strokeRect(-12, -14, 24, 20);

      // Little Speech Arrow Tail pointing to ragdoll head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-3, 6);
      ctx.lineTo(0, 11);
      ctx.lineTo(3, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Emote Icon Rendering
      if (em.type === 'ALERT') {
        // Red exclamation mark '!'
        ctx.fillStyle = '#ef233c';
        ctx.fillRect(-2, -11, 4, 9);
        ctx.fillRect(-2, 0, 4, 3);
      } else if (em.type === 'SWEAT') {
        // Cyan sweat droplet
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(0, -11);
        ctx.quadraticCurveTo(5, -4, 3, 0);
        ctx.arc(0, 0, 3.5, 0, Math.PI);
        ctx.quadraticCurveTo(-5, -4, 0, -11);
        ctx.fill();
      } else if (em.type === 'QUESTION') {
        // Yellow '?'
        ctx.fillStyle = '#d97706';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('?', 0, 2);
      } else if (em.type === 'HEART') {
        // Pink Heart
        ctx.fillStyle = '#ec4899';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♥', 0, 2);
      } else if (em.type === 'SKULL') {
        // Skull 💀
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-5, -9, 10, 7);
        ctx.fillRect(-3, -2, 6, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3, -7, 2, 2);
        ctx.fillRect(1, -7, 2, 2);
      } else if (em.type === 'DIZZY') {
        // Spinning stars 💫
        ctx.fillStyle = '#ffd166';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★', 0, 2);
      } else if (em.type === 'INSANITY') {
        // Swirling eldritch insanity spiral 🌀
        ctx.fillStyle = '#a855f7';
        ctx.shadowColor = '#d946ef';
        ctx.shadowBlur = 6;
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('@@', 0, 2);
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    });
  }

  renderFloatingText(ctx) {
    this.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);

      ctx.font = `bold ${ft.size}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Heavy black pixel drop shadow & outline for 100% legibility
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3.5;
      ctx.strokeText(ft.text, 0, 0);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    });
  }
}

export const vfxSystem = new VFXSystem();
