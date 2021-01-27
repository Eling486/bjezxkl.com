var express = require('express');
var router = express.Router();
var db = require('../../database/index');
var moment = require('moment');
moment.locale('zh-cn');

//评论审核
router.post('/comment', function (req, res, next) {
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  if (req.session.type == "normal" || req.session.type == "banned") {
    return res.json({ code: -510, message: "权限不足" });
  }
  var com_id = req.body.com_id
  var uid = req.body.uid
  var reply_to_uid = req.body.reply_to_uid
  var visible = req.body.visible
  db.querySQL({
    sql: "UPDATE comment SET visible = ?, checked = 1 WHERE com_id = ?",
    values: [visible, com_id],
    timeout: 40000,
  }, function (error, result) {
    if (error) {
      return res.json({ code: -501, message: "系统错误" });
    }
	//自己回复不提醒
	if(reply_to_uid && visible == 1 ){
		if(reply_to_uid == uid){
			is_own_reply = true
		}else{
			is_own_reply = false
		}
		if(is_own_reply == false){
			db.querySQL({
				sql: "SELECT com_id,uid,user,com_send_time,com_on_id,is_reply,reply_to_com_id,reply_to_uid,reply_to_user FROM comment WHERE com_id=?",
				values: [com_id],
				timeout: 40000,
			}, function (error, result) {
				if (error) {
					return res.json({ code: -501, message: "系统错误" });
				}
				var com_id = result[0].reply_to_com_id //该评论所回复的comid
				var msg_to_uid = result[0].reply_to_uid//该评论所回复的uid
				var msg_to_user = result[0].reply_to_user//该评论所回复的user
				var reply_com_id = result[0].com_id//该回复评论的comid
				var reply_id = result[0].com_on_id
				var reply_uid = result[0].uid //该回复人的uid
				var reply_user = result[0].user
				var reply_time = result[0].com_send_time
				db.querySQL({
					sql: "INSERT INTO message (msg_id,visible,checked,type,com_id,msg_to_uid,msg_to_user,reply_com_id,reply_id,reply_uid,reply_user,reply_time,msg_read,timestamp) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
					values: [null,1,1,"comment",com_id,msg_to_uid,msg_to_user,reply_com_id,reply_id,reply_uid,reply_user,reply_time,0,null],
					timeout: 40000,
				}, function (error, result) {
					if (error) {
						return res.json({ code: -501, message: "系统错误" });
					}
					return res.json({ code: 0, message: '评论审核成功' });
				})
			})
		}else{
			return res.json({ code: 0, message: '评论审核成功' });
		}
	}else{
		return res.json({ code: 0, message: '评论审核成功' });
	};
  })
})

//下课铃稿件审核
router.post('/contribution', function (req, res, next) {
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  if (req.session.type == "normal" || req.session.type == "banned") {
    return res.json({ code: -510, message: "权限不足" });
  }
  if(req.body.check_type == "success"){
	var cid = req.body.cid
	var revisable = 0
	var plan_week = req.body.plan_week;
	var plan_date = req.body.plan_date;
	var showname = req.body.showname;
	var realname = req.body.realname;
	var artist = req.body.artist;
	var check_type = req.body.check_type;
	var check_time = moment().format('YYYY-MM-DD HH:mm:ss');
	var check_note = req.body.check_note;
	var check_uid = req.session.uid;
	var check_user = req.session.user;
	
	db.querySQL({
    sql: "SELECT cid,con_uid,con_user,con_time,log,check_type FROM contribution WHERE cid=?",
    values: [cid],
    timeout: 40000,
  }, function (error, result) {
    if (error) {
      return res.json({
        code: -501,
        message: "系统错误"
      });
    }
    if (result[0]) {
      var log = result[0].log
	  var old_type = result[0].check_type
	  var con_uid = result[0].con_uid
	  var con_user = result[0].con_user
	  var con_time = result[0].con_time
    }else{
		return res.json({ code: -503, message: "参数有误" });
	}
	if(old_type !=="waiting"){
		return res.json({ code: -504, message: "该投稿已被审核" });
	}
	if(!plan_date){
		plan_date = null;
	}
	log = log + "|" + check_time + "|" + check_uid + "/" + check_user + "->check|" + old_type + "->" + check_type + "|" + check_note +";"
	db.querySQL({
		sql: "UPDATE contribution SET revisable = ?, plan_week = ?, plan_date = ?, showname = ?, realname = ?, artist = ?, check_type = ?, check_time = ?, check_note = ?, check_uid = ?, check_user = ?, log = ? WHERE cid = ?",
		values: [revisable, plan_week, plan_date, showname, realname, artist, check_type, check_time, check_note, check_uid, check_user, log, cid],
		timeout: 40000,
	}, function (error, result) {
		if (error) {
			return res.json({ code: -501, message: "系统错误"+error });
		}
		
		//发送私信
		var msg_send_user = "叮~是投稿结果反馈！"
		var msg_to_uid = con_uid
		var msg_to_user = con_user
		var msg_send_time = moment().format('YYYY-MM-DD HH:mm:ss');
		if(plan_date !== null){
			var plan_text = "计划于" + plan_date + "当天播放，具体时间请关注后续消息哟！"
		}else{
			var plan_text = "播放时间待定，具体时间请关注后续消息哟！"
		}
		if(check_note !== "" && check_note){
			var check_note_text = "<p class='check-note'>审核备注：" + check_note + "</p>"
		}else{
			var check_note_text = ""
		}
		var msg_content = "<p class='con-feedback'>Hello！你投稿的《"+ realname +"》已经审核完毕啦！恭喜你，你的稿件已经被录用了！" + plan_text + "</p>" + check_note_text + "<p class='check-user'>审核人：" + check_user + "</p><p class='check-time'>审核时间："+ check_time + "</p>"
		db.querySQL({
			sql: "INSERT INTO message (msg_id,visible,checked,type,msg_send_user,msg_to_uid,msg_to_user,msg_send_time,msg_content,msg_read) VALUES (?,?,?,?,?,?,?,?,?,?)",
			values: [null, 1, 1, "system", msg_send_user, msg_to_uid, msg_to_user, msg_send_time, msg_content, 0],
			timeout: 40000,
		}, function (error, result) {
			if (error) {
				return res.json({ code: -501, message: "系统错误" });
			}
			return res.json({ code: 0, message: '投稿审核成功' });
		});
	});
  })
  }else if(req.body.check_type == "fail"){
	var cid = req.body.cid
	var revisable = 0
	var check_type = req.body.check_type;
	var check_time = moment().format('YYYY-MM-DD HH:mm:ss');
	var check_note = req.body.check_note;
	var check_uid = req.session.uid;
	var check_user = req.session.user;  
	
	db.querySQL({
    sql: "SELECT cid,con_uid,con_user,con_time,log,check_type,realname FROM contribution WHERE cid=?",
    values: [cid],
    timeout: 40000,
  }, function (error, result) {
    if (error) {
      return res.json({
        code: -501,
        message: "系统错误"
      });
    }
    if (result[0]) {
      var log = result[0].log
	  var old_type = result[0].check_type
	  var con_uid = result[0].con_uid
	  var con_user = result[0].con_user
	  var con_time = result[0].con_time
	  var realname = result[0].realname;
    }else{
		return res.json({ code: -503, message: "参数有误" });
	}
	if(old_type !=="waiting"){
		return res.json({ code: -504, message: "该投稿已被审核" });
	}
	log = log + "|" + check_time + "|" + check_uid + "/" + check_user + "->check|" + old_type + "->" + check_type + "|" + check_note + ";"
	db.querySQL({
		sql: "UPDATE contribution SET revisable = ?, check_type = ?, check_time = ?, check_note = ?, check_uid = ?, check_user = ?, log = ? WHERE cid = ?",
		values: [revisable, check_type, check_time, check_note, check_uid, check_user, log, cid],
		timeout: 40000,
	}, function (error, result) {
		if (error) {
			return res.json({ code: -501, message: "系统错误" });
		}
		//发送私信
		var msg_send_user = "噔噔咚！是投稿结果反馈！"
		var msg_to_uid = con_uid
		var msg_to_user = con_user
		var msg_send_time = moment().format('YYYY-MM-DD HH:mm:ss');
		if(check_note !== "" && check_note){
			var check_note_text = "<p class='check-note'>审核备注：" + check_note + "</p>"
		}else{
			var check_note_text = "<p class='check-note'>审核备注：<span class='data-empty'>（无）</span></p>"
		}
		var msg_content = "<p class='con-feedback'>Hello！你投稿的《"+ realname +"》已经审核完毕啦！很遗憾，由于以下原因稿件<span style='color:red;'>未被录用</span>。不要灰心，下次根据投稿规则投稿的话，说不定就能通过了呢！</p>" + check_note_text + "<p class='check-user'>审核人：" + check_user + "</p><p class='check-time'>审核时间："+ check_time + "</p>"
		db.querySQL({
			sql: "INSERT INTO message (msg_id,visible,checked,type,msg_send_user,msg_to_uid,msg_to_user,msg_send_time,msg_content,msg_read) VALUES (?,?,?,?,?,?,?,?,?,?)",
			values: [null, 1, 1, "system", msg_send_user, msg_to_uid, msg_to_user, msg_send_time, msg_content, 0],
			timeout: 40000,
		}, function (error, result) {
			if (error) {
				return res.json({ code: -501, message: "系统错误" });
			}
			return res.json({ code: 0, message: '投稿审核成功' });
		});
	});
  })
  }

  
});

module.exports = router;
