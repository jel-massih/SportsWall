var redis = require('redis'),
    fs = require('fs'),
    io = require('socket.io'),
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    subscriptionPattern = 'channel:*',
    socket = io.listen(server);

var redisClient = redis.createClient('6379', 'nodejitsudb3967649037.redis.irstack.com');

redisClient.auth('nodejitsudb3967649037.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4', function (err) {
    if (err) { throw err;}
});

var pubSubClient = redis.createClient('6379', 'nodejitsudb3967649037.redis.irstack.com');

pubSubClient.auth('nodejitsudb3967649037.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4', function (err) {
    if (err) { throw err; }
});

pubSubClient.psubscribe(subscriptionPattern);

pubSubClient.on('pmessage', function (pattern, channel, message) {
    if (pattern == subscriptionPattern) {
        try {
            var data = JSON.parse(message)['data'];

            var channelName = channel.split(':')[1].replace(/-/g, ' ');
        } catch (e) {
            return;
        }

        for (index in data) {
            var media = data[index];
            media.meta = {};
            media.meta.location = channelName;
            redisClient.lpush('media:objects', JSON.stringify(media));
        }

        var update = {
            'type': 'newMedia',
            'media': data,
            'channelName': channelName
        };

        for (sessionId in socket.clients) {
            socket.clients[sessionId].send(JSON.stringify(update));
        }
    }
});