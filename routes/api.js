var express = require('express');
var router = express.Router();

var musicRouter = require('./api/music');
var contributionRouter = require('./api/contribution');
var checkRouter = require('./api/check');
var noticeRouter = require('./api/notice');
var statisticRouter = require('./api/statistic');
var adminRouter = require('./api/admin');
var commentRouter = require('./api/comment');
var messageRouter = require('./api/message');

router.use('/music', musicRouter);
router.use('/contribution', contributionRouter);
router.use('/check', checkRouter);
router.use('/notice', noticeRouter);
router.use('/statistic', statisticRouter);
router.use('/admin', adminRouter);
router.use('/comment', commentRouter);
router.use('/message', messageRouter);

module.exports = router;
