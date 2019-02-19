var express = require('express');
var router = express.Router();
var userCtrl = require('../controller/userCtrl')
router
  .get('/register',userCtrl.getRegisterPage) //访问注册页面
  .post('/postregister',userCtrl.postRegisterPage) //用户注册
  .get('/login',userCtrl.getLoginPage) //访问登录页面
  .post('/postlogin',userCtrl.postLoginPage) //用户登录
  .get('/logout',userCtrl.logout) // 注销
  .get('/respwd',userCtrl.respwd) // 密码重置展示
  .post('/respassword',userCtrl.respassword) // 密码重置

module.exports = router;