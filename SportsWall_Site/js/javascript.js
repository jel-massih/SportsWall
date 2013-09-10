var busy = false;
var bFirst = true;

var nextPaginate = 'https://api.instagram.com/v1/tags/' + getParameterByName("tag") + '/media/recent?access_token=545041878.905cf6d.54beeffe579049319bb4f2e207bd23ce&count=30';

var items = {};

function getData() {
	if(busy || !nextPaginate) {return;}
	document.getElementById('loading').style.display = 'block';
	busy = true;
	jQuery.ajax({
		type: "GET",
		url: nextPaginate,
		dataType: 'jsonp',
		success: function(data){
			if(!data.data) return;
			nextPaginate = data.pagination.next_url;
			for(var i in data.data) {
				addDataEntry(data.data[i]);
				items[data.data[i].id] = true;
			}
			if(bFirst) {
				$(function(){
					$('#tiles').isotope( 'reLayout');
				});
			}
			bFirst = false;
			busy = false;
			document.getElementById('loading').style.display = 'none';
			CheckHeight();
		}
	});
}

function addDataEntry(data) {
	var $newEl = $(imgElement.create(data) );
	$(function(){
		$('#tiles').append($newEl).isotope( 'appended', $newEl );
	});
}

function CheckHeight()
{
	if(document.getElementById('tiles').clientHeight < $(window).height())
	{
		getData();
	}
}

$(window).scroll(function()
{
	var h1 = $(window).scrollTop() + $(window).height();
	var h2 = document.getElementById('tiles');

	if($(window).scrollTop() + $(window).height() > document.getElementById('tiles').clientHeight) {

		getData();
	}
});

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var socket = io.connect('http://sportsfeed.nodejitsu.com/');

socket.on('checkForClients', function(data) {
	console.log("Recieved Client Check!");
	socket.emit('clientCallback', {u_id: data.u_id, tagName: data.tagName});
});

socket.on('newImage', function (path) {
    imageAdded(path);
});

function imageAdded(path)
{
	var query = path.updatePath;
	if(path.tagName != getParameterByName("tag")) { return;}
	
	jQuery.ajax({
		type: "GET",
		url: query,
		dataType: 'jsonp',
		success: function(data){
			if(!data.data) return;
			for(var i in data.data) {
				if(items[data.data[i].id]) {
					console.log("ERR: Exists");
				} else {
					items[data.data[i].id] = true;
					
					prependDataEntry(data.data[i]);
				}
			}
		}
	});
}

function prependDataEntry(data) {
	var $newEl = $(imgElement.create(data) );
	$('#tiles').prepend($newEl).isotope( 'reloadItems' ).isotope({ sortBy: 'original-order' });
}
