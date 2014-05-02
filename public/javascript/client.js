var mainFeedRefresh = 0;
var position = 1;
var imageIndex = 0;
var IMAGE_COLLECTION_SIZE = 9;
var HISTORICAL_TWEET_SIZE = 9;
var TWEET_STACK_SIZE = 24;
var imageArray = new Array(IMAGE_COLLECTION_SIZE);
var tweetHistory = new Collection(HISTORICAL_TWEET_SIZE);
var tweetCollection = new Collection(TWEET_STACK_SIZE);
var timeoutId = null;
var timeoutPeriod = 5000;
var historicalTweetsRequired = false;

$(document).ready(function() {
   PreloadBannerImages(function() {
      var socket = SetupSocket();
      ShowTweetsPerInterval();
   });
});

function PreloadBannerImages(startReceivingTweets) {
   var loaded = 0;
   for (var i = 0; i < IMAGE_COLLECTION_SIZE; i++) {
      var img = new Image();
      img.onload = function() {
         if (++loaded === IMAGE_COLLECTION_SIZE) {
            if (startReceivingTweets)
               startReceivingTweets();
         }
      };

      img.src = '../images/twitnots_banner' + (i + 1) + '.jpg';
      imageArray[i] = img;
   }
   
   console.log("Banner images loaded.");
}

function SetupSocket() {
   socket = io.connect('/');

   socket.on('newTweet', function(data) {
      if (data.tweetJSON) {
         //console.log(data.tweetJSON);
         //console.log("Size of tweet: " + JSON.stringify(data.tweetJSON).length);
         tweetCollection.Add(data);
         
      } else {
         console.log("Problem occured for newTweet event.");
      }
   });

   return socket;
}

function ShowTweetsPerInterval() {
   ProcessTweetQueue();
   timeoutId = setTimeout(function() {
      ShowTweetsPerInterval();}, 
      timeoutPeriod
   );
}

function ProcessTweetQueue() {
   var tweetData = tweetCollection.GetLatest();
   if (tweetData)
      SetTweetElement(SpinBall, tweetData.tweetJSON, StopBall);
}

function SpinBall() {
   $("#ball").css("-webkit-animation", "rotateBall 1s linear infinite");
}

function StopBall() {
   $("#ball").css("-webkit-animation", "");
}

function SetImage(element, imageUrl, checkIndex) {
   /*$(element).find('.content').css('max-width', $(this).width());*/
   element.css('background', "url(" + imageUrl + ") no-repeat");
   element.css('background-size', "cover");
   /*$(element).find('.tweet').css('min-height', $(element).find('.content').height());*/

   if (checkIndex)
      checkIndex();
}

function UseImageFromDefaultBannersCollection(historicalInfo) {
   historicalInfo.bannerUrl = imageArray[imageIndex].src;
   imageIndex++;
   if (imageIndex == IMAGE_COLLECTION_SIZE)
   	imageIndex = 0;
}

function SetTweetElement(startAnimation, tweetJSON, stopAnimation) {
   startAnimation();

   // Get div element
   var tweetDiv = $("div[data-position='" + position + "']");
   tweetDiv.animate({ opacity : 0 }, 1000, function() {
      // Parse tweet data and set html
      var element = $(this);
      var tweetData = '';
      tweetData = tweetJSON.text;
      
      // Handle undefined
      if(tweetData)
      	tweetData = tweetData.parseURL().parseUsername().parseHashtag();
      
      var historicalValues = element.data("historicalValues");
      
      var historicalInfo = {};
      historicalInfo.createdAt = tweetJSON.created_at;
      historicalInfo.name = tweetJSON.user.name;
      historicalInfo.html = tweetData;
            
      element.find('p').html(tweetData);
      element.find('.userName').html("@"+tweetJSON.user.screen_name);
      element.find('.userHandle').html(tweetJSON.user.name);
      
      var src = tweetJSON.user.profile_banner_url;
      
      if(!src){
         src = 'http://www.lorempixel.com/500/200';
      }
      
      if(element.find('.media img').length > 0){
      	element.find('.media img').attr('src',src);
      }
      else {
      	element.find('.media').append($('<img src='+src+'/>'));
      }

		position = position === 3 ? 1 : position + 1;
		
		// Setup historical tweet images
		if (src) {
         var img = new Image();
         img.onload = function() {
            historicalInfo.bannerUrl = this.src;		
      	};
      	img.onerror = function() {
            UseImageFromDefaultBannersCollection(historicalInfo);
         };
         img.src = tweetJSON.user.profile_banner_url;
      } else
      	UseImageFromDefaultBannersCollection(historicalInfo);
      		
		element.data("historicalValues", historicalInfo);
		
      element.animate({ opacity : 3000 }, 300);
      stopAnimation();
      if(mainFeedRefresh === 3){
      	mainFeedRefresh = 0;
      	historicalTweetsRequired = true;
      }
      else
      	mainFeedRefresh += 1;
      
      if(historicalTweetsRequired){
      	tweetHistory.Add(historicalValues);
      	$( ".col-md-4" ).each(function( index ) {
				var mapValue = $(this).data("mapvalue");
				var info = tweetHistory.Get(mapValue);
				if(info){					
					$(this).find('p').html(info.html);
					$(this).find('img').attr("src", info.bannerUrl);
					$(this).find('h3').html(info.name);
				}
			});
      }
   });
}