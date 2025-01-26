// 显示结算页面
window.showResult = function(score, hitBomb = false) {
    // 获取所需的DOM元素
    const resultModal = document.getElementById('result-modal');
    const finalScore = document.getElementById('final-score');
    const resultHeader = document.getElementById('result-header');
    const replayButton = document.getElementById('replay-btn');
    
    // 检查必要的元素是否存在
    if (!resultModal || !finalScore || !resultHeader || !replayButton) {
        console.error('找不到必要的DOM元素');
        return;
    }
    
    try {
        // 创建按钮音效
        const buttonSound = new Audio('music/button.mp3');
        
        // 设置分数
        finalScore.innerHTML = `福气值：<span class="score-number">${score}</span>`;
        
        // 移除所有已存在的消息
        const existingMessages = document.querySelectorAll('.bomb-message');
        existingMessages.forEach(msg => msg.remove());
        
        // 根据游戏结束原因设置不同的标题和消息
        if (hitBomb) {
            resultHeader.textContent = '💥 游戏结束！';
            finalScore.insertAdjacentHTML('afterend', '<p class="bomb-message">你碰到了炸弹！</p>');
        } else {
            resultHeader.textContent = '🎉 时间到！新年发！发！发！';
        }
        
        // 显示结果模态框
        resultModal.style.display = 'flex';
        
        // 移除已存在的事件监听器（如果有）
        const newReplayButton = replayButton.cloneNode(true);
        replayButton.parentNode.replaceChild(newReplayButton, replayButton);
        
        // 添加新的事件监听器
        newReplayButton.addEventListener('click', () => {
            try {
                // 播放按钮音效
                buttonSound.play().catch(error => console.log('无法播放按钮音效:', error));
                
                // 延迟一小段时间后刷新页面，确保音效能播放
                setTimeout(() => {
                    window.location.reload();
                }, 200);
            } catch (error) {
                console.error('重玩按钮点击处理出错:', error);
                // 如果出错也刷新页面
                window.location.reload();
            }
        });
    } catch (error) {
        console.error('显示结果页面时出错:', error);
    }
}; 