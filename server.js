
var http = require('http');
var path = require('path');


var socketio = require('socket.io');
var express = require('express');

var app = express();
var server = http.createServer(app);
var io = socketio(server);
var redis = require('redis');
var redisClient = redis.createClient(process.env.REDIS_URL);



app.use(express.static('client'));



var storeMessages = function(name,message){
  
 var messages = JSON.stringify({name:name, message:message});
 redisClient.lpush('messages', messages, function(err, response){
   if (err) {console.log(err);}
   redisClient.ltrim('messages', 0,14);
   
 });
  
};

var userList = [];

var newUser = function(name){
  
  userList.push(name);
  
  
};

var removeUser = function(name){
  
  var index = userList.indexOf(name);
  
  userList.splice(index,1);
  
};

io.on('connection', function(client){


  
  client.on('join', function(name){
    if (name){
    client.nickname = name;
    console.log( client.nickname + ' connected...');
    newUser(name);
    console.log( "current user list:" + userList);
    
    client.emit('join', userList);
    client.broadcast.emit('join', userList);
    client.broadcast.emit('messages', "<font color='#42f4b3'><i>" + name + " joined the chatroom</font></i>");
    
    redisClient.lrange('messages',0, -1 , function(err,messages){
      if (err) {console.log(err);}
      
      messages = messages.reverse();
      messages.forEach(function(a){
      a = JSON.parse(a);
      client.emit('messages', a.name + " : " + a.message);
      
    });
    });
    
    
    
    } 
    
    else {
      client.emit('name_error');
    }
  });

  
  client.on('messages', function(data){
    
    var nickname = client.nickname;
    
    console.log(nickname + ":" + data);
    client.broadcast.emit('messages', nickname + " : " + data);
    client.emit('messages', nickname + " : " + data);
    storeMessages(nickname, data);
    
  });
  
  client.on('disconnect', function(){
    
    removeUser(client.nickname);
    client.broadcast.emit('join', userList);
    client.broadcast.emit('messages', '<font color="#42f4b3"><i>' + client.nickname + " has left the chat</font></i>");
    
  });
  
});

app.get('/', function(request, response){

response.sendFile(__dirname + 'client/index.html');  
  
});

server.listen(process.env.PORT, function(){
  
  console.log('Listening on ' + process.env.PORT);
  
});