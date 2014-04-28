function TweetHistoryCollection(size){
	var MAX_SIZE = size;
	
	this.stack = [];
	
	this.Add = function(item){		
		if(this.stack.length == MAX_SIZE){
			this.stack.pop();			
		}
		this.stack.unshift(item);
	};
	
	this.Get = function(index){
		if(index >= this.stack.length || index < 0)
			return null;
		return this.stack[index];
	};
}