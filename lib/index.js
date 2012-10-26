var querystring = require('querystring');
var https = require('https');
var path = require("path");
var fs = require('fs');
var underscore = require("underscore");
var md5 = require("MD5");
var request = require('request');
var FormData = require('form-data');

var apiGroup={
    note:{
        scope:['community_basic_note',"douban_basic_common","community_basic_user","community_basic_photo"],
        methods:[{
                name:"publish",
                type:"POST",
                path:"/v2/notes"
            },{
                name:"delete",
                type:"DELETE",
                path:"/v2/note/{{id}}"
            },{
                name:"update",
                type:"PUT",
                path:"/v2/note/{{id}}"
            },{
                name:"upload",
                type:"POST",
                path:"/v2/note/{{id}}"
            },{
                name:"get",
                type:"GET",
                path:"/v2/note/{{id}}"
            },{
                name:"getComments",
                type:"GET",
                path:"/v2/note/{{id}}/comments"
            },{
                name:"getComment",
                type:"GET",
                path:"/v2/note/{{id}}/comments/{{comment_id}}"
            },{
                name:"setComment",
                type:"POST",
                path:"/v2/note/{{id}}/comments"
            },{
                name:"deleteComment",
                type:"DELETE",
                path:"/v2/note/{{id}}/comments/{{comment_id}}"
            },{
                name:"like",
                type:"POST",
                path:"/v2/note/{{id}}/like"
            },{
                name:"unlike",
                type:"DELETE",
                path:"/v2/note/{{id}}/like"
            },{
                name:"gets",
                type:"GET",
                path:"/v2/note/user_created/{{id}}"
            },{
                name:"liked",
                type:"GET",
                path:"/v2/note/user_liked/{{id}}"
            }]
    },
    shuo:{
        scope:["douban_basic_common","shuo_basic_w","shuo_basic_r"],
        methods:[
            {
                name:"statuses",
                type:"POST",
                path:"/shuo/v2/statuses/"
            },
            {
                name:"home_timeline",
                type:"GET",
                path:"/shuo/v2/statuses/home_timeline"
            },
            {
                name:"user_timeline",
                type:"GET",
                path:"/shuo/v2/statuses/user_timeline/{{screen_name}}"
            },
            {
                name:"get",
                type:"GET",
                path:"/shuo/v2/statuses/{{id}}"
            },
            {
                name:"del",
                type:"DELETE",
                path:"/shuo/v2/statuses/{{id}}"
            },{
                name:"getComments",
                type:"GET",
                path:"/shuo/v2/statuses/{{id}}/comments"
            },
            {
                name:"addComments",
                type:"POST",
                path:"/shuo/v2/statuses/{{id}}/comments"
            },
            {
                name:"getComment",
                type:"GET",
                path:"/shuo/v2/statuses/comment/{{id}}"
            },
            {
                name:"delComment",
                type:"DELETE",
                path:"/shuo/v2/statuses/comment/{{id}}"
            },
            {
                name:"reshare",
                type:"POST",
                path:"/shuo/v2/statuses/{{id}}/reshare"
            },
            {
                name:"reshares",
                type:"GET",
                path:"/shuo/v2/statuses/{{id}}/reshare"
            },{
                name:"like",
                type:"POST",
                path:"/shuo/v2/statuses/{{id}}/like"
            },{
                name:"likes",
                type:"GET",
                path:"/shuo/v2/statuses/{{id}}/like"
            },{
                name:"unlike",
                type:"DELETE",
                path:"/shuo/v2/statuses/{{id}}/like"
            },{
                name:"following",
                type:"GET",
                path:"/shuo/v2/users/{{id}}/following"
            },{
                name:"followers",
                type:"GET",
                path:"/shuo/v2/users/{{id}}/followers"
            },{
                name:"follow_in_common",
                type:"GET",
                path:"/shuo/v2/users/{{id}}/follow_in_common"
            },{
                name:"following_followers_of",
                type:"GET",
                path:"/shuo/v2/users/{{id}}/following_followers_of"
            },{
                name:"search",
                type:"GET",
                path:"/shuo/v2/users/search"
            },{
                name:"block",
                type:"POST",
                path:"/shuo/v2/users/{{id}}/block"
            },{
                name:"follow",
                type:'POST',
                path:"/shuo/v2/friendships/create"
            },{
                name:"unfollow",
                type:"POST",
                path:"/shuo/v2/friendships/destroy"
            },{
                name:"friendships",
                type:"GET",
                path:"/shuo/v2/friendships/show"
            }
        ]
    }
}
var Douban = function(options){
    this.options = { 
        app_key:null,
        app_secret:null,
        access_token:null,
        user_id:0,
        refresh_token:null,
        format:"JSON",
        redirect_uri:"",
        api_group:[],
        scope:""
    };
    
    underscore.extend(this.options, options);
    //根据api_group自动生成scope
    var scopes=[]
    this.options.api_group.forEach( function (v) {
        if(apiGroup[v]){
            scopes=scopes.concat(apiGroup[v].scope);
        };
    });
    underscore.uniq(scopes);
    this.options.scope=scopes.join(",");
    this.base=this._base();
    this.oauth=this._oauth();
    this.note=this._note();
    this.shuo=this._shuo();
}
Douban.prototype = {
    API_BASE_URL: 'https://api.douban.com',
    API_HOST: 'api.douban.com',
};
Douban.prototype._base = function () {
    var self = this;
    return {
        _post:function (options, callback,isMulti) {
            if (self.options.access_token) {
                options['access_token'] = self.options.access_token;
            }
            //            options['format'] = "JSON";
            //            options['v'] = "1.0";
            //            var keys = [], sig = "";
            //            for (var i in options) {
            //                keys.push(i);
            //            }
            //            keys.sort();
            //            keys.forEach(function (k) {
            //                if(k=="upload") return;
            //                sig += k + "=" + options[k]
            //            })
            //            sig += self.options.app_secret;
            //            options['sig'] = md5(sig);
            if(isMulti){
                var form = new FormData();
                for (var i in options) {
                    if (i=="upload") {
                        form.append('upload', fs.createReadStream(options[i]));
                    } else {
                        form.append(i, options[i].replace(/__multi__/g, ""));
                    }
                };
                form.submit(self.API_BASE_URL, function(err, res) {
                    var chunks=[];
                    var size=0;
                    res.on("data",function (chunk) {
                        chunks.push(chunk);
                        size += chunk.length;
                    })
                    res.on("end",function () {
                        switch (chunks.length) {
                            case 0:
                                data = new Buffer(0);
                                break;
                            case 1:
                                data = chunks[0];
                                break;
                            default:
                                data = new Buffer(size);
                                for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {
                                    chunks[i].copy(data, pos);
                                    pos += chunks[i].length;
                                }
                                break;
                        }
                        callback({}, data.toString())
                    })
                    res.on("close", function(data) {
                        callback({error:data}, data.toString())
                    })
                });
            } else {
                var post_body = querystring.stringify(options);
                //用此方法可以传入多个相同名字的参数数组。
                post_body = post_body.replace(/__multi__/g, "");
                request.post({
                    headers:{
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    url: self.API_BASE_URL,
                    body: post_body
                }, function (e, r, body) {
                    callback && callback({}, body);
                });
            }
        },
        _get:function (options, callback) {
            if (self.options.access_token) {
                options['access_token'] = self.options.access_token;
            }
            var opts = {
                host:self.API_HOST,
                path:"" + '?' + querystring.stringify(options),
                method:'GET'
            };
            
            self._request(opts, null, function(e,r,body){
                callback(r,body)
            });
        },
        _request:function (options, post_body, callback) {
            var data = '';
            var req = https.request(options, function (res) {
                var chunks = [], size = 0;
                res.on('data', function (chunk) {
                    size += chunk.length;
                    chunks.push(chunk);
                });
                res.on('end', function () {
                    var data = null;
                    switch (chunks.length) {
                        case 0:
                            data = new Buffer(0);
                            break;
                        case 1:
                            data = chunks[0];
                            break;
                        default:
                            data = new Buffer(size);
                            for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {
                                chunks[i].copy(data, pos);
                                pos += chunks[i].length;
                            }
                            break;
                    }
                    console.log(data.toString())
                    callback({},JSON.parse(data.toString()));
                });
            });
            //   req.write(post_body);
            req.on('error', callback);
            req.end(post_body);
        }
    }
};
Douban.prototype._oauth = function () {
    var self = this;
    return {
        //生成authorize url
        authorize:function () {
            var options = {
                client_id:self.options.app_key,
                response_type:"code",
                redirect_uri:self.options.redirect_uri,
                scope:self.options.scope
            };
            return  'https://www.douban.com/service/auth2/auth?' + querystring.stringify(options);
        },
        //用code换取accesstoken
        accesstoken:function (code, callback) {
            var options = {
                grant_type:"authorization_code",
                code:code,
                client_id:self.options.app_key,
                client_secret:self.options.app_secret,
                redirect_uri:self.options.redirect_uri
            };
            /**
             * {
    "access_token": "10000|5.a6b7dbd428f731035f771b8d15063f61.86400.1292922000-222209506",
    "expires_in": 87063,
    "refresh_token": "10000|0.385d55f8615fdfd9edb7c4b5ebdc3e39-222209506",
    "scope": "read_user_album read_user_feed"
}
             */
            var post_body = querystring.stringify(options);
            var headers = {};
            headers ["Content-length"] = post_body ? post_body.length : 0;
            headers ["Content-Type"] = 'application/x-www-form-urlencoded';
            var opts = {
                host:"www.douban.com",
                path:'/service/auth2/token',
                method:'POST',
                headers:headers
            };
            self.base._request(opts, post_body, callback);
        }  
    }
};

Douban.prototype._note=function(){
    var self=this;
    var note={}
    apiGroup.note.methods.forEach(function (m) {
        note[m.name] = function (options, callback) {
            var path =  self.API_BASE_URL+m.path;
            for(var i in options){
                if(path.indexOf("{{"+i+"}}")!=-1){
                    path=path.replace("{{"+i+"}}",options[i])
                    delete options[i]
                }
            }
        //    options['source']=self.options['app_key']
            var body=""
            if(m.type=="GET"){
                path+="?"+ querystring.stringify(options)
            }
            if(m.type=="POST"||m.type=="PUT"){
                body=querystring.stringify(options)
            }
              var headers = {};
            headers ["Content-length"] = body ? body.length : 0;
            headers ["Content-Type"] = 'application/x-www-form-urlencoded';
            headers ['Authorization'] = "Bearer "+self.options.access_token
            request({
                url:path,
                method:m.type,
                body:body,
                headers:headers
            },function (e, r, body) {
                callback && callback({}, body);
            })
        }
    });
    return note;
}
Douban.prototype._shuo=function(){
    var self=this;
    var shuo={}
    apiGroup.shuo.methods.forEach(function (m) {
        shuo[m.name] = function (options, callback) {
            var path =  self.API_BASE_URL+m.path;
            for(var i in options){
                if(path.indexOf("{{"+i+"}}")!=-1){
                    path=path.replace("{{"+i+"}}",options[i])
                    delete options[i]
                }
            }
        //    options['source']=self.options['app_key']
            var body=""
            if(m.type=="GET"){
                path+="?"+ querystring.stringify(options)
            }
            if(m.type=="POST"||m.type=="PUT"){
                body=querystring.stringify(options)
            }
            var headers = {};
            headers ["Content-length"] = body ? body.length : 0;
            headers ["Content-Type"] = 'application/x-www-form-urlencoded';
            headers ['Authorization'] = "Bearer "+self.options.access_token
            request({
                url:path,
                method:m.type,
                body:body,
                headers:headers
            },function (e, r, body) {
                callback && callback({}, body);
            })
        }
    });
    return shuo;
}
exports = module.exports = Douban;
