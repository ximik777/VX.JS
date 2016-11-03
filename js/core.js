var base_domain = location.protocol + '//' + location.host,
    _ua = navigator.userAgent.toLowerCase(),
    lang = lang || {},
    rtl = false,
    parseJSON = (window.JSON && JSON.parse) ? function (obj) {
        try {
            return JSON.parse(obj);
        } catch (e) {
            try {
                return eval('(' + obj + ')');
            } catch (e) {
                return false;
            }
        }
    } : function (obj) {
        try {
            return eval('(' + obj + ')');
        } catch (e) {
            return false;
        }
    };

if (window.console == undefined) {
    window.console = {
        log: function (message) {
        },
        info: function (message) {
        },
        warn: function (message) {
        },
        error: function (message) {
        },
        time: function () {
        },
        timeEnd: function () {
        }
    }
}

var browser = {
    version: (_ua.match(/.+(?:me|ox|on|rv|it|era|ie)[\/: ]([\d.]+)/) || [0, '0'])[1],
    opera: /opera/i.test(_ua),
    msie: (/msie/i.test(_ua) && !/opera/i.test(_ua)),
    msie6: (/msie 6/i.test(_ua) && !/opera/i.test(_ua)),
    msie7: (/msie 7/i.test(_ua) && !/opera/i.test(_ua)),
    msie8: (/msie 8/i.test(_ua) && !/opera/i.test(_ua)),
    msie9: (/msie 9/i.test(_ua) && !/opera/i.test(_ua)),
    mozilla: /firefox/i.test(_ua),
    chrome: /chrome/i.test(_ua),
    safari: (!(/chrome/i.test(_ua)) && /webkit|safari|khtml/i.test(_ua)),
    iphone: /iphone/i.test(_ua),
    ipod: /ipod/i.test(_ua),
    iphone4: /iphone.*OS 4/i.test(_ua),
    ipod4: /ipod.*OS 4/i.test(_ua),
    ipad: /ipad/i.test(_ua),
    android: /android/i.test(_ua),
    bada: /bada/i.test(_ua),
    mobile: /iphone|ipod|ipad|opera mini|opera mobi|iemobile/i.test(_ua),
    msie_mobile: /iemobile/i.test(_ua),
    safari_mobile: /iphone|ipod|ipad/i.test(_ua),
    opera_mobile: /opera mini|opera mobi/i.test(_ua),
    opera_mini: /opera mini/i.test(_ua),
    mac: /mac/i.test(_ua),
    webkit: /webkit/i.test(_ua),
    search_bot: /(yandex|google|stackrambler|aport|slurp|msnbot|bingbot|twitterbot|ia_archiver|facebookexternalhit)/i.test(_ua)
};

function isFunction(obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
}

function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

function rand(mi, ma) {
    return Math.random() * (ma - mi + 1) + mi;
}

function irand(mi, ma) {
    return Math.floor(rand(mi, ma));
}

function isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

function createImage() {
    return window.Image ? (new Image()) : ce('img');
} // IE8 workaround
function trim(text) {
    return (text || '').replace(/^\s+|\s+$/g, '');
}

function stripHTML(text) {
    return text ? text.replace(/<(?:.|\s)*?>/g, '') : '';
}

function escapeRE(s) {
    return s ? s.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1') : '';
}

function unicodeEscape(str) {
    return str.replace(/[\s\S]/g, function (character) {
        var escape = character.charCodeAt().toString(16),
            longhand = escape.length > 2;
        return '\\' + (longhand ? 'u' : 'x') + ('0000' + escape).slice(longhand ? -4 : -2);
    });
}

function addslashes(str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

function intval(value) {
    if (value === true) return 1;
    return parseInt(value) || 0;
}

function floatval(value) {
    if (value === true) return 1;
    return parseFloat(value) || 0;
}

function positive(value) {
    value = intval(value);
    return value < 0 ? 0 : value;
}

function isEmpty(o) {
    if (Object.prototype.toString.call(o) !== '[object Object]') {
        return false;
    }
    for (var i in o) {
        if (o.hasOwnProperty(i)) {
            return false;
        }
    }
    return true;
}

function Now() {
    return +new Date;
}
Function.prototype.pbind = function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(window);
    return this.bind.apply(this, args);
};
Function.prototype.bind = function () {
    var func = this,
        args = Array.prototype.slice.call(arguments);
    var obj = args.shift();
    return function () {
        var curArgs = Array.prototype.slice.call(arguments);
        return func.apply(obj, args.concat(curArgs));
    }
};

function indexOf(arr, value, from) {
    for (var i = from || 0, l = (arr || []).length; i < l; i++) {
        if (arr[i] == value) return i;
    }
    return -1;
}

function inArray(value, arr) {
    return indexOf(arr, value) != -1;
}

function each(object, callback) {
    var name, i = 0,
        length = object.length;
    if (length === undefined) {
        for (name in object)
            if (callback.call(object[name], name, object[name]) === false) break;
    } else {
        for (var value = object[0]; i < length && callback.call(value, i, value) !== false; value = object[++i]) {
        }
    }
    return object;
}

function extend() {
    var a = arguments,
        target = a[0] || {}, i = 1,
        l = a.length,
        deep = false,
        options;
    if (typeof target === 'boolean') {
        deep = target;
        target = a[1] || {};
        i = 2;
    }
    if (typeof target !== 'object' && !isFunction(target)) target = {};
    for (; i < l; ++i) {
        if ((options = a[i]) != null) {
            for (var name in options) {
                var src = target[name],
                    copy = options[name];
                if (target === copy) continue;
                if (deep && copy && typeof copy === 'object' && !copy.nodeType) {
                    target[name] = extend(deep, src || (copy.length != null ? [] : {}), copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }
    return target;
}

function winToUtf(text) {
    var m, i, j, code;
    m = text.match(/&#[0-9]{2}[0-9]*;/gi);
    for (j in m) {
        var v = '' + m[j]; // buggy IE6
        code = intval(v.substr(2, v.length - 3));
        if (code >= 32 && ('&#' + code + ';' == v)) { // buggy IE6
            text = text.replace(v, String.fromCharCode(code));
        }
    }
    return text.replace(/&quot;/gi, '"').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&');
}

function clone(obj, req) {
    var newObj = isArray(obj) ? [] : {};
    for (var i in obj) {
        if (browser.webkit && (i == 'layerX' || i == 'layerY')) continue;
        if (req && typeof (obj[i]) === 'object' && i !== 'prototype') {
            newObj[i] = clone(obj[i]);
        } else {
            newObj[i] = obj[i];
        }
    }
    return newObj;
}
reqs = [];
res = [];
(function () {
    var lastLength = 0;
    window.checkTextLength = function (max_len, val, warn, nobr, display) {
        if (lastLength == val.length) return;
        lastLength = val.length;
        var n_len = replaceChars(val, nobr).length;
        if (n_len > max_len - 100) {
            show(warn);
        } else {
            hide(warn);
        }
        if (n_len > max_len) {
            warn.innerHTML = getLang('text_exceeds_symbol_limit', n_len - max_len);
        } else if (n_len > max_len - 100) {
            warn.innerHTML = getLang('text_N_symbols_remain', max_len - n_len);
        } else {
            warn.innerHTML = '';
        }
    };
    window.replaceChars = function (text, nobr) {
        var res = "";
        for (var i = 0; i < text.length; i++) {
            var c = text.charCodeAt(i);
            switch (c) {
                case 0x26:
                    res += "&amp;";
                    break;
                case 0x3C:
                    res += "&lt;";
                    break;
                case 0x3E:
                    res += "&gt;";
                    break;
                case 0x22:
                    res += "&quot;";
                    break;
                case 0x0D:
                    res += "";
                    break;
                case 0x0A:
                    res += nobr ? "\t" : "<br>";
                    break;
                case 0x21:
                    res += "&#33;";
                    break;
                case 0x27:
                    res += "&#39;";
                    break;
                default:
                    res += ((c > 0x80 && c < 0xC0) || c > 0x500) ? "&#" + c + ";" : text.charAt(i);
                    break;
            }
        }
        return res;
    };
})();
var reqs = {};

function attachScript(id, c, callback) {
    var i, new_id = c.substr(c.indexOf('/') + 1, c.indexOf('.') - c.indexOf('/') + 2).replace(/[\/\.]/g, '_');
    var newreqs = [];
    for (var reqnum in reqs) {
        req = reqs[reqnum];
        if (req) {
            if (req.running == 0) {
                ge('req' + req.num).parentNode.removeChild(ge('req' + req.num));
                reqs[reqnum] = null;
            } else {
                newreqs[reqnum] = req;
            }
        }
    }
    reqs = newreqs;
    var ob = ce('script', {
        id: id,
        type: 'text/javascript',
        src: ((!/^http:\/\//i.test(c) && !/^\//i.test(c)) ? base_domain : '') + c
    });
    if (callback) {
        ob.onreadystatechange = callback;
        ob.onload = callback;
    }
    headNode.appendChild(ob);
}

function destroy() {
    if (reqs[this.num]) {
        reqs[this.num].running = 0;
    }
}

function addCss(c) {
    var new_id = c.substr(c.indexOf('/') + 1, c.indexOf('.') - c.indexOf('/') - 1) + '_css';
    if (!ge(new_id)) {
        headNode.appendChild(
            ce('link', {
                type: 'text/css',
                rel: 'stylesheet',
                href: base_domain + c + (css_versions[new_id] ? ('?' + css_versions[new_id]) : ''),
                id: new_id,
                media: 'screen'
            }));
    }
}

function debugLog(a) {
    console.log(a);
}

var ls = {
    _init: function () {
        return (window.localStorage !== undefined && window.JSON !== undefined);
    },
    set: function (k, v) {
        this.remove(k);
        try {
            return (ls._init()) ? localStorage.setItem(k, JSON.stringify(v)) : false;
        } catch (e) {
            return false;
        }
    },
    get: function (k) {
        if (!ls._init()) {
            return false;
        }
        try {
            return JSON.parse(localStorage.getItem(k));
        } catch (e) {
            return false;
        }
    },
    remove: function (k) {
        try {
            localStorage.removeItem(k);
        } catch (e) {
        }
    },
    flush: function () {
        try {
            localStorage.clear();
        } catch (e) {
        }
    }
};