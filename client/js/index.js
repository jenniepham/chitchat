var socket = io.connect();

$(document).ready(function(){
    
 $('#chatForm').submit(function(e){
     
     e.preventDefault();
     var message = $('#input').val();
     
     socket.emit('messages',message);
     $('#input').val('');
     
 });
 
 socket.on('connect', function(data){
    
    var nickname = prompt("What is your nickname?");
    
 
    
    socket.emit('join', nickname);
     
 });
 
 socket.on('name_error', function(){
     
     alert("Enter your nickname!");
      var nickname = prompt("What is your nickname?");
    
 
    
    socket.emit('join', nickname);
     
 });
 
 socket.on('join', function(data){
    $('#IdList').empty();
    
   data.forEach(function(a){
      
      $('#IdList').append(a + "<br>");
       
   });
    
     
 });
 
 socket.on('messages', function(data){
     
     $('#textBox').append(data + "<br><br>");
     
 });
    
});
    
    
    
    


