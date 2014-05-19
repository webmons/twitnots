var imageIndex = 0;
var IMAGE_COLLECTION_SIZE = 9;
var TWEET_STACK_SIZE = 10;
var imageArray = new Array(IMAGE_COLLECTION_SIZE);
var tweetCollection = new Collection(TWEET_STACK_SIZE);
var timeoutId = null;
var timeoutPeriod = 8000;

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
		ShowTweetsPerInterval();
	}, timeoutPeriod);
}

function ProcessTweetQueue() {
	var tweetData = tweetCollection.GetLatest();
	if (tweetData)
		SetTweetElement(tweetData.tweetJSON);
}

function UseImageFromDefaultBannersCollection() {
	var bannerUrl = imageArray[imageIndex].src;
	imageIndex++;
	if (imageIndex == IMAGE_COLLECTION_SIZE)
		imageIndex = 0;

	return bannerUrl;
}

function SetTweetElement(tweetJSON) {
	// Get div element
	var first = $("section").first();
	var remove = $("section:gt(-2)");

	// Clone
	var tweetDiv = $(first).clone();

	// Parse tweet data and set html
	var newElement = $(tweetDiv);
	var oldElement = $(remove);
	var tweetData = '';
	tweetData = tweetJSON.text;

	// Handle undefined
	if (tweetData)
		tweetData = tweetData.parseURL().parseUsername().parseHashtag();

	newElement.find('p').html(tweetData);
	newElement.find('span').html("@" + tweetJSON.user.screen_name);
	console.log();
	newElement.find('.profileImg').attr("src", tweetJSON.user.profile_image_url);
	//element.find('.userHandle').html(tweetJSON.user.name);

	var src = tweetJSON.user.profile_banner_url;
	
	var img = new Image();
	img.onload = function() {
		SetElementContent(this.src, newElement, oldElement);
	};
	img.onerror = function() {
		SetElementContent(UseImageFromDefaultBannersCollection(), newElement, oldElement);
	};

	if(src)
		img.src = src;
	else
		img.src = UseImageFromDefaultBannersCollection();
}

function SetElementContent(imgSrc, newElement, oldElement){
	$(newElement).find('.banner').attr("src", imgSrc);
	$(newElement).prependTo("article").hide().show("clip");
	$(oldElement).hide("clip", function() {	$(this).remove();	});
}