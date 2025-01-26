// 游戏配置
const GAME_CONFIG = {
    GAME_DURATION: 30, // 游戏时长（秒）
    ITEM_SPAWN_INTERVAL: 300, // 物品生成间隔
    BOMB_SPAWN_INTERVAL: 5000, // 炸弹生成间隔（5秒）
    BOMB_COUNT: 2, // 每次生成的炸弹数量
    ITEM_FALL_SPEED: 3, // 物品下落速度
    PLAYER_SPEED: 15, // 玩家移动速度
    SCORE_PER_ITEM: 10, // 每个物品的分数
    SPAWN_COUNT: 30, // 每次生成的物品数量
    ITEM_SIZE: 50, // 物品大小
    BOMB_SIZE: 60, // 炸弹大小
    PLAYER_SIZE: 150, // 玩家大小
    MAX_ITEMS: 300, // 最大同时存在的物品数量
    COLLISION_PADDING: 0, // 碰撞检测的内边距
    COLLISION_HEIGHT_BONUS: 0, // 不再增加额外的高度范围
    COLLISION_WIDTH_BONUS: 0 // 不再增加额外的宽度范围
};

// 物品类型及其图片和音效配置
const ITEMS = [
    { type: 'yuanbao', image: './image/yuanbao.png', sound: './music/music1.mp3' },
    { type: 'hongbao', image: './image/hongbao.png', sound: './music/music1.mp3' },
    { type: 'fudai', image: './image/fudai.png', sound: './music/music2.mp3' },
    { type: 'jintiao', image: './image/jintiao.png', sound: './music/music2.mp3' },
    { type: 'zhuanshi', image: './image/zhuanshi.png', sound: './music/music3.mp3' },
    { type: 'zhihongbao', image: './image/zhihongbao.png', sound: './music/music3.mp3' },
    { type: 'dahongbao', image: './image/dahongbao.png', sound: './music/music4.mp3' }
];

// 炸弹配置
const BOMB = {
    type: 'bomb',
    image: './image/bomb.png',
    sound: './music/bomb.mp3'
};

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = document.getElementById('player');
        this.playerContainer = document.getElementById('player-container');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        
        // 设置画布尺寸
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        this.score = 0;
        this.timeLeft = GAME_CONFIG.GAME_DURATION;
        this.items = [];
        this.gameLoop = null;
        this.itemSpawnInterval = null;
        this.itemImages = {};
        this.itemSounds = {};
        this.loadedImages = 0;
        this.totalImages = ITEMS.length;
        this.isInitialized = false;
        
        // 初始化玩家位置在屏幕中央
        this.playerX = window.innerWidth / 2;
        this.playerY = window.innerHeight - GAME_CONFIG.PLAYER_SIZE - 20;
        this.isMovingLeft = false;
        this.isMovingRight = false;

        // 背景音乐
        this.backgroundMusic = new Audio('./music/background_music.mp3');
        this.backgroundMusic.loop = true;
        
        // 添加音效控制
        this.lastSoundTime = 0;
        this.soundCooldown = 1000;
        this.collectedItems = [];

        // 添加窗口大小改变事件监听
        window.addEventListener('resize', () => this.resizeCanvas());

        this.bombs = []; // 存储炸弹
        this.bombSpawnInterval = null;
        this.bombImage = null;
        this.bombSound = null;
        
        // 加载炸弹图片和音效
        this.bombImage = new Image();
        this.bombImage.src = BOMB.image;
        this.bombSound = new Audio(BOMB.sound);

        this.timerInterval = null; // 添加计时器引用
    }

    init() {
        return new Promise((resolve, reject) => {
            let loadedCount = 0;
            const totalCount = ITEMS.length + 1; // +1 for bomb
            
            const checkAllLoaded = () => {
                loadedCount++;
                if (loadedCount === totalCount) {
                    this.isInitialized = true;
                    resolve();
                }
            };

            // 预加载物品图片和音效
            ITEMS.forEach(item => {
                // 加载图片
                const img = new Image();
                img.onload = () => {
                    this.itemImages[item.type] = img;
                    checkAllLoaded();
                };
                img.onerror = () => {
                    console.error(`Failed to load image: ${item.image}`);
                    // 加载失败时使用备用图片
                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjAiIGZpbGw9IiNGRkQ3MDAiLz48L3N2Zz4=';
                    this.itemImages[item.type] = img;
                    checkAllLoaded();
                };
                img.src = item.image;

                // 加载音效
                const sound = new Audio(item.sound);
                sound.onerror = () => {
                    console.error(`Failed to load sound: ${item.sound}`);
                };
                this.itemSounds[item.type] = sound;
            });

            // 加载炸弹图片
            this.bombImage.onload = () => {
                checkAllLoaded();
            };
            this.bombImage.onerror = () => {
                console.error(`Failed to load bomb image: ${BOMB.image}`);
                checkAllLoaded();
            };

            // 键盘控制
            document.addEventListener('keydown', (e) => this.handleKeyDown(e));
            document.addEventListener('keyup', (e) => this.handleKeyUp(e));

            // 触摸控制
            document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
            document.addEventListener('touchend', () => this.handleTouchEnd());
        });
    }

    resizeCanvas() {
        // 更新画布尺寸
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // 更新玩家位置
        this.playerY = window.innerHeight - GAME_CONFIG.PLAYER_SIZE - 20;
        
        // 重新调整所有物品的X坐标以适应新的画布宽度
        this.items = this.items.filter(item => !item.collected).map(item => {
            // 保持物品的相对水平位置
            const relativeX = item.x / window.innerWidth;
            item.x = relativeX * this.canvas.width;
            
            // 如果物品在屏幕内，将其移回顶部外部
            if (item.y > 0) {
                item.y = -GAME_CONFIG.ITEM_SIZE - (Math.random() * 200);
            }
            return item;
        });
    }

    handleKeyDown(e) {
        if (e.key === 'ArrowLeft') {
            this.isMovingLeft = true;
        } else if (e.key === 'ArrowRight') {
            this.isMovingRight = true;
        }
    }

    handleKeyUp(e) {
        if (e.key === 'ArrowLeft') {
            this.isMovingLeft = false;
        } else if (e.key === 'ArrowRight') {
            this.isMovingRight = false;
        }
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.lastTouchX = touch.clientX;
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.lastTouchX;
        this.movePlayer(this.playerX + deltaX);
        this.lastTouchX = touch.clientX;
    }

    handleTouchEnd() {
        this.touchStartX = null;
        this.lastTouchX = null;
    }

    movePlayer(newX) {
        // 获取玩家元素的宽度
        const playerWidth = GAME_CONFIG.PLAYER_SIZE;
        
        // 计算边界，考虑玩家宽度的一半，这样边界是基于玩家中心点
        const minX = playerWidth / 2;
        const maxX = window.innerWidth - playerWidth / 2;
        
        // 限制玩家位置在屏幕范围内
        this.playerX = Math.max(minX, Math.min(maxX, newX));
        
        // 更新玩家位置，考虑玩家宽度的一半进行偏移
        const playerElement = document.getElementById('player');
        playerElement.style.left = `${this.playerX - playerWidth / 2}px`;
    }

    createItem() {
        const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        // 随机生成X坐标
        const randomX = Math.random() * (this.canvas.width - GAME_CONFIG.ITEM_SIZE);
        // 确保Y坐标在画布顶部外部足够远的位置
        const startY = -GAME_CONFIG.ITEM_SIZE - (Math.random() * 200);
        
        return {
            type: randomItem.type,
            x: randomX,
            y: startY,
            width: GAME_CONFIG.ITEM_SIZE,
            height: GAME_CONFIG.ITEM_SIZE,
            collected: false,
            speed: GAME_CONFIG.ITEM_FALL_SPEED * (0.8 + Math.random() * 0.4)
        };
    }

    spawnItem() {
        // 清理已收集和超出屏幕的物品
        this.items = this.items.filter(item => 
            !item.collected && 
            item.y <= this.canvas.height + GAME_CONFIG.ITEM_SIZE
        );
        
        // 计算需要生成的物品数量
        const itemsToSpawn = Math.min(
            GAME_CONFIG.SPAWN_COUNT,
            GAME_CONFIG.MAX_ITEMS - this.items.length
        );
        
        // 生成新物品
        for (let i = 0; i < itemsToSpawn; i++) {
            this.items.push(this.createItem());
        }
    }

    updateItems() {
        const remainingItems = [];
        this.collectedItems = [];
        
        for (const item of this.items) {
            if (item.collected) continue;

            // 更新物品位置
            item.y += item.speed;

            // 扩大检测范围，提前检查碰撞
            if (Math.abs(item.y - this.playerY) < GAME_CONFIG.PLAYER_SIZE * 3) {
                if (this.checkCollision(item)) {
                    item.collected = true;
                    this.collectedItems.push(item);
                    this.score += GAME_CONFIG.SCORE_PER_ITEM;
                    this.scoreElement.textContent = this.score;
                    continue;
                }
            }

            // 检查是否超出画布底部
            if (item.y > this.canvas.height + GAME_CONFIG.ITEM_SIZE) {
                continue;
            }

            remainingItems.push(item);
        }
        
        this.playCollectionSound();
        this.items = remainingItems;
    }

    playCollectionSound() {
        const currentTime = Date.now();
        
        // 如果有收集到物品且已经超过冷却时间
        if (this.collectedItems.length > 0 && currentTime - this.lastSoundTime >= this.soundCooldown) {
            // 从收集到的物品中随机选择一个播放音效
            const randomItem = this.collectedItems[Math.floor(Math.random() * this.collectedItems.length)];
            const sound = this.itemSounds[randomItem.type];
            
            if (sound) {
                const soundClone = sound.cloneNode();
                soundClone.play();
                this.lastSoundTime = currentTime;
            }
            
            // 清空收集列表
            this.collectedItems = [];
        }
    }

    checkCollision(item) {
        // 获取玩家实际的碰撞区域，使用实际大小
        const playerRect = {
            x: this.playerX - (GAME_CONFIG.PLAYER_SIZE / 2),
            y: this.playerY,
            width: GAME_CONFIG.PLAYER_SIZE,
            height: GAME_CONFIG.PLAYER_SIZE
        };

        // 获取物品的碰撞区域
        const itemRect = {
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height
        };

        // 检查碰撞
        return (itemRect.x < playerRect.x + playerRect.width &&
                itemRect.x + itemRect.width > playerRect.x &&
                itemRect.y < playerRect.y + playerRect.height &&
                itemRect.y + itemRect.height > playerRect.y);
    }

    createBomb() {
        const randomX = Math.random() * (this.canvas.width - GAME_CONFIG.BOMB_SIZE);
        const startY = -GAME_CONFIG.BOMB_SIZE - (Math.random() * 200);
        
        return {
            type: 'bomb',
            x: randomX,
            y: startY,
            width: GAME_CONFIG.BOMB_SIZE,
            height: GAME_CONFIG.BOMB_SIZE,
            collected: false,
            speed: GAME_CONFIG.ITEM_FALL_SPEED * (0.8 + Math.random() * 0.4)
        };
    }

    spawnBombs() {
        // 清理已收集和超出屏幕的炸弹
        this.bombs = this.bombs.filter(bomb => 
            !bomb.collected && 
            bomb.y <= this.canvas.height + GAME_CONFIG.BOMB_SIZE
        );
        
        // 生成新炸弹
        for (let i = 0; i < GAME_CONFIG.BOMB_COUNT; i++) {
            this.bombs.push(this.createBomb());
        }
    }

    updateBombs() {
        const remainingBombs = [];
        
        for (const bomb of this.bombs) {
            if (bomb.collected) continue;

            // 更新炸弹位置
            bomb.y += bomb.speed;

            // 检查碰撞
            if (this.checkCollision(bomb)) {
                // 播放炸弹音效
                this.bombSound.play();
                // 结束游戏
                this.end(true);
                return;
            }

            // 检查是否超出画布底部
            if (bomb.y > this.canvas.height + GAME_CONFIG.BOMB_SIZE) {
                continue;
            }

            remainingBombs.push(bomb);
        }
        
        this.bombs = remainingBombs;
    }

    draw() {
        if (!this.isInitialized) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制物品
        this.items.forEach(item => {
            if (!item.collected && item.y < this.canvas.height + GAME_CONFIG.ITEM_SIZE) {
                const img = this.itemImages[item.type];
                if (img && img.complete && img.naturalHeight !== 0) {
                    this.ctx.drawImage(img, item.x, item.y, item.width, item.height);
                }
            }
        });

        // 绘制炸弹
        this.bombs.forEach(bomb => {
            if (!bomb.collected && bomb.y < this.canvas.height + GAME_CONFIG.BOMB_SIZE) {
                if (this.bombImage && this.bombImage.complete && this.bombImage.naturalHeight !== 0) {
                    this.ctx.drawImage(this.bombImage, bomb.x, bomb.y, bomb.width, bomb.height);
                }
            }
        });
    }

    update() {
        if (this.isMovingLeft) {
            this.movePlayer(this.playerX - GAME_CONFIG.PLAYER_SPEED);
        }
        if (this.isMovingRight) {
            this.movePlayer(this.playerX + GAME_CONFIG.PLAYER_SPEED);
        }

        this.updateItems();
        this.updateBombs();
        this.draw();
    }

    start() {
        // 重置游戏状态
        this.score = 0;
        this.timeLeft = GAME_CONFIG.GAME_DURATION;
        this.items = [];
        this.bombs = [];
        this.scoreElement.textContent = '0';
        this.timerElement.textContent = this.timeLeft;

        // 播放背景音乐
        this.backgroundMusic.play();

        // 开始游戏循环
        this.gameLoop = setInterval(() => this.update(), 16);
        
        // 设置物品生成定时器
        this.itemSpawnInterval = setInterval(() => this.spawnItem(), GAME_CONFIG.ITEM_SPAWN_INTERVAL);

        // 设置炸弹生成定时器
        this.bombSpawnInterval = setInterval(() => this.spawnBombs(), GAME_CONFIG.BOMB_SPAWN_INTERVAL);

        // 倒计时
        if (this.timerInterval) {
            clearInterval(this.timerInterval); // 清除已存在的计时器
        }
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerElement.textContent = this.timeLeft;

            if (this.timeLeft <= 0) {
                this.end(false);
            }
        }, 1000);
    }

    end(hitBomb = false) {
        // 清除所有计时器
        clearInterval(this.gameLoop);
        clearInterval(this.itemSpawnInterval);
        clearInterval(this.bombSpawnInterval);
        clearInterval(this.timerInterval); // 清除倒计时计时器
        
        // 停止背景音乐
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
        
        // 显示结算页面
        window.showResult(this.score, hitBomb);
    }
}

// 导出游戏开始函数
window.startGame = function() {
    if (window.currentGame) {
        // 如果存在旧的游戏实例，确保清理所有计时器
        window.currentGame.end();
    }
    
    const game = new Game();
    window.currentGame = game; // 保存游戏实例的引用
    
    game.init()
        .then(() => {
            game.start();
        })
        .catch(error => {
            console.error('Failed to initialize game:', error);
            alert('游戏资源加载失败，请刷新页面重试！');
        });
}; 