var connection = require('../model/baseDb')
var path = require('path')
var fs = require('fs')
var moment = require('moment');
// 1. 导入 formidable 帮助解析文件上传
var formidable = require('formidable')
module.exports = {
  showIndexPage(req, res) { //主页展示
    if (req.session.islogin) {
      var user = req.session.user
      var username = user[0].username
      if (username === 'admin') {
        var indexSql = "select Farm_ID from concenterinfo";
        connection.query(indexSql, (err, results) => {
          if (err) throw err;
          // console.log(results);
          res.render('./index', {
            islogin: req.session.islogin, //如果保存了登录状态，则获取到的是true，如果没有保存则获取到的是一个undefined
            user: req.session.user, // 登录人信息
            sales: results,
            code: 1
          })
        })
      } else {
        var user = req.session.user
        var username = user[0].username
        var indexSql1 = "select Farm_ID from station where username='" + username + "'";
        connection.query(indexSql1, (err, results) => {
          if (err) throw err;
          // console.log(results);
          res.render('./index', {
            islogin: req.session.islogin, //如果保存了登录状态，则获取到的是true，如果没有保存则获取到的是一个undefined
            user: req.session.user, // 登录人信息
            sales: results,
            code: 1
          })
        })
      }
    } else {
      res.render('./user/login')
    }
  },
  uploading(req, res) { // 展示收资上传页面
    // 删除错误文件
    fs.readdir(path.join(__dirname, '../static/file/'), (err, filenames) => {
      if (err) throw err;
      filenames.forEach(filename => {
        // routerPath 是每个路由模块对应的require时候的path
        var routerPath = path.join(__dirname, '../static/file/', filename);
        if (fs.statSync(routerPath).isDirectory()) { // recurse
          // console.log(routerPath)
        } else { // delete file
          fs.unlinkSync(routerPath);
        }
      })
    })
    if (req.session.islogin) {
      if (req.session.username === 'admin') {
        var queryfilessql = "select * from fileslog ORDER BY createdAt DESC"
        connection.query(queryfilessql, (err, results) => {
          // 对取出的时间进行格式化
          for (var i = 0; i < results.length; i++) {
            // console.log(moment(results[i].createdAt).format('YYYY-MM-DD HH:mm:ss'));
            results[i].createdAt = moment(results[i].createdAt).format('YYYY-MM-DD HH:mm:ss')
          }
          res.render('./uploading', {
            islogin: req.session.islogin, //如果保存了登录状态，则获取到的是true，如果没有保存则获取到的是一个undefined
            user: req.session.user, // 登录人信息
            sales: results
          })
        })
      } else {
        var queryfilessql = "select * from fileslog where username='" + req.session.username + "' ORDER BY createdAt DESC"
        // console.log(queryfilessql)
        connection.query(queryfilessql, (err, results) => {
          // console.log(results)
          // 对取出的时间进行格式化
          for (var i = 0; i < results.length; i++) {
            // console.log(moment(results[i].createdAt).format('YYYY-MM-DD HH:mm:ss'));
            results[i].createdAt = moment(results[i].createdAt).format('YYYY-MM-DD HH:mm:ss')
          }
          res.render('./uploading', {
            islogin: req.session.islogin, //如果保存了登录状态，则获取到的是true，如果没有保存则获取到的是一个undefined
            user: req.session.user, // 登录人信息
            sales: results
          })
        })
      }
    } else {
      res.render('./user/login')
    }
  },
  upload(req, res) { // 收资上传实现
    //创建一个formidable类型的form表单接收数据
    var form = new formidable.IncomingForm();
    //设置上传路径
    form.uploadDir = path.join(__dirname, '../static/file')
    //保留文件上传时候的后缀名
    form.keepExtensions = true;
    //设置普通表单键值对的编码格式
    form.encoding = 'utf-8';
    //通过form.parse 解析post过来的数据，参数一错误对象，参数二解析出来的普通键值对信息，参数三解析出来的文件数据
    form.parse(req, (err, fields, files) => {
      // console.log(files.file.name)
      // console.log(fields.stationname)
      if (files.file.name !== '' && fields.stationname !== '') {
        // 用户路径
        var userpath = path.resolve(__dirname, '../static/file/' + fields.username);
        console.log(userpath)
        // 判断路径是否存在，并将文件移动存入
        fs.exists(userpath, function (exists) {
          // 时间戳
          var t1 = (new Date()).getTime();
          var t = moment(t1).format('YYYY-MM-DD_HH_mm_ss');
          // 文件名称
          var filename = files.file.name.split(".", 1)
          // 扩展名
          var extname = path.extname(files.file.name);
          // 新的文件名称
          var newfilename = t + filename + extname;
          // 旧的路径
          var oldpath = path.normalize(files.file.path);
          var oldpath1 = path.resolve(__dirname, '../static/file/' + fields.username + "/" + newfilename);
          // 新路径
          var newpath = path.resolve(__dirname, '../static/newfile/' + newfilename);
          if (exists) {
            console.log('目录存在');
            // 文件读取写入
            fs.rename(oldpath, oldpath1, function (err) {
              if (err) {
                console.error("改名失败" + err);
                console.error("改名失败" + err);
              } else {
                // 文件的读取和写入
                var readStream = fs.createReadStream(oldpath1);
                var writeStream = fs.createWriteStream(newpath);
                readStream.pipe(writeStream);
                console.log("移动完成")
                console.error("改名成功");
                // 文件入库日志保存
                // console.log(fields)
                var filesSql = "INSERT fileslog(username,filename,stationname,remark) VALUES ('" + fields.username + "','" + fields.filename + "','" + fields.stationname + "','" + fields.remark + "')"
                // console.log(filesSql)
                connection.query(filesSql, (err, results) => {
                  if (err) throw err;
                  // console.log(results);
                  // 日志保存成功后根据用户查询最新数据
                  if (req.session.username === 'admin') {
                    var queryfilessql = "select * from fileslog ORDER BY createdAt DESC"
                    connection.query(queryfilessql, (err, results) => {
                      // 对取出的时间进行格式化
                      for (var i = 0; i < results.length; i++) {
                        results[i].createdAt = moment(results[i].createdAt).format('YYYY-MM-DD HH:mm:ss')
                      }
                      // console.log(results);
                      res.json({
                        err_code: 0,
                        results: results
                      });
                    })
                  } else {
                    var queryfilessql = "select * from fileslog where username='" + req.session.username + "' ORDER BY createdAt DESC"
                    connection.query(queryfilessql, (err, results) => {
                      // 对取出的时间进行格式化
                      for (var i = 0; i < results.length; i++) {
                        results[i].createdAt = moment(results[i].createdAt).format('YYYY-MM-DD HH:mm:ss')
                      }
                      // console.log(results);
                      res.json({
                        err_code: 0,
                        results: results
                      });
                    })
                  }

                })
              }
            });
          } else {
            // 创建目录
            fs.mkdir(userpath, function (error) {
              if (error) {
                console.log(error);
                return false;
              }
              console.log('创建目录成功');
              // 文件读取写入
              fs.rename(oldpath, oldpath1, function (err) {
                if (err) {
                  console.error("改名失败" + err);
                } else {
                  // 文件的读取和写入
                  var readStream = fs.createReadStream(oldpath1);
                  var writeStream = fs.createWriteStream(newpath);
                  readStream.pipe(writeStream);
                  console.log("移动完成")
                  console.error("改名成功");
                  // 文件入库日志保存
                  // console.log(fields)
                  var filesSql = "INSERT fileslog(username,filename,stationname,remark) VALUES ('" + fields.username + "','" + fields.filename + "','" + fields.stationname + "','" + fields.remark + "')"
                  // console.log(filesSql)
                  connection.query(filesSql, (err, results) => {
                    if (err) throw err;
                    // console.log(results);
                    // 日志保存成功后根据用户查询最新数据
                    if (req.session.username === 'admin') {
                      var queryfilessql = "select * from fileslog ORDER BY createdAt DESC"
                      connection.query(queryfilessql, (err, results) => {
                        // 对取出的时间进行格式化
                        for (var i = 0; i < results.length; i++) {
                          results[i].createdAt = moment(results[i].createdAt).format('YYYY-MM-DD HH:mm:ss')
                        }
                        // console.log(results);
                        res.json({
                          err_code: 0,
                          results: results
                        });
                      })
                    } else {
                      var queryfilessql = "select * from fileslog where username='" + req.session.username + "' ORDER BY createdAt DESC"
                      connection.query(queryfilessql, (err, results) => {
                        // 对取出的时间进行格式化
                        for (var i = 0; i < results.length; i++) {
                          results[i].createdAt = moment(results[i].createdAt).format('YYYY-MM-DD HH:mm:ss')
                        }
                        // console.log(results);
                        res.json({
                          err_code: 0,
                          results: results
                        });
                      })
                    }
                  })
                }
              });

            })
          }
        })
      } else {
        res.json({
          err_code: 2
        })
      }
    })
  },
  usermanagement(req, res) { // 展示用户管理
    if (req.session.islogin) {
      if (req.session.username === 'admin') {
        var usersql = "select username from users where username != 'admin'";
        var station = "select Farm_ID from concenterinfo"
        connection.query(usersql, (err, results1) => {
          connection.query(station, (err, results2) => {
            res.render('./usermanagement', {
              islogin: req.session.islogin, //如果保存了登录状态，则获取到的是true，如果没有保存则获取到的是一个undefined
              user: req.session.user, // 登录人信息
              user1: results1,
              station: results2,
            })
          })
        })
      } else {
        res.json({
          err_code: 1,
          msg: '无权限访问该页面！！！'
        })
      }
    } else {
      res.render('./user/login')
    }
  },
  user_manage(req, res) { // 根据用户查询显示场站
    var newuser_manager = req.body;
    var username = newuser_manager.username.replace(/\s+/g, "")
    var querySql = "select * from station where username='" + username + "'"
    // console.log(newuser_manager)
    connection.query(querySql, (err, results) => {
      // console.log(results)
      if (results.length === 0) {
        res.json({
          err_code: 0
        })
      } else {
        res.json({
          err_code: 1,
          checek: results
        })
      }
    })
  },
  user_success(req, res) { // 用户管理提交
    var valsuccess = req.body;
    var username = req.body.username
    // console.log(valsuccess.station)
    str = valsuccess.station
    strs = str.split("|");
    console.log(strs.shift())
    console.log(strs.pop())
    console.log(strs)
    // 删除数据中原有数据
    var deluserSql = "DELETE FROM station WHERE username='" + username + "'"
    connection.query(deluserSql, (err, results) => {
      for (i = 0; i < strs.length; i++) {
        // 插入新的数据
        var strsSql = "insert station(username,Farm_ID) VALUES ('" + username + "','" + strs[i] + "')"
        // console.log(strsSql)
        connection.query(strsSql, (err, results) => {
          // console.log(results)
        })
      }
      res.json({
        err_code: 1
      })
    })
  },
  user_delete(req,res){ // 用户删除提交
    var user_dete = req.body;
    var username = user_dete.username.replace(/\s+/g, "")
    var user_dete_sql = "DELETE FROM users WHERE username='"+username+"'"
    var station_dete_sql = "DELETE FROM station WHERE username='"+username+"'"
    connection.query(user_dete_sql, (err, results) => {
      connection.query(station_dete_sql, (err, results) => {
        res.json({
          err_code:1
        })
      })
    })
  }
}