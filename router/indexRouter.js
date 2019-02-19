var express = require('express');
var router = express.Router();
var indexCtrl = require('../controller/indexCtrl');

router
  .get('/', indexCtrl.showIndexPage) // 主页跳转
  .get('/uploading',indexCtrl.uploading) // 收资上传
  .post('/upload',indexCtrl.upload) // 文件上传
  .get('/usermanagement',indexCtrl.usermanagement) // 用户管理
  .post('/user_manage',indexCtrl.user_manage) // 用户管理
  .post('/user_success',indexCtrl.user_success) // 用户管理提交
  .post('/user_delete',indexCtrl.user_delete) // 用户管理提交

module.exports = router;