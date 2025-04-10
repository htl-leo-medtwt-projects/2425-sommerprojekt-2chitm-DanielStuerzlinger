let body = document.getElementById('body');
let menu = document.getElementById('menu');
let title = document.getElementById('title');
let navigation = document.getElementById('navigation');
let arcadeScreenEdge = document.getElementById('arcadeScreenEdge');

function zoomIn() {
    let arcadeMachine = document.getElementById('arcadeMachine');
    let arcadeScreen = document.getElementById('arcadeScreen');

    if (!arcadeMachine.classList.contains('zoom')) {
        arcadeMachine.classList.add('zoom');
        arcadeScreen.classList.add('zoomScreen');

        setTimeout(() => {
            arcadeMachine.style.top = '-13vh';
        }, 150);

        setTimeout(() => {
            arcadeMachine.style.opacity = 0;
            menu.style.display = 'block'; 
            arcadeScreen.classList.add('fixedScreen');
            arcadeScreenEdge.style.display = 'block';
            arcadeScreenEdge.style.zIndex = '10';
            arcadeScreen.style.zIndex = '0';
        }, 1000);

        setTimeout(() => {
            arcadeScreen.classList.remove('fixedScreen')
            arcadeScreen.classList.remove('zoomScreen')
            navigation.style.zIndex = '10000'
            arcadeMachine.style.zIndex = 0;
            arcadeScreen.style.display = 'none'
        }, 1450);
    }
}

function options() {
    navigation.style.display = 'none';
    title.style.display = 'none';
    arcadeScreenEdge.style.position = 'fixed';
    body.style.overflowY = 'scroll'
    menu.style.height = 'fit-content'

    menu.innerHTML += `
        <h1>Options</h1>
        <h2>Hallo1</h2>
        <h2>Hallo2</h2>
        <h2>Hallo3</h2>
        <h2>Hallo4 zbzsb</h2>
        <h2>Hallo5</h2>
        <h2>Hallo6</h2>
        <h2>Hallo7</h2>
    `;
}