function zoomIn() {
    let arcadeMachine = document.getElementById('arcadeMachine');
    let arcadeScreen = document.getElementById('arcadeScreen');
    let menu = document.getElementById('menu');

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
        }, 1000);
    }
}