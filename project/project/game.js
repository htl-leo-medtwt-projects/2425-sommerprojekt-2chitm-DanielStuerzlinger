// Code von "https://gist.github.com/alexsc6955/06148d596e75a3fce0a5cc1f9394134f#file-canvas-js"
var myFont = new FontFace('exo', 'url(../Exo/font/Exo-Regular.ttf)');

myFont.load().then(function(font) {
  document.fonts.add(font);
  ctx.font = "50px exo"; // Schriftart setzen
});

let round = 1;
let paused = false;
let upgradeCards = [];
   

// Initialisiert das Spiel und das Canvas
function gameInitiate() {
  body.style.overflow = "hidden";
  const menu = document.getElementById('menu');
  menu.innerHTML = `<canvas id="gameCanvas" tabindex="0"></canvas>`;
  
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // Audio für Schüsse und Explosionen
  const shootSound = new Audio('../sound/retro-shoot.mp3');
  const explodeSound = new Audio('../sound/retro-explode.mp3');
  const volume = localStorage.getItem('volume') ? localStorage.getItem('volume') / 100 : 1;
  shootSound.volume = volume;
  explodeSound.volume = volume;

  // Canvas-Größe anpassen
  function resizeCanvas() {
    canvas.width = menu.clientWidth;
    canvas.height = menu.clientHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  canvas.focus();

  // Spielkonstanten
  const FPS = 60;
  const FRICTION = 0.6;
  const SHIP_SIZE = 30;
  const TURN_SPEED = 360;
  const SHIP_ACCELERATION = 5;
  const SHIP_MAX_SPEED = 7;
  const BULLET_BASE_SPEED = 10;
  const BULLET_LIFE = 60;
  const ASTEROID_SIZE_BASE = 60;
  let asteroid_num = 5;
  let asteroid_speed = 50;
  const ASTEROID_VERTICES = 10;
  const ASTEROID_JAGGEDNESS = 0.4;

  let upgradeMenuActive = false;
  let upgrades = {
    agility: { level: 0, cost: 100 },
    shot: { level: 0, cost: 100 },
    health: { level: 0, cost: 100 },
    size: { level: 0, cost: 100 }
  };

  const secretCode = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT'];
  let codePosition = 0;
  let frameCounter = 0;

  // Konvertiert Grad in Bogenmaß
  function degToRad(deg) {
    return (deg * Math.PI) / 180;
  }

  // Generiert eine Zufallszahl im angegebenen Bereich
  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Berechnet die Distanz zwischen zwei Punkten
  function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  // Klasse für das Raumschiff
  class Ship {
    constructor() {
      this.x = canvas.width / 2;
      this.y = canvas.height / 2;
      this.r = SHIP_SIZE / 2;
      this.angle = 90;
      this.rotation = 0;
      this.thrusting = false;
      this.thrust = { x: 0, y: 0 };
      this.bullets = [];
      this.canShoot = true;
      this.lives = 3;
      this.score = 0;
      this.invincible = 0;
      this.agility = 0;
      this.shotSize = 2;
      this.bulletSpeed = BULLET_BASE_SPEED; 
    }

    // Dreht das Raumschiff
    rotate(dir) {
      this.rotation = dir * TURN_SPEED / FPS;
    }

    // Setzt den Schub des Raumschiffs
    setThrust(on) {
      this.thrusting = on;
    }

    // Schießt eine Kugel ab
    shoot() {
      if (this.canShoot && this.bullets.length < 5 && !upgradeMenuActive) {
        this.bullets.push(new Bullet(this.x, this.y, this.angle, this.shotSize, this.bulletSpeed));
        this.canShoot = false;
        shootSound.currentTime = 0;
        shootSound.play();
        setTimeout(() => (this.canShoot = true), 250);
      }
    }

    // Aktualisiert die Position und den Zustand des Raumschiffs
    update() {
      this.angle += this.rotation;
      this.angle = (this.angle + 360) % 360; // Normalisiert den Winkel

      if (this.thrusting) {
        this.thrust.x += (SHIP_ACCELERATION * Math.cos(degToRad(this.angle))) / FPS;
        this.thrust.y -= (SHIP_ACCELERATION * Math.sin(degToRad(this.angle))) / FPS;
      } else {
        this.thrust.x -= (FRICTION * this.thrust.x) / FPS;
        this.thrust.y -= (FRICTION * this.thrust.y) / FPS;
      }

      let maxSpeed = SHIP_MAX_SPEED + this.agility;
      const speed = Math.hypot(this.thrust.x, this.thrust.y);
      if (speed > maxSpeed) {
        const factor = maxSpeed / speed;
        this.thrust.x *= factor;
        this.thrust.y *= factor;
      }

      this.x += this.thrust.x;
      this.y += this.thrust.y;

      // Bildschirmgrenzen
      if (this.x < 0 - this.r) this.x = canvas.width + this.r;
      else if (this.x > canvas.width + this.r) this.x = 0 - this.r;
      if (this.y < 0 - this.r) this.y = canvas.height + this.r;
      else if (this.y > canvas.height + this.r) this.y = 0 - this.r;

      this.bullets.forEach((b) => b.update());
      this.bullets = this.bullets.filter((b) => !b.isDead());

      if (this.invincible > 0) this.invincible--;
    }

    // Zeichnet das Raumschiff
    draw() {
      if (this.invincible > 0 && Math.floor(this.invincible / 10) % 2 === 0) return;

      ctx.strokeStyle = localStorage.getItem('shipColor') || '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(
        this.x + this.r * Math.cos(degToRad(this.angle)),
        this.y - this.r * Math.sin(degToRad(this.angle))
      );
      ctx.lineTo(
        this.x - this.r * (Math.cos(degToRad(this.angle)) + Math.sin(degToRad(this.angle))),
        this.y + this.r * (Math.sin(degToRad(this.angle)) - Math.cos(degToRad(this.angle)))
      );
      ctx.lineTo(
        this.x - this.r * (Math.cos(degToRad(this.angle)) - Math.sin(degToRad(this.angle))),
        this.y + this.r * (Math.sin(degToRad(this.angle)) + Math.cos(degToRad(this.angle)))
      );
      ctx.closePath();
      ctx.stroke();

      if (this.thrusting) {
        ctx.strokeStyle = '#ff4400';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(
          this.x - this.r * 1.5 * Math.cos(degToRad(this.angle)),
          this.y + this.r * 1.5 * Math.sin(degToRad(this.angle))
        );
        ctx.lineTo(
          this.x - this.r * 0.7 * (Math.cos(degToRad(this.angle)) + Math.sin(degToRad(this.angle))),
          this.y + this.r * 0.7 * (Math.sin(degToRad(this.angle)) - Math.cos(degToRad(this.angle)))
        );
        ctx.stroke();
      }

      this.bullets.forEach((b) => b.draw());
    }
  }

  // Klasse für die Kugeln
  class Bullet {
    constructor(x, y, angle, size, speed) {
      this.x = x + 4 * Math.cos(degToRad(angle));
      this.y = y - 4 * Math.sin(degToRad(angle));
      this.velX = speed * Math.cos(degToRad(angle));
      this.velY = -speed * Math.sin(degToRad(angle));
      this.radius = size;
      this.life = BULLET_LIFE;
    }

    // Aktualisiert die Position der Kugel
    update() {
      this.x += this.velX;
      this.y += this.velY;
      this.life--;
      if (this.x < 0) this.x = canvas.width;
      else if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      else if (this.y > canvas.height) this.y = 0;
    }

    // Überprüft, ob die Kugel tot ist
    isDead() {
      return this.life <= 0;
    }

    // Zeichnet die Kugel
    draw() {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Klasse für die Asteroiden
  class Asteroid {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.radius = size / 2;
      this.velX = randomRange(-asteroid_speed, asteroid_speed) / FPS;
      this.velY = randomRange(-asteroid_speed, asteroid_speed) / FPS;
      this.vertexCount = Math.floor(randomRange(ASTEROID_VERTICES * 0.7, ASTEROID_VERTICES * 1.3));
      this.offsets = Array.from({ length: this.vertexCount }, () => randomRange(1 - ASTEROID_JAGGEDNESS, 1 + ASTEROID_JAGGEDNESS));
    }

    // Aktualisiert die Position des Asteroiden
    update() {
      this.x += this.velX;
      this.y += this.velY;

      // Bildschirmgrenzen
      if (this.x < 0 - this.radius) this.x = canvas.width + this.radius;
      else if (this.x > canvas.width + this.radius) this.x = 0 - this.radius;
      if (this.y < 0 - this.radius) this.y = canvas.height + this.radius;
      else if (this.y > canvas.height + this.radius) this.y = 0 - this.radius;
    }

    // Zeichnet den Asteroiden
    draw() {
      ctx.strokeStyle = localStorage.getItem('asteroidColor') || '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < this.vertexCount; i++) {
        let angle = ((Math.PI * 2) / this.vertexCount) * i;
        let dist = this.radius * this.offsets[i];
        let x = this.x + dist * Math.cos(angle);
        let y = this.y + dist * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  let ship = new Ship();
  let asteroids = [];
  let gameOver = false;
  let inUpgradePhase = false;

  // Erstellt Asteroiden
  function createAsteroids() {
    asteroids = [];
    let numAsteroids = asteroid_num + round * 2;
    let asteroidSpeed = asteroid_speed + round * 15;

    for (let i = 0; i < numAsteroids; i++) {
      let x, y;
      do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
      } while (distance(x, y, ship.x, ship.y) < ASTEROID_SIZE_BASE * 2);
      let asteroid = new Asteroid(x, y, ASTEROID_SIZE_BASE);
      let speedFactor = asteroidSpeed / asteroid_speed;
      asteroid.velX *= speedFactor;
      asteroid.velY *= speedFactor;
      asteroids.push(asteroid);
    }
  }

  createAsteroids();

  let leftPressed = false;
  let rightPressed = false;
  let thrustPressed = false;
  let shootPressed = false;

  // Tasteneingaben für Steuerung
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP' && !upgradeMenuActive) {
      paused = !paused;
      if (paused) {
        canvas.blur();
      } else {
        canvas.focus();
        localStorage.setItem('score', ship.score);
      }
    }

    if (paused || upgradeMenuActive) return;

    if (inUpgradePhase) {
      if (e.code === 'Enter') {
        round++;
        exitUpgradePhase();
      }
      return;
    }

    if (e.code === secretCode[codePosition]) {
      codePosition++;
      if (codePosition === secretCode.length) {
        destroyAllAsteroids();
        codePosition = 0;
        ship.score += 3000;
      }
    } else {
      codePosition = 0;
    }

    switch (e.code) {
      case 'ArrowRight':
      case 'KeyD':
        leftPressed = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        rightPressed = true;
        break;
      case 'ArrowUp':
      case 'KeyW':
        thrustPressed = true;
        break;
      case 'Space':
        shootPressed = true;
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (inUpgradePhase) return;

    switch (e.code) {
      case 'ArrowRight':
      case 'KeyD':
        leftPressed = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        rightPressed = false;
        break;
      case 'ArrowUp':
      case 'KeyW':
        thrustPressed = false;
        break;
      case 'Space':
        shootPressed = false;
        break;
    }
  });

  // Überprüft, ob ein Asteroid von einer Kugel getroffen wurde
  function asteroidHitByBullet(asteroid, bullet) {
    return distance(asteroid.x, asteroid.y, bullet.x, bullet.y) < asteroid.radius;
  }

  // Überprüft, ob das Raumschiff mit einem Asteroiden kollidiert
  function shipCollidesAsteroid(ship, asteroid) {
    if (ship.invincible > 0) return false;
    return distance(ship.x, ship.y, asteroid.x, asteroid.y) < ship.r + asteroid.radius;
  }

  // Teilt einen Asteroiden in zwei kleinere
  function splitAsteroid(asteroid) {
    let newAsteroids = [];
    if (asteroid.size > ASTEROID_SIZE_BASE / 4) {
      let newSize = asteroid.size / 2;
      for (let i = 0; i < 2; i++) {
        newAsteroids.push(new Asteroid(asteroid.x, asteroid.y, newSize));
      }
    }
    return newAsteroids;
  }

  // Zerstört alle Asteroiden und geht in die Upgrade-Phase
  function destroyAllAsteroids() {
    ship.score += asteroids.length * 100;
    asteroids = [];
    enterUpgradePhase();
  }

  // Geht in die Upgrade-Phase
function enterUpgradePhase() {
  upgradeMenuActive = true;
  drawUpgradeMenu();
}

// Verlassen der Upgrade-Phase
function exitUpgradePhase() {
  upgradeMenuActive = false;
  upgradeCards = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  createAsteroids();
  gameLoop();
}



  function drawUpgradeMenu() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '28px exo';
    ctx.textAlign = 'center';
    ctx.fillText('Upgrade Phase', canvas.width / 2, 60);

    ctx.font = '16px exo';
    ctx.textAlign = 'center';

    const cardWidth = 250;
    const cardHeight = 200;
    const padding = 20;
    const totalWidth = 4 * cardWidth + 3 * padding;
    const startX = (canvas.width - totalWidth) / 2;
    const startY = 100;

    const upgradeKeys = ['agility', 'shot', 'health', 'size'];

    upgradeCards = [];

    upgradeKeys.forEach((key, i) => {
        const up = upgrades[key] || { level: 0 };
        const baseCost = 100;
        const costMultiplier = 1.3;
        const cost = Math.round(baseCost * Math.pow(costMultiplier, up.level));

        const desc = key === 'agility' ? 'Increases movement speed' :
            key === 'shot' ? 'Larger and faster shots' :
            key === 'health' ? 'Extra life' : 'Bonus effect';
        const nameCapitalized = key.charAt(0).toUpperCase() + key.slice(1);

        const x = startX + i * (cardWidth + padding);
        const y = startY;
        const centerY = y + cardHeight / 2;

        ctx.strokeRect(x, y, cardWidth, cardHeight);

        ctx.fillText(`${nameCapitalized}`, x + cardWidth / 2, centerY - 30);
        ctx.fillText(`Level: ${up.level}`, x + cardWidth / 2, centerY - 10);
        ctx.fillText(desc, x + cardWidth / 2, centerY + 10);
        ctx.fillText(`Cost: ${cost} Points`, x + cardWidth / 2, centerY + 30);
        ctx.fillText(`Press ${i + 1} to buy`, x + cardWidth / 2, centerY + 50);

        upgradeCards.push({ key, x, y, width: cardWidth, height: cardHeight });
    });

    ctx.fillText(`Score: ${ship.score}`, canvas.width / 2, startY + cardHeight + 80);

    const btnX = canvas.width / 2 - 70;
    const btnY = startY + cardHeight + 100;
    const btnW = 140;
    const btnH = 40;

    ctx.strokeRect(btnX, btnY, btnW, btnH);
    ctx.fillText('Continue', canvas.width / 2, btnY + 26);
}





  // Klick-Event für das Upgrade-Menü
  canvas.addEventListener('click', (e) => {
  if (!upgradeMenuActive) return;

  let rect = canvas.getBoundingClientRect();
  let mx = e.clientX - rect.left;
  let my = e.clientY - rect.top;

  const btnX = canvas.width / 2 - 70;
  const btnY = 380;
  const btnW = 140;
  const btnH = 40;

  if (mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH) {
    updateHighscore();
    exitUpgradePhase();
    return;
  }

  // Check if clicked on an upgrade card
  for (let card of upgradeCards) {
    if (
      mx >= card.x &&
      mx <= card.x + card.width &&
      my >= card.y &&
      my <= card.y + card.height
    ) {
      purchaseUpgrade(card.key);
      drawUpgradeMenu(); // Redraw after upgrade
      return;
    }
  }
});


  // Führt einen Upgrade-Kauf durch
  function purchaseUpgrade(key) {
    let up = upgrades[key];
    const baseCost = 100;
    const costMultiplier = 1.3;
    const currentCost = Math.round(baseCost * Math.pow(costMultiplier, up.level));
    if (ship.score >= currentCost) {
        ship.score -= currentCost;
        up.level++;
        applyUpgradeEffects();
        drawUpgradeMenu();
    }
}

  // Wendet die Auswirkungen der Upgrades auf das Schiff an
  function applyUpgradeEffects() {
    ship.agility += upgrades.agility.level * 1.5;
    ship.shotSize = 2 + upgrades.shot.level * 2;
    ship.bulletSpeed = BULLET_BASE_SPEED + upgrades.shot.level * 2;
    ship.lives = 3 + upgrades.health.level;
    ship.size = 2 / 1 + 0.1 * upgrades.size.level;
}

  // Zusätzliche Tastensteuerung für Upgrades
  window.addEventListener('keydown', (e) => {
  if (!upgradeMenuActive) return;

  if (e.code === 'Digit1') purchaseUpgrade('agility');
  if (e.code === 'Digit2') purchaseUpgrade('shot');
  if (e.code === 'Digit3') purchaseUpgrade('health');

  if (e.code === 'Enter') {
    console.log('Enter pressed: exiting upgrade phase');
    updateHighscore();
    exitUpgradePhase();
  }
});



  // Aktualisiert Spielzustand
  function update() {
    if (gameOver || upgradeMenuActive || paused) return;

    if (leftPressed) ship.rotate(-1);
    else if (rightPressed) ship.rotate(1);
    else ship.rotate(0);

    ship.setThrust(thrustPressed);
    if (shootPressed) ship.shoot();

    ship.update();
    asteroids.forEach(ast => ast.update());

    // Kollisionsabfrage Kugeln - Asteroiden
    for (let bIndex = ship.bullets.length - 1; bIndex >= 0; bIndex--) {
      let bullet = ship.bullets[bIndex];
      for (let aIndex = asteroids.length - 1; aIndex >= 0; aIndex--) {
        let ast = asteroids[aIndex];
        if (asteroidHitByBullet(ast, bullet)) {
          ship.bullets.splice(bIndex, 1);
          asteroids.splice(aIndex, 1);
          ship.score += 100;
          explodeSound.currentTime = 0;
          explodeSound.play();
          asteroids.push(...splitAsteroid(ast));
          break;
        }
      }
    }

    // Kollisionsabfrage Schiff und Asteroiden
    asteroids.forEach(ast => {
      if (shipCollidesAsteroid(ship, ast)) {
        ship.lives--;
        ship.invincible = FPS * 3;
        ship.x = canvas.width / 2;
        ship.y = canvas.height / 2;
        ship.thrust.x = 0;
        ship.thrust.y = 0;
        ship.angle = 90;
        if (ship.lives <= 0) {
          gameOver = true;
        }
      }
    });

    if (asteroids.length === 0) {
      enterUpgradePhase();
    }

    // Verliere alle 60 Frames Punkte als "Lebenskosten"
    frameCounter++;
    if (frameCounter >= 60) {
      frameCounter = 0;
      ship.score = Math.max(0, ship.score - 10);
    }
  }

  // Zeichnet das Spielgeschehen
  function draw() { 
    if (upgradeMenuActive) {
      drawUpgradeMenu();
      return;
    }

    if (paused) {
      drawPauseMenu();
      return;
    }

    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ship.draw();
    asteroids.forEach(ast => ast.draw());

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Exo, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${ship.score}`, 15, 30);
    ctx.fillText(`Lives: ${ship.lives}`, 15, 60);

    if (gameOver) {
    updateHighscore();

    ctx.fillStyle = '#ff3333';
    ctx.font = 'bold 40px Exo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = '24px Exo, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Score: ${ship.score}`, canvas.width / 2, canvas.height / 2 + 20);

    ctx.fillStyle = '#228822';
    ctx.fillRect(canvas.width / 2 - 120, canvas.height / 2 + 60, 240, 50); // Increased button size

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Exo, sans-serif';
    ctx.fillText('Hauptmenü', canvas.width / 2, canvas.height / 2 + 95);
    }
  }

  // Klick-Events für Pausen- und Gameover-Menüs
  canvas.addEventListener('click', (e) => {
    if (upgradeMenuActive) return;

    let rect = canvas.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;

    if (paused) {
      if (
        mx >= canvas.width / 2 - 100 &&
        mx <= canvas.width / 2 + 100 &&
        my >= 200 &&
        my <= 250
      ) {
        location.reload();
      }
    }

    if (gameOver) {
      if (
        mx >= canvas.width / 2 - 100 &&
        mx <= canvas.width / 2 + 100 &&
        my >= canvas.height / 2 + 60 &&
        my <= canvas.height / 2 + 110
      ) {
        location.reload();
      }
    }
  });

  // Zeichnet das Pause-Menü
  function drawPauseMenu() {
    ctx.fillStyle = 'rgba(0, 0, 20, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Exo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Pause', canvas.width / 2, 100);

    ctx.font = '24px Exo, sans-serif';
    ctx.fillText(`Score: ${ship.score}`, canvas.width / 2, 160);

    ctx.fillStyle = '#228822';
    ctx.fillRect(canvas.width / 2 - 120, 200, 240, 50);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Exo, sans-serif';
    ctx.fillText('Hauptmenü', canvas.width / 2, 235);
}

function updateHighscore() {
let highscore = parseInt(localStorage.getItem('highscore')) || 0;
if (ship.score > highscore) {
localStorage.setItem('highscore', ship.score);
}
}

// Haupt-Game-Loop: Update und Draw
function gameLoop() {
update();
draw();
requestAnimationFrame(gameLoop);
}

  // Haupt-Game-Loop: Update und Draw
  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  updateHighscore();
  applyUpgradeEffects();
  gameLoop();
}