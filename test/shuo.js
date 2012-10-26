var queuedo=require("queuedo");
var Douban = require("../lib/index.js");
var formatjson = require('formatjson');

module.exports = function(req, res) {
    var config = {
        app_key:"0bb4b9fc67f9b013231e2df537ed1039",
        app_secret:"e7434521cb0c70ad",
        redirect_uri:"http://localhost:8080/sina_auth_cb",
        access_token:req.cookies.token
    }
    var api = new Douban(config);
    var datas=[
        
    ]
    
    var functions=[
    function(callback){
        api.shuo.statuses({
            source:config.app_key,
            text:"hello nodejs"+Math.random()
        },function(error,data){
            datas.push({
                api:"shuo.statuses",
                data:formatjson(data)
            });
            callback();
        });
    }, function(callback){
        api.shuo.home_timeline({},function(error,data){
            datas.push({
                api:"shuo.home_timeline",
                data:formatjson(data)
            })
            callback();
        });
    }, function(callback){
        api.shuo.user_timeline({
            screen_name:"mier963"
        },function(error,data){
            datas.push({
                api:"shuo.user_timeline",
                data:formatjson(data)
            })
            callback();
        });
    },function(callback){
        api.shuo.get({
            id:"1033045250"
        },function(error,data){
            datas.push({
                api:"shuo.get",
                data:formatjson(data)
            })
            callback();
        });
    },function(callback){
        api.shuo.del({
            id:"1033031694"
        },function(error,data){
            datas.push({
                api:"shuo.del",
                data:formatjson(data)
            })
            callback();
        });
    }];
    queuedo(functions,function(func,next,context){
        func(function(){
            next.call(context);
        });
    },function(){
        res.render("shuo.html",{
            data:datas
        })
    });
}