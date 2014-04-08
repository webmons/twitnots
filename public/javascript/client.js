var position = 1;
var imageIndex = 0;
var IMAGE_COLLECTION_SIZE = 11;
var tweetQueue = new Array();
var imageArray = new Array(IMAGE_COLLECTION_SIZE);
var timeoutId = null;
var timeoutPeriod = 5000;

$(document).ready(function () {
	PreloadBannerImages(function(){
		var socket = SetupSocket();
   	ShowTweetsPerInterval();		
	});   
});

function PreloadBannerImages(getTweets){

	var loaded  = 0;

	for(var i = 0; i < IMAGE_COLLECTION_SIZE; i++)
	{
		var img = new Image();

		img.onload = function(){
			if(++loaded === IMAGE_COLLECTION_SIZE){
         	if(getTweets)
         		getTweets();
        	}            
		};

		img.src = '../images/twitnots_banner' + (i+1) + '.jpg';
		imageArray[i] = img;
		console.log("New image added to queue");
	}
}

function SetupSocket(){
   socket = io.connect('/');    
 	
 	console.log("Socket created");
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
   console.log("Executing show tweets per interval");
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

function SetImage(element, imageUrl, checkIndex){
	
	element.find('.content').css('max-width', $(this).width());
   element.css('background', "url(" + imageUrl + ") no-repeat");
	element.css('background-size', "cover");
	
	if(checkIndex)
		checkIndex();
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
		if (tweetJSON.user.profile_banner_url)
         SetImage($(this), tweetJSON.user.profile_banner_url, null);
  		else
  		{
  			var imageUrl = imageArray[imageIndex].src;
  			SetImage($(this), imageUrl, function(){
	  			imageIndex++;
	  			if(imageIndex == IMAGE_COLLECTION_SIZE)
	  				imageIndex = 0;  				
  			});  			
  		}
			    
		$(this).animate({opacity: 1}, 1500);
	   stopAnimation();
		position = position === 11 ? 1 : position + 1;
	});
}