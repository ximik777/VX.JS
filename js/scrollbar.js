function checkEvent(e) {
    return ((e = (e || window.event)) && (e.type == 'click' || e.type == 'mousedown' || e.type == 'mouseup') && (e.which > 1 || e.button > 1 || e.ctrlKey || e.shiftKey || browser.mac && e.metaKey)) || false;
}
// Tiny Scrollbars start
function Scrollbar(obj, options) {
    this.obj = obj = ge(obj);
    this.options = options || {};
    this.clPref = options.prefix || '';
    this.isHorizontal = options.horizontal;
    this.scrollProp = this.isHorizontal ? 'scrollLeft' : 'scrollTop';
    this.scrollDimensionProp = this.isHorizontal ? 'scrollHeight' : 'scrollWidth';

    setTimeout((function() {
        setStyle(obj, {
            overflow: 'hidden'
        });

        var size = getSize(obj), s;

        if (this.isHorizontal) {
            s = {
                marginTop: (size[1] + 2)+'px',
                width: size[0] + 'px'
            };
        } else {
            s = {
                marginLeft: (size[0] - (options.mlDiff || 7))+'px',
                height: size[1] + 'px'
            }
        }

        if (options.nomargin) {
            delete s.marginLeft;
            s.right = options.right || 0;
            s.left = options.left || 0;
        }
        this.scrollWidth = size[0];
        this.scrollHeight = size[1];

        this.scrollbar = ce('div', {
            className: this.clPref + 'scrollbar_cont'
        });
        setStyle(this.scrollbar, s);

        this.inner = ce('div', {
            className: this.clPref + 'scrollbar_inner'
        });
        this.scrollbar.appendChild(this.inner);

        if (options.shadows) {
            obj.parentNode.insertBefore(this.topShadowDiv = ce('div', {
                className: this.clPref + 'scrollbar_top'
            }, {width: size[0]}), obj);
            obj.parentNode.insertBefore(this.bottomShadowDiv = ce('div', {
                className: this.clPref + 'scrollbar_bottom'
            }, {width: size[0]}), obj.nextSibling);
        }

        obj.parentNode.insertBefore(this.scrollbar, obj);

        this.destroyList = [];

        this.mouseMove = this._mouseMove.bind(this);
        this.mouseUp = this._mouseUp.bind(this);
        var self = this;
        function down(event) {
            if (self.moveY || checkEvent(event)) return;
            addEvent(window.document, 'mousemove', self.mouseMove);
            addEvent(window.document, 'mouseup', self.mouseUp);
            if (self.isHorizontal) {
                self.moveX = event.pageX - (self.inner.offsetLeft || 0);
            } else {
                self.moveY = event.pageY - (self.inner.offsetTop || 0);
            }

            window.document.body.style.cursor = 'pointer';
            addClass(self.inner, self.clPref + 'scrollbar_hovered');
            if (options.startDrag) {
                options.startDrag();
            }
            if (options.onHold) {
                options.onHold(true);
            }
            self.isDown = true;
            return cancelEvent(event);
        }
        this.mouseDown = down;
        function keydown(event) {
            switch ((event || window.event).keyCode) {
                case 40:  self.obj[self.scrollProp] += 40; break;
                case 38:  self.obj[self.scrollProp] -= 40; break;
                case 34:  self.obj[self.scrollProp] += self[self.scrollDimensionProp]; break;
                case 33:  self.obj[self.scrollProp] -= self[self.scrollDimensionProp]; break;
                default: return true;
            }
            self.update(true);
            return cancelEvent(event);
        }
        var wheel = this.wheel.bind(this);
        addEvent(obj, 'mousewheel', wheel);
        addEvent(obj, 'DOMMouseScroll', wheel);
        if (options.scrollElements) {
            for (var i in options.scrollElements) {
                addEvent(options.scrollElements[i], 'mousewheel', wheel);
                addEvent(options.scrollElements[i], 'DOMMouseScroll', wheel);
            }
        }
        addEvent(this.scrollbar, 'mousewheel', wheel);
        addEvent(this.scrollbar, 'DOMMouseScroll', wheel);

        addEvent(this.scrollbar, 'mouseover', this.contOver.bind(this));
        addEvent(this.scrollbar, 'mouseout', this.contOut.bind(this));
        addEvent(this.scrollbar, 'mousedown', this.contDown.bind(this));

        if (browser.safari_mobile) {
            var touchstart = function(event) {
                if (self.isHorizontal) {
                    cur.touchX = event.touches[0].pageX;
                } else {
                    cur.touchY = event.touches[0].pageY;
                }
            };
            var touchmove = function(event) {
                if (self.isHorizontal) {
                    var touchX = event.touches[0].pageX;
                    cur.touchDiff = cur.touchX - touchX;
                    obj.scrollLeft += cur.touchDiff;
                    cur.touchX = touchX;
                    if (obj.scrollLeft > 0 && self.shown !== false) {
                        self.update(true);
                    }
                } else {
                    var touchY = event.touches[0].pageY;
                    cur.touchDiff = cur.touchY - touchY;
                    obj.scrollTop += cur.touchDiff;
                    cur.touchY = touchY;
                    if (obj.scrollTop > 0 && self.shown !== false) {
                        self.update(true);
                    }

                    return cancelEvent(event);
                }
            };
            var touchend = function() {
                cur.animateInt = setInterval(function() {
                    cur.touchDiff = cur.touchDiff * 0.9;
                    if (cur.touchDiff < 1 && cur.touchDiff > -1) {
                        clearInterval(cur.animateInt);
                    } else {
                        obj[self.scrollProp] += cur.touchDiff;
                        self.update(true);
                    }
                }, 0);
            };
            addEvent(obj, 'touchstart', touchstart);
            addEvent(obj, 'touchmove', touchmove);
            addEvent(obj, 'touchend', touchend);

            this.destroyList.push(function() {
                removeEvent(obj, 'touchstart', touchstart);
                removeEvent(obj, 'touchmove', touchmove);
                removeEvent(obj, 'touchend', touchend);
            });
        }

        addEvent(this.inner, 'mousedown', down);
        if (!options.nokeys) {
            addEvent(window, 'keydown', keydown);
        } else {
            this.onkeydown = keydown;
        }


        this.destroyList.push(function() {
            removeEvent(obj, 'mousewheel', wheel);
            removeEvent(obj, 'DOMMouseScroll', wheel);
            if (options.scrollElements) {
                for (var i in options.scrollElements) {
                    removeEvent(options.scrollElements[i], 'mousewheel', wheel);
                    removeEvent(options.scrollElements[i], 'DOMMouseScroll', wheel);
                }
            }
            removeEvent(self.inner, 'mousedown', down);
            removeEvent(window, 'keydown', keydown);
        });

        if (!this.isHorizontal) {
            if (this.contHeight() <= this.scrollHeight) {
                hide(this.bottomShadowDiv);
            } else {
                this.bottomShadow = true;
            }
        }
        this.inited = true;
        this.update(true);

        if (!options.global) {
            cur.destroy.push(this.destroy.bind(this));
        }
    }).bind(this), 0);
}

Scrollbar.prototype.contOver = function() {
    this.isOut = false;
    if (this.shown) {
        addClass(this.scrollbar, 'scrollbar_c_overed');
    }
}
Scrollbar.prototype.contOut = function() {
    this.isOut = true;
    if (this.isDown) return;
    removeClass(this.scrollbar, 'scrollbar_c_overed');
}
Scrollbar.prototype.contDown = function(ev) {
    var v, srcH, newScroll;
    if (this.isHorizontal) {
        v = ev.offsetX - this.innerWidth / 2 + 5;
        scrH = this.scrollWidth - this.innerWidth;

        newScroll = Math.floor((this.contWidth() - this.scrollWidth) * Math.min(1, v / scrH));
        this.obj.scrollLeft = newScroll;
    } else {
        v = ev.offsetY - this.innerHeight / 2 + 5;// - this.innerHeight;
        scrH = this.scrollHeight - this.innerHeight;

        newScroll = Math.floor((this.contHeight() - this.scrollHeight) * Math.min(1, v / scrH));
        this.obj.scrollTop = newScroll;
    }

    this.update(true);
    this.mouseDown(ev);
}

Scrollbar.prototype._mouseMove = function(event) {
    var newScroll;
    if (this.isHorizontal) {
        newScroll = Math.floor((this.contWidth() - this.scrollWidth) * Math.min(1, (event.pageX - this.moveX) / (this.scrollWidth - this.innerWidth - 6)));
        if (this.options.onScroll) {
            this.options.onScroll(this.obj.scrollLeft - newScroll);
        }
        this.obj.scrollLeft = newScroll;
    } else {
        newScroll = Math.floor((this.contHeight() - this.scrollHeight) * Math.min(1, (event.pageY - this.moveY) / (this.scrollHeight - this.innerHeight - 6)));
        if (this.options.onScroll) {
            this.options.onScroll(this.obj.scrollTop - newScroll);
        }
        this.obj.scrollTop = newScroll;
    }
    this.update(true);
    return false;
}

Scrollbar.prototype._mouseUp = function(event) {
    this.moveY = false;
    this.moveX = false;
    this.isDown = false;
    if (this.isOut) {
        this.contOut();
    }
    removeEvent(window.document, 'mousemove', this.mouseMove);
    removeEvent(window.document, 'mouseup', this.mouseUp);
    window.document.body.style.cursor = 'default';
    removeClass(this.inner, this.clPref + 'scrollbar_hovered');
    if (this.options.stopDrag) {
        this.options.stopDrag();
    }
    if (this.options.onHold) {
        this.options.onHold(false);
    }
    return false;
}

Scrollbar.prototype.wheel = function(event) {
    if (this.disabled) {
        return;
    }
    if (!event) event = window.event;
    var delta = 0, stWas;

    if (event.wheelDeltaY || event.wheelDelta) {
        delta = (event.wheelDeltaY || event.wheelDelta) / 2;
    } else if (event.detail) {
        delta = -event.detail * 10
    }

    stWas = this.obj[this.scrollProp];
    this.obj[this.scrollProp] -= delta;

    if (this.options.onScroll) {
        this.options.onScroll(delta);
    }

    if (stWas != this.obj[this.scrollProp] && this.shown !== false) {
        this.update(true);
        addClass(this.inner, this.clPref + 'scrollbar_hovered');
        clearTimeout(this.moveTimeout);
        this.moveTimeout = setTimeout((function() {
            removeClass(this.inner, this.clPref + 'scrollbar_hovered');
        }).bind(this), 300);
    }
    if (this.shown || this.options.forceCancelEvent) {
        if (this.isHorizontal && stWas == this.obj[this.scrollProp]) {
            // no op
        } else {
            return false;
        }
    }
}

Scrollbar.prototype.hide = function(anim) {
    hide(this.topShadowDiv, this.bottomShadowDiv, this.scrollbar)
    this.hidden = true;
}
Scrollbar.prototype.show = function(anim) {
    show(this.topShadowDiv, this.bottomShadowDiv, this.scrollbar)
    this.hidden = false;
}
Scrollbar.prototype.disable = function() {
    this.hide();
    this[this.scrollProp](0);
    this.disabled = true;
}
Scrollbar.prototype.enable = function() {
    this.show();
    this.update();
    this.disabled = false;
}

Scrollbar.prototype.scrollTop = function(top) {
    this.obj.scrollTop = parseInt(top);
    this.update(false, true);
}

Scrollbar.prototype.scrollLeft = function(left) {
    this.obj.scrollLeft = parseInt(left);
    this.update(false, true);
}

Scrollbar.prototype.destroy = function(top) {
    each(this.destroyList, function (k, f) {f();});
}

Scrollbar.prototype.contHeight = function() {
    if (this.options.contHeight) {
        return this.options.contHeight;
    }
    if (this.contHashCash) {
        return this.contHashCash;
    }
    var nodes = this.obj.childNodes;
    var height = 0;
    var i = nodes.length;
    while (i--) {
        height += nodes[i].offsetHeight || 0;
    }
    this.contHashCash = height;
    return height;
}

Scrollbar.prototype.contWidth = function() {
    if (this.options.contWidth) {
        return this.options.contWidth;
    }
    if (this.contHashWidthCash) {
        return this.contHashWidthCash;
    }
    var nodes = this.obj.childNodes;
    var width = 0;
    var i = nodes.length;
    while (i--) {
        width += nodes[i].offsetWidth || 0;
    }
    this.contHashWidthCash = width;
    return width;
}

Scrollbar.prototype.val = function(value) {
    if (value) {
        this.obj[this.scrollProp] = value;
        this.update(true, true);
    }
    return this.obj[this.scrollProp];
}

Scrollbar.prototype.update = function(noChange, updateScroll) {
    if (!this.inited || this.hidden) {
        return;
    }
    if (!noChange) {
        this.contHashCash = false;
        this.contHashWidthCash = false;
        if (this.moveY && !this.isHorizontal) {
            return true;
        } else if (this.moveX) {
            return true;
        }
    }
    if (updateScroll) {
        var size = getSize(this.obj);
        if (this.isHorizontal) {
            this.scrollWidth = size[0];
            setStyle(this.scrollbar, 'width', size[0]);
        } else {
            this.scrollHeight = size[1];
            setStyle(this.scrollbar, 'height', size[1]);
        }
    }
    var height = this.contHeight();
    var width = this.contWidth();
    if (!this.isHorizontal && height <= this.scrollHeight) {
        hide(this.inner, this.bottomShadowDiv, this.topShadowDiv);
        setStyle(this.scrollbar, {pointerEvents: 'none'});
        this.topShadow = this.bottomShadow = false;
        this.shown = false;
        return;
    } else if (this.isHorizontal && width <= this.scrollWidth) {
        hide(this.inner, this.bottomShadowDiv, this.topShadowDiv);
        setStyle(this.scrollbar, {pointerEvents: 'none'});
        this.topShadow = this.bottomShadow = false;
        this.shown = false;
        return;
    } else if (!this.shown) {
        show(this.inner);
        setStyle(this.scrollbar, {pointerEvents: 'auto'});
        this.shown = true;
    }

    var progress;

    if (this.isHorizontal) {
        var leftScroll = this.val();
        if (this.options.scrollChange) {
            this.options.scrollChange(leftScroll);
        }
        progress = this.lastProgress = Math.min(1, leftScroll / (width - this.scrollWidth));
    } else {
        var topScroll = this.val();
        if (this.options.scrollChange) {
            this.options.scrollChange(topScroll);
        }
        progress = this.lastProgress = Math.min(1, topScroll / (height - this.scrollHeight));
    }

    if (progress > 0 != (this.topShadow ? true : false)) {
        (this.topShadow ? hide : show)(this.topShadowDiv);
        this.topShadow = !this.topShadow;
    }
    if (progress < 1 != (this.bottomShadow ? true : false)) {
        (this.bottomShadow ? hide : show)(this.bottomShadowDiv);
        this.bottomShadow = !this.bottomShadow;
    }

    if (this.isHorizontal) {
        this.innerWidth = Math.max(40, Math.floor(this.scrollWidth * this.scrollWidth / width));
        this.inner.style.width = this.innerWidth + 'px';
        this.inner.style.marginLeft = Math.floor((this.scrollWidth - this.innerWidth - 4) * progress + 2) + 'px';
    } else {
        this.innerHeight = Math.max(40, Math.floor(this.scrollHeight * this.scrollHeight / height));
        this.inner.style.height = this.innerHeight + 'px';
        this.inner.style.marginTop = Math.floor((this.scrollHeight - this.innerHeight - 4) * progress + 2) + 'px';
    }

    if (this.options.more && isFunction(this.options.more) && (this.options.contHeight || (height - this.obj[this.scrollProp] < this[this.scrollDimensionProp] * 2))) {
        this.options.more();
    }
}