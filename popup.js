function nccPrint() {
    console.log('print')
}

function nccOutput() {
    console.log('output')
}

window.onload = function () {
    var bg = chrome.extension.getBackgroundPage();

    document.getElementById('nccPrint').addEventListener('click', function (e) {
        bg.print()
    })

    document.getElementById('nccOutput').addEventListener('click', function (e) {
        bg.output()
    })
}