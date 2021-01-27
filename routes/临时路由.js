//json文件导入数据库
var fs = require('fs')
var db = require('../database/index');
router.get('/insert', function (req, res, next) { //注意要添加,和[]
    fs.readFile('histories.json', function (err, data) {
      if (err) {
        console.log(err)
        return res.send('文件读取失败');
      }
      var person = data.toString();//将二进制的数据转换为字符串
      person = JSON.parse(person);//将字符串转换为json对象
      var a = person
      var b = a.sort((c, b) => { return (c.date > b.date) ? 1 : -1 });
      for (var n = 0; n < 147; n++) {
        (function (i) {
          setTimeout(function () {
            db.querySQL({
              sql: "INSERT INTO music (mid,date,week,ncmid,state,showname,realname,artist,con_uid,con_user) VALUES (?,?,?,?,?,?,?,?,?,?)",
              values: [null, b[i].date, b[i].week, b[i].ncmid, b[i].state, b[i].showname, b[i].realname, b[i].artist, null, null],
              timeout: 40000,
            }, function (error, result) {
              if (error) {
                console.log(error)
              }
            })
          }, 2000 * i);
        })(n)
  
      }
      return res.json({ msg: "ok", data: b })
    });
  });