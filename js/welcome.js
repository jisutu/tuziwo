document.addEventListener('DOMContentLoaded', () => {
    const welcomePage = document.getElementById('welcome-page');
    const gamePage = document.getElementById('game-page');
    const startButton = document.getElementById('start-btn');

    // 创建按钮音效
    const buttonSound = new Audio('music/button.mp3');

    // 点击开始按钮
    startButton.addEventListener('click', () => {
        // 播放按钮音效
        buttonSound.play();

        // 隐藏欢迎页面
        welcomePage.classList.remove('active');
        // 显示游戏页面
        gamePage.classList.add('active');
        // 开始游戏
        window.startGame();
    });
}); 