import React, { useEffect, useState } from "react";
import renderXlsx from './output';

function MainPage() {
    const [text, setText] = useState('');
    let title = '',
        mutleHeadFlag = false,
        header = [],
        body = [],
        maker = "",
        date = "";


    useEffect(() => {
        chrome.storage.local.get('ncchr-print-plugin-data', function (text) {
            setText(text['ncchr-print-plugin-data']);
            let htmlStr = text['ncchr-print-plugin-data'];
            analyHtmlStr(htmlStr);
            renderXlsx({
                title,
                mutleHeadFlag,
                header,
                body,
                maker,
                date
            })
        })
    }, [])

    const analyHtmlStr = (str) => {
        if (!str) return;
        const el = document.createElement('div');
        el.innerHTML = str;
        title = el.querySelector('h3').innerText;
        let tables = el.querySelectorAll('table');
        mutleHeadFlag = !!el.querySelector('.print-table-head');
        console.log(el.querySelector('.print-table-head'));
        tables.forEach(tableItem => {
            if (!mutleHeadFlag) {
                let trs = tableItem.querySelectorAll('tr');
                trs.forEach((trItem, index) => {
                    let tds = trItem.querySelectorAll('td');
                    let temp = [];
                    tds.forEach(tdItem => {
                        temp.push(tdItem.innerText)
                    });
                    if (index === 0) {
                        header = header.concat(temp)
                    } else {
                        if (!body[index-1]) {
                            body[index-1] = []
                        }
                        body[index-1] = body[index-1].concat(temp)
                    }
                })
            } else {
                let headerTrs = tableItem.querySelectorAll('.print-table-head');
                let firstHeadTds = headerTrs[0].querySelectorAll('td');
                let secondHeadTds = [].slice.call(headerTrs[1].querySelectorAll('td'));
                firstHeadTds.forEach(tdItem => {
                    let colspan = tdItem.getAttribute('colspan');
                    if (Number(colspan) > 1) {
                        let lastHead = header[header.length - 1];
                        if (Array.isArray(lastHead) && lastHead[0] === tdItem.innerText) {
                            let subHead = secondHeadTds.splice(0, Number(colspan)).map(item => item.innerText);
                            lastHead[1] = lastHead[1].concat(subHead);
                        } else {
                            let subHead = secondHeadTds.splice(0, Number(colspan)).map(item => item.innerText);
                            header.push([tdItem.innerText, subHead]);
                        }
                    } else {
                        header.push(tdItem.innerText)
                    }
                })
                let trs = tableItem.querySelectorAll('.print-tr:not(.print-table-head)');
                trs.forEach((trItem, index) => {
                    let tds = trItem.querySelectorAll('td');
                    let temp = [];
                    tds.forEach(tdItem => {
                        temp.push(tdItem.innerText)
                    });
                    if (!body[index]) {
                        body[index] = []
                    }
                    body[index] = body[index].concat(temp)
                })
            }
        });
        maker = el.querySelector('.print-maker').innerText.trim();
        date = el.querySelector('.print-date').innerText.trim();
    }

    return (
        <div dangerouslySetInnerHTML={{ __html: text }} ></div>
    )
}

export default MainPage;