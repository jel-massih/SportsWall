var imgElement = {};

imgElement.create = function(data) {
	var width =  data.images.thumbnail.width;
	var height = data.images.thumbnail.height;
	var imgUrl = data.images.thumbnail.url;
	var bigImgUrl = data.images.standard_resolution.url;
	var caption = "";
	if(data.caption) {
		caption = data.caption.text;
	}

	return '<div class="element"> <a href="'+bigImgUrl+'" class="fancybox" rel="group" title="' + caption + '">' +
	'<img class="pic" src="' + imgUrl + '" height="' + height +'" width="' + width + '"/></a></div>';
}