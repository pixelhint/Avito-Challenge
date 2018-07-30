class VimeoFeed{
	constructor(){
		// Vimeo feed
		this.feed = window.vimeoFeed;
		// Pagination vars
		this.currentPage = 0;
		this.perPageFilter = 10;
		this.pageOffsetStart = this.currentPage;
		this.pageOffsetEnd = this.perPageFilter;

		// Likes filter vars
		this.likesFilter = false;
		this.likesNbFilter = 10;

		// Text filter vars
		this.textFilter = false;
		this.textFilterInput = '';


		// Trow console error if vimeo feed is not defined
		if( typeof this.feed == 'undefined' ){
			console.error("Error: undefined vimeo feed data.");
			return false;
		}
		this.feedLength = this.feed.data.length;
		this.descriptionLength = 250;

		// Evenrs intialization
		this.initEvents();
		this.showFeed();
	}

	/*
	* Slices the feed based on the perPage param
	* @return Void
	*/
	sliceFeed(){
		if (this.textFilter) return this.searchFeed();
		if (this.likesFilter) return this.mostLikedUsers();
		return this.getData();
	}

	/*
	* Get videos paginated unfiltred feed
	* @return Array
	*/
	getData(){
		this.feedLength = this.feed.data.length;
		return this.feed.data.slice(this.pageOffsetStart, this.pageOffsetEnd);
	}

	/*
	* Show Most liked users
	* @return Array
	*/
	mostLikedUsers(){
		const mostLiked = this.feed.data.filter(function(item){
			const likes = item.user.metadata.connections.likes.total;
			return ( likes!=null && likes>10 );
		});
		this.feedLength = mostLiked.length;
		return mostLiked.slice(this.pageOffsetStart, this.pageOffsetEnd);
	}

	/*
	* Filter/Search the feed for a test in the video description
	* @return Array
	*/
	searchFeed(){
		const textFilter = this.textFilterInput;
		const filteredResult = this.feed.data.filter(function(item){
			return ( item.description !== null && item.description.includes(textFilter));
		});
		this.feedLength = filteredResult.length;
		return filteredResult.slice(this.pageOffsetStart, this.pageOffsetEnd);
	}

	/*
	* Show the feed based on the perPage param
	* @return Void
	*/
	showFeed(){
		const data = this.sliceFeed();
		this.handleEmptyResult(data);
		this.handlePagination(data);
		for (var i = 0; i < data.length; i++) {
			// console.log('- ' + data[i].user.name);
			this.generateDOM(data[i]);
		}
	}

	/*
	* Handles empty results
	* @return Void
	*/
	handleEmptyResult(data){
		const feedMsg = document.getElementById('feed-msg');
		const feedPagi = document.getElementById('feed-pagination');
		this.clearFeedDOM();
		if( !data || data.length<=0 ) {
			feedMsg.classList.remove('hide');
			feedPagi.classList.add('hide');
			return false;
		}else if( feedPagi.classList.contains('hide') ){
			console.log('sdfsdf');
			feedMsg.classList.add('hide');
			feedPagi.classList.remove('hide');
		}	
	}

	/*
	* Handles pagination display
	* @return Void
	*/
	handlePagination(data){
		const previousBtn = document.getElementById('previous');
		const nextBtn = document.getElementById('next');
		// Next & Previous paginations
		if( this.perPageFilter>=this.feed.data.length ){
			nextBtn.classList.add('disabled');
			previousBtn.classList.add('disabled');
		}else{
			// Next pagination
			if( this.pageOffsetEnd>=this.feedLength ){
				nextBtn.classList.add('disabled');
			}else{
				nextBtn.classList.remove('disabled');
			}
			// Previous pagination
			if( this.pageOffsetStart>0 ){
				previousBtn.classList.remove('disabled');
			}else{
				previousBtn.classList.add('disabled');
			}
		}
	}

	/*
	* Show next page
	* @return Void
	*/
	nextPage(){
		if(this.currentPage>=this.feed.data.length) return false;
		this.pageOffsetStart += this.perPageFilter;
		this.pageOffsetEnd = this.pageOffsetStart+this.perPageFilter;
		++this.currentPage;
		this.showFeed();
	}

	/*
	* Show previous page
	* @return Void
	*/
	previousPage(){
		if(this.currentPage<1) return false;
		this.pageOffsetStart -= this.perPageFilter;
		this.pageOffsetEnd -= this.perPageFilter;
		--this.currentPage;
		this.showFeed();
	}

	/*
	* Generate feed DOM
	* @return Void
	*/
	generateDOM(dataItem){
		// Create feed-item DOM
		let feed = document.getElementById('feed');
		let feedItem = document.createElement('div');
		let feedImgLink = document.createElement('a');
		let feedTitleLink = document.createElement('a');
		let feedImg = document.createElement('img');
			feedImg.src = dataItem.user.pictures.sizes[1].link;
		let feedBody = document.createElement('div');
		let feedTitle = document.createElement('h2');
		let feedDesc = document.createElement('p');
		let feedStats = document.createElement('ul');

		const stats = [
			{
				name: 'Plays',
				total: dataItem.stats.plays
			},
			{
				name: 'Comments',
				total: dataItem.metadata.connections.comments.total
			},
			{
				name: 'Likes',
				total: dataItem.metadata.connections.likes.total
			}
		];

		// Add classes to the feed-item DOM
		feedItem.classList.add('feed-item');
		feedImgLink.classList.add('feed-img');
		feedBody.classList.add('feed-body');
		feedTitle.classList.add('feed-title');
		feedDesc.classList.add('feed-description');
		feedStats.classList.add('feed-stats');


		// Add dummy text to the feed-items (to be deleted)
		feedDesc.innerText = dataItem.description!=null ? dataItem.description.substring(0,this.descriptionLength) + '...' : '';
		feedTitleLink.innerText = dataItem.name;
		feedImgLink.href = feedTitleLink.href = dataItem.link;
		feedImgLink.target = feedTitleLink.target = 'blank';

		
		let statsLi, statsLabel;
		for (var i = 0; i < stats.length; i++) {
			statsLi = document.createElement('li');
			statsLabel = document.createElement('strong');
			statsLi.innerText = stats[i].total;
			statsLabel.innerText = stats[i].name+": ";
			statsLi.insertBefore(statsLabel, statsLi.childNodes[0]);
			feedStats.appendChild(statsLi);
		}
		// Append the DOM to the NODE (to be deleted)
		feedTitle.appendChild(feedTitleLink);
		feedBody.appendChild(feedTitle);
		feedBody.appendChild(feedDesc);
		feedBody.appendChild(feedStats);
		feedImgLink.appendChild(feedImg);
		feedItem.appendChild(feedImgLink);
		feedItem.appendChild(feedBody);

		feed.appendChild(feedItem.cloneNode(true));
	}

	/*
	* Filters events init
	* @return Void
	*/
	initEvents(){
		// Select event
		const $itemsToShow = document.getElementById('items_to_show');
		$itemsToShow.addEventListener("change", function() {
			this.perPageFilter = parseInt($itemsToShow.value);
			this.resetPagValue();
			this.showFeed();
		}.bind(this), false);

		// Checkbox event
		const $mostLikedUsers = document.getElementById('most_liked_users');
		$mostLikedUsers.addEventListener("change", function() {
			const _this = $mostLikedUsers;
			this.likesFilter = (_this.checked) ? true : false;
			this.resetPagValue();
			this.showFeed();
		}.bind(this), false);

		// Textbox event
		const $textFilterBtn = document.getElementById('text_filter_btn');
		$textFilterBtn.addEventListener("click", function() {
			const textFilter = document.getElementById('text_filter').value;
			if( textFilter || 0 !== textFilter.length ){
				this.textFilter = true;
				this.textFilterInput = textFilter.toLowerCase();
			}else{
				this.textFilter = false;
				this.textFilterInput = '';
			}
			this.resetPagValue();
			this.showFeed();
		}.bind(this), false);

		// Textbox event
		const $previousBtn = document.getElementById('previous');
		$previousBtn.addEventListener("click", function(event) {
			event.preventDefault();
			this.previousPage();
		}.bind(this), false);

		// Textbox event
		const $nextBtn = document.getElementById('next');
		$nextBtn.addEventListener("click", function(event) {
			event.preventDefault();
			this.nextPage();
		}.bind(this), false);
	}

	/*
	* Clear feed DOM
	* @return Void
	*/
	clearFeedDOM(){
		document.getElementById('feed').innerHTML = "";
	}

	/*
	* Reset pagination vars
	* @return Void
	*/
	resetPagValue(){
		this.currentPage = 0;
		this.pageOffsetStart = 0;
		this.pageOffsetEnd = this.perPageFilter;
	}
}
var v = new VimeoFeed();