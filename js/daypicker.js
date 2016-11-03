createUiClass('Daypicker', {
    defaultOptions: {
        date: 0,
        year: 0,
        month: 0,
        day: 0,
        startYear: 1800,
        stopYear: false,
        timestamp: true,
        lang_month: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        lang_month_of:['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
        placeholders: ['Год:', 'Месяц:', 'День:'],
        onChange: function (day, month, year, timestamp) {}
    },
    beforeInit: function(){
        this.guid = _ui.reg(this);
    },
    initOptions: function(el, options){
        el = ge(el);
        if(!el) return false;
        this.options = extend({}, this.defaultOptions, options);
        this.value = el.value ? el.value : '';

        if(this.options.date){
            if (this.options.date < 30000000) {
                this.options.year = Math.floor(this.options.date / 10000);
                this.options.month = Math.floor((this.options.date - this.options.year * 10000) / 100);
                this.options.day = this.options.date - this.options.year * 10000 - this.options.month * 100
            } else {
                var date = new Date(this.options.date * 1000);
                this.options.year = date.getFullYear();
                this.options.month = date.getMonth();
                this.options.day = date.getDate();
            }
        }
    },
    init: function(el){
        el = ge(el);
        if(!el) return false;
        var self = this, opt = this.options;

        this.container = ce("div", {
            id: "daypicker_container"+this.guid,
            className: "daypicker_container cf",
            innerHTML: '<div class="fl">' +
                '<input type="hidden" name="' + (el.name?el.name:'') + '" id="' + el.id + '" value="' + this.value + '"/>' +
                '<div class="fl">' +
                    '<input type="hidden" id="' + this.guid + '_day_input" value="' + this.options.day + '"/>' +
                '</div>' +
                '<div class="fl" style="padding:0 3px;">&nbsp;</div>' +
                '<div class="fl">' +
                    '<input type="hidden" id="' + this.guid + '_month_input" value="' + this.options.month + '"/>' +
                '</div>' +
                '<div class="fl" style="padding:0 3px;">&nbsp;</div>' +
                '<div class="fl">' +
                    '<input type="hidden" id="' + this.guid + '_year_input" value="' + this.options.year + '"/>' +
                '</div>' +
            '</div>'
        });
        el.parentNode.replaceChild(this.container, el);
        this.input = ge(el.id);

        var date = new Date(),
            year_list = [[0, opt.placeholders[0]]],
            month_list = [[0, opt.placeholders[1]]],
            day_list = function (v, p) {
                var w = (new Date(p ? p : 2004, v, 0)).getDate(), day = [[0, opt.placeholders[2]]];
                for (var n = 1; n <= w; n++) day.push([n, n]);
                return day;
            },
            onChange = function(){
                var year = parseInt(self.year.val()),
                    month = parseInt(self.month.val()),
                    day = parseInt(self.day.val());

                var timestamp = Math.floor(+new Date(year, month-1, day, 0, 0, 0) / 1000);
                self.input.value = year * 10000 + month * 100 + day;

                if(self.options.timestamp){
                    self.input.value = timestamp;
                }
                self.day.setData(day_list(month, year));
                self.options.onChange(year, month, day, timestamp);
            };

        var stop_year = this.options.stopYear ? this.options.stopYear : date.getFullYear();

        for (var y = stop_year; y >= opt.startYear; y--) year_list.push([y, y]);
        for (var m = 1; m < 12; m++) month_list.push([m, opt.lang_month_of[m -1]]);

        this.day = new Dropdown(ge(this.guid + "_day_input"), day_list(opt.month, opt.year), {
            width: 58,
            onChange: onChange
        });
        this.month = new Dropdown(ge(this.guid + "_month_input"), month_list, {
            width: 95,
            onChange: onChange
        });
        this.year = new Dropdown(ge(this.guid + "_year_input"), year_list, {
            width: 60,
            onChange: onChange
        });
    }
});