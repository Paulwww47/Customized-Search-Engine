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

// 初始化右键菜单
function initContextMenus() {
    // 清除现有菜单
    chrome.contextMenus.removeAll();
    
    // 获取搜索引擎配置
    chrome.storage.sync.get('engines', function(data) {
        const engines = data.engines || DEFAULT_ENGINES;
        
        // 创建菜单项
        engines.forEach(engine => {
            chrome.contextMenus.create({
                title: `使用${engine.name}搜索：'%s'`,
                contexts: ['selection'],
                onclick: function(params) {
                    const url = engine.url.replace('%s', encodeURI(params.selectionText));
                    chrome.tabs.create({ url: url });
                }
            });
        });
    });
}

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        // 首次安装时，初始化默认搜索引擎列表
        chrome.storage.sync.set({ engines: DEFAULT_ENGINES }, function() {
            initContextMenus();
        });
    } else {
        initContextMenus();
    }
});

// 监听存储变化，更新菜单
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && changes.engines) {
        initContextMenus();
    }
});

