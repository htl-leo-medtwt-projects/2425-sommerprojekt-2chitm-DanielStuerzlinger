let menu = document.getElementById('menu');
let title = document.getElementById('title');
let navigation = document.getElementById('navigation');
let menuContent = `<nav id="navigation"><p id="highscore">Highscore: ${localStorage.getItem('highscore')}</p><p class="button" onclick="gameInitiate()">Game</p><p class="button" onclick="options()">Options</p></nav><img class="asteroidsTitle" id="title" src="../images/Asteroids.png">`
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
    menu.style.height = 'auto';
    menu.style.display = 'block';

    menu.innerHTML = `
        <h3 onclick="closeOptions()">Back</h3>
        <h1>Options</h1>
        <div id="colorSelect">
            <div id="shipColorDiv">
            <h2>Ship Color</h2>
            <sl-color-picker id="shipColorPicker" value="#ffffff"></sl-color-picker>
            <sl-button id="shipColorSave" onclick="saveShipColor()">Save</sl-button>
            </div>
            <div id="asteroidColorDiv">
            <h2>Asteroid Color</h2>
            <sl-color-picker id="asteroidColorPicker" value="#ffffff"></sl-color-picker>
            <sl-button id="asteroidColorSave" onclick="saveAsteroidColor()">Save</sl-button>
            </div>
        </div>
        <div id="volumeDiv">
        <h2>Volume</h2>
        <sl-range id="volumeSlider" min="0" max="100" value="${localStorage.getItem('volume') || 100}" step="1"></sl-range>
        <sl-button id="saveVolume" variant="primary" onclick="saveVolume()">Save Volume</sl-button>
        </div>
        <div id="keybindsDiv">
        <sl-button id="moveUp" class="keybind-button" variant="default">Move Up: ${localStorage.getItem('moveUp') || 'ArrowUp'}</sl-button>
        <sl-button id="moveDown" class="keybind-button" variant="default">Move Down: ${localStorage.getItem('moveDown') || 'ArrowDown'}</sl-button>
        <sl-button id="moveLeft" class="keybind-button" variant="default">Move Left: ${localStorage.getItem('moveLeft') || 'ArrowLeft'}</sl-button>
        <sl-button id="moveRight" class="keybind-button" variant="default">Move Right: ${localStorage.getItem('moveRight') || 'ArrowRight'}</sl-button>
        <sl-button id="shoot" class="keybind-button" variant="default">Shoot: ${localStorage.getItem('shoot') || 'Space'}</sl-button>
        </div>
    `;

    loadSettings();

    document.getElementById('shipColorPicker').addEventListener('input', (event) => {
        localStorage.setItem('shipColor', event.target.value);
    });

    document.getElementById('asteroidColorPicker').addEventListener('input', (event) => {
        localStorage.setItem('asteroidColor', event.target.value);
    });

    setupKeybindChange('moveUp', 'moveUp');
    setupKeybindChange('moveDown', 'moveDown');
    setupKeybindChange('moveLeft', 'moveLeft');
    setupKeybindChange('moveRight', 'moveRight');
    setupKeybindChange('shoot', 'shoot');
}

function loadSettings() {
    const savedShipColor = localStorage.getItem('shipColor') || '#ffffff';
    const savedAsteroidColor = localStorage.getItem('asteroidColor') || '#ffffff';
    document.getElementById('shipColorPicker').value = savedShipColor;
    document.getElementById('asteroidColorPicker').value = savedAsteroidColor;
}

function saveVolume() {
    const volume = document.getElementById('volumeSlider').value;
    localStorage.setItem('volume', volume);
}

function saveShipColor() {
    const color = document.getElementById('shipColorPicker').value;
    localStorage.setItem('shipColor', color);
}

function saveAsteroidColor() {
    const color = document.getElementById('asteroidColorPicker').value;
    localStorage.setItem('asteroidColor', color);
}

function setupKeybindChange(buttonId, action) {
    const button = document.getElementById(buttonId);
    button.addEventListener('click', () => {
        button.textContent = 'Press a key...';
        const keyHandler = (e) => {
            localStorage.setItem(action, e.code);
            button.textContent = e.code;
            window.removeEventListener('keydown', keyHandler);
        };
        window.addEventListener('keydown', keyHandler);
    });
}

function closeOptions() {
    navigation.style.display = 'block';
    menu.style.height = '100vh';
    menu.innerHTML = menuContent;
}