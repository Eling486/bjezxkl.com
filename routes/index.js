var express = require('express');
var router = express.Router();
var db = require('../database/index');
var moment = require('moment');
moment.locale('zh-cn');

function getMachine(req) {
  var deviceAgent = req.headers["user-agent"].toLowerCase();
  var agentID = deviceAgent.match(/(iphone|ipod|android)/);
  if (agentID) {
    return "mobile";
  } else {
    return "pc";
  }
}

function newVisits(req,page,machine){
	var visit_time = moment().format('YYYY-MM-DD HH:mm:ss')
	var visit_page = page
	var machine = machine
	if (req.session.uid) {
		var uid = req.session.uid
		var user = req.session.user
	}else{
		var uid = null
		var user = null
	}
	db.querySQL({
      sql: "INSERT INTO visit (vid,uid,user,visit_time,visit_page,machine) VALUES (?,?,?,?,?,?)",
      values: [null,uid,user,visit_time,visit_page,machine],
      timeout: 40000,
    }, function (error, result) {
		
    });
}

/* GET home page. */
router.get('/', function (req, res, next) {

  //var port = req.app.settings.port || cfg.port;
  //var url = req.protocol + '://' + req.host + (port == 80 || port == 443 ? '' : ':' + port) + req.path;

  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/index', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('index', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
  newVisits(req,"index",machine)
});

router.get('/plan', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/plan', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('plan', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
  newVisits(req,"plan",machine)
});

router.get('/history', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/history', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('history', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
  newVisits(req,"history",machine)
});

router.get('/contribute', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/contribute', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('contribute', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
  newVisits(req,"contribute",machine)
});

router.get('/about', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/about', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('about', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
  newVisits(req,"about",machine)
});

router.get('/templates/:url', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/templates/' + req.params.url, {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('templates/' + req.params.url, {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
});

router.get('/user/quicklogin', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
    res.render('m/user/quicklogin', {
      title: '北京二中下课铃投稿平台',
    });
  } else {
    res.render('user/quicklogin', {
      title: '北京二中下课铃投稿平台',
    });
  }
});

router.get('/message', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/message', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('message', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
  newVisits(req,"message",machine)
});

router.get('/user', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/user', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('user', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
  newVisits(req,"user",machine)
});

router.get('/administration', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/administration', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('administration', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
  newVisits(req,"administration",machine)
});

router.get('/administration/comcheck', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/comcheck', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('comcheck', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
});

router.get('/administration/notice', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/notice', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('notice', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
});

router.get('/administration/concheck', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/concheck', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('concheck', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
});

router.get('/administration/makeplan', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/makeplan', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('makeplan', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
});

router.get('/administration/pastcon', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('pastcon', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('pastcon', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
});

router.get('/administration/archive', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/administration', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('archive', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
});

router.get('/administration/statistics', function (req, res, next) {
  var machine = getMachine(req)
  if (machine == "mobile") {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('m/statistics', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  } else {
	if (!req.session.uid || !req.session.user) {
		req.session.user_msg = "还未登陆呦，点击登录"
	} else {
		req.session.user_msg = ""
	}
    res.render('statistics', {
      title: '北京二中下课铃投稿平台',
      user: req.session.user,
      user_msg: req.session.user_msg
    });
  }
});

module.exports = router;
