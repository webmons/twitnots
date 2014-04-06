var position = 1;
$(document).ready(function () {   
   SetupTweetBoxClick();
   var socket = SetupSocket();
   
});

function SetupSocket(){
   socket = io.connect('/');    
 
   socket.on('newTweet', function (data) {
      if(data.tweetJSON) {                    
         console.log(data.tweetJSON);
         console.log("Size of tweet: " + JSON.stringify(data.tweetJSON).length);
         SetTweetElement(data.tweetJSON);
      } 
      else {
         console.log("Problem occured for newTweet event.");
     }
   });
   
   return socket;   
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

function SetTweetElement(tweetJSON){
   // get div element
   var tweetDiv = $("div[data-position='" + position + "']");
   
   // Parse tweet data and set html
   var tweetData = tweetJSON.text;   
   var tweetInfo = tweetDiv.html(tweetData.parseURL().parseUsername().parseHashtag());
   
   // Prepend image
   if(tweetJSON.user.profile_image_url){
      var tweetImg = $(document.createElement("img"));
      tweetImg.addClass("tweetImg");
      tweetImg.attr('src', tweetJSON.user.profile_image_url);
      tweetImg.prependTo(tweetDiv);
   }
   
   position = position === 11 ? 1 : position + 1;
}