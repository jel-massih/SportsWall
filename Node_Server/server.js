var app = require('express')(),
    server = require('http').createServer(app),
    port = 8080,
    url = 'http://sportsfeed.nodejitsu.com:' + port + '/',
    subscriptions = require('./subscriptions'),
    io = require('socket.io').listen(server, {log: false});
    

app.configure(function () {
    app.use(require('express').bodyParser());
    app.use(app.router);
});

server.listen(port);
console.log("Express server listening on port " + port);
console.log(url);

app.get('/callbacks/tag/:tagName', function (req, res) {
    console.log("GET " + req.url);
    var params = require('url').parse(req.url, true).query;
    res.send(params['hub.challenge'] || 'No hub.challenge present');
});

app.post('/callbacks/tag/:tagName', function(req, res) {
    console.log("PUT /callbacks/tag/" + req.params.tagName);

    var updates = req.body;

    var tagName = req.params.tagName;
    for(index in updates) {
        var update = updates[index];
        if(update['object'] == "tag") {
            startUpdateClients(update.object_id);
        }
    }
    res.send('OK');
});

app.get('/', function(request, response) {
    console.log("Connected");
});

function processTag(tagName) {

    var path = '/v1/tags/' + tagName + '/media/recent';
    var queryString = "https://api.instagram.com" + path + "?access_token=547964693.905cf6d.83d89ef3c6c24745bbbbc52b2e20e1a8&count=5";

    console.log("Emitting to Sockets!!!");
    io.sockets.emit('newImage', { updatePath: queryString, tagName: tagName });
}

var ids = {};
var clientCheckID = 0;

function startUpdateClients(tagName) {
    clientCheckID++;
    console.log("Sending Client Check");
    io.sockets.emit('checkForClients', { u_id: clientCheckID, tagName: tagName });
}

io.sockets.on('connection', function (socket) {
    socket.on('clientCallback', function (data) {
        console.log("Client Callback");
        if (!ids[data.u_id]) {
            ids[data.u_id] = true;
            processTag(data.tagName);
        }
    });
});