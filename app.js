var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

io.set('log level', 1); 
app.listen(80);

// server up the index page
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

// holds the rectangles currently on the screen
var rectangles = [],
    count = 0;

// handles socket stuff
io.sockets.on('connection', function (socket) {
  // init
  newRect = {'id': count, 'loc': {'x': 100, 'y': 100} };
  socket.emit('init', { 'newRect': newRect, 'rectangles': rectangles });
  rectangles[count] = newRect;
  count++;
  
  socket.on('move', function(data) {
    rectangles[data.id] = data;
    socket.broadcast.emit('update', rectangles);
  });
});