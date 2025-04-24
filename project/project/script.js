let body = document.getElementById('body');
let menu = document.getElementById('menu');
let title = document.getElementById('title');
let navigation = document.getElementById('navigation');
let menuContent = '<nav id="navigation"><p class="button" onclick="gameInitiate()">Game</p><p class="button" onclick="options()">Options</p></nav><img class="asteroidsTitle" id="title" src="../images/Asteroids.png">'
let clickHint = document.getElementById('clickHint');
let zoomTriggered = false;

let clickTimer = setTimeout(() => {
    if (!zoomTriggered) {
        clickHint.classList.add('show-click');
    }
}, 5000);

function zoomIn() {
    if (zoomTriggered) return

    zoomTriggered = true;
    clearTimeout(clickTimer);
    clickHint.classList.remove('show-click')

    let arcadeMachine = document.getElementById('arcadeMachine');
    let arcadeScreen = document.getElementById('arcadeScreen');

    if (!arcadeMachine.classList.contains('zoom')) {
        arcadeMachine.classList.add('zoom');
        arcadeScreen.classList.add('zoomScreen');
        navigation.style.opacity = 0;

        setTimeout(() => {
            arcadeScreen.classList.add('zoomUp');
        }, 150);

        setTimeout(() => {
            arcadeMachine.style.opacity = 0;
            menu.style.display = 'block';
            arcadeMachine.style.display = 'none';
            arcadeScreen.style.display = 'none';

            title.classList.add('fade-in-move');

            setTimeout(() => {
                navigation.style.opacity = 1;
                navigation.style.display = 'flex';
            }, 2500);
        }, 500);
    }
}


function options() {
    body.style.overflowY = 'scroll'
    menu.style.height = 'fit-content'

    menu.innerHTML = `
        <h3 onclick="closeOptions()">Back</h3>
        <h1>Options</h1>
        <div id="colorSelect"><h2>Color</h2><h4 style="text-decoration: underline 1px;">White</h4><h4>Custom<h4></div>
        <h2>Volume</h2>
        <h2>Hallo3</h2>
        <h2>Hallo4 zbzsb</h2>
        <h2>Hallo5</h2>
        <h2>Hallo6</h2>
        <h2>Hallo7</h2>
    `;
}

function closeOptions() {
    navigation.style.display = 'block';
    body.style.overflowY = 'hidden'
    menu.style.height = '100vh'
    menu.innerHTML = menuContent;
}