createUiClass('Datepicker', {
    defaultOptions: {
        date: 0,
        year: 0,
        month: 0,
        day: 0,
        show_pn: false,
        past_day: true,
        future_day: false,
        width:182,
        dp_width: 125,
        timestamp: false,
        lang_months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        dp_lang_months: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
        lang_weeks: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
        dp_date_format: "{day} {month} {year}",
        dp_disable: false,
        onChange: function (year, month, day, timestamp) {}
    },
    beforeInit: function(){
        this.guid = _ui.reg(this);
    },
    initOptions: function(el, options){
        el = ge(el);
        if(!el) return false;
        this.options = extend({}, this.defaultOptions, options);
        this.disabled = this.options.dp_disable;
        this.show = false;
    },
    disable: function(sw){
        sw = !!(sw);
        if(sw) addClass(this.control, 'disabled');
        else removeClass(this.control, 'disabled');
        this.disabled = sw;
    },
    onChange: function(y,m,d,ts){
        this.setDate(y,m-1,d);
        this.options.onChange(y,m,d,ts);
    },
    init: function(el){
        el = ge(el);
        if(!el) return false;
        var self = this, opt = this.options;

        this.container = ce("div", {
            id: "datepicker_container"+this.guid,
            className: "datepicker_container ib",
            innerHTML: '' +
                '<div class="datepicker_control">' +
                '<input class="datepicker_text" type="text" onfocus="this.blur();" style="width:'+(opt.dp_width-25)+'px;margin-left:25px;" readonly="1">' +
                '</div>' +
                '<div class="cal_div">' +
                '<input type="hidden" id="'+el.id+'" value="'+el.value+'" name="'+(el.name?el.name:'')+'" />' +
                '</div>'
        }, {});
        el.parentNode.replaceChild(this.container, el);
        this.id = el;
        this.dp_date_input = geByClass1('datepicker_text', this.container);
        this.control = geByClass1('datepicker_control', this.container);
        this.cal_div = geByClass1('cal_div', this.container);
        var options = clone(this.options);
        options.onChange = function(y,m,d,ts){self.onChange(y,m,d,ts);};
        this.cal = new Calendar(ge(el.id), options);
        this.setDate(this.cal.year, this.cal.month, this.cal.day);

        if(this.disabled){
            this.disable(this.disabled);
        }

        return true;
    },
    Hide: function(){
        this.cal_div.style.display = 'none';
        this.show = false;
        _ui.sel(false);
    },
    initEvents: function(){
        var self = this;
        addEvent(this.control, 'mousedown', function(e){
            if(self.disabled) return false;
            if(!self.show){
                _ui.sel(self.guid);
                self.cal_div.style.display = 'block';
                self.show = true;
            } else {
                self.Hide();
            }
        });
    },
    setDate: function(year, month, day){
        this.dp_date_input.value = this.options.dp_date_format
            .replace('{day}', day)
            .replace('{month}', this.options.dp_lang_months[month])
            .replace('{year}', year);
        this.Hide();
    },
    onEvent: function (e) {
        var outside = true,
            t = e.target;
        while (t && t != t.parentNode) {
            if (t == this.container) {
                outside = false;
                break;
            }
            t = t.parentNode;
        }
        if (outside || (e.keyCode == KEY.ESC)) {
            this.Hide();
        }
    }
});