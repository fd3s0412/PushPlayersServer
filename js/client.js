$(function() {
	// ----------------------------------------------------------------------
	// クライアントの処理を扱うクラス.
	// ----------------------------------------------------------------------
	function Client() {
		this.clientMessage = $('#client');
		this.hostMessage = $('#host');
		// 通信用オブジェクト
		this.ws = new WebSocket('ws://153.126.204.61:8002/');
		// イベント設定
		this.setEvent();
		// 初期処理
		this.init();
	}
	// ----------------------------------------------------------------------
	// 初期処理.
	// ----------------------------------------------------------------------
	Client.prototype.init = function() {
		var self = this;
		self.ws.onopen = function() {
			self.send("browser", {});
		};
	};
	// ----------------------------------------------------------------------
	// イベント設定.
	// ----------------------------------------------------------------------
	Client.prototype.setEvent = function() {
		var self = this;
		self.ws.onmessage = function (event) {
			//console.log(event.data);
			var recieveData = JSON.parse(event.data);
			var eventName = recieveData.eventName;
			switch (eventName) {
				case "client":
					var text = "";
					for (var i = 0; i < recieveData.playerList.length; i++) {
						var d = recieveData.playerList[i];
						text += d.playerId + " :\n    " + d.positionX + ", " + d.positionY + ", " + d.positionZ + "\n\n";
					}
					self.clientMessage.html(text);
					break;
				case "host":
					var text = "";
					for (var i = 0; i < recieveData.playerList.length; i++) {
						var d = recieveData.playerList[i];
						text += d.playerId + " :\n    " + d.positionX + ", " + d.positionY + ", " + d.positionZ + "\n\n";
					}
					self.hostMessage.html(text);
					break;
			}
		};
	};
	// ----------------------------------------------------------------------
	// 送信処理.
	// ----------------------------------------------------------------------
	Client.prototype.send = function(eventName, sendData) {
		sendData.eventName = eventName;
		this.ws.send(JSON.stringify(sendData));
	};
	new Client();
});