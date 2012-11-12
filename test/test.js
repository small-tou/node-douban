var Douban = require("../lib/index.js");
var underscore=require("underscore");
var path=require("path")
var config = {
    app_key:"0bb4b9fc67f9b013231e2df537ed1039",
    app_secret:"e7434521cb0c70ad",
    redirect_uri:"http://localhost:8080/sina_auth_cb",
    api_group: ["note","shuo","photo","album"]
}

var app_auth = {
    auth:function (req, res) {
        var api = new Douban(config);
        var auth_url = api.oauth.authorize();
        res.redirect(auth_url);
        res.end();
    },
    sina_auth_cb:function (req, res) {
        var code = req.query.code;
        var api = new Douban(config);
        api.oauth.accesstoken(code, function (error,data) {
            res.cookie("token", data.access_token);
            res.redirect('oauth');
            res.end();
        })

    }
}
//import some libs 
var express = require('express');
var cons = require('consolidate');
//init express app
var app = express();
app.use(express.logger({
    format:':method :url :status'
}));
//设置文件上传临时文件夹
app.use(express.bodyParser({
    uploadDir:'./uploads'
}));
app.use(express.cookieParser());
app.use(express.session({
    secret:'yutou'
}));
app.use(app.router);
app.use(express.errorHandler({
    dumpExceptions:true,
    showStack:true
}));
app.error = function (err, req, res) {
    console.log("500:" + err + " file:" + req.url)
    res.render('500');
}
//设置模板引擎为mustache，这里使用了consolidate库
app.engine("html", cons.mustache);
//设置模板路径
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('view options', {
    layout:false
})
app.listen("8080")
//获取authorize url
app.get("/auth", app_auth.auth)
//获取accesstoken ,存储，并设置userid到cookie
app.get("/sina_auth_cb", app_auth.sina_auth_cb)
//中间页面，提醒用户认证成功
app.get('/oauth', function (req, res) {
//    api.note.publish({
//        title:"created by nodejs!",
//        privacy:"public",
//        can_reply:"true",
//        content:"this is content!",
//        layout_pid:"L"
//    },function(error,data){
//        console.log(data)
//    })
//    
//    
    
res.render("oauth")
//    
//    api.note.like({
//        id:243112206
//    },function(error,data){
//        console.log(data)
//    })
//        api.note.get({
//        id:243112206
//    },function(error,data){
//        console.log(data)
//    })
//    api.note.setComment({
//        id:"243112206",
//        content:"test"
//    },function(error,data){
//        console.log(data)
//    })
////    
//    api.photos.upload({
//        upload:path.join(__dirname, "/test.jpg"),
//        caption:"upload by nodejs"
//    },function(error,data){
//        console.log(data)
//    })
    
});
app.get("/shuo",require("./shuo.js"));


app.get("/photo_upload",require("./photo_upload.js"));

