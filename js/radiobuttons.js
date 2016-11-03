createChildClass('Radiobutton', UiControl, {
    // Static class fields
    common: {
        _radio_buttons: {},
        _callbacks: {},
        // static methods
        deselect: function (name) {
            for (var i = 0; i < this._radio_buttons[name].length; ++i) {
                this._radio_buttons[name][i].checked(false);
            }
        },
        select: function (name, value) {
            for (var i = 0; i < this._radio_buttons[name].length; ++i) {
                if (this._radio_buttons[name][i].val() == value) {
                    this._radio_buttons[name][i].checked(true);
                    return;
                }
            }
        },
        setChangeEvent: function (name, callback) {
            if (isFunction(callback)) this._callbacks[name] = callback;
            else delete(this._callbacks[name]);
        }
    },
    CSS: {
        STANDART: 'radiobutton_',
        CONTAINER: 'radiobtn_container'
    },
    defaultOptions: {
        checked: false,
        width: 300,
        label: 'radiobutton'
    },
    controlName: 'Radiobutton',
    beforeInit: function () {
        this.guid = _ui.reg(this);
    },
    initOptions: function (input, options) {
        if (!input) return false;
        this.options = extend({}, this.defaultOptions, {
            value: input.value,
            resultField: input.name || 'radiobutton'
        }, options);
        this.options.checked = intval(this.options.checked) ? true : false;
        this.options.width = intval(this.options.width) > 0 ? intval(this.options.width) : this.defaultOptions.width;
    },
    init: function () {
        this.disabled = false;
        this.is_over = false;
        this.inputName = this.options.resultField;
    },
    initDOM: function (input, options) {
        this.container = ce('div', {
            id: 'container' + this.guid,
            className: this.CSS.CONTAINER,
            innerHTML: '<table cellpadding=0 cellspacing=0><tr><td class="radiobtn"><div class="radiobtn_off"><div></div></div></td><td class="radiobtn_label">' + this.options.label + '<input type="radio" id="' + input.id + '" name="' + this.options.resultField + '" value="' + (this.options.checked ? 'checked="true"' : '') + '"></td></tr></table>'
        }, {
            width: this.options.width + 'px'
        });
        input.parentNode.replaceChild(this.container, input);
        this.radiobutton = geByClass('radiobtn_off', this.container)[0];
        this.resultField = this.container.getElementsByTagName('input')[0];
        this.resultField.value = this.options.value;
    },
    initEvents: function () {
        addEvent(this.container, 'click mouseover mouseout', this.handleMouseEvent, false, {
            'self': this
        });
    },
    afterInit: function () {
        if (!isArray(this.common._radio_buttons[this.inputName])) {
            this.common._radio_buttons[this.inputName] = [];
        }
        this.common._radio_buttons[this.inputName].push(this);
        this.setState(this.options.checked, false, true);
    },
    destroy: function () {
        if (this.destroyed) return;
        for (var i = 0; i < this.common._radio_buttons[this.inputName].length; ++i) {
            if (this.common._radio_buttons[this.inputName][i] === this) {
                this.common._radio_buttons[this.inputName].splice(i, 1);
                break;
            }
        }
        if (!this.common._radio_buttons[this.inputName].length) {
            delete this.common._radio_buttons[this.inputName];
            this.common.setChangeEvent(this.inputName);
        }
        removeEvent(this.container, 'click mouseover mouseout', this.handleMouseEvent);
        this.destroyed = true;
    },
    handleMouseEvent: function (e) {
        var t = e.data.self;
        if (e.type == 'click') {
            if (!t.disabled && !t.options.checked) {
                t.setState(true);
            }
        } else {
            t.is_over = (e.type == 'mouseover');
            t.updateClass();
        }
    },
    disable: function (value) {
        if (value && !this.disabled) {
            this.disabled = true;
            addClass(this.container, 'disabled');
        } else if (!value && this.disabled) {
            this.disabled = false;
            removeClass(this.container, 'disabled');
        }
    },
    updateClass: function () {
        this.radiobutton.className = 'radiobtn_' + (this.options.checked ? 'on' : 'off') + (this.is_over ? '_over' : '');
    },
    setState: function (checked, fireEvent, forceUpdate) {
        if (fireEvent === undefined) fireEvent = true;
        forceUpdate = forceUpdate || false;
        checked = checked ? true : false;
        if (this.options.checked == checked && !forceUpdate)
            return;
        if (checked)
            this.common.deselect(this.inputName);
        this.options.checked = checked;
        this.updateClass();
        this.resultField.checked = checked;
        if (fireEvent) {
            if (this.options.checked && isFunction(this.options.onSelect))
                this.options.onSelect(this.resultField.value);
            if (isFunction(this.options.onChange))
                this.options.onChange(this.resultField.value, checked);
            if (checked) {
                if (isFunction(this.common._callbacks[this.inputName])) this.common._callbacks[this.inputName](this.resultField.value);
            }
        }
    },
    setOptions: function (new_options) {
        extend(this.options, new_options);
        if (('checked' in new_options)) {
            this.setState(this.options.checked, false);
        }
    },
    checked: function (value) {
        if (value !== undefined) this.setState(value);
        return this.options.checked;
    },
    val: function () {
        return this.resultField.value;
    }
});

function Radiobuttons(input, buttons, options) {
    var id = input.id;
    Radiobutton._radio_buttons[id] = [];
    Radiobutton._callbacks[id] = [];
    each(buttons, function (i, v) {
        new Radiobutton(ge(id + v[0]), {
            label: v[1],
            width: options.width,
            resultField: id
        });
    });
    Radiobutton.select(id, options.selected !== undefined ? options.selected : input.value);
    Radiobutton.setChangeEvent(id, function (value) {
        input.value = value;
        if (isFunction(options.onChange)) {
            options.onChange(value);
        }
    });
}