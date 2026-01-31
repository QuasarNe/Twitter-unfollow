// ==UserScript==
// @name         Twitter/X 互关检测助手 Unfollow Helper
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  在 Twitter/X 的“正在关注”页面自动筛选未回关的用户。未回关者标红，已回关者隐藏。支持物理移除模式。
// @author       QuasarNe
// @match        https://twitter.com/*/following
// @match        https://x.com/*/following
// @icon         https://abs.twimg.com/favicons/twitter.2.ico
// @grant        none
// ==/UserScript==

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

    // 2. 检测逻辑独立运行 (高频 500ms)，仅在正在关注页面生效
    const detectionTask = setInterval(() => {
        if (window.location.href.includes('/following')) {
            highlightUnfollowers();
        }
    }, 500);

    let scrollTask = null;
    let scrollSpeed = 1200; // 默认间隔 1200ms

    const startScrolling = () => {
        if (scrollTask) clearInterval(scrollTask);
        scrollTask = setInterval(() => {
            if (!window.location.href.includes('/following')) return;
            window.scrollBy({
                top: window.innerHeight * 0.8,
                behavior: 'smooth'
            });
        }, scrollSpeed);
    };

    const stopScrolling = () => {
        if (scrollTask) {
            clearInterval(scrollTask);
            scrollTask = null;
        }
    };

    // 3. 控制面板
    const initUI = () => {
        if (document.getElementById('twitter-helper-panel')) return;

        const controlPanel = document.createElement('div');
        controlPanel.id = 'twitter-helper-panel';
        controlPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            background: rgba(255, 255, 255, 0.4);
            padding: 12px;
            border-radius: 16px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        `;

        const btnRow = document.createElement('div');
        btnRow.style.display = 'flex';
        btnRow.style.gap = '8px';

        const configRow = document.createElement('div');
        configRow.style.display = 'flex';
        configRow.style.alignItems = 'center';
        configRow.style.gap = '8px';
        configRow.style.fontSize = '12px';
        configRow.style.color = '#536471';

        const scrollBtn = document.createElement('button');
        scrollBtn.innerText = '开始自动滚动';
        
        const clearBtn = document.createElement('button');
        clearBtn.innerText = '移除互关';

        const stopBtn = document.createElement('button');
        stopBtn.innerText = '关闭脚本';

        const speedLabel = document.createElement('span');
        speedLabel.innerText = '滚动间隔(ms):';
        const speedInput = document.createElement('input');
        speedInput.type = 'number';
        speedInput.value = scrollSpeed;
        speedInput.step = 100;
        speedInput.min = 200;
        speedInput.style.cssText = `
            width: 60px;
            padding: 4px;

            border-radius: 4px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            color: inherit;
        `;

        [scrollBtn, clearBtn, stopBtn].forEach(btn => {
            btn.style.padding = '8px 16px';
            btn.style.backgroundColor = '#1d9bf0';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '20px';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = 'bold';
            btn.style.fontSize = '13px';
        });

        scrollBtn.onclick = () => {
            if (scrollTask) {
                stopScrolling();
                scrollBtn.innerText = '开始自动滚动';
                scrollBtn.style.backgroundColor = '#1d9bf0';
            } else {
                startScrolling();
                scrollBtn.innerText = '停止自动滚动';
                scrollBtn.style.backgroundColor = '#ffa500';
            }
        };

        speedInput.onchange = (e) => {
            scrollSpeed = parseInt(e.target.value) || 1200;
            if (scrollTask) startScrolling(); // 如果正在滚动，立即应用新速度
        };

        clearBtn.onclick = () => {
            document.body.classList.toggle('helper-mode-clean');
            const isActive = document.body.classList.contains('helper-mode-clean');
            clearBtn.innerText = isActive ? '显示全部' : '移除互关';
            clearBtn.style.backgroundColor = isActive ? '#00ba7c' : '#1d9bf0';
        };
        
        stopBtn.onclick = () => {
            clearInterval(detectionTask);
            clearInterval(uiTask);
            stopScrolling();
            style.remove();
            document.body.classList.remove('helper-mode-clean');
            controlPanel.remove();
        };

        btnRow.appendChild(scrollBtn);
        btnRow.appendChild(clearBtn);
        btnRow.appendChild(stopBtn);
        configRow.appendChild(speedLabel);
        configRow.appendChild(speedInput);
        
        controlPanel.appendChild(btnRow);
        controlPanel.appendChild(configRow);
        document.body.appendChild(controlPanel);
    };

    // 持续检查是否需要初始化 UI（因为 Twitter 是 SPA）
    const uiTask = setInterval(() => {
        if (window.location.href.includes('/following')) {
            initUI();
        } else {
            const panel = document.getElementById('twitter-helper-panel');
            if (panel) panel.remove();
        }
    }, 2000);

    console.log("%c[已就绪] 油猴脚本已加载，请在 /following 页面查看控制面板。", "color: #1d9bf0;");
})();