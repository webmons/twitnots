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
      SetTweetElement(tweetData.tweetJSON, StopBall, ShowTweetAgain);
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

function ShowTweetAgain(tweetContainer){
	tweetContainer.animate({opacity: 1}, 2500);
}

function SetTweetElement(tweetJSON, stopAnimation, showNewTweetAnimation){
   // get div element
   var tweetDiv = $("div[data-position='" + position + "']");
	tweetDiv.animate({opacity: 0}, 800, function(){
		console.log("Setting tweet element for div at position: " + position);
   
	   // Parse tweet data and set html
	   var tweetData = tweetJSON.text;   
	   var tweetInfo = tweetDiv.html(tweetData.parseURL().parseUsername().parseHashtag());
	   
        // Set background of div
        if (tweetJSON.user.profile_banner_url) {
            //var tweetImg = $(document.createElement("img"));
            //tweetImg.addClass("tweetImg");
            $(tweetDiv).css('background', "url(" + tweetJSON.user.profile_banner_url + ") no-repeat");
            $(tweetDiv).css('background-size', "cover");
            //$(tweetDiv).css('background-repeat', 'no-repeat');
            //tweetImg.attr('src', tweetJSON.user.profile_image_url);
            //tweetImg.prependTo(tweetDiv);
        }
	   
	   stopAnimation();
	   
	   position = position === 11 ? 1 : position + 1;
	   showNewTweetAnimation(tweetDiv);
	});
}