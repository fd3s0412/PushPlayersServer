//app.js
var WebSocketServer = require('ws').Server
	, http = require('http')
	, express = require('express')
	, app = express();

app.use(express.static(__dirname + '/'));
var server = http.createServer(app);
var wss = new WebSocketServer({server:server});

var browser = null;
var connectionList = [];
var gameInfo = {
    playerMap: {}
};
wss.on('connection', function(connection) {
	console.log('connected!');
	connectionList.push(connection);
	// ----------------------------------------------------------------------
	// 受信処理.
	// ----------------------------------------------------------------------
	connection.on('message', function(message) {
		//console.log(message.toString());
		var recieveData = JSON.parse(message.toString());
		var eventName = recieveData.eventName;
		switch (eventName) {
			// ----------------------------------------------------------------------
			// ブラウザから状態を確認するための接続.
			// ----------------------------------------------------------------------
			case "browser":
				console.log("connect browser");
				browser = connection;
				break;
			// ----------------------------------------------------------------------
			// 接続.
			// ----------------------------------------------------------------------
			case "login":
				//console.log(message.toString());
				recieveData.playerId = recieveData.playerId || generateUuid();
				recieveData.playerColorR = Math.random();
				recieveData.playerColorG = Math.random();
				recieveData.playerColorB = Math.random();
				recieveData.positionX = 0;
				recieveData.positionY = 10;
				recieveData.positionZ = 0;
				//console.log("login : " + recieveData.playerId);
				send(connection, eventName, recieveData);
				break;
			// ----------------------------------------------------------------------
			// ログイン成功時の処理.
			// ----------------------------------------------------------------------
			case "loginSuccess":
				console.log("loginSuccess : " + recieveData.playerId);
				//console.log(connection);
				gameInfo.playerMap[recieveData.playerId] = recieveData;
				break;
			// ----------------------------------------------------------------------
			// クライアントの操作情報を受け付ける処理.
			// ----------------------------------------------------------------------
			case "setPlayerAction":
				var tmp = gameInfo.playerMap[recieveData.playerId];
				if (tmp) {
					tmp.horizontal = recieveData.horizontal;
					tmp.vertical = recieveData.vertical;
				}
				send(connection, eventName, getPlayerList());
				send(browser, "client", getPlayerList());
				//console.log(browser);
				break;
			// ----------------------------------------------------------------------
			// ホストでの計算結果を受け付ける処理.
			// ----------------------------------------------------------------------
			case "sendHostInfo":
				for (var i = 0; i < recieveData.playerList.length; i++) {
					var hostData = recieveData.playerList[i];
					var serverData = gameInfo.playerMap[hostData.playerId];
					serverData.positionX = hostData.positionX;
					serverData.positionY = hostData.positionY;
					serverData.positionZ = hostData.positionZ;
					serverData.isDelete = (hostData.positionY < -5);
				}
				send(connection, eventName, getPlayerList());
				send(browser, "host", getPlayerList());
				break;
		}
	});
	// ----------------------------------------------------------------------
	// 切断処理.
	// ----------------------------------------------------------------------
	connection.on('close', function() {
		console.log('disconnected...');
		removeConnection(connection);
	});
});

server.listen(8002);
// ----------------------------------------------------------------------
// プレイヤーリストを取得.
// ----------------------------------------------------------------------
function getPlayerList() {
	var obj = {};
	obj.playerList = [];
	var keys = Object.keys(gameInfo.playerMap);
	for (var i = 0; i < keys.length; i++) {
		var playerId = keys[i];
		obj.playerList.push(gameInfo.playerMap[playerId]);
	}
	return obj;
}
// ----------------------------------------------------------------------
// コネクションを除去する処理.
// ----------------------------------------------------------------------
function removeConnection(connection) {
	for (var i = connectionList.length - 1; i >= 0; i--) {
		if (connectionList[i] === connection) {
			connectionList.splice(i, 1);
		}
	}
}
// ----------------------------------------------------------------------
// 接続中のすべてのクライアントに送信.
// ----------------------------------------------------------------------
function sendAll(eventName, sendData) {
	for (var i = connectionList.length - 1; i >= 0; i--) {
		var connection = connectionList[i];
		send(connection, eventName, sendData);
	}
}
// ----------------------------------------------------------------------
// 特定のクライアント以外に送信.
// ----------------------------------------------------------------------
function sendWithoutSelf(connection, eventName, sendData) {
	for (var i = connectionList.length - 1; i >= 0; i--) {
		if (connectionList[i] !== connection) {
			send(connectionList[i], eventName, sendData);
		}
	}
}
// ----------------------------------------------------------------------
// 特定のクライアントに送信.
// ----------------------------------------------------------------------
function send(connection, eventName, sendData) {
	if (!connection) return;
	sendData.eventName = eventName;
	try {
		var json = JSON.stringify(sendData);
		//console.log(json);
		connection.send(json);
	} catch (e) {
		removeConnection(connection);
	}
}
// ----------------------------------------------------------------------
// UUID生成.
// ----------------------------------------------------------------------
function generateUuid() {
	// https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
	// const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
	let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
	for (let i = 0, len = chars.length; i < len; i++) {
		switch (chars[i]) {
			case "x":
				chars[i] = Math.floor(Math.random() * 16).toString(16);
				break;
			case "y":
				chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
				break;
		}
	}
	return chars.join("");
}
