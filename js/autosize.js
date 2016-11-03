createChildClass('Autosize', UiControl, {
    // Static class fields
    common: {
        _autosize_helpers: null
    },
    CSS: {},
    defaultOptions: {
        height: 0,
        minHeight: 0,
        padding: 0,
        helperTA: false // new type of autosize, untested
    },
    controlName: 'Autosize',
    // Standart object methods
    beforeInit: function () {
        this.guid = _ui.reg(this);
        if (!this.common._autosize_helpers || !ge('autosize_helpers')) {
            document.body.appendChild(
                (this.common._autosize_helpers = ce('div', {
                    'id': 'autosize_helpers'
                }, {
                    'position': 'absolute',
                    'left': '-10000px',
                    'top': '-10000px'
                }))
            );
        }
    },
    initOptions: function (textarea, options) {
        this.options = extend({}, this.defaultOptions, options);
        this.options.checked = intval(this.options.checked) ? true : false;
        this.options.width = intval(this.options.width) > 0 ? intval(this.options.width) : this.defaultOptions.width;
    },
    init: function (input) {
        this.input = input;
        this.oldValue = '';
        this.oldHeight = 0;
        this.overflowAuto = false;
    },
    initDOM: function (input) {
        this.minHeight = intval(this.options.minHeight) || intval(getStyle(input, 'height'));
        this.maxHeight = intval(this.options.height);
        this.fontSize = intval(getStyle(input, 'fontSize'));
        var w = intval(getStyle(input, 'width'));
        // fix for hidden textareas
        if (w < 1) {
            w = intval(getStyle(input, 'width', false));
        }
        if (this.defaultOptions.padding) w -= this.defaultOptions.padding * 2;
        this.common._autosize_helpers.appendChild(
            this.helper = ce(this.options.helperTA ? 'textarea' : 'div', false, {
                wordWrap: 'break-word',
                width: (w < 0 ? 0 : w) + 'px',
                fontFamily: getStyle(input, 'fontFamily'),
                fontSize: this.fontSize + 'px',
                lineHeight: getStyle(input, 'lineHeight')
            })
        );
        this.input.helper = this.helper;
        setStyle(this.input, 'overflow', 'hidden');
    },
    initEvents: function () {
        addEvent(this.input, 'keydown keypress keyup', this.updateSize, false, {
            'self': this
        });
    },
    afterInit: function () {
        this.update();
    },
    // Extended methods
    updateSize: function (event) {
        var self = event.data.self,
            value = self.input.value,
            newHeight;
        if (event.type != 'keyup') {
            if (event.keyCode == 13 && !event.ctrlKey && !event.altKey) {
                value += '\n';
            }
        }
        if (value == self.oldValue) {
            return;
        }
        self.oldValue = value;
        if (self.options.helperTA) {
            self.helper.value = value;
            newHeight = self.helper.scrollHeight + self.fontSize + 4;
        } else {
            self.helper.innerHTML = trim(replaceChars(value)).replace(/<br>$/, '<br>&nbsp;');
            newHeight = getSize(self.helper, true)[1] + self.fontSize + 4;
        }
        newHeight = Math.max(newHeight, self.minHeight);
        if (self.maxHeight > 0 && newHeight > self.maxHeight) {
            newHeight = self.maxHeight;
            if (!self.overflowAuto) {
                if (browser.mozilla) var cr = self.input.selectionStart;
                self.overflowAuto = true;
                setStyle(self.input, {
                    'overflow': 'auto',
                    'overflowX': 'hidden'
                });
                if (browser.mozilla) self.input.setSelectionRange(cr, cr);
                self.oldHeight = newHeight;
            }
        } else {
            if (self.overflowAuto) {
                self.overflowAuto = false;
                if (browser.mozilla) var cr = self.input.selectionStart;
                self.input.style.overflow = 'hidden';
                if (browser.mozilla) self.input.setSelectionRange(cr, cr);
            }
        }
        if (self.options.preventEnter && event.keyCode == 13 && !event.shiftKey) {
            return;
        }
        if (self.oldHeight != newHeight) {
            self.input.style.height = (self.oldHeight = newHeight) + 'px';
            if (self.options.onResize) self.options.onResize(newHeight);
        }
    },
    // Shortcuts
    update: function () {
        this.updateSize({
            data: {
                self: this
            }
        });
    }
});