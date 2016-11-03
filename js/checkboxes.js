createChildClass('Checkbox', UiControl, {
    // Standart fields
    CSS: {
        STANDART: 'checkbox_'
    },
    defaultOptions: {
        checkedValue: 1,
        notCheckedValue: '',
        width: 300,
        label: 'checkbox',
        circle: false
    },
    beforeInit: function () {
        this.guid = _ui.reg(this);
    },
    controlName: 'CheckBox',
    initOptions: function (input, options) {
        if (!input) return false;
        this.options = extend({}, this.defaultOptions, {
            checked: input['value'],
            resultField: input.name || input.id || 'checkbox'
        }, options);
        this.options.checked = intval(this.options.checked) ? true : false;
        this.options.width = intval(this.options.width) > 0 ? intval(this.options.width) : this.defaultOptions.width;
    },
    init: function () {
        this.disabled = false;
    },
    initDOM: function (input, options) {
        this.container = ce('div', {
            id: 'container' + this.guid,
            className: 'checkbox_container'+(this.options.circle?' checkbox_circle':''),
            innerHTML: '<table cellpadding=0 cellspacing=0><tr><td class="checkbox"><div class="checkbox_off"></div></td><td class="checkbox_label">' + this.options.label + '<input type="hidden" name="' + this.options.resultField + '" id="' + this.options.resultField + '" value="' + (this.options.checked ? this.options.checkedValue : this.options.notCheckedValue) + '"></td></tr></table>'
        }, {
            width: this.options.width + 'px'
        });
        input.parentNode.replaceChild(this.container, input);
        this.checkbox = geByClass('checkbox_off', this.container)[0];
        this.resultField = ge(this.options.resultField);
    },
    initEvents: function () {
        addEvent(this.container, 'click mouseover mouseout', this.handleMouseEvent, false, {
            'self': this
        });
    },
    afterInit: function () {
        this.setState(this.options.checked, false, true);
    },
    destroy: function () {
        if (this.destroyed) return;
        removeEvent(this.container, 'click mouseover mouseout', this.handleMouseEvent);
        this.destroyed = true;
    },
    show: function () {
        show(this.container);
    },
    hide: function () {
        hide(this.container);
    },
    // extended methods
    handleMouseEvent: function (e) {
        if (e.type == 'click') {
            if (!e.data.self.disabled) {
                e.data.self.setState(!e.data.self.options.checked);
            }
        } else {
            e.data.self.is_over = (e.type == 'mouseover');
            e.data.self.updateClass();
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
        this.checkbox.className = 'checkbox_' + (this.options.checked ? 'on' : 'off') + (this.is_over ? '_over' : '');
    },
    setState: function (checked, fireEvent, forceUpdate) {
        if (fireEvent === undefined) fireEvent = true;
        if (forceUpdate === undefined) forceUpdate = false;
        checked = checked ? true : false;
        if (this.options.checked == checked && !forceUpdate) {
            return;
        }
        this.options.checked = checked;
        this.updateClass();
        this.resultField.value = this.options.checked ? this.options.checkedValue : this.options.notCheckedValue;
        if (fireEvent && isFunction(this.options.onChange)) {
            this.options.onChange(this.resultField.value);
        }
    },
    // shortcuts
    setOptions: function (new_options) {
        extend(this.options, new_options);
        if (('checked' in new_options) || ('checkedValue' in new_options) || ('notCheckedValue' in new_options)) {
            this.setState(this.options.checked, false, true);
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