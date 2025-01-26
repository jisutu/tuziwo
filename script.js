document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const catcher = document.getElementById('catcher');
    const scoreDisplay = document.getElementById('score');
    let score = 0;

    function createFortuneBag() {
        const fortuneBag = document.createElement('div');
        fortuneBag.classList.add('fortune-bag');
        // 设置不同类型的福袋的比例为55%、20%、15%、5%、5%
        const bagTypes = ['normal', 'gold', 'silver', 'diamond', 'ruby'];
        const probabilities = [0.55, 0.75, 0.9, 0.95, 1.0]; // 调整概率累加值
        let randomIndex = 0;
        const randomValue = Math.random();

        for (let i = 0; i < probabilities.length; i++) {
            if (randomValue < probabilities[i]) {
                randomIndex = i;
                break;
            }
        }

        const randomType = bagTypes[randomIndex];
        fortuneBag.dataset.type = randomType;

        // 设置不同类型的福袋图片
        if (randomType === 'normal') {
            fortuneBag.style.backgroundImage = 'url("fortune-bag.png")';
        } else if (randomType === 'gold') {
            fortuneBag.classList.add('gold-fortune-bag'); // 添加黄金福袋类名
        } else if (randomType === 'silver') {
            fortuneBag.classList.add('silver-fortune-bag'); // 添加银色福袋类名
        } else if (randomType === 'diamond') {
            fortuneBag.classList.add('diamond-fortune-bag'); // 添加钻石福袋类名
        } else if (randomType === 'ruby') {
            fortuneBag.classList.add('ruby-fortune-bag'); // 添加红宝石福袋类名
        }

        fortuneBag.style.left = `${Math.random() * (gameContainer.offsetWidth - 50)}px`;
        fortuneBag.style.top = '-50px';
        gameContainer.appendChild(fortuneBag);

        function fall() {
            const top = parseInt(fortuneBag.style.top);
            if (top < gameContainer.offsetHeight) {
                fortuneBag.style.top = `${top + 2}px`;
                setTimeout(fall, 20);
            } else {
                gameContainer.removeChild(fortuneBag);
            }
        }

        fall();

        function checkCollision() {
            const catcherRect = catcher.getBoundingClientRect();
            const bagRect = fortuneBag.getBoundingClientRect();
            if (
                catcherRect.left < bagRect.right &&
                catcherRect.right > bagRect.left &&
                catcherRect.top < bagRect.bottom &&
                catcherRect.bottom > bagRect.top
            ) {
                // 根据福袋类型增加不同的分数
                if (fortuneBag.dataset.type === 'normal') {
                    score++;
                } else if (fortuneBag.dataset.type === 'gold') {
                    score += 5; // 黄金福袋增加5分
                } else if (fortuneBag.dataset.type === 'silver') {
                    score += 3; // 银色福袋增加3分
                } else if (fortuneBag.dataset.type === 'diamond') {
                    score += 10; // 钻石福袋增加10分
                } else if (fortuneBag.dataset.type === 'ruby') {
                    score += 7; // 红宝石福袋增加7分
                }
                scoreDisplay.textContent = `得分: ${score}`;
                gameContainer.removeChild(fortuneBag);
            }
        }

        setInterval(checkCollision, 20);
    }

    // 修改: 将时间间隔从1000毫秒调整为100毫秒
    const createFortuneBagInterval = setInterval(createFortuneBag, 100);

    document.addEventListener('mousemove', (e) => {
        const rect = gameContainer.getBoundingClientRect();
        const x = e.clientX - rect.left - catcher.offsetWidth / 2;
        catcher.style.left = `${Math.max(0, Math.min(x, rect.width - catcher.offsetWidth))}px`;
    });

    // 添加倒计时变量
    let countdown = 30;
    const countdownDisplay = document.getElementById('countdown');
    countdownDisplay.textContent = `时间: ${countdown}s`;

    // 添加倒计时函数
    function startCountdown() {
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownDisplay.textContent = `时间: ${countdown}s`;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                endGame();
            }
        }, 1000);
    }

    // 添加结束游戏函数
    function endGame() {
        clearInterval(createFortuneBagInterval);
        alert(`游戏结束！你的得分是: ${score}`);
    }

    // 启动倒计时
    startCountdown();
});