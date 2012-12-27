$(document).ready(function() {
  var socket = io.connect('http://localhost:7777');
  var endTime = 0;

  socket.on('playerData', function(playerData) {
    for( var name in playerData ) {
      var playerDiv = $('#'+name);
      if( playerDiv.length==0 ) {
        playerDiv = $('<div id="'+name+'" class="player"><div class="cookies"></div><div class="playerName">'+name+'</div></div>');
        $('#cookieJar').append(playerDiv);
        $('#'+name).click(function() {
          socket.emit('steal',name);
        });
      }
      $('#'+name+' .cookies').html(playerData[name]);
    }
  });

  socket.on('cookieTheft', function(data) {
    var fromPlayerEl = $('#'+data.from+' .cookies');
    var toPlayerEl = $('#'+data.to+' .cookies');
    if( fromPlayerEl.length>0 ) {
      var cookies = parseInt(fromPlayerEl.html());
      if(cookies>0)
        fromPlayerEl.html(cookies-1);
    }
    if( toPlayerEl.length>0 ) {
      var cookies = parseInt(toPlayerEl.html());
      toPlayerEl.html(cookies+1);
    }
    var thefts = parseInt($('#numThefts').html());
    $('#numThefts').html(thefts+1);
  });

  socket.on('deadPlayer', function(name) {
    $('#'+name).remove();
  });

  socket.on('dupe', function(name) {
    $('#cookieJar').hide();
    $('#loginDiv').show();
    alert('That name is already taken');
  });

  var updateTimeRemaining = function() {
    var timeRemaining = endTime-Date.now();
    if( timeRemaining<0 )
      timeRemaining = 0;
    $('#timeRemaining').html((timeRemaining/1000)+' seconds');
  }
  socket.on('start', function(timeRemaining) {
    endTime = Date.now()+timeRemaining;
    setInterval(updateTimeRemaining,100);
  });

  socket.on('admin verified', function() {
    $('#adminDiv').show();
  });

  $('#loginBtn').click(function() {
    var name = $('#nameField').attr('value');
    if(!name) {
      alert('Please enter your name');
    } else {
      socket.emit('login',name);
      $('#loginDiv').hide();
      $('#cookieJar').show();
    }
  });

  $('#startBtn').click(function() {
    socket.emit('start');
  });

  //turn off text selection
  $('div').attr('unselectable', 'on').css('user-select','none').on('selectstart',false);

  $('#cookieJar').hide();
  $('#adminDiv').hide();
});
