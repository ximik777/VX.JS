function Dropdown(a, c, b) {
    if (!b) {
        b = {}
    }
    return new Selector(a, b.autocomplete ? c : [], extend({
        introText: "",
        multiselect: false,
        autocomplete: false,
        selectedItems: b.selectedItem
    }, b, {
        defaultItems: c
    }))
}

function Autocomplete(a, c, b) {
    return new Selector(a, c, b)
}
createChildClass("Selector", UiControl, {
    CSS: {},
    defaultOptions: {
        selectedItems: [],
        defaultItems: [],
        multiselect: true,
        multinostop: false,
        autocomplete: true,
        dropdown: true,
        maxItems: 50,
        selectFirst: true,
        dividingLine: "smart",
        resultField: undefined,
        customField: undefined,
        enableCustom: false,
        valueForCustom: -1,
        width: 300,
        height: 250,
        resultListWidth: 0,
        progressBar: false,
        imageId: undefined,
        noImageSrc: "/images/question_s.gif",
        hrefPrefix: "id",
        noBlur: false,
        zeroDefault: false,
        customArrow: false,
        customArrowWidth: 0,
        big: false,
        placeholder: "",
        placeholderColor: "#777777",
        placeholderColorBack: "#AFB8C2",
        zeroPlaceholder: false,
        introText: "Start typing",
        disabledText: "",
        noResult: "Nothing found",
        cacheLength: 100,
        indexkeys: undefined,
        onShow: undefined,
        onHide: undefined,
        onChange: undefined,
        onTagAdd: undefined,
        onTagRemove: undefined,
        onItemSelect: undefined,
        onTokenSelected: undefined,
        customSearch: false,
        chooseFirst: false,
        maxItemsShown: function (a) {
            if (a > 6) {
                return 500
            } else {
                if (a > 4) {
                    return 200
                } else {
                    if (a > 2) {
                        return 150
                    } else {
                        return 100
                    }
                }
            }
        },
        highlight: function (b, e) {
            b = e.indexOf(" ") == -1 ? b.split(" ") : [b];
            var d = "";
            var a = parseLatin(e);
            if (a !== null) {
                e = escapeRE(e) + "|" + escapeRE(a);
            }
            var f = new RegExp("(?![^&;]+;)(?!<[^<>]*)((\\(*)(" + e + "))(?![^<>]*>)(?![^&;]+;)", "gi");
            for (var c in b) {
                d += (c > 0 ? " " : "") + b[c].replace(f, "$2<em>$3</em>")
            }
            return d
        },
        formatResult: function (a) {
            return a[1] + (typeof (a[2]) == "string" ? " <span>" + a[2] + "</span>" : "")
        },
        lastOptionWithoutCommaAtEnd: false
    },
    controlName: "Selector",
    beforeInit: function (a) {
        if (a === null || a.autocomplete) {
            try {
                console.error("Can't init ", a)
            } catch (b) {}
            return false
        }
        this.guid = _ui.reg(this)
    },
    initOptions: function (a, c, b) {
        this.options = extend({}, this.defaultOptions, {
            resultField: a.name || "selectedItems",
            customField: a.name ? (a.name + "_custom") : "selectedItems_custom"
        }, this.prepareOptionsText(b || {}));
        this.options.highlight = this.options.highlight || function (d) {
            return d
        };
        if (!isArray(this.options.selectedItems) && isEmpty(this.options.selectedItems)) {
            this.options.selectedItems = []
        }
        if (a.value && !this.options.selectedItems.length) {
            this.options.selectedItems = a.value
        }
        this.options.width = parseInt(this.options.width) > 0 ? parseInt(this.options.width) : this.defaultOptions.width;
        this.options.height = parseInt(this.options.height) > 0 ? parseInt(this.options.height) : this.defaultOptions.height;
        this.options.resultListWidth = parseInt(this.options.resultListWidth) > 0 ? parseInt(this.options.resultListWidth) : this.options.width;
        if (this.options.imageId) {
            this.options.imageId = ge(this.options.imageId)
        }
    },
    init: function (a, b) {
        this.disableSomeFeatures = (location.pathname.indexOf("/join") === 0);
        this.dataURL = typeof (b) == "string" ? b : null;
        this.dataItems = isArray(b) ? b : [];
        this.currentList = this.dataItems;
        if (this.dataURL) {
            this.cache = new Cache(this.options)
        } else {
            this.indexer = new Indexer(this.dataItems, {
                indexkeys: this.options.indexkeys
            })
        }
        this._selectedItems = [];
        this.input = a;
        this.disabled = false;
        this.mouseIsOver = false;
        this.hasFocus = 0;
        this.scrollbarWidth = 0;
        this.timeout = null;
        this.readOnly = (!this.options.autocomplete ? 'readonly="true"' : "");
        this.requestTimeout = null;
        this.selectedTokenId = 0;
        this.selectorWidth = this.options.width
    },
    initDOM: function (b, c) {
        var a = this;
        this.container = ce("div", {
            id: "container" + this.guid,
            className: "selector_container" + (!a.options.autocomplete ? " dropdown_container" : "") + (a.options.big ? " big" : "") + (browser.mobile ? " mobile_selector_container" : ""),
            innerHTML: '<table cellspacing="0" cellpadding="0" class="selector_table">                  <tr>                    <td class="selector">                      <div class="placeholder_wrap1">                        <div class="placeholder_wrap2">                          <div class="placeholder_content"></div>                          <div class="placeholder_cover"></div>                        </div>                      </div>                      <span class="selected_items"></span>                      <input type="text" class="selector_input" ' + this.readOnly + ' />        <input type="hidden" name="' + a.options.resultField + '" id="' + a.options.resultField + '" value="" class="resultField">        <input type="hidden" name="' + a.options.customField + '" id="' + a.options.customField + '" value="" class="customField">      </td>' + (a.options.dropdown ? '<td id="dropdown' + this.guid + '" class="selector_dropdown">&nbsp;</td>' : "") + '    </tr>  </table>  <div class="results_container">    <div class="result_list" style="display:none;"></div>    <div class="result_list_shadow">      <div class="shadow1"></div>      <div class="shadow2"></div>    </div>  </div>'
        }, {
            width: a.options.width + "px"
        });
        b.parentNode.replaceChild(this.container, b);
        each({
            selector: "selector",
            resultList: "result_list",
            resultListShadow: "result_list_shadow",
            input: "selector_input",
            placeholder: "placeholder_wrap1",
            placeholderContent: "placeholder_content",
            selectedItemsContainer: "selected_items",
            resultField: "resultField",
            customField: "customField",
            dropdownButton: "selector_dropdown"
        }, function (e, d) {
            a[e] = geByClass(d, a.container)[0]
        });
        if (browser.chrome) {
            this.resultList.style.opacity = 1
        }
        b.autocomplete = "1";
        if (a.options.dividingLine) {
            addClass(this.resultList, "dividing_line")
        }
        this.resultList.style.width = this.resultListShadow.style.width = a.options.resultListWidth + "px";
        if (this.options.dropdown) {
            this.initDropdown()
        }
        this.updatePlaceholder();
        this.select = new Select(this.resultList, this.resultListShadow, {
            selectFirst: a.options.selectFirst,
            height: a.options.height,
            onItemActive: function (d) {
                a.showImage(d);
                a.activeItemValue = d
            },
            onItemSelect: a._selectItem.bind(a),
            onShow: function () {
                _ui.sel(a.guid);
                a.highlightInput(true);
                if (isFunction(a.options.onShow)) {
                    a.options.onShow()
                }
            },
            onHide: function () {
                _ui.sel(false);
                a.highlightInput(false);
                if (isFunction(a.options.onHide)) {
                    a.options.onHide()
                }
            }
        })
    },
    initEvents: function () {
        var a = this;
        if (this.options.dropdown) {
            this.initDropdownEvents()
        }
        var c = browser.opera || browser.mozilla ? "keypress" : "keydown";
        var b = browser.opera ? "keypress" : "keydown";
        this.onEvent = function (g) {
            if (g.type == "mousedown") {
                var f = true;
                var d = g.target;
                while (d && d != d.parentNode) {
                    if (d == a.container) {
                        f = false;
                        break
                    }
                    d = d.parentNode
                }
                if (f) {
                    a.select.hide();
                    a.deselectTokens()
                }
            }
            if (g.type == c) {
                a.handleKeyboardEventOutside(g)
            }
            if (g.type == b) {
                a.select.handleKeyEvent(g)
            }
        };
        if (this.disableSomeFeatures) {
            addEvent(this.input, "paste keypress keydown focus blur", this.handleKeyboardEvent, false, {
                self: this
            })
        } else {
            addEvent(this.input, "keydown keypress change paste cut drop input focus blur", this.handleKeyboardEvent, false, {
                self: this
            })
        }
        addEvent(this.selector, "mousedown", function (f) {
            var g = false;
            var d = f.target;
            while (d !== null) {
                if (hasClass(d, "token")) {
                    g = true;
                    break
                }
                d = d.parentNode
            }
            if (!g) {
                return a.onInputClick(f)
            }
            return true
        }, false, {
            self: this
        })
    },
    afterInit: function () {
        this.updateInput();
        var a = this;
        if (this.options.selectedItems !== undefined) {
            if (isArray(this.options.selectedItems)) {
                for (var b in this.options.selectedItems) {
                    this._selectItem(this.options.selectedItems[b], false)
                }
            } else {
                each((this.options.selectedItems + "").split(","), function (d, c) {
                    a._selectItem(c, false)
                })
            }
        }
        if (!this._selectedItems.length && !this.options.autocomplete && !this.options.multiselect && this.options.defaultItems.length) {
            this._selectItem(this.options.defaultItems[0], false)
        }
    },
    prepareOptionsText: function (a) {
        each(["disabledText", "placeholder"], function () {
            if (this in a) {
                a[this] = winToUtf(stripHTML(a[this]))
            }
        });
        return a
    },
    fadeButtonToColor: function () {
        if (this.options.customArrow || this.options.big) {
            return
        }
        var b = window.is_rtl ? {
            backgroundColor: "#E1E8ED",
            borderRightColor: "#D2DBE0"
        } : {
            backgroundColor: "#E1E8ED",
            borderLeftColor: "#D2DBE0"
        };
        var a = this;
        animate(this.dropdownButton, b, 200, function () {
            if (!a.mouseIsOver) {
                if (!a.select.isVisible()) {
                    a.fadeButtonToWhite()
                } else {
                    a.dropdownButton.style.backgroundColor = a.dropdownButton.style[window.is_rtl ? "borderRightColor" : "borderLeftColor"] = ""
                }
            }
        })
    },
    fadeButtonToWhite: function () {
        if (this.options.customArrow || this.options.big) {
            return
        }
        var a = this;
        animate(this.dropdownButton, {
            backgroundColor: "#FFFFFF",
            borderLeftColor: "#FFFFFF"
        }, 200, function () {
            a.dropdownButton.style.backgroundColor = a.dropdownButton.style[window.is_rtl ? "borderRightColor" : "borderLeftColor"] = "";
            if (a.mouseIsOver) {
                a.fadeButtonToColor()
            }
        })
    },
    initDropdown: function () {
        this.scrollbarWidth = this.options.customArrowWidth || this.options.big && 25 || window.sbWidth();
        if (this.scrollbarWidth <= 3) {
            this.scrollbarWidth = browser.mobile ? 20 : 14
        }
        if (!this.options.customArrow) {
            this.dropdownButton.style.width = this.scrollbarWidth + "px"
        }
        this.selectorWidth -= this.scrollbarWidth
    },
    initDropdownEvents: function () {
        var a = this;
        addEvent(this.dropdownButton, "mouseover", function () {
            addClass(this, "selector_dropdown_hover")
        });
        addEvent(this.dropdownButton, "mouseout", function () {
            removeClass(this, "selector_dropdown_hover")
        });
        addEvent(this.container, "mouseover", function (b) {
            a.mouseIsOver = true;
            if (a.disabled) {
                return
            }
            a.fadeButtonToColor()
        });
        addEvent(this.container, "mouseout", function () {
            a.mouseIsOver = false;
            if (a.disabled) {
                return
            }
            setTimeout(function () {
                if (a.mouseIsOver) {
                    return
                }
                if (!a.select.isVisible()) {
                    a.fadeButtonToWhite()
                } else {
                    a.dropdownButton.style.backgroundColor = a.dropdownButton.style[window.is_rtl ? "borderRightColor" : "borderLeftColor"] = ""
                }
            }, 0)
        });
        addEvent(this.dropdownButton, "mousedown", function () {
            if (!a.select.isVisible()) {
                a.showDefaultList()
            } else {
                a.select.toggle()
            }
        })
    },
    destroyDropdown: function () {
        cleanElems(this.dropdownButton)
        removeEvent(this.container, "mouseover");
        removeEvent(this.container, "mouseout");
        this.scrollbarWidth = 0;
        this.selectorWidth = this.options.width
    },
    destroy: function () {
        if (this.destroyed) {
            return
        }
        this.destroyDropdown();
        var a = ge(this.options.imageId);
        if (a) {
            removeEvent(a, "click")
        }
        this.select.destroy();
        cleanElems(this.container, this.input, this.selector, this.resultList, this.resultListShadow, this.placeholderContent);
        for (var b = this.selectedItemsContainer.firstChild; b; b = b.nextSibling) {
            cleanElems(b, b.firstChild.nextSibling)
        }
        this.destroyed = true
    },
    updateInput: function () {
        if (!this.options.autocomplete && this.options.multiselect && this._selectedItems.length) {
            hide(this.input)
        } else {
            if (!isVisible(this.input)) {
                show(this.input)
            }
            this.input.style.width = "20px";
            var a = (this.options.big ? 12 : 9);
            var c = this._selectedItems.length ? this.input.offsetLeft : (window.is_rtl ? this.selectorWidth - a : 0);
            var b = window.is_rtl ? c : (this.selectorWidth - c - a);
            this.input.style.width = Math.max(20, b) + "px"
        }
        this.updatePlaceholder()
    },
    updatePlaceholder: function () {
        if (this.disableSomeFeatures) {
            return
        }
        var c = (this.resultField.value == "0" && this.options.zeroPlaceholder);
        var d = ((this.disabled && this.options.disabledText) ? this.options.disabledText : this.options.placeholder);
        var e = (this.hasFocus ? this.options.placeholderColorBack : this.options.placeholderColor);
        var b = ((c || this.disabled) && this.options.placeholderColor || "#000");
        var a = !(this._selectedItems.length && this.options.multiselect || this.input.value.length || c);
        if (d !== this.placeholderTextPrev) {
            this.placeholderContent.innerHTML = d
        }
        if (e !== this.placeholderColorPrev) {
            animate(this.placeholderContent, {
                color: e
            }, 200)
        }
        if (b !== this.placeholderInputColorPrev) {
            this.input.style.color = b
        }
        if (a !== this.placeholderVisiblePrev) {
            toggle(this.placeholder, a)
        }
        this.placeholderTextPrev = d;
        this.placeholderColorPrev = e;
        this.placeholderInputColorPrev = b;
        this.placeholderVisiblePrev = a
    },
    handleKeyboardEvent: function (d) {
        var b = d.data.self;
        switch (d.type) {
            case "paste":
            case "cut":
            case "drop":
            case "input":
                clearTimeout(b.timeout);
                b.timeout = setTimeout(function () {
                    b.onChange()
                }, 0);
                break;
            case "keypress":
                if (d.which == KEY.RETURN && browser.opera && b.options.enableCustom && (b.select.selectedItem() === null || b.select.selectedItem() === undefined)) {
                    b.select.hide();
                    if (!b.options.noBlur) {
                        b.input.blur()
                    } else {
                        if (isFunction(b.options.onChange)) {
                            b.updateCustom();
                            b.options.onChange(b.resultField.value)
                        }
                    }
                    return false
                } else {
                    if (d.which == KEY.SPACE || d.which > 40 && !d.metaKey) {
                        clearTimeout(b.timeout);
                        b.timeout = setTimeout(function () {
                            b.onChange()
                        }, 0)
                    }
                }
                break;
            case "keydown":
                switch (d.keyCode) {
                    case KEY.DOWN:
                        if (!b.select.isVisible()) {
                            setTimeout(b.showDefaultList.bind(b), 0);
                            return false
                        }
                        break;
                    case KEY.DEL:
                        if (b.input.value.length > 0) {
                            clearTimeout(b.timeout);
                            b.timeout = setTimeout(b.onChange.bind(b), 0)
                        } else {
                            if (b.selectedTokenId) {
                                var a = 0;
                                for (var c = b._selectedItems.length - 2; c >= 0; c--) {
                                    if (b._selectedItems[c][0] == b.selectedTokenId && b._selectedItems[c + 1]) {
                                        a = b._selectedItems[c + 1][0]
                                    }
                                }
                                b.removeTagData(b.selectedTokenId);
                                if (a) {
                                    b.selectToken(a)
                                } else {
                                    if (!b.readOnly) {
                                        setTimeout(function () {
                                            b.input.focus()
                                        }, 0)
                                    }
                                }
                            } else {
                                if (b.hasFocus && b._selectedItems.length) {
                                    b.selectToken(b._selectedItems[b._selectedItems.length - 1][0])
                                }
                            }
                            cancelEvent(d)
                        }
                        return true;
                        break;
                    case KEY.RETURN:
                        if (!browser.opera && b.options.enableCustom && (b.select.selectedItem() === null || b.select.selectedItem() === undefined)) {
                            b.select.hide();
                            if (!b.options.noBlur) {
                                b.input.blur()
                            } else {
                                if (isFunction(b.options.onChange)) {
                                    b.updateCustom();
                                    b.options.onChange(b.resultField.value)
                                }
                            }
                            return false
                        }
                        break;
                    case KEY.ESC:
                        b.input.blur();
                        break
                }
                break;
            case "focus":
                if (!b.disabled && !b.select.isVisible() && !b.focusSelf) {
                    b.showDefaultList()
                }
                b.focusSelf = false;
                if (b.disabled || b.readOnly) {
                    b.input.blur();
                    return true
                }
                if ((b._selectedItems.length == 0) || b.options.multiselect) {
                    if (browser.mozilla) {
                        setTimeout(function () {
                            b.input.value = ""
                        }, 0)
                    } else {
                        b.input.value = ""
                    }
                }
                addClass(b.input, "focused");
                b.input.style.color = "#000";
                b.hasFocus++;
                b.updatePlaceholder();
                break;
            case "blur":
                if (isFunction(b.options.chooseFirst) && b.options.chooseFirst(b.input.value)) {
                    b.select.active = 0;
                    if (isFunction(b.select.options.onItemSelect)) {
                        b.select.options.onItemSelect(b.select.selectedItem(), undefined, true)
                    }
                    return cancelEvent(d)
                }
                if (b.readOnly) {
                    return true
                }
                if (!b.disabled) {
                    b.updateCustom();
                    clearTimeout(b.requestTimeout);
                    if (b.changeAfterBlur && isFunction(b.options.onChange)) {
                        if (!b.options.enableCustom || !b._selectedItems.length) {
                            b.options.onChange("")
                        }
                        b.changeAfterBlur = false
                    }
                    if (b.options.onBlur) {
                        b.options.onBlur()
                    }
                }
                removeClass(b.input, "focused");
                b.hasFocus = 0;
                b.updatePlaceholder();
                break
        }
        return true
    },
    updateCustom: function () {
        var a = this;
        if (a.options.enableCustom && a.input.value.length) {
            var b = a.input.value;
            if (a._selectedItems.length == 0) {
                a.resultField.value = parseInt(!a.options.valueForCustom);
                a.customField.value = b;
                a._selectItem([a.options.valueForCustom, b])
            }
        } else {
            if (a._selectedItems.length == 0) {
                a.input.value = ""
            } else {
                if (a.options.multiselect) {
                    a.input.value = ""
                }
            }
        }
        a.updatePlaceholder()
    },
    handleKeyboardEventOutside: function (b) {
        var a;
        if (this.disabled || this.input.value.length > 0 && this.hasFocus || !this.hasFocus && this.selectedTokenId == 0) {
            return true
        }
        switch (b.keyCode) {
            case KEY.RETURN:
                return false;
                break;
            case KEY.LEFT:
                for (a = this._selectedItems.length - 1; a >= 0; a--) {
                    if (!this.selectedTokenId || this._selectedItems[a][0] == this.selectedTokenId && a > 0) {
                        if (this.selectedTokenId) {
                            a--
                        }
                        this.selectToken(this._selectedItems[a][0]);
                        this.input.blur();
                        break
                    }
                }
                return false;
                break;
            case KEY.RIGHT:
                for (a = 0; a < this._selectedItems.length; a++) {
                    if (this._selectedItems[a][0] == this.selectedTokenId) {
                        if (a < this._selectedItems.length - 1) {
                            this.selectToken(this._selectedItems[a + 1][0]);
                            this.input.blur()
                        } else {
                            if (!this.readOnly) {
                                this.deselectTokens();
                                this.input.focus()
                            }
                        }
                        break
                    }
                }
                return false;
                break
        }
        return true
    },
    onInputClick: function (b) {
        var a = b.data.self;
        a.deselectTokens();
        if (!a.select.isVisible()) {
            a.showDefaultList()
        } else {
            if (a.input.readOnly) {
                a.focusSelf = true;
                a.select.toggle()
            } else {
                a.onChange()
            }
        } if (!a.readOnly) {
            a.input.focus()
        } else {
            a.input.blur()
        }
    },
    highlightInput: function (a) {
        if (a) {
            addClass(this.container, "selector_focused")
        } else {
            removeClass(this.container, "selector_focused")
        }
    },
    selectToken: function (a) {
        if (!this.options.multiselect) {
            return
        }
        this.select.hide();
        removeClass(ge("bit_" + this.guid + "_" + this.selectedTokenId), "token_selected");
        addClass(ge("bit_" + this.guid + "_" + a), "token_selected");
        this.selectedTokenId = a;
        if (isFunction(this.options.onTokenSelected)) {
            this.options.onTokenSelected(a)
        }
        this.showImage(a)
    },
    deselectTokens: function () {
        if (!this.selectedTokenId || !this.options.multiselect) {
            return
        }
        removeClass(ge("bit_" + this.guid + "_" + this.selectedTokenId), "token_selected");
        this.selectedTokenId = 0;
        if (isFunction(this.options.onTokenSelected)) {
            this.options.onTokenSelected()
        }
        this.showImage()
    },
    _blur: function () {
        this.select.hide()
    },
    showImage: function (e, a) {
        if (!this.options.imageId) {
            return false
        }
        var b = ge(this.options.imageId);
        if (!b) {
            return false
        }
        if (a === undefined) {
            if (!e) {
                e = this.resultField.value.split(",")[0]
            }
            var d = this._selectedItems.concat(this.currenDataItems);
            if (d && d.length) {
                for (var c in d) {
                    if (d[c] && d[c][0] == e) {
                        a = d[c];
                        break
                    }
                }
            }
        }
        if (a !== undefined && typeof (a[3]) == "string" && a[3].length) {
            if (a[3] == "none") {
                b.style.display = "none"
            } else {
                b.style.display = "";
                b.setAttribute("src", a[3]);
                b.parentNode.href = "/" + this.options.hrefPrefix + a[0];
                removeEvent(b.parentNode, "click")
            }
        } else {
            b.style.display = "";
            b.setAttribute("src", this.options.noImageSrc);
            b.parentNode.href = "#";
            addEvent(b.parentNode, "click", function () {
                return true
            })
        }
        return true
    },
    _selectItem: function (e, d, a) {
        if (e === null || e === undefined) {
            return
        }
        if (d === undefined) {
            d = true
        }
        var f;
        if (e == -2000000000) {
            f = [this.curTerm, this.curTerm, cur.lang.mail_enter_email_address, "/images/contact_info.png", 0, ""]
        } else {
            if (typeof (e) == "string" && e.indexOf("@") != -1) {
                f = [e, e, cur.lang.mail_enter_email_address, "/images/contact_info.png", 0, ""]
            } else {
                if (typeof (e) == "object") {
                    f = e
                } else {
                    var b = [];
                    each([this.dataItems, this.options.defaultItems, this.receivedData], function (h, g) {
                        if (g && g.length) {
                            b = b.concat(g)
                        }
                    });
                    for (var c in b) {
                        if (b[c][0] == e || b[c] == e) {
                            f = b[c];
                            break
                        }
                    }
                }
            }
        }

        if (typeof f != "object") {
            f = [e, e]
        }
        f[0] = f[0].toString();
        f[1] = f[1].toString();
        this.changeAfterBlur = false;
        if (f[0] === this.resultField.value) {
            if (!this.options.multiselect) {
                this.input.value = winToUtf(stripHTML(f[1]));
                this.showImage();
                if (this.input.value.length || !this.options.placeholder) {
                    addClass(this.input, "selected")
                }
                this.updatePlaceholder()
            }
            return
        }
        if (this._selectedItems.length >= this.options.maxItems) {
            this.select.hide();
            return
        }
        this.deselectTokens();
        this.addTagData(f);
        this.showImage();
        if (this.options.multiselect) {
            this.input.value = "";
            if (this.dataURL) {
                this.select.clear()
            } else {
                this.select.removeItem(f[0])
            }
        } else {
            this.input.value = winToUtf(stripHTML(f[1]));
            addClass(this.input, "selected");
            this.updatePlaceholder()
        }
        this.select.hide();
        this.updateInput();
        if (a && this.options.multiselect && !this.readOnly) {
            setTimeout(function () {
                if (!this.options.multinostop) {
                    this.focusSelf = true
                }
                hide(this.input);
                show(this.input);
                this.input.focus()
            }.bind(this), 100)
        } else {
            if (!this.options.noBlur) {
                this.input.blur()
            }
        } if (d) {
            if (this.options.multiselect && isFunction(this.options.onTagAdd)) {
                this.options.onTagAdd(f, this.resultField.value)
            }
            if (isFunction(this.options.onChange)) {
                this.options.onChange(this.resultField.value)
            }
        }
    },
    addTagData: function (c) {
        if (!c || c.length < 2) {
            return
        }
        if (!this.options.multiselect) {
            this._selectedItems.splice(0, this._selectedItems.length, c);
            this.resultField.value = c[0];
            return
        }
        for (var e in this._selectedItems) {
            if (this._selectedItems[e][0] == c[0]) {
                this.selectToken(this._selectedItems[e][0]);
                return
            }
        }
        this._selectedItems.push(c);
        var d = [];
        for (e in this._selectedItems) {
            d.push(this._selectedItems[e][0])
        }
        this.resultField.value = d.join(",");
        this.input.style.width = "1px";
        var b = ce("div", {
            id: "bit_" + this.guid + "_" + c[0],
            className: "token"
        });
        var f = Math.max(this.selector.clientWidth, getSize(b)[0]);
        var j = this;
        b.innerHTML = '<span class="l">' + c[1] + '</span><span class="x" />';
        addEvent(b, "click", function () {
            j.selectToken(c[0]);
            return false
        });
        addEvent(b, "dblclick", function () {
            if (c[4]) {
                j.removeTagData(c[0]);
                each(c[4], function (l, k) {
                    j._selectItem(k, false)
                })
            }
            return false
        });
        addEvent(b, "mouseover", function (k) {
            addClass(b, "token_hover");
            j.showImage(c[0], c)
        });
        addEvent(b, "mouseout", function (k) {
            removeClass(b, "token_hover");
            j.showImage(j.activeItemValue ? j.activeItemValue : j.selectedTokenId)
        });
        var h = b.firstChild.nextSibling;
        addEvent(h, "mousedown", function () {
            j.select.hide();
            j.removeTagData(c[0]);
            if (!j.readOnly && j.hasFocus) {
                j.input.focus()
            }
            return false
        });
        j.selectedItemsContainer.appendChild(b);
        var g = b.firstChild;
        var a = g.innerHTML;
        while (b.offsetWidth > f && a.length > 3) {
            a = a.substr(0, a.length - 2);
            g.innerHTML = a + "..."
        }
    },
    removeTagData: function (e) {
        this.selectedTokenId = 0;
        var b = ge("bit_" + this.guid + "_" + e);
        if (!b) {
            return false
        }
        var d = b.firstChild.nextSibling;
        cleanElems(b, d)
        b.parentNode.removeChild(b);
        var a, c = [];
        for (i in this._selectedItems) {
            if (this._selectedItems[i][0] == e) {
                a = i;
                continue
            }
            c.push(this._selectedItems[i][0])
        }
        if (a == undefined) {
            return false
        }
        this.resultField.value = c.join(",");
        if (isFunction(this.options.onTagRemove)) {
            this.options.onTagRemove(this._selectedItems[a], this.resultField.value)
        }
        if (isFunction(this.options.onChange)) {
            this.options.onChange(this.resultField.value)
        }
        this._selectedItems.splice(a, 1);
        if (this.options.multiselect) {
            this.defaultList = false
        }
        this.showImage();
        this.updateInput();
        return false
    },
    onChange: function () {
        var b = trim(this.input.value.toLowerCase());
        if (!this.options.multiselect) {
            if (this._selectedItems.length) {
                this.changeAfterBlur = true
            }
            this._clear()
        }
        this.updatePlaceholder();
        clearTimeout(this.requestTimeout);
        if (b.length == 0) {
            this.showDefaultList();
            return
        }
        this.curTerm = b;
        var a = isFunction(this.options.customSearch) && this.options.customSearch(b);
        var c;
        if (a) {
            this.receiveData(b, a);
            return
        }
        if (this.dataURL) {
            c = this.cache.getData(b);
            if (c === null) {
                this.requestTimeout = setTimeout(function () {
                    this.request(this.receiveData.bind(this), this.showNoDataList.bind(this))
                }.bind(this), 300)
            } else {
                if (c && c.length) {
                    this.receiveData(b, c)
                } else {
                    this.showNoDataList()
                }
            }
        } else {
            c = this.indexer.search(b);
            if (c && c.length) {
                this.receiveData(b, c)
            } else {
                this.showNoDataList()
            }
        }
    },
    showNoDataList: function () {
        if (this.hasFocus || this.readOnly) {
            this._showSelectList(this.options.noResult);
            this.defaultList = false
        }
    },
    showDefaultList: function () {
        var c = hasClass(this.resultList, "reverse");
        var a = this.needsReverse();
        if (c != a) {
            if (this.currenDataItems) {
                this.setSelectContent(this.currenDataText || "", this.currenDataItems)
            }
            toggleClass(this.resultList, "reverse", a);
            toggleClass(this.resultListShadow, "reverse", a);
            c = a
        }
        if (this.defaultList && this.select.hasItems()) {
            if (this.options.multiselect || !this._selectedItems.length) {
                this.select.show()
            } else {
                this.select.show(this._selectedItems[0][0])
            }
        } else {
            this.defaultList = true;
            //var b = null;
            var b = this.options.autocomplete ? this.options.introText : null;
            this._showSelectList(b, (this.options.defaultItems.length || this.options.zeroDefault) ? this.options.defaultItems : this.dataItems)
        } if (c) {
            if (!this._selectedItems.length) {}
            setStyle(this.resultList, {
                bottom: getSize(this.container)[1] - 1
            })
        } else {
            setStyle(this.resultList, {
                bottom: "auto"
            })
        }
    },
    showDataList: function (a, b) {
        this.defaultList = false;
        this._showSelectList(null, a, b)
    },
    needsReverse: function () {
        var g = window.scrollGetY ? scrollGetY() : getScroll()[1];
        var c = getXY(this.container)[1] || 0;
        var j = getSize(this.container)[1] || 22;
        var d = this.options.height || 250;
        var e = this.options.minHeight || 0;
        var a = (window.pageNode && window.browser.mozilla ? Math.min(getSize(pageNode)[1], window.lastWindowHeight) : window.lastWindowHeight) || getScroll()[3];
        var k = this.resultList && this.resultList.firstChild;
        var f;
        if (k && k.firstChild) {
            var h = getStyle(this.resultList, "display"),
                b = getStyle(this.resultList, "visibility");
            setStyle(this.resultList, {
                visibility: "hidden",
                display: "block"
            });
            f = getSize(this.resultList)[1];
            setStyle(this.resultList, {
                visibility: b,
                display: h
            })
        } else {
            f = e ? e : (this.currenDataItems ? this.currenDataItems.length * getSize(this.container)[1] : d)
        } if (f > d) {
            f = d
        }
        return (c + j + f - g > a && c - f - g > 0 && c - f > 40)
    },
    setSelectContent: function (g, e, f) {
        e = isArray(e) && e.length ? e : [];
        var a = [];
        this.select.clear();
        if (g) {
            a.push(["", g, true])
        }
        var d;
        if (e.length) {
            for (d in e) {
                if (typeof e[d] != "object") {
                    e[d] = [e[d], e[d]]
                }
            }
            if (this.options.multiselect) {
                e = this.filterData(e)
            }
            if (this.options.dividingLine == "smart") {
                removeClass(this.resultList, "dividing_line");
                for (d in e) {
                    if (typeof (e[d][2]) == "string" && e[d][2].length) {
                        addClass(this.resultList, "dividing_line")
                    }
                }
            }
            var h = (this.options.autocomplete && f) ? this.options.maxItemsShown(f.length) : e.length;
            var j = this;
            for (d = 0; d < e.length; ++d) {
                var c = e[d];
                if (!h) {
                    break
                }
                var b = j.options.formatResult(c);
                if (f) {
                    if ((b = j.options.highlight(b, f))) {
                        --h
                    }
                }
                if (!b) {
                    continue
                }
                a.push([c[0], b])
            }
        }
        if (g && a.length > 1) {
            a = a.slice(1)
        }
        this.select.content(a)
    },
    _showSelectList: function (d, b, c) {
        this.currenDataItems = b;
        this.currenDataText = d;
        if (window.is_rtl) {
            var a = getXY(this.container)[0];
            if (a) {
                geByClass("results_container", this.container)[0].style.left = a + "px"
            }
        }
        this.setSelectContent(d, b, c);
        if (this.select.hasItems()) {
            if (this.options.multiselect || !this._selectedItems.length) {
                this.select.show()
            } else {
                this.select.show(this._selectedItems[0][0])
            }
        }
        return true
    },
    receiveData: function (b, a) {
        if (b != this.curTerm) {
            return
        }
        if (b !== "" && a && a.length && this.hasFocus) {
            this.receivedData = a;
            this.showDataList(a, b)
        } else {
            this.select.hide()
        }
    },
    filterData: function (c) {
        var a = [];
        var b = this;
        each(c, function (e) {
            for (var d in b._selectedItems) {
                if (this[0] == b._selectedItems[d][0]) {
                    return
                }
            }
            a.push(this)
        });
        return a
    },
    request: function (success, failure) {
        if (!this.dataURL) {
            return
        }
        var term = trim(this.input.value.toLowerCase());
        var self = this;
        if (term.length == 0) {
            return
        }
        var sep = this.dataURL.indexOf("?") == -1 ? "?" : "&";
        var url = this.dataURL + sep + "str=" + encodeURIComponent(term);
        var done = function (data) {
            if (self.options.progressBar) {
                hide(self.options.progressBar)
            }
            try {
                data = eval("(" + data + ")")
            } catch (e) {}
            if (data.length) {
                self.cache.setData(term, data);
                if (isFunction(success)) {
                    success(term, data)
                }
            } else {
                self.cache.setData(term, []);
                if (isFunction(failure)) {
                    failure(term)
                }
            }
        };
        ajax.plainpost(url, {}, done);
        if (this.options.progressBar) {
            show(this.options.progressBar)
        }
    },
    doSort: function (d) {
        var c, a, b;
        if (!d.length || d.length < 2) {
            return
        }
        for (c = 0; c < d.length - 1; c++) {
            for (a = c + 1; a < d.length; a++) {
                if (d[c][1] > d[a][1]) {
                    b = d[c];
                    d[c] = d[a];
                    d[a] = b
                }
            }
        }
    },
    disable: function (b) {
        if (b && !this.disabled) {
            this.disabled = true;
            addClass(this.container, "disabled");
            var a = getSize(this.container);
            if (this.options.disabledText) {
                this.input.value = ""
            }
            this.container.appendChild(ce("div", {
                className: "hide_mask"
            }, {
                position: "absolute",
                background: "#000",
                opacity: 0,
                width: a[0] + "px",
                height: a[1] + "px",
                marginTop: -a[1] + "px"
            }));
            this.input.blur();
            this.input.style.color = "";
            this.select.hide()
        } else {
            if (!b && this.disabled) {
                this.disabled = false;
                if (this.options.autocomplete) {
                    this.input.value = ""
                }
                removeClass(this.container, "disabled");
                this.container.removeChild(geByClass("hide_mask", this.container)[0])
            }
        }
        this.updatePlaceholder()
    },
    _clear: function () {
        this.showImage();
        if (this.options.multiselect) {
            this.selectedTokenId = 0;
            this.selectedItemsContainer.innerHTML = "";
            this.defaultList = false
        }
        if (!this.options.multiselect && !this.options.autocomplete) {
            if (this._selectedItems[0] != this.options.defaultItems[0]) {
                this._selectItem(this.options.defaultItems[0], false)
            }
        } else {
            removeClass(this.input, "selected");
            this.resultField.value = "";
            this._selectedItems.splice(0, this._selectedItems.length)
        }
        return false
    },
    setURL: function (a) {
        if (typeof (a) == "string") {
            this.dataURL = a;
            if (!this.cache) {
                this.cache = new Cache(this.options)
            } else {
                this.cache.flush()
            } if (this.indexer) {
                delete this.indexer
            }
            this.dataItems = []
        }
    },
    setData: function (b) {
        if (!isArray(b)) {
            return
        }
        if (!this.options.autocomplete) {
            this.select.clear();
            this.options.defaultItems = b;
            if (!this.options.multiselect) {
                if (!this._selectedItems.length && this.options.defaultItems.length) {
                    this._selectItem(this.options.defaultItems[0], false)
                } else {
                    if (this._selectedItems.length) {
                        var d = false;
                        for (var a in this.options.defaultItems) {
                            var c = this.options.defaultItems[a][0] || this.options.defaultItems[a];
                            if (c == this._selectedItems[0][0] || c == this._selectedItems[0][0]) {
                                d = true;
                                break
                            }
                        }
                        if (!d) {
                            this._selectItem(this.options.defaultItems[0], false)
                        } else {
                            this._selectItem(this._selectedItems[0][0], false)
                        }
                    }
                }
            }
        } else {
            this.dataItems = b;
            this.dataURL = null
        } if (!this.indexer) {
            this.indexer = new Indexer(b)
        } else {
            this.indexer.setData(b)
        } if (this.cache) {
            delete this.cache
        }
    },
    focus: function () {
        if (!this.readOnly) {
            this.input.focus()
        }
    },
    selectItem: function (b, a) {
        this._selectItem(b, a)
    },
    setOptions: function (c) {
        c = this.prepareOptionsText(c);
        extend(this.options, c);
        if ("maxItems" in c && this.options.maxItems >= 0) {
            for (var b = this._selectedItems.length - 1; b >= this.options.maxItems; b--) {
                this.removeTagData(this._selectedItems[b][0])
            }
        }
        if ("defaultItems" in c) {
            this.select.clear();
            if (this.select.isVisible(this.container)) {
                this.showDefaultList()
            }
        }
        if ("enableCustom" in c) {
            if (this.options.enableCustom && !this.options.autocomplete) {
                this.options.autocomplete = c.autocomplete = true
            }
        }
        if ("width" in c) {
            this.container.style.width = this.options.width + "px";
            this.resultList.style.width = this.resultListShadow.style.width = this.options.width + "px";
            this.selectorWidth = this.options.width - this.scrollbarWidth
        }
        if ("dropdown" in c) {
            var a = geByClass("selector_dropdown", this.container)[0];
            if (!this.options.dropdown && a) {
                this.destroyDropdown();
                a.parentNode.removeChild(a)
            } else {
                if (!a && this.options.dropdown) {
                    a = this.container.firstChild.rows[0].insertCell(1);
                    a.id = "dropdown" + this.guid;
                    a.className = "selector_dropdown";
                    a.innerHTML = "&nbsp;";
                    this.dropdownButton = a;
                    this.initDropdown();
                    this.initDropdownEvents()
                }
            }
        }
        if ("autocomplete" in c) {
            if (this.options.autocomplete) {
                removeClass(this.container, "dropdown_container");
                this.input.readOnly = false;
                this.readOnly = ""
            } else {
                addClass(this.container, "dropdown_container");
                this.input.readOnly = true;
                this.options.enableCustom = false;
                this.readOnly = 'readonly="true"'
            }
        }
        if (("width" in c) || ("autocomplete" in c) || ("dropdown" in c) || ("placeholder" in c) || ("disabledText" in c)) {
            this.updateInput()
        }
    },
    val: function (b, a) {
        if (b !== undefined) {
            this._selectItem(b, (a === undefined) ? false : a)
        }
        return this.resultField.value
    },
    val_full: function () {
        if (this.options.multiselect) {
            return this._selectedItems
        } else {
            if (this._selectedItems.length) {
                return this._selectedItems[0]
            } else {
                return [this.resultField.value, this.input.value]
            }
        }
    },
    customVal: function (b, a) {
        if (b !== undefined) {
            this.customField.value = b;
            this.selectItem([this.options.valueForCustom, b], (a === undefined) ? false : a)
        }
        return this.customField.value
    },
    selectedItems: function () {
        return this._selectedItems
    },
    clear: function () {
        this._clear();
        this.updateInput()
    }
});
createChildClass("Select", UiControl, {
    common: {
        _sel: window.Select && Select._sel || [],
        reg: function (a) {
            this._sel.push(a);
            return this._sel.length
        },
        destroy: function (a) {
            this._sel[a - 1] = false
        },
        itemMouseMove: function (b, a, c) {
            this._sel[b - 1].onMouseMove(a, c)
        },
        itemMouseDown: function (b, a, c) {
            this._sel[b - 1].onMouseDown(a, c)
        }
    },
    CSS: {
        FIRST: "first",
        LAST: "last",
        ACTIVE: "active",
        SCROLLABLE: "result_list_scrollable"
    },
    controlName: "SelectList",
    initOptions: function (a, c, b) {
        this.options = b || {}
    },
    init: function (a, c, b) {
        this.container = a;
        this.shadow = c;
        this.active = -1;
        this.data = [];
        this.uid = this.common.reg(this);
        this.maxHeight = this.options.height ? this.options.height : 250
    },
    initDOM: function () {
        this.list = ce("ul");
        this.container.appendChild(this.list)
    },
    show: function (e) {
        var d = isVisible(this.container);
        if (!d) {
            this.performShow()
        }
        var c;
        var b;
        if (e) {
            for (b = 0; b < this.list.childNodes.length; b++) {
                c = this.list.childNodes[b];
                if (c.getAttribute("val") == e) {
                    this.highlight(b, c);
                    break
                }
            }
        } else {
            if (this.options.selectFirst) {
                var f = false;
                var a;
                for (b = 0; b < this.list.childNodes.length; b++) {
                    a = f ? this.list.childNodes.length - 1 - b : b;
                    c = this.list.childNodes[a];
                    if (!c.getAttribute("dis")) {
                        this.highlight(a, c);
                        break
                    }
                }
            }
        } if (!d && isFunction(this.options.onShow)) {
            this.options.onShow()
        }
    },
    hide: function () {
        if (!isVisible(this.container)) {
            return
        }
        hide(this.container);
        hide(this.shadow);
        if (isFunction(this.options.onHide)) {
            this.options.onHide()
        }
        this.highlight(-1);
        if (isFunction(this.options.onItemActive)) {
            this.options.onItemActive()
        }
    },
    handleKeyEvent: function (a) {
        if (!isVisible(this.container)) {
            return true
        }
        switch (a.keyCode) {
            case KEY.UP:
                this.movePosition(-1);
                return cancelEvent(a);
                break;
            case KEY.DOWN:
                this.movePosition(1);
                return cancelEvent(a);
                break;
            case KEY.TAB:
                this.hide();
                break;
            case KEY.RETURN:
                if (isFunction(this.options.onItemSelect) && this.active > -1) {
                    this.options.onItemSelect(this.selectedItem(), undefined, true)
                }
                cancelEvent(a);
                return false;
                break;
            case KEY.ESC:
                this.hide();
                return false;
                break;
            case KEY.PAGEUP:
            case KEY.PAGEDOWN:
                return false;
                break
        }
        return true
    },
    clear: function () {
        this.highlight(-1);
        this.list.innerHTML = "";
        this.updateContainer()
    },
    destroy: function () {
        this.clear();
        Select.destroy(this.uid)
    },
    selectedItem: function () {
        if (this.active >= 0) {
            var a = this.list.childNodes[this.active];
            var b = a.getAttribute("val") || a.innerHTML;
            return b
        }
        return undefined
    },
    movePosition: function (c) {
        var b = intval(this.active) + intval(c);
        if (b < 0) {
            this.container.scrollTop = 0
        } else {
            if (b + 1 > this.list.childNodes.length) {
                this.container.scrollTop = this.list.offsetTop + this.list.offsetHeight - this.container.offsetHeight
            }
        }
        while (1) {
            if (b + 1 > this.list.childNodes.length || b < 0) {
                if (this.options.cycle) {
                    break
                } else {
                    return false
                }
            }
            var a = this.list.childNodes[b];
            if (a && !a.getAttribute("dis")) {
                break
            }
            b++
        }
        this.highlight(b, this.list.childNodes[b]);
        return true
    },
    highlight: function (a, b) {
        if (this.active != -1) {
            removeClass(this.list.childNodes[this.active], this.CSS.ACTIVE)
        }
        if (!b) {
            this.active = -1;
            return
        }
        this.active = a;
        addClass(b, this.CSS.ACTIVE);
        if (isFunction(this.options.onItemActive)) {
            this.options.onItemActive(b.getAttribute("val") || b.innerHTML)
        }
        if (b.offsetTop + b.offsetHeight + this.list.offsetTop > this.container.offsetHeight + this.container.scrollTop - 1) {
            this.container.scrollTop = b.offsetTop + this.list.offsetTop + b.offsetHeight - this.container.offsetHeight + 1
        } else {
            if (b.offsetTop + this.list.offsetTop < this.container.scrollTop) {
                this.container.scrollTop = b.offsetTop + this.list.offsetTop
            }
        }
    },
    onMouseMove: function (a, b) {
        if (hasClass(b, "active")) {
            return false
        }
        this.highlight(a, b);
        return true
    },
    onMouseDown: function (a, b) {
        var c = b.getAttribute("val") || b.innerHTML;
        if (isFunction(this.options.onItemSelect)) {
            this.options.onItemSelect(c, undefined, true)
        }
        this.hide()
    },
    updateContainer: function () {
        var b = this.container && hasClass(this.container, "reverse");
        if (this.maxHeight < this.list.offsetHeight) {
            this.container.style.height = this.maxHeight + "px";
            if (b) {
                hide(this.shadow)
            } else {
                show(this.shadow);
                this.shadow.style.marginTop = (this.maxHeight + 1) + "px"
            }
            addClass(this.container, this.CSS.SCROLLABLE)
        } else {
            removeClass(this.container, this.CSS.SCROLLABLE);
            this.container.style.height = "auto";
            var a = intval(this.list.offsetHeight) + intval(this.list.offsetTop);
            if (a && !b) {
                show(this.shadow);
                this.shadow.style.marginTop = a + "px"
            } else {
                hide(this.shadow)
            }
        }
    },
    content: function (j) {
        var f = [];
        var e, c, l, m, h, k, b;
        var g = j.length;
        for (e = 0; e < g; ++e) {
            c = j[e];
            l = c[0];
            m = c[1];
            h = c[2];
            b = this.uid + ", " + e;
            l = (l === undefined) ? "" : l.toString();
            m = ((m === undefined) ? "" : m.toString()) || l;
            f.push("<li ", !h ? 'onmousemove="Select.itemMouseMove(' + b + ', this)" onmousedown="Select.itemMouseDown(' + b + ', this)"' : 'dis="1"', ' val="', l.replace(/&/g, "&amp;").replace(/"/g, "&quot;"), '" class="', (h ? "disabled " : ""), ((e == g - 1) ? (this.CSS.LAST + " ") : ""), (e ? "" : this.CSS.FIRST) + '">', m, "</li>")
        }
        this.list.innerHTML = f.join("");
        this.updateContainer();
        return true
    },
    removeItem: function (e) {
        var f;
        var b = this.list.childNodes;
        var a = b.length;
        var c;
        if (e === f) {
            return
        }
        for (c = 0; c < a; ++c) {
            var d = b[c];
            if (d.getAttribute("val") != e && d.innerHTML != e) {
                continue
            }
            d.setAttribute("dis", "1");
            hide(d);
            break
        }
        for (c = 0; c < a; ++c) {
            if (isVisible(b[c])) {
                addClass(b[c], this.CSS.FIRST);
                break
            }
        }
        for (c = a; c > 0; --c) {
            if (isVisible(b[c - 1])) {
                addClass(b[c - 1], this.CSS.LAST);
                break
            }
        }
        this.updateContainer()
    },
    performShow: function () {
        this.list.style.position = "absolute";
        this.list.style.visibility = "hidden";
        show(this.container);
        show(this.shadow);
        this.updateContainer();
        this.list.style.position = "relative";
        this.list.style.visibility = "visible"
    },
    isVisible: function () {
        return isVisible(this.container)
    },
    hasItems: function () {
        return this.list.childNodes.length > 0
    },
    toggle: function () {
        if (this.isVisible(this.container)) {
            this.hide()
        } else {
            this.show()
        }
    }
});