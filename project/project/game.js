
// Nicht veränderbar
const FPS = 30;
const spielerRadius = 30;
const drehen = 360;

//Einstellungen


//Cheats
let reibung = 0.7;
let beschleunigung = 5;

//Canvas
let canv = document.getElementById("gameCanvas");
let ctx = canv.getContext("2d");

// Spieler
let spieler = {
    x: canv.width / 2,
    y: canv.height / 2,
    r: spielerRadius / 2,
    a: 90 / 180 * Math.PI,
    rotation: 0,
    beschleunigen: false,
    geschwindigkeit: {
        x: 0,
        y: 0
    }
}

// set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// set up the game loop
setInterval(update, 1000 / FPS);

function keyDown(/** @type {KeyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37:
            spieler.rotation = drehen / 180 * Math.PI / FPS;
            break;
        case 38:
            spieler.beschleunigen = true;
            break;
        case 39:
            spieler.rotation = -drehen / 180 * Math.PI / FPS;
            break;
    }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
    switch(ev.keyCode) {
        case 37: 
            spieler.rotation = 0;
            break;
        case 38:
            spieler.beschleunigen = false;
            break;
        case 39:
            spieler.rotation = 0;
            break;
    }
}

function update() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    //Schiff anzeigen
    if (spieler.beschleunigen) {
        spieler.geschwindigkeit.x += beschleunigung * Math.cos(spieler.a) / FPS;
        spieler.geschwindigkeit.y -= beschleunigung * Math.sin(spieler.a) / FPS;

        ctx.beginPath();
        ctx.moveTo(
            spieler.x - spieler.r * (1 / 3 * Math.cos(spieler.a) + 0.5 * Math.sin(spieler.a)),
            spieler.y + spieler.r * (1 / 3 * Math.sin(spieler.a) - 0.5 * Math.cos(spieler.a))
        );
        ctx.lineTo(
            spieler.x - spieler.r * (1 / 3 * Math.cos(spieler.a) - 0.5 * Math.sin(spieler.a)),
            spieler.y + spieler.r * (1 / 3 * Math.sin(spieler.a) + 0.5 * Math.cos(spieler.a))
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else {
        // Reibung
        spieler.geschwindigkeit.x -= reibung * spieler.geschwindigkeit.x / FPS;
        spieler.geschwindigkeit.y -= reibung * spieler.geschwindigkeit.y / FPS;
    }

    // Spieler anzeigen
    ctx.strokeStyle = "white";
    ctx.lineWidth = playerRadius / 20;
    ctx.beginPath();
    ctx.moveTo(
        spieler.x + 4 / 3 * spieler.r * Math.cos(spieler.a),
        spieler.y - 4 / 3 * spieler.r * Math.sin(spieler.a)
    );
    ctx.lineTo(
        spieler.x - spieler.r * (2 / 3 * Math.cos(spieler.a) + Math.sin(spieler.a)),
        spieler.y + spieler.r * (2 / 3 * Math.sin(spieler.a) - Math.cos(spieler.a))
    );
    ctx.lineTo(
        spieler.x - spieler.r * (2 / 3 * Math.cos(spieler.a) - Math.sin(spieler.a)),
        spieler.y + spieler.r * (2 / 3 * Math.sin(spieler.a) + Math.cos(spieler.a))
    );
    ctx.closePath();
    ctx.stroke();

    // Bewegung
    spieler.a += spieler.rotation;

    spieler.x += spieler.geschwindigkeit.x;
    spieler.y += spieler.geschwindigkeit.y;

    // Rand teleportation
    if (spieler.x < 0 - spieler.r) {
        spieler.x = canv.width + spieler.r;
    } else if (spieler.x > canv.width + spieler.r) {
        spieler.x = 0 - spieler.r;
    }
    if (spieler.y < 0 - spieler.r) {
        spieler.y = canv.height + spieler.r;
    } else if (spieler.y > canv.height + spieler.r) {
        spieler.y = 0 - spieler.r;
    }
}