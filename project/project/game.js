let round = 1;
let paused = false;

function gameInitiate() {
  body.style.overflow = "hidden"
    const menu = document.getElementById('menu');
    menu.innerHTML = `<canvas id="gameCanvas" tabindex="0"></canvas>`;
  
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const shootSound = new Audio('../sound/retro-shoot.mp3');
    const explodeSound = new Audio('../sound/retro-explode.mp3');

    const volume = localStorage.getItem('volume') ? localStorage.getItem('volume') / 100 : 1;
    shootSound.volume = volume;
    explodeSound.volume = volume;
  
    function resizeCanvas() {
      canvas.width = menu.clientWidth;
      canvas.height = menu.clientHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.focus();
  
    const FPS = 60;
    const FRICTION = 0.6;
    const SHIP_SIZE = 30;
    const TURN_SPEED = 360;
    const SHIP_ACCELERATION = 5;
    const SHIP_MAX_SPEED = 7;
    const BULLET_BASE_SPEED = 10;
    const BULLET_LIFE = 60;
    let asteroid_num = 5;
    const ASTEROID_SIZE_BASE = 60;
    let asteroid_speed = 50;
    const ASTEROID_VERTICES = 10;
    const ASTEROID_JAGGEDNESS = 0.4;

    let upgradeMenuActive = false;
    let upgrades = {
      agility: { level: 0, cost: 100 },
      shot: { level: 0, cost: 100 },
      health: { level: 0, cost: 100 },
    };
    const MAX_UPGRADE_LEVEL = 10;

    const secretCode = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT'];
    let codePosition = 0;

    let frameCounter = 0;

    function degToRad(deg) {
      return (deg * Math.PI) / 180;
    }
    function randomRange(min, max) {
      return Math.random() * (max - min) + min;
    }
    function distance(x1, y1, x2, y2) {
      return Math.hypot(x2 - x1, y2 - y1);
    }

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
      rotate(dir) {
        this.rotation = dir * TURN_SPEED / FPS;
      }
      setThrust(on) {
        this.thrusting = on;
      }
      shoot() {
        if (this.canShoot && this.bullets.length < 5 && !upgradeMenuActive) {
          this.bullets.push(new Bullet(this.x, this.y, this.angle, this.shotSize, this.bulletSpeed));
          this.canShoot = false;
          shootSound.currentTime = 0;
          shootSound.play();
          setTimeout(() => (this.canShoot = true), 250);
        }
      }
      update() {
        this.angle += this.rotation;
        if (this.angle >= 360) this.angle -= 360;
        if (this.angle < 0) this.angle += 360;

        if (this.thrusting) {
          this.thrust.x += (SHIP_ACCELERATION * Math.cos(degToRad(this.angle))) / FPS;
          this.thrust.y -= (SHIP_ACCELERATION * Math.sin(degToRad(this.angle))) / FPS;
        } else {
          this.thrust.x -= (FRICTION * this.thrust.x) / FPS;
          this.thrust.y -= (FRICTION * this.thrust.y) / FPS;
        }

        const maxSpeed = SHIP_MAX_SPEED + this.agility;
        const speed = Math.hypot(this.thrust.x, this.thrust.y);
        if (speed > maxSpeed) {
          const factor = maxSpeed / speed;
          this.thrust.x *= factor;
          this.thrust.y *= factor;
        }

        this.x += this.thrust.x;
        this.y += this.thrust.y;

        if (this.x < 0 - this.r) this.x = canvas.width + this.r;
        else if (this.x > canvas.width + this.r) this.x = 0 - this.r;
        if (this.y < 0 - this.r) this.y = canvas.height + this.r;
        else if (this.y > canvas.height + this.r) this.y = 0 - this.r;

        this.bullets.forEach((b) => b.update());
        this.bullets = this.bullets.filter((b) => !b.isDead());

        if (this.invincible > 0) this.invincible--;
      }
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

    class Bullet {
      constructor(x, y, angle, size, speed) {
        this.x = x + 4 * Math.cos(degToRad(angle));
        this.y = y - 4 * Math.sin(degToRad(angle));
        this.velX = speed * Math.cos(degToRad(angle));
        this.velY = -speed * Math.sin(degToRad(angle));
        this.radius = size;
        this.life = BULLET_LIFE;
      }
      update() {
        this.x += this.velX;
        this.y += this.velY;
        this.life--;
        if (this.x < 0) this.x = canvas.width;
        else if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        else if (this.y > canvas.height) this.y = 0;
      }
      isDead() {
        return this.life <= 0;
      }
      draw() {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class Asteroid {
      constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = size / 2;
        this.velX = randomRange(-asteroid_speed, asteroid_speed) / FPS;
        this.velY = randomRange(-asteroid_speed, asteroid_speed) / FPS;
        this.vertexCount = Math.floor(randomRange(ASTEROID_VERTICES * 0.7, ASTEROID_VERTICES * 1.3));
        this.offsets = [];
        for (let i = 0; i < this.vertexCount; i++) {
          this.offsets.push(randomRange(1 - ASTEROID_JAGGEDNESS, 1 + ASTEROID_JAGGEDNESS));
        }
      }
      update() {
        this.x += this.velX;
        this.y += this.velY;

        if (this.x < 0 - this.radius) this.x = canvas.width + this.radius;
        else if (this.x > canvas.width + this.radius) this.x = 0 - this.radius;
        if (this.y < 0 - this.radius) this.y = canvas.height + this.radius;
        else if (this.y > canvas.height + this.radius) this.y = 0 - this.radius;
      }
      
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

    function createAsteroids() {
      asteroids = [];
      let numAsteroids = asteroid_num + round - 1;
      let asteroidSpeed = asteroid_speed + (round - 1) * 15;

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

    function asteroidHitByBullet(asteroid, bullet) {
      return distance(asteroid.x, asteroid.y, bullet.x, bullet.y) < asteroid.radius;
    }
    function shipCollidesAsteroid(ship, asteroid) {
      if (ship.invincible > 0) return false;
      return distance(ship.x, ship.y, asteroid.x, asteroid.y) < ship.r + asteroid.radius;
    }

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

    function destroyAllAsteroids() {
      ship.score += asteroids.length * 100;
      asteroids = [];
      enterUpgradePhase();
    }

    function enterUpgradePhase() {
      inUpgradePhase = true;
      upgradeMenuActive = true;
      drawUpgradeMenu();
    }

    function exitUpgradePhase() {
      inUpgradePhase = false;
      upgradeMenuActive = false;
      createAsteroids();
      ship.bullets = [];
      codePosition = 0;
      frameCounter = 0;
    }

    // Mit hilfe von ki gemacht
    function drawUpgradeMenu() {
      ctx.fillStyle = '#000011';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff';
      ctx.font = '28px Exo, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upgrade Phase', canvas.width / 2, 60);

      ctx.font = '20px Exo, sans-serif';
      ctx.textAlign = 'left';
      const startX = canvas.width / 2 - 140;
      const startY = 120;
      const lineHeight = 60;

      ctx.fillStyle = '#ffffff';
      ['agility', 'shot', 'health'].forEach((key, i) => {
        const up = upgrades[key];
        const costDisplay = `${up.cost} pts`;
        const nameCapitalized = key.charAt(0).toUpperCase() + key.slice(1);
        const desc = key === 'agility' ? 'Increases movement speed' :
                     (key === 'shot' ? 'Larger and faster shots' : 'Extra life');
        ctx.fillText(`${nameCapitalized} (Level ${up.level}):`, startX, startY + i * lineHeight);
        ctx.fillText(desc, startX, startY + 22 + i * lineHeight);
        ctx.fillText(`Cost: ${costDisplay}`, startX + 280, startY + i * lineHeight);
        ctx.fillText(`Press ${i + 1} to buy`, startX + 450, startY + i * lineHeight);
      });

      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Score: ${ship.score}`, canvas.width / 2, startY + 3 * lineHeight + 40);

      ctx.fillText(`Press ENTER or Click "Continue" to resume`, canvas.width / 2, startY + 3 * lineHeight + 80);

      ctx.fillStyle = '#228822';
      ctx.fillRect(canvas.width / 2 - 70, startY + 3 * lineHeight + 90, 140, 40);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 20px Exo, sans-serif';
      ctx.fillText('Continue', canvas.width / 2, startY + 3 * lineHeight + 120);
    }

    canvas.addEventListener('click', (e) => {
      if (!upgradeMenuActive) return;

      let rect = canvas.getBoundingClientRect();
      let mx = e.clientX - rect.left;
      let my = e.clientY - rect.top;

      if (
        mx >= canvas.width / 2 - 70 &&
        mx <= canvas.width / 2 + 70 &&
        my >= 120 + 3 * 60 + 90 &&
        my <= 120 + 3 * 60 + 130
      ) {
        exitUpgradePhase();
        return;
      }

      const startX = canvas.width / 2 - 140;
      const startY = 120;
      const lineHeight = 60;
      
      ['agility', 'shot', 'health'].forEach((key, i) => {
        const yTop = startY + i * lineHeight - 20;
        if (my >= yTop && my <= yTop + 50) {
          purchaseUpgrade(key);
        }
      });
    });

    function purchaseUpgrade(key) {
      let up = upgrades[key];

      if (ship.score >= up.cost) {
        ship.score -= up.cost;
        up.level++;

        let newCost = Math.round(up.cost * 1.3 / 10) * 10;
        up.cost = Math.min(newCost, 5000);

        applyUpgradeEffects();
      }
    }


    function applyUpgradeEffects() {
      ship.agility = upgrades.agility.level * 3;
      ship.shotSize = 2 + upgrades.shot.level * 2;
      ship.bulletSpeed = BULLET_BASE_SPEED + upgrades.shot.level * 2;
      ship.lives = 3 + upgrades.health.level;
    }

    window.addEventListener('keydown', (e) => {
      if (!upgradeMenuActive) return;
      if (e.code === 'Digit1') purchaseUpgrade('agility');
      if (e.code === 'Digit2') purchaseUpgrade('shot');
      if (e.code === 'Digit3') purchaseUpgrade('health');
    });

    function update() {
      if (gameOver || upgradeMenuActive) return;

      if (leftPressed) ship.rotate(-1);
      else if (rightPressed) ship.rotate(1);
      else ship.rotate(0);

      ship.setThrust(thrustPressed);
      if (shootPressed) ship.shoot();

      ship.update();
      asteroids.forEach((ast) => ast.update());

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

      asteroids.forEach((ast) => {
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

      frameCounter++;
      if (frameCounter >= 60) {
        frameCounter = 0;
        ship.score -= 10;
        if (ship.score < 0) ship.score = 0;
      }
    }

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
  asteroids.forEach((ast) => ast.draw());

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
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 60, 200, 50);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Exo, sans-serif';
    ctx.fillText('Hauptmenü', canvas.width / 2, canvas.height / 2 + 95);
  }
}

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
      ctx.fillRect(canvas.width / 2 - 100, 200, 200, 50);

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

    function gameLoop() {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    }

    applyUpgradeEffects();
    gameLoop();
}