import React, { useEffect, useState } from "react";
import { paperConfig, defaultConfig } from './print-util';

function PrintConf() {
    const [paper, setPaper] = useState(defaultConfig.paper);
    const [maxCol, setMaxCol] = useState(defaultConfig.maxCol);
    const [direct, setDirect] = useState(defaultConfig.direct);
    const [margin, setMargin] = useState(defaultConfig.margin);
    const [marginTop, setMarginTop] = useState(defaultConfig.marginTop);
    const [marginRight, setMarginRight] = useState(defaultConfig.marginRight);
    const [marginBottom, setMarginBottom] = useState(defaultConfig.marginBottom);
    const [marginLeft, setMarginLeft] = useState(defaultConfig.marginLeft);
    const [maxChar, setMaxChar] = useState(defaultConfig.maxChar);

    const confirm = () => {
        chrome.storage.local.set({
            'ncchr-print-plugin-conf': JSON.stringify({
                paper,
                maxCol,
                direct,
                margin,
                marginTop,
                marginRight,
                marginBottom,
                marginLeft,
                maxChar,
            })
        })
        let bg = chrome.extension.getBackgroundPage();
        bg.print();
    }

    return (
        <div>
            <div>
                <div className="title">
                    打印设置
                </div>
                <div>
                    <div className="label">
                        每行显示列数
                    </div>
                    <div className="item-wrapper">
                        <input type="number" min="0" step="1" value={maxCol}
                            onChange={e => setMaxCol(e.target.value)} />
                    </div>
                    <div className="mome"><span class="mast">*</span>0为不分行</div>
                </div>
                <div>
                    <div className="label">
                        每行最大字数
                    </div>
                    <div className="item-wrapper">
                        <input type="number" min="0" step="1" value={maxChar}
                            onChange={e => setMaxChar(e.target.value)} />
                    </div>
                    <div className="mome"><span class="mast">*</span>0为不限制，此处为中文文字数量（1中文=2英文或数字）</div>
                </div>
                <div>
                    <div className="label">
                        纸张尺寸
                    </div>
                    <div className="item-wrapper">
                        <select value={paper} onChange={e => setPaper(e.target.value)}>
                            {paperConfig && Object.keys(paperConfig).map(option => (
                                <option value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div className={'memo'}>
                        <span className="u-mast">*</span>请手动更改打印设置中的纸张尺寸与此处保持一致
                    </div>
                </div>
                <div>
                    <div className="label">
                        打印方向
                    </div>
                    <div className="item-wrapper">
                        <select value={direct}
                            onChange={e => setDirect(e.target.value)}>
                            <option value={'landscape'}>横向</option>
                            <option value={'portrait'}>纵向</option>
                        </select>
                    </div>
                </div>
                <div>
                    <div className="label">
                        边距
                    </div>
                    <div className="item-wrapper">
                        <select value={margin}
                            onChange={e => setMargin(e.target.value)}>
                            <option value={'default'}>默认</option>
                            <option value={'none'}>无</option>
                            <option value={'min'}>最小值</option>
                            <option value={'custom'}>自定义</option>
                        </select>
                    </div>
                </div>
                <div>
                    <div className="label">
                        上边距(mm)
                    </div>
                    <div className="item-wrapper">
                        <input type="number" min="0" step="1" value={marginTop}
                            onChange={e => setMarginTop(e.target.value)} />
                    </div>
                </div>
                <div>
                    <div className="label">
                        右边距(mm)
                    </div>
                    <div className="item-wrapper">
                        <input type="number" min="0" step="1" value={marginRight}
                            onChange={e => setMarginRight(e.target.value)} />
                    </div>
                </div>
                <div>
                    <div className="label">
                        下边距(mm)
                    </div>
                    <div className="item-wrapper">
                        <input type="number" min="0" step="1" value={marginBottom}
                            onChange={e => setMarginBottom(e.target.value)} />
                    </div>
                </div>
                <div>
                    <div className="label">
                        左边距(mm)
                    </div>
                    <div className="item-wrapper">
                        <input type="number" min="0" step="1" value={marginLeft}
                            onChange={e => setMarginLeft(e.target.value)} />
                    </div>
                </div>
            </div>
            <div>
                <button onClick={confirm}>确定</button>
                <button id="cancel">取消</button>
            </div>
        </div>
    )
}

export default PrintConf;