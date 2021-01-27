var mysql = require('mysql');

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'ezxkl',
    port: 11073,
    timezone: "08:00"
});


function querySQL(sql, callback) {
    pool.getConnection(function (error, connection) {
        if (error) {
            callback(error, "");
        } else {
            connection.query(sql, function (error, result) {
                callback(error, result);
            });
            connection.release();//释放链接
        }
    });
}

exports.querySQL = querySQL;