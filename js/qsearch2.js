// TODO rebuild popular hints
createChildClass('qSearch', UiControl, {
    common: {
        pageContainer: null
    },
    CSS: {
        STANDART: 'qsearch_'
    },
    defaultOptions: {
        placeholder: getLang('global-search'),
        width: 615,
        right: true,
        animationDelay: 200,
        animation: true,
        menu: true,
        menuWidth: 150,
        menuRight: true,
        menuShadow: true,
        selected: 0,
        hints_url: '/hints1.php',
        hintsAct: 'a_hints',
        showPopularHints: true,
        popularHintsTitle: getLang('qsearch-popular-hints'),
        popularHintsAct: 'a_start_hints',
        popularHintsShift: 8,
        popularHintsTemp: false,
        popularHintsColumn:2,
        search_page: '/index.php',
        hintsPauseGet: 500,
        noResults: getLang('qsearch-no-search-result'),
        resultsFail: getLang('qsearch-connection-error')
    },
    beforeInit: function () {
        this.common.pageContainer = document.body;
        this.guid = _ui.reg(this);
        this.cache = {};
        this.getHintsTimer = null;
    },
    controlName: 'qSearch',
    initOptions: function (input, data, options) {
        if (!input) return false;
        this.options = extend({}, this.defaultOptions, {}, options);
    },
    init: function (input, data) {
        this.data_list = data || [];
        this.item_list = [];
        this.search_value_cache = '';
        if (!this.data_list.length) this.options.menu = false;
        if (this.options.showPopularHints) this.cache[this.options.popularHintsAct] = false;
        if (this.options.search_page == '') this.options.search_page = false;
        this.global_focus = false;


        this.popularHintsTemplates = {
            'piple':'<a style="color: rgb(0, 0, 0); display: block; padding: 6px 0px 0px 7px; text-decoration: none;" href="{href}">' +
                        '<div class="s_photo"><img src="{photo}" /></div>' +
                        '<div style="word-wrap: break-word; height: 13px;" class="s_wide_title">{name}</div>' +
                    '</a>' +
                    '<a href="/mail.php?act=write&to={user_id}" onclick="cancelEvent(event); return showWriteMessageBox(event, {user_id});" class="s_down_text">Написать сообщение</a>',

            'groups':'<a style="color: rgb(0, 0, 0); display: block; padding: 6px 0px 0px 7px;" href="{href}">' +
                        '<div class="s_photo"><img src="{photo}" /></div>' +
                        '<div style="word-wrap: break-word;" class="s_wide_title">{name}' +
                            '<div>{desc}</div>' +
                        '</div>' +
                     '</a>'
        };
    },
    initDOM: function (input) {
        var self = this;
        this.container = ce('div', {
            id: 'qsearch_container' + this.guid,
            className: 'qsearch_container '+(this.options.right ? 'qr' : 'ql'),
            innerHTML: '<input class="qsearch_input" type="text" autocomplete="off" value="' + this.options.placeholder + '" />' +
                '<div class="search_ext_cont">' +
                '<div class="search_cont ' + (this.options.menuRight ? 'sir' : 'sil') + '">' +
                '<input class="search_input" type="text" />' +
                '<span class="search_a_menu">' +
                '<span class="search_menu_header"></span>' +
                '<span class="search_darr"></span>' +
                '<div class="search_menu" style="width: ' + this.options.menuWidth + 'px; display:none"></div>' +
                '</span>' +
                '<div class="search_sub_menu">' +
                (this.options.menuShadow ? '<div class="search_shadow_left"></div>' : '') +
                (this.options.menuShadow ? '<div class="search_shadow_right"></div>' : '') +
                '<div class="subMenuContent"></div>' +
                (this.options.menuShadow ? '<div class="search_shadow1" style="margin-top: 1px;"></div>' : '') +
                (this.options.menuShadow ? '<div class="search_shadow2" style="margin-top: 2px;"></div>' : '') +
                '</div>' +
                '</div>' +
                '</div>'
        });
        input.parentNode.replaceChild(this.container, input);
        each({
            input: 'qsearch_input',
            search_ext_cont: 'search_ext_cont',
            search_cont: 'search_cont',
            search_input: 'search_input',
            search_a_menu: 'search_a_menu',
            search_menu_header: 'search_menu_header',
            search_menu: 'search_menu',
            search_darr: 'search_darr',
            search_sub_menu: 'search_sub_menu',
            subMenuContent: 'subMenuContent'
        }, function (k, v) {
            self[k] = geByClass1(v, self.container);
        });
        if (this.options.right) {
            //this.input.style.right = '-1px';
            this.search_ext_cont.style.right = '-1px';
        } else {
            this.input.style.left = '0px';
            this.search_ext_cont.style.left = '0';
        }
        setStyle(this.search_cont, {
            width: this.options.width
        });
        setStyle(this.search_input, {
            width: this.options.width - this.options.menuWidth - 9
        });
        setStyle(this.search_menu_header, {
            width: this.options.menuWidth - 18 - 4 - 1
        });
        if (!this.options.menu) {
            hide(this.search_a_menu);
            setStyle(this.search_input, {
                width: this.options.width - 10
            });
        }
        //this.container.parentNode.insertBefore(ce('br', {clear: 'both'}),this.container.nextSibling);
        setStyle(this.container, {height:getSize(self.input)[1]});

        this.setItemsList();
    },
    setItemsList: function () {
        var self = this;
        if (!this.options.menu) return;
        if (this.options.menuShadow) {
            var sh = ['search_shadow_left', 'search_shadow_right1', 'search_shadow_right2'];
            if (!this.options.menuRight) sh = sh.reverse();
            each(sh, function (k, v) {
                self.search_menu.appendChild(ce('div', {
                    className: v
                }));
            });
        }
        for (var i in this.data_list) {
            this.item_list.push(ce('a', {
                href: '#',
                className: (i == this.data_list.length - 1 ? 'last' : ''),
                innerHTML: '<span>' + this.data_list[i][0] + '</span>'
            }));
            this.cache[this.data_list[i][1]] = {};
            this.item_list[i]['item_id'] = i;
            addEvent(this.item_list[i], 'click mouseover mouseout', function (e) {
                if (e.type == 'click') {
                    e.data.self.selectItem(e.data.item_id);
                    e.data.self.ajaxHints();
                    return false;
                } else if (e.type == 'mouseover') {
                    addClass(this, 'hover');
                } else {
                    each(e.data.self.item_list, function (k, v) {
                        removeClass(v, 'hover');
                    });
                    removeClass(this, 'hover');
                }
            }, false, {
                'self': this,
                'item_id': i
            });
            this.search_menu.appendChild(this.item_list[i]);
        }
        if (this.options.menuShadow) {
            each(['search_shadow1', 'search_shadow2'], function (k, v) {
                self.search_menu.appendChild(ce('div', {
                    className: v
                }));
            });
        }
        this.selectItem(this.options.selected);
    },
    buildPopularHints: function(obj){

        var self = this,
            items = [],
            global = '',
            count = 0,
            col = self.options.popularHintsColumn || 1,
            recent = '<div class="recent_fr">'+this.options.popularHintsTitle+'</div>' +
            '<table class="recent_table"><tr>{qs_content}</tr></table>' +
            '<div style="display: none" class="qs_over"></div>';

        for(var i in obj)
        {
            count++;
            var s = '<td width="'+(100 / col)+'"><div onclick="document.location.href=\'{href}\'" class="qs_item p_item'+(count == col ? '_right' : '')+'">';
            s += self.popularHintsTemplates[obj[i]['type']];
            for (var r in obj[i]) {
                s = s.replace(new RegExp('{' + r + '}', "g"), obj[i][r]);
            }
            s += '</div></td>';
            global += s;

            if(count == col)
            {
                items.push(global);
                count = 0;
                global = '';
            }
        }

        var html = ce('div', {
            className:'st_sub_menu',
            innerHTML: recent.replace('{qs_content}', items.join('</tr><tr>'))
        });

        this.showSubMenu(html, true);
        //self.cache[self.options.popularHintsAct] = t;
        this.res_items = true;



        var p_item_over = geByClass1('qs_over', html, 'div');
        var orecent = geByClass1('recent_fr', html, 'div');



        each(geByClass('qs_item', html, 'div'), function(k,v){
            addEvent(v, 'mouseover mouseout', function(e){

                if(e.type == 'mouseover')
                {
                    var size = getSize(this, true);
                    var rsize = getSize(e.data.recent);
                    var xy = getXY(this);
                    var cxy = getXY(e.data.self.container);

                    e.data.main.innerHTML = this.parentNode.innerHTML;
                    setStyle(e.data.main, {
                        width:size[0] + (hasClass(this, 'p_item_right') ? 0 : 0),
                        height:size[1],
                        display:'block',
                        position: 'absolute',
                        top:xy[1] - cxy[1] - rsize[1] - 4
                    });

                    if(hasClass(this, 'p_item_right'))
                    {
                        setStyle(e.data.main, {left: 'inherit', right: -1});
                    }
                    else
                    {
                        setStyle(e.data.main, {right: 'inherit', left: -1});
                    }
                }


            }, false, {main:p_item_over, self:self, recent:orecent});
        });

    },
    popularHintsShow: function () {
        var self = this;
        if (self.options.showPopularHints !== true) return false;
        if (this.cache[this.options.popularHintsAct]) {
            self.showSubMenu(this.cache[this.options.popularHintsAct], true);
            self.res_items = true;
            return false;
        }

        ajax.post(this.options.hints_url, {'act': this.options.popularHintsAct}, function(t, isFail){

            if(isFail){
                self.hideMenu();
                self.showSubMenu('<div class="sub_item_hint fail">' + self.options.resultsFail + '</div>');
                self.res_items = false;
            } else {
                if (!t.error && t.hints) {
                    self.buildPopularHints(t.hints);
                    //self.showSubMenu(t, true);
                    //self.cache[self.options.popularHintsAct] = t;
                    //self.res_items = true;
                } else {
                    self.hideSubMenu();
                    self.res_items = false;
                }
            }

        });
    },
    selectItem: function (item_id) {
        for (var i in this.item_list)
            removeClass(this.item_list[i], 'selected');
        this.options.selected = item_id;
        if (this.data_list.length > 0) {
            this.search_menu_header.innerHTML = this.data_list[item_id][0];
            addClass(this.item_list[item_id], 'selected');
        }
        this.hideMenu();
        this.hideSubMenu();
        this.search_input.focus();
    },
    headerClick: function (e) {
        e.data.self.showMenu();
        e.data.self.hideSubMenu();
        e.data.self.search_input.focus();
    },
    initEvents: function () {
        var self = {
            'self': this
        };
        addEvent(this.input, 'focus', this.inputOnFocus, false, self);
        addEvent(this.search_a_menu, 'mouseover mouseout', function (e) {
            if (e.type == 'mouseover') {
                addClass(this, 'hover');
            } else {
                removeClass(this, 'hover');
            }
        }, false, self);
        addEvent(this.search_menu_header, 'click', this.headerClick, false, self);
        addEvent(this.search_darr, 'click', this.headerClick, false, self);
        addEvent(this.search_input, 'keyup click', this.seachStart, false, self);
        addEvent(this.search_input, 'focus', function (e) {
            _ui.sel(e.data.self.guid);
            if (!e.data.self.global_focus) e.data.self.seachStart(e);
        }, false, self);
    },
    subMenuHover: function (up) {
        up = up || false;
        var smc = this.subMenuContent;
        var hover = geByClass1('sub_item_over', smc, 'div');
        setCaretPosition(this.search_input, this.search_input.value.length);
        if (up) {
            if (hover) {
                replaceClass(hover, 'sub_item_over', 'sub_item');
                if (hover.nextSibling) replaceClass(hover.nextSibling, 'sub_item_next_over', 'sub_item');
                if (hover.previousSibling) {
                    replaceClass(hover.previousSibling, 'sub_item', 'sub_item_over');
                    if (hover.previousSibling.nextSibling)
                        replaceClass(hover.previousSibling.nextSibling, 'sub_item', 'sub_item_next_over');
                }
            } else {
                if (smc.lastChild && hasClass(smc.lastChild, 'sub_item')) {
                    replaceClass(smc.lastChild, 'sub_item', 'sub_item_over');
                }
            }
        } else {
            if (hover) {
                replaceClass(hover, 'sub_item_over', 'sub_item');
                if (hover.nextSibling) {
                    replaceClass(hover.nextSibling, 'sub_item_next_over', 'sub_item_over');
                    if (hover.nextSibling.nextSibling)
                        replaceClass(hover.nextSibling.nextSibling, 'sub_item', 'sub_item_next_over');
                }
            } else {
                if (smc.firstChild && hasClass(smc.firstChild, 'sub_item')) {
                    replaceClass(smc.firstChild, 'sub_item', 'sub_item_over');
                    if (smc.firstChild.nextSibling)
                        replaceClass(smc.firstChild.nextSibling, 'sub_item', 'sub_item_next_over');
                }
            }
        }
    },
    hideSubMenu: function () {
        hide(this.search_sub_menu);
        this.subMenuContent.innerHTML = '';
        this.popularHintsOpen = false
    },
    showSubMenu: function (content, popular) {
        popular = popular || false;
        this.popularHintsOpen = false;
        if (!this.global_focus) return false;
        if (!content) {
            this.hideSubMenu();
        }

        if(Object.prototype.toString.call(content) == '[object HTMLDivElement]')
        {
            this.subMenuContent.innerHTML = '';
            this.subMenuContent.appendChild(content);
        }
        else
        {
            this.subMenuContent.innerHTML = content;
        }


        var st = {
            display: 'block',
            top: getSize(this.search_ext_cont)[1] - 1 + 'px',
            width: this.options.width + 'px'
        };
        if (popular) {
            this.popularHintsOpen = true;
            if (this.options.menu)
                st.width = this.options.width - this.options.menuWidth - this.options.popularHintsShift + 'px';
            st.top = getSize(this.search_ext_cont)[1] + this.options.popularHintsShift - 1 + 'px';
        }
        setStyle(this.search_sub_menu, st);
    },
    showHint: function (item_id) {
        if (this.data_list.length == 0 || item_id == undefined) return;
        this.showSubMenu('<div class="sub_item_hint">' + this.data_list[item_id][2] + '</div>');
        this.res_items = false;
    },
    hideQsearch: function () {
        this.global_focus = false;
        this.hideSubMenu();
        this.hideMenu();
        this.hideInput();
    },
    seachStart: function (e) {
        var self = e.data.self;
        if (e.keyCode == KEY.TAB) {
            cancelEvent(e);
            return false;
        }
        self.global_focus = true;
        if (e.type == 'click') {
            if (!isEmpty(self.options.selected) && trim(self.search_input.value) == '') {
                self.hideMenu();
                self.showHint(self.options.selected);
            }
        } else {
            if (
                e.keyCode == KEY.UP ||
                    e.keyCode == KEY.DOWN ||
                    e.keyCode == KEY.LEFT ||
                    e.keyCode == KEY.RIGHT ||
                    e.keyCode == KEY.ESC ||
                    e.keyCode == KEY.ENTER ||
                    e.keyCode == KEY.TAB
                ) {
                if ((e.keyCode == KEY.ESC) && isVisible(self.search_ext_cont)) {
                    self.hideQsearch();
                } else if (e.keyCode == KEY.DOWN && !isVisible(self.search_menu) && !isVisible(self.search_sub_menu)) {
                    self.showMenu();
                    self.hideSubMenu();
                } else if (e.keyCode == KEY.DOWN && !isVisible(self.search_menu) && isVisible(self.search_sub_menu) && (self.search_input.value.length == 0 || !self.res_items)) {
                    self.showMenu();
                    self.hideSubMenu();
                    self.hoverMenu(false, true);
                } else if (e.keyCode == KEY.DOWN && isVisible(self.search_menu) && (!isVisible(self.search_sub_menu) || self.popularHintsOpen)) {
                    self.hoverMenu(false);
                } else if (e.keyCode == KEY.UP && isVisible(self.search_menu) && (!isVisible(self.search_sub_menu) || self.popularHintsOpen)) {
                    self.hoverMenu(true);
                } else if (e.keyCode == KEY.DOWN && !isVisible(self.search_menu) && isVisible(self.search_sub_menu)) {
                    self.subMenuHover(false);
                } else if (e.keyCode == KEY.UP && !isVisible(self.search_menu) && isVisible(self.search_sub_menu)) {
                    self.subMenuHover(true);
                } else if (e.keyCode == KEY.ENTER) {
                    if (!isVisible(self.search_menu)) {
                        self.goToUrl();
                    } else if ((!isVisible(self.search_sub_menu) || self.popularHintsOpen) && isVisible(self.search_menu)) {
                        self.getMenuHover();
                    }
                }
                return cancelEvent(e);
            }
            if (self.search_input.value.length > 0) {
                self.hideMenu();
                if (self.search_input.value.length == 1) self.hideSubMenu();
                self.ajaxHints();
                self.search_value_cache = self.search_input.value;
            } else if (self.search_value_cache != self.search_input.value) {
                self.showMenu();
                self.hideSubMenu();
                self.popularHintsShow();
                self.search_value_cache = self.search_input.value;
            }
        }
    },
    getMenuHover: function () {
        if (!this.options.menu) return false;
        var hover = false;
        for (var i in this.item_list) {
            if (hasClass(this.item_list[i], 'hover') && !hasClass(this.item_list[i], 'selected')) {
                hover = this.item_list[i];
                break;
            }
        }
        if (hover) {
            this.selectItem(hover.item_id);
            this.ajaxHints();
            return false;
        }
    },
    goToUrl: function () {
        var hover = geByClass1('sub_item_over', this.subMenuContent),
            url = '';
        if (hover) {
            url = hover.getAttribute('go');
            if (!url || url == '') url = false;
        } else {
            if (this.options.search_page && trim(this.search_input.value) !== '') {

                if (this.options.search_page.match(/\?/)) {
                    var src = '&section=' + this.data_list[this.options.selected][1] + '&q=' + trim(this.search_input.value);
                } else {
                    var src = '?section=' + this.data_list[this.options.selected][1] + '&q=' + trim(this.search_input.value);
                }

                url = this.options.search_page + src;
            }
        }
        document.location.href = url;
    },
    hoverMenu: function (up, unhover) {
        unhover = unhover || false;
        if (!this.options.menu) return false;
        var qS = this.item_list[this.options.selected];
        var hover = false;
        var first = this.item_list[0];
        var last = this.item_list[this.item_list.length - 1];
        if (unhover) {
            each(this.item_list, function (k, v) {
                removeClass(v, 'hover');
            });
        }
        for (var i in this.item_list) {
            if (hasClass(this.item_list[i], 'hover')) {
                hover = this.item_list[i];
                break;
            }
        }
        removeClass(qS, 'hover');
        if (up) {
            if (hover) {
                removeClass(hover, 'hover');
                if (hover.previousSibling && hover.previousSibling.tagName.toLocaleLowerCase() == 'a') {
                    if (hasClass(hover.previousSibling, 'selected')) {
                        if (hover.previousSibling.previousSibling && hover.previousSibling.previousSibling.tagName.toLocaleLowerCase() == 'a') {
                            addClass(hover.previousSibling.previousSibling, 'hover');
                        } else {
                            addClass(last, 'hover');
                        }
                    } else {
                        addClass(hover.previousSibling, 'hover');
                    }
                } else {
                    if (hasClass(last, 'selected')) {
                        if (last.previousSibling && last.previousSibling.tagName.toLocaleLowerCase() == 'a') {
                            addClass(last.previousSibling, 'hover');
                        } else {
                            addClass(last, 'hover');
                        }
                    } else {
                        addClass(last, 'hover');
                    }
                }
            } else {
                if (qS.previousSibling && qS.previousSibling.tagName.toLocaleLowerCase() == 'a') {
                    addClass(qS.previousSibling, 'hover');
                } else {
                    addClass(last, 'hover');
                }
            }
        } else {
            if (hover) {
                removeClass(hover, 'hover');
                if (hover.nextSibling && hover.nextSibling.tagName.toLocaleLowerCase() == 'a') {
                    if (hasClass(hover.nextSibling, 'selected')) {
                        if (hover.nextSibling.nextSibling && hover.nextSibling.nextSibling.tagName.toLocaleLowerCase() == 'a') {
                            addClass(hover.nextSibling.nextSibling, 'hover');
                        } else {
                            addClass(first, 'hover');
                        }
                    } else {
                        addClass(hover.nextSibling, 'hover');
                    }
                } else {
                    if (hasClass(first, 'selected')) {
                        if (first.nextSibling && first.nextSibling.tagName.toLocaleLowerCase() == 'a') {
                            addClass(first.nextSibling, 'hover');
                        } else {
                            addClass(first, 'hover');
                        }
                    } else {
                        addClass(first, 'hover');
                    }
                }
            } else {
                if (qS.nextSibling && qS.nextSibling.tagName.toLocaleLowerCase() == 'a') {
                    addClass(qS.nextSibling, 'hover');
                } else {
                    addClass(first, 'hover');
                }
            }
        }
    },
    ajaxHints: function () {
        var self = this;
        var value = trim(this.search_input.value);
        if (value == '') return;
        if (this.cache[this.data_list[this.options.selected][1]][value]) {
            this.showSubMenu(this.cache[this.data_list[this.options.selected][1]][value]);
            self.res_items = true;
            return false;
        }
        clearTimeout(self.getHintsTimer);
        self.getHintsTimer = setTimeout(function () {

            ajax.post(self.options.hints_url, {
                'act': self.options.hintsAct,
                'q': value,
                'section': self.data_list[self.options.selected][1]
            }, function(t,isFail){

                if(isFail){
                    self.showSubMenu('<div class="sub_item_hint fail">' + self.options.resultsFail + '</div>');
                    self.res_items = false;
                } else {
                    var html = '';
                    var temp = '<div ' +
                        'class="s_item clear{s_item_up}top sub_item" ' +
                        'onmouseover="replaceClass(this, \'sub_item\', \'sub_item_over\'); replaceClass(this.nextSibling, \'sub_item\', \'sub_item_next_over\');" ' +
                        'onmouseout="replaceClass(this, \'sub_item_over\', \'sub_item\'); replaceClass(this.nextSibling, \'sub_item_next_over\', \'sub_item\');" ' +
                        'go="{href}"' +
                        '>';
                    temp += self.data_list[self.options.selected][3];
                    temp += '</div>';
                    if (t['hints'].length) {
                        for (var i in t['hints']) {
                            var s = temp;
                            if (i == 0)
                                s = s.replace('{s_item_up}', ' s_item_up ');
                            else
                                s = s.replace('{s_item_up}', ' ');
                            for (var r in t['hints'][i]) {
                                s = s.replace(new RegExp('{' + r + '}', "g"), t['hints'][i][r]);
                            }
                            html += s;
                        }
                        self.res_items = true;
                    } else {
                        html = '<div class="sub_item_hint">' + self.options.noResults + '</div>';
                        self.res_items = false;
                    }
                    self.showSubMenu(html);
                    try {
                        self.cache[self.data_list[self.options.selected][1]][value] = html;
                    } catch (e) {
                        console.log(e);
                    }
                }

            });

        }, value.length < 2 ? 100 : self.options.hintsPauseGet);
    },
    inputOnFocus: function (e) {
        var self = e.data.self;
        self.global_focus = true;
        if (this.value == self.options.placeholder) {
            this.value = '';
        }
        if (self.options.animation) {
            if (!isVisible(self.search_ext_cont)) {
                setStyle(self.search_ext_cont, {
                    width: getSize(this)[0] + 'px',
                    display: 'block',
                    overflow: 'visible'
                });
                animate(self.search_ext_cont, {
                    width: self.options.width
                }, self.options.animationDelay, function () {
                    self.showMenu();
                    if (self.options.showPopularHints)
                        self.popularHintsShow();
                });
            }
        } else {
            setStyle(self.search_ext_cont, {
                width: self.options.width,
                display: 'block',
                overflow: 'visible'
            });
            show(self.search_ext_cont);
            self.showMenu();
            if (self.options.showPopularHints)
                self.popularHintsShow();
        }
        self.search_input.focus();
        _ui.sel(self.guid);
    },
    hideInput: function () {
        var self = this;
        this.hideMenu();
        this.hideSubMenu();
        if (trim(this.search_input.value).length == 0) {
            if (this.options.animation) {
                setStyle(this.search_ext_cont, {
                    overflow: 'hidden'
                });
                animate(this.search_ext_cont, {
                    width: getSize(self.input)[0]
                }, this.options.animationDelay, function () {
                    setStyle(self.search_ext_cont, {
                        display: 'none'
                    });
                    self.input.value = self.options.placeholder;
                });
            } else {
                hide(self.search_ext_cont);
                self.input.value = self.options.placeholder;
            }
        }
        _ui.sel(false);
    },
    showMenu: function () {
        if (isVisible(this.search_menu))
            return;
        show(this.search_menu);
    },
    hideMenu: function () {
        hide(this.search_menu);
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
        if (outside || (e.keyCode == KEY.TAB)) {
            this.global_focus = false;
            this.hideQsearch();
        }
    }
});