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

//获取某用户全部消息
router.get('/getaboutuser/', function (req, res, next) {
	//非必要参数：uid
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  if(req.query.uid){
	if (req.session.uid !== req.query.uid) {
		if (req.session.type == "super") { 
			var uid = req.query.uid
		}else{
			return res.json({ code: -510, message: "权限不足" });
		}
	}
  }else{
	  var uid = req.session.uid
  }
  db.querySQL({
	sql: "SELECT msg_id,msg_send_user,msg_send_time,msg_content,msg_read FROM message WHERE (msg_send_uid=? OR msg_to_uid=?) AND visible=1 AND checked=1",
	values: [uid, uid],
	timeout: 40000,
  }, function (error, result) {
	if (error) {
		return res.json({ code: -501, message: "系统错误" });
	}
	data = NullToStr(result)
	return res.json({ code: 0, message: 'ok', data: data });
  });
});

//获取某用户全部/未读点赞提醒
router.get('/getlikelist/', function (req, res, next) {
	//非必要参数：uid,type(all,unread)
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  if(req.query.uid){
	if (req.session.uid !== req.query.uid) {
		if (req.session.type == "super") {
			var uid = req.query.uid
			var type = "all"
		}else{
			return res.json({ code: -510, message: "权限不足" });
		}
	}
  }else{
	  var uid = req.session.uid
	  var type = req.query.type
  }
  var sql_item = ""
  if(type == "unread"){
	  sql_item = " AND msg_read=0"
  }else if(type == "all"){
	  sql_item = ""
  }
  db.querySQL({
	sql: "SELECT msg_id,like_uid,like_user,like_time,like_to_com_id,msg_read FROM message WHERE type=? AND visible=? AND msg_to_uid=?" + sql_item,
	values: ["like", 1, uid],
	timeout: 40000,
  }, function (error, result) {
	if (error) {
		return res.json({ code: -501, message: "系统错误" });
	}
	data = NullToStr(result)
	return res.json({ code: 0, message: 'ok', data: data });
  });
});

//全部点赞提醒已读
router.get('/alllikeread', function (req, res, next) {
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  var uid = req.session.uid
  db.querySQL({
	sql: "UPDATE message SET msg_read=? WHERE type=? AND msg_to_uid=? AND msg_read=?",
	values: [1, "like", uid, 0],
	timeout: 40000,
  }, function (error, result) {
	if (error) {
		return res.json({ code: -501, message: "系统错误" });
	}
	return res.json({ code: 0, message: '全部点赞提醒已读'});
  });
});

//获取某用户的消息
router.get('/getmsg/', function (req, res, next) {
	//必要参数：type
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  if(req.query.uid){
	if (req.session.uid !== req.query.uid) {
		if (req.session.type == "super") {
			var uid = req.query.uid
		}else{
			return res.json({ code: -510, message: "权限不足" });
		}
	}
  }else{
	  var uid = req.session.uid
  }
  var type = req.query.type
  db.querySQL({
	sql: "SELECT * FROM message WHERE type=? AND msg_to_uid=? AND visible=1 AND checked=1",
	values: [type, uid],
	timeout: 40000,
  }, function (error, data) {
	if (error) {
		return res.json({ code: -501, message: "系统错误" });
	}
	db.querySQL({
		sql: "UPDATE message SET msg_read=? WHERE msg_to_uid=? AND type= ? AND msg_read=?",
		values: [1, uid, type, 0],
		timeout: 40000,
	  }, function (error, result) {
		if (error) {
			return res.json({ code: -501, message: "系统错误" });
		}
		data = NullToStr(data)
		return res.json({ code: 0, message: 'ok', data: data });
	  });
  });
});

//单个消息已读
router.get('/msgread/', function (req, res, next) {
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  if(!req.query.msgId){
	return res.json({ code: -504, message: "缺少参数" });
  }
  var uid = req.session.uid
  var msg_id = req.query.msgId
  db.querySQL({
	sql: "UPDATE message SET msg_read=? WHERE msg_id=? AND msg_to_uid=? AND msg_read=?",
	values: [1, msg_id, uid, 0],
	timeout: 40000,
  }, function (error, result) {
	if (error) {
		return res.json({ code: -501, message: "系统错误" });
	}
	if(!result[0]){
		return res.json({ code: -503, message: '未找到该消息'});
	}
	return res.json({ code: 0, message: '该消息已读'});
  });
});

//指定类型消息标为已读
//可选参数：type(all/msg/system/like/comment)
router.get('/allmsgread', function (req, res, next) {
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  var uid = req.session.uid
  if(!req.query.type || req.query.type == "all"){
	  var sql_item = ""
  }else if(req.query.type == "msg" || req.query.type == "system" || req.query.type == "like" || req.query.type == "comment"){
	  var sql_item = " AND type='" + req.query.type + "'"
  }else{
	  return res.json({ code: -504, message: "参数有误" });
  }
  db.querySQL({
	sql: "UPDATE message SET msg_read=? WHERE msg_to_uid=? AND msg_read=?" + sql_item,
	values: [1, uid, 0],
	timeout: 40000,
  }, function (error, result) {
	if (error) {
		return res.json({ code: -501, message: "系统错误" });
	}
	return res.json({ code: 0, message: '全部消息已读'});
  });
});

module.exports = router;
