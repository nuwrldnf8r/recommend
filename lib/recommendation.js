/**
 * Created by Gavin on 5/20/15.
 */
var elasticsearch = require('elasticsearch');
var config = require('./config');
var crypto = require('crypto');

var $ = {};

$.INDEX = 'recommendations';

$.esClient = new elasticsearch.Client({
    host: config.elastichost,
    maxSockets: Infinity
});

$.mappings = {};

$.getId = function(domain, listname, userid){
    var id = domain + '.' + listname + '.' + userid;
    var hash = crypto.createHash('md5');
    return hash.update(id).digest('hex');
};

$.addMappingForDomain = function(domain,callback){
    $.esClient.indices.putMapping(
        {
            index:$.INDEX,
            type:domain,
            ignoreConflicts: true,
            body: config.mapping

        },
        function(err,ret){
            if(err){

                $.esClient.indices.create({index: $.INDEX},function(err,ret){
                    if(!err){
                        $.esClient.indices.putMapping(
                            {
                                index:$.INDEX,
                                type:domain,
                                ignoreConflicts: true,
                                body: config.mapping

                            },
                            function(err,ret){
                                if(!err){
                                    callback(null,ret);
                                }
                                else{
                                    callback(err,null);
                                }
                            }
                        );
                    }
                    else{
                        callback(err,null);
                    }
                })
            }
            else{
                callback(null,ret);
            }

        }
    );
};

$.initialize = function(callback){
    $.esClient.indices.getMapping({index: $.INDEX},function(err,ret){
        if(!err){
            if(ret[$.INDEX] && ret[$.INDEX]['mappings']){
                $.mappings = ret[$.INDEX]['mappings'];
            }
            callback(null,true);
        }
        else{
            callback(err,null);
        }
    });
};

$.add = function(domain, listname, userid, list, callback){

    if(!$.mappings[domain]){

        $.addMappingForDomain(domain,
            function(err,ret){
                if(!err){
                    $.initialize(function(err,ret){
                        if(!err){
                            $.add(domain, listname, userid, list, callback);
                        }
                        else{
                            callback(err,null);
                        }
                    })
                }
                else{
                    callback(err,null);
                }
            }
        );
    }
    else{
        var id = $.getId(domain,listname,userid);

        $.get(domain,listname,userid,function(err,ret){
            if(!err){

                for(var i in ret.list){
                    if(list.indexOf(ret.list[i])===-1){
                        list.push(ret.list[i]);
                    }
                }
            }

            $.esClient.update({
                    index: $.INDEX,
                    type: domain,
                    id: id,
                    body: {
                        doc: {
                            listname: listname,
                            userid: userid,
                            list: list
                        },
                        doc_as_upsert: true
                    }
                },
                function(err,ret){
                    if(!err){
                        callback(null,true);
                    }
                    else{
                        callback(err,null);
                    }
                });

        });


    }
};

$.get = function(domain, listname, userid, callback){
    var id = $.getId(domain,listname,userid);
    $.esClient.get({index: $.INDEX, type: domain, id: id},function(err,ret){
        if(ret && ret.found){
            callback(null,ret._source);
        }
        else{
            callback(null,err);
        }
    });
};

$.filterOutInitialList = function(initialList,recommendList){
    var results = [];
    for(var i in recommendList){
        if(initialList.indexOf(recommendList[i])===-1){
            results.push(recommendList[i]);
        }
    }
    return results;
};

$.getRecommendationForItems = function(domain, listname, itemlist, callback) {
    $.esClient.search({
            index: $.INDEX,
            type: domain,
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    listname: listname
                                }
                            },
                            {
                                terms: {
                                    list: itemlist
                                }
                            }
                        ]
                    }

                }

            }
        },
        function (err, ret) {
            if (!err) {
                var results = [];
                for (var i in ret.hits.hits) {

                    var ar = ret.hits.hits[i]._source.list;
                    var score = ret.hits.hits[i]._score;
                    results.push({recommends: $.filterOutInitialList(itemlist, ar), score: score});
                }

                //loop through results and add up same recommendations
                var recs = {};

                for (var i in results) {
                    var recommendArray = results[i].recommends;
                    for (var r in recommendArray) {
                        if (!recs[recommendArray[r]]) {
                            recs[recommendArray[r]] = {score: 0, count: 0};

                        }
                        recs[recommendArray[r]].score += results[i].score;
                        recs[recommendArray[r]].count += 1;
                    }

                }

                //loop through recs and create array
                results = [];
                var tot = 0;
                for (var i in recs) {
                    var score = recs[i].score * recs[i].count;
                    results.push({id: i, score: score});
                    tot += score;
                }


                //this part removes items below the avg score - we could tweak this
                var avg = tot / results.length;

                var aboveAvgAr = [];

                for (var i in results) {
                    if (results[i].score >= avg) {
                        aboveAvgAr.push(results[i]);
                    }
                }

                results = aboveAvgAr.sort(function (a, b) {
                    return b.score - a.score
                });


                callback(null, results);

            }
            else {
                callback(err, null);
            }
        });

};

$.getRecommendations = function(domain, listname, userid, callback){

    $.get(domain, listname, userid, function(err,ret){
        if(!err){
            var list = ret.list;

            $.esClient.search({
                index: $.INDEX,
                type: domain,
                body: {

                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        listname: listname
                                    }
                                },
                                {
                                    terms: {
                                        list: list
                                    }
                                }
                            ],
                            must_not: {
                                term: {
                                    userid: userid
                                }
                            }
                        }

                    }

                }
            },
            function(err,ret){
                if(!err){
                    var results = [];
                    for(var i in ret.hits.hits){

                        var ar = ret.hits.hits[i]._source.list;
                        var score = ret.hits.hits[i]._score;
                        results.push({recommends: $.filterOutInitialList(list,ar), score: score});
                    }

                    //console.log(results);

                    //loop through results and add up same recommendations
                    var recs = {};

                    for(var i in results){
                        var recommendArray = results[i].recommends;
                        for(var r in recommendArray){
                            if(!recs[recommendArray[r]]){
                                recs[recommendArray[r]] = {score:0, count:0};

                            }
                            recs[recommendArray[r]].score += results[i].score;
                            recs[recommendArray[r]].count += 1;
                        }

                    }

                    //loop through recs and create array
                    results = [];
                    var tot = 0;
                    for(var i in recs){
                        var score = recs[i].score * recs[i].count;
                        results.push({id: i, score: score});
                        tot += score;
                    }


                    //this part removes items below the avg score - we could tweak this
                    var avg = tot/results.length;

                    var aboveAvgAr = [];

                    for(var i in results){
                        if(results[i].score>=avg){
                            aboveAvgAr.push(results[i]);
                        }
                    }

                    results = aboveAvgAr.sort(function(a,b){return b.score - a.score});


                    callback(null,results);

                }
                else{
                    callback(err,null);
                }
            });
        }
        else{
            callback(err,null);
        }
    });
};




$.initialize(function(err,ret){
    if(!err) {
        console.log('initialized');
    }
    else{
        console.log('error initializing');
        console.log('no mapping exists yet');
    }
});


module.exports = $;