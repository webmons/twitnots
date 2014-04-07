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
   	SetTweetElement(SpinBall, tweetData.tweetJSON, StopBall);
   
   console.log("Tweet data processed, queue size after shift: " + tweetQueue.length);
}

function SpinBall(){
	$("#ball").css("-webkit-animation", "rotateBall 1s linear infinite");
}

function StopBall(){
	$("#ball").css("-webkit-animation", "");
}

function SetTweetElement(startAnimation, tweetJSON, stopAnimation){
   
   startAnimation();
   
   // Get div element
	var tweetDiv = $("div[data-position='" + position + "']");
	tweetDiv.animate({opacity: 0}, 1000, function(){
		// Parse tweet data and set html
		var tweetData = tweetJSON.text;
		tweetData = tweetData.parseURL().parseUsername().parseHashtag();   
		$(this).find('.content').html(tweetData);
		
		// Set background of div
		if (tweetJSON.user.profile_banner_url) {
            $(tweetDiv).find('.content').css('max-width', $(tweetDiv).width());
	  		$(tweetDiv).css('background', "url(" + tweetJSON.user.profile_banner_url + ") no-repeat");
  			$(tweetDiv).css('background-size', "cover");
  		}
			    
		$(this).animate({opacity: 1}, 1500);
	   stopAnimation();
		position = position === 11 ? 1 : position + 1;
	});
}