var imageIndex = 0;
var IMAGE_COLLECTION_SIZE = 15;
var TWEET_STACK_SIZE = 10;
var imageArray = new Array(IMAGE_COLLECTION_SIZE);
var tweetCollection = new Collection(TWEET_STACK_SIZE);
var timeoutId = null;
var timeoutPeriod = 8000;

$(document).ready(function() {
	SetStreamStatus("starting", "STARTING...");
	PreloadBannerImages(function() {
		var socket = SetupSocket();
		ShowTweetsPerInterval();
	});
	
	var $groupA = $("#groupA"), $groupB = $("#groupB"), $groupC = $("#groupC"),
	$groupD = $("#groupD"), $groupE = $("#groupE"), $groupF = $("#groupF"), 
	$groupG = $("#groupG"), $groupH = $("#groupH");
	
	$groupA.click(function(){ManageToggle($(this));});
	$groupB.click(function(){ManageToggle($(this));});
	$groupC.click(function(){ManageToggle($(this));});
	$groupD.click(function(){ManageToggle($(this));});
	$groupE.click(function(){ManageToggle($(this));});
	$groupF.click(function(){ManageToggle($(this));});
	$groupG.click(function(){ManageToggle($(this));});
	$groupH.click(function(){ManageToggle($(this));});
});

function ManageToggle($group){
	var $groupData = $group.next(".groupData");
		
	if(!$groupData.hasClass("show"))
	{
		$groupData.addClass("show");
		$groupData.slideDown("slow");
	}
	else
	{
		$groupData.removeClass("show");
		$groupData.slideUp("slow");
	}
}

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

		img.src = '../images/worldcupimg' + (i + 1) + '.jpg';
		imageArray[i] = img;
	}

	console.log("Banner images loaded.");
}

function SetStreamStatus(statusClass, msg){
	$("#streamStatus").removeClass();
	$("#streamStatus").addClass(statusClass);
	$("#streamStatus").text(msg);
}

function SetupSocket() {
	socket = io.connect('/');

	socket.on('connect', function() {
		SetStreamStatus("online", "ONLINE");
	});

	socket.on('newTweet', function(data) {
		if (data.tweetJSON) {
			tweetCollection.Add(data);
		} else {
			console.log("Problem occured for newTweet event.");
		}
	});

	socket.on('error', function(err) {
		SetStreamStatus("offline", "OFFLINE");
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

function ParseTweetTime(tweetTime){
	var time = new Date().getSeconds() - tweetTime;
	
	if(time <= 0)
		time = 1;
	
	return (time <= 1) ? time.toString() + " second ago" : time.toString() + " seconds ago";  
}

function SetTweetElement(tweetJSON) {
	// Get div element
	var first = $("section").first();
	var remove = $("section:gt(-2)");

	// Clone
	var tweetDiv = $(first).clone();

	// Parse tweet data and set html
	var newElement = tweetDiv;
	var oldElement = remove;
	var tweetData = '';
	tweetData = tweetJSON.tweetText;

	// Handle undefined
	if (tweetData)
		tweetData = tweetData.parseURL().parseUsername().parseHashtag();

	newElement.find('p').html(tweetData);
	newElement.find('.userName').html(("@" + tweetJSON.screenName).parseUsername());
	newElement.find('.tweetTime').html(ParseTweetTime(tweetJSON.tweetTime));
	newElement.find('.profileImg').attr("src", tweetJSON.profileImage);
	
	var src = tweetJSON.bannerImage;

	var img = new Image();
	img.onload = function() {
		SetElementContent(this.src, newElement, oldElement);
	};
	img.onerror = function() {
		SetElementContent(UseImageFromDefaultBannersCollection(), newElement, oldElement);
	};

	if (src)
		img.src = src;
	else
		img.src = UseImageFromDefaultBannersCollection();
}

function SetElementContent(imgSrc, newElement, oldElement) {
	newElement.find('.banner').attr("src", imgSrc);
	newElement.prependTo("article").hide().show("clip", function(){
		oldElement.hide("clip", function() {
			$(this).remove();
		});		
	});
}
