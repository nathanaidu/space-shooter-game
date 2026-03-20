# Space Shooter — Milestone 2 (Bugs Fixed)

Complete snapshot of `space-game/game.js` after all Milestone 2 bug fixes.

## Bugs Fixed

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Game freeze / `killAll is not a function` | `_onLevelClear` could run after Phaser destroyed the world; groups lose methods when destroyed | Added `_active` re-entry guard + null-safety checks on all `killAll` / `forEachAlive` calls |
| GameOver screen never appeared | `_doGameOver` referenced `self` (→ `window`) instead of `this` — timer callback condition was always falsy | Removed delayed timer; calls `game.state.start()` directly after setting `_active = false` |
| Pool physics bodies non-functional after reuse | `kill()` sets `body.enable = false`; `reset()` does **not** re-enable it | Added `body.enable = true` after every `reset()` in `_spawnAsteroid` and `_tryDropPowerup` |
| Collision checks ran after level-clear transition | `update()` had no guard, so physics overlap ran against partially-destroyed groups | Added `if (!this._active) return;` at top of `update()` |
| Asteroid overlap fired every frame on contact | `_onAsteroidHitPlayer` never killed the asteroid | Added `asteroid.kill()` at start of handler |

---

## Current `game.js` Source

```javascript
/* ============================================================
   SPACE SHOOTER  –  Milestone 2
   Vertical scrolling arcade shooter  •  Phaser 2.x
   3 levels • enemy projectiles • power-ups • asteroids
   ============================================================ */

(function () {

  var W = 480, H = 640;

  // ── Asset paths ─────────────────────────────────────────────
  var LC      = '../Legacy Collection/Assets/';
  var BG_BLUE = LC + 'Environments/space_background_pack/Blue Version/layered/';
  var BG_SS   = LC + 'Packs/SpaceShooter/Space Shooter files/background/layered/';
  var BG_TDSE = LC + 'Environments/top-down-space-environment/PNG/layers/';
  var SHIPS   = LC + 'Packs/SpaceShipShooter/Sprites/Ship/';
  var ENM_SM  = LC + 'Packs/SpaceShipShooter/Sprites/EnemySmall/';
  var ENM_MD  = LC + 'Packs/SpaceShipShooter/Sprites/Enemy Medium/';
  var ENM_BG  = LC + 'Packs/SpaceShipShooter/Sprites/EnemyBig/';
  var ALIEN   = LC + 'Characters/alien-flying-enemy/sprites/';
  var WARPED  = LC + 'Misc/Warped Fast Ship Files/Sprites/ship-sprites/';
  var LASER   = LC + 'Packs/SpaceShipShooter/Sprites/Laser Bolts/';
  var EPROJ   = LC + 'Misc/EnemyProjectile/Sprites/';
  var PWRUP   = LC + 'Packs/SpaceShipShooter/Sprites/PowerUps/';
  var EXP_A   = LC + 'Misc/Explosions pack/explosion-1-a/Sprites/';
  var EXP_B   = LC + 'Misc/Explosions pack/explosion-1-b/Sprites/';
  var HIT     = LC + 'Misc/Hit/Sprites/';
  var ASTER   = LC + 'Environments/top-down-space-environment/PNG/layers/cut-out-sprites/';
  var SND     = '../tiny-RPG-forest-files/Demo/assets/sound/';

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
    this.elapsed += Math.min(dt, 0.1); // cap spike frames to 100ms
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
       waves[].keysB  – if set, odd-index enemies use this set (combo wave)
       waves[].pointsB – points for type-B enemies (defaults to points)
  ───────────────────────────────────────────────────────────── */
  var LEVEL_DEFS = [
    // ── Level 1 ──────────────────────────────────────────────
    {
      number:      1,
      bgLayers:    [{ key: 'bg-back',  speed: 22 }, { key: 'bg-stars', speed: 55 }],
      planetKey:   'prop-planet-big',
      planetX:     340, planetY: 170,
      fireRate:    3.5,
      asteroidMs:  6000,
      waves: [
        { label: 'WAVE 1', count: 8,  keys: ['esm-1','esm-2'],             speed: 100, scale: 2, points: 100, pattern: 'straight' },
        { label: 'WAVE 2', count: 8,  keys: ['emd-1','emd-2'],             speed:  90, scale: 2, points: 250, pattern: 'sine'     },
        { label: 'WAVE 3', count: 8,  keys: ['esm-1','esm-2'], keysB: ['emd-1','emd-2'],
          speed: 115, scale: 2, points: 100, pointsB: 250,                          pattern: 'straight' }
      ]
    },
    // ── Level 2 ──────────────────────────────────────────────
    {
      number:      2,
      bgLayers:    [{ key: 'bg-back-2', speed: 30 }, { key: 'bg-stars-2', speed: 70 }],
      planetKey:   'bg-planet',
      planetX:     130, planetY: 260,
      fireRate:    2.8,
      asteroidMs:  4500,
      waves: [
        { label: 'WAVE 1', count: 8,  keys: ['emd-1','emd-2'],             speed: 120, scale: 2, points: 250, pattern: 'sine'     },
        { label: 'WAVE 2', count: 8,  keys: ['ebg-1','ebg-2'],             speed: 110, scale: 2, points: 500, pattern: 'straight' },
        { label: 'WAVE 3', count: 8,  keys: ['emd-1','emd-2'], keysB: ['ebg-1','ebg-2'],
          speed: 130, scale: 2, points: 250, pointsB: 500,                          pattern: 'sine'     }
      ]
    },
    // ── Level 3 ──────────────────────────────────────────────
    {
      number:      3,
      bgLayers:    [{ key: 'bg-back-3', speed: 40 }],
      planetKey:   null,
      fireRate:    2.2,
      asteroidMs:  3500,
      waves: [
        { label: 'WAVE 1', count: 8,  keys: ['alien-1','alien-2','alien-3','alien-4','alien-5','alien-6','alien-7','alien-8'],
          speed: 130, scale: 2, points: 300, pattern: 'sine'     },
        { label: 'WAVE 2', count: 8,  keys: ['warp-1','warp-2','warp-3','warp-4','warp-5'],
          speed: 170, scale: 2, points: 400, pattern: 'straight' },
        { label: 'WAVE 3', count: 8,  keys: ['alien-1','alien-2','alien-3','alien-4','alien-5','alien-6','alien-7','alien-8'],
          keysB: ['warp-1','warp-2','warp-3','warp-4','warp-5'],
          speed: 150, scale: 2, points: 300, pointsB: 400,        pattern: 'sine'     }
      ]
    }
  ];

  // Pre-built FX key arrays
  var SHIP_KEYS  = []; for (var s = 1; s <= 10; s++) { SHIP_KEYS.push('ship-' + s); }
  var EXP_A_KEYS = []; for (var a = 1; a <= 8;  a++) { EXP_A_KEYS.push('exp-a-' + a); }
  var EXP_B_KEYS = []; for (var b = 1; b <= 8;  b++) { EXP_B_KEYS.push('exp-b-' + b); }
  var HIT_KEYS   = []; for (var h = 1; h <= 3;  h++) { HIT_KEYS.push('hit-' + h); }

  // Pre-built shot direction arrays — allocated once, never recreated
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

      // ── Backgrounds ─────────────────────────────────────
      // Level 1
      game.load.image('bg-back',  BG_BLUE + 'blue-back.png');
      game.load.image('bg-stars', BG_BLUE + 'blue-stars.png');
      game.load.image('prop-planet-big', BG_BLUE + 'prop-planet-big.png');
      // Level 2
      game.load.image('bg-back-2',  BG_SS + 'bg-back.png');
      game.load.image('bg-stars-2', BG_SS + 'bg-stars.png');
      game.load.image('bg-planet',  BG_SS + 'bg-planet.png');
      // Level 3
      game.load.image('bg-back-3', BG_TDSE + 'stage-back.png');

      // ── Player ship — 10 frames ──────────────────────────
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
      // Alien flying enemy — 8 frames
      for (var j = 1; j <= 8; j++) {
        game.load.image('alien-' + j, ALIEN + 'alien-enemy-flying' + j + '.png');
      }
      // Warped fast ship — 5 frames
      for (var k = 1; k <= 5; k++) {
        game.load.image('warp-' + k, WARPED + 'ship-0' + k + '.png');
      }

      // ── Player laser bolt ────────────────────────────────
      game.load.image('laser', LASER + 'laser-bolts1.png');

      // ── Enemy projectile ─────────────────────────────────
      game.load.image('eproj-1', EPROJ + 'frame1.png');
      game.load.image('eproj-2', EPROJ + 'frame2.png');

      // ── Power-ups ────────────────────────────────────────
      game.load.image('pu-0', PWRUP + 'power-up1.png');  // speed boost
      game.load.image('pu-1', PWRUP + 'power-up2.png');  // spread shot
      game.load.image('pu-2', PWRUP + 'power-up3.png');  // shield
      game.load.image('pu-3', PWRUP + 'power-up4.png');  // bonus pts

      // ── Asteroids — 5 sprites ────────────────────────────
      for (var m = 1; m <= 5; m++) {
        game.load.image('ast-' + m, ASTER + 'asteroid-0' + m + '.png');
      }

      // ── Explosions ───────────────────────────────────────
      for (var ea = 1; ea <= 8; ea++) {
        game.load.image('exp-a-' + ea, EXP_A + 'explosion-' + ea + '.png');
      }
      for (var eb = 1; eb <= 8; eb++) {
        game.load.image('exp-b-' + eb, EXP_B + 'explosion-1-b-' + eb + '.png');
      }

      // ── Hit flash ────────────────────────────────────────
      for (var hf = 1; hf <= 3; hf++) {
        game.load.image('hit-' + hf, HIT + 'hit' + hf + '.png');
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
      this.levelIndex = (data && data.level  != null) ? data.level  : 0;
      this.score      = (data && data.score  != null) ? data.score  : 0;
      this.lives      = (data && data.lives  != null) ? data.lives  : 3;
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
      this._active       = true;   // cleared in shutdown; guards stale timer callbacks
      this._toKill       = [];     // pre-allocated; reused every frame

      // ── Background ────────────────────────────────────
      this.bgLayers = buildBg(this.levelIndex);

      // Planet prop (decorative, slow-scroll)
      if (levelDef.planetKey) {
        this.planetSprite = game.add.sprite(levelDef.planetX, levelDef.planetY, levelDef.planetKey);
        this.planetSprite.anchor.set(0.5);
        this.planetSprite._scrollSpeed = 8;
      }

      // ── Physics ───────────────────────────────────────
      game.physics.startSystem(Phaser.Physics.ARCADE);

      // ── Groups ────────────────────────────────────────
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

      // ── Player ship ───────────────────────────────────
      this.player = game.add.sprite(W / 2, H - 90, 'ship-1');
      this.player.anchor.set(0.5);
      this.player.scale.setTo(2, 2);
      game.physics.arcade.enable(this.player);
      this.player.body.setSize(12, 20, 2, 2);
      this.shipAnim = new Anim(this.player, SHIP_KEYS, 10, true);

      // Shield graphic — drawn over player each frame
      this.shieldGfx = game.add.graphics(0, 0);

      // ── Input ─────────────────────────────────────────
      this.cursors  = game.input.keyboard.createCursorKeys();
      this.wasd = {
        up:    game.input.keyboard.addKey(Phaser.Keyboard.W),
        down:  game.input.keyboard.addKey(Phaser.Keyboard.S),
        left:  game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D)
      };
      this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

      // ── Audio ─────────────────────────────────────────
      this.sndShoot = game.add.audio('shoot', 0.35);
      this.sndHurt  = game.add.audio('hurt',  0.6);
      this.sndDeath = game.add.audio('death', 0.5);
      this.sndItem  = game.add.audio('item',  0.6);
      this.music    = game.add.audio('music', 0.35, true);
      this.music.play();

      // ── HUD (added last so it renders on top) ─────────
      this._buildHUD();

      // ── Asteroids — start periodic spawner ────────────
      this.asteroidTimer = game.time.events.loop(levelDef.asteroidMs, this._spawnAsteroid, this);

      // ── Kick off first wave ────────────────────────────
      this._scheduleWave(2000);
    },

    // ── HUD ───────────────────────────────────────────────────

    _buildHUD: function () {
      this.scoreTxt = game.add.text(8, 8, 'SCORE  000000', {
        font: '14px monospace', fill: '#ffffff'
      });
      this.scoreTxt.fixedToCamera = true;

      this.hiTxt = game.add.text(W / 2, 8, 'HI  000000', {
        font: '14px monospace', fill: '#ffff00', align: 'center'
      });
      this.hiTxt.anchor.x = 0.5;
      this.hiTxt.fixedToCamera = true;

      this.levelTxt = game.add.text(W - 8, 8, 'LVL ' + (this.levelIndex + 1), {
        font: '14px monospace', fill: '#aaffaa'
      });
      this.levelTxt.anchor.x = 1;
      this.levelTxt.fixedToCamera = true;

      // Lives icons — top-right row
      this.lifeIcons = [];
      for (var i = 0; i < 3; i++) {
        var ic = game.add.sprite(W - 12 - i * 22, 28, 'ship-1');
        ic.scale.setTo(0.9, 0.9);
        ic.fixedToCamera = true;
        this.lifeIcons.push(ic);
      }

      // Power-up status text
      this.puTxt = game.add.text(8, H - 20, '', {
        font: '11px monospace', fill: '#00ffff'
      });
      this.puTxt.fixedToCamera = true;

      // Floating wave/level label
      this.waveLabelTxt = game.add.text(W / 2, H / 2 - 60, '', {
        font: 'bold 28px monospace', fill: '#ffffff', align: 'center'
      });
      this.waveLabelTxt.anchor.set(0.5);
      this.waveLabelTxt.fixedToCamera = true;
    },

    _refreshHUD: function () {
      if (this.score > this.hiScore) { this.hiScore = this.score; }

      // Only update text when the value actually changed (avoids per-frame texture re-render)
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
    },

    _flashLabel: function (msg, color) {
      game.tweens.removeFrom(this.waveLabelTxt);
      this.waveLabelTxt.text  = msg;
      this.waveLabelTxt.style.fill = color || '#ffffff';
      this.waveLabelTxt.alpha = 1;
      game.add.tween(this.waveLabelTxt)
        .to({ alpha: 0 }, 800, Phaser.Easing.Linear.None, true, 800);
    },

    // ── Waves ─────────────────────────────────────────────────

    _scheduleWave: function (delay) {
      var self     = this;
      var gen      = this.waveGen;            // capture so stale callbacks can self-cancel
      var levelDef = LEVEL_DEFS[this.levelIndex];
      var waveDef  = levelDef.waves[this.levelWave];
      // Flash wave label just before spawn
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

      for (var i = 0; i < waveDef.count; i++) {
        (function (idx) {
          game.time.events.add(idx * 420, function () {
            if (!self.player || !self.player.alive) return;
            if (self.waveGen !== gen) return;
            self._spawnEnemy(waveDef, idx);
          });
        })(i);
      }

      // Failsafe: advance if enemies aren't all cleared
      game.time.events.add(waveDef.count * 420 + 7000, function () {
        if (self.waveGen !== gen) return;
        self._clearAndAdvance();
      });
    },

    _spawnEnemy: function (waveDef, idx) {
      // Pick type-A or type-B for combo waves
      var keys   = (waveDef.keysB && idx % 2 === 1) ? waveDef.keysB : waveDef.keys;
      var pts    = (waveDef.keysB && idx % 2 === 1) ? (waveDef.pointsB || waveDef.points) : waveDef.points;

      // Distribute x evenly
      var cols   = Math.min(waveDef.count, 4);
      var col    = idx % cols;
      var margin = 60;
      var x = margin + (cols > 1 ? (col / (cols - 1)) * (W - margin * 2) : (W - margin * 2) / 2);
      x += (Math.random() - 0.5) * 30;
      x  = Phaser.Math.clamp(x, 40, W - 40);

      var enemy = this.enemies.create(x, -48, keys[0]);
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
      if (this.enemies && this.enemies.forEachAlive) {
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
        this._onLevelClear();
        return;
      }
      this._scheduleWave(2200);
    },

    _onLevelClear: function () {
      if (!this._active) return;  // re-entry guard — only execute once
      this._active = false;       // block any second call before world is cleared
      this.waveGen++;
      if (this.enemies      && this.enemies.killAll)      { this.enemies.killAll(); }
      if (this.bullets      && this.bullets.killAll)      { this.bullets.killAll(); }
      if (this.enemyBullets && this.enemyBullets.killAll) { this.enemyBullets.killAll(); }
      if (this.powerups     && this.powerups.killAll)     { this.powerups.killAll(); }
      if (this.asteroidTimer) { game.time.events.remove(this.asteroidTimer); this.asteroidTimer = null; }
      this._saveScore();
      this.music.stop();

      var nextLevel = (this.levelIndex + 1) % LEVEL_DEFS.length;
      game.state.start('LevelClear', true, false, {
        clearedNum: LEVEL_DEFS[this.levelIndex].number,
        nextLevel:  nextLevel,
        score:      this.score,
        lives:      this.lives
      });
    },

    // ── Asteroids ─────────────────────────────────────────────

    _spawnAsteroid: function () {
      var x   = 40 + Math.random() * (W - 80);
      var key = 'ast-' + Math.ceil(Math.random() * 5);
      // Pool: reuse dead sprites before allocating new ones
      var ast = this.asteroids.getFirstDead(true, x, -50, key);
      ast.reset(x, -50);
      ast.body.enable = true;   // reset() does not re-enable body disabled by kill()
      ast.loadTexture(key);
      ast.anchor.set(0.5);
      ast.scale.setTo(1.4 + Math.random() * 0.8, 1.4 + Math.random() * 0.8);
      ast.body.velocity.y  = 80 + Math.random() * 60;
      ast.body.velocity.x  = (Math.random() - 0.5) * 30;
      ast._rotSpeed        = (Math.random() - 0.5) * 90; // deg/s
      ast.checkWorldBounds = true;
      ast.outOfBoundsKill  = true;
    },

    // ── Enemy fire ────────────────────────────────────────────

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
      b.body.velocity.y = 230;
      b.body.velocity.x = (Math.random() - 0.5) * 70;
    },

    // ── Power-up drop ─────────────────────────────────────────

    _tryDropPowerup: function (x, y) {
      if (Math.random() > 0.20) return;
      var type = Math.floor(Math.random() * 4);
      var key  = 'pu-' + type;
      // Pool: reuse dead sprites before allocating new ones
      var pu   = this.powerups.getFirstDead(true, x, y, key);
      pu.reset(x, y);
      pu.body.enable = true;    // reset() does not re-enable body disabled by kill()
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
        case 0: // speed boost
          self.speedBoost = true;
          if (self.speedTimer) game.time.events.remove(self.speedTimer);
          self.speedTimer = game.time.events.add(5000, function () { self.speedBoost = false; });
          break;
        case 1: // spread shot
          self.spreadActive = true;
          if (self.spreadTimer) game.time.events.remove(self.spreadTimer);
          self.spreadTimer = game.time.events.add(10000, function () { self.spreadActive = false; });
          break;
        case 2: // shield
          self.hasShield = true;
          break;
        case 3: // bonus points
          self.score += 500;
          break;
      }
    },

    // ── Shooting ──────────────────────────────────────────────

    _fireBullet: function () {
      var self  = this;
      var shots = this.spreadActive ? SHOT_SPREAD : SHOT_SINGLE;  // use pre-built arrays

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
        b.body.velocity.setTo(shot.vx, shot.vy);
      });

      this.sndShoot.play();
    },

    // ── Collision handlers ─────────────────────────────────────

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
      asteroid.kill();   // kill so overlap doesn't fire every frame
      this._doPlayerHit();
    },

    _onAsteroidHitEnemy: function (asteroid, enemy) {
      if (enemy._anim) { enemy._anim.sprite = { alive: false }; }
      this._spawnExplosion(enemy.x, enemy.y, false);
      this.score += (enemy._points || 100);
      enemy.kill();
      this._onOneEnemyGone();
    },

    // ── Player hit logic (shared) ─────────────────────────────

    _doPlayerHit: function () {
      if (this.invincible) return;

      // Shield absorbs one hit
      if (this.hasShield) {
        this.hasShield = false;
        this._spawnHit(this.player.x, this.player.y);
        return;
      }

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

    // ── FX ────────────────────────────────────────────────────

    _spawnExplosion: function (x, y, large) {
      var keys = large ? EXP_B_KEYS : EXP_A_KEYS;
      var sc   = large ? 3.0 : 2.5;
      // Reuse a dead sprite from the pool rather than allocating a new one
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

    // ── Game over ─────────────────────────────────────────────

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
      this.music.stop();
      this._saveScore();
      var score = this.score;
      game.state.start('GameOver', true, false, score);
    },

    // ── Update ────────────────────────────────────────────────

    update: function () {
      if (!this._active) return;  // state is transitioning — skip all logic

      var dt       = Math.min(game.time.elapsed / 1000, 0.05); // cap at 50ms
      var t        = game.time.totalElapsedSeconds();
      var self     = this;
      var levelDef = LEVEL_DEFS[this.levelIndex];

      // Scroll backgrounds downward (for-loop avoids closure allocation every frame)
      for (var li = 0; li < this.bgLayers.length; li++) {
        this.bgLayers[li].tilePosition.y += this.bgLayers[li].scrollSpeed * dt;
      }

      // Scroll planet prop
      if (this.planetSprite && this.planetSprite.alive) {
        this.planetSprite.y += this.planetSprite._scrollSpeed * dt;
        if (this.planetSprite.y > H + 200) { this.planetSprite.y = -200; }
      }

      // Tick animators; drop finished ones AND ones whose sprite was killed externally
      this.anims = this.anims.filter(function (a) { a.update(dt); return !a.done && a.sprite.alive; });

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

      // ── Enemy updates ────────────────────────────────────
      var toKill = this._toKill;
      toKill.length = 0;  // reset pre-allocated array instead of allocating a new one
      this.enemies.forEachAlive(function (enemy) {
        // Sine-wave horizontal
        if (enemy._waveDef && enemy._waveDef.pattern === 'sine') {
          enemy.body.velocity.x = enemy._sineAmp * enemy._sineSpeed *
            Math.cos(t * enemy._sineSpeed + enemy._phase);
        }
        // Enemy firing
        enemy._fireCd -= dt;
        if (enemy._fireCd <= 0) {
          self._enemyFire(enemy);
          enemy._fireCd = levelDef.fireRate * (0.7 + Math.random() * 0.6);
        }
        // Cull off-bottom
        if (enemy.y > H + 50) { toKill.push(enemy); }
      });
      toKill.forEach(function (enemy) {
        if (enemy._anim) { enemy._anim.sprite = { alive: false }; }
        enemy.kill();
        self._onOneEnemyGone();
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

      this._refreshHUD();
    },

    shutdown: function () {
      this._active = false;  // signal all pending timer callbacks to bail
      if (this.music && this.music.isPlaying) this.music.stop();
      if (this.asteroidTimer) { game.time.events.remove(this.asteroidTimer); }
    }
  };

  /* ─────────────────────────────────────────────────────────────
     LEVEL CLEAR
     Acts as a buffer between Play states so the expensive
     world-destroy/recreate happens while the player is reading
     the screen — not mid-gameplay.
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

      var nextNum = this.nextLevel + 1;
      game.add.text(W / 2, 420, 'LEVEL ' + nextNum + ' INCOMING...', {
        font: '16px monospace', fill: '#00ffff'
      }).anchor.set(0.5);

      var blink = game.add.text(W / 2, 560, 'PRESS ENTER TO CONTINUE', {
        font: '14px monospace', fill: '#aaaaaa'
      });
      blink.anchor.set(0.5);
      game.add.tween(blink).to({ alpha: 0 }, 600,
        Phaser.Easing.Linear.None, true, 0, -1, true);

      var next  = this.nextLevel;
      var score = this.score;
      var lives = this.lives;

      // Auto-advance after 5s or on ENTER
      var advance = function () {
        game.state.start('Play', true, false, { level: next, score: score, lives: lives });
      };
      game.time.events.add(5000, advance);
      game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.addOnce(advance);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     GAME OVER
  ───────────────────────────────────────────────────────────── */
  var GameOverState = {
    init:   function (score) { this.finalScore = score || 0; },

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
      game.add.tween(blink).to({ alpha: 0 }, 600,
        Phaser.Easing.Linear.None, true, 0, -1, true);

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
  game.state.add('GameOver',   GameOverState);
  game.state.start('Boot');

})();
```
