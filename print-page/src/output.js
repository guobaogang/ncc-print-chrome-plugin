import XlsxPopulate from './xlsx-populate-no-encryption.min';

let defaultTitleStyle = {
    verticalAlignment: 'center',
    horizontalAlignment: 'centerContinuous',
    //bold: true,
};
let defaultHeadStyle = {
    verticalAlignment: 'center',
    horizontalAlignment: 'center',
    wrapText: true,
    bold: true,
    border: true
};
let defaultBodyStyle = {
    border: true,
    verticalAlignment: 'center'
    // shrinkToFit: true
};
let centerColumnStyle = {
    verticalAlignment: 'center',
    horizontalAlignment: 'center'
};
let makerStyle = {
    verticalAlignment: 'center'
};
let rowHeight = 18;
const defaultColor = {
    'red': 'ff0000'
}; // 此插件不支持使用 red, black此形式来表示颜色，此处将颜色转化一下表示形式
const allowStyle = ['color']; //允许添加到表格的样式，很多样式会导致报错
let array = [],
    headArr = [],
    tableHead = [],
    formArr = [];
let subHead = []; // 多表头的子表
let mergeTime = 0; // 几处多表头 
let headNeedMerge = []; // 记录子表头的位置 [[3, 6], [9, 11]]
let footArray = []; // 社保缴交底部有合计一行
let formLen = 0;
let numformatColumn = [];
let numFormatStyle = [];
let addStylePos = []; //
let cellStyle = [];
let mergeColumnAll = [];
let columnWidth = [],
    maxWidth = 30; //列宽配置
let centerColumnCode = ['psncode', 'clerkcode', 'psnname'],
    centerColumn = [];
let tableConf = {};
let columnLength = 0;


export default function renderXlsx(config) {
    tableConf = config;
    let title = config.title ? config.title : '';
    let fileName = title;
    // 是否有表单数据
    let isForm = 0;
    //let isForm = formLen > 0 ? formLen + 1 : 0;
    // 是否存在二级表头
    //let isMerge = config.mutleHeadFlag ? 1 : 0;
    let isMerge = 0;
    // 是否含有底部数据（如合计行）
    let isTableFoot = 0;
    //let isTableFoot = footArray ? footArray.length : 0
    let headerRow = config.mutleHeadFlag ? 2 : 1;
    // 表头开始行数
    let tableHeadRow = isForm + 3 + 1
    // 表体开始行数
    let tableBodyRow = 3 + headerRow + isMerge + 1 + isForm // 3指标题及其上下两行共占了3行
    // 底部行
    let footerRow = config.body.length + 3 + headerRow + isMerge + 1 + isForm
    // 制单信息行数
    let makeRow = config.body.length + 3 + headerRow + isMerge + 2 + isTableFoot + isForm

    columnLength = getColumnLength(config.header);
    setBodyColWidth(config.body);

    XlsxPopulate.fromBlankAsync()
        .then(workbook => {
            let sheet = workbook.sheet(0);
            // 默认都是从第一列开始
            sheet.range(sheet.row(2).cell(1), sheet.row(2).cell(columnLength)).merged(true).value(title).style(defaultTitleStyle); // 标题
            //sheet.row(2).height(rowHeight);
            //sheet.row(2).cell(1).value(title);
            //renderForm(sheet, config); // 表单
            renderHead(sheet, tableHeadRow); // 表头
            renderTableBody(sheet, tableBodyRow, footerRow); // 表体
            //设置需要居中的列
            //renderCenterColumn(sheet);
            // 制单信息
            renderMakeInfo(sheet, makeRow);
            //设置列宽
            renderColumnWidth(sheet);
            //renderRowHeight(sheet, tableBodyRow, makeRow);
            sheet.range(sheet.row(2).cell(1), sheet.row(2).cell(columnLength)).style(defaultTitleStyle);
            // cell.style(name, value)
            workbook.outputAsync()
                .then(function (blob) {
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        // If IE, you must uses a different method.
                        window.navigator.msSaveOrOpenBlob(blob, `${fileName}.xlsx`);
                    } else {
                        var url = window.URL.createObjectURL(blob);
                        var a = document.createElement("a");
                        document.body.appendChild(a);
                        a.href = url;
                        a.download = `${fileName}.xlsx`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                    }
                });
        });
}


function getColumnLength(headerConf = []) {
    let colLen = 0;
    headerConf.forEach(item => {
        if (Array.isArray(item)) {
            //colLen += item[1].length
            item[1].forEach(subItem => {
                setColumnWidth(colLen, subItem, true)
                colLen++
            })
        } else {
            setColumnWidth(colLen, item, true)
            colLen++
        }
    });
    return colLen;
}

function setBodyColWidth(bodyConf = []) {
    bodyConf.forEach(row => {
        let colLen = 0;
        row.forEach(item => {
            setColumnWidth(colLen, item, false)
            colLen++
        })
    });
}

function renderHead(sheet, tableHeadRow) {
    if (tableConf.mutleHeadFlag) { // [[4,8], [10, 13] ]
        let colIndex = 1;
        tableConf.header.forEach(head => {
            if (Array.isArray(head)) {
                sheet.range(sheet.row(tableHeadRow).cell(colIndex),
                        sheet.row(tableHeadRow).cell(colIndex + head[1].length - 1))
                    .merged(true)
                    .value(head[0])
                    .style(defaultHeadStyle);
                head[1].forEach(subItem => {
                    sheet.row(tableHeadRow + 1)
                        .cell(colIndex).value(subItem)
                        .style(defaultHeadStyle);
                    colIndex++;
                })
            } else {
                sheet.range(sheet.row(tableHeadRow).cell(colIndex),
                        sheet.row(tableHeadRow + 1).cell(colIndex))
                    .merged(true)
                    .value(head)
                    .style(defaultHeadStyle);
                colIndex++;
            }
        })
    } else {
        sheet.range(sheet.row(tableHeadRow).cell(1),
                sheet.row(tableHeadRow).cell(columnLength))
            .value([tableConf.header])
            .style(defaultHeadStyle);
        //sheet.row(tableHeadRow).height(40)
    }
}

function renderTableBody(sheet, tableBodyRow, footerRow) {
    tableConf.body.length > 0 &&
        sheet.cell(`A${tableBodyRow}`)
        .value(tableConf.body)
        .style(defaultBodyStyle) // 表体
    /* if (numformatColumn) {
        numformatColumn.map((numItem, numIndex) => {
            sheet.column(numItem + 1).style({
                numberFormat: numFormatStyle[numIndex]
            })
        })

    }
    if (footArray.length > 0) {
        let resultFoot = footArray[0].map(value => {
            if (!value) return value;
            let temp = Number(value);
            if (typeof temp === 'number' && !isNaN(temp)) {
                return temp
            }
            return value;
        });
        sheet.cell(`A${footerRow}`).value([resultFoot]).style(defaultBodyStyle)
    } */
}

function renderMakeInfo(sheet, makeRow) {
    let [nameText, name] = tableConf.maker.split(":");
    let [dateText, date] = tableConf.date.split(":");
    sheet.row(`${makeRow}`).cell(1).value(`${nameText}:`)
    sheet.row(`${makeRow}`).cell(2).value(`${name || ''}`)
    if (columnLength >= 4) {
        sheet.row(`${makeRow}`).cell(columnLength - 1).value(`${dateText}:`)
        sheet.row(`${makeRow}`).cell(columnLength).value(`${date}`)
    } else {
        sheet.row(`${makeRow}`).cell(3).value(`${dateText}:`)
        sheet.row(`${makeRow}`).cell(4).value(`${date}`)
    }
    sheet.row(`${makeRow}`).style(makerStyle);
}

function setColumnWidth(index, label = '', isHead) {
    if (!label || !(label + '').length) return;
    let labelWidth;
    /* if (type === 'number') {
        labelWidth = (label + '').length + (Number(scale) > 0 ? Number(scale) + 2.6 : 1.6);
    } else { */
    if (/^[^\u4e00-\u9fa5]+$/.test(label)) {
        labelWidth = (label + '').length * (1 + (isHead ? 0.2 : 0)) + 1.6;
    } else {
        labelWidth = label.length * (2 + (isHead ? 0.2 : 0)) + 1.6;
    }
    //}
    let currentWidth = columnWidth[index] || 0;
    if (labelWidth > currentWidth) {
        columnWidth[index] = Math.min(maxWidth, labelWidth);
    }
}

function renderColumnWidth(sheet) {
    for (let i = 0; i < columnWidth.length; i++) {
        if (!columnWidth[i]) continue;
        sheet.column(i + 1).width(columnWidth[i]);
    }
}