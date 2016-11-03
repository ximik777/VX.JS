createUiClass('Timepicker', {
    defaultOptions: {
        time: 0,
        hour: 0,
        min: 0,
        timestamp: true,
        full_min: false,
        onChange: function (hour, minute, timestamp) {}
    },
    dropdownOptions: {
        width: 47,
        multiselect: false
    },
    beforeInit: function(){
        this.guid = _ui.reg(this);
    },
    initOptions: function(el, options){
        el = ge(el);
        if(!el) return false;
        this.options = extend({}, this.defaultOptions, options);
        this.value = el.value || '';

        if(this.value == ''){
            this.options.time = 0;
        } else if(parseInt(this.value, 10).toString() == this.value){
            this.options.time = parseInt(this.value, 10);
        } else {
            var time = this.value.match(/^(\d{1,2}):(\d{1,2})$/i);
            if(time && intval(time[1]) && intval(time[2])){
                this.options.time = parseInt(time[1], 10) * 3600 + parseInt(time[2], 10) * 60;
                if(this.options.timestamp){
                    this.value = this.options.time;
                }
            } else {
                this.value = '';
            }
        }
        if(this.options.time){
            this.options.hour = Math.floor(this.options.time / 3600);
            this.options.min = Math.floor((this.options.time - this.options.hour * 3600) / 60)
        }
        this.options.hour = this.options.hour || 0;
        this.options.min = this.options.min || 0;

        if(this.options.full_min){
            this.options.min = this.options.min - this.options.min % 5;
        }
    },
    init: function(el){
        el = ge(el);
        if(!el) return false;

        this.container = ce("div", {
            id: "timepicker_container"+this.guid,
            className: "timepicker_container cf",
            innerHTML: '<input type="hidden" name="' + (el.name?el.name:'') + '" id="' + el.id + '" value="' + this.value + '"/>' +
                '<div class="fl">' +
                '<input type="hidden" id="' + this.guid + '_hour_input" value="' + this.options.hour + '"/>' +
                '</div>' +
                '<div class="fl" style="padding:5px 3px 0;"> : </div>' +
                '<div class="fl">' +
                '<input type="hidden" id="' + this.guid + '_min_input" value="' + this.options.min + '"/>' +
                '</div>'
        });
        el.parentNode.replaceChild(this.container, el);
        this.input = ge(el.id);
        var hours = [], minutes = [], self = this, onChange;
        for (var h = 0; h < 24; h++)
            hours.push([h, h]);
        for (var m = 0; m < 60; m += (this.options.full_min?1:5))
            minutes.push([m, m < 10 ? "0" + m.toString() : m]);

        onChange = function(){
            var hours = self.hours.val(),
                minutes = self.minutes.val(),
                timestamp = hours * 3600 + minutes * 60;
            self.input.value = self.options.timestamp ? timestamp : hours +':'+ minutes;
            self.options.onChange(hours, minutes, timestamp);
        };

        this.dropdownOptions.onChange = onChange;
        this.hours = new Dropdown(ge(this.guid + "_hour_input"), hours, this.dropdownOptions);
        this.minutes = new Dropdown(ge(this.guid + "_min_input"), minutes, this.dropdownOptions);
    }
});


//window.Timepicker = function (l, q) {
//    l = ge(l);
//    if (!l) {
//        return
//    }
//    var A = l.id,
//        C = l.name || "",
//        y = l.value || "";
//    var w = {
//        onUpdate: function (n, i) {},
//        time: 0,
//        hour: 0,
//        min: 0,
//        resfmt: "ts",
//        format: '{hour}<div class="fl_l" style="padding:5px 3px 0;"> : </div>{min}'
//    };
//    var B = extend({}, w, q);
//    var z = l.parentNode;
//    if (y) {
//        B.time = y
//    }
//    if (B.time) {
//        B.hour = Math.floor(B.time / 3600);
//        B.min = Math.floor((B.time - B.hour * 3600) / 60)
//    }
//    var H = B.hour || 0;
//    var D = B.min || 0;
//    var k = B.resfmt;
//    D = D - D % 5;
//    var x = '<input type="hidden" name="' + C + '" id="' + A + '" value="' + y + '"/>' + B.format.replace("{hour}", '<div class="fl_l"><input type="hidden" id="' + A + '_hour_input" value="' + H + '"/></div>').replace("{min}", '<div class="fl_l"><input type="hidden" id="' + A + '_min_input" value="' + D + '"/></div>') + '<div class="results_container"><div class="result_list" style="display:none;"></div><div class="result_list_shadow"><div class="shadow1"></div><div class="shadow2"></div></div></div>';
//    var t = ce("div", {
//        id: A + "_timepicker_container",
//        className: "timepicker_container",
//        innerHTML: x
//    });
//    z.replaceChild(t, l);
//    var E = function () {
//        var i = s.val(),
//            m = u.val();
//        if (k === "plain") {
//            ge(A).value = i + ":" + m
//        } else {
//            if (k === "ts") {
//                ge(A).value = i * 3600 + m * 60
//            }
//        }
//        B.onUpdate(i, m)
//    };
//    var G = [],
//        r = [];
//    for (var F = 0; F < 24; F++) {
//        G.push([F, F])
//    }
//    for (var F = 0; F < 60; F += 5) {
//        r.push([F, F < 10 ? "0" + F.toString() : F])
//    }
//    var s = new Dropdown(ge(A + "_hour_input"), G, {
//        width: 47,
//        multiselect: false,
//        onChange: E
//    });
//    var u = new Dropdown(ge(A + "_min_input"), r, {
//        width: 47,
//        multiselect: false,
//        onChange: E
//    })
//};