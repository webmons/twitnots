var position = 1;
var tweetQueue = new Array();
var timeoutId = null;
var timeoutPeriod = 5000;

$(document).ready(function () {   
	var socket = SetupSocket();
   ShowTweetsPerInterval();
});

function SetupSocket(){
   socket = io.connect('/');    
 
   socket.on('newTweet', function (data) {
      if(data.tweetJSON) {
      	console.log(data.tweetJSON);
         console.log("Size of tweet: " + JSON.stringify(data.tweetJSON).length);
         // Add to queue
         tweetQueue.push(data);         
      } 
      else {
         console.log("Problem occured for newTweet event.");
     }
   });
   
   return socket;   
}

function ShowTweetsPerInterval()
{
   ProcessTweetQueue();
   timeoutId = setTimeout(
   	function(){
      	ShowTweetsPerInterval();
   	}, 
   	timeoutPeriod
	);	
}

function ProcessTweetQueue(){
   // Get tweet data from queue
   var tweetData = tweetQueue.shift();
   
   if(tweetData)
   {      
      SpinBall();
      SetTweetElement(tweetData.tweetJSON, StopBall);
   }
   
   console.log("Tweet data processed, queue size after shift: " + tweetQueue.length);
}

function SpinBall(){
	$("#ball").css("-webkit-animation", "rotateBall 1s linear infinite");
}

function StopBall(){
	$("#ball").css("-webkit-animation", "");
}

function SetupTweetBoxClick(){
	$(".tweetContainer").on("click", function(){
		console.log("Click detected");
		$("#mainContainer").css("opacity", "0.5");
		$("#animatedTweet").html($(this).html());
    	$("#animatedTweet").fadeIn();
    	$("#animatedTweet").css("-webkit-animation", "animated_div 10s 1");
    	$("#animatedTweet").delay(10000).fadeOut("fast", function(){$(this).empty(); $("#mainContainer").css("opacity", "1");});
	});
}

function SetTweetElement(tweetJSON, stopAnimation){
   // get div element
   var tweetDiv = $("div[data-position='" + position + "']");
	tweetDiv.animate({opacity: 0}, 1000, function(){
		// Parse tweet data and set html
	   var tweetData = tweetJSON.text;
		tweetData = tweetData.parseURL().parseUsername().parseHashtag();   
		$(this).html(tweetData);
			    
		$(this).animate({opacity: 1}, 1500);
	   stopAnimation();
		position = position === 11 ? 1 : position + 1;
	});
}