var mysql = require('mysql');

var connection = mysql.createConnection({
  host: '47.104.145.176', // 地址
  port: '3306', //端口
  database: 'dremt', // 指定要连接的数据库名称
  user: 'root', // 登录名
  password: 'root' // 登录密码
});

module.exports=connection