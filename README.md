# WebRTC - From Zero to Hero

- [Part 1 - The Video Element](#part-1---the-video-element)
- [Part 2 - Capture Video](#part-2---capture-video)
- [Part 3 - Save Captured Image](#part-3---save-captured-image)
- [Part 4 - Socket.IO](#part-4---socketio)
- [Part 5 - Local Peer Connection](#part-5---local-peer-connection)
- [Glossary](#glossary)
- [Useful Links](#useful-links)

Here I will chart my knowledge of WebRTC, from zero when I first heard about it, to where I am now which isn't that far, to hopefully a fully paid-up member of the WebRTC Expert Club!

It will act as a bit of a brain dump for a while until I get around to composing it better. I will document my initial understandings which will be fleshed out as my knowledge increases.

There will be a few divergences with related topics. The video element, websockets, general web development etc.

At the time of starting this quest, I'm running the following:

- Mac OSX 10.9 on a MacBook Pro
- Chrome 40.0.2214.94 (64-bit)
- Node 0.10.36

The first few parts will use prefixed JS methods, webkitGetUserMedia(), rather than using helper libs to normalise across browsers. This is to gain a feel for what's being done for me in utility libs like [adapter.js](https://github.com/GoogleChrome/webrtc/blob/master/samples/web/js/adapter.js) or [Modernizr](https://github.com/Modernizr/Modernizr). At some point in proceedings I will switch to using adapter.js knowing what it does for me.

Before I start using Node in the later parts, I fire up a webserver with the following `python -m SimpleHTTPServer`. This eases development because you will get problems browsing a file directly from the file system and not over HTTP.

## Part 1 - The Video Element

To start with, we place a video element on the page:

```
<video></video>
```

Next we call our prefixed getUserMedia(), passing options to turn off audio and turn on video:

```
navigator.webkitGetUserMedia(
	{video: true, audio: false},
	...
);
```

This should result in the browser asking you for permission to access your webcam.

Note that Chrome will continue to ask you for permission to access your camera if you're browsing over HTTP. If you change that to HTTPS, your choice is remembered.

The second and third arguments to GUM (getUserMedia) are a success callback and an error callback:

```
navigator.webkitGetUserMedia(
	...
	function(stream) {
		video.src = window.URL.createObjectURL(stream);
		video.play();
	},
	function(err) {
		console.log(err);
	}
);
```

If there is an error firing up the webcam, you click Deny for example, the error callback will give details about what has happened. For now I'm going to simply log the error and do no more.

If the success callback is fired, we then create an object URL with the passed in stream and play the video.

If everything has gone to plan, you should now be seeing your lovely self in the browser!

## Part 2 - Capture Video

This is a slight deviation from the goal of peer-to-peer video conferencing, but it's a nice quick look at doing something with the video you're now seeing.

A button, when clicked, will take a snapshot of the video, placing it on the newly added canvas element:

```
...
<button>Snap</button>
<canvas></canvas>
```

We get a reference to the canvas's 2D context. This is used to write a captured image to:

```
var ctx = canvas.getContext("2d");
```

When the button is clicked, we draw to this context with the video as the source:

```
button.addEventListener("click", function() {
	ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
}, false);
```

This next event listener is a little strange. We want the canvas to be the same size as the video. But we need the video to be playing before the width and height become available:

```
video.addEventListener("canplay", function() {
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
}, false);
```

The _canplay_ event, not the _play_ event, is the one we need to look out for and after which the video's width and height become available.

You should now be able to capture video and display it in a canvas element. The question you should now be asking is _What now?_

## Part 3 - Save Captured Image

At this point you should have a video element showing your face from your webcam. When you click Snap an image should be appearing on the cavas underneath.

To start with we change the way we select some elements on the page:

```
...
var snapButton = document.querySelector("button.snap");
...
var saveButton = document.querySelector("button.save");
```

We capture the Save button's click and fire off a number of calls.:

```
saveButton.addEventListener("click", function() {
	var dataURL = canvas.toDataURL('image/png');
	sendToServer(dataURL);
	saveToLocalStorage(dataURL);
	displayAsImage(dataURL);
}, false);
```

What you do with the data URL from here is up to you. I might revisit this at some point but this isn't getting us any closer to a video conference!

## Part 4 - Socket.IO

Now we divert our attention away from WebRTC for a bit to demo Socket.IO. The reason being, later on we'll be using Node and Socket.IO to implement signalling for our video conferencing.

Here we spin up a Node application using Express. We mix in Socket.IO and start serving a web page which will open up a websocket connection to the Node app.

Looking in package.json you'll see a couple of dependancies. Express and Socket.IO:

```
	...
	"dependencies": {
		"express": "^4.11.2",
		"socket.io": "^1.3.3"
	}
	...
```

We define one route in Express which serves up our application's only page, index.html:

```
app.get('/', function(req, res) {
	res.sendfile('index.html');
});
```

Note: Socket.IO also takes care of serving up the client code needed to make connections. Take a look [http://localhost:8001/socket.io/socket.io.js](http://localhost:8001/socket.io/socket.io.js).

The Socket.IO code follows:

```
io.on('connection', function(socket) {
	socket
	.on('Login', function(msg){
		console.log('Login: ' + msg);
		io.emit('Login', msg);
	})
	.on('Logout', function(msg){
		console.log('Logout: ' + msg);
		io.emit('Logout', msg);
	});
});
```
We're listening for messages named 'Login' and 'Logout'. When we receive them we log the message to the console and then `emit` those to all listeners.

To view this in action, fire up the server with `node index.js` (or `nodemon`) and browse to [localhost:8001](http://localhost:8001/). Click Login and notice the message in the console. Fire up another tab, window or different browser althogether and do the same, click Login. Watch the Node console to see the incoming messages.

Outgoing messages are send with the following:

```
	io.emit('Login', msg);
	...
	io.emit('Logout', msg);
```

They are received on the client with:

```
socket
.on("Login", function(msg) {
	logins.value = msg + " just logged in";
})
.on("Logout", function(msg) {
	logins.value = msg + " just logged out";
});
```
Note: The incoming messages on the server are emitted to everyone including the client that sent it. To emit to everyone but the sender, use `socket.broadcast.emit('Logout', msg);`.

## Part 5 - Local Peer Connection

## Glossary

Here's a great [WebRTC glossary](https://webrtcglossary.com/). The below is my own wording for terms as I encounter them and will include things outside of WebRTC.

- STUN - [Session Traversal Utilities for NAT](http://tools.ietf.org/html/rfc5389) - Formerly [Simple Traversal of User Datagram Protocol Through NAT](http://tools.ietf.org/html/rfc3489) - Used to allow traffic between peers behind firewalls.
- TURN - [Traversal Using Relay NAT](http://tools.ietf.org/html/rfc5766)
- SDP  - [Session Description Protocol](http://tools.ietf.org/html/rfc4566)
- Signalling - [HTML Rocks take on signalling](http://www.html5rocks.com/en/tutorials/webrtc/infrastructure/#what-is-signaling) - Coordinated communications between two or more parties.

## Useful links

- http://www.anyfirewall.com/
