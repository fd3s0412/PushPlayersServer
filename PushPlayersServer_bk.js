//app.js
var WebSocketServer = require('ws').Server
    , http = require('http')
    , express = require('express')
    , app = express();
 
app.use(express.static(__dirname + '/'));
var server = http.createServer(app);
var wss = new WebSocketServer({server:server});

wss.on('connection', function(ws) {
    console.log('connected!');
    ws.on('message', function(message) {
        console.log(message.toString());
    });
    ws.on('close', function() {
        console.log('disconnected...');
    });
    setInterval(function() {
        ws.send("Hi!");
    }, 1000);
});

server.listen(8002);
