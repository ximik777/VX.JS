function inherit(child, parent) {
    var F = function () {
    };
    F.prototype = parent.prototype;
    child.prototype = new F();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
}

function createChildClass(className, parent, proto) {
    var code = 'function ' + className + ' (a, b, c, d) {\
    if (this == window || this.setInterval) return new ' + className + '(a, b, c, d);\
    this.__className = "' + className + '";\
    return this.__construct__(arguments);\
  };';
    if (window.execScript) {
        window.execScript(code);
    } else {
        window.eval(code);
    }
    var childClass = eval('(' + className + ')');
    inherit(childClass, parent);
    if (('common' in proto)) {
        extend(childClass, proto['common']);
        proto['common'] = childClass;
    }
    extend(childClass.prototype, proto);
}
if (window._ui === undefined) {
    var _ui = {
        _guid: 0,
        _sel: false,
        _uids: [false],
        reg: function (obj) {
            _ui._uids.push(obj);
            return ++_ui._guid;
        },
        sel: function (nsel) {
            if (nsel !== undefined) {
                var s = _ui.selobj();
                if (s && s._blur) {
                    s._blur();
                }
                _ui._sel = nsel;
            }
            return _ui._sel;
        },
        selobj: function (val) {
            if (_ui._sel && val !== undefined) {
                _ui._uids[_ui._sel] = val;
            }
            return _ui._uids[_ui._sel];
        }
    };
    addEvent(document, 'keypress keydown mousedown', function (e) {
        if (_ui.sel()) {
            var sel = _ui.selobj();
            if (!sel) {
                return _ui.sel(false);
            }
            if (sel.container && sel.container != ge(sel.container.id)) {
                _ui.selobj(false);
                return _ui.sel(false);
            }
            sel.onEvent(e);
        }
    });
}

function UiControl(args) {
    return this.__construct__(args);
}
extend(UiControl.prototype, {
    CSS: {},
    defaultOptions: null,
    dom: {},
    __construct__: function (args) {
        if (this.beforeInit)
            if (this.beforeInit.apply(this, args) === false) return false;
        if (this.initOptions)
            if (this.initOptions.apply(this, args) === false) return false;
        if (this.init.apply(this, args) === false) return false;
        if (this.initDOM)
            if (this.initDOM.apply(this, args) === false) return false;
        if (this.initEvents) this.initEvents.apply(this, args);
        if (this.afterInit) this.afterInit.apply(this, args);
        return this;
    },
    beforeInit: null,
    initOptions: null,
    init: null,
    initDOM: null,
    initEvents: null,
    afterInit: null,
    show: null,
    hide: null
});

function createUiClass(className, functions) {
    return createChildClass(className, UiControl, functions);
}

function UiUtil(args) {
    return this.__construct__(args);
}
extend(UiUtil.prototype, {
    defaultOptions: null,
    __components: {},
    __cid: 0,
    storage: null,
    __construct__: function (args) {
        if (this.beforeInit) this.beforeInit.apply(this, args);
        if (this.initOptions) this.initOptions.apply(this, args);
        this.init.apply(this, args);
        if (this.initEvents) this.initEvents.apply(this, args);
        if (this.afterInit) this.afterInit.apply(this, args);
        this.__components[(this.componentName ? this.componentName : this.__className) + (this.__cid++)] = this;
        return this;
    },
    beforeInit: null,
    initOptions: null,
    init: null,
    initEvents: null,
    afterInit: null
});

function createUtilClass(className, functions) {
    return createChildClass(className, UiUtil, functions);
}

function JsClass(args) {
    return this.__construct__(args);
}
extend(JsClass.prototype, {
    defaultOptions: null,
    __construct__: function (args) {
        if (this.beforeInit) this.beforeInit.apply(this, args);
        if (this.initOptions) this.initOptions.apply(this, args);
        this.init.apply(this, args);
        if (this.initEvents) this.initEvents.apply(this, args);
        if (this.afterInit) this.afterInit.apply(this, args);
        return this;
    },
    beforeInit: null,
    initOptions: null,
    init: null,
    initEvents: null,
    afterInit: null
});

function createClass(className, functions) {
    return createChildClass(className, JsClass, functions);
}