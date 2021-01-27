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

router.get('/contribution/:key', function (req, res, next) {
  if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type !== "super") {
		return res.json({ code: -510, message: "您的权限不足" });
	}
	
	var oneWeekAgo = moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');
	var twoWeeksAgo = moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss');
	var oneMonthAgo = moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');
	var oneYearAgo = moment().subtract(365, 'days').format('YYYY-MM-DD HH:mm:ss');
	
	if(req.params.key == "week"){
		var key_item = oneWeekAgo
	}else if(req.params.key == "twoweeks"){
		var key_item = twoWeeksAgo
	}else if(req.params.key == "month"){
		var key_item = oneMonthAgo
	}else if(req.params.key == "year"){
		var key_item = oneYearAgo
	}else{
		return res.json({ code: -503, message: "参数有误" });
	}
	
	db.querySQL({
    sql: "SELECT cc.*,(@num:=@num+cc.con_new) as con_num FROM (SELECT DATE_FORMAT(con_time,'%Y-%m-%d') as con_date , COUNT(cid) as con_new FROM contribution WHERE con_time >= ? GROUP BY con_date)cc CROSS JOIN (select @num := (SELECT COUNT(cid) FROM contribution WHERE con_time < ?)) x ;",
    values: [key_item, key_item],
    timeout: 40000,
  }, function (error, result_con) {
    if (error) {
      return res.json({
        code: -501,
        message: "系统错误"
      });
    }
	if(result_con.length == 0){
		db.querySQL({
			sql: "SELECT COUNT(cid) AS con_num FROM contribution",
			timeout: 40000,
		}, function (error, result_num) {
			if (error) {
			  return res.json({ code: -501, message: "系统错误" });
			}
			result_con = result_num[0].con_num
			return res.json({
				code: 0,
				message: "ok",
				data_con: result_con,
				data_check: result_con
			});
			return
		})
		return
	}
	db.querySQL({
		sql: "SELECT DATE(check_time) AS check_date,COUNT(cid) AS check_new FROM contribution WHERE ( check_type='success' OR check_type='ready' OR check_type='used' OR check_type='fail' ) AND check_uid <> 0 AND check_time >= ? GROUP BY DATE_FORMAT(check_time, '%Y-%m-%d') ORDER BY check_time ASC",
		values: [key_item],
		timeout: 40000,
	}, function (error, result_check) {
		if (error) {
		  return res.json({
			code: -501,
			message: "系统错误"
		  });
		}
		return res.json({
			code: 0,
			message: "ok",
			data_con: result_con,
			data_check: result_check
		});
	})
  });
})

router.get('/user/:key', function (req, res, next) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type !== "super") {
		return res.json({ code: -510, message: "您的权限不足" });
	}
	
	var oneWeekAgo = moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');
	var twoWeeksAgo = moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss');
	var oneMonthAgo = moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');
	var oneYearAgo = moment().subtract(365, 'days').format('YYYY-MM-DD HH:mm:ss');
	
	if(req.params.key == "week"){
		var key_item = oneWeekAgo
	}else if(req.params.key == "twoweeks"){
		var key_item = twoWeeksAgo
	}else if(req.params.key == "month"){
		var key_item = oneMonthAgo
	}else if(req.params.key == "year"){
		var key_item = oneYearAgo
	}else{
		return res.json({ code: -503, message: "参数有误" });
	}
	
	db.querySQL({
		sql: "SELECT cc.*,(@num:=@num+cc.reg_new) as reg_num FROM (SELECT DATE_FORMAT(reg_time,'%Y-%m-%d') as reg_date , COUNT(uid) as reg_new FROM user WHERE reg_time >= ? GROUP BY reg_date)cc CROSS JOIN (select @num := (SELECT COUNT(uid) FROM user WHERE reg_time < ?)) x ;",
		values: [key_item, key_item],
		timeout: 40000,
	}, function (error, result_user) {
		if (error) {
			return res.json({
				code: -501,
				message: "系统错误"
			});
		}
		if(result_user.length == 0){
		  db.querySQL({
			sql: "SELECT COUNT(uid) AS reg_num FROM user",
			values: [],
			timeout: 40000,
		  }, function (error, result_num) {
			if (error) {
			  return res.json({ code: -501, message: "系统错误" });
			}
			var reg_num = result_num[0].reg_num
			return res.json({
				code: 0,
				message: "ok",
				reg_num: reg_num
			});
			return
		  })
		  return
		}
		return res.json({
			code: 0,
			message: "ok",
			user: result_user,
		});
    });
})

router.get('/visit/:key', function (req, res, next) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type !== "super") {
		return res.json({ code: -510, message: "您的权限不足" });
	}
	var oneDayAgo = moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss');
	var oneWeekAgo = moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');
	var twoWeeksAgo = moment().subtract(14, 'days').format('YYYY-MM-DD HH:mm:ss');
	var oneMonthAgo = moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss');
	var oneYearAgo = moment().subtract(365, 'days').format('YYYY-MM-DD HH:mm:ss');
	
	if(req.params.key == "day"){
		var key_item = oneDayAgo
	}else if(req.params.key == "week"){
		var key_item = oneWeekAgo
	}else if(req.params.key == "twoweeks"){
		var key_item = twoWeeksAgo
	}else if(req.params.key == "month"){
		var key_item = oneMonthAgo
	}else if(req.params.key == "year"){
		var key_item = oneYearAgo
	}else{
		return res.json({ code: -503, message: "参数有误" });
	}
	if(req.params.key !== "day"){
		db.querySQL({
			sql: "SELECT cc.*,(@num:=@num+cc.visit_new) as visit_num FROM (SELECT DATE_FORMAT(visit_time,'%Y-%m-%d') as visit_date , COUNT(vid) as visit_new FROM visit WHERE visit_time >= ? GROUP BY visit_date)cc CROSS JOIN (select @num := (SELECT COUNT(vid) FROM visit WHERE visit_time < ?)) x ;",
			values: [key_item, key_item],
			timeout: 40000,
		}, function (error, result_visit) {
			if (error) {
				return res.json({
					code: -501,
					message: "系统错误"
				});
			}
			if(result_visit.length == 0){
			  db.querySQL({
				sql: "SELECT COUNT(vid) AS visit_num FROM visit",
				values: [],
				timeout: 40000,
			  }, function (error, result_num) {
				if (error) {
				  return res.json({ code: -501, message: "系统错误" });
				}
				var visit_num = result_num[0].visit_num
				return res.json({
					code: 0,
					message: "ok",
					visit_num: visit_num
				});
				return
			  })
			  return
			}
			return res.json({
				code: 0,
				message: "ok",
				visit: result_visit,
			});
		});
	}else{
		db.querySQL({
			sql: "SELECT cc.*,(@num:=@num+cc.visit_new) as visit_num FROM (SELECT DATE_FORMAT(visit_time,'%H:%i') as visit_time_val , COUNT(vid) as visit_new FROM visit WHERE visit_time >= ? GROUP BY visit_time_val)cc CROSS JOIN (select @num := (SELECT COUNT(vid) FROM visit WHERE visit_time < ?)) x ;",
			values: [key_item, key_item],
			timeout: 40000,
		}, function (error, result_visit) {
			if (error) {
				return res.json({
					code: -501,
					message: "系统错误"
				});
			}
			if(result_visit.length == 0){
			  db.querySQL({
				sql: "SELECT COUNT(vid) AS visit_num FROM visit",
				values: [],
				timeout: 40000,
			  }, function (error, result_num) {
				if (error) {
				  return res.json({ code: -501, message: "系统错误" });
				}
				var visit_num = result_num[0].visit_num
				return res.json({
					code: 0,
					message: "ok",
					visit_num: visit_num
				});
				return
			  })
			  return
			}
			return res.json({
				code: 0,
				message: "ok",
				visit: result_visit,
			});
		});
	}
})

module.exports = router;
