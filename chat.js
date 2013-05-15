var dataChannel, isCaller, localPeerConnection, chat_on = false,times_asked = 0;
var sdpConstraints = {'mandatory': {
	'OfferToReceiveAudio': false,
		'OfferToReceiveVideo': false}};
servers = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
 servers.iceServers.push({
        "url": "turn:bndrzz%40gmail.com@numb.viagenie.ca",
        "credential": "fortehlulz"
      });
var status_element = document.getElementById('status_text'); 

var chat_window = document.getElementById("chat_wrap");  

function trace(text,user) {
	if (typeof(user) != "undefined") {
		status_element.innerHTML = user;    	
	}

	console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}

function init() {

	trace('Starting Peer initialization. Room ' + uid);
	if (webrtcDetectedBrowser == "firefox") {
		var servers = {"iceServers": [{"url": "stun:23.21.150.121"}]};
	} else {
		var servers = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
	}

	if (isCaller) {
		trace("Owner of the chat. Start offer")
			trace("Created local Owner peer connection");
		localPeerConnection = new RTCPeerConnection(servers, {optional: [{RtpDataChannels: true}]});
		try {
		dataChannel = localPeerConnection.createDataChannel("RTCDataChannel", {reliable: true});
		dataChannel.binaryType = 'blob';
		addDataChannelHandlers(); 
		} catch(e) {
		trace("exiting: Not supported browser","Your Browser is not supported. Sorry");
		return;
		}		
		localPeerConnection.onicecandidate = receivedIceServers;
		pull();
		localPeerConnection.createOffer(setLocalAndSendMessage, null, sdpConstraints);

	} else {
		trace("NOT owner of chat. Need to get offer, and create answer");
		trace("Created local NOT OWNER peer connection");
		localPeerConnection = new RTCPeerConnection(servers, {optional: [{RtpDataChannels: true}]});
		localPeerConnection.ondatachannel = function(event) {
			dataChannel = event.channel;

			dataChannel.binaryType = 'blob';
			addDataChannelHandlers();
		};

		var remoteDescription = getRemoteUserData(uid, '&getoffer=1');

		localPeerConnection.setRemoteDescription(new RTCSessionDescription(remoteDescription));
		localPeerConnection.createAnswer(setLocalAndSendMessage, null, sdpConstraints);
		setIceServers('caller');
		localPeerConnection.onicecandidate = receivedIceServers;

	}


}

function setLocalAndSendMessage(sessionDescription) {
	// Set Opus as the preferred codec in SDP if Opus is present.
	trace("Setting local Description");
	localPeerConnection.setLocalDescription(sessionDescription);
	sendMessage(sessionDescription);
}
function sendMessage(message) {
	var msgString = JSON.stringify(message);
	path = 'auth.php?uid=' + uid;
	if (isCaller)
		path += '&owner=1';
	var xhr = new XMLHttpRequest();

	xhr.open('POST', path, false);
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	xhr.send('data=' + msgString);

}
function getRemoteUserData(room, type) {
	var sdp = false;
	path = 'auth.php?uid=' + uid;
	if (type)
		path += type;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', path, false);
	xhr.onreadystatechange = function() {
		if (xhr.responseText.length > 1) {

			result = JSON.parse(xhr.responseText);
			trace("Getting remote user Data","Getting remote user data");
			if (result.status == 0) {
				trace("Not authorized for this session", "Session error. Not authorized or expired");
				throw new Error("Session error");
			}
			sdp = JSON.parse(result.sdp);
			trace("Got remote user Data");
		}
	};
	xhr.send();

	return sdp;
}

function receivedIceServers(evt) {
	if (evt.candidate) {
		sendMessage({type: 'candidate',
				label: evt.candidate.sdpMLineIndex,
				id: evt.candidate.sdpMid,
				candidate: evt.candidate});

	} else {
		trace("End of Ice Candidates")
	}
}
function pull() {

	if (isCaller && chat_on == false) {

		path = 'auth.php?uid=' + uid;
		path += '&owner=1';
		path += '&getanswer=1';
		var xhr = new XMLHttpRequest();

		xhr.open('GET', path, false);
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		xhr.onreadystatechange = function() {
			times_asked++;
			trace("waiting for connection","Waiting for remote user to connect");
			if (xhr.responseText.length < 1) {
				setTimeout(pull, 2000*times_asked);
				return;
			}
			var sig = JSON.parse(xhr.responseText);
			if (sig.sdp == null) {
				setTimeout(pull, 2000*times_asked);
				return;
			}

			trace("Received remote Description. Adding it","Remote User connected. Initializing...");


			localPeerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(sig.sdp)));
			setIceServers('calee');
			chat_on = true;


		};
		xhr.send();

	}
}

function setIceServers(from) {
	trace("Getting Ice Candidates for local peer");
	var remotes = getRemoteIceServers(uid, '&candidate=1&from=' + from);
	var len = remotes.length;
	trace("Adding Ice Candidates to localPeerConnection");
	for (var i = 0; i < len; i++) {
		var js = JSON.parse(remotes[i][3]);
		try {

			var candidate = new RTCIceCandidate({sdpMLineIndex: js.label, sdpMid: js.id,
					candidate: js.candidate.candidate});
			localPeerConnection.addIceCandidate(candidate);
		} catch (e) {
			trace(i + " failed");
			continue;
		}
	}


}
function getRemoteIceServers(room, type) {
	var result = false;
	path = 'auth.php?uid=' + uid;
	if (type)
		path += type;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', path, false);
	xhr.onreadystatechange = function() {
		if (xhr.responseText.length > 1) {

			result = JSON.parse(xhr.responseText);

		}
	};
	xhr.send();

	return result;
}


function addDataChannelHandlers() {


	dataChannel.onmessage = function(e) {
		messageReceived(encryptDecrypt(e.data,false));
		trace("MESSAGE:" + e.data,"Message received");
	};

	dataChannel.onopen = function() {
		trace("Channel onopen called","Chat is ready to go!");

	}
	dataChannel.onclose = function() {
		trace("Onclose fired","Remote user left the chat. Connection broken. Restart session.");
	};


}

function send_message() {
	trace("Trying to send a message");
	var data_el = document.getElementById("chat_val");
	var data= data_el.value;
	if (data.length < 1) {
	trace("User inpute too short","Message too short");
	return;
	}	
	data_el.value = "";
	try {	
		dataChannel.send(encryptDecrypt(data,true));
	} catch(e) {
		trace("Data connection not established","Error: Data connection not established");
	return;
	}
	trace("Message was sent","Message sent");
	var element = document.createElement('div');
	element.className = 'message-wrapper';
	element.innerHTML = "<div class='message message-left'><span class='message-text'>"+data+"</span></div>";
	chat_window.appendChild(element);	
	var clear = document.createElement('div');
	clear.style.cssText = 'clear:both';
	chat_window.appendChild(clear);
}
function messageReceived(msg) {
	var element = document.createElement('div');
	element.className = "message-wrapper";
	element.innerHTML = "<div class='message message-right'><span class='message-text'>"+msg+"</span></div>";
	chat_window.appendChild(element)
		var clear = document.createElement('div'); 
	clear.style.cssText = 'clear:both';
	chat_window.appendChild(clear);   

}

function encryptDecrypt(msg,encrypt) {
	
	if (encrypt) {
		return JSON.stringify(sjcl.encrypt(uid, msg,{count:2048,ks:256}));
	} else {
		return sjcl.decrypt(uid,JSON.parse(msg));
	}
}
function error_exception(msg) {
this.message = msg;
this.name = "Error";
}
init();

function checkKey(e) {
	if (e.keyCode == 13) {
		send_message();
	}
}
document.onkeypress=checkKey; 




