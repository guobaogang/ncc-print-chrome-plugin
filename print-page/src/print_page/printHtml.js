import {
    appendPrintStyle
} from './printUtil';

export default function print({
    title,
    mutleHeadFlag,
    header = [],
    body = [],
    maker,
    date
}, printConf) {
    let newDoc = window.document;
    let tableData = [header].concat(body);
    appendHeader(newDoc, title);
    // 添加样式
    appendStyle(newDoc, printConf);

    if (mutleHeadFlag) {
        if (printConf.maxCol === 0) {
            appendMutleTable(newDoc, printConf, tableData)
        } else {

        }
    } else {
        if (printConf.maxCol === 0) {
            appendTable(newDoc, printConf, '', tableData);
        } else {
            let tableDataList = splitTableData(tableData, printConf.maxCol);
            tableDataList.map((tableData, index) => {
                let className = '';
                if (index === tableDataList.length - 1) {
                    className = 'print-last-table';
                }
                // 添加表格
                appendTable(newDoc, printConf, className, tableData);
            });
        }
    }

    appendFooter(newDoc, {
        maker,
        date
    });

    appendPrintStyle(printConf, newDoc);
}

function splitTableData(tableData, maxColLen) {
    let tableDataList = [];

    // 首先判断一行有几列
    let tableLen = Math.ceil(tableData[0].length / maxColLen);

    let i = 0;

    while (i < tableLen) {

        // 第i个表格数据
        tableDataList[i] = [];

        tableData.map((trData) => {
            let endIndex = maxColLen
            if (trData.length < maxColLen) {
                endIndex = trData.length;
            }
            let newTr = trData.splice(0, endIndex);
            tableDataList[i].push(newTr);
        });

        i++;
    }

    return tableDataList;
}

function appendHeader(doc, title) {

    let titleNode = doc.createElement('h3');
    titleNode.innerText = title;
    titleNode.style.textAlign = 'center';

    doc.body.appendChild(titleNode);
}

function appendTable(newDoc, printConf, tableClass, tableData) {
    let newTable = newDoc.createElement('table');

    newTable.className = `print-table ${tableClass || ''}`;
    let colWidth = {};

    tableData.map((tr, index) => {
        let newTr = newDoc.createElement('tr');
        newTr.className = `print-tr ${index === 0 ? 'print-table-head' : ''}`;

        tr.map((td, index) => {
            let newTd = newDoc.createElement('td');
            newTd.className = 'print-td';

            newTd.innerText = td;
            newTr.appendChild(newTd);
            if (printConf.maxChar && printConf.maxChar !== 0) {
                let tdWidth, max = Number(printConf.maxChar);
                if (/^[^\u4e00-\u9fa5]+$/.test(td)) {
                    if ((td + "").length / 2 > max) {
                        tdWidth = max * 16 + 8 + 4;
                    } else {
                        tdWidth = ((td + "").length / 2) * 16 + 8 + 4;
                    }
                } else {
                    if ((td + "").length > max) {
                        tdWidth = max * 16 + 8 + 4;
                    } else {
                        tdWidth = ((td + "").length) * 16 + 8 + 4;
                    }
                }
                if (!colWidth[index] || colWidth[index] < tdWidth) {
                    colWidth[index] = tdWidth
                }
            }
        });
        newTable.appendChild(newTr);
    });

    if (printConf.maxChar && printConf.maxChar !== 0) {
        let allTd = newTable.querySelectorAll('.print-table-head>td');
        for (let key in colWidth) {
            allTd[key].style.width = colWidth[key] + 'px';
        }
    }
    newDoc.body.appendChild(newTable);
}

function appendMutleTable(newDoc, printConf, tableClass, tableData) {
    let newTable = newDoc.createElement('table');

    newTable.className = `print-table ${tableClass || ''}`;
    let colWidth = {};

    tableData.map((tr, index) => {
        let newTr = newDoc.createElement('tr');
        newTr.className = `print-tr ${index === 0 ? 'print-table-head' : ''}`;

        tr.map((td, index) => {
            let newTd = newDoc.createElement('td');
            newTd.className = 'print-td';

            newTd.innerText = td;
            newTr.appendChild(newTd);
            if (printConf.maxChar && printConf.maxChar !== 0) {
                let tdWidth, max = Number(printConf.maxChar);
                if (/^[^\u4e00-\u9fa5]+$/.test(td)) {
                    if ((td + "").length / 2 > max) {
                        tdWidth = max * 16 + 8 + 4;
                    } else {
                        tdWidth = ((td + "").length / 2) * 16 + 8 + 4;
                    }
                } else {
                    if ((td + "").length > max) {
                        tdWidth = max * 16 + 8 + 4;
                    } else {
                        tdWidth = ((td + "").length) * 16 + 8 + 4;
                    }
                }
                if (!colWidth[index] || colWidth[index] < tdWidth) {
                    colWidth[index] = tdWidth
                }
            }
        });
        newTable.appendChild(newTr);
    });

    if (printConf.maxChar && printConf.maxChar !== 0) {
        let allTd = newTable.querySelectorAll('.print-table-head>td');
        for (let key in colWidth) {
            allTd[key].style.width = colWidth[key] + 'px';
        }
    }
    newDoc.body.appendChild(newTable);
}

// 插入页脚时间和制表人
function appendFooter(doc, {
    maker,
    date,
}) {
    let [nameText, name] = maker.split(":");
    let [dateText, date] = date.split(":");
    let footerDiv = doc.createElement('div');
    footerDiv.className = 'print-footer';

    footerDiv.innerHTML = `
        <div class="print-maker">
            ${nameText}: ${name || ''}
        </div>
        <div class="print-date">
            ${dateText}: ${date}
        </div>
    `;

    doc.body.appendChild(footerDiv);
}


function appendStyle(doc, printConf) {
    let newStyle = doc.createElement('style');

    newStyle.innerHTML = `
        body{
            margin: 0;
            font-size: 16px;
        }
        thead, tfoot, tr, th, td {
            page-break-inside: avoid;
        }
        .print-table {
            border-collapse:collapse;
            border:1px solid #d0d0d0;
            page-break-after: always;
            white-space: nowrap;
            width: 100%;
        }
        .print-last-table {
            page-break-after: auto;
        }
        .print-td {
            border: 1px solid #d0d0d0;
            text-align: center;
            height: 40px;
            word-break: break-all;
            padding: 0 2px;
        }
        .print-footer {
            overflow: hidden;
            width: 100%;
            margin-top: 20px;
        }
        .print-footer .print-maker {
            float: left;
        }
        .print-footer .print-date {
            float: right;
        }
        .after-table-title{
            margin-top: 50px;
        }
        .after-table-bill.print-footer{
            margin: 20px 10%;
            width: 80%;            
        }
        .print-table-head{
            display: table-header-group;
            font-weight: bold;
        }
    `;

    let cumStyle = doc.createElement('style');
    if (printConf.maxChar && printConf.maxChar !== 0) {
        cumStyle.innerHTML = `
            .print-table{
                table-layout: fixed;
            }
            .print-td{
                white-space: normal;
            }
        `
    } else {
        cumStyle.innerHTML = `
            .print-td{
                white-space: nowrap;
                width: 190px;
            }
        `
    }
    doc.body.appendChild(newStyle);
    doc.body.appendChild(cumStyle);
}