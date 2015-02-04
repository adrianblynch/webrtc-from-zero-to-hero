# WebRTC - From Zero to Hero

Here I will chart my knowledge of WebRTC, from zero when I first heard about it, to where I am now which isn't that far, to hopefully a fully paid-up member of the WebRTC Expert Club!

It will act as a bit of a brain dump for a while until I get around to composing it better. It was also have my initial understandings which will be fleshed out as my knowledge increases.

There will be a few divergences with related topics. The video element, websockets, general web development etc.

At the time of starting this quest, I'm running the following:

- Mac OSX 10.9 on a MacBook Pro
- Chrome 40.0.2214.94 (64-bit)
- Node 0.10.36

The first few parts will use prefixed JS methods, webkitGetUserMedia(), rather than using helper libs to normalise across browsers. This is to gain a feel for what's being done for me in untility libs like [adapter.js](https://github.com/GoogleChrome/webrtc/blob/master/samples/web/js/adapter.js). At some point in proceedings I will switch to using adapter.js knowing what it does for me.

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

## Glossary

- STUN - [Session Traversal Utilities for NAT](http://tools.ietf.org/html/rfc5389) - Formerly [Simple Traversal of User Datagram Protocol Through NAT](http://tools.ietf.org/html/rfc3489) - Used to allow traffic between peers behind firewalls.
- TURN - [Traversal Using Relay NAT](http://tools.ietf.org/html/rfc5766)
- SDP  - [Session Description Protocol](http://tools.ietf.org/html/rfc4566)
- Signalling - [HTML Rocks take on signalling](http://www.html5rocks.com/en/tutorials/webrtc/infrastructure/#what-is-signaling) - Coordinated communications between two or more parties.
