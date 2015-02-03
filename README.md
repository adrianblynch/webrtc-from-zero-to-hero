# WebRTC - From Zero to Hero

Here I will chart my knowledge of WebRTC, from zero when I first heard about it, to where I am now which isn't that far, to hopefully a fully paid-up member of the WebRTC Expert Club!

It will act as a bit of a brain dump for a while until I get around to composing it better. It was also have my initial understandings which will be fleshed out as my knowledge increases.

There will be a few divergences with related topics. The video element, websockets, general web development etc.

At the time of starting this quest, I'm running the following:

- Chrome 40.0.2214.94 (64-bit)
- Node 0.10.36

The first few parts will use prefixed JS methods, webkitGetUserMedia(), rather than using helper libs to normalise across browsers. This is to gain a feel for what's being done for me in untility libs like [adapter.js](https://github.com/GoogleChrome/webrtc/blob/master/samples/web/js/adapter.js). At some point in proceedings I will switch to using adapter.js knowing what it does for me.

## Part 1 - The Video Element

To start with, we place a video element on the page. Using JavaScript to request access to our webcam we display it via the video element.

## Glossary

- STUN - [Session Traversal Utilities for NAT](http://tools.ietf.org/html/rfc5389) - Formerly [Simple Traversal of User Datagram Protocol Through NAT](http://tools.ietf.org/html/rfc3489) - Used to allow traffic between peers behind firewalls.
- TURN - [Traversal Using Relay NAT](http://tools.ietf.org/html/rfc5766)
- SDP  - [Session Description Protocol](http://tools.ietf.org/html/rfc4566)
- Signalling - [HTML Rocks take on signalling](http://www.html5rocks.com/en/tutorials/webrtc/infrastructure/#what-is-signaling) - Coordinated communications between two or more parties.
