createChildClass('Cache', UiUtil, {
    defaultOptions: {
        cacheLength: 100
    },
    componentName: 'Cache',
    initOptions: function (options) {
        this.options = extend({}, this.defaultOptions, options);
    },
    init: function () {
        this.storage = {};
        this.length = 0;
    },
    setData: function (key, value) {
        if (this.length > this.options.cacheLength) {
            this.flush();
        }
        if (!(key in this.storage)) {
            this.length++;
        }
        this.storage[key] = clone(value);
    },
    getData: function (key) {
        if (!this.options.cacheLength || !this.length || !(key in this.storage)) {
            return null;
        }
        return this.storage[key];
    },
    flush: function () {
        delete this.storage;
        this.storage = {};
        this.length = 0;
    }
});