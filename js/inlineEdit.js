var curInlineEdit = false;
// if (!window.inlineOnEvent) {
//     window.inlineOnEvent = function (e) {
//         if (!curInlineEdit) return;
//         if (e.type == 'mousedown') {
//             var outside = true;
//             var t = e.target;
//             while (t && t != t.parentNode) {
//                 if (t == curInlineEdit.container) {
//                     outside = false;
//                     break;
//                 }
//                 t = t.parentNode;
//             }
//             if (!outside || !isVisible(curInlineEdit.container)) return;
//             curInlineEdit.hide();
//         }
//         if (e.type == 'keydown') {
//             if (!isVisible(curInlineEdit.container)) return;
//             if (e.keyCode == KEY.ESC) curInlineEdit.hide();
//             if (e.keyCode == KEY.RETURN) {
//                 if (!curInlineEdit.options.onConfirm || curInlineEdit.options.onConfirm.apply(curInlineEdit) !== false) curInlineEdit.hide();
//             }
//         }
//     };
//     addEvent(document, 'mousedown keydown', inlineOnEvent);
// }


createChildClass('inlineEdit', UiControl, {
    common: {
        pageContainer: null
    },
    defaultOptions: {
        offsetLeft: -25 + (browser.msie7 ? 2 : (browser.opera || browser.msie ? 3 : (browser.safari || browser.chrome ? 2 : (browser.mozilla ? 2 : 0)))),
        offsetTop: -23 + (browser.msie7 ? 2 : (browser.opera || browser.msie ? 3 : (browser.safari || browser.chrome ? 3 : (browser.mozilla ? 2.5 : 0)))),
        top: 0,
        left: 0,
        width: 240,
        flex: false,
        confirmLabel: getLang('global-save'),
        cancelLabel: getLang('global-cancel'),
        onBeforeShow: null,
        onShow: null,
        onHide: null,
        onConfirm: null,
        onCancel: null
    },
    controlName: 'InlineEdit',
    beforeInit: function () {
        if (!this.common.pageContainer) {
            this.common.pageContainer = document.body;
        }
        this.guid = _ui.reg(this);
    },
    initOptions: function (target, options) {
        if (!target) return false;
        this.options = extend({}, this.defaultOptions, options);
    },
    init: function (target) {
        this.target = target;
        addClass(this.target, 'inline_edit_target');
    },
    initDOM: function (target, options) {
        this.container = ce('div', {
            className: 'inlContainer',
            id: 'container' + this.guid,
            innerHTML: '<div class="inlMainDiv">' +
            '<div class="inlWrap">' +
            '<table class="inlContentTable">' +
            '<tr><td colspan="3"><input class="inlInput text big" type="text" /></td></tr>' +
            '<tr>' +
            '<td class="inlButtonOk"><button class="flat_button button_wide">' + this.options.confirmLabel + '</button></td>' +
            '<td class="inlDelimiter"></td>' +
            '<td class="inlButtonCancel"><button class="flat_button secondary button_wide">' + this.options.cancelLabel + '</button></td>' +
            '</tr>' +
            '</table>' +
            '</div>' +
            '</div>'
        }, {width: this.options.width});

        this.contentTable = geByClass1('inlContentTable', this.container);
        setStyle(this.container, 'width', this.options.width);
        this.input = geByClass1('inlInput', this.contentTable);
        this.buttonOk = geByClass1('inlButtonOk', this.contentTable).firstChild;
        this.buttonCancel = geByClass1('inlButtonCancel', this.contentTable).firstChild;
    },
    initEvents: function () {
        var self = this;
        createButton(this.buttonOk, function () {
            if (!self.options.onConfirm || self.options.onConfirm.apply(self) !== false) self.hide();
        });
        createButton(this.buttonCancel, function () {
            if (!self.options.onCancel || self.options.onCancel.apply(self) !== false) self.hide();
        });
        addEvent(this.target, 'click', function () {
            self.show();
            return false;
        });
    },
    afterInit: function (target, options) {
        if (this.options.afterInit) {
            this.options.afterInit.apply(this);
        }
        var self = this;
        onDomReady(function () {
            self.common.pageContainer.appendChild(self.container);
        });
    },
    moveTo: function (left, top) {
        setStyle(this.container, {
            top: floatval(top) + 'px',
            left: floatval(left) + 'px'
        });
    },
    moveToTarget: function () {
        var tc = getXY(this.target);
        this.moveTo(tc[0] + this.options.offsetLeft + this.options.left, tc[1] + this.options.offsetTop + this.options.top);
    },
    setOptions: function (options) {
        var self = this;
        extend(this.options, options);
    },
    toggle: function () {
        this.visible ? this.hide(false) : this.show();
    },
    hide: function () {
        if (!isVisible(this.container)) return;
        hide(this.container);
        if (curInlineEdit == this) curInlineEdit = false;
        if (this.options.onHide) this.options.onHide.apply(this);
        _ui.sel(false);
    },
    show: function () {
        if (isVisible(this.container)) return;
        this.moveToTarget();
        if (this.options.onBeforeShow) {
            this.options.onBeforeShow.apply(this);
        }
        show(this.container);
        if (curInlineEdit) curInlineEdit.hide();
        curInlineEdit = this;
        if (this.input) elfocus(this.input);
        if (this.options.onShow) {
            this.options.onShow.apply(this);
        }
        _ui.sel(this.guid);
    },
    onEvent: function (e) {
        if (!curInlineEdit) return;
        if (e.type == 'mousedown') {
            var outside = true;
            var t = e.target;
            while (t && t != t.parentNode) {
                if (t == curInlineEdit.container) {
                    outside = false;
                    break;
                }
                t = t.parentNode;
            }
            if (!outside || !isVisible(curInlineEdit.container)) return;
            curInlineEdit.hide();
        }
        if (e.type == 'keydown') {
            if (!isVisible(curInlineEdit.container)) return;
            if (e.keyCode == KEY.ESC) curInlineEdit.hide();
            if (e.keyCode == KEY.RETURN) {
                if (!curInlineEdit.options.onConfirm || curInlineEdit.options.onConfirm.apply(curInlineEdit) !== false) curInlineEdit.hide();
            }
        }
    }
});