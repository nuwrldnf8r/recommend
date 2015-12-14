/**
 * Created by Gavin on 5/11/15.
 */
var restify = require('restify');
var request = require('request');
var recommendation = require('./lib/recommendation');
var config = require('./lib/config');



var server = restify.createServer({
    name: 'RecommendServer',
    version: '0.0.1'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());



//adds  a list of items to a user for a given action
server.post('/:domain/:listname/:userid', function(req,res,next){
    var list = req.params.list;
    if(typeof(list)==='string'){
        list = list.split(',');
    }

    var domain = req.params.domain;
    var listname = req.params.listname;
    var userid = req.params.userid;

    recommendation.add(domain,listname,userid,list,function(err,ret){
        if(!err){
            res.send({success:true});
            //pub.publish({domain: domain, listname: listname, userid: userid, timestamp: Date.now()});
        }
        else{
            res.send({error: err});
        }
    });

});

//returns a list of recommendations for a list of itemids eg: /recommendation/test/likes?list=1,2
//we would use this when we don't know who the user is
server.get('/recommendation/:domain/:listname', function(req,res,next){
    var list = req.params.list;
    var domain = req.params.domain;
    var listname = req.params.listname;

    if(list) {
        var itemlist = list.split(',');
        if(itemlist.length>0) {
            recommendation.getRecommendationForItems(domain, listname, itemlist, function (err, ret) {
                if (!err) {
                    res.send(ret);
                }
                else {
                    res.send({error: err});
                }
            });
        }
        else{
            res.send([]);
        }
    }
    else{
        res.send({error:'no list'});
    }
});

//returns a list of recommendations for a user (for a given domain and list)
server.get('/:domain/:listname/:userid', function(req,res,next){
    var domain = req.params.domain;
    var listname = req.params.listname;
    var userid = req.params.userid;

    recommendation.get(domain,listname,userid,function(err,ret){
        if(!err){
            res.send(ret);
        }
        else{
            res.send({error:err});
        }
    })

});



//returns a list of recommendations for a user
server.get('/recommendation/:domain/:listname/:userid', function(req,res,next){
    var domain = req.params.domain;
    var listname = req.params.listname;
    var userid = req.params.userid;

    recommendation.getRecommendations(domain,listname,userid,function(err,ret){
        if(!err){
            res.send(ret);
        }
        else{
            res.send({error:err});
        }
    });
});



server.listen(config.service.port);






