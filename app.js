var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session")
var FileStore = require('session-file-store')(session);
var fs = require("fs")

var identityKey = 'skey';

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');


var logger = require('morgan');
// app.use(logger('dev')); //打印到控制台


var accessLog = fs.createWriteStream(path.join(__dirname, 'log/access.log'), { flag: 'a' });
// 创建一个写文件流，并且保存在access.log文件中
var errorLog = fs.createWriteStream(path.join(__dirname, 'log/error.log'), { flags: 'a' });
logger.token('localDate',function getDate(req) {
  let date = new Date()
  return  date.toLocaleString()
})

logger.format('combined', ':remote-addr - :remote-user [:localDate]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"');
app.use(logger('combined', { stream: accessLog }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  name: identityKey,
  secret: 'ezxkl',  // 用来对session id相关的cookie进行签名
  store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
  saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
  resave: false,  // 是否每次都重新保存会话，建议false
  cookie: {
    maxAge: 1000 * 60 * 30  // 有效期，单位是毫秒
  }
}));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
