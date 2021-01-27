var express = require('express');
var router = express.Router();
var db = require('../../database/index');
var moment = require('moment');
var xss = require('xss')
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


//获取某曲目/公告全部评论
router.get('/getbyid/', function (req, res, next) {
  //必填参数：type,id
  var type = req.query.type
  var id = req.query.id
  if (req.session.user) {
    var uid = req.session.uid
    var user = req.session.user
  }
  if (type && id) {
    if (type == "music" || type == "notice") {
      db.querySQL({
        sql: "SELECT com_id,uid,user,com_send_time,com_on_id,com_content,is_reply,reply_to_com_id,reply_to_uid,reply_to_user,reply_to_content,com_like_num,com_like_user FROM comment WHERE com_on_type = ? AND com_on_id = ? AND visible = 1 AND checked = 1",
        values: [type, id],
        timeout: 40000,
      }, function (error, result) {
        if (error) {
          return res.json({ code: -501, message: "系统错误" });
        }
        data = NullToStr(result)
        if (req.session.user) {
          return res.json({ code: 0, message: 'ok', uid: uid, user: user, data: data });
        } else {
          return res.json({ code: 0, message: 'ok', data: data });
        }
      });
    } else {
      return res.json({ code: -502, message: "未知类型" })
    }
  } else {
    return res.json({ code: -502, message: "参数不完整" })
  }
});


//获取某用户全部评论
router.get('/getbyuser/', function (req, res, next) {
  //必填参数：type
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  var type = req.query.type
  var uid = req.session.uid
  var user = req.session.user
  if (type && uid && user) {
    if (type == "music" || type == "notice" || type == "all") {
      if (type == "all") {
        type_str = ""
      } else {
        var type_str = " AND com_on_type = ?"
      }
      db.querySQL({
        sql: "SELECT * FROM comment WHERE uid = ? AND user = ?" + type_str,
        values: [uid, user, type],
        timeout: 40000,
      }, function (error, result) {
        if (error) {
          return res.json({ code: -501, message: "系统错误" });
        }
        data = NullToStr(result)
        return res.json({ code: 0, message: 'ok', data: data });
      });
    } else {
      return res.json({ code: -502, message: "未知类型" })
    }
  } else {
    return res.json({ code: -502, message: "参数不完整" })
  }
});

//获取待审核评论
router.get('/getneedcheck', function (req, res, next) {
  //必填参数：type
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  if (req.session.type == "normal" || req.session.type == "banned") { 
    return res.json({ code: -510, message: "权限不足" });
  }
      db.querySQL({
        sql: "SELECT * FROM comment WHERE checked = 0",
        timeout: 40000,
      }, function (error, result) {
        if (error) {
          return res.json({ code: -501, message: "系统错误" });
        }
        data = NullToStr(result)
        return res.json({ code: 0, message: 'ok', data: data });
      });
});


//对某曲目/公告评论
router.post('/send', function (req, res, next) {
  //必填参数：type,id,content,is_reply
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  var uid = req.session.uid
  var user = req.session.user
  var type = req.body.type
  var id = req.body.id
  var is_reply = req.body.is_reply
  var content = xss(req.body.content)
  if (uid && user && type && id && is_reply) {
    if (type == "music" || type == "notice") {
      var now = moment().format('YYYY-MM-DD HH:mm:ss')
      var com_send_time = now
      if (is_reply == 1) {
        var reply_to_com_id = req.body.reply_to_com_id
        var reply_to_uid = req.body.reply_to_uid
        var reply_to_user = req.body.reply_to_user
        var reply_to_content = req.body.reply_to_content
      } else {
        var reply_to_com_id = null
        var reply_to_uid = null
        var reply_to_user = null
        var reply_to_content = null
      }
      var com_like_num = 0
      var com_like_user = ""
      var visible = 1
      var checked = 0
      if (content == "") {
        return res.json({ code: -508, message: "评论不能为空" });
      }
      db.querySQL({
        sql: "INSERT INTO comment (com_id,checked,visible,uid,user,com_send_time,com_on_type,com_on_id,com_content,is_reply,reply_to_com_id,reply_to_uid,reply_to_user,reply_to_content,com_like_num,com_like_user) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        values: [null, checked, visible, uid, user, com_send_time, type, id, content, is_reply, reply_to_com_id, reply_to_uid, reply_to_user, reply_to_content, com_like_num, com_like_user],
        timeout: 40000,
      }, function (error, result) {
        if (error) {
          return res.json({ code: -501, message: "系统错误" });
        }
        return res.json({ code: 0, message: '评论成功' });
      });
    } else {
      return res.json({ code: -502, message: "未知类型" })
    }
  } else {
    return res.json({ code: -502, message: "参数不完整" })
  }
});

router.post('/like/', function (req, res, next) {
  //必填参数：comId
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  var com_id = req.query.comId
  var user = req.session.user
  var uid = req.session.uid
  db.querySQL({
    sql: "SELECT uid,user,com_like_num,com_like_user,com_on_id FROM comment WHERE com_id = ?",
    values: [com_id],
    timeout: 40000,
  }, function (error, result) {
    if (error) {
      return res.json({ code: -501, message: "系统错误" });
    }
    data = NullToStr(result)
    var like_num = data[0].com_like_num
	var com_uid = data[0].uid
	var com_user = data[0].user
	var com_on_id = data[0].com_on_id
	
	var is_new_like = true
	//自赞不提醒
	if(com_uid == uid){
		is_new_like = false
	}else{
		is_new_like = true
	}
	
    if (data[0].com_like_user == "") {
      var like_users = []
    } /*else if (data[0].com_like_user.indexOf(',') < 0) {
      var like_users = [data[0].com_like_user]
    }*/ else {
      var like_users = data[0].com_like_user.split(',')
    }
    if (like_users.indexOf(uid.toString()) >= 0) {
      //取消赞
      var new_like_num = like_num - 1;
      var new_like_users = removeItem(like_users, like_users.indexOf(uid.toString()))
      var new_like_user = new_like_users.join(",")
      db.querySQL({
        sql: "UPDATE comment SET com_like_num=?, com_like_user=? WHERE com_id = ?",
        values: [new_like_num, new_like_user, com_id],
        timeout: 40000,
      }, function (error, result) {
        if (error) {
          return res.json({ code: -501, message: "系统错误" });
        }
		if(is_new_like == true){
			db.querySQL({
				sql: "UPDATE message SET visible=? WHERE like_to_com_id=? AND like_uid=?",
				values: [0, com_id, uid],
				timeout: 40000,
			}, function (error, result) {
				if (error) {
					return res.json({ code: -501, message: "系统错误" });
				}
				return res.json({ code: 0, message: '取消赞成功' });
			})
		}else{
			return res.json({ code: 0, message: '取消赞成功' });
		}
	  })
    } else {
      //点赞
	  var new_like_num = like_num + 1;
      if (data[0].com_like_user == "") {
        var new_like_user = uid
      } else {
        var new_like_user = data[0].com_like_user + "," + uid
      }
      db.querySQL({
        sql: "UPDATE comment SET com_like_num=?, com_like_user=? WHERE com_id = ?",
        values: [new_like_num, new_like_user, com_id],
        timeout: 40000,
      }, function (error, result) {
        if (error) {
          return res.json({ code: -501, message: "系统错误" });
        }
		if(is_new_like == true){
			db.querySQL({
				sql: "SELECT msg_id,msg_to_uid FROM message WHERE type=? AND like_to_com_id=? AND like_uid=?",
				values: ["like", com_id, uid],
				timeout: 40000,
			}, function (error, result) {
				if (error) {
					return res.json({ code: -501, message: "系统错误" });
				}
				var like_time = moment().format('YYYY-MM-DD HH:mm:ss')
				if(result[0]){
					var msg_id = result[0].msg_id
					db.querySQL({
						sql: "UPDATE message SET visible=?, like_time=? WHERE msg_id = ?",
						values: [1, like_time, msg_id],
						timeout: 40000,
					}, function (error, result) {
						if (error) {
							return res.json({ code: -501, message: "系统错误" });
						}
						return res.json({ code: 0, message: '点赞成功' });
					})
				}else{
					db.querySQL({
						sql: "INSERT INTO message (msg_id,visible,checked,type,msg_to_uid,msg_to_user,like_uid,like_user,like_time,like_to_com_id,like_to_id,msg_read,timestamp) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
						values: [null,1,1,"like",com_uid,com_user,uid,user,like_time,com_id,com_on_id,0,null],
						timeout: 40000,
					}, function (error, result) {
						if (error) {
							return res.json({ code: -501, message: "系统错误"+error });
						}
						return res.json({ code: 0, message: '点赞成功' });
					})
				}
			})
		}else{
			return res.json({ code: 0, message: '点赞成功' });
		}
      });
    }
  });
})

/*备份
router.post('/like/', function (req, res, next) {
  //必填参数：comId
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  var com_id = req.query.comId
  var user = req.session.user
  var uid = req.session.uid
  db.querySQL({
    sql: "SELECT uid,user,com_like_num,com_like_user FROM comment WHERE com_id = ?",
    values: [com_id],
    timeout: 40000,
  }, function (error, result) {
    if (error) {
      return res.json({ code: -501, message: "系统错误" });
    }
    data = NullToStr(result)
    var likeNum = data[0].com_like_num
	var com_uid = data[0].uid
	var com_user = data[0].user
	
	var is_new_like = true
	//自赞不提醒
	if(com_uid == uid){
		is_new_like = false
	}else{
		is_new_like = true
	}
	
    if (data[0].com_like_user == "") {
      var likeUsers = []
    } /*else if (data[0].com_like_user.indexOf(',') < 0) {
      var likeUsers = [data[0].com_like_user]
    }*//* else {
      var likeUsers = data[0].com_like_user.split(',')
    }
    if (likeUsers.indexOf(user) >= 0) {
      //取消赞
      var new_like_num = likeNum - 1;
      var new_likeUsers = removeItem(likeUsers, likeUsers.indexOf(user))
      var new_like_user = new_likeUsers.join(",")
      db.querySQL({
        sql: "UPDATE comment SET com_like_num=?, com_like_user=? WHERE com_id = ?",
        values: [new_like_num, new_like_user, com_id],
        timeout: 40000,
      }, function (error, result) {
        if (error) {
          return res.json({ code: -501, message: "系统错误" });
        }
		if(is_new_like == true){
			db.querySQL({
				sql: "UPDATE message SET visible=? WHERE like_to_com_id=? AND like_uid=?",
				values: [0, com_id, uid],
				timeout: 40000,
			}, function (error, result) {
				if (error) {
					return res.json({ code: -501, message: "系统错误" });
				}
				return res.json({ code: 0, message: '取消赞成功' });
			})
		}else{
			return res.json({ code: 0, message: '取消赞成功' });
		}
	  })
    } else {
      //点赞
      var new_like_num = likeNum + 1;
      if (data[0].com_like_user == "") {
        var new_like_user = user
      } else {
        var new_like_user = data[0].com_like_user + "," + user
      }
      db.querySQL({
        sql: "UPDATE comment SET com_like_num=?, com_like_user=? WHERE com_id = ?",
        values: [new_like_num, new_like_user, com_id],
        timeout: 40000,
      }, function (error, result) {
        if (error) {
          return res.json({ code: -501, message: "系统错误" });
        }
		if(is_new_like == true){
			db.querySQL({
				sql: "SELECT msg_id,msg_to_uid FROM message WHERE type=? AND like_to_com_id=? AND like_uid=?",
				values: ["like", com_id, uid],
				timeout: 40000,
			}, function (error, result) {
				if (error) {
					return res.json({ code: -501, message: "系统错误1"+error });
				}
				var like_time = moment().format('YYYY-MM-DD HH:mm:ss')
				if(result[0]){
					var msg_id = result[0].msg_id
					db.querySQL({
						sql: "UPDATE message SET visible=?, like_time=? WHERE msg_id = ?",
						values: [1, like_time, msg_id],
						timeout: 40000,
					}, function (error, result) {
						if (error) {
							return res.json({ code: -501, message: "系统错误2"+error });
						}
						return res.json({ code: 0, message: '点赞成功' });
					})
				}else{
					db.querySQL({
						sql: "INSERT INTO message (msg_id,visible,type,msg_to_uid,msg_to_user,like_uid,like_user,like_time,like_to_com_id,msg_read,timestamp) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
						values: [null,1,"like",com_uid,com_user,uid,user,like_time,com_id,0,null],
						timeout: 40000,
					}, function (error, result) {
						if (error) {
							return res.json({ code: -501, message: "系统错误" });
						}
						return res.json({ code: 0, message: '点赞成功' });
					})
				}
			})
		}else{
			return res.json({ code: 0, message: '点赞成功' });
		}
      });
    }
  });
})
*/

function removeItem(index, x) {
  var a = index.slice(x + 1)
  var b = index.splice(0, x);
  return b.concat(a);
}

module.exports = router;
