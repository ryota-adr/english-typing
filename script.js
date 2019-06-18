let log = console.log;

var EngTyping = EngTyping || {};

EngTyping.element = {
    body: document.querySelector('body'),
    select: document.querySelector('select.textFiles'),
    textarea: document.querySelector('textarea'),
    textContainer: document.querySelector('div.textContainer'),
    button: document.querySelector('button'),
    div: {
        result: document.querySelector('div.result')
    }
};

EngTyping.bool = {
    started: false,
};

EngTyping.xml = new XMLHttpRequest();
EngTyping.xmlShowAbove = new XMLHttpRequest();
EngTyping.xmlShowBottom = new XMLHttpRequest();

//show text
EngTyping.xml.onreadystatechange = function () {
    if (EngTyping.xml.readyState === 4) {
        if (EngTyping.xml.status === 200) {
            EngTyping.element.textContainer.innerHTML = EngTyping.xml.responseText;

            //EngTyping.element.textBlock = document.querySelector('div.textBlock');
            EngTyping.data.lineHeight = Number(
                getComputedStyle(document.querySelector('div.textBlock'), null)
                    .getPropertyValue('height')
                    .replace('px', '')
            );

            EngTyping.element.textContainer.scroll(0, 0);

            //EngTyping.lazy.generator();
            EngTyping.element.textContainer.addEventListener('wheel', EngTyping.showAboveTextBlock);
            EngTyping.element.textContainer.addEventListener('wheel', EngTyping.showBottomTextBlock);

            EngTyping.element.lastTextBlock = EngTyping.element.textContainer.lastChild;
        }
    }
};
EngTyping.showText = function () {
    if (!EngTyping.bool.started) {
        EngTyping.element.button.innerHTML = 'START';

        EngTyping.cookie = {};
        let match = document.cookie.match('engtyping=(([A-Za-z0-9_\.]+?:[0-9]+,?)+)');

        EngTyping.data.fileName = EngTyping.element.select.options[EngTyping.element.select.selectedIndex].value;

        if (match) {
            let matchStr = match[1];
            matchStr = matchStr.split(',');
            matchStr.forEach(str => {
                if (str === '') {
                    return;
                }
                let splitStr = str.split(':');
                EngTyping.cookie[splitStr[0]] = splitStr[1];
            });
            if (EngTyping.data.fileName in EngTyping.cookie) {
                EngTyping.data.cookieIdx = Number(EngTyping.cookie[EngTyping.data.fileName]);
                var idx = '&idx=' + EngTyping.data.cookieIdx;
            } else {
                EngTyping.data.cookieIdx = 0;
                var idx = '';
            }
        } else {
            EngTyping.data.cookieIdx = 0;
            var idx = '';
        }

        EngTyping.xml.open("GET", 'action.php?text=' + EngTyping.data.fileName + idx, true);
        EngTyping.xml.send(null);

        EngTyping.element.button.removeEventListener('click', EngTyping.showText);
        EngTyping.element.button.addEventListener('click', EngTyping.start);
    }
};

EngTyping.element.button.addEventListener('click', EngTyping.showText);

//lazy load text
EngTyping.xmlShowAbove.onreadystatechange = function () {
    if (EngTyping.xmlShowAbove.readyState === 4) {
        if (EngTyping.xmlShowAbove.status === 200) {
            if (EngTyping.element.textContainer.querySelector('div[data-text-block="' + EngTyping.data.firstTextBlockIdx + '"]') === null) {
                EngTyping.element.textContainer.innerHTML = EngTyping.xmlShowAbove.responseText + EngTyping.element.textContainer.innerHTML;

                EngTyping.removeTextBlocks(EngTyping.data.LengthOfTextBlocks, 1);
                EngTyping.element.lastTextBlock = EngTyping.element.textContainer.lastChild;
            }
        }
    }
};

EngTyping.showAboveTextBlock = function (e) {
    if (EngTyping.bool.started) {
        e.preventDefault();
        return;
    }

    if (EngTyping.element.textContainer.scrollTop === 0 && e.deltaY <= 0) {
        EngTyping.element.firstTextBlock = EngTyping.element.textContainer.firstChild;
        EngTyping.data.firstTextBlockIdx = EngTyping.element.firstTextBlock.getAttribute('data-text-block-idx');
        EngTyping.data.firstTextBlockIdx--;

        if (EngTyping.data.firstTextBlockIdx >= 0) {
            EngTyping.xmlShowAbove.open('GET', 'action.php?file=' + EngTyping.data.fileName + '&row=' + EngTyping.data.firstTextBlockIdx + '&len=' + EngTyping.data.LengthOfTextBlocks + '&dir=-1');
            EngTyping.xmlShowAbove.send(null);
        }
    }
};

EngTyping.xmlShowBottom.onreadystatechange = function () {
    if (EngTyping.xmlShowBottom.readyState === 4) {
        if (EngTyping.xmlShowBottom.status === 200) {
            if (document.querySelector('div[data-text-block-idx="' + EngTyping.data.lastTextBlockIdx + '"]') === null) {
                EngTyping.element.textContainer.innerHTML += EngTyping.xmlShowBottom.responseText;

                EngTyping.element.lastTextBlock = EngTyping.element.textContainer.lastChild;

                EngTyping.removeTextBlocks(EngTyping.data.LengthOfTextBlocks, -1);
                EngTyping.element.firstTextBlock = EngTyping.element.textContainer.firstChild;
            }
        }
    }
}

EngTyping.showBottomTextBlock = function (e) {
    if (EngTyping.bool.started) {
        e.preventDefault();
        return;
    }

    if (EngTyping.element.textContainer.scrollTop + EngTyping.element.textContainer.clientHeight === EngTyping.element.textContainer.scrollHeight && e.deltaY > 0) {
        EngTyping.data.lastTextBlockIdx = EngTyping.element.lastTextBlock.getAttribute('data-text-block-idx');
        EngTyping.data.lastTextBlockIdx++;

        EngTyping.xmlShowBottom.open('GET', 'action.php?file=' + EngTyping.data.fileName + '&row=' + EngTyping.data.lastTextBlockIdx + '&len=' + EngTyping.data.LengthOfTextBlocks + '&dir=1');
        EngTyping.xmlShowBottom.send(null);
    }
}

//start typing
EngTyping.time = {}
EngTyping.data = {
    LengthOfTextBlocks: 5
};

EngTyping.start = function () {
    if (EngTyping.element.textContainer.innerHTML && !EngTyping.bool.started) {
        EngTyping.element.button.removeEventListener('click', EngTyping.showText);

        EngTyping.element.button.innerHTML = 'FINISH';
        EngTyping.element.div.result.innerHTML = '';
        EngTyping.element.textarea.classList.remove('invalid');

        EngTyping.time.start = Date.now();
        EngTyping.bool.started = true;
        EngTyping.element.textarea.disabled = false;
        EngTyping.bool.complete = false;

        EngTyping.data.startPos = Math.ceil(EngTyping.element.textContainer.scrollTop / EngTyping.data.lineHeight) * EngTyping.data.lineHeight;
        EngTyping.element.textContainer.scroll(0, EngTyping.data.startPos);

        EngTyping.element.topTextBlock = EngTyping.element.textContainer.firstChild;
        EngTyping.data.topTextBlockIdx = EngTyping.element.topTextBlock.getAttribute('data-text-block-idx');

        EngTyping.element.currentTextBlock = document.querySelector(
            'div.textBlock[data-text-block-idx="' +
            (Math.ceil(EngTyping.element.textContainer.scrollTop / EngTyping.data.lineHeight) + Number(EngTyping.data.topTextBlockIdx)) +
            '"]'
        ).firstChild;

        EngTyping.data.currentInput = '';
        EngTyping.data.currentInputRegex = '';

        EngTyping.data.currentLine = EngTyping.element.currentTextBlock.innerHTML;

        if (EngTyping.data.currentLine.indexOf('⏎') !== -1) {
            EngTyping.bool.lastCharIsReturnChar = true;
            EngTyping.data.currentLineWithoutReturnChar = EngTyping.data.currentLine.replace('⏎', '');
        } else {
            EngTyping.bool.lastCharIsReturnChar = false;
            EngTyping.data.currentLineWithoutReturnChar = null;
        }

        EngTyping.data.currentTextBlockIdx = Number(EngTyping.element.currentTextBlock.parentElement.getAttribute('data-text-block-idx'));

        EngTyping.data.typedNum = 0;
        EngTyping.data.validTyping = 0;
        EngTyping.data.invalidTyping = 0;

        EngTyping.element.button.removeEventListener('click', EngTyping.start);
        EngTyping.element.button.addEventListener('click', EngTyping.finish);

        EngTyping.data.LengthOfTextBlocks = 1;

        EngTyping.element.textarea.focus();
        EngTyping.element.textarea.value = '';
    }
};

//finish typing
EngTyping.finish = function () {
    if (EngTyping.bool.started) {
        EngTyping.element.button.innerHTML = 'SHOW';
        EngTyping.bool.started = false;
        EngTyping.element.textarea.disabled = true;
        EngTyping.time.finish = Date.now();
        EngTyping.time.diff = EngTyping.time.finish - EngTyping.time.start;

        EngTyping.element.div.result.innerHTML =
            '<div>時間：' + (EngTyping.time.diff / 1000) + '秒</div>' +
            '<div>正：' + EngTyping.data.validTyping + '回, ' +
            '誤：' + EngTyping.data.invalidTyping + '回, ' +
            '計：' + EngTyping.data.typedNum + '回</div>' +
            '<div>正/秒：' + String(EngTyping.data.validTyping / (EngTyping.time.diff / 1000)).slice(0, -13) + '回</div>';

        EngTyping.element.button.removeEventListener('click', EngTyping.finish);
        EngTyping.element.button.addEventListener('click', EngTyping.showText);

        //write cookie
        if (!EngTyping.bool.complete) {
            EngTyping.cookie[EngTyping.data.fileName] = EngTyping.data.currentTextBlockIdx;
            let cookieStr = 'engtyping=';
            for (fileName in EngTyping.cookie) {
                cookieStr += fileName + ':' + EngTyping.cookie[fileName] + ',';
            }
            cookieStr += '; max-age=' + (3600 * 24 * 31);
            document.cookie = cookieStr;
        }

        EngTyping.element.textContainer.addEventListener('wheel', EngTyping.showAboveTextBlock);

        EngTyping.data.LengthOfTextBlocks = 5;
    }
};

//typing
EngTyping.data.noCount = ['Shift', 'Control', 'Alphanumeric', 'Tab', 'Hiragana', 'Hankaku', 'Zenkaku', 'Escape', 'Process', 'Alt', 'NonConvert', 'Meta', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'AudioVolumeMute', 'AudioVolumeDown', 'AudioVolumeUp', 'F5', 'Home', 'End', 'PageUp', 'PageDown', 'Delete', 'Insert'];

EngTyping.data.escape = ['(', ')', '|', '^', '.', '[', ']', '{', '}', '$', '/', '+', '*', '\\', '?'];

EngTyping.element.body.addEventListener('keydown', function (e) {
    if (EngTyping.bool.started) {
        if (e.shiftKey && e.ctrlKey && e.key === 'I') {
            return;
        }

        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            return;
        }

        if (EngTyping.data.noCount.includes(e.key)) {
            e.preventDefault();
            return;
        }

        if (EngTyping.bool.lastCharIsReturnChar && EngTyping.data.currentInput === EngTyping.data.currentLineWithoutReturnChar) {
            if (e.key === 'Enter') {
                e.preventDefault();

                EngTyping.data.typedNum++;
                EngTyping.data.validTyping++;

                EngTyping.toNextTextBlock();

                EngTyping.data.lastTextBlockIdx = EngTyping.element.lastTextBlock.getAttribute('data-text-block-idx');
                EngTyping.data.lastTextBlockIdx++;

                EngTyping.xmlShowBottom.open('GET', 'action.php?file=' + EngTyping.data.fileName + '&row=' + EngTyping.data.lastTextBlockIdx + '&len=' + EngTyping.data.LengthOfTextBlocks + '&dir=1');
                EngTyping.xmlShowBottom.send(null);
            } else {
                EngTyping.data.currentInput += e.key;
                EngTyping.element.textarea.classList.add('invalid');
                EngTyping.data.typedNum++;
                EngTyping.data.invalidTyping++;
            }
        } else { //not new line char
            if (e.key === 'Enter') {
                e.preventDefault();

                EngTyping.data.typedNum++;
                EngTyping.data.invalidTyping++;

                return;
            }

            if (e.key === 'Backspace') {
                if (EngTyping.data.currentInput === '') {
                    return;
                }

                EngTyping.data.currentInput = EngTyping.data.currentInput.slice(0, EngTyping.data.currentInput.length - 1);

                if (EngTyping.data.currentInputRegex.slice(-2, -1) === '\\') {
                    EngTyping.data.currentInputRegex = EngTyping.data.currentInputRegex.slice(0, EngTyping.data.currentInputRegex.length - 2);
                } else {
                    EngTyping.data.currentInputRegex = EngTyping.data.currentInputRegex.slice(0, EngTyping.data.currentInputRegex.length - 1);
                }

                if (EngTyping.data.currentInput === '') {
                    EngTyping.element.textarea.classList.remove('invalid');
                }
            } else {
                EngTyping.data.currentInput += e.key;
                if (EngTyping.data.escape.includes(e.key)) {
                    EngTyping.data.currentInputRegex += '\\' + e.key;
                } else {
                    EngTyping.data.currentInputRegex += e.key;
                }
            }

            if (EngTyping.data.currentLine.match('^' + EngTyping.data.currentInputRegex)) {
                if (EngTyping.data.currentInput.length === EngTyping.data.currentLine.length) {
                    e.preventDefault();
                    EngTyping.toNextTextBlock();

                    if (EngTyping.bool.complete) {
                        EngTyping.finish();
                        EngTyping.element.textContainer.removeEventListener('wheel', EngTyping.showAboveTextBlock);
                        EngTyping.element.textContainer.removeEventListener('wheel', EngTyping.showBottomTextBlock);
                        return;
                    }

                    EngTyping.data.lastTextBlockIdx = EngTyping.element.lastTextBlock.getAttribute('data-text-block-idx');
                    EngTyping.data.lastTextBlockIdx++;

                    EngTyping.xmlShowBottom.open('GET', 'action.php?file=' + EngTyping.data.fileName + '&row=' + EngTyping.data.lastTextBlockIdx + '&len=' + EngTyping.data.LengthOfTextBlocks + '&dir=1');
                    EngTyping.xmlShowBottom.send(null);
                } else {
                    EngTyping.element.textarea.classList.remove('invalid');
                }

                EngTyping.data.typedNum++;
                EngTyping.data.validTyping++;
            } else {
                EngTyping.data.typedNum++;
                EngTyping.data.invalidTyping++;
                EngTyping.element.textarea.classList.add('invalid');
            }
        }
    }
});

EngTyping.scrollCurrentTextBlock = function () {
    EngTyping.element.textContainer.scroll(0, EngTyping.element.textContainer.querySelector('div[data-text-block-idx="' + EngTyping.data.currentTextBlockIdx + '"]').offsetTop - 38);
}



EngTyping.toNextTextBlock = function () {
    EngTyping.element.currentTextBlock = document.querySelector(
        'div[data-text-block-idx="' +
        (++EngTyping.data.currentTextBlockIdx) +
        '"]'
    ).firstChild;

    if (EngTyping.element.currentTextBlock === null) {
        EngTyping.bool.complete = true;
        return;
    }

    EngTyping.data.currentLine = EngTyping.element.currentTextBlock.innerHTML;

    if (EngTyping.data.currentLine.indexOf('⏎') !== -1) {
        EngTyping.bool.lastCharIsReturnChar = true;
        EngTyping.data.currentLineWithoutReturnChar = EngTyping.data.currentLine.replace('⏎', '');
    } else {
        EngTyping.bool.lastCharIsReturnChar = false;
        EngTyping.data.currentLineWithoutReturnChar = null;
    }

    EngTyping.element.textarea.value = '';
    EngTyping.data.currentInput = '';
    EngTyping.data.currentInputRegex = '';
}

EngTyping.stopScroll = function (e) {
    e.preventDefault();
}

EngTyping.removeTextBlocks = function (length, direction) {
    for (let i = 0; i < length; i++) {
        if (direction < 0) {
            EngTyping.element.textContainer.firstChild.remove();
        } else {
            EngTyping.element.textContainer.lastChild.remove();
        }
    }
}
