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
    body.style.overflowY = 'scroll';
    menu.style.height = 'fit-content';

    menu.innerHTML = `
        <h3 onclick="closeOptions()">Back</h3>
        <h1>Options</h1>
        <div id="colorSelect">
            <h2>Color</h2>
            <sl-color-picker id="colorPicker" value="color"></sl-color-picker>
        </div>
        <div>
            <h2>Volume</h2>
            <sl-range id="volumeSlider" min="0" max="100" value="100" step="1"></sl-range>
        </div>
        <h2>Keybinds</h2>
        <input type="text" id="keybindInput" placeholder="Enter keybind" />
        <h2>Cheats</h2>
        <div id="cheatsMenu"></div>
    `;

    loadSettings();
}

function loadSettings() {
    const savedColor = localStorage.getItem('color') || '#ffffff';
    const savedVolume = localStorage.getItem('volume') || 100;
    const savedKeybind = localStorage.getItem('keybind') || '';

    document.getElementById('colorPicker').value = savedColor;
    document.getElementById('volumeSlider').value = savedVolume;
    document.getElementById('keybindInput').value = savedKeybind;

    document.getElementById('colorPicker').addEventListener('input', (event) => {
        localStorage.setItem('color', event.target.value);
    });

    document.getElementById('volumeSlider').addEventListener('input', (event) => {
        localStorage.setItem('volume', event.target.value);
    });

    document.getElementById('keybindInput').addEventListener('input', (event) => {
        localStorage.setItem('keybind', event.target.value);
    });
}

function closeOptions() {
    navigation.style.display = 'block';
    body.style.overflowY = 'hidden'
    menu.style.height = '100vh'
    menu.innerHTML = menuContent;
}