/**
 * Created by Gavin on 12/14/15.
 */
var request = require('request');

request.get('http://localhost:8080/recommendation/test/likes/item/2',function(err,ret,body){
    console.log(body);
});