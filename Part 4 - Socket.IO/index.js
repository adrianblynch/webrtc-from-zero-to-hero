var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendfile('index.html');
});

io.on('connection', function(socket) {
	socket
	.on('Login', function(msg){
		console.log('Login: ' + msg);
		//io.emit('Login', msg); // Send to everyone
		socket.broadcast.emit('Login', msg); // Send to everyone but the originator
	})
	.on('Logout', function(msg){
		console.log('Logout: ' + msg);
		//io.emit('Logout', msg);
		socket.broadcast.emit('Logout', msg);
	});
});

http.listen(8001, function() {
	console.log('Listening on port 8001');
});
