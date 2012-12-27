var express = require('express')
  , app = express()
  , httpServer = require('http').createServer(app)
  , io = require('socket.io').listen(httpServer)
;

app.root = __dirname;
app.use(express.static(__dirname+'/public'));
global.adminName = 'admin_pwns';

var playerData = {};
var stealingAllowed = false;
var totalThefts = 0;

io.sockets.on('connection', function(socket) {
  socket.emit('playerData',playerData);

  socket.on('login', function(name) {
    socket.set('name',name, function() {
      if( typeof playerData[name]!='undefined' ) {
        socket.emit('dupe');
        return;
      }
      if( name==global.adminName ) {
        socket.emit('admin verified');
      } else {
        playerData[name] = 25;
        io.sockets.emit('playerData',playerData);
      }
    });
  });

  socket.on('start', function() {
    socket.get('name', function(err,name) {
      if(!err && name==global.adminName)
        stealingAllowed = true;
        var playTime = 10*1000;
        io.sockets.emit('start',playTime);
        setTimeout(function() {
          stealingAllowed = false;
        }, playTime);
    });
  });

  socket.on('steal', function(losingPlayer) {
    if(!stealingAllowed) return;
    socket.get('name', function(err,name) {
      if( !err && (typeof playerData[name]!='undefined') && playerData[losingPlayer]>0 ) {
        playerData[losingPlayer]--;
        playerData[name]++;
        io.sockets.emit('cookieTheft',{
            from:losingPlayer
          , to:name
        });
        totalThefts++;
      }
    });
  });

  socket.on('disconnect', function(data) {
    socket.get('name', function(err,name) {
      if(!err && name) {
        delete playerData[name];
        io.sockets.emit('deadPlayer',name);
      }
    });
  });

});

httpServer.listen(7777);
