var KEY = window.KEY = {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        DEL: 8,
        TAB: 9,
        RETURN: 13,
        ENTER: 13,
        ESC: 27,
        PAGEUP: 33,
        PAGEDOWN: 34,
        SPACE: 32,
        CTRL: 17,
        BACKSPACE: 8
    },
    eventExpand = 'EV' + Now(),
    eventUUID = 0,
    eventCache = {},
    eventDebugMode = false;


function addEvent(elem, types, handler, custom, context) {
    elem = ge(elem);
    if (!elem || elem.nodeType == 3 || elem.nodeType == 8) return;
    if (/mousewheel/.test(types)) {
        types = types + ' DOMMouseScroll';
    }
    if (/outclick/.test(types) || /outpress/.test(types)) {
        types = types.replace('outclick', 'mousedown');
        types = types.replace('outpress', 'keypress keydown');
        handler = eventOut.set(elem, handler);
        elem = document;
    }

    var realHandler = context ? function () {
        var newHandler = function (e) {
            var prevData = e.data;
            e.data = context;
            var ret = handler.apply(this, [e]);
            e.data = prevData;
            return ret;
        };
        newHandler.handler = handler;
        return newHandler;
    }() : handler;
    // For IE
    if (elem.setInterval && elem != window) elem = window;
    var events = data(elem, 'events') || data(elem, 'events', {}),
        handle = data(elem, 'handle') || data(elem, 'handle', function () {
            _eventHandle.apply(arguments.callee.elem, arguments);
        });
    // to prevent a memory leak
    handle.elem = elem;
    each(types.split(/\s+/), function (index, type) {
        if (!events[type]) {
            events[type] = [];
            if (!custom && elem.addEventListener) {
                elem.addEventListener(type, handle, false);
            } else if (!custom && elem.attachEvent) {
                elem.attachEvent('on' + type, handle);
            }
        }
        events[type].push(realHandler);
    });
    elem = null;
}

function removeEvent(elem, types, handler) {
    elem = ge(elem);
    if (!elem) return;
    if (/outclick/.test(types) || /outpress/.test(types)) {
        types = types.replace('outclick', 'mousedown');
        types = types.replace('outpress', 'keypress keydown');
        handler = eventOut.get(handler);
        eventOut.del(handler);
        elem = document;
    }
    var events = data(elem, 'events');
    if (!events) return;
    if (typeof (types) != 'string') {
        for (var i in events) {
            removeEvent(elem, i);
        }
        return;
    }
    if (/mousewheel/.test(types)) {
        types = types + ' DOMMouseScroll';
    }

    each(types.split(/\s+/), function (index, type) {
        if (!isArray(events[type])) return;
        var l = events[type].length;
        if (isFunction(handler)) {
            for (var i = l - 1; i >= 0; i--) {
                if (events[type][i] && (events[type][i] === handler || events[type][i].handler === handler)) {
                    events[type].splice(i, 1);
                    l--;
                    break;
                }
            }
        } else {
            for (var i = 0; i < l; i++) {
                delete events[type][i];
            }
            l = 0;
        }
        if (!l) {
            if (elem.removeEventListener) {
                elem.removeEventListener(type, data(elem, 'handle'), false);
            } else if (elem.detachEvent) {
                elem.detachEvent('on' + type, data(elem, 'handle'));
            }
            delete events[type];
        }
    });
    if (isEmpty(events)) {
        removeData(elem, 'events');
        removeData(elem, 'handle');
    }
}

function triggerEvent(elem, type, ev, now) {
    elem = ge(elem);
    var handle = data(elem, 'handle');
    if (handle) {
        var f = function () {
            handle.call(elem, extend((ev || {}), {
                type: type,
                target: elem
            }))
        };
        now ? f() : setTimeout(f, 0);
    }
}

function cancelEvent(event) {
    event = (event || window.event);
    if (!event) return false;
    while (event.originalEvent) {
        event = event.originalEvent;
    }
    if (event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
    event.cancelBubble = true;
    event.returnValue = false;
    return false;
}

function removeData(elem, name) {
    var id = elem ? elem[eventExpand] : false;
    if (!id) return;
    if (name) {
        if (eventCache[id]) {
            delete eventCache[id][name];
            name = '';
            var count = 0;
            for (name in eventCache[id]) {
                if (name !== '__elem') {
                    count++;
                    break;
                }
            }
            if (!count) {
                removeData(elem);
            }
        }
    } else {
        removeEvent(elem);
        removeAttr(elem, eventExpand);
        delete eventCache[id];
    }
}

function cleanElems() {
    var a = arguments;
    for (var i = 0; i < a.length; ++i) {
        var el = ge(a[i]);
        if (el) {
            removeData(el);
            removeAttr(el, 'btnevents');
        }
    }
}

function data(elem, name, data) {
    var id = elem[eventExpand],
        undefined;
    if (!id) {
        id = elem[eventExpand] = ++eventUUID;
    }
    if (data !== undefined) {
        if (!eventCache[id]) {
            eventCache[id] = {};
            if (eventDebugMode) eventCache[id].__elem = elem;
        }
        eventCache[id][name] = data;
    }
    return name ? eventCache[id] && eventCache[id][name] : id;
}

function removeAttr(el) {
    for (var i = 0, l = arguments.length; i < l; ++i) {
        var n = arguments[i];
        if (el[n] === undefined) continue;
        try {
            delete el[n];
        } catch (e) {
            try {
                el.removeAttribute(n);
            } catch (e) {}
        }
    }
}

function _eventHandle(event) {
    event = normEvent(event);
    var handlers = data(this, 'events');
    if (!handlers || typeof (event.type) != 'string' || !handlers[event.type] || !handlers[event.type].length) {
        return;
    }
    for (var i in (handlers[event.type] || [])) {
        if (event.type == 'mouseover' || event.type == 'mouseout') {
            var parent = event.relatedElement;
            while (parent && parent != this) {
                try {
                    parent = parent.parentNode;
                } catch (e) {
                    parent = this;
                }
            }
            if (parent == this) {
                continue
            }
        }
        var ret = handlers[event.type][i].apply(this, arguments);
        if (ret === false || ret === -1) {
            cancelEvent(event);
        }
        if (ret === -1) {
            return false;
        }
    }
}

function normEvent(event) {
    event = event || window.event;
    var originalEvent = event;
    event = clone(originalEvent);
    event.originalEvent = originalEvent;
    if (!event.target) {
        event.target = event.srcElement || document;
    }
    // check if target is a textnode (safari)
    if (event.target.nodeType == 3) {
        event.target = event.target.parentNode;
    }
    if (!event.relatedTarget && event.fromElement) {
        event.relatedTarget = event.fromElement == event.target;
    }
    if (event.pageX == null && event.clientX != null) {
        var doc = document.documentElement,
            body = bodyNode;
        event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
        event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
    }
    if (!event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode)) {
        event.which = event.charCode || event.keyCode;
    }
    if (!event.metaKey && event.ctrlKey) {
        event.metaKey = event.ctrlKey;
    } else if (!event.ctrlKey && event.metaKey && browser.mac) {
        event.ctrlKey = event.metaKey;
    }
    // click: 1 == left; 2 == middle; 3 == right
    if (!event.which && event.button) {
        event.which = (event.button & 1 ? 1 : (event.button & 2 ? 3 : (event.button & 4 ? 2 : 0)));
    }

    if ((event.type==="mousewheel" || event.type==="wheel" || event.type==="DOMMouseScroll") && (event.wheelDelta || event.detail)) {
        event.wheelDelta = event.detail = ((event.wheelDelta) ? event.wheelDelta / 120 : event.detail / -3) > 0 ? 1 : -1;
    }

    return event;
}

function onCtrlEnter(event, handler) {
    event = event || window.event;
    if (event.keyCode == 10 || event.keyCode == 13 && (event.ctrlKey || event.metaKey && browser.mac)) {
        handler();
        cancelEvent(event);
    }
}

function press(e, code)
{
    return ((e.keyCode==KEY[code]));
}

function getTarget(e) {
    return e.srcElement || e.target;
}

var eventOut = {
    '_o': [],
    '_n': [],
    'get': function(handle){
        var i;
        for(i=0; i<this._o.length; i++){
            if(this._o[i] == handle){
                break;
            }
        }
        return this._n[i] ? this._n[i] : false;
    },
    'set': function(obj, handle){
        var _n_handle = this.prepare(obj, handle);
        this._o.push(handle);
        this._n.push(_n_handle);
        return _n_handle;
    },
    'del': function(handle){
        var i;
        for(i=0; i<this._n.length; i++){
            if(this._n[i] == handle){
                break;
            }
        }

        if(this._o[i])
            delete this._o[i];
        if(this._n[i])
            delete this._n[i];
    },
    'prepare': function(obj, handle){
        if (!isFunction(handle))
            return;
        return (function(e){
            var isChildOf = function (obj, target) {
                if (obj !== target) {
                    if (target.parentNode) {
                        isChildOf(obj, target.parentNode);
                    } else {
                        handle(e);
                    }
                }
            };
            isChildOf(obj, getTarget(e));
        });
    }
};