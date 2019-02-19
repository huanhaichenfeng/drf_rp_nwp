var fs = require('fs');
var path = require('path');

//导入express内置模块
var express = require('express');

//创建一个express服务器实例
var app = express();

//导入session 中间件
var session = require('express-session');

//注册session中间件
app.use(session({ // 这三属性是必须的
  secret:'huanhaichenfeng', // 加密session时候追加的加密字符串
  resave: false, // 是否允许session重新设置
  saveUninitialized:true //是否设置session在存储容器中可以给修改
}))

// 导入解析post 表单数据的中间件
var bodyParser = require('body-parser');
// 注册解析表单 post 数据的中间件
app.use(bodyParser.urlencoded({extended:false})); //默认使用原生解析，不使用第三方扩展

// 托管静态资源文件
app.use('/node_modules',express.static('node_modules'));
app.use('/static',express.static('static'));

// 设置模板引擎
app.set('view engine','ejs');

// 模板页面存放路径
app.set('views','./views')

// 自动注册路由
fs.readdir(path.join(__dirname,'./router'),(err,filenames)=>{
  if(err) throw err;
  filenames.forEach(filename => {
    // routerPath 是每个路由模块对应的require时候的path
    var routerPath = path.join(__dirname,'./router',filename);
    // 根据每个路由模块的路径，自动require 路由模块
    var requireModul = require(routerPath);
    // 根据自动 require 进来的路由模块，自动去注册这个路由模块
    app.use(requireModul)
  })
})


//指定端口号并启动服务器监听
app.listen(3000, function () {
console.log('Express server running at http://127.0.0.1:3000');
})