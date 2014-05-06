String.prototype.parseURL = function() {
   return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
      return url.makeLink(url);
   });
};

String.prototype.parseUsername = function() {
   return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
      var username = u.replace("@","");
      return u.makeLink("http://twitter.com/"+username);
   });
};

String.prototype.parseHashtag = function() {
   return this.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
      var tag = t.replace("#","%23");      
      return t.makeLink("https://twitter.com/search?q="+tag);
   });
};

String.prototype.makeLink = function(url){
	return "<a href='" + url + "' target='_blank'>" + this + "</a>";
};