createUiClass('Calendar', {
    defaultOptions: {
        date: 0,
        year: 0,
        month: 0,
        day: 0,
        timepicker: true,
        show_pn: false,
        past_day: true,
        future_day: false,
        width: 182,
        timestamp: false,
        lang_months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        lang_weeks: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        onChange: function (year, month, day, timestamp) {
        }
    },
    beforeInit: function () {
        this.guid = _ui.reg(this);
        this.cache = {};
        this.start = false;
    },
    initOptions: function (el, options) {
        el = ge(el);
        if (!el) return false;
        this.options = extend({}, this.defaultOptions, options);
        this.value = el.value ? el.value : '';
        if (!this.options.date && this.value !== '') {
            this.options.date = parseInt(this.value, 10);
        } else if (this.options.date) {
            this.options.date = parseInt(this.options.date, 10);
        }
        var date = new Date();
        this.year = date.getFullYear();
        this.month = date.getMonth();
        this.day = date.getDate();

        if (this.options.date) {
            if (this.options.date < 30000000) {
                this.year = Math.floor(this.options.date / 10000);
                this.month = Math.floor((this.options.date - this.year * 10000) / 100) - 1;
                this.day = this.options.date - this.year * 10000 - (this.month + 1) * 100;
            } else {
                var date = new Date(this.options.date * 1000);
                this.year = date.getFullYear();
                this.month = date.getMonth();
                this.day = date.getDate();
            }
        }
    },
    init: function (el) {
        el = ge(el);
        if (!el) return false;
        var self = this, opt = this.options;
        this.container = ce("div", {
            id: "calendar_container" + this.guid,
            className: "calendar_container",
            innerHTML: '' +
            '<input type="hidden" id="' + el.id + '" value="' + this.value + '" name="' + (el.name ? el.name : '') + '" />' +
            '<div class="cals_table"></div>'
        }, {width: this.options.width});
        el.parentNode.replaceChild(this.container, el);

        this.input = ge(el.id);
        this.cals_table = geByClass1('cals_table', this.container);

        this.getDay(this.year, this.month, this.day);
        this.start = true;
        return true;
    },
    setMonth: function (y, m) {
        var today = new Date();
        today = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        var self = this,
            today_id = 'cal_mo_' + this.guid + '' + today.getFullYear() + '' + today.getMonth(),
            sel_id = 'cal_mo_' + this.guid + '' + this.year + '' + this.month,
            tms = today.getFullYear() * 10000 + today.getMonth() * 100,
            td = function (y, i) {
                var past_day = '', ms = y * 10000 + i * 100;
                if (self.options.past_day && ((!self.options.future_day && (ms < tms)) || (self.options.future_day && (ms > tms)))) {
                    past_day = 'past_day';
                }
                return '<td class="day months ' + past_day + '" id="cal_mo_' + self.guid + '' + y + '' + i + '" onclick="return _ui._uids[' + self.guid + '].getMonth(' + y + ', ' + i + ');" onmouseover="addClass(this, \'hover\')" onmouseout="removeClass(this, \'hover\')">' + self.options.lang_months[i] + '</td>';
            },
            html = '' +
                '<table class="cal_table" cellspacing="0" cellpadding="0" border="0">' +
                '<tr>' +
                '<td colspan="2">' +
                '<table class="cal_table_head" border="0" cellpadding="0" cellspacing="0">' +
                '<tr>' +
                '<td class="month_arr">' +
                '<a class="arr left" onclick="return _ui._uids[' + this.guid + '].setMonth(' + (y - 1) + ', ' + m + ');"></a>' +
                '</td>' +
                '<td class="month" align="center">' +
                '<a class="cal_month_sel" onclick="return _ui._uids[' + this.guid + '].getDay(' + this.year + ', ' + this.month + ', ' + this.day + ');">' + y + '</a>' +
                '</td>' +
                '<td class="month_arr">' +
                '<a class="arr right" onclick="return _ui._uids[' + this.guid + '].setMonth(' + (y + 1) + ', ' + m + ');"></a>' +
                '</td>' +
                '</tr>' +
                '</table>' +
                '</td>' +
                '</tr>';

        for (var i = 0; i < 12; i++) {
            html += '<tr>' + td(y, i);
            i++;
            html += td(y, i) + '</tr>';
        }
        html += '</table>';

        this.cache[y + '' + m] = html;

        this.cals_table.innerHTML = html;

        if (ge(today_id)) addClass(today_id, 'today');
        if (ge(sel_id)) addClass(sel_id, 'sel');
    },
    getDay: function (y, m, d) {
        this.year = y;
        this.month = m;
        this.day = d;

        this.getMonth(y, m);
        var timestamp = Math.floor((new Date(y, m, d, 0, 0, 0).getTime() / 1000));
        this.input.value = y * 10000 + (m + 1) * 100 + d;

        if (this.options.timestamp) {
            this.input.value = timestamp;
        }
        if (this.start) this.options.onChange(y, m + 1, d, timestamp);

        return false;
    },
    getMonth: function (y, m) {

        var today = new Date();
        today = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        y = (y) ? parseInt(y) : today.getFullYear();
        m = (m) ? parseInt(m) : 0;
        var html = '',
            today_id = 'cal_' + this.guid + '' + today.getFullYear() + '' + today.getMonth() + '' + today.getDate(),
            sel_id = 'cal_' + this.guid + '' + this.year + '' + this.month + '' + this.day;

        if (this.cache[y + '' + m]) {
            html = this.cache[y + '' + m];
        } else {
            var pn = !!(this.options.show_pn),
                past_day = !!(this.options.past_day),
                last_month = new Date(y, m - 1, 1, 0, 0, 0),
                next_month = new Date(y, m + 1, 1, 0, 0, 0),
                date = new Date(y, m, 1, 0, 0, 0),
                dayOnWeek = date.getDay() - 1,
                daysInMonth = 33 - new Date(y, m, 33).getDate(),
                daysInFirstMonth = (34 - new Date(y, m - 1, 33).getDate()) - dayOnWeek,
                weeksInMonth = Math.ceil((daysInMonth + dayOnWeek) / 7),
                days = 1,
                arr = [],
                onHover = 'onmouseout="removeClass(this, \'hover\')" onmouseover="addClass(this, \'hover\')"',
                onClick = '',
                tms = today.getTime();


            html += '<table cellspacing="0" cellpadding="0" border="0" class="cal_table">' +
                '<tr>' +
                '<td colspan="7">' +
                '<table cellspacing="0" cellpadding="0" border="0" class="cal_table_head">' +
                '<tr>' +
                '<td class="month_arr">' +
                '<a onclick="return _ui._uids[' + this.guid + '].getMonth(' + last_month.getFullYear() + ',' + last_month.getMonth() + ');" class="arr left"></a>' +
                '</td>' +
                '<td align="center" class="month">' +
                '<a onclick="return _ui._uids[' + this.guid + '].setMonth(' + date.getFullYear() + ', ' + date.getMonth() + ')" class="cal_month_sel">' + this.options.lang_months[date.getMonth()] + ' ' + date.getFullYear() + '</a>' +
                '</td>' +
                '<td class="month_arr">' +
                '<a onclick="return _ui._uids[' + this.guid + '].getMonth(' + next_month.getFullYear() + ',' + next_month.getMonth() + ');" class="arr right"></a>' +
                '</td>' +
                '</tr>' +
                '</table>' +
                '</td>' +
                '</tr>';

            html += '<tr class="daysofweek">';
            for (var i in this.options.lang_weeks) {
                html += '<td>' + this.options.lang_weeks[i] + '</td>';
            }
            html += '</tr>';

            for (var week = 0; week < weeksInMonth; week++) {
                arr[week] = [];
                var n = 1;
                html += '<tr>';
                for (var diw = 0; diw < 7; diw++) {
                    var day = days, classN = 'day', hover = '', id = '';
                    if (dayOnWeek > 0) {
                        dayOnWeek--;
                        day = pn ? daysInFirstMonth.toString() : '';
                        classN += ' no_month_day' + (pn ? '' : ' nocp');
                        id = 'cal_' + this.guid + '' + last_month.getFullYear() + '' + last_month.getMonth() + '' + daysInFirstMonth;
                        hover = pn ? onHover : '';
                        onClick = pn ? 'return _ui._uids[' + this.guid + '].getDay(' + last_month.getFullYear() + ',' + last_month.getMonth() + ',' + daysInFirstMonth + ');' : '';
                        daysInFirstMonth++;
                    } else {
                        var ms = date.getTime() + (day * 86400 * 1000);
                        if (this.options.past_day && (!this.options.future_day && (ms <= tms) || (this.options.future_day && ms - 86400 * 1000 > tms))) {
                            classN += ' past_day';
                        }
                        id = 'cal_' + this.guid + '' + date.getFullYear() + '' + date.getMonth() + '' + day;
                        hover = onHover;
                        onClick = 'return _ui._uids[' + this.guid + '].getDay(' + date.getFullYear() + ',' + date.getMonth() + ',' + day + ');';
                        days++;
                    }
                    if (day > daysInMonth) {
                        day = pn ? n.toString() : '';
                        classN += pn ? ' no_month_day' : '';
                        hover = pn ? onHover : '';
                        id = 'cal_' + this.guid + '' + next_month.getFullYear() + '' + next_month.getMonth() + '' + n;
                        onClick = pn ? 'return _ui._uids[' + this.guid + '].getDay(' + next_month.getFullYear() + ',' + next_month.getMonth() + ',' + n + ');' : '';
                        n++;
                    }
                    html += '<td ' + hover + ' onclick="' + onClick + '" id="' + id + '" class="' + classN + '">' + (day ? day : '&nbsp;') + '</td>';
                }
                html += '</tr>';
            }
            html += '</table>';

        }

        this.cals_table.innerHTML = html;

        if (ge(today_id)) addClass(today_id, 'today');
        if (ge(sel_id)) addClass(sel_id, 'sel');

        return false;
    }
});