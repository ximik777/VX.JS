createUiClass('audioPlayer', {
    defaultOptions: {
        swfLocation: '/swf/audiojs_mp3.swf',
        swfQueryString: 'playerInstance=_ui._uids[$1]&datetime=$2',
        onReady: function () {
        },
        onError: function (e) {
        }, // e - obj
        onLoadProgress: function (loadPercent, duration) {
        },
        onPlayProgress: function (playPercent) {
        },
        onTrackEnded: function () {
        },
        onPlayed: function () {
        },
        onPaused: function () {
        },
        setButton: false // or id
    },
    beforeInit: function () {
        this.guid = _ui.reg(this);
        this.name = 'audio_' + this.guid;
        this.player = null;
        this.ready = false;
        this.played = false;
        this.loadFile = false;
        this.loadPercent = 0;
        this.playPercent = 0;
    },
    initOptions: function (options) {
        this.options = extend({}, this.defaultOptions, options);
    },
    init: function (options) {
        if (!this.hasFlash()) this.options.onError({'error': 1, 'message': 'Flash player not installed'});
    },
    initDOM: function (options) {
        this.src = (this.options.swfLocation + '?' + this.options.swfQueryString)
            .replace(/\$2/g, (+new Date + Math.random()))
            .replace(/\$1/g, this.guid);
        this.source = '' +
            '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" id="' + this.name + '" width="1" height="1" name="' + this.name + '">' +
            '<param name="movie" value="' + this.src + '">' +
            '<param name="allowscriptaccess" value="always">' +
            '<embed name="' + this.name + '" src="' + this.src + '" width="1" height="1" allowscriptaccess="always">' +
            '</object>';
        this.container = ce('div', {id: 'audio_container_' + this.guid, innerHTML: this.source}, {
            position: 'absolute',
            left: '-1px',
            width: '1px',
            height: '1px'
        });
        document.body.appendChild(this.container);
    },
    hasFlash: function () {
        if (navigator.plugins && navigator.plugins.length && navigator.plugins['Shockwave Flash']) return true;
        else if (navigator.mimeTypes && navigator.mimeTypes.length) {
            var mimeType = navigator.mimeTypes['application/x-shockwave-flash'];
            return mimeType && mimeType.enabledPlugin;
        } else {
            try {
                var ax = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                return true;
            } catch (e) {
            }
        }
        return false;
    },
    getSwf: function (name) {
        var swf = document[name] || window[name];
        return swf.length > 1 ? swf[swf.length - 1] : swf;
    },
    loadStarted: function () {
        this.ready = true;
        this.player = this.getSwf(this.name).pplay ? this.getSwf(this.name) : geByTag1('EMBED', ge(this.name));
        if (!this.player.pplay) {
            this.options.onError({'error': 2, 'message': 'Flash Player has no methods'});
            return false;
        }
        this.options.onReady(this);
        this.setButton();
    },
    loadError: function () {
        this.options.onError({'error': 3, 'message': 'Flash player load file error'});
    },
    loadProgress: function (loadPercent, trackDuration) {
        if (trackDuration == 0) return;

        this.duration = trackDuration;
        this.loadPercent = loadPercent;
        this.options.onLoadProgress(loadPercent, this.duration);
    },
    updatePlayhead: function (playPercent) {
        this.playPercent = playPercent;
        this.options.onPlayProgress(playPercent);
    },
    trackEnded: function () {
        this.pause();
        this.updatePlayhead(1);
        this.options.onTrackEnded();
    },
    load: function (file) {
        try {
            this.played = false;
            this.player.load(file);
            this.loadFile = file;
            this.buttonToggle();
        } catch (e) {
            this.options.onError({'error': 9, 'message': 'Flash player load file error'});
        }
    },
    play: function (file) {
        file = file || false;
        if (file) this.load(file);
        else {
            if (this.played) return;
        }
        try {
            this.player.pplay();
            this.played = true;
            this.options.onPlayed();
            this.buttonToggle();
        } catch (e) {
            this.options.onError({'error': 8, 'message': 'Flash player play error'});
        }
    },
    pause: function () {
        try {
            this.player.ppause();
            this.played = false;
            this.options.onPaused();
            this.buttonToggle();
        } catch (e) {
            this.options.onError({'error': 7, 'message': 'Flash player pause error'});
        }
    },
    playPause: function () {
        this.played ? this.pause() : this.play();
    },
    skipTo: function (percent) {
        percent = percent < 0 ? 0 : percent > 1 ? 1 : percent;
        percent = this.loadPercent < percent ? this.loadPercent : percent;
        try {
            this.player.skipTo(percent);
            this.updatePlayhead(percent);
        } catch (e) {
            this.options.onError({'error': 4, 'message': 'Flash player skip error'});
        }
    },
    setVolume: function (percent) {
        percent = percent < 0 ? 0 : percent > 1 ? 1 : percent;
        try {
            this.player.setVolume(percent);
        } catch (e) {
            this.options.onError({'error': 5, 'message': 'Flash player set volume error'});
        }
    },
    buttonToggle: function () {
        if (!this.options.setButton && !ge(this.options.setButton)) return false;
        var button = ge(this.options.setButton);

        if (this.played) {
            replaceClass(button, 'pause', 'play');
        } else {
            replaceClass(button, 'play', 'pause');
        }
    },
    setButton: function () {
        if (!this.options.setButton && !ge(this.options.setButton)) return false;
        var button = ge(this.options.setButton), self = this;
        addClass(button, 'playpause pause');
        addEvent(button, 'mouseover mouseout mousedown mouseup click', function (e) {

            switch (e.type) {
                case 'mouseover':
                    addClass(button, 'hover');
                    break;
                case 'mouseout':
                    removeClass(button, 'hover');
                    removeClass(button, 'active');
                    break;
                case 'mousedown':
                    addClass(button, 'active');
                    break;
                case 'mouseup':
                    removeClass(button, 'active');
                    break;
                case 'click':
                    self.played ? self.pause() : self.play();
                    break;
            }
        });
        return true;
    }
});