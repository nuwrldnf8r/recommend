var $ = {};

$.redis = [{port: 6379, host: 'localhost',name: 'chat1'}];
$.elastichost = 'localhost:9200';

$.mapping = {
    properties:
    {
        userid:
        {
            type: 'string',
            index: 'not_analyzed'
        },
        listname: {
            type: 'string',
            index: 'not_analyzed'
        }
    }
};

$.service = {host: 'localhost', port: 8080};

module.exports = $;