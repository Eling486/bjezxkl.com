var express = require('express');
var router = express.Router();
//var bcrypt = require('bcrypt');
var db = require('../database/index');
var request = require('request')
var moment = require('moment');
moment.locale('zh-cn');

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

//用户注册
router.post('/register', function (req, res) {
    var username = req.body.username
    var password = req.body.password
    var email = req.body.email
    db.querySQL({                                                   //username查重
        sql: "SELECT uid FROM user WHERE username = ?",
        values: [username],
        timeout: 40000,
    }, function (error, result) {
        if (!result[0]) {
            db.querySQL({                                           //email查重
                sql: "SELECT uid FROM user WHERE email = ?",
                values: [email],
                timeout: 40000,
            }, function (error, result) {
                if (!result[0]) {
                    var now = moment().format('YYYY-MM-DD HH:mm:ss')
                    var reg_time = now
                    var type = "normal"                             //默认为普通用户
                    db.querySQL({
                        sql: "INSERT INTO user (uid,username,password,email,reg_time,type) VALUES (?,?,?,?,?,?)",
                        values: [null, username, password, email, reg_time, type],
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
                            message: "注册成功"
                        });
                    })

                } else {
                    return res.json({
                        code: -503,
                        message: "该邮箱已被注册"
                    });
                }
            })
        } else {
            return res.json({
                code: -502,
                message: "用户名已被占用"
            });
        }
    });
});


//用户登录
router.post('/login', function (req, res) {
    var username = req.body.username
    var password = req.body.password
    if (req.query.fromUrl) {
        var fromUrl = req.query.fromUrl;
    } else {
        var fromUrl = "";
    }
    db.querySQL({
        sql: "SELECT * FROM user WHERE username = ? AND password = ?",
        values: [username, password],
        timeout: 40000,
    }, function (error, result) {
        if (error) {
            return res.json({
                code: -501,
                message: '登录失败'
            });
        }
        if (!result[0]) {
            return res.json({
                code: -503,
                message: '用户名或密码错误'
            });
        } else {
            req.session.regenerate(function (err) {
                if (err) {
                    return res.json({
                        code: -501,
                        message: "登录失败"
                    });
                }
                req.session.user = result[0].username;
                req.session.uid = result[0].uid;
                req.session.type = result[0].type
                req.session.user_msg = ""
                res.json({
                    code: 0,
                    message: "登录成功",
                    uid: result[0].uid,
                    username: result[0].username,
                    type: result[0].type,
                    fromUrl: fromUrl
                });
            });
        }
    })
})

router.get('/weixin/register', function (req, res) {
    /*
    var username = req.body.username
    var password = req.body.password
    var email = req.body.email
    */
    var AppID = '******************';
    var AppSecret = '********************************';
    var code = req.query.code
    console.log(code)
    request.get({
        url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + AppID + '&secret=' + AppSecret + '&js_code=' + code + '&grant_type=authorization_code',
    }, function (error, response, body) {
        if (response.statusCode == 200) {
            // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
            //console.log(JSON.parse(body));
            var data = JSON.parse(body);
            console.log(data)
            var openid = data.openid;
            request.get({
                url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + AppID + '&secret=' + AppSecret,
            },
            function (error, response, body) {
                var callback = JSON.parse(body);
                console.log(callback)
                var access_token = callback.access_token;
                request.get({
                        url: 'https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN',
                    },
                    function (error, response, body) {
                        if (response.statusCode == 200) {
                            // 第四步：根据获取的用户信息进行对应操作
                            var userinfo = JSON.parse(body);
                            console.log('获取微信信息成功！');
                            console.log(userinfo)
                            res.send("\
                                <h1>"+ userinfo.nickname + " 的个人信息</h1>\
                                <p><img src='"+ userinfo.headimgurl + "' /></p>\
                                <p>"+ userinfo.city + "，" + userinfo.province + "，" + userinfo.country + "</p>\
                                <p>openid: "+ userinfo.openid + "</p>\
                            ");
                        } else {
                            console.log(response.statusCode);
                        }
                    })
            })
        } else {
            console.log(response.statusCode);
        }
    })
})

//查询用户信息
router.get('/infos/', function (req, res) {
    if (!req.session.user) {                //未登录-拦截
        return res.json({
            code: -502,
            message: "未登录"
        });
    }
    var uid = req.query.uid;
    var username = req.query.username;
    if (req.session.type == "super") {      //若为超级管理员
        if (uid && username) {                  //通过双参数查询
            getUserInfos(uid, username, res)
        } else if (uid && !username) {          //通过uid查询
            db.querySQL({
                sql: "SELECT uid,username,email,reg_time,type FROM user WHERE uid = ?",
                values: [uid],
                timeout: 40000,
            }, function (error, result) {
                if (error) {
                    return res.json({
                        code: -501,
                        message: "系统错误"
                    });
                }
                data = NullToStr(result[0])
                return res.json({
                    code: 0,
                    message: 'ok',
                    data: data
                });
            });
        } else if (!uid && username) {          //通过username查询
            db.querySQL({
                sql: "SELECT uid,username,email,reg_time,type FROM user WHERE username = ?",
                values: [username],
                timeout: 40000,
            }, function (error, result) {
                if (error) {
                    return res.json({
                        code: -501,
                        message: "系统错误"
                    });
                }
                data = NullToStr(result[0])
                return res.json({
                    code: 0,
                    message: 'ok',
                    data: data
                });
            });
        } else {                                  //无参数-默认查询自己
            getUserInfos(req.session.uid, req.session.user, res)
        }
    } else if (uid == req.session.uid && username == req.session.user) {    //普通用户查询自己
        getUserInfos(req.session.uid, req.session.user, res)
    } else if (!uid || !username) {
        getUserInfos(req.session.uid, req.session.user, res)                //无参数-默认查询自己
    } else {
        return res.json({
            code: -510,
            message: "权限不足"
        });                //参数不完整 && 权限不足 -禁止查询
    }
});
//通用双参数查询函数
function getUserInfos(uid, username, res) {
    db.querySQL({
        sql: "SELECT uid,username,email,reg_time,type FROM user WHERE uid = ? AND username = ?",
        values: [uid, username],
        timeout: 40000,
    }, function (error, result) {
        if (error) {
            return res.json({
                code: -501,
                message: "系统错误"
            });
        }
        data = NullToStr(result[0])
        return res.json({
            code: 0,
            message: 'ok',
            data: data
        });
    });
}


router.get('/remind', function (req, res) {
    if (!req.session.user) {                //未登录-拦截
        return res.json({
            code: -502,
            message: "未登录"
        });
    }
    var uid = req.session.uid
    db.querySQL({
        sql: "SELECT msg_to_uid,msg_id,type FROM message WHERE visible=1 AND msg_to_uid = ? AND msg_read=0",
        values: [uid],
        timeout: 40000,
    }, function (error, result) {
        if (error) {
            return res.json({ code: -501, message: "系统错误" });
        }
        var result_msg = result.filter(function (item) {
            return item.type == "msg"
        });
        var result_like = result.filter(function (item) {
            return item.type == "like"
        });
        var result_comment = result.filter(function (item) {
            return item.type == "comment"
        });
        var result_system = result.filter(function (item) {
            return item.type == "system"
        });
        var unread_msg_num = result_msg.length;
        var unread_system_num = result_system.length;
        var new_like_num = result_like.length
        var new_comment_num = result_comment.length
        return res.json({
            code: 0,
            message: "获取成功",
            data: [{
                new_like_num: new_like_num,
                new_comment_num: new_comment_num,
                unread_msg_num: unread_msg_num,
                unread_system_num: unread_system_num,
            }]
        });
    })
})

//用户登出
router.route('/logout').get(function (req, res) {
    req.session.uid = null;
    req.session.user = null;
    req.session.type = null;
    req.session.user_msg = "还未登陆呦，点击登录"
    return res.json({
        code: 0,
        message: 'ok',
        data: "已登出"
    });
});

module.exports = router;
