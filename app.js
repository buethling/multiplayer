var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set('log level', 1);
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

var port = process.env.PORT || 80;
server.listen(port);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// holds the rectangles currently on the screen
var rectangles = {};

// handles socket stuff
io.sockets.on('connection', function (socket) {
  // init
  var newRect = {'id': socket.id, 'name': 'Me', 'loc': {'x': 100, 'y': 100} };
  socket.emit('init', { 'newRect': newRect, 'rectangles': rectangles });
  rectangles[socket.id] = newRect;
  socket.broadcast.emit('update', rectangles);

  socket.on('move', function(data) {
    rectangles[socket.id] = data;
    socket.broadcast.emit('update', rectangles);
  });

  socket.on('disconnect', function () {
    delete rectangles[socket.id];
    io.sockets.emit('update', rectangles);
  });
});