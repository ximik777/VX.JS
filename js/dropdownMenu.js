createChildClass('DropdownMenu', UiControl, {
    // Static class fields
    common: {
        pageContainer: null
    },
    defaultOptions: {
        title: 'Menu',
        hideOnClick: true,
        showHover: true,
        updateTarget: true,
        alwaysMenuToUp: false,
        columnsCount: false,
        offsetLeft: -7,
        offsetTop: -4,
        onSelect: function () {},
        updateHeader: function (i, t) {
            return t;
        }
    },
    controlName: 'DropdownMenu',
    // Standart object methods
    beforeInit: function () {
        this.guid = _ui.reg(this);
        if (!this.common.pageContainer) {
            this.common.pageContainer = document.body;
            if (browser.msie6 && ge('pageContainer')) {
                this.pageContainer = ge('pageContainer');
            }
        }
    },
    initOptions: function (items, options) {
        if (!options.title && options.target) options.title = options.target.innerHTML;
        this.options = extend({}, this.defaultOptions, options);
    },
    init: function (input, options) {
        this.visible = false;
        this.offsetTop = 0;
        this.mouseTimer = 0;
        this.childMenus = [];
        this.childIsOver = false;
        if (options.parentMenu) {
            this.parentMenu = options.parentMenu;
            this.parentMenu.childMenus.push(this);
        }
        this.isOver = false;
        this.value = options.value || 0;
        this.items = {};
    },
    initDOM: function (input, options) {
        this.container = ce('div', {
            className: 'dd_menu' + (options.containerClass ? ' ' + options.containerClass : ''),
            id: 'dd_menu' + this.guid
        });
        this.header = ce('div', {
            className: 'dd_menu_header',
            innerHTML: '<div>' + this.options.title.replace(/\s+/g, '&nbsp;') + '</div>'
        });
        this.body = ce('div', {
            className: 'dd_menu_body',
            innerHTML: '<table cellspacing="0" cellpadding="0"><tbody><tr><td class="dd_menu_shad_l"><div></div></td><td><div class="dd_menu_shad_t2"></div><div class="dd_menu_shad_t"></div><div id="dd_rows_' + this.guid + '" class="dd_menu_rows"></div><div class="dd_menu_shad_b"></div><div class="dd_menu_shad_b2"></div></td><td class="dd_menu_shad_r"><div> </div></td></tr></tbody></table>'
        });
        this.container.appendChild(this.header);
        this.container.appendChild(this.body);
        hide(this.header);
        hide(this.body);
        // Container for menu items
        this.rows = ce('div', {
            'id': 'rows' + this.guid,
            'className': 'dd_menu_rows2'
        });
    },
    initEvents: function () {
        addEvent(this.container, 'mouseover mouseout', this.handleMouseEvent, false, {
            'self': this
        });
    },
    afterInit: function (items, options) {
        this.setData(items);
        var self = this;
        onDomReady(function () {
            (self.common.pageContainer || window.pageNode).appendChild(self.container);
            var header = self.header,
                body = self.body,
                target = self.options.target;
            ge('dd_rows_' + self.guid).appendChild(self.rows);
            self.setOptions(self.options);
            if (target) {
                if (target.innerHTML.indexOf('<') == -1) {
                    target.innerHTML = target.innerHTML.replace(/\s+/g, '&nbsp;');
                }
                target.onclick = function () {
                    self.show();
                    return false;
                };
                if (target.tagName == 'A') {
                    target.className += ' dd_menu_target';
                }
            }
            if (self.options.target && self.options.showHover) {
                var timer;
                var outFunc = function () {
                    if (self.parentMenu) {
                        self.parentMenu.childIsOver = false;
                    }
                    if (!self.visible) hide(header);
                    removeClass(header, 'dd_header_hover');
                };
                self.showTargetHover = function () {
                    if (self.parentMenu) {
                        self.parentMenu.childIsOver = true;
                    }
                    addClass(header, 'dd_header_hover');
                    self.moveToTarget();
                    show(header);
                    timer = setTimeout(outFunc, 100);
                };
                addEvent(self.options.target, 'mouseover', self.showTargetHover);
                addEvent(header, 'mouseover', function () {
                    if (self.parentMenu) {
                        self.parentMenu.childIsOver = true;
                    }
                    clearTimeout(timer);
                });
                addEvent(header, 'mouseout', outFunc);
            }
        });
    },
    moveTo: function (left, top) {
        left = intval(left);
        top = intval(top);
        extend(this.container.style, {
            top: top + 'px',
            left: left + 'px'
        });
        setStyle(this.rows, 'width', 'auto');
        if (this.options.columnsCount && !browser.msie) {
            setStyle(this.rows, 'columnCount', 'auto');
            setStyle(this.rows, 'MozColumnCount', 'auto');
            setStyle(this.rows, 'webkitColumnCount', 'auto');
            setStyle(this.rows, 'height', 'auto');
            var itemsCount = geByTag('a', this.rows).length;
            var bodySize = getSize(this.body);
            var rowsWidth = bodySize[0] - 4;
            var rowsHeight = bodySize[1] - 4;
            if (rowsHeight > 500) {
                rowsHeight = Math.round(rowsHeight / itemsCount) * Math.ceil(itemsCount / this.options.columnsCount);
                setStyle(this.rows, 'columnCount', this.options.columnsCount.toString());
                setStyle(this.rows, 'MozColumnCount', this.options.columnsCount.toString());
                setStyle(this.rows, 'webkitColumnCount', this.options.columnsCount.toString());
                setStyle(this.rows, 'width', (rowsWidth * 2) + 'px');
                setStyle(this.rows, 'height', rowsHeight + 'px');
            }
        }
        var headerWidth = getSize(this.header)[0];
        var bodyWidth = getSize(this.body)[0];
        if (headerWidth > bodyWidth) {
            setStyle(this.rows, 'width', (headerWidth - 2) + 'px');
        }
        bodyWidth = getSize(this.body)[0];
        var windowWidth = document.documentElement.clientWidth;
        var bodyRight = ((left > bodyWidth && left + bodyWidth > windowWidth) ? (-headerWidth - 1) + 'px' : 'auto');
        setStyle(this.body, 'right', bodyRight);
    },
    moveToTarget: function () {
        var tc = getPosition(this.options.target);
        //tc = [tc.x, tc.y];
        //var tc = getXY(this.options.target);
        if (/mac/.test(_ua) && browser.mozilla) {
            tc[1] += 1; // offset fix
        }
        this.moveTo(tc[0] + this.options.offsetLeft, tc[1] + this.options.offsetTop);
    },
    alignBody: function () {
        this.body.style.marginLeft = (getSize(this.header)[0] - getSize(this.body)[0] + 1) + 'px';
    },
    setData: function (items) {
        this.rows.innerHTML = '';
        if (isArray(items) && items.length) {
            for (var i = 0; i < items.length; i++) {
                this.addItem(items[i]);
            }
        }
        if (this.visible && this.menuToUp()) {
            var bh = getSize(this.body)[1];
            this.body.style.top = -bh + 3 + 'px';
            addClass(this.container, 'dd_up');
        }
    },
    addItem: function (item) {
        if (!item) return false;
        var link = ce('a');
        if (isArray(item)) item = {
            i: item[0],
            l: item[1],
            onClick: item[2],
            c: item[3],
            s: item[4],
            b: item[5],
            h: item[6],
            el: link
        };
        if (item.onClick && !isFunction(item.onClick)) {
            var funcs = item.onClick;
            item.onClick = funcs.onClick;
            item.onMouseOver = funcs.onMouseOver;
            item.onMouseOut = funcs.onMouseOut;
        }
        link.innerHTML = (this.options.checkable ? '<img src="/images/dropdead_check.gif">' : '') + item.l;
        if (item.i) link['index'] = item.i;
        if (item.c) link.className = item.c;
        if (item.s) extend(link.style, item.s);
        if (item.b) extend(link.style, {
            backgroundImage: 'url(\'' + item.b + '\')',
            paddingLeft: '27px'
        });
        if (item.h) link.href = item.h;
        var self = this;
        addEvent(link, 'click', function (e) {
            self.value = e.data.item.i;
            var hide = true;
            if (isFunction(item.onClick) && item.onClick(e) === false)
                hide = false;
            if (self.options.onSelect(e) === false)
                hide = false;
            if (item.h) {
                return true; //toUrl(item.h, e);
            }
            if (hide) self.hide();
            else cancelEvent(e);
            if (self.options.updateTarget && hide) {
                var text = self.options.updateHeader(e.target.index, e.target.innerHTML);
                self.header.innerHTML = '<div>' + text + '</div>';
                if (self.options.target) {
                    self.options.target.innerHTML = text.replace(/\s+/g, '&nbsp;');
                }
            }
        }, false, {
            item: item
        });
        if (isFunction(item.onMouseOver)) {
            addEvent(link, 'mouseover', item.onMouseOver);
        }
        if (isFunction(item.onMouseOut)) {
            addEvent(link, 'mouseout', item.onMouseOut);
        }
        if (browser.msie) {
            link.onmouseover = function () {
                addClass(link, 'dd_a_hover');
            };
            link.onmouseout = function () {
                removeClass(link, 'dd_a_hover');
            };
        }
        this.items[item.i] = link;
        this.rows.appendChild(link);
        if (this.options.align == 'left') this.alignBody();
    },
    getRows: function () {
        return this.rows;
    },
    setOptions: function (options) {
        var self = this;
        extend(this.options, options);
        // apply options
        if (this.options.title)
            this.header.innerHTML = '<div>' + this.options.title + '</div>';
        if (typeof this.options.hideOnClick != 'undefined')
            this.header.onclick = this.options.hideOnClick ? this.toggle.bind(this) : this.show.bind(this);
        if (this.options.align == 'left') this.alignBody();
    },
    onHide: function (fade) {
        this.visible = false;
        if (fade || !this.options.showHover) hide(this.header);
        else addClass(this.header, 'dd_header_hover');
        hide(this.body);
        if (this.options.onHide) this.options.onHide();
    },
    toggle: function () {
        this.visible ? this.hide(false) : this.show();
    },
    show: function () {
        if (this.visible) return;
        if (this.options.target && !this.options.showHover) this.moveToTarget();
        clearTimeout(this.mouseTimer);
        show(this.header);
        show(this.body);
        if (this.options.showHover) removeClass(this.header, 'dd_header_hover');
        this.visible = true;
        // Set menu coordinates
        if (this.menuToUp()) {
            var bh = getSize(this.body)[1];
            this.body.style.top = -bh + 3 + 'px';
            addClass(this.container, 'dd_up');
        } else {
            var hh = getSize(this.header)[1];
            this.body.style.top = hh - 1 + 'px';
            removeClass(this.container, 'dd_up');
        }
        if (this.options.onShow) {
            this.options.onShow();
        }
        _ui.sel(this.guid);
    },
    menuToUp: function () {
        if (this.options.alwaysMenuToUp) {
            return true;
        }
        var h = window.innerHeight,
            bh = getSize(this.body)[1],
            hh = getSize(this.header)[1],
            ht = getXY(this.header)[1];
        if (!h && document.documentElement) {
            h = document.documentElement.clientHeight;
        }
        var pt = this.common.pageContainer.scrollTop;
        if (!pt && !browser.msie6) pt = document.getElementsByTagName('html')[0].scrollTop;
        if (ht - pt > bh) {
            return (hh + ht + bh > h + pt);
        }
        return false;
    },
    hide: function (fade) {
        if (!this.visible) return;
        // return;
        var self = this;
        if (self.childIsOver) {
            self.mouseTimer = setTimeout(self.hide.bind(self), 400);
            return;
        }
        each(self.childMenus, function () {
            this.hide();
        });
        var fadeSpeed = (this.options.fadeSpeed !== undefined) ? this.options.fadeSpeed : 100;
        (fade === false) ? this.onHide(false) : fadeOut(this.container, fadeSpeed, function () {
            show(self.container);
            self.onHide.call(self, true);
            _ui.sel(false);
            //if (self.options.onHide) self.options.onHide();
        });
        if (self.parentMenu) {
            self.parentMenu.childIsOver = false;
        }
    },
    val: function () {
        return this.value;
    },
    destroy: function () {
        if (this.destroyed) return;
        removeEvent(this.options.target, 'mouseover', this.showTargetHover);
        cleanElems(this.container, this.header);
        for (var el = this.rows.firstChild; el; el = el.nextSibling) {
            cleanElems(el);
        }
        this.destroyed = true;
    },
    handleMouseEvent: function (e) {
        var self = e.data.self;
        self.isOver = (e.type == 'mouseover');
        if (self.parentMenu) {
            self.parentMenu.childIsOver = self.isOver;
        }
        clearTimeout(self.mouseTimer);
        if (e.type == 'mouseout') {
            self.mouseTimer = setTimeout(self.hide.bind(self), 400);
        }
    },
    onEvent: function (e) {
        var outside = true,
            t = e.target;
        while (t && t != t.parentNode) {
            if (t == this.container) {
                outside = false;
                break;
            }
            t = t.parentNode;
        }
        if (outside) {
            this.hide();
        }
    }
});