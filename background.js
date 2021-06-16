function print() {
    chrome.tabs.create({
        url: "./print-page/dist/index.html",
        active: true
    })
}

// 获取当前选项卡ID
function getCurrentTabId(callback) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        if (callback) callback(tabs.length ? tabs[0].id : null);
    });
}

function sendMsgToContentScript(message, callback) {
    getCurrentTabId((tabId) => {
        message.value = message.value + 'tabId === ' + tabId

        chrome.tabs.sendMessage(tabId, message, function (response) {
            if (callback) callback(response);
        });
    });
}