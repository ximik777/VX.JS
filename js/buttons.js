function createButton(el, onClick) {
    el = ge(el);
    if (!el || el.btnevents) return;
    if (hasClass(el, 'flat_button')) {
        if (isFunction(onClick)) {
            el.onclick = onClick.pbind(el);
        }
        return;
    }
    var p = el.parentNode;
    if (hasClass(p, 'button_blue') || hasClass(p, 'button_gray')) {
        if (isFunction(onClick)) {
            el.onclick = onClick.pbind(el);
        }
        return;
    }
    var hover = false;
    addEvent(el, 'click mousedown mouseover mouseout', function (e) {
        if (hasClass(p, 'locked')) return;
        switch (e.type) {
            case 'click':
                if (!hover) return;
                el.className = 'button_hover';
                onClick(el);
                return cancelEvent(e);
                break;
            case 'mousedown':
                el.className = 'button_down';
                break;
            case 'mouseover':
                hover = true;
                el.className = 'button_hover';
                break;
            case 'mouseout':
                el.className = 'button';
                hover = false;
                break;
        }
    });
    el.btnevents = true;
}

function lockButton(el) {
    if (!(el = ge(el))) return;
    if (hasClass(el, 'flat_button')) {
        lockFlatButtonNew(el);
        return;
    }
    var btn = (el.tagName.toLowerCase() == 'button'),
        d = btn ? 0 : ((browser.msie6 || browser.msie7) ? 2 : 4),
        tEl = btn ? el : geByClass1('file_button_text', el);
    if (!btn && !hasClass(el, 'file_button') || buttonLocked(el)) return;
    var lock = ce('span', {
        className: 'button_lock'
    });
    el.parentNode.insertBefore(lock, el);
    el['old_width'] = el.style.width;
    el['old_height'] = el.style.height;
    var s = getSize(el.parentNode);
    setStyle(el, {
        width: s[0] - d,
        height: s[1] - d
    });
    if (browser.msie6 || browser.msie7) {
        tEl['old_html'] = tEl.innerHTML;
        tEl.innerHTML = '';
    } else {
        tEl.style.textIndent = '-9999px';
    }
}

function unlockButton(el) {
    if (!(el = ge(el))) return;
    if (hasClass(el, 'flat_button')) {
        unlockFlatButtonNew(el);
        return;
    }
    var lock = geByClass1('button_lock', el.parentNode, 'span'),
        btn = (el.tagName.toLowerCase() == 'button'),
        tEl = btn ? el : geByClass1('file_button_text', el);
    if (!lock) return;
    el.parentNode.removeChild(lock);
    el.style.width = el['old_width'];
    el.style.height = el['old_height'];
    if (browser.msie6 || browser.msie7) tEl.innerHTML = tEl['old_html'];
    tEl.style.textIndent = '';
}

function buttonLocked(el) {
    if (!(el = ge(el))) return;
    if (hasClass(el, 'flat_button')) {
        return isButtonLocked(el);
    }
    return geByClass1('button_lock', el.parentNode, 'span') ? true : false;
}

function lockFlatButton(el) {
    if (!el || el.tagName.toLowerCase() != 'button' || isButtonLocked(el)) return;
    addClass(el, 'flat_btn_lock');
    el.innerHTML = '<span class="flat_btn_h">' + el.innerHTML + '</span>';
}

function unlockFlatButton(el) {
    if (!isButtonLocked(el)) return;
    el.innerHTML = el.firstChild.innerHTML;
    removeClass(el, 'flat_btn_lock');
}

function isButtonLocked(el) {
    if (!(el = ge(el))) return;
    return hasClass(el, 'flat_btn_lock');
}


function disableButton(el, disable) {
    if (!(el = ge(el)) || el.tagName.toLowerCase() !== 'button') return;
    if (hasClass(el, 'flat_button')) {
        return disableFlatButton(el, disable);
    }
    toggleClass(el.parentNode, 'button_disabled', !!disable);
    if (disable) {
        el.parentNode.insertBefore(ce('button', {
            innerHTML: el.innerHTML,
            className: 'disabled'
        }), el);
        hide(el);
    } else {
        var disabledEl = geByClass1('disabled', el.parentNode);
        if (disabledEl) re(disabledEl);
        show(el);
    }
}

function disableFlatButton(el, disable) {
    if (!(el = ge(el)) || el.tagName.toLowerCase() !== 'button') return;

    if (disable) {
        el.parentNode.insertBefore(ce('button', {
            innerHTML: el.innerHTML,
            className: el.className + ' button_disabled'
        }, {
            width: getSize(el)[0] + 'px'
        }), el);
        hide(el);
    } else {
        var disabledEl = domPS(el);
        if (disabledEl && hasClass(disabledEl, 'button_disabled')) re(disabledEl);
        show(el);
    }
}

function lockFlatButtonNew(el) {
    if (!(el = ge(el)) || el.tagName.toLowerCase() !== 'button') return;
    el.parentNode.insertBefore(ce('button', {
        innerHTML: '<span class="flat_btn_h">' + el.innerHTML + '</span>',
        className: el.className + ' flat_btn_lock'
    }, {
        width: getSize(el)[0] + 'px'
    }), el);
    hide(el);
}

function unlockFlatButtonNew(el) {
    if (!(el = ge(el)) || el.tagName.toLowerCase() !== 'button' || !isButtonLockedNew(el)) return;
    var disabledEl = domPS(el);
    if (disabledEl && hasClass(disabledEl, 'flat_btn_lock')) re(disabledEl);
    show(el);
}

function isButtonLockedNew(el) {
    if (!(el = ge(el)) || el.tagName.toLowerCase() !== 'button') return;
    var disabledEl = domPS(el);
    return (disabledEl && hasClass(disabledEl, 'flat_btn_lock'));
}