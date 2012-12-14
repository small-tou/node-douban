var Douban = require("../lib/index.js");
var formatjson = require('formatjson');
var path=require("path");
module.exports = function(req, res) {
  var config = {
    app_key:"0bb4b9fc67f9b013231e2df537ed1039",
    app_secret:"e7434521cb0c70ad",
    redirect_uri:"http://localhost:8080/sina_auth_cb",
    access_token:req.cookies.token
  }
  var api = new Douban(config);
  api.album.upload({
    id:38451353,
    desc:"hello nodejs",
    image:path.join(__dirname, "/test.jpg")
  },function(error,data){
    console.log(data)
    console.log(formatjson(data))
  });
}