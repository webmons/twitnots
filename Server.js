var Stream = require('user-stream');
var track = require('./TagsToTrack.json');

var express = require('express')
  , http = require('http')
  , path = require('path');

var app = express();
var port = process.env.PORT || 3030;
 
app.set('views', __dirname + '/views');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);
app.engine('html', require('ejs').renderFile);

app.get("/", function(req, res){
   res.render("responsive_home.html");
});

app.use(express.static(__dirname + '/public')); 
var io = require('socket.io').listen(app.listen(port));

var stream = CreateStream(track.Tags.toString());

io.sockets.on('connection', function (socket) {
   console.log("Connection from: " + socket.id);
   // Listen for the data event of the stream and broadcast to connected clients
   stream.on('data', function (json) {    
      socket.emit('newTweet', { tweetJSON: json });      
   });
});

function CreateStream(tracking){
   console.log("Tracking: " + tracking);
   
   var stream = new Stream({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
   });
	
   var params = {
      track: tracking
   };
   
   stream.stream(params);
   
   console.log("Streaming started.");
   
   return stream;
}
