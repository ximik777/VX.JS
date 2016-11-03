createUiClass('MessageBox', {
    defaultOptions: {
        type: 'MESSAGE',        // "MESSAGE" || "POPUP"
        hideOnOutClick: false,
        title: false,
        width: 410,
        dark: false,
        height: 'auto',
        bodyStyle: '',
        flat_buttons: true,
        closeButton: false,     // AntanubiS - 'X' close button in the caption.
        fullPageLink: '',       // If is set - 'box'-like button in the caption.
        returnHidden: true,     // AntanubiS - When hide - return previously hidden box.
        closeEsc: true,
        onShow: function () {
        },
        onHide: function () {
        },
        onLoadError: function () {
        },
        onLoad: false
    },
    beforeInit: function () {
        if (!window._message_boxes) {
            window._message_box_guid = 0;
            window._message_boxes = [];
            window._message_box_shown = 0;
            window._doc_block_timeout = null;
            window._doc_blocked = false;
        }
        this.guid = (++_message_box_guid);
    },
    bgLayer: function () {
        if (!ge('box_layer_bg')) {
            window.box_layer_bg = ce('div', {
                id: 'box_layer_bg',
                className: this.options.dark ? 'dark' : ''
            }, {
                height: getSize(document)[1]
            });
            addEvent(window, 'resize', function () {
                box_layer_bg.style.height = getSize(document)[1] + 'px';
            });
            onDomReady(function () {
                bodyNode.appendChild(box_layer_bg);
            });
        }

        if (!ge('layer_wrap')) {
            window.layer_wrap = ce('div', {
                id: 'layer_wrap'
            }, {
                height: windowHeight()
            });
            addEvent(window, 'resize', function () {
                layer_wrap.style.height = windowHeight() + 'px';
            });
            onDomReady(function () {
                bodyNode.appendChild(layer_wrap);
            });
        }
    },
    initOptions: function (options) {
        this.options = extend({}, this.defaultOptions, options);
        this.options.type = this.options.type == 'POPUP' ? 'POPUP' : 'MESSAGE';
    },
    init: function (options) {
        this.buttonsCount = 0;
        this.boxContainer = null;
        this.boxLayout = null;
        this.boxTitle = null;
        this.boxBody = null;
        this.boxControls = null;
        this.closeButton = null;
        this.fullPageLink = null;
        this.isVisible = false;
        this.hiddenBox = null;
        this.closeButton = null;
        this.fullPageLink = null;
        this.bgLayer();
    },
    setCloseButton: function () {
        if (!this.boxContainer || this.closeButton) return false;
        var self = this;
        this.closeButton = ce('div', {className: 'box_x_button'});
        if (this.fullPageLink) {
            this.boxTitle.parentNode.insertBefore(this.closeButton, this.fullPageLink);
        } else {
            this.boxTitle.parentNode.insertBefore(this.closeButton, this.boxTitle);
        }
        addEvent(this.closeButton, 'click', function () {
            self.hide()
        });
        return true;
    },
    setFullPageLink: function () {
        if (!this.boxContainer || this.options.fullPageLink == '') return false;
        if (this.fullPageLink) {
            this.fullPageLink.href = this.options.fullPageLink;
            return true;
        }
        this.fullPageLink = ce('a', {className: 'box_full_page_link', href: this.options.fullPageLink});
        this.boxTitle.parentNode.insertBefore(this.fullPageLink, this.boxTitle);
        return true;
    },
    initDOM: function (options) {
        var opt = this.options;
        this.boxContainer = ce('div', {
            className: 'popup_box_container',
            innerHTML: '' +
            '<div class="box_layout">' +
            '<div class="box_title_wrap cf">' +
            '<div class="box_title"></div>' +
            '</div>' +
            '<div class="box_body box_progress" style="' + opt.bodyStyle + '"></div>' +
            '<div class="box_controls_wrap">' +
            '<div class="box_controls cf"></div>' +
            '</div>' +
            '</div>'
        }, {
            display: 'none'
        });

        this.boxLayout = geByClass1('box_layout', this.boxContainer);
        this.boxTitle = geByClass1('box_title', this.boxContainer);
        this.boxBody = geByClass1('box_body', this.boxContainer);
        this.boxControls = geByClass1('box_controls', this.boxContainer);

        if (!window.layer_wrap) {
            return;
        }

        window.layer_wrap.appendChild(this.boxContainer);

        if (opt.type == 'MESSAGE') {
            if (opt.closeButton) {
                this.setCloseButton();
            }
            if (opt.fullPageLink) {
                this.setFullPageLink();
            }
        }
        this.refreshBox();
    },
    refreshBox: function () {
        var self = this,
            opt = this.options,
            hide = function () {
                self.hide();
            },
            closeEsc = function (e) {
                if (e.keyCode == KEY.ESC) self.hide();
            };
        this.boxTitle.innerHTML = opt.title;
        this.boxContainer.style.width = typeof (opt.width) == 'string' ? opt.width : opt.width + 'px';
        this.boxContainer.style.height = typeof (opt.height) == 'string' ? opt.height : opt.height + 'px';
        removeClass(this.boxContainer, 'box_no_controls');
        removeClass(this.boxContainer, 'message_box');
        removeEvent(layer_wrap, 'click', hide);
        removeEvent(document, 'keydown', closeEsc);
        if (opt.hideOnOutClick) {
            addEvent(layer_wrap, 'click', function(e){
                if(getTarget(e).id == 'layer_wrap'){
                    hide();
                }
            });
        }
        if (opt.closeEsc) {
            addEvent(document, 'keydown', closeEsc);
        }
        addClass(this.boxContainer, opt.type == 'POPUP' ? 'box_no_controls' : 'message_box');
    },
    removeButtons: function () {
        var buttons = [], self = this;
        this.buttonsCount = 0;
        each(this.boxControls.childNodes, function (i, x) {
            if (x) {
                removeEvent(x);
                buttons.push(x);
            }
        });
        each(buttons, function () {
            self.boxControls.removeChild(this);
        });
        return this;
    },
    addButton: function (options) {
        this.buttonsCount++;
        options = options || {};
        options = extend({
            label: 'Button' + this.buttonsCount,
            style: this.options.flat_buttons ? 'flat_button' : 'button_blue'
        }, options);


        if (this.options.flat_buttons) {
            if (options.style == 'button_no') options.style = 'flat_button secondary';
            if (options.style == 'button_yes') options.style = 'flat_button';
            var button = ce('button', {
                id: 'button' + this.guid + '_' + this.buttonsCount,
                innerHTML: options.label,
                className: options.style + ' ' + (options.left ? 'fl' : 'fr')
            });
            this.boxControls.appendChild(button);
            createButton(button, options.onClick);
            return button;
        } else {
            if (options.style == 'button_no') options.style = 'button_gray';
            if (options.style == 'button_yes') options.style = 'button_blue';
            var buttonWrap = ce('div', {
                className: options.style + ' ' + (options.left ? 'fl' : 'fr'),
                innerHTML: '<button id="button' + this.guid + '_' + this.buttonsCount + '">' + options.label + '</button>'
            });
            this.boxControls.appendChild(buttonWrap);
            createButton(buttonWrap.firstChild, options.onClick);
            return buttonWrap.firstChild;
        }
    },
    addControlsText: function (text) {
        text = text || '';
        var textWrap = ce('div', {
            className: 'controls_wrap',
            innerHTML: text
        });
        this.boxControls.appendChild(textWrap);
        return textWrap;
    },
    content: function (html) {
        html = html || '';
        this.boxBody.innerHTML = html;
        removeClass(this.boxBody, 'box_progress');
        this.refreshCoord();
        return this;
    },
    loadContent: function (url, params, evaluate, loader_style, noloader) {
        var st = loader_style ? loader_style : '';
        if (!noloader) this.boxBody.innerHTML = '<div class="box_loader" style="' + st + '"></div>';
        params = params || {};
        var self = this;

        ajax.post(url, params, function (responseText, isFail) {

            if (isFail) {
                self.onLoadError('Request error occured.');
            } else {
                if (evaluate) {
                    try {
                        var result = eval('(' + responseText + ')');
                        self.boxBody.innerHTML = result.html ? result.html : '';
                        if (result.script) window.execScript ? window.execScript(result.script) : eval.call(window, result.script);
                    } catch (e) {
                        return self.onLoadError(responseText);
                    }
                } else {
                    self.boxBody.innerHTML = responseText;
                }
                self.refreshCoord();
                removeClass(self.boxBody, 'box_progress');
                if (isFunction(self.options.onLoad)) self.options.onLoad(responseText);
            }

        });
        return this;
    },
    onLoadError: function (text) {
        this.boxBody.innerHTML = 'Error: ' + text;
        this.removeButtons();
        this.addButton({
            label: getLang('global-close'),
            onClick: this.hide
        });
        removeClass(this.boxBody, 'box_progress');
        this.refreshCoord();
        if (isFunction(this.options.onLoadError)) this.options.onLoadError(text);
    },
    show: function () {
        if (this.isVisible) return;
        this.isVisible = true;
        this.hiddenBox = 0;
        if (_message_box_shown && _message_boxes[_message_box_shown].isVisible) {
            var box = _message_boxes[_message_box_shown];
            if (this.options.returnHidden) {
                this.hiddenBox = _message_box_shown;
                box.hideContainer();
            } else {
                box.hide();
            }
        }

        if (!_message_box_shown) {
            box_layer_bg.className = this.options.dark ? 'dark' : '';
            bodyNode.style.overflow = 'hidden';
            htmlNode.style.overflow = 'hidden';
            addClass(bodyNode, 'layers_shown');
            clearTimeout(_doc_block_timeout);
            if (!_doc_blocked) {
                _doc_blocked = true;
            }
        }
        show(this.boxContainer);
        this.refreshCoord();
        _message_box_shown = this.guid;
        if (this.options.onShow) this.options.onShow();
        return this;
    },
    hide: function () {
        if (!this.isVisible) return;
        this.isVisible = false;
        hide(this.boxContainer);
        var showHidden = false;
        if (this.options.returnHidden && this.hiddenBox) {
            _message_boxes[this.hiddenBox].showContainer();
            _message_box_shown = this.hiddenBox;
            showHidden = true;
        }
        if (!showHidden) {
            _message_box_shown = 0;
            bodyNode.style.overflow = 'auto';
            htmlNode.style.overflow = 'auto';
            removeClass(bodyNode, 'layers_shown');
            clearTimeout(_doc_block_timeout);
            if (_doc_blocked) {
                _doc_block_timeout = setTimeout(function () {
                    _doc_blocked = false;
                }, 50);
            }
        }
        if (this.options.onHide) this.options.onHide();
        return this;
    },
    setOptions: function (newOptions) {
        this.options = extend(this.options, newOptions);
        var self = this;
        if ("bodyStyle" in newOptions) {
            var items = this.options.bodyStyle.split(';');
            for (var i = 0; i < items.length; ++i) {
                var name_value = items[i].split(':');
                if (name_value.length > 1 && name_value[0].length) {
                    self.boxBody.style[trim(name_value[0])] = trim(name_value[1]);
                    if (self.boxBody.style.setProperty) {
                        self.boxBody.style.setProperty(trim(name_value[0]), trim(name_value[1]), '');
                    }
                }
            }
        }
        if (this.options.closeButton) this.setCloseButton();
        if (this.options.fullPageLink) this.setFullPageLink();
        this.refreshBox();
        this.refreshCoord();
        return this;
    },
    hideContainer: function () {
        this.isVisible = false;
        hide(this.boxContainer);
    },
    showContainer: function () {
        this.isVisible = true;
        show(this.boxContainer);
    },
    refreshCoord: function () {
        var w_height = windowHeight(),
            containerSize = getSize(this.boxContainer)[1],
            scroll = getScroll()[1];
        this.boxContainer.style.marginTop = (w_height < containerSize ? 40 : (w_height - containerSize) / 3) + 'px';
        ge('layer_wrap').style.top = scroll + 'px';
    },
    afterInit: function () {
        _message_boxes[this.guid] = this;
    }
});
function getShownBox() {
    try {
        var b = _message_boxes[_message_box_shown];
        return (b && b.isVisible) ? b : false;
    } catch (e) {
        return false;
    }
}
// Extends MessageBox
function AlertBox(title, text, callback, options) {
    var aBox = new MessageBox({
        title: title
    });

    if (typeof options == 'object') aBox.setOptions(options);
    else options = {};
    aBox.removeButtons();

    if (options.boxType == 'CONFIRM') {
        aBox.addButton({
            label: options.no || getLang('global-no'),
            style: 'button_no',
            onClick: function () {
                aBox.hide();
            }
        });
        aBox.addButton({
            label: options.yes || getLang('global-yes'),
            onClick: function () {
                if (isFunction(callback) && callback() === false) return;
                aBox.hide();
            }
        });
    } else {
        aBox.addButton({
            label: options.no || getLang('global-close'),
            onClick: function () {
                aBox.hide();
                if (isFunction(callback))callback();
            }
        });
    }
    return aBox.content(text).show();
}

function ConfirmBox(title, text, callback, options) {
    options = options || {};
    options = extend({
        boxType: 'CONFIRM'
    }, options);
    return AlertBox(title, text, callback, options);
}

function Popup(text, options) {
    options = extend({
        type: 'POPUP',
        width: 420,
        dark: true
    }, options);

    var box = new MessageBox(options);
    box.content(text);
    box.show();
}

var winBoxes = {};
function showBox(name, url, query, lnk, reload, params, files) {
    if (typeof lnk == 'object') {
        reload = lnk.reload;
        params = lnk.params;
        files = lnk.files;
        lnk = lnk.href;
    }
    if (lnk && window.event && (window.event.which == 2 || window.event.button == 1)) {
        return true;
    }
    params = extend({
        title: getLang('global-loading')
    }, params);
    if (!winBoxes[name]) {
        winBoxes[name] = new MessageBox(params);
        reload = true;
        if (files) {
            for (var i in files) {
                if (/\.css/i.test(files[i])) {
                    addCss(files[i]);
                } else if (/\.js/i.test(files[i])) {
                    attachScript('script' + i, files[i]);
                }
            }
        }
    } else if (reload) {
        winBoxes[name].setOptions(params);
    }
    if (reload) {
        winBoxes[name].removeButtons();
        winBoxes[name].addButton({
            label: getLang('global-close'),
            onClick: function () {
                winBoxes[name].hide();
            }
        });
        winBoxes[name].loadContent(url, query, false);
    }
    winBoxes[name].show();
    return false;
}

var balloon_global_permit = false;
function showBalloonBox(message, options) {
    options = extend({
        width: 240,
        onHide: undefined,
        onConfirm: undefined,
        center: false,
        left: false,
        timeout: 5000,
        permit: undefined,
        check_global_permit: true
    }, options);

    var balloon = ce('div', {
        className: 'result_balloon_item_fly_area cf' + (options.center ? ' result_balloon_center' : ''),
        innerHTML: '<div style="width: ' + options.width + 'px" class="result_balloon_item cf">' +
        '<div class="result_balloon_item_message fl" style="width: ' + (options.onConfirm ? (options.width - 20) + 'px' : 'auto') + '">' + message + '</div>' +
        '<div class="result_balloon_confirm_button fr"></div>' +
        '</div>'
    }), wrap, top = 0, _fadeOut = function (force) {
        force = !!(force);
        setTimeout(function () {
            if ((isFunction(options.permit) && !options.permit()) || (options.check_global_permit && balloon_global_permit && !force)) {
                _fadeOut();
                return;
            }
            animate(balloon, options.center ? {top: top - 10, opacity: 0} : {
                marginTop: -10,
                opacity: 0
            }, 200, function () {
                re(balloon);
                if (isFunction(options.onHide)) {
                    options.onHide();
                }
            });
        }, force ? 0 : options.timeout);
    };

    if (options.center) {
        wrap = bodyNode;
    } else {
        var id = 'result_balloon_wrap_' + (options.left ? 'left' : 'right');
        wrap = ge(id);
        if (!wrap) {
            wrap = ce('div', {id: id});
            addEvent(wrap, 'mouseover mouseout', function (e) {
                balloon_global_permit = e.type == 'mouseover';
            });
            bodyNode.appendChild(wrap);
        }
    }
    wrap.appendChild(balloon);

    if (options.center) {
        var ws = windowSize(), bs = getSize(balloon);
        top = ws[1] / 3 - bs[1] / 2;
        setStyle(balloon, {left: ws[0] / 2 - bs[0] / 2, top: top});
    }

    animate(balloon, options.center ? {top: top - 5, opacity: 1} : {marginTop: 0, opacity: 1}, 300);

    if (isFunction(options.onConfirm)) {
        options.timeout = 0;
        options.onHide = options.onConfirm;
        var confirm_button = geByClass1('result_balloon_confirm_button', balloon);
        confirm_button.style.display = 'block';
        addEvent(confirm_button, 'click', function () {
            _fadeOut(true);
        });
    } else {
        _fadeOut();
    }
}

/* Migrate */
function showDoneBox(message, options) {
    options = extend({center: true}, options);

    if (options.w) options.width = options.w;
    if (options.out) options.timeout = options.out;
    if (options.callback) options.onHide = options.callback;

    showBalloonBox(message, options);
}

function showBandBox(message, options) {
    options = extend({}, options);

    if (options.w) options.width = options.w;
    if (options.out) options.timeout = options.out;
    if (options.callback) options.onHide = options.callback;

    showBalloonBox(message, options);
}

MESSAGE_ERROR = 'error';
MESSAGE_SUCCESS = 'success';
MESSAGE_INFO = 'info';
MESSAGE_NOTIFY = MESSAGE_INFO;
MESSAGE_CONFIRM = 'confirm';


function showMessage(text, message_type, options) {
    message_type = message_type || MESSAGE_ERROR;
    options = extend({width: 240}, options);

    var message = '<div class="balloon_message_box cf">' +
        '<div class="message_icon message_type_' + message_type + ' fl"></div>' +
        '<div class="message_text fl" style="width:' + (options.width - 50) + 'px">' + text + '</div>' +
        '</div>';

    showBalloonBox(message, options);
}