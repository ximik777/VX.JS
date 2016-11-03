(function () {
    var isReady = false,
        readyBind = false,
        readyList = [];
    window.onDomReady = function (handle) {
        bindReady();
        if (isReady) {
            handle.call(document);
        } else {
            readyList.push(function () {
                handle.call(document);
            });
        }
    };
    var ready = function () {
        if (!isReady) {
            isReady = true;
            if (readyList) {
                var l = readyList;
                l.reverse();
                while (handle = l.pop()) {
                    handle.apply(document);
                }
                readyList = null;
            }
        }
    };
    var bindReady = function () {
        if (readyBind) return;
        readyBind = true;
        if (document.addEventListener && !browser.opera) document.addEventListener("DOMContentLoaded", ready, false);
        if (browser.msie && window == top)(function () {
            if (isReady) return;
            try {
                document.documentElement.doScroll("left");
            } catch (e) {
                setTimeout(arguments.callee, 0);
                return;
            }
            ready();
        })();
        if (browser.opera) document.addEventListener("DOMContentLoaded", function () {
            if (isReady) return;
            ready();
        }, false);
        if (browser.safari) {
            (function () {
                if (isReady) return;
                if (document.readyState != "loaded" && document.readyState != "complete") {
                    setTimeout(arguments.callee, 0);
                    return;
                }
                ready();
            })();
        }
        if (window.addEventListener) window.addEventListener('load', ready, false);
        else if (window.attachEvent) window.attachEvent('onload', ready);
    }
})();


onDomReady(function () {
    window.headNode = geByTag1('head');
    extend(window, {
        icoNode: geByTag1('link', headNode),
        bodyNode: geByTag1('body'),
        htmlNode: geByTag1('html')
    });
    if ('devicePixelRatio' in window && window.devicePixelRatio == 2) {
        addClass(bodyNode, 'is_2x');
    }
    if(!supportsSvg()){
        addClass(bodyNode, 'no_svg');
    }
    if(browser.chrome){
        addClass(bodyNode, 'ch');
    } else if (browser.mozilla){
        addClass(bodyNode, 'ff');
    } else if (browser.safari_mobile){
        addClass(bodyNode, 'sfm');
    } else if (browser.safari){
        addClass(bodyNode, 'sf');
    }
});

function supportsSvg() {
    try{
        return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.0");
    } catch(e){}
    return false;
}

function ge(el) {
    return (typeof el == 'string' || typeof el == 'number') ? document.getElementById(el) : el;
}

function geByClass(searchClass, node, tag) {
    node = node || document;
    tag = tag || '*';
    var classElements = [];
    if (!browser.msie8 && node.querySelectorAll && tag != '*') {
        return node.querySelectorAll(tag + '.' + searchClass);
    }
    if (node.getElementsByClassName) {
        var nodes = node.getElementsByClassName(searchClass);
        if (tag != '*') {
            tag = tag.toUpperCase();
            for (var i = 0, l = nodes.length; i < l; ++i) {
                if (nodes[i].tagName.toUpperCase() == tag) {
                    classElements.push(nodes[i]);
                }
            }
        } else {
            classElements = Array.prototype.slice.call(nodes);
        }
        return classElements;
    }
    var els = geByTag(tag, node);
    var pattern = new RegExp('(^|\\s)' + searchClass + '(\\s|$)');
    for (var i = 0, l = els.length; i < l; ++i) {
        if (pattern.test(els[i].className)) {
            classElements.push(els[i]);
        }
    }
    return classElements;
}

function geByClass1(searchClass, node, tag) {
    node = node || document;
    tag = tag || '*';
    return !browser.msie8 && node.querySelector && node.querySelector(tag + '.' + searchClass) || geByClass(searchClass, node, tag)[0];
}

function geByTag(searchTag, node) {
    return (node || document).getElementsByTagName(searchTag);
}

function geByTag1(searchTag, node) {
    node = node || document;
    return node.querySelector && node.querySelector(searchTag) || geByTag(searchTag, node)[0];
}

function ce(tagName, attr, style) {
    var el = document.createElement(tagName);
    if (attr) extend(el, attr);
    if (style) setStyle(el, style);
    return el;
}

function re(el) {
    el = ge(el);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    return el;
}

function hasClass(obj, name) {
    obj = ge(obj);
    return obj && (new RegExp('(\\s|^)' + name + '(\\s|$)')).test(obj.className);
}

function addClass(obj, name) {
    if ((obj = ge(obj)) && !hasClass(obj, name)) {
        obj.className = (obj.className ? obj.className + ' ' : '') + name;
    }
}

function removeClass(obj, name) {
    if (obj = ge(obj)) {
        obj.className = trim((obj.className || '').replace((new RegExp('(\\s|^)' + name + '(\\s|$)')), ' '));
    }
}

function toggleClass(obj, name, v) {
    if (v === undefined) {
        v = !hasClass(obj, name);
    }
    (v ? addClass : removeClass)(obj, name);
}

function replaceClass(obj, oldName, newName) {
    removeClass(obj, oldName);
    addClass(obj, newName);
}

function getStyle(elem, name, force) {
    elem = ge(elem);
    if (isArray(name)) {
        var res = {};
        each(name, function (i, v) {
            res[v] = getStyle(elem, v);
        });
        return res;
    }
    if (force === undefined) {
        force = true;
    }
    if (!force && name == 'opacity' && browser.msie) {
        var filter = elem.style['filter'];
        return filter ? (filter.indexOf('opacity=') >= 0 ?
            (parseFloat(filter.match(/opacity=([^)]*)/)[1]) / 100) + '' : '1') : '';
    }
    if (!force && elem.style && (elem.style[name] || name == 'height')) {
        return elem.style[name];
    }
    var ret, defaultView = document.defaultView || window;
    if (defaultView.getComputedStyle) {
        name = name.replace(/([A-Z])/g, '-$1').toLowerCase();
        var computedStyle = defaultView.getComputedStyle(elem, null);
        if (computedStyle) {
            ret = computedStyle.getPropertyValue(name);
        }
    } else if (elem.currentStyle) {
        if (name == 'opacity' && browser.msie) {
            var filter = elem.currentStyle['filter'];
            return filter && filter.indexOf('opacity=') >= 0 ? (parseFloat(filter.match(/opacity=([^)]*)/)[1]) / 100) + '' : '1';
        }
        var camelCase = name.replace(/\-(\w)/g, function (all, letter) {
            return letter.toUpperCase();
        });
        ret = elem.currentStyle[name] || elem.currentStyle[camelCase];
        //dummy fix for ie
        if (ret == 'auto') {
            ret = 0;
        }
        if (!/^\d+(px)?$/i.test(ret) && /^\d/.test(ret)) {
            var style = elem.style,
                left = style.left,
                rsLeft = elem.runtimeStyle.left;
            elem.runtimeStyle.left = elem.currentStyle.left;
            style.left = ret || 0;
            ret = style.pixelLeft + 'px';
            style.left = left;
            elem.runtimeStyle.left = rsLeft;
        }
    }
    if (force && (name == 'width' || name == 'height')) {
        var ret2 = getSize(elem, true)[({
            'width': 0,
            'height': 1
        })[name]];
        ret = (intval(ret) ? Math.max(floatval(ret), ret2) : ret2) + 'px';
    }
    return ret;
}

function setStyle(elem, name, value) {
    elem = ge(elem);
    if (!elem) return;
    if (typeof name == 'object') return each(name, function (k, v) {
        setStyle(elem, k, v);
    });
    if (name == 'opacity') {
        if (browser.msie) {
            if ((value + '').length) {
                if (value !== 1) {
                    elem.style.filter = 'alpha(opacity=' + value * 100 + ')';
                } else {
                    elem.style.filter = '';
                }
            } else {
                elem.style.cssText = elem.style.cssText.replace(/filter\s*:[^;]*/gi, '');
            }
            elem.style.zoom = 1;
        }
        elem.style.opacity = value;
    } else {
        try {
            var isN = typeof (value) == 'number';
            if (isN && (/height|width/i).test(name)) value = Math.abs(value);
            elem.style[name] = isN && !(/z-?index|font-?weight|opacity|zoom|line-?height/i).test(name) ? value + 'px' : value;
        } catch (e) {
            console.log([name, value]);
        }
    }
}

function str2hash(str){
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    }
    return hash;
}

function str2color(str) {
    var hash = str2hash(str);
    var r = (hash & 0xFF0000) >> 16;
    var g = (hash & 0x00FF00) >> 8;
    var b = hash & 0x0000FF;
    return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
}

function getRGB(color) {
    var result;
    if (color && isArray(color) && color.length == 3) return color;
    if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color)) return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];
    if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color)) return [parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55];
    if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color)) return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
    if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color)) return [parseInt(result[1] + result[1], 16), parseInt(result[2] + result[2], 16), parseInt(result[3] + result[3], 16)];
}

function getColor(elem, attr) {
    var color;
    do {
        color = getStyle(elem, attr);
        if (color != '' && color != 'transparent' || elem.nodeName.toLowerCase() == "body") break;
        attr = "backgroundColor";
    } while (elem = elem.parentNode);
    return getRGB(color);
}

function animate(el, params, speed, callback) {
    el = ge(el);
    if (!el) return;
    var _cb = isFunction(callback) ? callback : function () {};
    var options = extend({}, typeof speed == 'object' ? speed : {
        duration: speed,
        onComplete: _cb
    });
    var fromArr = {}, toArr = {}, visible = isVisible(el),
        self = this,
        p;
    options.orig = {};
    params = clone(params);
    if (params.discrete) {
        options.discrete = 1;
        delete(params.discrete);
    }
    if (browser.iphone) options.duration = 0;
    var tween = data(el, 'tween'),
        i, name, toggleAct = visible ? 'hide' : 'show';
    if (tween && tween.isTweening) {
        options.orig = extend(options.orig, tween.options.orig);
        tween.stop(false);
        if (tween.options.show) toggleAct = 'hide';
        else if (tween.options.hide) toggleAct = 'show';
    }
    for (p in params) {
        if (!tween && (params[p] == 'show' && visible || params[p] == 'hide' && !visible)) {
            return options.onComplete.call(this, el);
        }
        if ((p == 'height' || p == 'width') && el.style) {
            if (!params.overflow) {
                if (options.orig.overflow == undefined) {
                    options.orig.overflow = getStyle(el, 'overflow');
                }
                el.style.overflow = 'hidden';
            }
            if (!hasClass(el, 'inl_bl') && el.tagName != 'TD') {
                el.style.display = 'block';
            }
        }
        if (/show|hide|toggle/.test(params[p])) {
            if (params[p] == 'toggle') {
                params[p] = toggleAct;
            }
            if (params[p] == 'show') {
                var from = 0;
                options.show = true;
                if (options.orig[p] == undefined) {
                    options.orig[p] = getStyle(el, p, false) || '';
                    setStyle(el, p, 0);
                }
                var o;
                if (p == 'height' && browser.msie6) {
                    o = '0px';
                    el.style.overflow = '';
                } else {
                    o = options.orig[p];
                }
                var old = el.style[p];
                el.style[p] = o;
                params[p] = parseFloat(getStyle(el, p, true));
                el.style[p] = old;
                if (p == 'height' && browser.msie && !params.overflow) {
                    el.style.overflow = 'hidden';
                }
            } else {
                if (options.orig[p] == undefined) {
                    options.orig[p] = getStyle(el, p, false) || '';
                }
                options.hide = true;
                params[p] = 0;
            }
        }
    }
    if (options.show && !visible) {
        show(el);
    }
    tween = new Fx.Base(el, options);
    each(params, function (name, to) {
        if (/backgroundColor|borderBottomColor|borderLeftColor|borderRightColor|borderTopColor|color|borderColor|outlineColor/.test(name)) {
            var p = (name == 'borderColor') ? 'borderTopColor' : name;
            from = getColor(el, p);
            to = getRGB(to);
        } else {
            var parts = to.toString().match(/^([+-]=)?([\d+-.]+)(.*)$/),
                start = tween.cur(name, true) || 0;
            if (parts) {
                to = parseFloat(parts[2]);
                if (parts[1]) {
                    to = ((parts[1] == '-=' ? -1 : 1) * to) + to;
                }
            }
            if (options.hide && name == 'height' && browser.msie6) {
                el.style.height = '0px';
                el.style.overflow = '';
            }
            from = tween.cur(name, true);
            if (options.hide && name == 'height' && browser.msie6) {
                el.style.height = '';
                el.style.overflow = 'hidden';
            }
            if (from == 0 && (name == 'width' || name == 'height')) from = 1;
            if (name == 'opacity' && to > 0 && !visible) {
                setStyle(el, 'opacity', 0);
                from = 0;
                show(el);
            }
        }
        if (from != to || (isArray(from) && from.join(',') == to.join(','))) {
            fromArr[name] = from;
            toArr[name] = to;
        }
    });
    tween.start(fromArr, toArr);
    data(el, 'tween', tween);
    return tween;
}

function fadeTo(el, speed, to, callback) {
    return animate(el, {
        opacity: to
    }, speed, callback);
}
var Fx = {
    Transitions: {
        linear: function(t, b, c, d) { return c*t/d + b; },
        sineInOut: function(t, b, c, d) { return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b; },
        halfSine: function(t, b, c, d) { return c * (Math.sin(Math.PI * (t/d) / 2)) + b; },
        easeOutBack: function(t, b, c, d) { var s = 1.70158; return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b; },
        easeInCirc: function(t, b, c, d) { return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b; },
        easeOutCirc: function(t, b, c, d) { return c * Math.sqrt(1 - (t=t/d-1)*t) + b; },
        easeInQuint: function(t, b, c, d) { return c*(t/=d)*t*t*t*t + b; },
        easeOutQuint: function(t, b, c, d) { return c*((t=t/d-1)*t*t*t*t + 1) + b; },
        easeOutCubic: function(t, b, c, d) { return c*((t=t/d-1)*t*t + 1) + b;},
        swiftOut: function(t, b, c, d) { return c * cubicBezier(0.4, 0, 0.22, 1, t/d, 4/d) + b; }
    },
    Attrs: [
        [ 'height', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom' ],
        [ 'width', 'marginLeft', 'marginRight', 'paddingLeft', 'paddingRight' ],
        [ 'opacity', 'left', 'top' ]
    ],
    Timers: [],
    TimerId: null
}, fx = Fx;
Fx.Base = function (el, options, name) {
    this.el = ge(el);
    this.name = name;
    this.options = extend({
        onComplete: function () {},
        transition: Fx.Transitions.sineInOut,
        duration: 500
    }, options || {});
};

function genFx(type, num) {
    var obj = {};
    each(Fx.Attrs.concat.apply([], Fx.Attrs.slice(0, num)), function () {
        obj[this] = type;
    });
    return obj;
}
// Shortcuts for custom animations
each({
    slideDown: genFx('show', 1),
    slideUp: genFx('hide', 1),
    slideToggle: genFx('toggle', 1),
    fadeIn: {
        opacity: 'show'
    },
    fadeOut: {
        opacity: 'hide'
    },
    fadeToggle: {
        opacity: 'toggle'
    }
}, function (f, val) {
    window[f] = function (el, speed, callback) {
        return animate(el, val, speed, callback);
    }
});
Fx.Base.prototype = {
    start: function (from, to) {
        this.from = from;
        this.to = to;
        this.time = Now();
        this.isTweening = true;
        var self = this;

        function t(gotoEnd) {
            return self.step(gotoEnd);
        }
        t.el = this.el;
        if (t() && Fx.Timers.push(t) && !Fx.TimerId) {
            Fx.TimerId = setInterval(function () {
                var timers = Fx.Timers;
                for (var i = 0; i < timers.length; i++)
                    if (!timers[i]()) timers.splice(i--, 1);
                if (!timers.length) {
                    clearInterval(Fx.TimerId);
                    Fx.TimerId = null;
                }
            }, 13);
        }
        return this;
    },
    stop: function (gotoEnd) {
        var timers = Fx.Timers;
        // go in reverse order so anything added to the queue during the loop is ignored
        for (var i = timers.length - 1; i >= 0; i--)
            if (timers[i].el == this.el) {
                if (gotoEnd)
                // force the next step to be the last
                    timers[i](true);
                timers.splice(i, 1);
            }
        this.isTweening = false;
    },
    step: function (gotoEnd) {
        var time = Now();
        if (!gotoEnd && time < this.time + this.options.duration) {
            this.cTime = time - this.time;
            this.now = {};
            for (p in this.to) {
                // color fx
                if (isArray(this.to[p])) {
                    var color = [],
                        j;
                    for (j = 0; j < 3; j++)
                        color.push(Math.min(parseInt(this.compute(this.from[p][j], this.to[p][j])), 255));
                    this.now[p] = color;
                } else this.now[p] = this.compute(this.from[p], this.to[p]);
            }
            this.update();
            return true;
        } else {
            //      if (this.el.className == 'im_tab3') alert('this.time: ' + this.time + ', ' + (time - this.time) + ' > ' + this.options.duration);
            setTimeout(this.options.onComplete.bind(this, this.el), 10);
            this.now = extend(this.to, this.options.orig);
            this.update();
            if (this.options.hide) hide(this.el);
            this.isTweening = false;
            return false;
        }
    },
    compute: function (from, to) {
        var change = to - from;
        return this.options.transition(this.cTime, from, change, this.options.duration);
    },
    update: function () {
        for (var p in this.now) {
            if (isArray(this.now[p])) setStyle(this.el, p, 'rgb(' + this.now[p].join(',') + ')');
            else this.el[p] != undefined ? (this.el[p] = this.now[p]) : setStyle(this.el, p, this.now[p]);
        }
    },
    cur: function (name, force) {
        if (this.el[name] != null && (!this.el.style || this.el.style[name] == null)) return this.el[name];
        return parseFloat(getStyle(this.el, name, force)) || 0;
    }
};

function getXY(obj) {
    obj = ge(obj);
    if (!obj) return [0, 0];
    var left = 0,
        top = 0,
        pos, lastLeft;
    if (obj.offsetParent) {
        do {
            left += (lastLeft = obj.offsetLeft);
            top += obj.offsetTop;
            pos = getStyle(obj, 'position');
            if (pos == 'fixed' || pos == 'absolute' || (pos == 'relative')) {
                left -= obj.scrollLeft;
                top -= obj.scrollTop;
                if (pos == 'fixed') {
                    left += ((obj.offsetParent || {}).scrollLeft || document.body.scrollLeft || document.documentElement.scrollLeft);
                    top += ((obj.offsetParent || {}).scrollTop || document.body.scrollTop || document.documentElement.scrollTop);
                }
            }
        } while (obj = obj.offsetParent);
    }
    return [left, top];
}

function getSize(elem, withoutBounds) {
    elem = ge(elem);
    var s = [0, 0],
        de = document.documentElement;
    if (elem == document) {
        s = [Math.max(
            de.clientWidth,
            bodyNode.scrollWidth, de.scrollWidth,
            bodyNode.offsetWidth, de.offsetWidth), Math.max(
            de.clientHeight,
            bodyNode.scrollHeight, de.scrollHeight,
            bodyNode.offsetHeight, de.offsetHeight)];
    } else if (elem) {
        function getWH() {
            s = [elem.offsetWidth, elem.offsetHeight];
            if (!withoutBounds) return;
            var padding = 0,
                border = 0;
            each(s, function (i, v) {
                var which = i ? ['Top', 'Bottom'] : ['Left', 'Right'];
                each(which, function () {
                    s[i] -= parseFloat(getStyle(elem, 'padding' + this)) || 0;
                    s[i] -= parseFloat(getStyle(elem, 'border' + this + 'Width')) || 0;
                });
            });
            s = [Math.round(s[0]), Math.round(s[1])];
        }
        if (!isVisible(elem)) {
            var props = {
                position: 'absolute',
                visibility: 'hidden',
                display: 'block'
            };
            var old = {};
            each(props, function (i, v) {
                old[i] = elem.style[i];
                elem.style[i] = v;
            });
            getWH();
            each(props, function (i, v) {
                elem.style[i] = old[i];
            });
        } else getWH();
    }
    return s;
}

function getPosition(e) {
    var left = 0;
    var top = 0;
    while (e.offsetParent) {
        left += e.offsetLeft;
        top += e.offsetTop;
        e = e.offsetParent;
    }
    left += e.offsetLeft;
    top += e.offsetTop;
    return [left, top];
}

function getMouseOffset(e, target) {
    var docPos = getPosition(target || e.target);
    return [e.pageX - docPos[0], e.pageY - docPos[1]];
}

function elfocus(el, from, to) {
    el = ge(el);
    try {
        el.focus();
        if (from === undefined || from === false) from = el.value.length;
        if (to === undefined || to === false) to = from;
        if (el.createTextRange) {
            var range = el.createTextRange();
            range.collapse(true);
            range.moveEnd('character', to);
            range.moveStart('character', from);
            range.select();
        } else if (el.setSelectionRange) {
            el.setSelectionRange(from, to);
        }
    } catch (e) {}
}

function scrollGetY() {
    return intval(window.pageYOffset) || document.documentElement.scrollTop;
}

function scrollGetX() {
    return window.pageXOffset || document.documentElement.scrollLeft;
}


function getScroll() {
    var b = document.body,
        de = document.documentElement;
    return [
        b.scrollLeft || de.scrollLeft || window.pageXOffset || 0,
        b.scrollTop || de.scrollTop || window.pageYOffset || 0,
        de.clientWidth || b.clientWidth || 0,
        de.clientHeight || b.clientHeight || 0
    ];
}

function windowSize() {
    return [windowWidth(), windowHeight()];
}

function windowHeight() {
    return window.innerHeight ? window.innerHeight : (document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.offsetHeight);
}

function windowWidth() {
    return window.innerWidth ? window.innerWidth : (document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.offsetWidth);
}

function show(elem) {
    if (arguments.length > 1) {
        for (var i = 0, l = arguments.length; i < l; ++i) {
            show(arguments[i]);
        }
        return;
    }
    elem = ge(elem);
    if (!elem || !elem.style) return;
    var old = elem.olddisplay,
        newStyle = 'block',
        tag = elem.tagName.toLowerCase();
    elem.style.display = old || '';
    if (getStyle(elem, 'display') == 'none') {
        if (hasClass(elem, 'inline')) {
            newStyle = 'inline';
        } else if (tag == 'tr' && !browser.msie) {
            newStyle = 'table-row';
        } else if (tag == 'table' && !browser.msie) {
            newStyle = 'table';
        } else {
            newStyle = 'block';
        }
        elem.style.display = elem.olddisplay = newStyle;
    }
}

function hide(elem) {
    var l = arguments.length;
    if (l > 1) {
        for (var i = 0; i < l; i++) {
            hide(arguments[i]);
        }
        return;
    }
    elem = ge(elem);
    if (!elem || !elem.style) return;
    var d = getStyle(elem, 'display');
    elem.olddisplay = (d != 'none') ? d : '';
    elem.style.display = 'none';
}

function isVisible(elem) {
    elem = ge(elem);
    if (!elem || !elem.style) return false;
    return getStyle(elem, 'display') != 'none';
}

function toggle(elem, v) {
    if (v === undefined) {
        v = !isVisible(elem);
    }
    if (v) {
        show(elem);
    } else {
        hide(elem);
    }
}

function placeholderSetup(id) {
    var el = ge(id);
    if (!el) return;
    if (browser.opera && browser.mobile) {
        el.getValue = function () {
            return el.value;
        };
        el.setValue = function (v) {
            el.value = v;
        };
        return;
    }
    var ph = el.getAttribute("placeholder");
    if (!el['phevents'] && ph && ph != "") {
        el['active'] = 1;
        if ((!el.value || el.value == ph) && !el.focused) {
            el.style.color = '#777';
            el.value = ph;
            el['active'] = 0;
        }
        addEvent(el, 'focus', function () {
            if (el['active']) return;
            el['active'] = 1;
            el.value = '';
            el.style.color = '#000';
        });
        addEvent(el, 'blur', function () {
            if (!el['active'] || !ph || el.value != "") return;
            el['active'] = 0;
            el.style.color = '#777';
            el.value = ph;
        });
        el.getValue = function () {
            return (el['active'] || el.value != ph) ? el.value : '';
        };
        el.setValue = function (val) {
            el.active = val ? 1 : 0;
            el.value = val ? val : ph;
            el.style.color = val ? '#000' : '#777';
        };
        el['phevents'] = 1;
    }
}

function boxRefreshCoords(cont, center) {
    var wsize = windowSize(),
        top = scrollGetY(),
        containerSize = getSize(cont);
    cont.style.top = Math.max(0, top + (wsize[1] - containerSize[1]) / 3) + 'px';
    if (center) cont.style.left = Math.max(0, (wsize[0] - containerSize[0]) / 2) + 'px';
}

function BGLayer() {
    if (!ge('popupTransparentBG')) {
        window.transparentBG = ce('div', {
            id: 'popupTransparentBG',
            className: 'popup_transparent_bg'
        }, {
            display: 'none',
            height: getSize(document)[1]
        });
        addEvent(window, 'resize', function () {
            transparentBG.style.height = getSize(document)[1] + 'px';
        });
        onDomReady(function () {
            bodyNode.appendChild(transparentBG);
        });
    }
}

function sbWidth() {
    return 16;
}

function notaBene(el, color, nofocus) {
    el = ge(el);
    if (!el) return;

    if (!nofocus) elfocus(el);
    if (data(el, 'backstyle') === undefined) data(el, 'backstyle', el.style.backgroundColor || '');
    var oldBack = data(el, 'back') || data(el, 'back', getStyle(el, 'backgroundColor'));
    var colors = {notice: '#FFFFE0', warning: '#FAEAEA'};
    setStyle(el, 'backgroundColor', colors[color] || color || colors.warning);
    setTimeout(animate.pbind(el, {backgroundColor: oldBack}, 300, function() {
        el.style.backgroundColor = data(el, 'backstyle');
    }), 400);
}

function doGetCaretPosition (el) {
    el = ge(el);
    var pos = 0;
    if (document.selection)
    {
        el.focus();
        var Sel = document.selection.createRange();
        Sel.moveStart('character', -el.value.length);
        pos = Sel.text.length;
    }
    else if (el.selectionStart || el.selectionStart == '0') pos = el.selectionStart;
    return pos;
}

function setCaretPosition(el, pos)
{
    el = ge(el);
    if(el.setSelectionRange)
    {
        el.focus();
        el.setSelectionRange(pos,pos);
    }
    else if (el.createTextRange) {
        var range = el.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }
    return true;
}

function se(html) {return ce('div', {innerHTML: html}).firstChild;}
function rs(html, repl) {
    each (repl, function(k, v) {
        html = html.replace(new RegExp('%' + k + '%', 'g'), v);
    });
    return html;
}

function val(input, value, nofire) {
    input = ge(input);
    if (!input) return;

    if (value !== undefined) {
        if (input.setValue) {
            input.setValue(value);
            !nofire && input.phonblur && input.phonblur();
        } else if (input.tagName == 'INPUT' || input.tagName == 'TEXTAREA') {
            input.value = value
        } else {
            input.innerHTML = value
        }
    }
    return input.getValue ? input.getValue() :
        (((input.tagName == 'INPUT' || input.tagName == 'TEXTAREA') ? input.value : input.innerHTML) || '');
}

function domEL(el, p) {
    p = p ? 'previousSibling' : 'nextSibling';
    while (el && !el.tagName) el = el[p];
    return el;
}
function domNS(el) {
    return domEL((el || {}).nextSibling);
}
function domPS(el) {
    return domEL((el || {}).previousSibling, 1);
}
function domFC(el) {
    return domEL((el || {}).firstChild);
}
function domLC(el) {
    return domEL((el || {}).lastChild, 1);
}
function domPN(el) {
    return (el || {}).parentNode;
}

function onMousePast(ovner, onHide){
    var past = {
        obj:ge(ovner),
        test: function(obj){
            if(obj!==past.obj){
                if(obj.parentNode) {
                    past.test(obj.parentNode);
                } else {
                    if(isFunction(onHide)) onHide();
                    past.hide();
                }
            }
        },
        detect: function(e){
            past.test(e.target);
        },
        show: function(){
            addEvent(document, 'keypress keydown mousedown', past.detect);
        },
        hide: function(){
            removeEvent(document, 'keypress keydown mousedown', past.detect);
        }
    };
    return past;
}

function scrollToY(y, speed, anim) {
    if (speed == undefined) speed = 400;

    var isTouchDevice = ('ontouchstart' in document.documentElement);
    if (isTouchDevice) {
        speed = 0;
    }

    if (browser.msie6) {
        if (data(bodyNode, 'tween')) data(bodyNode, 'tween').stop(false);
    } else {
        if (data(bodyNode, 'tween')) data(bodyNode, 'tween').stop(false);
        if (data(htmlNode, 'tween')) data(htmlNode, 'tween').stop(false);
    }
    window.scrollAnimation = false;
    if (speed) {
        var updT = function() {
            window.scrollAnimation = false;
        };
        window.scrollAnimation = true;
        if (browser.msie6) {
            animate(bodyNode, {scrollTop: y}, speed, updT);
        } else {
            animate(htmlNode, {scrollTop: y, transition: Fx.Transitions.easeInCirc}, speed, updT);
            animate(bodyNode, {scrollTop: y, transition: Fx.Transitions.easeInCirc}, speed, updT);
        }
    } else {
        if (anim && anim !== 2) {
            var diff = scrollGetY() - y;
            if (Math.abs(diff) > 6) {
                scrollToY(y+(diff > 0 ? 6 : -6), 0, 2);
            }
            clearTimeout(window.scrlToTO);
            window.scrlToTO = setTimeout(scrollToY.pbind(y, 100, 2), 0);
            return;
        }
        window.scroll(scrollGetX(), y);
        if (browser.msie6) {
            bodyNode.scrollTop = y;
        }
    }
}

function scrollToTop(speed) {
    return scrollToY(0, speed);
}