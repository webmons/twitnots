var imageIndex = 0;
var IMAGE_COLLECTION_SIZE = 25;
var TWEET_STACK_SIZE = 10;
var imageArray = new Array(IMAGE_COLLECTION_SIZE);
var tweetCollection = new Collection(TWEET_STACK_SIZE);
var timeoutId = null;
var timeoutPeriod = 8000;

$(document).ready(function() {
	SetStreamStatus("starting", "STARTING...");
	PreloadBannerImages(function() {
		SetupSocket();
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
	
	socket.on('latestTweets', function(data){
		if(data.latestTweets){
			SetupContentForInitialViewing(data.latestTweets);
		}
		else{
			console.log("No tweets available for page landing.");
		}
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

function SetupContentForInitialViewing(arrayOfTweets){
	for (var i = 0; i < arrayOfTweets.length; i++)
		SetupInitialContent(arrayOfTweets[i], $('#' + (i + 1)));
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
		SetNewTweetElement(tweetData.tweetJSON);
}

function UseImageFromDefaultBannersCollection() {
	var bannerUrl = imageArray[imageIndex].src;
	imageIndex++;
	if (imageIndex == IMAGE_COLLECTION_SIZE)
		imageIndex = 0;

	return bannerUrl;
}

function ParseTweetTime(tweetTime){
	if(!tweetTime)
		return;
		
	var thenInSeconds = Date.parse(tweetTime) / 1000;
	var nowInSeconds = Date.now() / 1000;
		var time = nowInSeconds - thenInSeconds;
	
	if(time < 1)
		time = 1;
	else
		time = Math.round(time);
	
	return (time <= 1) ? time.toString() + " second ago" : time.toString() + " seconds ago";  
}

function SetupInitialContent(tweetJSON, tweetDiv) {
	SetTweetContent(tweetJSON, tweetDiv);
	SetupImageBanner(tweetJSON, tweetDiv);	
}

function SetNewTweetElement(tweetJSON) {
	// Get div element
	var first = $("section").first();
	var remove = $("section:gt(-2)");

	// Clone
	var tweetDiv = first.clone();

	// Parse tweet data and set html
	var newElement = tweetDiv;
	var oldElement = remove;
	
	SetTweetContent(tweetJSON, newElement);
	SetupImageBanner(tweetJSON, newElement, function(){
		oldElement.hide("clip", function() {			
			$(this).remove();
		});
	});
}

function SetTweetContent(tweetJSON, newElement){
	var tweetData = '';
	tweetData = tweetJSON.tweetText;

	// Handle undefined
	if (tweetData)
		tweetData = tweetData.parseURL().parseUsername().parseHashtag();

	newElement.removeAttr("id");
	newElement.find('.loading').hide();
	newElement.find('p').html(tweetData);
	newElement.find('.userName').html(("@" + tweetJSON.screenName).parseUsername());
	newElement.find('.tweetTime').data("tTime", tweetJSON.tweetTime);
	newElement.find('.tweetTime').html(ParseTweetTime(tweetJSON.tweetTime));
	newElement.find('.profileImg').attr("src", tweetJSON.profileImage);
}

function SetupImageBanner(tweetJSON, newElement, callback){
	var src = tweetJSON.bannerImage;

	var img = new Image();
	img.onload = function() {
		SetSourceOfImage(this.src, newElement, callback);
	};
	img.onerror = function() {
		SetSourceOfImage(UseImageFromDefaultBannersCollection(), newElement, callback);
	};

	if (src)
		img.src = src;
	else
		img.src = UseImageFromDefaultBannersCollection();
}

function SetSourceOfImage(imgSrc, newElement, callback) {	
	$('.tweetTime').each(function(){
		$(this).html(ParseTweetTime($(this).data("tTime")));
	});
	
	newElement.find('.banner').attr("src", imgSrc);	
	newElement.prependTo("article").hide().show("clip", function(){		
		if(callback)
			callback();		
	});
}
