var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , HashMap = require('hashmap').HashMap;

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

app.get('/hashmap.js', function(req, res) {
  res.sendfile(__dirname + '/node_modules/hashmap/hashmap.js');
});

// holds the rectangles currently on the screen
var rectangles = new HashMap();

// handles socket stuff
io.sockets.on('connection', function (socket) {
  // init
  newRect = {'id': socket.id, 'name': 'Chris', 'loc': {'x': 100, 'y': 100} };
  socket.emit('init', { 'newRect': newRect, 'rectangles': rectangles._data });
  rectangles.set(socket.id, newRect);
  socket.broadcast.emit('update', rectangles._data);

  socket.on('move', function(data) {
    rectangles.set(socket.id, data);
    socket.broadcast.emit('update', rectangles._data);
  });

  socket.on('disconnect', function () {
    rectangles.remove(socket.id);
    io.sockets.emit('update', rectangles._data);
  });
});