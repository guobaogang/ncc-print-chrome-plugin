/* chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'popMsg') {
        console.log('收到来自popup的消息：' + request.value);
    }
    sendResponse('我是content-script,已收到你的消息');
}) */

window.addEventListener('beforeprint', (event) => {
    chrome.storage.local.set({
        'ncchr-print-plugin-data': document.body.innerHTML
    })
});