var Stream = require('user-stream');
var track = require('./TagsToTrack.json');
var Collection = require('./public/javascript/structures.js');

var tweetCollection = new Collection(3);

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
var stream = CreateStream(track.Tags.toString(), io);

io.sockets.on('connection', function (socket) {
   console.log("Connection from: " + socket.id);
   socket.emit('latestTweets', { latestTweets: tweetCollection.GetAllAsArray() });   
});

function CreateStream(tracking, io){
	console.log("Tracking: " + tracking);
	
	var english = "en"; // Only supporting english (en)   
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
   
   // Listen for the data event of the stream and broadcast to connected clients
   stream.on('data', function (json) {
   	if(json){
	   	// lang indicates a language identifier corresponding to the machine-detected language of the Tweet text
	   	var language = "";
	   	if(json.user.lang)
	   		language = json.user.lang;
	   		 
	   	if(language === english){
		   	var condensedJSON = {
		   		tweetText: json.text,
		   		tweetTime: new Date(json.created_at),
		   		screenName: json.user.screen_name,
		   		profileImage: json.user.profile_image_url,
		   		bannerImage: json.user.profile_banner_url
		   	};  
		   	tweetCollection.Add(condensedJSON);
		   	console.log(condensedJSON);
		      io.sockets.emit('newTweet', { tweetJSON: condensedJSON });      
	     }
     }     
   });
   
   console.log("Streaming started.");
   
   return stream;
}
