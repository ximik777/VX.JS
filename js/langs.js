if (!lang) var lang = {};

lang['global-yes'] = 'Да';
lang['global-no'] = 'Нет';
lang['global-search'] = 'Поиск';
lang['global-save'] = 'Сохранить';
lang['global-close'] = 'Закрыть';
lang['global-loading'] = 'Загрузка';

lang['qsearch-popular-hints'] = 'Страницы, которые Вы недавно посещали:';
lang['qsearch-no-search-result'] = 'Поиск не дал результатов';
lang['qsearch-connectiong-error'] = 'Ошибка соединения с сервером';

lang['text_exceeds_symbol_limit'] = ['', 'Допустимый объем превышен на %s знак.', 'Допустимый объем превышен на %s знака.', 'Допустимый объем превышен на %s знаков.'];
lang['text_N_symbols_remain'] = ['', 'Остался %s знак.', 'Осталось %s знака.', 'Осталось %s знаков.'];

function langNumeric(count, vars, formatNum) {
    if (!vars) {
        return count;
    }
    var res;
    if (!isArray(vars)) {
        res = vars;
    } else {
        res = vars[1];
        if (count != Math.floor(count)) {
            res = vars[2];
        } else {
            each([[100, [11, 12, 13, 14], 3], [10, [1], 1], [10, [2, 3, 4], 2], ["*", 0, 3]], function (i, v) {
                if (v[0] == '*') {
                    res = vars[v[2]];
                    return false;
                }
                var c = v[0] ? count % v[0] : count;
                if (indexOf(v[1], c) != -1) {
                    res = vars[v[2]];
                    return false;
                }
            });
        }
    }
    if (formatNum) {
        var n = count.toString().split('.'), c = [];
        for (var i = n[0].length - 3; i > -3; i -= 3) {
            c.unshift(n[0].slice(i > 0 ? i : 0, i + 3));
        }
        n[0] = c.join(langConfig.numDel);
        count = n.join(langConfig.numDec);
    }
    res = (res || '%s').replace('%s', count);
    return res;
}

function langSex(sex, vars) {
    if (!isArray(vars)) return vars;
    var res = vars[1];
    each([[1, 2], ["*", 1]], function (i, v) {
        if (v[0] == '*') {
            res = vars[v[1]];
            return false;
        }
        if (sex == v[0] && vars[v[1]]) {
            res = vars[v[1]];
            return false;
        }
    });
    return res;
}

function langKeyNotFound(key) {
    console.log(key);
}

function getLang() {
    try {
        var args = Array.prototype.slice.call(arguments);
        var key = args.shift();
        if (!key) return '...';
        var val = (window.lang && window.lang[key]) || (window.langpack && window.langpack[key]) || window[key];
        if (!val) {
            langKeyNotFound(key);
            return key.split('-').join(' ');
        }
        if (isFunction(val)) {
            return val.apply(null, args);
        } else if (args[0] !== undefined || isArray(val)) {
            return langNumeric(args[0], val, args[1]);
        } else {
            return val;
        }
    } catch (e) {
        debugLog('lang error:' + e.message + '(' + Array.prototype.slice.call(arguments).join(', ') + ')');
    }
}

function writeLang(key) {
    if (!key) {
        return document.write('...');
    }
    var val = (window.lang && window.lang[key]) || (window.langpack && window.langpack[key]) || window[key];
    if (!val) {
        var res = key.split('-');
        //res.shift();
        return document.write('≠' + res.join(' '));
    }
    return document.write(val);
}

function parseLatin(text, back) {
    var outtext = text, i;
    var lat1 = ["y", "yo", "zh", "kh", "ts", "ch", "sch", "shch", "sh", "eh", "yu", "ya", "YO", "ZH", "KH", "TS", "CH", "SCH", "SHCH", "SH", "EH", "YU", "YA", "'"];
    var rus1 = ["ий", "ё", "ж", "х", "ц", "ч", "щ", "щ", "ш", "э", "ю", "я", "Ё", "Ж", "Х", "Ц", "Ч", "Щ", "Щ", "Ш", "Э", "Ю", "Я", "ь"];
    for (i = 0; i < lat1.length; i++) {
        if (back) {
            outtext = outtext.split(rus1[i]).join(lat1[i]);
        } else {
            outtext = outtext.split(lat1[i]).join(rus1[i]);
        }
    }
    var lat2 = "abvgdeziyklmnoprstufhcyABVGDEZIJKLMNOPRSTUFHCY" + "ёЁ";
    var rus2 = "абвгдезийклмнопрстуфхцыАБВГДЕЗИЙКЛМНОПРСТУФХЦЫ" + "еЕ";
    for (i = 0; i < lat2.length; i++) {
        if (back) {
            outtext = outtext.split(rus2.charAt(i)).join(lat2.charAt(i));
        } else {
            outtext = outtext.split(lat2.charAt(i)).join(rus2.charAt(i));
        }
    }
    if (!back) return text;
    return (outtext == text) ? text : outtext;
}

function highlight(b, e) {
    b = b + '';
    e = e + '';
    if (e == '') return b;
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
    return d;
}