/**
 * Created by Gavin on 5/25/15.
 */
var request = require('request');

request.post({url:'http://localhost:8080/test/likes/user1',json:true,body:{list:['2','3','5','7','23']}},function(err,ret,body){

    request.post({url:'http://localhost:8080/test/likes/user1',json:true,body:{list:['24']}},function(err,ret,body) {


        request.post({url:'http://localhost:8080/test/likes/user2',json:true,body:{list:['24','2','4','3','102']}},function(err,ret,body) {

            request.post({url:'http://localhost:8080/test/likes/user3',json:true,body:{list:['2','3','4','3','102','105']}},function(err,ret,body) {

                console.log(body);


            });


        });



    });

});