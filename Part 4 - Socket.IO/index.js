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
	})
	.on('Logout', function(msg){
		console.log('Logout: ' + msg);
	});
});

http.listen(8001, function() {
	console.log('Listening on port 8001');
});
