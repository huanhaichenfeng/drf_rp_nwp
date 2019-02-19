var connection = require('../model/baseDb')
var md5 = require('blueimp-md5')
var common = require('../common.js')
module.exports = {
  getRegisterPage(req, res) { //访问注册页面 
    if (req.session.islogin) {
      res.render('./user/register', {
        islogin: req.session.islogin, //如果保存了登录状态，则获取到的是true，如果没有保存则获取到的是一个undefined
        user: req.session.user, // 登录人信息
      })
    } else {
      res.render('./user/login')
    }
  },
  postRegisterPage(req, res) { //用户注册
    console.log(req.body)
    var valuser = req.body.username;
    var valpwd = req.body.password;
    var pwdSalt = md5(valpwd, common.pwdSalt)
    var queryuserSql = "select username from users where username='" + valuser + "'"; // 用户查询sql
    var registerpageSql = "INSERT users(username,password) VALUES ('" + valuser + "','" + pwdSalt + "')"; // 用户插入sql
    connection.query(queryuserSql, (err, results) => {
      if (err) throw err;
      if (results.length === 0) {
        connection.query(registerpageSql, (err, results) => {
          if (err) throw err;
          res.json({
            err_code: 1
          })
        })
      } else {
        res.json({
          err_code: 0,
          msg: "该用户名已经注册！！！"
        })
      }
    })

  },
  getLoginPage(req, res) { //访问登录页面
    res.render('./user/login')
  },
  postLoginPage(req, res) { //用户登录
    var loguser = req.body.username;
    var logpwd = req.body.password;
    var pwdSalt = md5(logpwd, common.pwdSalt)
    // console.log(loguser)
    // console.log(logpwd)
    var queryuserSql = "select username,password from users where username='" + loguser + "' and password='" + pwdSalt + "'"; // 用户查询sql
    connection.query(queryuserSql, (err, results) => {
      if (err) throw err;
      if (results.length === 0) { // 登录失败
        res.json({
          err_code: 0,
          msg: "用户名或密码错误！！！"
        })
      } else { // 登录成功
        // 将登录成功的状态保存到了 req.session 中
        req.session.islogin = true
        // 将当前登录人的信息对象，保存到 req.session 中
        req.session.user = results
        req.session.username = results[0].username
        // console.log(req.session)
        res.json({
          err_code: 1
        })
      }
    })
  },
  logout(req, res) { // 注销登录
    req.session.destroy((err) => {
      if (err) throw err;
      // 使用服务器端重定向
      res.redirect('/login')
    })
  },
  respwd(req, res) { // 展示密码重置页面
    if (req.session.islogin) {
      res.render('./respassword', {
        islogin: req.session.islogin, //如果保存了登录状态，则获取到的是true，如果没有保存则获取到的是一个undefined
        user: req.session.user, // 登录人信息
      })
    } else {
      res.render('./user/login')
    }
  },
  respassword(req, res) {
    // var resval = req.body;
    var user = req.session.user
    var username = user[0].username
    var valpwd = req.body.oldpassword // 旧密码
    var newvalpwd = req.body.newpassword // 新密码
    var pwdSalt = md5(valpwd, common.pwdSalt)
    var newpwdSalt = md5(newvalpwd, common.pwdSalt)
    var selctsql = "select password from  users where username='"+username+"'"
    var delsqlpwd = "DELETE FROM users WHERE username='"+username+"'"
    var inssqlpwd = "INSERT users(username,password) VALUES ('" + username + "','" + newpwdSalt + "')";
    connection.query(selctsql, (err, results) => {
      if(results[0].password === pwdSalt){
        connection.query(delsqlpwd, (err, results) => {
          connection.query(inssqlpwd, (err, results) => {
            res.json({
              err_code:1
            })
          })
        })
      }else{
        res.json({
          err_code:0
        })
      }
    })
   
  }
}