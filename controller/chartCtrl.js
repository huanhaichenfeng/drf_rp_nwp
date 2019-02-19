// var indexSql = require('../model/indexModel')
var connection = require('../model/baseDb')
module.exports = {
  showChart_time(req, res) { // 展示实际功率对比曲线页面
    if (req.session.islogin) {
      var id = req.query.id;
      // console.log(queryId)
      // 拼接表名称
      var tblChart = 'v_' + id + '_newxby_nwprp'
      // console.log(showChart_timeName)
      // 数据查询
      var showChart_timeSql = "select Date_Time,speed70,direction70,temperature70,RealPower from" + ' ' + tblChart + ' ' + "ORDER BY Date_Time DESC LIMIT 96";
      // console.log(showChart_timeSql)
      connection.query(showChart_timeSql, (err, results) => {
        if (err) throw err;
        // console.log(results);
        res.render('./chart_time', {
          islogin: req.session.islogin, //如果保存了登录状态，则获取到的是true，如果没有保存则获取到的是一个undefined
          user: req.session.user, // 登录人信息
          sales: results,
          id: id
        })
      })
    } else {
      res.render('./user/login')
    }
  },
  query_id(req, res) { // 根据 集电线编号跳转功能
    var valId = req.body.valid.toUpperCase().replace(/\s+/g, "");
    // console.log(valId)
    // 查询id是否存在
    var queryId = "select Farm_ID from concenterinfo WHERE Farm_ID='" + valId + "'";
    // console.log(queryId)
    connection.query(queryId, (err, result) => {
      if (err) throw err;
      // console.log(result.length);
      if (result.length === 0) {
        res.json({
          code: 0
        })
      } else {
        res.json({
          valId: valId,
          code: 1
        })
      }
    })
  },
  showChart(req, res) { // 实际功率对比曲线-条件查询
    var newChart = req.body;
    var tblChart = 'v_' + newChart.id + '_newxby_nwprp';
    var hight = newChart.speed.substr(5, 2);
    var speed = "speed" + hight;
    var direction = "direction" + hight;
    var temperature = "temperature" + hight;
    var start = newChart.start + "_00:00:00";
    var end = newChart.end + "_23:45:00";
    var showChart_querySql = "select Date_Time," + newChart.speed + "," + direction + "," + temperature + ",RealPower from " + tblChart + ' ' + "where Date_Time >='" + start + "' and Date_Time < '" + end + "'";
    // console.log(showChart_querySql);
    connection.query(showChart_querySql, (err, results) => {
      if (err) throw err;
      for (var i = 0; i < results.length; i++) {
        var obj = results[i];
        var arr = [];
        // 复制带层高的值一份，重新命名添加
        for (var k in obj) {
          arr.push(obj[k])
          obj['speed'] = arr[1]
          obj['direction'] = arr[2]
          obj['temperature'] = arr[3]
        }
        console.log(obj)
      }
      // console.log("--------------------------")
      console.log(results)

      res.json({
        err_code: 0,
        results: results
      });
    })
  },
  TshowChart(req, res) { // 展示特性曲线展示页面
    if(req.session.islogin){
      var id = req.query.id;
    // console.log(queryId)
    // 拼接表名称
    var tblChart = 'v_' + id + '_newxby_nwprp'
    // console.log(showChart_timeName)
    // 数据查询
    var showChart_timeSql = "select * from (select Date_Time,speed70,direction70,temperature70,RealPower from" + ' ' + tblChart + ' ' + "ORDER BY Date_Time DESC LIMIT 96) t ORDER BY speed70 ASC";
    console.log(showChart_timeSql)
    connection.query(showChart_timeSql, (err, results) => {
      if (err) throw err;
      // console.log(results);
      res.render('./chart', {
        islogin: req.session.islogin, //如果保存了登录状态，则获取到的是true，如果没有保存则获取到的是一个undefined
        user: req.session.user, // 登录人信息
        sales: results,
        id: id
      })
    })
    }else{
      res.render('./user/login')
    }
  },
  TChart(req, res) { // 特性曲线展示-条件查询
    var newChart = req.body;
    var tblChart = 'v_' + newChart.id + '_newxby_nwprp';
    var hight = newChart.speed.substr(5, 2);
    var speed = "speed" + hight;
    var direction = "direction" + hight;
    var temperature = "temperature" + hight;
    var start = newChart.start + "_00:00:00";
    var end = newChart.end + "_23:45:00";
    var showChart_querySql = "select * from (select Date_Time," + newChart.speed + "," + direction + "," + temperature + ",RealPower from " + tblChart + ' ' + "where Date_Time >='" + start + "' and Date_Time < '" + end + "') t ORDER BY " + speed + " ASC";
    // console.log(showChart_querySql);
    connection.query(showChart_querySql, (err, results) => {
      if (err) throw err;
      for (var i = 0; i < results.length; i++) {
        var obj = results[i];
        var arr = [];
        // 复制带层高的值一份，重新命名添加
        for (var k in obj) {
          arr.push(obj[k])
          obj['speed'] = arr[1]
          obj['direction'] = arr[2]
          obj['temperature'] = arr[3]
        }
        console.log(obj)
      }
      // console.log("--------------------------")
      console.log(results)

      res.json({
        err_code: 0,
        results: results
      });
    })
  }
}