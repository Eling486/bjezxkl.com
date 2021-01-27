var express = require('express');
var router = express.Router();
var db = require('../../database/index');
var moment = require('moment');
var https = require('https');
var request = require("request");
var path = require("path");
var fs = require('fs');
var jszip = require("jszip");
var multer = require("multer");
moment.locale('zh-cn');
var CronJob = require('cron').CronJob;

//null转换函数
function NullToStr(data) {
	for (let x in data) {
		if (data[x] === null) {                     // 如果是null 把直接内容变为""
			data[x] = '';
		} else {
			if (Array.isArray(data[x])) {           // 是数组遍历数组 递归继续处理
				data[x] = data[x].map(z => {
					return NullToStr(z);
				});
			}
			if (typeof (data[x]) === 'object') {    // 是json 递归继续处理
				data[x] = NullToStr(data[x])
			}
		}
	}
	return data;
}

new CronJob('0 0 0 * * *', function () {
	autoRefuseContributions()
	return
}, null, true);

function autoRefuseContributions() {
	const date = new Date();
	var oneMonthsAgo = moment().subtract(1, 'months').format('YYYY-MM-DD HH:mm:ss');
	db.querySQL({
		sql: "SELECT cid,con_uid,con_user,con_time,log,check_type,realname FROM contribution WHERE con_time < ? AND check_type = ?",
		values: [oneMonthsAgo, "waiting"],
		timeout: 40000,
	}, function (error, data) {
		var con_list = []
		for (var i = 0; i < data.length; i++) {
			con_list.push(data[i].cid)
		}
		var j = 0
		var now1 = moment().format('YYYY-MM-DD HH:mm:ss');
		if(con_list.length === 0){
			console.log("[MSG]"+now1+"|开始执行自动审核|待拒绝投稿cid：[无]")
			var now2 = moment().format('YYYY-MM-DD HH:mm:ss');
			return console.log("[MSG]"+now2+"|自动审核执行完毕|本次共拒绝 "+ con_list.length +" 个超时投稿")
		}
		console.log("[MSG]"+now1+"|开始执行自动审核|待拒绝投稿cid："+ con_list.toString())
		function autoCheck(j, data) {
			var cid = data[j].cid
			var revisable = 0
			var check_type = 'fail';
			var check_time = moment().format('YYYY-MM-DD HH:mm:ss');
			var check_note = "很遗憾，这个投稿因为超时而未被录用呢！可以再投一次看看哟~";
			var check_uid = 0;
			var check_user = "系统";
			db.querySQL({
				sql: "SELECT cid,con_uid,con_user,con_time,log,check_type,realname FROM contribution WHERE cid=?",
				values: [cid],
				timeout: 40000,
			}, function (error, result) {
				if (error) {
					return console.log(check_time + " | " + cid + " | 自动拒绝失败")
				}
				if (result[0]) {
					var log = result[0].log
					var old_type = result[0].check_type
					var con_uid = result[0].con_uid
					var con_user = result[0].con_user
					var con_time = result[0].con_time
					var realname = result[0].realname;
					log = log + "|" + check_time + "|" + check_uid + "/" + check_user + "->check|" + old_type + "->" + check_type + "|" + check_note + ";"
					db.querySQL({
						sql: "UPDATE contribution SET revisable = ?, check_type = ?, check_time = ?, check_note = ?, check_uid = ?, check_user = ?, log = ? WHERE cid = ?",
						values: [revisable, check_type, check_time, check_note, check_uid, check_user, log, cid],
						timeout: 40000,
					}, function (error, result) {
						//发送私信
						var msg_send_user = "噔噔咚！是投稿结果反馈！"
						var msg_to_uid = con_uid
						var msg_to_user = con_user
						var msg_send_time = moment().format('YYYY-MM-DD HH:mm:ss');
						var msg_content = "<p class='con-feedback'>感谢你的投稿~由于稿件超过30天没有被审核，你投稿的《" + realname + "》被自动<span style='color:red;'>拒绝</span>了，但你依然可以重新投稿该曲目，说不定就可以通过了呢！如果有疑问请前往【投稿页】查看投稿须知，或者通过邮箱联系我们～</p><p class='check-user'>[ " + check_user + "自动审核 ]</p><p class='check-time'>投稿时间：" + con_time + "</p><p class='check-time'>审核时间：" + check_time + "</p>"
						db.querySQL({
							sql: "INSERT INTO message (msg_id,visible,checked,type,msg_send_user,msg_to_uid,msg_to_user,msg_send_time,msg_content,msg_read) VALUES (?,?,?,?,?,?,?,?,?,?)",
							values: [null, 1, 1, "system", msg_send_user, msg_to_uid, msg_to_user, msg_send_time, msg_content, 0],
							timeout: 40000,
						}, function (error, result) {
							if (error) {
								return console.log(check_time + " | " + cid + " | 自动拒绝失败")
							}
							if(j < data.length - 1){
								j++
								autoCheck(j, data)
							}else{
								var now2 = moment().format('YYYY-MM-DD HH:mm:ss');
								return console.log("[MSG]"+now2+"|自动审核执行完毕|本次共拒绝 "+ data.length +" 个超时投稿")
								 
							}
						})
					})
				}
			})
		}
		autoCheck(j, data)
	})
}

router.post('/hasplan', function (req, res, next) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type == "normal" || req.session.type == "banned") {
		return res.json({ code: -510, message: "权限不足" });
	}
	var date = req.body.date
	db.querySQL({
		sql: "SELECT * FROM music WHERE date=?",
		values: [date],
		timeout: 40000,
	}, function (error, result) {
		if (error) {
			return res.json({
				code: -501,
				message: "系统错误"
			});
		}
		if (result[0]) {
			return res.json({ code: -505, message: "当天已存在下课铃", date: date, data: result[0] });
		} else {
			return res.json({ code: 0, message: "当天还未进行安排", date: date });
		}
	})
})

router.post('/makeplan', function (req, res, next) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type == "normal" || req.session.type == "banned") {
		return res.json({ code: -510, message: "权限不足" });
	}
	var cid = req.body.cid
	var plan_week = req.body.plan_week;
	var plan_date = req.body.plan_date;
	var showname = req.body.showname;
	var realname = req.body.realname;
	var check_time = moment().format('YYYY-MM-DD HH:mm:ss');
	var check_uid = req.session.uid;
	var check_user = req.session.user;
	var check_type = "ready"
	if (!cid) {
		return res.json({ code: -503, message: "缺少cid" });
	}
	if (!showname) {
		return res.json({ code: -503, message: "缺少显示名称" });
	}
	if (!realname) {
		return res.json({ code: -503, message: "缺少实际名称" });
	}
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
			if (old_type == "success") {
				if (!plan_week) {
					return res.json({ code: -503, message: "缺少播放周" });
				}
				if (!plan_date) {
					return res.json({ code: -503, message: "缺少播放日期" });
				}
			} else if (old_type == "ready") {
				if (!plan_week) {
					check_type = "success"
				}
				if (!plan_date) {
					check_type = "success"
				}
			}
		} else {
			return res.json({ code: -503, message: "参数有误" });
		}
		log = log + "|" + check_time + "|" + check_uid + "/" + check_user + "->makeplan|" + old_type + "->" + check_type + ";"
		if (check_type == "ready") {
			db.querySQL({
				sql: "UPDATE contribution SET plan_week = ?, plan_date = ?, showname = ?, realname = ?, check_type = ?, log = ? WHERE cid = ?",
				values: [plan_week, plan_date, showname, realname, check_type, log, cid],
				timeout: 40000,
			}, function (error, result) {
				if (error) {
					return res.json({ code: -501, message: "系统错误" });
				}
				return res.json({ code: 0, message: '预备安排添加成功' });
			});
		} else if (check_type == "success") {
			db.querySQL({
				sql: "UPDATE contribution SET check_type = ?, log = ? WHERE cid = ? AND check_type='ready'",
				values: [check_type, log, cid],
				timeout: 40000,
			}, function (error, result) {
				if (error) {
					return res.json({ code: -501, message: "系统错误" });
				}
				return res.json({ code: 0, message: '投稿状态修改成功' });
			});
		}
	})
});

router.post('/confirmplan', function (req, res, next) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type == "normal" || req.session.type == "banned") {
		return res.json({ code: -510, message: "权限不足" });
	}
	var cid = req.body.cid
	var update_time = moment().format('YYYY-MM-DD HH:mm:ss');
	var update_uid = req.session.uid;
	var update_user = req.session.user;
	var update_type = "used"
	db.querySQL({
		sql: "SELECT * FROM contribution WHERE cid=? AND check_type='ready'",
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
			var date = result[0].plan_date
			var week = result[0].plan_week
			var ncmid = result[0].ncmid
			var state = result[0].state
			var showname = result[0].showname
			var realname = result[0].realname
			var artist = result[0].artist
			var cid = result[0].cid
			var con_uid = result[0].con_uid
			var con_user = result[0].con_user
			var con_time = result[0].con_time
			var old_type = result[0].check_type
		} else {
			return res.json({ code: -503, message: "参数有误" });
		}
		db.querySQL({
			sql: "SELECT * FROM music WHERE date=?",
			values: [date],
			timeout: 40000,
		}, function (error, result) {
			if (error) {
				return res.json({
					code: -501,
					message: "系统错误"
				});
			}
			if (result[0]) {
				return res.json({ code: -503, message: "当天已存在下课铃", date: date });
			}
			db.querySQL({
				sql: "INSERT INTO music (mid,date,week,ncmid,state,showname,realname,artist,cid,con_uid,con_user,con_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
				values: [null, date, week, ncmid, state, showname, realname, artist, cid, con_uid, con_user, con_time],
				timeout: 40000,
			}, function (error, result) {
				if (error) {
					return res.json({ code: -501, message: "系统错误" });
				}
				log = log + "|" + update_time + "|" + update_uid + "/" + update_user + "->confirmplan|" + old_type + "->" + update_type + ";"
				db.querySQL({
					sql: "UPDATE contribution SET check_type = ?, log = ? WHERE cid = ?",
					values: [update_type, log, cid],
					timeout: 40000,
				}, function (error, result) {
					if (error) {
						return res.json({ code: -501, message: "系统错误" });
					}
					return res.json({ code: 0, message: '下课铃已添加完成' });
				});
			});
		})
	});
})

router.post('/download', function (req, res, next) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type == "normal" || req.session.type == "banned") {
		return res.json({ code: -510, message: "权限不足" });
	}
	//var start_day = "2020-07-13"
	//var end_day = "2020-07-19"
	var start_day = req.body.start;
	var end_day = req.body.end;
	db.querySQL({
		sql: "SELECT * FROM contribution WHERE plan_date >= ? AND plan_date <= ? AND check_type='ready'",
		values: [start_day, end_day],
		timeout: 40000,
	}, function (error, result) {
		if (error) {
			return res.json({ code: -501, message: "系统错误" });
		}
		var showname_list = []
		var ncmid_list = []
		var realname_list = []
		var date_list = []
		for (var i = 0; i < result.length; i++) {
			if (result[i].state == 'ok') {
				ncmid_list.push(result[i].ncmid)
				showname_list.push(result[i].plan_showname)
				realname_list.push(result[i].realname)
				date_list.push(result[i].plan_date)
			}
		}
		db.querySQL({
			sql: "SELECT * FROM music WHERE date >= ? AND date <= ?",
			values: [start_day, end_day],
			timeout: 40000,
		}, function (error, result) {
			if (error) {
				return res.json({ code: -501, message: "系统错误" });
			}
			for (var i = 0; i < result.length; i++) {
				if (result[i].state == 'ok') {
					ncmid_list.push(result[i].ncmid)
					showname_list.push(result[i].showname)
					realname_list.push(result[i].realname)
					date_list.push(result[i].date)
				}
			}
			var now = moment().format('YYYY-MM-DD HHmmss');
			var dirPath = path.join("./public/download", now);
			var outputPath = "./public/download"; //输出路径
			delDir(outputPath)
			function delDir(path) {
				let files = [];
				if (fs.existsSync(path)) {
					var output_files = fs.readdirSync(path);
					output_files.forEach(function (file, index) {
						let curPath = path + "/" + file;
						if (fs.statSync(curPath).isDirectory()) {
							delDir(curPath); //递归删除文件夹
						} else {
							fs.unlinkSync(curPath); //删除文件
						}
					})
					fs.rmdirSync(path);
				}
			}
			fs.mkdirSync("./public/download", 0777, true);
			fs.mkdirSync(dirPath, 0777, true);
			var j = 0
			startDownload(j)
			function startDownload(j) {
				let download_url = "https://music.163.com/song/media/outer/url?id=" + ncmid_list[j] + ".mp3"
				let fileName = j + "_" + showname_list[j] + "_" + date_list[j] + "_" + realname_list[j] + "_" + ncmid_list[j] + ".mp3";
				let stream = fs.createWriteStream(path.join(dirPath, fileName));
				request(download_url).pipe(stream).on("close", function (err) {
					if (j < ncmid_list.length - 1) {
						j++
						startDownload(j)
					} else {
						var zip = new jszip();
						let files = fs.readdirSync(dirPath); //读取需要压缩的目录
						files.forEach(function (fileName, index) { //遍历目录中的文件
							let fillPath = dirPath + "/" + fileName;
							zip.file(fileName, fs.readFileSync(fillPath)); //向压缩目录中添加文件
						});
						zip.generateAsync({ //设置压缩格式，开始打包
							type: "nodebuffer", //nodejs用
							compression: "DEFLATE", //压缩算法
							compressionOptions: { //压缩级别
								level: 9
							}
						}).then(function (content) {
							fs.writeFileSync(outputPath + "/" + now + ".zip", content, "utf-8")
							return res.json({ code: 0, message: "ok", url: "/download/" + now + ".zip" })
						});
					}
				});
			}
		});
	});
})

var update_log = []
router.post('/archive/update', function (req, res) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type !== "super") {
		return res.json({ code: -510, message: "权限不足" });
	}
	db.querySQL({
		sql: "SELECT * FROM music WHERE state != 'local'",
		timeout: 40000,
	}, function (error, result) {
		if (error) {
			return res.json({ code: -501, message: "系统错误" + error });
		} else {
			update_log = []
			var i = 0
			getState(result, i)
			function getState(result, i) {
				var this_data = result[i]
				var state = "ok"
				var musicurl = "/song/url?id=" + this_data.ncmid
				var checkurl = "/check/music?id=" + this_data.ncmid
				// vip: musicurl.url == null && checkurl.success == true; error: checkurl.success == false
				var options = {
					hostname: 'www.bjezxkl.com',
					port: 5100,
					path: musicurl,
					method: 'GET'
				};
				var options2 = {
					hostname: 'www.bjezxkl.com',
					port: 5100,
					path: checkurl,
					method: 'GET'
				};
				var _req = https.request(options, function (data) {
					data.setEncoding('utf8');
					data.on('data', function (chunk) {
						chunk = JSON.parse(chunk)
						if (chunk.data[0].url == null) {
							var _req2 = https.request(options2, function (data) {
								data.setEncoding('utf8');
								data.on('data', function (chunk) {
									chunk = JSON.parse(chunk)
									if (chunk.success == false) {
										state = "error"
									} else {
										state = "vip"
									}
									updateState(this_data, state)
									i++
									if (i < result.length) {
										getState(result, i)
									} else {
										return res.json({ code: 0, message: '状态更新完成', data: update_log });
									}
								});
							});
							_req2.end();
						} else {
							state = "ok"
							updateState(this_data, state)
							i++
							if (i < result.length) {
								getState(result, i)
							} else {
								return res.json({ code: 0, message: '状态更新完成', data: update_log });
							}
						}
					});
				});
				_req.end();
			}
		}
	});
});
function updateState(this_data, state) {
	if (state !== this_data.state) {
		db.querySQL({
			sql: "UPDATE music SET state = ? WHERE mid = ?",
			values: [state, this_data.mid],
			timeout: 40000,
		}, function (error, result) {
			if (error) {
				return res.json({ code: -501, message: "系统错误" });
			}
			update_log.push(this_data.mid + "/" + this_data.date + ":" + this_data.state + "->" + state)
		});
	}
}

router.get('/archive/history', function (req, res) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type !== "super") {
		return res.json({ code: -510, message: "权限不足" });
	}
	db.querySQL({
		sql: "SELECT * FROM music WHERE state <> 'ok'",
		timeout: 40000,
	}, function (error, result) {
		if (error) {
			return res.json({ code: -501, message: "系统错误" + error });
		} else {
			var data = NullToStr(result);
			fs.readdir('./public/mp3', function (err, files) {
				var fileNames = []
				for (var i = 0; i < files.length; i++) {
					fileNames.push(files[i].split('.')[0])
				}
				var result = []
				for (var i = 0; i < data.length; i++) {
					var this_data = data[i]
					if (fileNames.indexOf(String(this_data.ncmid)) < 0) {
						result.push(this_data)
					}
				}
				return res.json({ code: 0, message: 'ok', data: result });
			})
		}
	});
});

var upload = multer({ dest: './cache' });
router.post('/archive/upload', upload.single('file'), function (req, res) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type !== "super") {
		return res.json({ code: -510, message: "权限不足" });
	}
	let music_file = fs.readFileSync(req.file.path);
	let filepath = "./public/mp3/" + req.body.ncmid + ".mp3"
	fs.writeFile(filepath, music_file, function () {
		fs.unlink(req.file.path, function (err) {
			if (err) {
				throw err;
			}
			res.json({ code: 0, message: 'ok' });
		})
	});
})

//获取全部数据表
router.get('/database/showtables', function (req, res, next) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type !== "super") {
		return res.json({ code: -510, message: "权限不足" });
	}

	db.querySQL({
		sql: "show tables;",
		timeout: 40000,
	}, function (error, result) {
		if (error) {
			return res.json({
				code: -501,
				message: "系统错误"
			});
		}
		return res.json({ code: 0, message: "ok", data: result });
	})
})

router.get('/database/getdata/', function (req, res, next) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type !== "super") {
		return res.json({ code: -510, message: "权限不足" });
	}
	var table = req.query.table
	var page = req.query.page
	var pageMax = req.query.pageMax
	var tableList = ["music", "contribution", "comment", "message", "notice", "visit"]
	var keyList = ["mid", "cid", "com_id", "msg_id", "nid", "vid"]
	if (tableList.indexOf(table) < 0) {
		return res.json({ code: -503, message: "参数有误" });
	}
	var numInList = tableList.indexOf(table)
	var key = keyList[numInList]
	db.querySQL({
		sql: "SELECT * FROM " + table + " WHERE " + key + " > " + (page - 1) * pageMax + " LIMIT " + pageMax,
		timeout: 40000,
	}, function (error, result) {
		if (error) {
			return res.json({
				code: -501,
				message: "系统错误" + error
			});
		}
		return res.json({ code: 0, message: "ok", data: result });
	})
})

router.get('/database/getdata/', function (req, res, next) {
	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type !== "super") {
		return res.json({ code: -510, message: "权限不足" });
	}
	var table = req.query.table
	var page = req.query.page
	var pageMax = req.query.pageMax
	var tableList = ["music", "contribution", "comment", "message", "notice", "visit"]
	var keyList = ["mid", "cid", "com_id", "msg_id", "nid", "vid"]
	if (tableList.indexOf(table) < 0) {
		return res.json({ code: -503, message: "参数有误" });
	}
	var numInList = tableList.indexOf(table)
	var key = keyList[numInList]
	db.querySQL({
		sql: "SELECT * FROM " + table + " WHERE " + key + " > " + (page - 1) * pageMax + " LIMIT " + pageMax,
		timeout: 40000,
	}, function (error, result) {
		if (error) {
			return res.json({
				code: -501,
				message: "系统错误" + error
			});
		}
		return res.json({ code: 0, message: "ok", data: result });
	})
})

router.post('/create', function (req, res, next) {

	if (!req.session.uid || !req.session.user) {
		return res.json({ code: -502, message: "未登录" });
	}
	if (req.session.type !== "super") {
		return res.json({ code: -510, message: "权限不足" });
	}
	var date = req.body.date;
	var week = req.body.week;
	var ncmid = req.body.ncmid;
	var state = req.body.state;
	var showname = req.body.showname;
	var realname = req.body.realname;
	var artist = req.body.artist;
	db.querySQL({
		sql: "INSERT INTO music (mid,date,week,ncmid,state,showname,realname,artist) VALUES (?,?,?,?,?,?,?,?)",
		values: [null, date, week, ncmid, state, showname, realname, artist],
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
			message: '添加成功'
		});
	});
});


module.exports = router;
