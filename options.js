// 默认搜索引擎配置
const DEFAULT_ENGINES = [
    { name: "duckduckgo", url: "https://duckduckgo.com/?q=%s" },
    { name: "微博", url: "https://s.weibo.com/weibo?q=%s" },
    { name: "百度", url: "https://www.baidu.com/s?wd=%s" },
    { name: "bilibili", url: "https://search.bilibili.com/all?keyword=%s" },
    { name: "Google", url: "https://www.google.com/search?q=%s" },
    { name: "Yandex", url: "https://yandex.com/search/?text=%s" },
    { name: "YouTube", url: "https://www.youtube.com/results?search_query=%s" },
    { name: "imdb", url: "https://www.imdb.com/find?q=%s" },
    { name: "𝕏", url: "https://x.com/search?q=%s" },
    { name: "GitHub", url: "https://github.com/search?q=%s" },
    { name: "知乎", url: "https://www.zhihu.com/search?q=%s" },
    { name: "抖音", url: "https://www.douyin.com/search/%s" },
    { name: "小红书", url: "https://www.xiaohongshu.com/search_result?keyword=%s" },
    { name: "豆瓣电影", url: "https://movie.douban.com/subject_search?search_text=%s" },
    { name: "必应", url: "https://www.bing.com/search?q=%s" },
    { name: "京东", url: "https://search.jd.com/Search?keyword=%s" }
];

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    loadEngines();
    initDragAndDrop();
    
    document.getElementById('addEngineForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('engineName').value;
        const url = document.getElementById('engineUrl').value;
        
        addEngine({ name, url });
        e.target.reset();
    });
});

// 加载搜索引擎列表
function loadEngines() {
    chrome.storage.sync.get('engines', function(data) {
        const engines = data.engines || DEFAULT_ENGINES;
        const engineList = document.getElementById('engineList');
        engineList.innerHTML = '';
        
        engines.forEach((engine, index) => {
            const item = createEngineItem(engine, index);
            engineList.appendChild(item);
        });
    });
}

// 创建搜索引擎列表项
function createEngineItem(engine, index) {
    const item = document.createElement('div');
    item.className = 'engine-item';
    item.setAttribute('data-index', index);
    item.draggable = true;
    
    item.innerHTML = `
        <div class="drag-handle">⋮⋮</div>
        <div class="engine-name">${engine.name}</div>
        <div class="engine-url">${engine.url}</div>
        <div class="controls">
            <button type="button" class="delete">删除</button>
        </div>
    `;
    
    // 为删除按钮添加事件监听器
    const deleteButton = item.querySelector('.delete');
    deleteButton.addEventListener('click', function() {
        deleteEngine(index);
    });
    
    return item;
}

// 初始化拖拽排序
function initDragAndDrop() {
    const engineList = document.getElementById('engineList');
    let draggedItem = null;
    
    engineList.addEventListener('dragstart', function(e) {
        draggedItem = e.target;
        if (e.target.classList.contains('engine-item')) {
            e.target.style.opacity = '0.5';
        }
    });
    
    engineList.addEventListener('dragend', function(e) {
        if (e.target.classList.contains('engine-item')) {
            e.target.style.opacity = '1';
            saveOrder();
        }
    });
    
    engineList.addEventListener('dragover', function(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(engineList, e.clientY);
        const item = draggedItem;
        if (item && item.classList.contains('engine-item')) {
            if (afterElement == null) {
                engineList.appendChild(item);
            } else {
                engineList.insertBefore(item, afterElement);
            }
        }
    });
}

// 获取拖拽后的位置
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.engine-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 保存排序
function saveOrder() {
    const items = [...document.querySelectorAll('.engine-item')];
    chrome.storage.sync.get('engines', function(data) {
        const engines = data.engines || DEFAULT_ENGINES;
        
        const newEngines = items.map(item => {
            const index = parseInt(item.getAttribute('data-index'));
            return engines[index];
        });
        
        chrome.storage.sync.set({ engines: newEngines }, function() {
            loadEngines();
        });
    });
}

// 删除搜索引擎
function deleteEngine(index) {
    chrome.storage.sync.get('engines', function(data) {
        const engines = data.engines || DEFAULT_ENGINES;
        engines.splice(index, 1);
        chrome.storage.sync.set({ engines }, function() {
            loadEngines();  // 重新加载列表
        });
    });
}

// 添加搜索引擎
function addEngine(engine) {
    chrome.storage.sync.get('engines', function(data) {
        const engines = data.engines || DEFAULT_ENGINES;
        engines.push(engine);
        chrome.storage.sync.set({ engines }, function() {
            loadEngines();
        });
    });
} 