# Retro Space Shooter — Game Specification

## Overview

A vertical-scrolling 2D retro arcade space shooter built with **Phaser (v2.x)**. The player pilots a spaceship through waves of alien enemies across 3 levels, collecting power-ups and defeating a boss at the end of each level. The game tracks a local high score and provides a complete arcade loop: title screen → gameplay → game over / victory.

---

## Core Requirements

### Player
- Moves in all 4 directions (arrow keys / WASD), constrained to screen bounds
- Fires laser bolts upward (SPACE to shoot, or hold for auto-fire)
- 3 lives; respawns in the center after death with brief invincibility
- Dies on collision with enemy ship or enemy projectile

### Enemies
- Spawn in waves from the top of the screen
- Follow predefined movement patterns (straight-down, sine-wave, dive-bomb)
- Fire projectiles downward at the player
- Drop power-ups on death (random, ~20% chance)

### Power-ups
- **Speed Boost** — increases player movement speed for 5s
- **Spread Shot** — player fires 3-way spread for 10s
- **Shield** — absorbs one hit
- **Bonus Points** — instant score boost

### Progression
- 3 levels, each with 3 waves of enemies + 1 boss wave
- Enemies get faster and more numerous each level
- Boss appears after wave 3 of each level
- Defeating boss advances to the next level

### Scoring
- Small enemy: 100pts | Medium enemy: 250pts | Big enemy: 500pts | Boss: 2000pts
- Power-up collected: 50pts
- Local high score saved to `localStorage`

### UI
- HUD: score (top-left), high score (top-center), lives (top-right)
- Title screen with PRESS START prompt
- Game over screen with final score and high score
- Victory screen after defeating Level 3 boss

---

## Tech Stack

- **Engine:** Phaser 2.x (`space-game/phaser.min.js`)
- **Entry point:** `space-game/index.html`
- **Game code:** `space-game/game.js`
- **Assets:** `Legacy Collection/Assets/` (paths listed below)

---

## Technical Requirements

### Rendering & Display
- Canvas size: 480×640 (portrait)
- Renderer: Phaser auto-detect (WebGL with Canvas fallback)
- Black letterbox on larger screens

### Engine & Architecture
- Phaser 2.x with discrete game states: `Boot`, `Preload`, `Menu`, `Game`, `GameOver`, `Victory`
- Arcade physics for collision detection
- Object pooling for bullets, explosions, and enemies (performance)

### Asset Loading
- All assets loaded in `Preload` state before gameplay starts
- Loading bar shown during preload
- Audio decoded before game starts (no mid-game stutter)

### Input
- Arrow keys + WASD for movement
- SPACE for shoot
- Enter / SPACE to confirm on menu screens
- Keyboard only (no mouse / touch required)

### Persistence
- High score stored in `localStorage` under key `retro-shooter-highscore`

### Audio
- OGG primary, MP3 fallback
- BGM loops seamlessly
- SFX play without blocking

### Browser Compatibility
- Modern Chrome / Firefox / Safari (evergreen)
- No IE support required

### Performance Targets
- Max ~50 active sprites on screen simultaneously
- No frame drops during boss explosions

---

## Asset Manifest

All paths are relative to the project root `/Users/Nathan/space shooter game/`.

### Player Ship

| Asset | Path |
|---|---|
| Ship spritesheet (10 frames) | `Legacy Collection/Assets/Packs/SpaceShipShooter/spritesheets/ship.png` |
| Individual frames | `Legacy Collection/Assets/Packs/SpaceShipShooter/Sprites/Ship/ship1.png` … `ship10.png` |
| Alt ship (spaceship-unit) | `Legacy Collection/Assets/Misc/spaceship-unit/Spritesheets/Spritesheet.png` |

### Enemy Ships

| Asset | Path |
|---|---|
| Small enemy spritesheet | `Legacy Collection/Assets/Packs/SpaceShipShooter/spritesheets/enemy-small.png` |
| Medium enemy spritesheet | `Legacy Collection/Assets/Packs/SpaceShipShooter/spritesheets/enemy-medium.png` |
| Big enemy spritesheet | `Legacy Collection/Assets/Packs/SpaceShipShooter/spritesheets/enemy-big.png` |
| Alt enemy set (5 variants) | `Legacy Collection/Assets/Packs/SpaceShooter/Space Shooter files/enemy/spritesheet.png` |
| Alien flying enemy | `Legacy Collection/Assets/Characters/alien-flying-enemy/spritesheet.png` |
| Warped fast ship (elite enemy) | `Legacy Collection/Assets/Misc/Warped Fast Ship Files/Spritesheets/ship-fly-preview.png` |

### Boss

| Asset | Path |
|---|---|
| Boss body | `Legacy Collection/Assets/Misc/top-down-boss/PNG/spritesheets/boss.png` |
| Boss thrust | `Legacy Collection/Assets/Misc/top-down-boss/PNG/spritesheets/boss-thrust.png` |
| Boss cannon left | `Legacy Collection/Assets/Misc/top-down-boss/PNG/spritesheets/cannon-left.png` |
| Boss cannon right | `Legacy Collection/Assets/Misc/top-down-boss/PNG/spritesheets/cannon-right.png` |
| Boss energy rays | `Legacy Collection/Assets/Misc/top-down-boss/PNG/spritesheets/rays.png` |
| Boss bolt projectile | `Legacy Collection/Assets/Misc/top-down-boss/PNG/spritesheets/bolt.png` |

### Weapons & Projectiles

| Asset | Path |
|---|---|
| Player laser bolts (4 variants) | `Legacy Collection/Assets/Packs/SpaceShipShooter/spritesheets/laser-bolts.png` |
| Individual laser frames 1–4 | `Legacy Collection/Assets/Packs/SpaceShipShooter/Sprites/Laser Bolts/laser-bolts1.png` … `laser-bolts4.png` |
| Enemy projectile spritesheet | `Legacy Collection/Assets/Misc/EnemyProjectile/spritesheet.png` |
| Warped bolt (charged shot) | `Legacy Collection/Assets/Misc/Warped shooting fx/Bolt/spritesheet.png` |
| Charged shot FX | `Legacy Collection/Assets/Misc/Warped shooting fx/charged/spritesheet.png` |

### Explosions & Effects

| Asset | Path |
|---|---|
| Explosion A (8-frame, small) | `Legacy Collection/Assets/Misc/Explosions pack/explosion-1-a/spritesheet.png` |
| Explosion B (8-frame, small alt) | `Legacy Collection/Assets/Misc/Explosions pack/explosion-1-b/spritesheet.png` |
| Explosion C (10-frame, medium) | `Legacy Collection/Assets/Misc/Explosions pack/explosion-1-c/spritesheet.png` |
| Explosion D (12-frame, large) | `Legacy Collection/Assets/Misc/Explosions pack/explosion-1-d/spritsheet.png` |
| Explosion E (22-frame, boss chain) | `Legacy Collection/Assets/Misc/Explosions pack/explosion-1-e/Sprites/explosion-e1.png` … `explosion-e22.png` |
| Explosion G spritesheet (7-frame) | `Legacy Collection/Assets/Misc/Explosions pack/explosion-1-g/spritesheet.png` |
| SpaceShipShooter explosion | `Legacy Collection/Assets/Packs/SpaceShipShooter/spritesheets/explosion.png` |
| Enemy death animation | `Legacy Collection/Assets/Misc/EnemyDeath/spritesheet.png` |
| Bullet hit flash | `Legacy Collection/Assets/Misc/Hit/hit.png` |
| Hit sparks | `Legacy Collection/Assets/Misc/Warped shooting fx/hits/hits-1/spritesheet.png` |
| Waveform shot FX | `Legacy Collection/Assets/Misc/Warped shooting fx/waveform/spritesheet.png` |

### Power-ups

| Asset | Path |
|---|---|
| Power-up sheet (4 types) | `Legacy Collection/Assets/Packs/SpaceShipShooter/spritesheets/power-up.png` |
| Individual frames | `Legacy Collection/Assets/Packs/SpaceShipShooter/Sprites/PowerUps/power-up1.png` … `power-up4.png` |

### Backgrounds & Environments

| Asset | Path | Usage |
|---|---|---|
| Deep space (back layer) | `Legacy Collection/Assets/Environments/space_background_pack/Blue Version/layered/blue-back.png` | Level 1 — slowest parallax |
| Stars layer | `Legacy Collection/Assets/Environments/space_background_pack/Blue Version/layered/blue-stars.png` | Level 1 — mid parallax |
| Stars with nebula | `Legacy Collection/Assets/Environments/space_background_pack/Blue Version/layered/blue-with-stars.png` | Level 1 — alt mid layer |
| Big planet prop | `Legacy Collection/Assets/Environments/space_background_pack/Blue Version/layered/prop-planet-big.png` | Level 1 dressing |
| Small planet prop | `Legacy Collection/Assets/Environments/space_background_pack/Blue Version/layered/prop-planet-small.png` | Level 2 dressing |
| Alt space background | `Legacy Collection/Assets/Packs/SpaceShooter/Space Shooter files/background/layered/bg-back.png` | Level 2 back |
| Planet (alt) | `Legacy Collection/Assets/Packs/SpaceShooter/Space Shooter files/background/layered/bg-planet.png` | Level 2 dressing |
| Stars (alt) | `Legacy Collection/Assets/Packs/SpaceShooter/Space Shooter files/background/layered/bg-stars.png` | Level 2 stars |
| Space stage back | `Legacy Collection/Assets/Environments/top-down-space-environment/PNG/layers/stage-back.png` | Level 3 background |

### Asteroids (Hazards)

| Asset | Path |
|---|---|
| Asteroid 1–5 (top-down pack) | `Legacy Collection/Assets/Environments/top-down-space-environment/PNG/layers/cut-out-sprites/asteroid-01.png` … `asteroid-05.png` |
| Asteroid set (space bg pack) | `Legacy Collection/Assets/Environments/space_background_pack/Blue Version/layered/asteroid-1.png`, `asteroid-2.png` |
| Asteroid fighter pack set (5) | `Legacy Collection/Assets/Packs/asteroid-fighter/PNG/asteroids/asteroid-1.png` … `asteroid-5.png` |

### Audio

| Asset | Path | Usage |
|---|---|---|
| Shoot sound | `tiny-RPG-forest-files/Demo/assets/sound/slash.ogg` | Player fires |
| Player hit | `tiny-RPG-forest-files/Demo/assets/sound/hurt.ogg` | Player takes damage |
| Enemy death | `tiny-RPG-forest-files/Demo/assets/sound/enemy-death.ogg` | Enemy destroyed |
| Power-up pickup | `tiny-RPG-forest-files/Demo/assets/sound/item.ogg` | Collect power-up |
| Background music | `tiny-RPG-forest-files/Demo/assets/sound/ancient_path.ogg` | In-game BGM (looping) |

---

## Milestones

Each milestone produces a **fully playable build** at `space-game/index.html`.

---

### Milestone 1 — Core Gameplay Loop

**Goal:** A playable single-level game: moving player, shooting, 3 waves of enemies, lives, and score.

**Deliverables:**
- [ ] Phaser game boots with 480×640 canvas
- [ ] Scrolling parallax starfield (2 layers: `blue-back.png`, `blue-stars.png`)
- [ ] Player ship rendered and controllable (arrow keys / WASD)
- [ ] Player fires laser bolts upward (SPACE / hold for auto-fire)
- [ ] Wave 1: 8 small enemies enter from top, straight-down movement
- [ ] Wave 2: 8 medium enemies, sine-wave movement
- [ ] Wave 3: 6 big enemies, faster straight-down
- [ ] Enemy collision with player → lose a life
- [ ] Bullet hits enemy → explosion, score increment
- [ ] 3 lives; game over screen when lives = 0
- [ ] HUD: score (top-left), lives icons (top-right)

**Assets used:**
- Player: `SpaceShipShooter/spritesheets/ship.png`
- Enemies: `SpaceShipShooter/spritesheets/enemy-small.png`, `enemy-medium.png`, `enemy-big.png`
- Bullets: `SpaceShipShooter/spritesheets/laser-bolts.png`
- Explosions: `Explosions pack/explosion-1-a/spritesheet.png`
- Background: `space_background_pack/Blue Version/layered/blue-back.png`, `blue-stars.png`

---

### Milestone 2 — Levels, Waves & Power-ups

**Goal:** 3 full levels with escalating difficulty, enemy projectiles, power-ups, and asteroids.

**Deliverables:**
- [ ] 3 levels, each with 3 enemy waves in formation patterns
- [ ] Level 1: blue space bg, small + medium enemies
- [ ] Level 2: alt bg + planet, medium + big enemies, faster speed
- [ ] Level 3: top-down space env, alien flying enemies + warped fast ships
- [ ] Enemy projectiles — enemies fire downward at intervals
- [ ] "WAVE X" flash text between waves; "LEVEL X" transition between levels
- [ ] Power-ups drop on enemy death (20%): speed, spread shot, shield, bonus pts
- [ ] Spread shot fires 3-direction laser fan
- [ ] Shield renders visible aura, absorbs 1 hit
- [ ] Asteroids drift down as hazards (kill player and enemies on contact)
- [ ] High score in HUD (top-center), persisted to `localStorage`

**Assets used:**
- Enemy projectiles: `EnemyProjectile/spritesheet.png`
- Power-ups: `SpaceShipShooter/spritesheets/power-up.png`
- Level 2 bg: `SpaceShooter/Space Shooter files/background/layered/bg-back.png`, `bg-planet.png`, `bg-stars.png`
- Level 3 bg: `top-down-space-environment/PNG/layers/stage-back.png`
- Asteroids: `top-down-space-environment/PNG/layers/cut-out-sprites/asteroid-01.png` … `asteroid-05.png`
- Alien flying enemy: `alien-flying-enemy/spritesheet.png`
- Elite enemy: `Warped Fast Ship Files/Spritesheets/ship-fly-preview.png`
- Hit flash: `Hit/hit.png`
- Explosion B: `Explosions pack/explosion-1-b/spritesheet.png`

---

### Milestone 3 — Boss Fights, Polish & Complete Game Loop

**Goal:** Boss encounters at the end of each level, full UI flow (title → gameplay → end screens), and juice.

**Deliverables:**
- [ ] Boss fight after wave 3 of each level (3 unique encounters)
  - Boss 1: moves side-to-side, fires spread bolt pattern
  - Boss 2: side-to-side + dives, fires energy rays
  - Boss 3: combines all patterns, homing bolts
- [ ] Boss health bar at top of screen
- [ ] Boss death triggers chain-explosion sequence
- [ ] Title / start screen: game name + "PRESS SPACE TO START"
- [ ] Game over screen: final score, high score, "PRESS SPACE TO RETRY"
- [ ] Victory screen after Level 3 boss: "YOU WIN" + final score
- [ ] Level clear screen with score tally
- [ ] Screen shake on player hit
- [ ] Charged shot glow effect when spread-shot active
- [ ] Enemy death aura animation
- [ ] Waveform pulse when boss fires rays
- [ ] Background music looping during gameplay
- [ ] SFX: shoot, hit, explosion, power-up, boss alarm

**Assets used:**
- Boss: `top-down-boss/PNG/spritesheets/boss.png`, `cannon-left.png`, `cannon-right.png`, `rays.png`, `bolt.png`, `boss-thrust.png`
- Large explosions: `Explosions pack/explosion-1-d/spritsheet.png`, `explosion-1-e/` frames
- Enemy death: `EnemyDeath/spritesheet.png`
- Charged shot: `Warped shooting fx/charged/spritesheet.png`
- Waveform FX: `Warped shooting fx/waveform/spritesheet.png`
- Hit sparks: `Warped shooting fx/hits/hits-1/spritesheet.png`
- Audio: all files in `tiny-RPG-forest-files/Demo/assets/sound/`

---

## File Structure (Target)

```
space shooter game/
├── SPEC.md                  ← this file
├── space-game/
│   ├── index.html
│   ├── game.js
│   └── phaser.min.js
└── Legacy Collection/
    └── Assets/              ← all pixel art (read-only, referenced by path)
```

---

## Out of Scope

- Multiplayer
- Mobile / touch controls
- Online leaderboard
- Level editor
