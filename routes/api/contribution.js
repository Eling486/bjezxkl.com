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

router.post('/contribute', function (req, res, next) {

  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  if (req.session.type == "banned") {
    return res.json({ code: -510, message: "您已被封禁" });
  }
  //检查是否被封禁
   db.querySQL({
    sql: "SELECT uid,username,type FROM user WHERE uid=?",
    values: [req.session.uid],
    timeout: 40000,
  }, function (error, result) {
    if (error) {
      return res.json({
        code: -501,
        message: "系统错误"
      });
    }
    if (result[0].type == "banned") {
      return res.json({ code: -510, message: "您已被封禁" });
    };
  
  var hope_date = req.body.hope_date;
  var ncmid = req.body.ncmid;
  var state = req.body.state;
  var con_uid = req.session.uid;
  var con_user = req.session.user;
  var hope_showname = req.body.hope_showname;
  var realname = req.body.realname;
  var artist = req.body.artist;
  var con_note = req.body.con_note;
  var con_time = moment().format('YYYY-MM-DD HH:mm:ss');
  var twoMonthsAgo = moment().subtract(2, 'months').format('YYYY-MM-DD HH:mm:ss');
  var oneMonthsAgo = moment().subtract(1, 'months').format('YYYY-MM-DD HH:mm:ss');
  var thisMonthFirst = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
  //检查2个月内有无重复投稿
  db.querySQL({
    sql: "SELECT cid,con_uid,con_user,con_time FROM contribution WHERE con_time > ? AND ncmid = ? AND con_uid = ? ORDER BY con_time DESC",
    values: [oneMonthsAgo, ncmid, con_uid],
    timeout: 40000,
  }, function (error, result) {
    if (error) {
      return res.json({
        code: -501,
        message: "系统错误"
      });
    }
    if (result[0]) {
      var data = NullToStr(result[0])
      return res.json({
        code: -504,
        message: "1个月内重复投稿",
        data: data
      });
    }
	
  //检查有无超过本月上限(8个)
  db.querySQL({
    sql: "SELECT cid,con_uid,con_user,con_time,realname FROM contribution WHERE con_time > ? AND con_uid = ? ORDER BY con_time DESC",
    values: [thisMonthFirst, con_uid],
    timeout: 40000,
  }, function (error, result) {
    if (error) {
      return res.json({
        code: -501,
        message: "系统错误"
      });
    }
    if (result.length >= 4 && req.session.type !== "super") {
      var data = NullToStr(result)
      return res.json({
        code: -505,
        message: "到达本月投稿上限",
        data: data
      });
	};
	//检查通过
    if (hope_date == "") {
      hope_date = null
    }
    var log = "|" + con_time + "|" + con_uid + "/" + con_user + "->contribute;"
    db.querySQL({
      sql: "INSERT INTO contribution (cid,revisable,hope_date,ncmid,state,hope_showname,realname,artist,con_uid,con_user,con_time,con_note,check_type,log) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      values: [null, 1, hope_date, ncmid, state, hope_showname, realname, artist, con_uid, con_user, con_time, con_note, "waiting", log],
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
        message: '投稿成功'
      });
    });
  });
});
});
});

router.get('/getconnum', function (req, res, next) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type == "banned") {
		return res.json({ code: -510, message: "您已被封禁" });
	}
	
	var con_uid = req.session.uid;
	var thisMonthFirst = moment().startOf('month').format('YYYY-MM-DD HH:mm:ss');
	
	db.querySQL({
    sql: "SELECT cid,con_uid,con_user,con_time,realname FROM contribution WHERE con_time > ? AND con_uid = ? ORDER BY con_time DESC",
    values: [thisMonthFirst, con_uid],
    timeout: 40000,
  }, function (error, result) {
    if (error) {
      return res.json({
        code: -501,
        message: "系统错误"
      });
    }

	var con_num = result.length
	return res.json({
		code: 0,
		message: "ok",
		con_num: con_num
	});
  });
});

router.get('/getown', function (req, res, next) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	
	var con_uid = req.session.uid;
	
	db.querySQL({
    sql: "SELECT * FROM contribution WHERE con_uid = ? ORDER BY con_time DESC",
    values: [con_uid],
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
		message: "ok",
		data: result
	});
  });
});

//获取全部投稿
router.get('/getall', function (req, res, next) {
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  if (req.session.type == "normal" || req.session.type == "banned") { 
    return res.json({ code: -510, message: "权限不足" });
  }
      db.querySQL({
        sql: "SELECT * FROM contribution",
        timeout: 40000,
      }, function (error, result) {
        if (error) {
          return res.json({ code: -501, message: "系统错误" });
        }
        data = NullToStr(result)
        return res.json({ code: 0, message: 'ok', data: data });
      });
});
module.exports = router;

//获取待审核投稿
router.get('/getneedcheck', function (req, res, next) {
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  if (req.session.type == "normal" || req.session.type == "banned") { 
    return res.json({ code: -510, message: "权限不足" });
  }
      db.querySQL({
        sql: "SELECT * FROM contribution WHERE check_type = 'waiting'",
        timeout: 40000,
      }, function (error, result) {
        if (error) {
          return res.json({ code: -501, message: "系统错误" });
        }
        data = NullToStr(result)
        return res.json({ code: 0, message: 'ok', data: data });
      });
});
module.exports = router;

//获取已录用投稿
router.get('/getsuccess', function (req, res, next) {
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  if (req.session.type == "normal" || req.session.type == "banned") { 
    return res.json({ code: -510, message: "权限不足" });
  }
      db.querySQL({
        sql: "SELECT * FROM contribution WHERE check_type = 'success' OR check_type = 'ready'",
        timeout: 40000,
      }, function (error, result) {
        if (error) {
          return res.json({ code: -501, message: "系统错误" });
        }
        data = NullToStr(result)
        return res.json({ code: 0, message: 'ok', data: data });
      });
});

//按安排时间获取投稿
router.post('/getready', function (req, res, next) {
  if (!req.session.uid || !req.session.user) {
    return res.json({ code: -502, message: "未登录" });
  }
  if (req.session.type == "normal" || req.session.type == "banned") { 
    return res.json({ code: -510, message: "权限不足" });
  }
  var Mon = req.body.monday;
  var Sun = req.body.sunday;
      db.querySQL({
        sql: "SELECT * FROM contribution WHERE (check_type = 'success' OR check_type = 'ready' OR check_type = 'used') AND  plan_date >= ? AND plan_date <= ?",
		values: [Mon, Sun],
        timeout: 40000,
      }, function (error, result) {
        if (error) {
          return res.json({ code: -501, message: "系统错误" });
        }
        data = NullToStr(result)
        return res.json({ code: 0, message: 'ok', data: data });
      });
});

router.get('/inline', function (req, res, next) {
  db.querySQL({
	sql: "SELECT cid FROM contribution WHERE check_type = 'waiting'",
	values: [],
	timeout: 40000,
  }, function (error, result1) {
	if (error) {
	  return res.json({ code: -501, message: "系统错误" });
	}
	db.querySQL({
		sql: "SELECT cid FROM contribution WHERE check_type = 'success'",
		values: [],
		timeout: 40000,
	}, function (error, result2) {
		if (error) {
		  return res.json({ code: -501, message: "系统错误" });
		}
		var waiting_num = result1.length;
		var success_num = result2.length;
		var inline_num = waiting_num + success_num;
		return res.json({ 
			code: 0,
			message: 'ok',
			data: [{
				waiting_num: waiting_num,
				success_num: success_num,
				inline_num: inline_num,
			}]
		});
	  });
  });
});

module.exports = router;