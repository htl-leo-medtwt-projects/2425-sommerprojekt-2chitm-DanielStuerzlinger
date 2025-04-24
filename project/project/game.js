

function gameInitiate() {
    let menu = document.getElementById('menu');
    menu.innerHTML = `<canvas id="gameCanvas"></canvas>`;

    var canvas = document.getElementById('gameCanvas');
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}