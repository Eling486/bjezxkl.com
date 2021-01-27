var express = require('express');
var router = express.Router();
var db = require('../../database/index');
var moment = require('moment');
moment.locale('zh-cn');

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

router.post('/publish', function (req, res, next) {
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  if (req.session.type !== "super") {
    return res.json({ code: -510, message: "权限不足" });
  }
  	var now = moment().format('YYYY-MM-DD HH:mm:ss');
	var uid = req.session.uid
	var user = req.session.user
	var title = req.body.title
	var time = req.body.time
	var to_user = req.body.to_user
	var content = req.body.content
	var auther = req.body.auther
	var log = "|" + now + "|" + uid + "/" + user + "->publish;"
    db.querySQL({
      sql: "INSERT INTO notice (nid,title,time,visible,to_user,content,uid,auther,timestamp,log) VALUES (?,?,?,?,?,?,?,?,?,?)",
      values: [null,title,time,1,to_user,content,uid,auther,null,log],
      timeout: 40000,
    }, function (error, result) {
      if (error) {
        return res.json({
          code: -501,
          message: "系统错误"
        });
      }
      return res.json({
        code: 0,
        message: '发布成功'
      });
    });
})

router.get('/get', function (req, res, next) {
	var now = moment().format('YYYY-MM-DD HH:mm:ss');
  db.querySQL({
	sql: "SELECT nid,title,time,content,auther FROM notice WHERE visible=1 AND to_user='all' AND time <= ?",
	values: [now],
	timeout: 40000,
  }, function (error, result) {
	if (error) {
	  return res.json({ code: -501, message: "系统错误" });
	}
	return res.json({ 
		code: 0,
		message: 'ok',
		data: result
	});
  });
});

module.exports = router;
