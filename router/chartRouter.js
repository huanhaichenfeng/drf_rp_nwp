var express = require('express');
var router = express.Router();
var chartCtrl = require('../controller/chartCtrl')
router
  .get('/chart_time',chartCtrl.showChart_time) // 对比曲线展示
  .post('/query_id',chartCtrl.query_id) // 根据集电线编号跳转
  .post('/query_chart_time',chartCtrl.showChart) // 条件查询

  .get('/chart',chartCtrl.TshowChart) // 特性曲线图
  .post('/query_chart',chartCtrl.TChart) // 条件查询

  module.exports = router;