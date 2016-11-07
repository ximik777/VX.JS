var ajax = {
    badbrowser: '/badbrowser.php',
    isFormDataSupport: (window.FormData !== undefined),
    _init: function () {

        var r = false;
        try {
            if (r = new XMLHttpRequest()) {
                ajax._req = function () {
                    return new XMLHttpRequest();
                };
                return;
            }
        } catch (e) {
        }
        each(['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP'], function () {
            try {
                var t = '' + this;
                if (r = new ActiveXObject(t)) {
                    (function (n) {
                        ajax._req = function () {
                            return new ActiveXObject(n);
                        }
                    })(t);
                    return false;
                }
            } catch (e) {
            }
        });
        if (!ajax._req && !browser.search_bot) {
            location.replace(ajax.badbrowser);
        }
    },
    _getreq: function () {
        if (!ajax._req) ajax._init();
        return ajax._req();
    },
    _post: function (url, query, callback, urlonly) {
        var r = ajax._getreq();
        r.onreadystatechange = function () {
            if (r.readyState == 4) {
                var is_fail = !(r.status >= 200 && r.status < 300);
                if (callback) callback(r.responseText, is_fail, r);
            }
        };
        try {
            r.open('POST', url, true);
        } catch (e) {
            return false;
        }
        if (!urlonly) {
            r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            r.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        r.send(query);
        return r;
    },
    _get: function (url, callback) {
        var r = ajax._getreq();
        r.onreadystatechange = function () {
            if (r.readyState == 4) {
                var is_fail = !(r.status >= 200 && r.status < 300);
                if (callback) callback(r.responseText, is_fail, r);
            }
        };
        try {
            r.open('GET', url, true);
        } catch (e) {
            return false;
        }
        r.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        r.send('');
        return r;
    },
    plainpost: function (url, query, callback, urlonly) {
        var q = (typeof(query) != 'string') ? ajx2q(query) : query;
        return ajax._post(url, query, callback, urlonly);
    },
    post: function (url, query, callback) {
        var urlonly = false, q = query,
            done = function (res, fail, req) {

                var json = parseJSON(res);

                if (!json || fail) {
                    res = {"error": true, "message": "global-error", "traceback": res};
                    fail = true;
                } else {
                    res = json;
                }

                if (callback) callback(res, fail, req);
            };

        if (typeof (query) != 'string') {
            urlonly = ajax.checkDataFile(query);
            q = urlonly ? ajax.createFormData(query) : ajx2q(query);
        }

        return ajax._post(url, q, done, urlonly);
    },
    get: function (url, query, callback) {
        var q = (typeof (query) != 'string') ? ajx2q(query) : query;
        if (q) {
            url += ~url.indexOf('?') ? '&' : '?';
            url += q;
        }

        return ajax._get(url, callback);
    },
    parseRes: function (r) {
        var res = r.replace(/^[\s\n]+/g, '');
        if (res.substr(0, 10) == "<noscript>") {
            try {
                var arr = res.substr(10).split("</noscript>");
                eval(arr[0]);
                return arr[1];
            } catch (e) {
                console.log('eval ajax script:' + e.message);
            }
        }
        return r;
    },
    isInput: function (obj) {
        return Object.prototype.toString.call(obj) === '[object HTMLInputElement]';
    },
    checkDataFile: function (obj) {
        if (!isObject(obj) || !ajax.isFormDataSupport) return false;
        for (var i in obj) {
            if (ajax.isInput(obj[i]) && 'files' in obj[i] && obj[i].files.length > 0) {
                return true;
            }
        }
        return false;
    },
    createFormData: function (obj) {
        var formData = new FormData();

        for (var i in obj) {
            if (ajax.isInput(obj[i]) && 'files' in obj[i] && obj[i].files.length > 0) {
                formData.append(i, obj[i].files[0]);
            } else {
                formData.append(i, obj[i]);
            }
        }

        return formData;
    }
};


function ajx2q(qa) {
    var query = [],
        enc = function (str) {
            if (window._decodeEr && _decodeEr[str]) {
                return str;
            }
            try {
                return encodeURIComponent(str);
            } catch (e) {
                return str;
            }
        };
    for (var key in qa) {
        if (qa[key] == null || isFunction(qa[key])) continue;
        if (isArray(qa[key])) {
            for (var i = 0, c = 0, l = qa[key].length; i < l; ++i) {
                if (qa[key][i] == null || isFunction(qa[key][i])) {
                    continue;
                }
                query.push(enc(key) + '[' + c + ']=' + enc(qa[key][i]));
                ++c;
            }
        } else {
            query.push(enc(key) + '=' + enc(qa[key]));
        }
    }
    query.sort();
    return query.join('&');
}

function q2ajx(qa) {
    if (!qa) return {};
    var query = {}, dec = function (str) {
        try {
            return decodeURIComponent(str);
        } catch (e) {
            window._decodeEr = window._decodeEr || {};
            _decodeEr[str] = 1;
            return str;
        }
    };
    qa = qa.split('&');
    each(qa, function (i, a) {
        var t = a.split('=');
        if (t[0]) {
            var v = dec(t[1] + '');
            if (t[0].substr(t.length - 2) == '[]') {
                var k = dec(t[0].substr(0, t.length - 2));
                if (!query[k]) {
                    query[k] = [];
                }
                query[k].push(v);
            } else {
                query[dec(t[0])] = v;
            }
        }
    });
    return query;
}

var JsonpCallbackRegister = {};
function Jsonp(url, data, options) {
    var onSuccess,
        onFail,
        q = (typeof (data) != 'string') ? ajx2q(data) : data,
        scriptOk = false,
        callbackName = 'f' + String(Math.random()).slice(2);
    if (!options) options = {};
    if (isFunction(options)) {
        onSuccess = options;
    } else {
        onSuccess = options.onSuccess;
        onFail = options.onFail;
    }
    url += ~url.indexOf('?') ? '&' : '?';
    url += 'callback=JsonpCallbackRegister.' + callbackName;
    url += '&' + q;

    JsonpCallbackRegister[callbackName] = function (response) {
        scriptOk = true;
        delete JsonpCallbackRegister[callbackName];
        onSuccess(response);
    };

    function checkCallback() {
        if (scriptOk) return;
        delete JsonpCallbackRegister[callbackName];
        onFail(url);
    }

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('encoding', 'UTF-8');
    script.onreadystatechange = function () {
        if (this.readyState == 'complete' || this.readyState == 'loaded') {
            this.onreadystatechange = null;
            setTimeout(checkCallback, 0);
        }
    };
    script.onload = script.onerror = checkCallback;
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
}
