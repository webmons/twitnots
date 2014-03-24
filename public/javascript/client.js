$(document).ready(function () {   
   var socket = SetupSocket();
});

function SetupSocket(){
   socket = io.connect('/');    
 
   socket.on('newTweet', function (data) {
      if(data.tweetJSON) {                    
         console.log(data.tweetJSON);
      } 
      else {
         console.log("Problem occured for newTweet event.");
     }
   });
   
   return socket;   
}