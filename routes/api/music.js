var express = require('express');
var router = express.Router();
var db = require('../../database/index');
var moment = require('moment');
moment.locale('zh-cn');

//null转换函数
function NullToStr(data) {
    for (let x in data) {
        if (data[x] === null) { // 如果是null 把直接内容转为 ''
            data[x] = '';
        } else {
            if (Array.isArray(data[x])) { // 是数组遍历数组 递归继续处理
                data[x] = data[x].map(z => {
                    return NullToStr(z);
                });
            }
            if (typeof (data[x]) === 'object') { // 是json 递归继续处理
                data[x] = NullToStr(data[x])
            }
        }
    }
    return data;
}

//获取历史下课铃
router.get('/history', function (req, res) {
    var today = moment().format('YYYY-MM-DD');
    db.querySQL({
        sql: "SELECT * FROM music WHERE date < ?",
        values: [today],
        timeout: 40000,
    }, function (error, result) {
        if (error) {
            return res.json({ code: -501, message: "系统错误" });
        } else {
            var data = NullToStr(result);
            res.json({ code: 0, message: 'ok', data: data });
        }
    });
});

//获取未来一周下课铃
router.get('/plan', function (req, res) {
    var weekOfday = moment().format('E');               //计算今天是这周第几天
    if(weekOfday == 7){
        weekOfday = 0
    }
    var Mon = moment().subtract(weekOfday - 1 , 'days').format('YYYY-MM-DD');//周一日期
    var Sun = moment().subtract(weekOfday - 7 , 'days').format('YYYY-MM-DD');//周日日期
    db.querySQL({
        sql: "SELECT mid,date,week,showname,con_uid,con_user FROM music WHERE date >= ? AND date <= ?",
        values: [Mon, Sun],
        timeout: 40000,
    }, function (error, result) {
        if (error) {
            return res.json({ code: -501, message: "系统错误" });
        } else {
            var data = NullToStr(result);
            res.json({ code: 0, message: 'ok', data: data });
        }
    });
});

module.exports = router;
