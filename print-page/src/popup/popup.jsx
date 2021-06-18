import React, { useEffect, useState } from "react";
import PrintConf from './printConf';

function Popup() {
    const [isPrint, setIsPrint] = useState(false);

    const output = () => {
        let bg = chrome.extension.getBackgroundPage();
        bg.output();
    }

    return (
        <div>
            {!isPrint && <div>
                <button onClick={() => setIsPrint(true)}>打印</button>
                <button onClick={output}>输出</button>
            </div>}
            {
                isPrint && <PrintConf />
            }
        </div>
    )
}

export default Popup;