createUiClass('trackControl', {
    defaultOptions: {
        width:280,
        className:'',
        hintFixed: true,
        onChange: function(p){}
    },
    beforeInit: function(){
        this.guid = _ui.reg(this);
    },
    initOptions: function(el, options){
        this.options = extend({}, this.defaultOptions, options);
        this.options.className = this.options.className == '' ? '' : ' '+this.options.className;
    },
    init: function(el, options){
        this.duration = 0;
        this.down = false;
    },
    initDOM: function(el){
        el = ge(el);
        if(!el) return false;

        this.container = ce('div', {
            innerHTML: '\
            <div class="track_control_bg_line"></div>\
            <div class="track_control_preload_line" style="width:0%"></div>\
            <div class="track_control_progress_line" style="width:0%">\
                <div class="track_control_point"></div>\
            </div>',
            className: 'track_control' + this.options.className,
            id:el.id
        }, {
            width:this.options.width+'px'
        });

        el.parentNode.replaceChild(this.container, el);

        this.preload = geByClass1('track_control_preload_line', this.container, 'div');
        this.progress = geByClass1('track_control_progress_line', this.container, 'div');

        this.hint = ce('div', {
            className:'track_control_hint',
            innerHTML:'\
                <div class="track_control_hint_value"></div>\
                <div class="track_control_hint_footer"></div>'
        }, {
            position: this.options.hintFixed ? 'fixed' : 'absolute',
            display: 'none',
            zIndex:150
        });
        document.body.appendChild(this.hint);

        this.hint_value = geByClass1('track_control_hint_value', this.hint, 'div');
        this.hint_footer = geByClass1('track_control_hint_footer', this.hint, 'div');

    },
    initEvents: function(){
        var self = this, over = false, x = 0;

        addEvent(this.container, 'mouseover', function(e){
            if(self.duration == 0) return;
            x = getMouseOffset(e,self.container)[0];
            self.setHint(x);
            show(self.hint);
            over = true;

            var move = function(e){
                x = getMouseOffset(e,self.container)[0];
                if(x>self.options.width || x<0) return;
                self.setHint(x);
                return cancelEvent(e);
            };

            var out = function(e){
                if(self.down) return;
                over = false;
                hide(self.hint);
                removeEvent(document, 'mousemove', move);
                removeEvent(document, 'dragstart', rf);
                removeEvent(document, 'selectstart', rf);
                removeEvent(document, 'mouseup', out);
            };
            var rf = function() {
                return false;
            };

            addEvent(document, 'mousemove', move);
            addEvent(document, 'dragstart', rf);
            addEvent(document, 'selectstart', rf);
            addEvent(document, 'mouseout', out);
            return cancelEvent(e);
        });

        addEvent(this.container, 'mousedown', function(e){
            if(self.duration == 0) return;
            self.down = true;
            x = getMouseOffset(e,self.container)[0];
            addClass(self.container, 'over');

            var pre = parseInt(self.preload.style.width, 10);
            var percent = x*100/self.options.width;

            percent = Math.floor(percent>100 ? 100 : percent<0 ? 0 : percent);
            percent = percent > pre ? pre : percent;
            self.progress.style.width = percent + '%';

            var move = function(e){
                if(!self.down) return;
                x = getMouseOffset(e,self.container)[0];
                if(x>self.options.width || x<0) return;
                var pre = parseInt(self.preload.style.width, 10);
                var percent = x*100/self.options.width;
                percent = Math.floor(percent>100 ? 100 : percent<0 ? 0 : percent);
                percent = percent > pre ? pre : percent;
                self.progress.style.width = percent + '%';
                return cancelEvent(e);
            };
            var up = function(e){
                self.down = false;
                if(!over) hide(self.hint);
                x = getMouseOffset(e,self.container)[0];
                self.onChange(x);
                removeClass(self.container, 'over');
                removeEvent(document, 'mousemove', move);
                removeEvent(document, 'dragstart', rf);
                removeEvent(document, 'selectstart', rf);
                removeEvent(document, 'mouseup', up);
            };
            var rf = function() {
                return false;
            };
            addEvent(document, 'mousemove', move);
            addEvent(document, 'dragstart', rf);
            addEvent(document, 'selectstart', rf);
            addEvent(document, 'mouseup', up);
            return cancelEvent(e);
        });

    },
    onChange: function(x){
        var percent = x*100/this.options.width;
        this.options.onChange(percent/100);
    },
    getHintDuration: function(percent){
        var p = this.duration * (percent/100),
        m = Math.floor(p / 60),
        s = Math.floor(p % 60);
        return (m+':'+(s<10?'0':'')+s);
    },
    setHint: function(x){
        var percent = x*100/this.options.width;
        this.hint_value.innerHTML = this.getHintDuration(percent);
        var xy = getXY(this.progress);
        var hint_size = getSize(this.hint);
        this.hint.style.top = xy[1] - hint_size[1] - 10 + 'px';
        this.hint_footer.style.left = (hint_size[0]/2)-3 + 'px';
        this.hint.style.left = xy[0] - (hint_size[0]/2) + x + 'px';
    },
    setPreload: function(percent){
        this.preload.style.width = (percent*100) + '%';
    },
    setProgress: function(percent){
        this.progress.style.width = percent*100 + '%';
    },
    setDuration: function(sec){
        this.duration = sec;
    },
    clear: function(sec){
        if(sec!==undefined)this.setDuration(sec);
        this.preload.style.width = '0%';
        this.progress.style.width = '0%';
    }
});