createUiClass('Slider', {
    defaultOptions: {
        value: 0,
        width: 100,
        size: 1,
        formatHint: undefined, // function
        hintClass: undefined,
        debounce: undefined,
        onValueChangeDebounced: undefined, // function
        onChange: function(val){},
        onStartDragging: function(){},
        onEndDragging: function(){}
    },
    beforeInit: function(el, options){
        this.guid = _ui.reg(this);
    },
    initOptions: function(el, options){
        this.options = extend({}, this.defaultOptions, options);
    },
    init: function(el, options){
        this.currHandler = null;
        this.currHintEl = null;
    },
    initDOM: function(el, options){
        el = ge(el);

        this.el = ce('div', {
            innerHTML: '<div class="slider_slide"> <div class="slider_amount"></div> <div class="slider_handler"></div> </div>',
            className: 'slider slider_size_' + this.options.size,
            id: el.getAttribute('id') || ''
        }, {
            width: options.width
        });

        var classes = el.className.split(' ');
        for (var i = 0; i < classes.length; i++) {
            addClass(this.el, classes[i]);
        }
        each(el.attributes, function(i, att) {
            if (att.name != 'id' || att.name != 'class') {
                el.setAttribute(att.name, att.value);
            }
        });

        el.parentNode.replaceChild(this.el, el);

        data(this.el, 'slider', this);

        this.amountEl = geByClass1('slider_amount', this.el);
        this.handlerEl = geByClass1('slider_handler', this.el);
        this.slideEl = geByClass1('slider_slide', this.el);

        if (this.options.color) {
            setStyle(this.amountEl, { backgroundColor: this.options.color });
            setStyle(this.handlerEl, { backgroundColor: this.options.color });
        }
        if (this.options.backColor) {
            setStyle(this.slideEl, { backgroundColor: this.options.backColor});
        }

    },
    initEvents: function(){
        var self = this;
        addEvent(this.el, 'mousedown', function(event) {
            self.currHandler = geByClass1('slider_handler', event.currentTarget);

            addEvent(window, 'mousemove', self.onMouseMove, false, {self: self});
            addEvent(window, 'mouseup', self.onMouseUp, false, {self: self});
            self.options.onStartDragging();


            self.onMouseMove(event, {self: self});

            addClass(self.el, 'active');
            cancelEvent(event);
        });
    },
    afterInit: function(){
        this.setValue(this.options.value);
        if (this.options.debounce) {
            this.onValueChangeDebounced = this._debounce(this.onValueChange, this.options.debounce);
        }
    },
    onValueChange: function() {
        this.lastValue = this.lastValue || 0;

        if (this.lastValue != this.currValue) {
            this.lastValue = this.currValue;
            this.options.onChange(this.lastValue);
        }
    },
    setValue: function(value) {
        var left = this.options.width * value;
        setStyle(this.amountEl, { width: left });
        setStyle(this.handlerEl, { left: left });
        this.currValue = value;
        this.onValueChange();
    },
    getValue: function() {
        return this.lastValue || 0;
    },
    onMouseMove: function(e, data) {
        var self = data && data.self ? data.self : e.data.self;
        var sliderEl = self.currHandler.parentNode;
        var sliderElSize = getSize(sliderEl);
        var sliderElPos = getXY(sliderEl);
        var left = Math.max(e.pageX, sliderElPos[0]);
        left = Math.min(left, sliderElPos[0] + sliderElSize[0]);
        left = left - sliderElPos[0];

        setStyle(self.amountEl, { width: left });
        setStyle(self.currHandler, { left: left });

        self.currValue = left / sliderElSize[0];

        if (self.onValueChangeDebounced) {
            self.onValueChangeDebounced();
        } else {
            self.onValueChange();
        }

        self.updateHint();

        cancelEvent(e);
    },
    onMouseUp: function(e) {
        var self = e.data.self;
        removeEvent(window, 'mousemove', self.onMouseMove);
        removeEvent(window, 'mouseup', self.onMouseUp);
        clearTimeout(self.timeout);
        self.onValueChange();
        removeClass(self.el, 'active');

        if (self.currHintEl) {
            removeClass(self.currHintEl, 'visible');
            setTimeout(function() {
                re(self.currHintEl);
                self.currHintEl = null;
            }, 160);
        }

        self.options.onEndDragging();
    },
    updateHint: function() {
        if (this.options.formatHint) {
            if (!this.currHintEl) {
                this.currHintEl = se('<div class="slider_hint" id="slider_hint"></div>');
                if(this.options.hintClass){
                    addClass(this.currHintEl, this.options.hintClass);
                }
                document.body.appendChild(this.currHintEl);
            }

            this.currHintEl.innerHTML = this.options.formatHint(this.currValue);

            var handlerPos = getXY(this.currHandler);
            var handlerSize = getSize(this.currHandler);
            var hintSize = getSize(this.currHintEl);
            setStyle(this.currHintEl, { top: handlerPos[1] - hintSize[1] - 9, left: Math.round(handlerPos[0] - hintSize[0] / 2 + handlerSize[0] / 2) });

            addClass(this.currHintEl, 'visible');
        }
    },
    _debounce: function(callback, delay) {
        var self = this;
        return function() {
            var context = this, args = arguments;
            clearTimeout(self.timeout);
            self.timeout = setTimeout(function() {
                self.timeout = null;
                callback.apply(context, args);
            }, delay);
        };
    }
});