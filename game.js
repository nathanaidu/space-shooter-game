/* ============================================================
   SPACE SHOOTER  –  Milestone 3
   Boss fights • screen shake • victory screen • Grotto FX
   ============================================================ */

(function () {

  var W = 480, H = 640;

  // ── Asset paths ─────────────────────────────────────────────
  var LC       = 'Legacy Collection/Assets/';
  var BG_BLUE  = LC + 'Environments/space_background_pack/Blue Version/layered/';
  var BG_SS    = LC + 'Packs/SpaceShooter/Space Shooter files/background/layered/';
  var BG_TDSE  = LC + 'Environments/top-down-space-environment/PNG/layers/';
  var SHIPS    = LC + 'Packs/SpaceShipShooter/Sprites/Ship/';
  var ENM_SM   = LC + 'Packs/SpaceShipShooter/Sprites/EnemySmall/';
  var ENM_MD   = LC + 'Packs/SpaceShipShooter/Sprites/Enemy Medium/';
  var ENM_BG   = LC + 'Packs/SpaceShipShooter/Sprites/EnemyBig/';
  var ALIEN    = LC + 'Characters/alien-flying-enemy/sprites/';
  var WARPED   = LC + 'Misc/Warped Fast Ship Files/Sprites/ship-sprites/';
  var LASER    = LC + 'Packs/SpaceShipShooter/Sprites/Laser Bolts/';
  var EPROJ    = LC + 'Misc/EnemyProjectile/Sprites/';
  var PWRUP    = LC + 'Packs/SpaceShipShooter/Sprites/PowerUps/';
  var EXP_A    = LC + 'Misc/Explosions pack/explosion-1-a/Sprites/';
  var EXP_B    = LC + 'Misc/Explosions pack/explosion-1-b/Sprites/';
  var EXP_C    = LC + 'Misc/Explosions pack/explosion-1-c/Sprites/';
  var EXP_D    = LC + 'Misc/Explosions pack/explosion-1-d/Sprites/';
  var EXP_E    = LC + 'Misc/Explosions pack/explosion-1-e/Sprites/';
  var HIT      = LC + 'Misc/Hit/Sprites/';
  var ASTER    = LC + 'Environments/top-down-space-environment/PNG/layers/cut-out-sprites/';
  var BOSS_SPR = LC + 'Misc/top-down-boss/PNG/sprites/';
  var BOSS_SS  = LC + 'Misc/top-down-boss/PNG/spritesheets/';
  var GROTTO   = LC + 'Misc/Grotto-escape-2-FX/sprites/';
  var WFX      = LC + 'Misc/Warped shooting fx/';
  var SND      = 'tiny-RPG-forest-files/Demo/assets/sound/';

  var game = new Phaser.Game(W, H, Phaser.AUTO, 'game', null, false, false);

  /* ─────────────────────────────────────────────────────────────
     Frame-swapping animator
  ───────────────────────────────────────────────────────────── */
  function Anim(sprite, keys, fps, loop) {
    this.sprite  = sprite;
    this.keys    = keys;
    this.fps     = fps;
    this.loop    = !!loop;
    this.frame   = 0;
    this.elapsed = 0;
    this.done    = false;
  }
  Anim.prototype.update = function (dt) {
    if (this.done || !this.sprite.alive) return;
    this.elapsed += Math.min(dt, 0.1);
    var interval = 1 / this.fps;
    while (this.elapsed >= interval) {
      this.elapsed -= interval;
      this.frame++;
      if (this.frame >= this.keys.length) {
        if (this.loop) { this.frame = 0; }
        else { this.frame = this.keys.length - 1; this.done = true; return; }
      }
    }
    this.sprite.loadTexture(this.keys[this.frame]);
  };

  /* ─────────────────────────────────────────────────────────────
     LEVEL DEFINITIONS
  ───────────────────────────────────────────────────────────── */
  var LEVEL_DEFS = [
    {
      number: 1,
      bgLayers:   [{ key: 'bg-back', speed: 22 }, { key: 'bg-stars', speed: 55 }],
      planetKey:  'prop-planet-big', planetX: 340, planetY: 170,
      fireRate:   2.2, asteroidMs: 3500,
      waves: [
        { label: 'WAVE 1', count: 16, spawnMs: 220, keys: ['esm-1','esm-2'],           speed: 150, scale: 2, points: 100, pattern: 'straight' },
        { label: 'WAVE 2', count: 16, spawnMs: 200, keys: ['emd-1','emd-2'],           speed: 140, scale: 2, points: 250, pattern: 'sine'     },
        { label: 'WAVE 3', count: 18, spawnMs: 180, keys: ['esm-1','esm-2'], keysB: ['emd-1','emd-2'],
          speed: 165, scale: 2, points: 100, pointsB: 250,              pattern: 'straight' }
      ]
    },
    {
      number: 2,
      bgLayers:   [{ key: 'bg-back-2', speed: 30 }, { key: 'bg-stars-2', speed: 70 }],
      planetKey:  'bg-planet', planetX: 130, planetY: 260,
      fireRate:   1.8, asteroidMs: 2800,
      waves: [
        { label: 'WAVE 1', count: 18, spawnMs: 190, keys: ['emd-1','emd-2'],           speed: 175, scale: 2, points: 250, pattern: 'sine'     },
        { label: 'WAVE 2', count: 16, spawnMs: 180, keys: ['ebg-1','ebg-2'],           speed: 160, scale: 2, points: 500, pattern: 'straight' },
        { label: 'WAVE 3', count: 20, spawnMs: 170, keys: ['emd-1','emd-2'], keysB: ['ebg-1','ebg-2'],
          speed: 185, scale: 2, points: 250, pointsB: 500,              pattern: 'sine'     }
      ]
    },
    {
      number: 3,
      bgLayers:   [{ key: 'bg-back-3', speed: 40 }],
      planetKey:  null,
      fireRate:   1.4, asteroidMs: 2200,
      waves: [
        { label: 'WAVE 1', count: 20, spawnMs: 170, keys: ['alien-1','alien-2','alien-3','alien-4','alien-5','alien-6','alien-7','alien-8'],
          speed: 195, scale: 2, points: 300, pattern: 'sine'     },
        { label: 'WAVE 2', count: 20, spawnMs: 155, keys: ['warp-1','warp-2','warp-3','warp-4','warp-5'],
          speed: 240, scale: 2, points: 400, pattern: 'straight' },
        { label: 'WAVE 3', count: 22, spawnMs: 140, keys: ['alien-1','alien-2','alien-3','alien-4','alien-5','alien-6','alien-7','alien-8'],
          keysB: ['warp-1','warp-2','warp-3','warp-4','warp-5'],
          speed: 215, scale: 2, points: 300, pointsB: 400,              pattern: 'sine'     }
      ]
    }
  ];

  /* ─────────────────────────────────────────────────────────────
     BOSS DEFINITIONS
  ───────────────────────────────────────────────────────────── */
  var BOSS_DEFS = [
    // Boss 1 — Patrol Cruiser — icy blue, 20 HP
    {
      tint: 0x88ccff, scale: 2.0, hp: 80, entryMs: 1100,
      showHelmet: false, showShield: false,
      raysEnabled: false, homingEnabled: false, diveEnabled: false,
      speed: 130, fireRate: 1.0, boltCount: 6, spreadAngle: 0.75,
      raysRate: 99, diveRate: 99, homingRate: 99,
      points: 2000
    },
    // Boss 2 — Siege Destroyer — hot orange, 30 HP
    {
      tint: 0xff6633, scale: 2.3, hp: 120, entryMs: 1600,
      showHelmet: true, showShield: false,
      raysEnabled: true, homingEnabled: false, diveEnabled: true,
      speed: 155, fireRate: 0.9, boltCount: 9, spreadAngle: 0.95,
      raysRate: 5.0, diveRate: 7.0, homingRate: 99,
      points: 2000
    },
    // Boss 3 — Dreadnought — deep purple, 40 HP
    {
      tint: 0xaa44ff, scale: 2.6, hp: 160, entryMs: 1800,
      showHelmet: true, showShield: true,
      raysEnabled: true, homingEnabled: true, diveEnabled: true,
      speed: 185, fireRate: 0.7, boltCount: 12, spreadAngle: 1.2,
      raysRate: 4.0, diveRate: 6.0, homingRate: 5.5,
      points: 2000
    }
  ];

  // ── Key arrays ───────────────────────────────────────────────
  var SHIP_KEYS    = []; for (var _s=1;_s<=10;_s++) SHIP_KEYS.push('ship-'+_s);
  var EXP_A_KEYS   = []; for (var _a=1;_a<=8; _a++) EXP_A_KEYS.push('exp-a-'+_a);
  var EXP_B_KEYS   = []; for (var _b=1;_b<=8; _b++) EXP_B_KEYS.push('exp-b-'+_b);
  var EXP_C_KEYS   = []; for (var _c=1;_c<=10;_c++) EXP_C_KEYS.push('exp-c-'+_c);
  var EXP_D_KEYS   = []; for (var _d=1;_d<=12;_d++) EXP_D_KEYS.push('exp-d-'+_d);
  var EXP_E_KEYS   = []; for (var _e=1;_e<=22;_e++) EXP_E_KEYS.push('exp-e-'+_e);
  var HIT_KEYS     = []; for (var _h=1;_h<=3; _h++) HIT_KEYS.push('hit-'+_h);
  var BOSS_KEYS    = []; for (var _bk=0;_bk<5; _bk++) BOSS_KEYS.push('boss-'+_bk);
  var THRUST_KEYS  = ['boss-thrust-0','boss-thrust-1'];
  var RAYS_KEYS    = []; for (var _r=0;_r<11; _r++) RAYS_KEYS.push('rays-'+_r);
  var BBOLT_KEYS   = ['bbolt-0','bbolt-1'];
  var ELECTRO_KEYS = []; for (var _el=0;_el<9;_el++) ELECTRO_KEYS.push('electro-'+_el);
  var ESMACK_KEYS  = []; for (var _es=0;_es<8;_es++) ESMACK_KEYS.push('esmack-'+_es);
  var EFIELD_KEYS  = []; for (var _ef=0;_ef<8;_ef++) EFIELD_KEYS.push('efield-'+_ef);
  var FIREBALL_KEYS= []; for (var _fb=0;_fb<3;_fb++) FIREBALL_KEYS.push('fireball-'+_fb);
  var SPARK_KEYS   = []; for (var _sp=0;_sp<5;_sp++) SPARK_KEYS.push('spark-'+_sp);
  var PULSE_KEYS   = []; for (var _pu=0;_pu<4;_pu++) PULSE_KEYS.push('pulse-'+_pu);
  var CROSSED_KEYS = []; for (var _cr=0;_cr<6;_cr++) CROSSED_KEYS.push('crossed-'+_cr);
  var HITS2_KEYS   = []; for (var _h2=0;_h2<7;_h2++) HITS2_KEYS.push('hits2-'+_h2);

  var SHOT_SINGLE = [{ vx: 0, vy: -500 }];
  var SHOT_SPREAD = [{ vx: 0, vy: -500 }, { vx: -211, vy: -453 }, { vx: 211, vy: -453 }];

  /* ─────────────────────────────────────────────────────────────
     BOOT
  ───────────────────────────────────────────────────────────── */
  var BootState = {
    create: function () {
      game.scale.scaleMode             = Phaser.ScaleManager.SHOW_ALL;
      game.scale.pageAlignHorizontally = true;
      game.scale.pageAlignVertically   = true;
      if (game.renderer.renderSession) {
        game.renderer.renderSession.roundPixels = true;
      }
      game.state.start('Preload');
    }
  };

  /* ─────────────────────────────────────────────────────────────
     PRELOAD
  ───────────────────────────────────────────────────────────── */
  var PreloadState = {
    preload: function () {
      var bar = game.add.graphics(0, 0);
      game.load.onFileComplete.add(function (prog) {
        bar.clear();
        bar.beginFill(0x00ffff);
        bar.drawRect(W / 2 - 100, H / 2 - 6, 200 * (prog / 100), 12);
      });

      // ── Backgrounds ──────────────────────────────────────
      game.load.image('bg-back',         BG_BLUE + 'blue-back.png');
      game.load.image('bg-stars',        BG_BLUE + 'blue-stars.png');
      game.load.image('prop-planet-big', BG_BLUE + 'prop-planet-big.png');
      game.load.image('bg-back-2',       BG_SS   + 'bg-back.png');
      game.load.image('bg-stars-2',      BG_SS   + 'bg-stars.png');
      game.load.image('bg-planet',       BG_SS   + 'bg-planet.png');
      game.load.image('bg-back-3',       BG_TDSE + 'stage-back.png');

      // ── Player ship ──────────────────────────────────────
      for (var i = 1; i <= 10; i++) {
        game.load.image('ship-' + i, SHIPS + 'ship' + i + '.png');
      }

      // ── Enemies ──────────────────────────────────────────
      game.load.image('esm-1', ENM_SM + 'enemy-small1.png');
      game.load.image('esm-2', ENM_SM + 'enemy-small2.png');
      game.load.image('emd-1', ENM_MD + 'enemy-medium1.png');
      game.load.image('emd-2', ENM_MD + 'enemy-medium2.png');
      game.load.image('ebg-1', ENM_BG + 'enemy-big1.png');
      game.load.image('ebg-2', ENM_BG + 'enemy-big2.png');
      for (var j = 1; j <= 8; j++) {
        game.load.image('alien-' + j, ALIEN  + 'alien-enemy-flying' + j + '.png');
      }
      for (var k = 1; k <= 5; k++) {
        game.load.image('warp-'  + k, WARPED + 'ship-0' + k + '.png');
      }

      // ── Player laser ─────────────────────────────────────
      game.load.image('laser', LASER + 'laser-bolts1.png');

      // ── Enemy projectile ─────────────────────────────────
      game.load.image('eproj-1', EPROJ + 'frame1.png');
      game.load.image('eproj-2', EPROJ + 'frame2.png');

      // ── Power-ups ────────────────────────────────────────
      game.load.image('pu-0', PWRUP + 'power-up1.png');
      game.load.image('pu-1', PWRUP + 'power-up2.png');
      game.load.image('pu-2', PWRUP + 'power-up3.png');
      game.load.image('pu-3', PWRUP + 'power-up4.png');

      // ── Asteroids ────────────────────────────────────────
      for (var m = 1; m <= 5; m++) {
        game.load.image('ast-' + m, ASTER + 'asteroid-0' + m + '.png');
      }

      // ── Explosions A & B (enemy) ─────────────────────────
      for (var ea = 1; ea <= 8; ea++) {
        game.load.image('exp-a-' + ea, EXP_A + 'explosion-'      + ea + '.png');
      }
      for (var eb = 1; eb <= 8; eb++) {
        game.load.image('exp-b-' + eb, EXP_B + 'explosion-1-b-'  + eb + '.png');
      }

      // ── Explosions C / D / E (boss) ──────────────────────
      for (var ec = 1; ec <= 10; ec++) {
        game.load.image('exp-c-' + ec, EXP_C + 'explosion-c' + ec + '.png');
      }
      for (var ed = 1; ed <= 12; ed++) {
        game.load.image('exp-d-' + ed, EXP_D + 'explosion-d' + ed + '.png');
      }
      for (var ee = 1; ee <= 22; ee++) {
        game.load.image('exp-e-' + ee, EXP_E + 'explosion-e' + ee + '.png');
      }

      // ── Hit flash ────────────────────────────────────────
      for (var hf = 1; hf <= 3; hf++) {
        game.load.image('hit-' + hf, HIT + 'hit' + hf + '.png');
      }

      // ── Boss sprites (individual frames) ─────────────────
      // body: _0000_Layer-1 … _0004_Layer-5
      for (var bi = 0; bi < 5; bi++) {
        game.load.image('boss-' + bi,
          BOSS_SPR + 'boss/_000' + bi + '_Layer-' + (bi + 1) + '.png');
      }
      // thrust: 2 frames (layer naming is reversed in source files)
      game.load.image('boss-thrust-0', BOSS_SPR + 'thrust/_0000_Layer-2.png');
      game.load.image('boss-thrust-1', BOSS_SPR + 'thrust/_0001_Layer-1.png');
      // rays: _0000_Layer-1 … _0010_Layer-11
      for (var ri = 0; ri < 11; ri++) {
        var rpad = (ri < 10) ? '_000' + ri : '_0010';
        game.load.image('rays-' + ri,
          BOSS_SPR + 'rays/' + rpad + '_Layer-' + (ri + 1) + '.png');
      }
      // boss bolt: 2 frames
      game.load.image('bbolt-0', BOSS_SPR + 'bolt/_0000_Layer-2.png');
      game.load.image('bbolt-1', BOSS_SPR + 'bolt/_0001_Layer-1.png');
      // cannon / helmet (static spritesheets used as single images)
      game.load.image('cannon-left',  BOSS_SS + 'cannon-left.png');
      game.load.image('cannon-right', BOSS_SS + 'cannon-right.png');
      game.load.image('boss-helmet',  BOSS_SS + 'helmet.png');

      // ── Grotto FX ────────────────────────────────────────
      for (var gli = 0; gli < 9; gli++) {
        game.load.image('electro-' + gli,
          GROTTO + 'electro-shock/_000' + gli + '_Layer-' + (gli + 1) + '.png');
      }
      for (var gsi = 0; gsi < 8; gsi++) {
        game.load.image('esmack-'  + gsi,
          GROTTO + 'energy-smack/_000' + gsi + '_Layer-' + (gsi + 1) + '.png');
        game.load.image('efield-'  + gsi,
          GROTTO + 'energy-field/_000' + gsi + '_Layer-' + (gsi + 1) + '.png');
      }
      for (var gfi = 0; gfi < 3; gfi++) {
        game.load.image('fireball-' + gfi,
          GROTTO + 'fire-ball/_000' + gfi + '_Layer-' + (gfi + 1) + '.png');
      }

      // ── Warped FX ────────────────────────────────────────
      for (var wsi = 1; wsi <= 5; wsi++) {
        game.load.image('spark-'   + (wsi - 1), WFX + 'spark/Sprites/spark-preview' + wsi + '.png');
      }
      for (var wpi = 1; wpi <= 4; wpi++) {
        game.load.image('pulse-'   + (wpi - 1), WFX + 'Pulse/Sprites/pulse'         + wpi + '.png');
      }
      for (var wci = 1; wci <= 6; wci++) {
        game.load.image('crossed-' + (wci - 1), WFX + 'crossed/Sprites/crossed'     + wci + '.png');
      }
      for (var wh2 = 1; wh2 <= 7; wh2++) {
        game.load.image('hits2-'   + (wh2 - 1), WFX + 'hits/Hits-2/Sprites/hits-2-' + wh2 + '.png');
      }

      // ── Audio ────────────────────────────────────────────
      game.load.audio('music', [SND + 'ancient_path.ogg', SND + 'ancient_path.mp3']);
      game.load.audio('shoot', [SND + 'slash.ogg',        SND + 'slash.mp3']);
      game.load.audio('hurt',  [SND + 'hurt.ogg',         SND + 'hurt.mp3']);
      game.load.audio('death', [SND + 'enemy-death.ogg',  SND + 'enemy-death.mp3']);
      game.load.audio('item',  [SND + 'item.ogg',         SND + 'item.mp3']);
    },

    create: function () { game.state.start('Title'); }
  };

  /* ─────────────────────────────────────────────────────────────
     TITLE
  ───────────────────────────────────────────────────────────── */
  var TitleState = {
    create: function () {
      buildBg(0);

      game.add.text(W / 2, 190, 'SPACE\nSHOOTER', {
        font: 'bold 40px monospace', fill: '#00ffff', align: 'center'
      }).anchor.set(0.5);

      game.add.text(W / 2, 320, 'ARROWS / WASD  move\n  SPACE  shoot', {
        font: '16px monospace', fill: '#aaaaaa', align: 'center'
      }).anchor.set(0.5);

      var scores  = loadScores();
      var hsLines = 'HIGH SCORES\n\n';
      if (scores.length === 0) { hsLines += '     none yet'; }
      else { scores.forEach(function (s, i) { hsLines += '  ' + (i + 1) + '.  ' + padScore(s) + '\n'; }); }
      game.add.text(W / 2, 460, hsLines, {
        font: '14px monospace', fill: '#ffff00', align: 'center'
      }).anchor.set(0.5);

      var blink = game.add.text(W / 2, 590, 'PRESS ENTER TO PLAY', {
        font: '15px monospace', fill: '#ffffff'
      });
      blink.anchor.set(0.5);
      game.add.tween(blink).to({ alpha: 0 }, 600, Phaser.Easing.Linear.None, true, 0, -1, true);

      game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
        .onDown.addOnce(function () { game.state.start('Play'); });
    }
  };

  /* ─────────────────────────────────────────────────────────────
     PLAY
  ───────────────────────────────────────────────────────────── */
  var PlayState = {

    init: function (data) {
      this.levelIndex = (data && data.level != null) ? data.level : 0;
      this.score      = (data && data.score != null) ? data.score : 0;
      this.lives      = (data && data.lives != null) ? data.lives : 3;
      var saved       = loadScores();
      this.hiScore    = Math.max(this.score, saved.length ? saved[0] : 0);
    },

    create: function () {
      var levelDef       = LEVEL_DEFS[this.levelIndex];
      this.levelWave     = 0;
      this.waveActive    = false;
      this.waveGen       = 0;
      this.enemiesLeft   = 0;
      this.invincible    = false;
      this.fireCd        = 0;
      this.FIRE_RATE     = 0.18;
      this.anims         = [];
      this.spreadActive  = false;
      this.speedBoost    = false;
      this.hasShield     = false;
      this.spreadTimer   = null;
      this.speedTimer    = null;
      this.asteroidTimer = null;
      this.planetSprite  = null;
      this._active       = true;
      this._toKill       = [];

      // Boss state
      this.boss          = null;
      this.bossThrust    = null;
      this.bossCannonL   = null;
      this.bossCannonR   = null;
      this.bossHelmet    = null;
      this.bossRays      = null;
      this.bossShieldSpr = null;
      this.bossHealthGfx = null;
      this.bossHp        = 0;
      this.bossMaxHp     = 0;
      this.bossPhase     = null; // null|entering|fighting|phase2|diving|rays|dying
      this.bossVx        = 0;
      this.bossFireCd    = 0;
      this.bossRaysCd    = 0;
      this.bossDiveCd    = 0;
      this.bossHomingCd  = 0;
      this.bossRaysFiring = false;
      this.bossRaysDmgCd  = 0;
      this.bossDiveTargetY = 0;
      this.bossDiveReturning = false;
      this.bossAnimT      = 0;
      this.bossShieldUp   = false;

      // ── Background ───────────────────────────────────────
      this.bgLayers = buildBg(this.levelIndex);

      if (levelDef.planetKey) {
        this.planetSprite = game.add.sprite(levelDef.planetX, levelDef.planetY, levelDef.planetKey);
        this.planetSprite.anchor.set(0.5);
        this.planetSprite._scrollSpeed = 8;
      }

      // ── Physics ──────────────────────────────────────────
      game.physics.startSystem(Phaser.Physics.ARCADE);

      // ── Groups ───────────────────────────────────────────
      this.bullets = game.add.group();
      this.bullets.enableBody      = true;
      this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

      this.enemyBullets = game.add.group();
      this.enemyBullets.enableBody      = true;
      this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;

      this.enemies = game.add.group();
      this.enemies.enableBody      = true;
      this.enemies.physicsBodyType = Phaser.Physics.ARCADE;

      this.powerups = game.add.group();
      this.powerups.enableBody      = true;
      this.powerups.physicsBodyType = Phaser.Physics.ARCADE;

      this.asteroids = game.add.group();
      this.asteroids.enableBody      = true;
      this.asteroids.physicsBodyType = Phaser.Physics.ARCADE;

      this.fxGroup = game.add.group();

      // ── Player ───────────────────────────────────────────
      this.player = game.add.sprite(W / 2, H - 90, 'ship-1');
      this.player.anchor.set(0.5);
      this.player.scale.setTo(2, 2);
      game.physics.arcade.enable(this.player);
      this.player.body.setSize(12, 20, 2, 2);
      this.shipAnim  = new Anim(this.player, SHIP_KEYS, 10, true);
      this.shieldGfx = game.add.graphics(0, 0);
      this.spreadGfx = game.add.graphics(0, 0);

      // ── Input ────────────────────────────────────────────
      this.cursors  = game.input.keyboard.createCursorKeys();
      this.wasd = {
        up:    game.input.keyboard.addKey(Phaser.Keyboard.W),
        down:  game.input.keyboard.addKey(Phaser.Keyboard.S),
        left:  game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D)
      };
      this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

      // ── Audio ────────────────────────────────────────────
      this.sndShoot = game.add.audio('shoot', 0.35);
      this.sndHurt  = game.add.audio('hurt',  0.6);
      this.sndDeath = game.add.audio('death', 0.5);
      this.sndItem  = game.add.audio('item',  0.6);
      this.music    = game.add.audio('music', 0.35, true);
      this.music.play();

      // ── HUD ──────────────────────────────────────────────
      this._buildHUD();

      // ── Asteroids ────────────────────────────────────────
      this.asteroidTimer = game.time.events.loop(levelDef.asteroidMs, this._spawnAsteroid, this);

      this._scheduleWave(2000);
    },

    // ── HUD ──────────────────────────────────────────────────

    _buildHUD: function () {
      this.scoreTxt = game.add.text(8, 8, 'SCORE  000000', {
        font: '14px monospace', fill: '#ffffff'
      });
      this.scoreTxt.fixedToCamera = true;

      this.hiTxt = game.add.text(W / 2, 8, 'HI  000000', {
        font: '14px monospace', fill: '#ffff00', align: 'center'
      });
      this.hiTxt.anchor.x     = 0.5;
      this.hiTxt.fixedToCamera = true;

      this.levelTxt = game.add.text(W - 8, 8, 'LVL ' + (this.levelIndex + 1), {
        font: '14px monospace', fill: '#aaffaa'
      });
      this.levelTxt.anchor.x     = 1;
      this.levelTxt.fixedToCamera = true;

      this.lifeIcons = [];
      for (var i = 0; i < 3; i++) {
        var ic = game.add.sprite(W - 12 - i * 22, 28, 'ship-1');
        ic.scale.setTo(0.9, 0.9);
        ic.fixedToCamera = true;
        this.lifeIcons.push(ic);
      }

      this.puTxt = game.add.text(8, H - 20, '', {
        font: '11px monospace', fill: '#00ffff'
      });
      this.puTxt.fixedToCamera = true;

      this.waveLabelTxt = game.add.text(W / 2, H / 2 - 60, '', {
        font: 'bold 28px monospace', fill: '#ffffff', align: 'center'
      });
      this.waveLabelTxt.anchor.set(0.5);
      this.waveLabelTxt.fixedToCamera = true;

      // Dedicated scrolling banner for boss warnings
      this.scrollBannerTxt = game.add.text(0, 0, '', {
        font: 'bold 32px monospace', fill: '#ff0000', align: 'center'
      });
      this.scrollBannerTxt.anchor.set(0.5);
      this.scrollBannerTxt.fixedToCamera = true;
      this.scrollBannerTxt.cameraOffset.set(-300, H / 2 - 20);
      this.scrollBannerTxt.alpha = 0;
    },

    _refreshHUD: function () {
      if (this.score > this.hiScore) { this.hiScore = this.score; }

      var scoreStr = 'SCORE  ' + padScore(this.score);
      if (this.scoreTxt.text !== scoreStr) { this.scoreTxt.text = scoreStr; }

      var hiStr = 'HI  ' + padScore(this.hiScore);
      if (this.hiTxt.text !== hiStr) { this.hiTxt.text = hiStr; }

      for (var i = 0; i < this.lifeIcons.length; i++) {
        this.lifeIcons[i].visible = (i < this.lives);
      }

      var puStr = '';
      if (this.speedBoost)   { puStr += 'SPD'; }
      if (this.spreadActive) { puStr += (puStr ? '  ' : '') + 'SPR'; }
      if (this.hasShield)    { puStr += (puStr ? '  ' : '') + 'SHD'; }
      if (this.puTxt.text !== puStr) { this.puTxt.text = puStr; }

      if (this.bossHealthGfx) { this._drawBossHealthBar(); }
    },

    _flashLabel: function (msg, color) {
      game.tweens.removeFrom(this.waveLabelTxt);
      this.waveLabelTxt.text           = msg;
      this.waveLabelTxt.style.fill     = color || '#ffffff';
      this.waveLabelTxt.alpha          = 1;
      game.add.tween(this.waveLabelTxt)
        .to({ alpha: 0 }, 800, Phaser.Easing.Linear.None, true, 800);
    },

    _scrollBossWarning: function (msg, color, delay) {
      var self = this;
      game.time.events.add(delay || 0, function () {
        if (!self._active) return;
        game.tweens.removeFrom(self.scrollBannerTxt);
        self.scrollBannerTxt.text       = msg;
        self.scrollBannerTxt.style.fill = color || '#ff0000';
        self.scrollBannerTxt.alpha      = 1;
        self.scrollBannerTxt.cameraOffset.x = -300;
        game.add.tween(self.scrollBannerTxt.cameraOffset)
          .to({ x: W + 300 }, 2090, Phaser.Easing.Linear.None, true);
      });
    },

    // ── Waves ────────────────────────────────────────────────

    _scheduleWave: function (delay) {
      var self     = this;
      var gen      = this.waveGen;
      var levelDef = LEVEL_DEFS[this.levelIndex];
      var waveDef  = levelDef.waves[this.levelWave];
      game.time.events.add(Math.max(0, delay - 900), function () {
        if (!self._active || self.waveGen !== gen) return;
        self._flashLabel(waveDef.label, '#ffff00');
      });
      game.time.events.add(delay, function () {
        if (!self._active || self.waveGen !== gen) return;
        self._startWave();
      });
    },

    _startWave: function () {
      this.waveGen++;
      var gen      = this.waveGen;
      var self     = this;
      var levelDef = LEVEL_DEFS[this.levelIndex];
      var waveDef  = levelDef.waves[this.levelWave];

      this.waveActive  = true;
      this.enemiesLeft = waveDef.count;
      var spawnMs = waveDef.spawnMs || 420;

      for (var i = 0; i < waveDef.count; i++) {
        (function (idx) {
          game.time.events.add(idx * spawnMs, function () {
            if (!self.player || !self.player.alive) return;
            if (self.waveGen !== gen) return;
            self._spawnEnemy(waveDef, idx);
          });
        })(i);
      }

      game.time.events.add(waveDef.count * spawnMs + 7000, function () {
        if (self.waveGen !== gen) return;
        self._clearAndAdvance();
      });
    },

    _spawnEnemy: function (waveDef, idx) {
      var keys = (waveDef.keysB && idx % 2 === 1) ? waveDef.keysB : waveDef.keys;
      var pts  = (waveDef.keysB && idx % 2 === 1) ? (waveDef.pointsB || waveDef.points) : waveDef.points;

      var margin = 50;
      var x = margin + Math.random() * (W - margin * 2);
      var y = -30 - Math.random() * 120;  // stagger entry depth

      var enemy = this.enemies.create(x, y, keys[0]);
      enemy.anchor.set(0.5);
      enemy.scale.setTo(waveDef.scale, waveDef.scale);
      game.physics.arcade.enable(enemy);
      enemy.body.velocity.y = waveDef.speed;
      enemy._waveDef = waveDef;
      enemy._keys    = keys;
      enemy._points  = pts;
      enemy._phase   = Math.random() * Math.PI * 2;
      enemy._fireCd  = LEVEL_DEFS[this.levelIndex].fireRate * (0.4 + Math.random() * 0.8);

      if (waveDef.pattern === 'sine') {
        enemy._sineAmp   = 80 + Math.random() * 40;
        enemy._sineSpeed = 1.8 + Math.random() * 1.0;
      }

      var anim = new Anim(enemy, keys, 6, true);
      this.anims.push(anim);
      enemy._anim = anim;
    },

    _onOneEnemyGone: function () {
      if (!this.waveActive) return;
      this.enemiesLeft--;
      if (this.enemiesLeft <= 0) {
        this.waveActive = false;
        var self = this;
        game.time.events.add(1500, function () {
          if (self._active) { self._advanceWave(); }
        });
      }
    },

    _clearAndAdvance: function () {
      if (!this._active || !this.waveActive) return;
      this.waveActive = false;
      if (this.enemies && this.enemies.forEachAlive && this.enemies.killAll) {
        this.enemies.forEachAlive(function (e) {
          if (e._anim) { e._anim.sprite = { alive: false }; }
        });
        this.enemies.killAll();
      }
      this._advanceWave();
    },

    _advanceWave: function () {
      if (!this._active) return;
      var levelDef = LEVEL_DEFS[this.levelIndex];
      this.levelWave++;
      if (this.levelWave >= levelDef.waves.length) {
        this._startBoss();   // boss fight instead of level clear
        return;
      }
      this._scheduleWave(2200);
    },

    // ── Boss ─────────────────────────────────────────────────

    _startBoss: function () {
      var def  = BOSS_DEFS[this.levelIndex];
      var self = this;

      // Kill any remaining enemies / bullets left over from wave 3
      if (this.enemies      && this.enemies.killAll)      { this.enemies.killAll(); }
      if (this.enemyBullets && this.enemyBullets.killAll) { this.enemyBullets.killAll(); }

      // Flash warning before boss arrives
      self._flashLabel('WARNING!',         '#ff0000');
      game.time.events.add(700,  function () { if (self._active) self._flashLabel('BOSS APPROACHING', '#ff4400'); });
      game.time.events.add(1400, function () { if (self._active) self._flashLabel('WARNING!',         '#ff0000'); });

      var cx = W / 2;
      var startY = -150;

      // Delay actual boss spawn until after warnings
      game.time.events.add(2000, function () {
        if (!self._active) return;
        self._spawnBossSprites(def, cx, startY);
      });
    },

    _spawnBossSprites: function (def, cx, startY) {
      var self = this;

      // Thrust (behind body, no physics)
      this.bossThrust = game.add.sprite(cx, startY, 'boss-thrust-0');
      this.bossThrust.anchor.set(0.5);
      this.bossThrust.scale.setTo(def.scale, def.scale);
      this.bossThrust.tint = def.tint;

      // Main body — no physics; movement via direct x/y; bullet hits use manual bounds check
      this.boss = game.add.sprite(cx, startY, 'boss-0');
      this.boss.anchor.set(0.5);
      this.boss.scale.setTo(def.scale, def.scale);
      this.boss.tint = def.tint;

      // Cannons (positioned in update each frame)
      this.bossCannonL = game.add.sprite(cx, startY, 'cannon-left');
      this.bossCannonL.anchor.set(0.5);
      this.bossCannonL.scale.setTo(def.scale, def.scale);
      this.bossCannonL.tint = def.tint;

      this.bossCannonR = game.add.sprite(cx, startY, 'cannon-right');
      this.bossCannonR.anchor.set(0.5);
      this.bossCannonR.scale.setTo(def.scale, def.scale);
      this.bossCannonR.tint = def.tint;

      // Helmet (Boss 2 & 3)
      if (def.showHelmet) {
        this.bossHelmet = game.add.sprite(cx, startY, 'boss-helmet');
        this.bossHelmet.anchor.set(0.5);
        this.bossHelmet.scale.setTo(def.scale, def.scale);
        this.bossHelmet.tint = def.tint;
      }

      // Energy rays sprite (Boss 2 & 3) — hidden until attack
      if (def.raysEnabled) {
        this.bossRays = game.add.sprite(cx, startY + 60, 'rays-0');
        this.bossRays.anchor.set(0.5, 0);
        this.bossRays.scale.setTo(def.scale, def.scale * 1.5);
        this.bossRays.tint    = def.tint;
        this.bossRays.visible = false;
        // No physics needed — player overlap is checked manually in _updateRaysFiring
      }

      // Energy shield aura (Boss 3)
      if (def.showShield) {
        this.bossShieldSpr = game.add.sprite(cx, startY, 'efield-0');
        this.bossShieldSpr.anchor.set(0.5);
        this.bossShieldSpr.scale.setTo(def.scale * 1.6, def.scale * 1.6);
        this.bossShieldSpr.alpha = 0.75;
        this.bossShieldUp = true;
        var shieldAnim = new Anim(this.bossShieldSpr, EFIELD_KEYS, 8, true);
        this.anims.push(shieldAnim);
      }

      // Health bar graphics (fixed to camera)
      this.bossHealthGfx = game.add.graphics(0, 0);
      this.bossHealthGfx.fixedToCamera = true;

      // Boss state
      this.bossHp      = def.hp;
      this.bossMaxHp   = def.hp;
      this.bossPhase   = 'entering';
      this.bossVx      = def.speed;
      this.bossFireCd  = def.fireRate + 1.5;  // small extra delay on first shot
      this.bossRaysCd  = def.raysRate;
      this.bossDiveCd  = def.diveRate;
      this.bossHomingCd = def.homingRate;

      this.bossAnimT   = 0;
      this.bossRaysFiring  = false;
      this.bossRaysDmgCd   = 0;

      // Tween boss into screen
      var targetY = 130;
      game.add.tween(this.boss).to(
        { y: targetY }, def.entryMs || 2200, Phaser.Easing.Quadratic.Out, true
      ).onComplete.addOnce(function () {
        if (!self._active) return;
        self.bossPhase = 'fighting';
      });
    },

    _updateBoss: function (dt) {
      if (!this.boss) return;
      var def = BOSS_DEFS[this.levelIndex];

      this.bossAnimT += dt;

      // Sync all boss parts to body position
      var bx = this.boss.x;
      var by = this.boss.y;
      var sc = def.scale;

      if (this.bossThrust) {
        this.bossThrust.x = bx;
        this.bossThrust.y = by + 52 * sc;
        // Animate thrust
        var thrustFrame = Math.floor(this.bossAnimT * 8) % 2;
        this.bossThrust.loadTexture(THRUST_KEYS[thrustFrame]);
      }

      // Cannon offsets (boss frame is 192px wide, cannons sit ~55px from center)
      var cannonOffX = 55 * sc;
      var cannonOffY = 18 * sc;
      if (this.bossCannonL) { this.bossCannonL.x = bx - cannonOffX; this.bossCannonL.y = by + cannonOffY; }
      if (this.bossCannonR) { this.bossCannonR.x = bx + cannonOffX; this.bossCannonR.y = by + cannonOffY; }
      if (this.bossHelmet)  { this.bossHelmet.x  = bx;              this.bossHelmet.y  = by - 14 * sc;    }
      if (this.bossShieldSpr) {
        this.bossShieldSpr.x = bx;
        this.bossShieldSpr.y = by;
        // Gentle pulse
        this.bossShieldSpr.alpha = 0.6 + Math.sin(this.bossAnimT * 4) * 0.2;
      }
      if (this.bossRays) {
        this.bossRays.x = bx;
        this.bossRays.y = by + 40 * sc;
      }

      // Draw health bar
      this._drawBossHealthBar();

      // ── Phase logic ──────────────────────────────────────
      if (this.bossPhase === 'entering') return;  // tween drives position
      if (this.bossPhase === 'dying')    return;

      // Side-to-side movement
      if (this.bossPhase === 'fighting' || this.bossPhase === 'phase2') {
        this.boss.x += this.bossVx * dt;
        if (this.boss.x < 80)     { this.boss.x = 80;     this.bossVx =  Math.abs(this.bossVx); }
        if (this.boss.x > W - 80) { this.boss.x = W - 80; this.bossVx = -Math.abs(this.bossVx); }
      }

      // Dive movement (Boss 2 & 3)
      if (this.bossPhase === 'diving') {
        if (!this.bossDiveReturning) {
          this.boss.y += 280 * dt;
          if (this.boss.y >= this.bossDiveTargetY) {
            this.bossDiveReturning = true;
          }
        } else {
          this.boss.y -= 180 * dt;
          if (this.boss.y <= 130) {
            this.boss.y    = 130;
            this.bossPhase = (this.bossHp <= this.bossMaxHp / 2) ? 'phase2' : 'fighting';
          }
        }
        this.boss.x += this.bossVx * dt;
        if (this.boss.x < 80)     { this.boss.x = 80;     this.bossVx =  Math.abs(this.bossVx); }
        if (this.boss.x > W - 80) { this.boss.x = W - 80; this.bossVx = -Math.abs(this.bossVx); }
      }

      // Rays hold (boss stays still while rays play)
      if (this.bossPhase === 'rays') {
        this._updateRaysFiring(dt);
        return;
      }

      // ── Fire cooldowns ────────────────────────────────────
      this.bossFireCd -= dt;
      if (this.bossFireCd <= 0) {
        this._bossFireBolts();
        this.bossFireCd = def.fireRate * (0.8 + Math.random() * 0.4);
      }

      if (def.raysEnabled) {
        this.bossRaysCd -= dt;
        if (this.bossRaysCd <= 0) {
          this.bossRaysCd = def.raysRate * (0.9 + Math.random() * 0.2);
          this._bossStartRays();
        }
      }

      if (def.diveEnabled && this.bossPhase !== 'diving') {
        this.bossDiveCd -= dt;
        if (this.bossDiveCd <= 0) {
          this.bossDiveCd = def.diveRate * (0.8 + Math.random() * 0.4);
          this._bossDive();
        }
      }

      if (def.homingEnabled) {
        this.bossHomingCd -= dt;
        if (this.bossHomingCd <= 0) {
          this.bossHomingCd = def.homingRate * (0.8 + Math.random() * 0.4);
          this._bossFireHoming();
        }
      }

      // Animate boss body
      var bodyFrame = Math.floor(this.bossAnimT * 6) % BOSS_KEYS.length;
      this.boss.loadTexture(BOSS_KEYS[bodyFrame]);
    },

    _updateRaysFiring: function (dt) {
      if (!this.bossRays || !this.bossRays.visible) {
        this.bossPhase = (this.bossHp <= this.bossMaxHp / 2) ? 'phase2' : 'fighting';
        return;
      }
      // Player damage from rays
      this.bossRaysDmgCd -= dt;
      if (this.bossRaysDmgCd <= 0 && this.player && this.player.alive) {
        var hitZone = 40 * BOSS_DEFS[this.levelIndex].scale;
        if (Math.abs(this.player.x - this.boss.x) < hitZone && this.player.y > this.boss.y) {
          this._doPlayerHit();
          this.bossRaysDmgCd = 0.6;
        }
      }
    },

    _bossFireBolts: function () {
      var def   = BOSS_DEFS[this.levelIndex];
      var count = def.boltCount;
      var half  = def.spreadAngle;
      var speed = 240;

      for (var i = 0; i < count; i++) {
        var t     = (count > 1) ? (i / (count - 1) - 0.5) : 0;
        var angle = t * half;
        var vx    = Math.sin(angle) * speed;
        var vy    = Math.cos(angle) * speed;

        var b = this.enemyBullets.getFirstDead();
        if (!b) {
          b = this.enemyBullets.create(0, 0, 'bbolt-0');
          b.anchor.set(0.5);
          b.scale.setTo(2, 2);
          b.checkWorldBounds = true;
          b.outOfBoundsKill  = true;
        }
        // Fire from alternating cannon positions
        var fireX = (i % 2 === 0) ? this.bossCannonL.x : this.bossCannonR.x;
        var fireY = this.boss.y + 30;
        b.reset(fireX, fireY);
        b.body.enable  = true;
        b._homing      = false;
        b.body.velocity.setTo(vx, vy);
        b.loadTexture('bbolt-0');
      }

      // Phase 2 bonus: crossed bolt spray (Boss 3 only)
      if (this.bossPhase === 'phase2' && this.levelIndex === 2) {
        this._spawnFX(this.boss.x, this.boss.y, CROSSED_KEYS, 10, false);
        for (var ci = 0; ci < 8; ci++) {
          var ca = (ci / 8) * Math.PI * 2;
          var cb = this.enemyBullets.getFirstDead();
          if (!cb) {
            cb = this.enemyBullets.create(0, 0, 'bbolt-0');
            cb.anchor.set(0.5);
            cb.scale.setTo(1.5, 1.5);
            cb.checkWorldBounds = true;
            cb.outOfBoundsKill  = true;
          }
          cb.reset(this.boss.x, this.boss.y);
          cb.body.enable = true;
          cb._homing     = false;
          cb.body.velocity.setTo(Math.cos(ca) * 180, Math.sin(ca) * 180);
          cb.loadTexture('bbolt-1');
        }
      }
    },

    _bossStartRays: function () {
      if (!this.bossRays) return;
      var self = this;
      this.bossPhase      = 'rays';
      this.bossRays.visible = true;
      this.bossRaysFiring   = true;
      this.bossRaysDmgCd    = 0.3;

      // Play waveform FX at boss position
      this._spawnFX(this.boss.x, this.boss.y + 20, PULSE_KEYS, 12, false);

      // Animate rays through all 11 frames then hide
      var raysAnim = new Anim(this.bossRays, RAYS_KEYS, 10, false);
      this.anims.push(raysAnim);

      game.time.events.add((RAYS_KEYS.length / 10) * 1000 + 100, function () {
        if (!self._active) return;
        if (self.bossRays) { self.bossRays.visible = false; }
        self.bossRaysFiring = false;
        self.bossPhase = (self.bossHp <= self.bossMaxHp / 2) ? 'phase2' : 'fighting';
      });
    },

    _bossDive: function () {
      if (!this.player || !this.player.alive) return;
      this.bossPhase         = 'diving';
      this.bossDiveTargetY   = this.player.y - 40;
      this.bossDiveReturning = false;
    },

    _bossFireHoming: function () {
      for (var hi = 0; hi < 2; hi++) {
        var hb = this.enemyBullets.getFirstDead();
        if (!hb) {
          hb = this.enemyBullets.create(0, 0, 'fireball-0');
          hb.anchor.set(0.5);
          hb.scale.setTo(2.5, 2.5);
          hb.checkWorldBounds = true;
          hb.outOfBoundsKill  = true;
        }
        var offX = (hi === 0) ? -30 : 30;
        hb.reset(this.boss.x + offX, this.boss.y + 40);
        hb.body.enable = true;
        hb._homing     = true;
        hb.body.velocity.setTo((hi === 0 ? -1 : 1) * 60, 120);
        hb.loadTexture('fireball-0');
        var fbAnim = new Anim(hb, FIREBALL_KEYS, 8, true);
        this.anims.push(fbAnim);
      }
    },

    _bossPhase2Trigger: function () {
      var self = this;
      this.bossPhase   = 'phase2';
      this.bossShieldUp = false;

      // Destroy shield with electro-shock
      if (this.bossShieldSpr) {
        this._spawnFX(this.boss.x, this.boss.y, ELECTRO_KEYS, 12, false);
        this.bossShieldSpr.destroy();
        this.bossShieldSpr = null;
      }

      // Energy smack hit effect
      this._spawnFX(this.boss.x, this.boss.y, ESMACK_KEYS, 14, false);

      // Screen shake
      game.camera.shake(0.025, 500);

      // Speed up boss
      var def      = BOSS_DEFS[this.levelIndex];
      this.bossVx      = (this.bossVx > 0 ? 1 : -1) * def.speed * 1.5;
      this.bossFireCd  = 0.5;

      this._flashLabel('PHASE 2!', '#ff4400');
    },

    _onBulletHitBoss: function (bullet, boss) {
      if (this.bossPhase === 'dying' || this.bossPhase === 'entering') return;
      bullet.kill();

      var def = BOSS_DEFS[this.levelIndex];

      // Hit sparks — use hits2 for boss 2+, hits1 for boss 1
      if (this.levelIndex >= 1) {
        this._spawnFX(bullet.x, bullet.y, HITS2_KEYS, 18, false);
      } else {
        this._spawnHit(bullet.x, bullet.y);
      }

      // Small spark
      this._spawnFX(boss.x + (Math.random() - 0.5) * 60,
                    boss.y + (Math.random() - 0.5) * 40, SPARK_KEYS, 16, false);

      this.score += 10;
      this.bossHp--;

      // Phase 2 trigger at 50% HP
      if (this.bossHp === Math.floor(this.bossMaxHp / 2) && this.bossPhase === 'fighting') {
        this._bossPhase2Trigger();
        return;
      }

      if (this.bossHp <= 0) {
        this._bossDie();
      }
    },

    _bossDie: function () {
      if (this.bossPhase === 'dying') return;
      this.bossPhase = 'dying';
      var self   = this;
      var count  = 0;
      var total  = 16;

      this.bossVx = 0;
      if (this.bossHealthGfx) { this.bossHealthGfx.clear(); }

      // Destroy shield if still up
      if (this.bossShieldSpr) { this.bossShieldSpr.destroy(); this.bossShieldSpr = null; }

      // Big initial jolt the moment the boss dies
      game.camera.shake(0.05, 400);

      // Chain explosions across the boss body
      function chainBoom () {
        if (!self._active) return;
        if (count >= total) {
          // Grand finale
          game.camera.shake(0.07, 900);
          var bx = self.boss ? self.boss.x : W / 2;
          var by = self.boss ? self.boss.y : 200;
          // Spread large explosions across the full boss width
          self._spawnFX(bx,       by,      EXP_E_KEYS, 20, false);
          self._spawnFX(bx - 70,  by - 30, EXP_E_KEYS, 18, false);
          self._spawnFX(bx + 70,  by - 30, EXP_E_KEYS, 18, false);
          self._spawnExplosion(bx - 90, by + 10, true);
          self._spawnExplosion(bx + 90, by + 10, true);
          self._spawnExplosion(bx,      by - 50, true);
          self._spawnFX(bx, by, ESMACK_KEYS, 16, false);

          game.time.events.add(1800, function () {
            if (!self._active) return;
            self.score += BOSS_DEFS[self.levelIndex].points;
            ['boss','bossThrust','bossCannonL','bossCannonR','bossHelmet','bossRays','bossHealthGfx']
              .forEach(function (k) { if (self[k]) { self[k].destroy(); self[k] = null; } });
            self.sndDeath.play();
            self._onLevelClear();
          });
          return;
        }
        count++;
        var ox = (Math.random() - 0.5) * 150;
        var oy = (Math.random() - 0.5) * 100;
        var bx = (self.boss ? self.boss.x : W / 2) + ox;
        var by = (self.boss ? self.boss.y : 200)   + oy;
        self._spawnExplosion(bx, by, count % 2 === 0);
        self._spawnFX(bx, by, ESMACK_KEYS, 13, false);
        game.camera.shake(0.02, 180);
        game.time.events.add(160, chainBoom);
      }

      game.time.events.add(100, chainBoom);
    },

    _drawBossHealthBar: function () {
      if (!this.bossHealthGfx) return;
      var gfx    = this.bossHealthGfx;
      var barW   = 280;
      var barH   = 14;
      var barX   = (W - barW) / 2;
      var barY   = 54;
      var pct    = Math.max(0, this.bossHp / this.bossMaxHp);
      var phase2 = this.bossHp <= this.bossMaxHp / 2;

      gfx.clear();
      // Background
      gfx.beginFill(0x222222, 0.85);
      gfx.drawRect(barX - 2, barY - 2, barW + 4, barH + 4);
      gfx.endFill();
      // Fill
      var fillColor = phase2 ? 0xff4400 : 0x00ffcc;
      gfx.beginFill(fillColor);
      gfx.drawRect(barX, barY, barW * pct, barH);
      gfx.endFill();
      // Border
      gfx.lineStyle(1, 0xffffff, 0.6);
      gfx.drawRect(barX - 1, barY - 1, barW + 2, barH + 2);
      // Phase 2 midpoint marker
      gfx.lineStyle(1, 0xffffff, 0.4);
      gfx.moveTo(barX + barW / 2, barY - 2);
      gfx.lineTo(barX + barW / 2, barY + barH + 2);
    },

    // ── Level clear / Victory ─────────────────────────────────

    _onLevelClear: function () {
      if (!this._active) return;
      this._active = false;
      this.waveGen++;
      if (this.enemies      && this.enemies.killAll)      { this.enemies.killAll(); }
      if (this.bullets      && this.bullets.killAll)      { this.bullets.killAll(); }
      if (this.enemyBullets && this.enemyBullets.killAll) { this.enemyBullets.killAll(); }
      if (this.powerups     && this.powerups.killAll)     { this.powerups.killAll(); }
      if (this.asteroidTimer) { game.time.events.remove(this.asteroidTimer); this.asteroidTimer = null; }
      this._saveScore();
      if (this.music && this.music.isPlaying) { this.music.stop(); }

      if (this.levelIndex >= LEVEL_DEFS.length - 1) {
        game.state.start('Victory', true, false, { score: this.score });
      } else {
        game.state.start('LevelClear', true, false, {
          clearedNum: LEVEL_DEFS[this.levelIndex].number,
          nextLevel:  this.levelIndex + 1,
          score:      this.score,
          lives:      this.lives
        });
      }
    },

    // ── Asteroids ────────────────────────────────────────────

    _spawnAsteroid: function () {
      var x   = 40 + Math.random() * (W - 80);
      var key = 'ast-' + Math.ceil(Math.random() * 5);
      var ast = this.asteroids.getFirstDead(true, x, -50, key);
      ast.reset(x, -50);
      ast.body.enable      = true;
      ast.loadTexture(key);
      ast.anchor.set(0.5);
      ast.scale.setTo(1.4 + Math.random() * 0.8, 1.4 + Math.random() * 0.8);
      ast.body.velocity.y  = 80 + Math.random() * 60;
      ast.body.velocity.x  = (Math.random() - 0.5) * 30;
      ast._rotSpeed        = (Math.random() - 0.5) * 90;
      ast.checkWorldBounds = true;
      ast.outOfBoundsKill  = true;
    },

    // ── Enemy fire ───────────────────────────────────────────

    _enemyFire: function (enemy) {
      var b = this.enemyBullets.getFirstDead();
      if (!b) {
        b = this.enemyBullets.create(0, 0, 'eproj-1');
        b.anchor.set(0.5);
        b.scale.setTo(1.5, 1.5);
        b.checkWorldBounds = true;
        b.outOfBoundsKill  = true;
      }
      b.reset(enemy.x, enemy.y + 16);
      b.body.enable     = true;
      b._homing         = false;
      b.body.velocity.y = 230;
      b.body.velocity.x = (Math.random() - 0.5) * 70;
    },

    // ── Power-ups ────────────────────────────────────────────

    _tryDropPowerup: function (x, y) {
      if (Math.random() > 0.20) return;
      var type = Math.floor(Math.random() * 4);
      var key  = 'pu-' + type;
      var pu   = this.powerups.getFirstDead(true, x, y, key);
      pu.reset(x, y);
      pu.body.enable      = true;
      pu.loadTexture(key);
      pu.anchor.set(0.5);
      pu.scale.setTo(1.8, 1.8);
      pu.body.velocity.y  = 90;
      pu._type            = type;
      pu.checkWorldBounds = true;
      pu.outOfBoundsKill  = true;
    },

    _applyPowerup: function (player, pu) {
      var type = pu._type;
      pu.kill();
      this.sndItem.play();
      this.score += 50;
      var self = this;
      switch (type) {
        case 0:
          self.speedBoost = true;
          if (self.speedTimer) game.time.events.remove(self.speedTimer);
          self.speedTimer = game.time.events.add(5000, function () { self.speedBoost = false; });
          break;
        case 1:
          self.spreadActive = true;
          if (self.spreadTimer) game.time.events.remove(self.spreadTimer);
          self.spreadTimer = game.time.events.add(10000, function () { self.spreadActive = false; });
          break;
        case 2:
          self.hasShield = true;
          break;
        case 3:
          self.score += 500;
          break;
      }
    },

    // ── Shooting ─────────────────────────────────────────────

    _fireBullet: function () {
      var self  = this;
      var shots = this.spreadActive ? SHOT_SPREAD : SHOT_SINGLE;

      shots.forEach(function (shot) {
        var b = self.bullets.getFirstDead();
        if (!b) {
          b = self.bullets.create(0, 0, 'laser');
          b.anchor.set(0.5);
          b.scale.setTo(2, 2);
          b.checkWorldBounds = true;
          b.outOfBoundsKill  = true;
        }
        b.reset(self.player.x, self.player.y - 26);
        b.body.enable = true;   // reset() does not re-enable body disabled by kill()
        b.tint = self.spreadActive ? 0x88ffff : 0xffffff;
        b.body.velocity.setTo(shot.vx, shot.vy);
      });

      this.sndShoot.play();
    },

    // ── Collision handlers ───────────────────────────────────

    _onBulletHitEnemy: function (bullet, enemy) {
      bullet.kill();
      this._spawnHit(enemy.x, enemy.y);
      var big = (enemy._keys && (enemy._keys[0] === 'ebg-1' || enemy._keys[0] === 'warp-1'));
      this._spawnExplosion(enemy.x, enemy.y, big);
      if (enemy._anim) { enemy._anim.sprite = { alive: false }; }
      var pts = enemy._points || 100;
      enemy.kill();
      this.sndDeath.play();
      this.score += pts;
      this._tryDropPowerup(enemy.x, enemy.y);
      this._onOneEnemyGone();
    },

    _onEnemyBulletHitPlayer: function (player, bullet) {
      bullet.kill();
      this._doPlayerHit();
    },

    _onPlayerHitEnemy: function (player, enemy) {
      if (enemy._anim) { enemy._anim.sprite = { alive: false }; }
      this._spawnExplosion(enemy.x, enemy.y, false);
      enemy.kill();
      this._onOneEnemyGone();
      this._doPlayerHit();
    },

    _onAsteroidHitPlayer: function (player, asteroid) {
      asteroid.kill();
      this._doPlayerHit();
    },

    _onAsteroidHitEnemy: function (asteroid, enemy) {
      if (enemy._anim) { enemy._anim.sprite = { alive: false }; }
      this._spawnExplosion(enemy.x, enemy.y, false);
      this.score += (enemy._points || 100);
      enemy.kill();
      this._onOneEnemyGone();
    },

    // ── Player hit ───────────────────────────────────────────

    _doPlayerHit: function () {
      if (this.invincible) return;

      if (this.hasShield) {
        this.hasShield = false;
        this._spawnHit(this.player.x, this.player.y);
        game.camera.shake(0.008, 150);
        return;
      }

      game.camera.shake(0.018, 300);
      this.sndHurt.play();
      this.lives--;
      if (this.lives <= 0) { this._doGameOver(); return; }

      this.invincible = true;
      var self = this;
      game.add.tween(this.player).to(
        { alpha: 0.2 }, 100, Phaser.Easing.Linear.None, true, 0, 8, true
      );
      game.time.events.add(1600, function () {
        if (self._active && self.player && self.player.alive) {
          self.player.alpha = 1; self.invincible = false;
        }
      });
    },

    // ── FX ───────────────────────────────────────────────────

    _spawnExplosion: function (x, y, large) {
      var keys = large ? EXP_B_KEYS : EXP_A_KEYS;
      var sc   = large ? 3.0 : 2.5;
      var sp   = this.fxGroup.getFirstDead(true, x, y, keys[0]);
      sp.reset(x, y);
      sp.loadTexture(keys[0]);
      sp.anchor.set(0.5);
      sp.scale.setTo(sc, sc);
      var anim = new Anim(sp, keys, 14, false);
      this.anims.push(anim);
      game.time.events.add((keys.length / 14) * 1000 + 80, function () {
        if (sp.alive) sp.kill();
      });
    },

    _spawnHit: function (x, y) {
      var sp = this.fxGroup.getFirstDead(true, x, y, 'hit-1');
      sp.reset(x, y);
      sp.loadTexture('hit-1');
      sp.anchor.set(0.5);
      sp.scale.setTo(2, 2);
      var anim = new Anim(sp, HIT_KEYS, 20, false);
      this.anims.push(anim);
      game.time.events.add((HIT_KEYS.length / 20) * 1000 + 50, function () {
        if (sp.alive) sp.kill();
      });
    },

    // Generic FX spawner — used for Grotto / Warped effects
    _spawnFX: function (x, y, keys, fps, loop) {
      var sp = this.fxGroup.getFirstDead(true, x, y, keys[0]);
      sp.reset(x, y);
      sp.loadTexture(keys[0]);
      sp.anchor.set(0.5);
      sp.scale.setTo(2.5, 2.5);
      var anim = new Anim(sp, keys, fps, loop);
      this.anims.push(anim);
      var dur = (keys.length / fps) * 1000 + 80;
      game.time.events.add(dur, function () { if (sp.alive) sp.kill(); });
    },

    // ── Game Over ────────────────────────────────────────────

    _saveScore: function () {
      var scores = loadScores();
      scores.push(this.score);
      scores.sort(function (a, b) { return b - a; });
      localStorage.setItem('retro-shooter-highscore', JSON.stringify(scores.slice(0, 5)));
    },

    _doGameOver: function () {
      if (!this._active) return;
      this._active = false;
      this.player.kill();
      if (this.music && this.music.isPlaying) { this.music.stop(); }
      this._saveScore();
      var score = this.score;
      game.state.start('GameOver', true, false, score);
    },

    // ── Update ───────────────────────────────────────────────

    update: function () {
      if (!this._active) return;

      var dt       = Math.min(game.time.elapsed / 1000, 0.05);
      var t        = game.time.totalElapsedSeconds();
      var self     = this;
      var levelDef = LEVEL_DEFS[this.levelIndex];

      // Scroll backgrounds
      for (var li = 0; li < this.bgLayers.length; li++) {
        this.bgLayers[li].tilePosition.y += this.bgLayers[li].scrollSpeed * dt;
      }

      // Planet prop
      if (this.planetSprite && this.planetSprite.alive) {
        this.planetSprite.y += this.planetSprite._scrollSpeed * dt;
        if (this.planetSprite.y > H + 200) { this.planetSprite.y = -200; }
      }

      // Tick animators
      this.anims = this.anims.filter(function (a) {
        a.update(dt);
        return !a.done && a.sprite.alive;
      });

      // Boss update
      if (this.bossPhase) { this._updateBoss(dt); }

      if (!this.player.alive) return;

      // ── Player movement ──────────────────────────────────
      var spd = this.speedBoost ? 300 : 200;
      var vx  = 0, vy = 0;
      if (this.cursors.left.isDown  || this.wasd.left.isDown)  vx = -spd;
      if (this.cursors.right.isDown || this.wasd.right.isDown) vx =  spd;
      if (this.cursors.up.isDown    || this.wasd.up.isDown)    vy = -spd;
      if (this.cursors.down.isDown  || this.wasd.down.isDown)  vy =  spd;
      this.player.body.velocity.setTo(vx, vy);
      this.player.x = Phaser.Math.clamp(this.player.x, 24, W - 24);
      this.player.y = Phaser.Math.clamp(this.player.y, 24, H - 24);
      this.shipAnim.update(dt);

      // ── Shooting ────────────────────────────────────────
      this.fireCd -= dt;
      if (this.spaceKey.isDown && this.fireCd <= 0) {
        this._fireBullet();
        this.fireCd = this.FIRE_RATE;
      }

      // ── Shield graphic ──────────────────────────────────
      this.shieldGfx.clear();
      if (this.hasShield) {
        this.shieldGfx.lineStyle(3, 0x00ffff, 0.85);
        this.shieldGfx.drawCircle(this.player.x, this.player.y, 50);
      }

      // ── Spread-shot glow ────────────────────────────────
      this.spreadGfx.clear();
      if (this.spreadActive) {
        var pulse = 0.4 + Math.abs(Math.sin(t * 5)) * 0.35;
        this.spreadGfx.lineStyle(4, 0x00ffff, pulse);
        this.spreadGfx.drawCircle(this.player.x, this.player.y, 28);
      }

      // ── Enemy updates ────────────────────────────────────
      var toKill = this._toKill;
      toKill.length = 0;
      this.enemies.forEachAlive(function (enemy) {
        if (enemy._waveDef && enemy._waveDef.pattern === 'sine') {
          enemy.body.velocity.x = enemy._sineAmp * enemy._sineSpeed *
            Math.cos(t * enemy._sineSpeed + enemy._phase);
        }
        enemy._fireCd -= dt;
        if (enemy._fireCd <= 0) {
          self._enemyFire(enemy);
          enemy._fireCd = levelDef.fireRate * (0.7 + Math.random() * 0.6);
        }
        if (enemy.y > H + 50) { toKill.push(enemy); }
      });
      toKill.forEach(function (enemy) {
        if (enemy._anim) { enemy._anim.sprite = { alive: false }; }
        enemy.kill();
        self._onOneEnemyGone();
      });

      // ── Homing bullet steering ───────────────────────────
      this.enemyBullets.forEachAlive(function (b) {
        if (!b._homing) return;
        var dx   = self.player.x - b.x;
        var dy   = self.player.y - b.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          var spd2 = 160;
          b.body.velocity.x += (dx / dist * spd2 - b.body.velocity.x) * dt * 3;
          b.body.velocity.y += (dy / dist * spd2 - b.body.velocity.y) * dt * 3;
        }
      });

      // ── Asteroid rotation ────────────────────────────────
      this.asteroids.forEachAlive(function (ast) {
        ast.angle += ast._rotSpeed * dt;
      });

      // ── Collisions ──────────────────────────────────────
      game.physics.arcade.overlap(this.bullets,      this.enemies,      this._onBulletHitEnemy,       null, this);
      game.physics.arcade.overlap(this.player,       this.enemies,      this._onPlayerHitEnemy,       null, this);
      game.physics.arcade.overlap(this.player,       this.enemyBullets, this._onEnemyBulletHitPlayer, null, this);
      game.physics.arcade.overlap(this.player,       this.powerups,     this._applyPowerup,           null, this);
      game.physics.arcade.overlap(this.player,       this.asteroids,    this._onAsteroidHitPlayer,    null, this);
      game.physics.arcade.overlap(this.asteroids,    this.enemies,      this._onAsteroidHitEnemy,     null, this);

      // Boss bullet collision — manual bounds check (boss has no physics body)
      if (this.boss && this.boss.alive &&
          (this.bossPhase === 'fighting' || this.bossPhase === 'phase2' ||
           this.bossPhase === 'diving'   || this.bossPhase === 'rays')) {
        var bdef  = BOSS_DEFS[this.levelIndex];
        var hitW  = 72 * bdef.scale;  // half hit-box width in world px
        var hitH  = 55 * bdef.scale;  // half hit-box height
        var bx    = this.boss.x;
        var by    = this.boss.y;
        this.bullets.forEachAlive(function (bullet) {
          if (Math.abs(bullet.x - bx) < hitW && Math.abs(bullet.y - by) < hitH) {
            self._onBulletHitBoss(bullet, self.boss);
          }
        });
      }

      this._refreshHUD();
    },

    shutdown: function () {
      this._active = false;
      if (this.music && this.music.isPlaying) { this.music.stop(); }
      if (this.asteroidTimer) { game.time.events.remove(this.asteroidTimer); }
    }
  };

  /* ─────────────────────────────────────────────────────────────
     LEVEL CLEAR
  ───────────────────────────────────────────────────────────── */
  var LevelClearState = {
    init: function (data) {
      this.clearedNum = data.clearedNum;
      this.nextLevel  = data.nextLevel;
      this.score      = data.score;
      this.lives      = data.lives;
    },

    create: function () {
      buildBg(this.nextLevel);

      game.add.text(W / 2, 200, 'LEVEL ' + this.clearedNum + '\nCLEAR!', {
        font: 'bold 44px monospace', fill: '#00ff88', align: 'center'
      }).anchor.set(0.5);

      game.add.text(W / 2, 340, 'SCORE  ' + padScore(this.score), {
        font: '22px monospace', fill: '#ffffff'
      }).anchor.set(0.5);

      game.add.text(W / 2, 420, 'LEVEL ' + (this.nextLevel + 1) + ' INCOMING...', {
        font: '16px monospace', fill: '#00ffff'
      }).anchor.set(0.5);

      var blink = game.add.text(W / 2, 560, 'PRESS ENTER TO CONTINUE', {
        font: '14px monospace', fill: '#aaaaaa'
      });
      blink.anchor.set(0.5);
      game.add.tween(blink).to({ alpha: 0 }, 600, Phaser.Easing.Linear.None, true, 0, -1, true);

      var next  = this.nextLevel;
      var score = this.score;
      var lives = this.lives;
      var advance = function () {
        game.state.start('Play', true, false, { level: next, score: score, lives: lives });
      };
      game.time.events.add(5000, advance);
      game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.addOnce(advance);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     VICTORY
  ───────────────────────────────────────────────────────────── */
  var VictoryState = {
    init: function (data) {
      this.finalScore = (data && data.score) ? data.score : 0;
    },

    create: function () {
      buildBg(2);

      game.add.text(W / 2, 160, 'YOU WIN!', {
        font: 'bold 56px monospace', fill: '#ffff00', align: 'center'
      }).anchor.set(0.5);

      game.add.text(W / 2, 270, 'ALL BOSSES DEFEATED', {
        font: '16px monospace', fill: '#00ffcc', align: 'center'
      }).anchor.set(0.5);

      game.add.text(W / 2, 350, 'FINAL SCORE', {
        font: '18px monospace', fill: '#aaaaaa'
      }).anchor.set(0.5);

      game.add.text(W / 2, 395, padScore(this.finalScore), {
        font: 'bold 36px monospace', fill: '#ffffff'
      }).anchor.set(0.5);

      var scores = loadScores();
      if (scores.length > 0 && scores[0] <= this.finalScore) {
        var hs = game.add.text(W / 2, 450, 'NEW HIGH SCORE!', {
          font: '18px monospace', fill: '#ffff00'
        });
        hs.anchor.set(0.5);
        game.add.tween(hs).to({ alpha: 0.2 }, 400, Phaser.Easing.Linear.None, true, 0, -1, true);
      }

      var blink = game.add.text(W / 2, 560, 'PRESS ENTER TO PLAY AGAIN', {
        font: '14px monospace', fill: '#aaaaaa'
      });
      blink.anchor.set(0.5);
      game.add.tween(blink).to({ alpha: 0 }, 600, Phaser.Easing.Linear.None, true, 0, -1, true);

      game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
        .onDown.addOnce(function () { game.state.start('Title'); });
    }
  };

  /* ─────────────────────────────────────────────────────────────
     GAME OVER
  ───────────────────────────────────────────────────────────── */
  var GameOverState = {
    init: function (score) { this.finalScore = score || 0; },

    create: function () {
      buildBg(0);

      game.add.text(W / 2, 220, 'GAME OVER', {
        font: 'bold 44px monospace', fill: '#ff4444'
      }).anchor.set(0.5);

      game.add.text(W / 2, 330, 'SCORE  ' + padScore(this.finalScore), {
        font: '22px monospace', fill: '#ffffff'
      }).anchor.set(0.5);

      var scores = loadScores();
      if (scores.length > 0 && scores[0] <= this.finalScore) {
        game.add.text(W / 2, 385, 'NEW HIGH SCORE!', {
          font: '16px monospace', fill: '#ffff00'
        }).anchor.set(0.5);
      }

      var blink = game.add.text(W / 2, 520, 'PRESS ENTER TO RETRY', {
        font: '15px monospace', fill: '#aaaaaa'
      });
      blink.anchor.set(0.5);
      game.add.tween(blink).to({ alpha: 0 }, 600, Phaser.Easing.Linear.None, true, 0, -1, true);

      game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
        .onDown.addOnce(function () { game.state.start('Title'); });
    }
  };

  /* ─────────────────────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────────────────────── */

  function buildBg(levelIndex) {
    var cfg = LEVEL_DEFS[levelIndex] || LEVEL_DEFS[0];
    return cfg.bgLayers.map(function (layer) {
      var ts = game.add.tileSprite(0, 0, W, H, layer.key);
      ts.scrollSpeed = layer.speed;
      return ts;
    });
  }

  function loadScores() {
    try { return JSON.parse(localStorage.getItem('retro-shooter-highscore') || '[]'); }
    catch (e) { return []; }
  }

  function padScore(n) {
    var s = String(n);
    while (s.length < 6) { s = '0' + s; }
    return s;
  }

  /* ─────────────────────────────────────────────────────────────
     REGISTER & START
  ───────────────────────────────────────────────────────────── */
  game.state.add('Boot',       BootState);
  game.state.add('Preload',    PreloadState);
  game.state.add('Title',      TitleState);
  game.state.add('Play',       PlayState);
  game.state.add('LevelClear', LevelClearState);
  game.state.add('Victory',    VictoryState);
  game.state.add('GameOver',   GameOverState);
  game.state.start('Boot');

})();
