

    const FPS = 30;
        const FRICTION = 0.7;
        const LASER_DIST = 0.6;
        const LASER_EXPLODE_DUR = 0.1;
        const LASER_MAX = 10;
        const LASER_SPD = 500; 
        const ROID_JAG = 0.4;
        const ROID_NUM = 3; 
        const ROID_SIZE = 100;
        const ROID_SPD = 50;
        const ROID_VERT = 10;
        const SHIP_BLINK_DUR = 0.1;
        const SHIP_EXPLODE_DUR = 0.3;
        const SHIP_INV_DUR = 3; 
        const SHIP_SIZE = 30;
        const SHIP_THRUST = 5;
        const SHIP_TURN_SPD = 360; 
        const SHOW_BOUNDING = false; 
        const SHOW_CENTRE_DOT = false; 

        /** @type {HTMLCanvasElement} */
        var canv = document.getElementById("gameCanvas");
        var ctx = canv.getContext("2d");

        var ship = newShip();

        var roids = [];
        createAsteroidBelt();

        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);

        setInterval(update, 1000 / FPS);

        function createAsteroidBelt() {
            roids = [];
            var x, y;
            for (var i = 0; i < ROID_NUM; i++) {
                do {
                    x = Math.floor(Math.random() * canv.width);
                    y = Math.floor(Math.random() * canv.height);
                } while (distBetweenPoints(ship.x, ship.y, x, y) < ROID_SIZE * 2 + ship.r);
                roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 2)));
            }
        }

        function destroyAsteroid(index) {
            var x = roids[index].x;
            var y = roids[index].y;
            var r = roids[index].r;

            if (r == Math.ceil(ROID_SIZE / 2)) { // groß
                roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 4)));
                roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 4)));
            } else if (r == Math.ceil(ROID_SIZE / 4)) { // mittel
                roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 8)));
                roids.push(newAsteroid(x, y, Math.ceil(ROID_SIZE / 8)));
            }

            roids.splice(index, 1);
        }

        function distBetweenPoints(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }

        function explodeShip() {
            ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
        }

        function keyDown(/** @type {KeyboardEvent} */ ev) {
            switch(ev.keyCode) {
                case 32: 
                    shootLaser();
                    break;
                case 37: 
                    ship.rot = SHIP_TURN_SPD / 180 * Math.PI / FPS;
                    break;
                case 38: 
                    ship.thrusting = true;
                    break;
                case 39:
                    ship.rot = -SHIP_TURN_SPD / 180 * Math.PI / FPS;
                    break;
            }
        }

        function keyUp(/** @type {KeyboardEvent} */ ev) {
            switch(ev.keyCode) {
                case 32: 
                    ship.canShoot = true;
                    break;
                case 37: 
                    ship.rot = 0;
                    break;
                case 38: 
                    ship.thrusting = false;
                    break;
                case 39: 
                    ship.rot = 0;
                    break;
            }
        }

        function newAsteroid(x, y, r) {
            var roid = {
                x: x,
                y: y,
                xv: Math.random() * ROID_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
                yv: Math.random() * ROID_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
                a: Math.random() * Math.PI * 2, 
                r: r,
                offs: [],
                vert: Math.floor(Math.random() * (ROID_VERT + 1) + ROID_VERT / 2)
            };

            for (var i = 0; i < roid.vert; i++) {
                roid.offs.push(Math.random() * ROID_JAG * 2 + 1 - ROID_JAG);
            }

            return roid;
        }

        function newShip() {
            return {
                x: canv.width / 2,
                y: canv.height / 2,
                a: 90 / 180 * Math.PI,
                r: SHIP_SIZE / 2,
                blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
                blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
                canShoot: true,
                explodeTime: 0,
                lasers: [],
                rot: 0,
                thrusting: false,
                thrust: {
                    x: 0,
                    y: 0
                }
            }
        }

        function shootLaser() {
            if (ship.canShoot && ship.lasers.length < LASER_MAX) {
                ship.lasers.push({ 
                    x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                    y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
                    xv: LASER_SPD * Math.cos(ship.a) / FPS,
                    yv: -LASER_SPD * Math.sin(ship.a) / FPS,
                    dist: 0,
                    explodeTime: 0
                });
            }

            ship.canShoot = false;
        }

        function update() {
            var blinkOn = ship.blinkNum % 2 == 0;
            var exploding = ship.explodeTime > 0;

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canv.width, canv.height);

            var a, r, x, y, offs, vert;
            for (var i = 0; i < roids.length; i++) {
                ctx.strokeStyle = "slategrey";
                ctx.lineWidth = SHIP_SIZE / 20;

                a = roids[i].a;
                r = roids[i].r;
                x = roids[i].x;
                y = roids[i].y;
                offs = roids[i].offs;
                vert = roids[i].vert;
                
                ctx.beginPath();
                ctx.moveTo(
                    x + r * offs[0] * Math.cos(a),
                    y + r * offs[0] * Math.sin(a)
                );

                for (var j = 1; j < vert; j++) {
                    ctx.lineTo(
                        x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                        y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
                    );
                }
                ctx.closePath();
                ctx.stroke();

                if (SHOW_BOUNDING) {
                    ctx.strokeStyle = "lime";
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2, false);
                    ctx.stroke();
                }
            }
            
            if (ship.thrusting) {
                ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
                ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

                if (!exploding && blinkOn) {
                    ctx.fillStyle = "red";
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = SHIP_SIZE / 10;
                    ctx.beginPath();
                    ctx.moveTo( 
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
                    );
                    ctx.lineTo( 
                        ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
                        ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
                    );
                    ctx.lineTo(
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
                    );
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            } else {
                ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
                ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
            }
            
            if (!exploding) {
                if (blinkOn) {
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = SHIP_SIZE / 20;
                    ctx.beginPath();
                    ctx.moveTo( 
                        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
                    );
                    ctx.lineTo( 
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
                    );
                    ctx.lineTo( 
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
                    );
                    ctx.closePath();
                    ctx.stroke();
                }

                if (ship.blinkNum > 0) {

                    ship.blinkTime--;

                    if (ship.blinkTime == 0) {
                        ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                        ship.blinkNum--;
                    }
                }
            } else {
                ctx.fillStyle = "darkred";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "orange";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "yellow";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
                ctx.fill();
            }

            if (SHOW_BOUNDING) {
                ctx.strokeStyle = "lime";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
                ctx.stroke();
            }
            
            if (SHOW_CENTRE_DOT) {
                ctx.fillStyle = "red";
                ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
            }

            for (var i = 0; i < ship.lasers.length; i++) {
                if (ship.lasers[i].explodeTime == 0) {
                    ctx.fillStyle = "salmon";
                    ctx.beginPath();
                    ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
                    ctx.fill();
                } else {
                    ctx.fillStyle = "orangered";
                    ctx.beginPath();
                    ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
                    ctx.fill();
                    ctx.fillStyle = "salmon";
                    ctx.beginPath();
                    ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
                    ctx.fill();
                    ctx.fillStyle = "pink";
                    ctx.beginPath();
                    ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
                    ctx.fill();
                }
            }

            var ax, ay, ar, lx, ly;
            for (var i = roids.length - 1; i >= 0; i--) {

                ax = roids[i].x;
                ay = roids[i].y;
                ar = roids[i].r;

                for (var j = ship.lasers.length - 1; j >= 0; j--) {

                    lx = ship.lasers[j].x;
                    ly = ship.lasers[j].y;

                    if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {

                        destroyAsteroid(i);
                        ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
                        break;
                    }
                }
            }

            if (!exploding) {

                if (ship.blinkNum == 0) {
                    for (var i = 0; i < roids.length; i++) {
                        if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
                            explodeShip();
                            destroyAsteroid(i);
                            break;
                        }
                    }
                }

                ship.a += ship.rot;

                ship.x += ship.thrust.x;
                ship.y += ship.thrust.y;
            } else {
                ship.explodeTime--;

                if (ship.explodeTime == 0) {
                    ship = newShip();
                }
            }

            if (ship.x < 0 - ship.r) {
                ship.x = canv.width + ship.r;
            } else if (ship.x > canv.width + ship.r) {
                ship.x = 0 - ship.r;
            }
            if (ship.y < 0 - ship.r) {
                ship.y = canv.height + ship.r;
            } else if (ship.y > canv.height + ship.r) {
                ship.y = 0 - ship.r;
            }

            for (var i = ship.lasers.length - 1; i >= 0; i--) {
                
                if (ship.lasers[i].dist > LASER_DIST * canv.width) {
                    ship.lasers.splice(i, 1);
                    continue;
                }

                if (ship.lasers[i].explodeTime > 0) {
                    ship.lasers[i].explodeTime--;

                    if (ship.lasers[i].explodeTime == 0) {
                        ship.lasers.splice(i, 1);
                        continue;
                    }
                } else {
                    ship.lasers[i].x += ship.lasers[i].xv;
                    ship.lasers[i].y += ship.lasers[i].yv;

                    ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
                }

                if (ship.lasers[i].x < 0) {
                    ship.lasers[i].x = canv.width;
                } else if (ship.lasers[i].x > canv.width) {
                    ship.lasers[i].x = 0;
                }
                if (ship.lasers[i].y < 0) {
                    ship.lasers[i].y = canv.height;
                } else if (ship.lasers[i].y > canv.height) {
                    ship.lasers[i].y = 0;
                }
            }

            for (var i = 0; i < roids.length; i++) {
                roids[i].x += roids[i].xv;
                roids[i].y += roids[i].yv;

                if (roids[i].x < 0 - roids[i].r) {
                    roids[i].x = canv.width + roids[i].r;
                } else if (roids[i].x > canv.width + roids[i].r) {
                    roids[i].x = 0 - roids[i].r
                }
                if (roids[i].y < 0 - roids[i].r) {
                    roids[i].y = canv.height + roids[i].r;
                } else if (roids[i].y > canv.height + roids[i].r) {
                    roids[i].y = 0 - roids[i].r
                }
            }
        }