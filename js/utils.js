/*
 getMonthArr
 return weeks list
 Example: 2014 year 8 month(August)
 getMonthArr(2014, 7); first month is 0
 return:
 [
   [null,null,null,null,1,2,3],
   [4,5,6,7,8,9,10],
   [11,12,13,14,15,16,17],
   [18,19,20,21,22,23,24],
   [25,26,27,28,29,30,31]
 ]
 getMonthArr(2014, 7, true);
 return:
 [
   ['28','29','30','31',1,2,3],
   [4,5,6,7,8,9,10],
   [11,12,13,14,15,16,17],
   [18,19,20,21,22,23,24],
   [25,26,27,28,29,30,31]
 ]

 getMonthArr(2014, 7, true, true);
 return:
 [
   ['28', 4, 11, 18, 25],
   ['29', 5, 12, 19, 26]
   ['30', 6, 13, 20, 27]
   ['31', 7, 14, 21, 28]
   [1, 8, 15, 22, 29]
   [2, 9, 16, 23, 30]
   [3, 10, 17,24, 31]
 ]

*/


function getMonthArr(y, m, pn, vertical){
    var today = new Date;
    y = (y) ? parseInt(y) : today.getFullYear();
    m = (m) ? parseInt(m) : today.getMonth();
    pn = !!(pn);
    vertical = !!(vertical);
    var key = y+''+m+''+(pn?1:0)+''+(vertical?1:0);

    if(window['calendar_cache']){
        if(window.calendar_cache[key]) return window.calendar_cache[key];
    } else {
        window.calendar_cache = {};
    }

    var date = new Date(y, m, 1, 0, 0, 0),
        dayOnWeek = date.getDay() - 1,
        daysInMonth = 33 - new Date(y, m, 33).getDate(),
        daysInFirstMonth = (34 - new Date(y, m-1, 33).getDate()) - dayOnWeek,
        weeksInMonth = Math.ceil((daysInMonth+dayOnWeek)/7),
        days = 1,
        arr = [],
        v_arr = [];

    for(var week=0; week<weeksInMonth; week++){
        arr[week] = []; var n = 1;
        for(var diw=0; diw<7; diw++){
            var day = days;
            if(dayOnWeek>0){
                dayOnWeek--;
                day = pn ? daysInFirstMonth.toString() : null;
                daysInFirstMonth++;
            } else {
                days++;
            }
            if(day>daysInMonth){
                day = pn ? n.toString() : null;
                n++;
            }
            arr[week][diw] = day;
        }
    }

    if(vertical){
        for(var i=0; i<7; i++){
            v_arr[i] = [];
            for(var d=0; d<weeksInMonth; d++) v_arr[i][d] = (arr[d])?arr[d][i]:null;
        }
        arr = v_arr;
    }

    window.calendar_cache[key] = arr;
    return arr;
}

// DOM //
function firstChild(startParent){
    var tempObj = startParent.firstChild;
    while(tempObj.nodeType!=1 && tempObj.nextSibling!=null){
        tempObj = tempObj.nextSibling;
    }
    return (tempObj.nodeType==1)?tempObj:false;
}
function nextSibling(startBrother){
    var tempObj = startBrother.nextSibling;
    while(tempObj.nodeType!=1 && tempObj.nextSibling!=null){
        tempObj = tempObj.nextSibling;
    }
    return (tempObj.nodeType==1)?tempObj:false;
}
function firstSibling(node){
    var tempObj=node.parentNode.firstChild;
    while(tempObj.nodeType!=1 && tempObj.nextSibling!=null){
        tempObj=tempObj.nextSibling;
    }
    return (tempObj.nodeType==1)?tempObj:false;
}
function lastSibling(node){
    var tempObj=node.parentNode.lastChild;
    while(tempObj.nodeType!=1 && tempObj.previousSibling!=null){
        tempObj=tempObj.previousSibling;
    }
    return (tempObj.nodeType==1)?tempObj:false;
}

function getFullIP(str){
    str = str || '0.0.0.0';
    str = str.split('.', 4);
    for(var i=0; i<=3; i++){
        str[i] = str[i] && parseInt(str[i], 10)>=0 && parseInt(str[i], 10)<=255 ? str[i] : 0;
    }
    return str.join('.');
}