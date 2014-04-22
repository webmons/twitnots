var position = 1;
var imageIndex = 0;
var IMAGE_COLLECTION_SIZE = 3;
var tweetQueue = new Array();
var imageArray = new Array(IMAGE_COLLECTION_SIZE);
var timeoutId = null;
var timeoutPeriod = 5000;
var model = null;

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
}

function SetupSocket() {
   socket = io.connect('/');

   socket.on('newTweet', function(data) {
      if (data.tweetJSON) {
         console.log(data.tweetJSON);
         console.log("Size of tweet: " + JSON.stringify(data.tweetJSON).length);
         // Add to queue
         tweetQueue.push(data);
      } else {
         console.log("Problem occured for newTweet event.");
      }
   });

   return socket;
}

function ShowTweetsPerInterval() {
   ProcessTweetQueue();
   timeoutId = setTimeout(function() {
      ShowTweetsPerInterval();
   }, timeoutPeriod);
}

function ProcessTweetQueue() {
   // Get tweet data from queue
   var tweetData = tweetQueue.shift();

   if (tweetData)
      SetTweetElement(SpinBall, tweetData.tweetJSON, StopBall);

   console.log("Tweet data processed, queue size after shift: " + tweetQueue.length);
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

function UseImageFromDefaultBanners(element) {
   var imageUrl = imageArray[imageIndex].src;
   SetImage(element, imageUrl, function() {
      imageIndex++;
      if (imageIndex == IMAGE_COLLECTION_SIZE)
         imageIndex = 0;
   });
}

function SetTweetElement(startAnimation, tweetJSON, stopAnimation) {
   startAnimation();

   // Get div element
   var tweetDiv = $("div[data-position='" + position + "']");
   tweetDiv.animate({
      opacity : 0
   }, 1000, function() {
      // Parse tweet data and set html
      var element = $(this);
      var tweetData = tweetJSON.text;
      tweetData = tweetData.parseURL().parseUsername().parseHashtag();
      element.find('blockquote p').html(tweetData);

      /*
      - Retweet logic?
      element.css('border-color', '#4099FF');
      element.css('border-width', '3px');
      if (tweetJSON.retweeted === true) {
         if (tweetJSON.retweet_count > 0)
            element.css('border-color', 'orange');

         element.css('border-color', 'red');
      }*/

      // Set background of div
      if (tweetJSON.user.profile_banner_url) {
         var img = new Image();
         img.onload = function() {
            SetImage(element.find('#media'), this.src);
         };
         img.onerror = function() {
            UseImageFromDefaultBanners(element);
         };
         img.src = tweetJSON.user.profile_banner_url;
      } else
         UseImageFromDefaultBanners(element);

      element.animate({
         opacity : 1
      }, 1500);
      stopAnimation();
      position = position === 3 ? 1 : position + 1;
   });
}