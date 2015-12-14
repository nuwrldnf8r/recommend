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



//domain, listname, userid, list
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

//domain, listname, userid
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

server.get('/recommendation/:domain/:listname/item/:itemid', function(req,res,next){
    var domain = req.params.domain;
    var listname = req.params.listname;
    var itemid = req.params.itemid;

    recommendation.getRecommendationForItem(domain,listname,itemid,function(err,ret){
        if(!err){
            res.send(ret);
        }
        else{
            res.send({error:err});
        }
    });
});



server.listen(config.service.port);






