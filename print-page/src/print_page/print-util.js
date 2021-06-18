/*
    打印方案思路：
    1. 通过页面zoom，缩小页面后打印，但是zoom的程度有限，缩小到一定程度之后就不管用了
    2. 通过transfrom缩小页面，虽然可以解决缩小的问题，但是多页打印的时候page-break会有问题
    3. 等比列放大纸张大小，目前唯一可行方案，但存在以下问题
        a. 需要计算mm和px的关系，然后根据html的页面宽度和纸张的px宽度，计算缩放比例，
        但是mm和px的计算公式目前还不确定是否正确，虽然算出来的比例可用，但是这个比例
        增大或者减小一些貌似也可用。
        b. 浏览器打印的时候自身也有一定的缩放算法，所以没有办法精确的验证上面计算出来的比例
        c. 偶尔会出一些打印的时候右侧会少打印一点点的问题，不止会在较大的页面打印的时候
        d. 超大的页面打印到一行，也就是缩的特别小的时候，打印在纸上会只有一坨
    4. js控制打印设置的缩放，这个应该是最好的解决方案，但是貌似Chrome没有提供相应api，
        需要进一步研究
 */

/**
 * 打印纸张参数
 * 单位均为mm
 */
export const paperConfig = {
    'A1': {
        h: 841,
        w: 594
    },
    'A2': {
        h: 594,
        w: 420
    },
    'A3': {
        h: 420,
        w: 297
    },
    'A4': {
        h: 297,
        w: 210
    },
    'A5': {
        h: 210,
        w: 148
    }
};

/**
 * 打印纸张大小转为网页大小
 * @param mm  纸张大小
 * @returns {number}  页面大小
 */
function convertMMtoPX(mm) {
    const dpi = 96; //dpi大小暂定96
    return mm * dpi / 25.41; //1inch取25.41mm
}

/**
 * 获取缩放比例
 * @returns {number}
 * @param paperW
 * @param htmlW
 */
function getScale(paperW, htmlW) {
    //打印纸张大小转换为PX大小
    const paperWWithPX = convertMMtoPX(paperW);
    let scale = paperWWithPX / htmlW;
    return scale > 1 ? 1 : scale;
}

function getNewScale(paperW, htmlW, marginW) {
    const dpi = 96; //dpi大小暂定96
    const inchToMM = 25.41; //1inch取25.41mm
    //let scale = (paperW * dpi) / (htmlW * inchToMM + marginW * dpi);
    let scale = paperW / ((inchToMM * htmlW) / dpi + marginW);
    return scale > 1 ? 1 : scale;
}

/**
 * 添加打印样式
 * @param config 打印配置
 * @param doc
 */
export function appendPrintStyle(config, doc) {
    //获取当前纸张参数
    const paperSize = paperConfig[config.paper];
    //根据横向纵向获取纸张宽度
    let paperW = paperSize[config.direct === 'landscape' ? 'h' : 'w'];
    let paperH = paperSize[config.direct === 'landscape' ? 'w' : 'h'];
    let showPaperW = 0,
        showPaperH = 0,
        borderW = 0,
        borderH = 0;
    let newStyle = doc.createElement('style');
    if (config.margin === 'custom') {
        borderW = Number(config.marginRight) + Number(config.marginLeft);
        borderH = Number(config.marginTop) + Number(config.marginBottom);
        showPaperW = paperW - borderW;
        showPaperH = paperH - borderH;
        newStyle.innerHTML = `
            @page{
                margin-top: ${config.marginTop}mm;
                margin-right: ${config.marginRight}mm;
                margin-bottom: ${config.marginBottom}mm;
                margin-left: ${config.marginLeft}mm;
            }
        `
    } else if (config.margin === 'none') {
        newStyle.innerHTML += `
            @page{
                margin: 0;
            }
        `
    } else if (config.margin === 'min') {
        borderW = 20;
        borderH = 10;
        showPaperW = paperW - borderW;
        showPaperH = paperH - borderH;
        newStyle.innerHTML += `
            @page{
                margin: 5mm 10mm;
            }
        `
    } else {
        borderW = 30;
        borderH = 30;
        showPaperW = paperW - borderW;
        showPaperH = paperH - borderH;
        newStyle.innerHTML += `
            @page{
                margin: 15mm 15mm;
            }
        `
    }
    //获取待打印页面宽度
    const htmlW = doc.body.querySelector('table').offsetWidth;
    //计算缩放比例
    //const scale = getScale(showPaperW, htmlW);
    const scale = getNewScale(paperW, htmlW, borderW);
    //按比例扩大纸张大小，html比例不再缩放，以防出现超过打印超过一页的page break问题
    let paperSizeW = Math.ceil(paperW / scale);
    let paperSizeH = Math.ceil(paperH / scale);

    //偶尔会出现最后一点缺失的情况，可能是由于打印的时候边距的精确度引起的
    //在这里做一个修正，但是貌似算的还是有点问题
    //可能出了边距之外，显示区域也需要做修正
    let realBorderW = Math.ceil(borderW * (paperW / paperSizeW));
    /*let shouldBorderW = Math.floor(realBorderW * (paperSizeW / paperW));
    let reviseBorderW = shouldBorderW - borderW;
    let oldPSW = paperSizeW;
    paperSizeW += reviseBorderW;
    paperSizeH = Math.ceil(paperSizeH * (paperSizeW / oldPSW));
    let realShowW = paperW - realBorderW;
    let reviseW = Math.ceil((realShowW - paperW) * (paperSizeW / paperW));
    let oldPSW = paperSizeW;
    paperSizeW -= reviseW;
    paperSizeH = Math.ceil(paperSizeH * (paperSizeW / oldPSW));*/

    newStyle.innerHTML += `
        @page{
            size: ${paperSizeW}mm ${paperSizeH}mm;
        }
    `;
    doc.body.appendChild(newStyle);
}

/**
 * 获取用户配置，需传入配置的key值，比如薪资方案
 * 考虑配置维度是否需要包含用户
 * 如果该用户没有相应配置，则返回默认配置
 *  {
        paper: 'A4', //A4纸
        direct: 'landscape', //横向打印
        margin: 'default',  //默认边距
        maxColLen: 0,       //0默认不折行
        maxChar: 0          //一行最多显示多少字符，0默认不限制
    }
 */
export const defaultConfig = {
    paper: 'A4',
    maxCol: 0,
    direct: 'landscape',
    margin: 'default',
    marginTop: 15,
    marginRight: 15,
    marginBottom: 15,
    marginLeft: 15,
    maxChar: 0
}