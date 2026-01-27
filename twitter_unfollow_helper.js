// Twitter 互关检测辅助脚本 (Web UI 控制台版)
// 使用方法：
// 1. 在浏览器中打开：https://twitter.com/[你的用户名]/following
// 2. 按 F12 打开开发者工具，点击 Console (控制台)
// 3. 将此文件内容全部复制并粘贴进去，按回车运行

(async () => {
    console.log("%c[Twitter Helper] 正在初始化工具...", "color: #1d9bf0; font-weight: bold; font-size: 16px;");
    
    // 1. 注入强力 CSS 规则，确保样式不会被 Twitter 的 React 引擎推翻
    const style = document.createElement('style');
    style.innerHTML = `
        .helper-unfollow {
            background-color: rgba(255, 0, 0, 0.15) !important;
            border-left: 5px solid #ff4444 !important;
            border-radius: 4px !important;
            opacity: 1 !important;
            pointer-events: auto !important;
        }
        .helper-mutual {
            opacity: 0 !important;
            pointer-events: none !important;
        }
        /* 彻底移除模式的样式 */
        .helper-mode-clean .helper-mutual {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    const highlightUnfollowers = () => {
        const userCells = document.querySelectorAll('[data-testid="UserCell"]');
        userCells.forEach(cell => {
            const content = cell.innerText;
            const username = (content.match(/@(\w+)/) || [])[1] || 'unknown';
            const isMutual = /Follows you|回关了你|关注了你|跟隨了你/.test(content);
            const targetClass = isMutual ? 'helper-mutual' : 'helper-unfollow';

            // 只有当用户名变化或 class 不对时才更新，减少 DOM 操作
            if (cell.getAttribute('data-active-user') !== username || !cell.classList.contains(targetClass)) {
                cell.classList.remove('helper-mutual', 'helper-unfollow');
                cell.classList.add(targetClass);
                cell.setAttribute('data-active-user', username);
            }
        });
    };

    let isPaused = false;

    // 2. 检测逻辑独立运行 (高频 500ms)，暂停滚动时检测依然有效
    const detectionTask = setInterval(highlightUnfollowers, 500);

    // 3. 滚动逻辑独立运行 (1200ms)，受暂停开关控制
    const scrollTask = setInterval(() => {
        if (isPaused) return;
        window.scrollBy({
            top: window.innerHeight * 0.9,
            behavior: 'smooth'
        });
    }, 1200);

    // 4. 控制面板
    const controlPanel = document.createElement('div');
    controlPanel.id = 'twitter-helper-panel';
    controlPanel.style.position = 'fixed';
    controlPanel.style.top = '10px';
    controlPanel.style.right = '10px';
    controlPanel.style.zIndex = '9999';
    controlPanel.style.display = 'flex';
    controlPanel.style.gap = '10px';

    const stopBtn = document.createElement('button');
    stopBtn.innerText = '停止';
    
    const pauseBtn = document.createElement('button');
    pauseBtn.innerText = '暂停';

    const clearBtn = document.createElement('button');
    clearBtn.innerText = '清理列表(移除互关)';

    [stopBtn, pauseBtn, clearBtn].forEach(btn => {
        btn.style.padding = '10px 20px';
        btn.style.backgroundColor = '#1d9bf0';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '20px';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = 'bold';
        btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    });

    pauseBtn.onclick = () => {
        isPaused = !isPaused;
        pauseBtn.innerText = isPaused ? '恢复' : '暂停';
        pauseBtn.style.backgroundColor = isPaused ? '#ffa500' : '#1d9bf0';
    };
    
    stopBtn.onclick = () => {
        clearInterval(detectionTask);
        clearInterval(scrollTask);
        style.remove(); // 移除注入的 CSS
        document.body.classList.remove('helper-mode-clean');
        alert('脚本已停止。已尝试恢复原始样式（部分标记可能需刷新页面彻底清除）。');
        controlPanel.remove();
    };

    clearBtn.onclick = () => {
        isPaused = true;
        pauseBtn.innerText = '恢复';
        pauseBtn.style.backgroundColor = '#ffa500';
        document.body.classList.toggle('helper-mode-clean');
        const isActive = document.body.classList.contains('helper-mode-clean');
        clearBtn.innerText = isActive ? '取消清理(显示全部)' : '清理列表(移除互关)';
        clearBtn.style.backgroundColor = isActive ? '#00ba7c' : '#1d9bf0';
        console.log(isActive ? "%c[清理模式] 已物理移除互关格子。" : "%c[普通模式] 已恢复互关格子显示。", "color: #1d9bf0; font-weight: bold;");
    };
    
    controlPanel.appendChild(pauseBtn);
    controlPanel.appendChild(clearBtn);
    controlPanel.appendChild(stopBtn);
    document.body.appendChild(controlPanel);

    console.log("%c[已就绪] 正在自动滚动，如需操作请查看页面右上角控制面板。", "color: #1d9bf0;");
})();
