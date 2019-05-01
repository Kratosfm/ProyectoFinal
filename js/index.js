let aKey = "AIzaSyAR9qtEZGLZCNfmQSWqowE8Mqk1W6y89Ms";
let sVid;
function getFetch(searchTerm,callback){
	$.ajax({
	url:"https://www.googleapis.com/youtube/v3/search",
	method: "GET",
	data: {key: aKey,
		q: searchTerm,
		maxResults: 1,
		part: "snippet",
		type: "video"
		},
	dataType: "json",
	success: responseJson => callback(responseJson),
	error: err => console.log(err)
	});
}
function newPage(pagelink,callback){
	$.ajax({
		url:"https://www.googleapis.com/youtube/v3/search",
		method: "GET",
		data:{key: aKey,
			q : sVid,
			maxResults: 1,
			part: "snippet",
			type: "video",
			pageToken: pagelink
		},
	dataType: "json",
	success: responseJson => callback(responseJson),
	error: err => console.log(err)
	});
}

function ShowRes(data){
	$('.resultados').html('');
	console.log(data);
	$.each(data.items, function(i,vid){
		let videoLink = `https://www.youtube.com/watch?v=${vid.id.videoId}`;
		let videoImage = vid.snippet.thumbnails.medium.url;
		let videoTitle = vid.snippet.title;

		$('.resultados').append(`

			<div class="segment">
					<a href = ${videoLink} target="_blank">
						<img src = ${videoImage} alt="videoThumbnail">
						<p>${videoTitle}</p>
					</a>
			</div>

			`);
	});



	if(data.nextPageToken)
	{
		$("#nPage").attr("page",data.nextPageToken);
		$("#nPage").show();
	}else
	{
		$("#nPage").hide();
	}

	if(data.prevPageToken)
	{
		$("#pPage").attr("page",data.prevPageToken);
		$("#pPage").show();
	}else
	{
		$("#pPage").hide();
	}
}

function watch(algo){
	$('.videoF').on('submit', (event)=> {
		event.preventDefault();
		let vName = algo;
		sVid = vName;
		getFetch(vName,ShowRes);
	});
}

$('#nPage').on('click', (event)=> {
	event.preventDefault();
	newPage($("#nPage").attr("page"),ShowRes);
});

$('#pPage').on('click', (event)=> {
	event.preventDefault();
	newPage($('#pPage').attr("page"),ShowRes);
});
//Cat section
$("#Catgame").click(function(){
    fetch("cat exercise", watch("cat training"));
})

$("#Catnut").click(function(){
    fetch("cat nutrition", watch("cat nutrition"));
})

$("#Catfun").click(function(){
    fetch("cat funny", watch("cat funny"));
})
//Dog section
$("#Doggame").click(function(){
    fetch("dog exercise", watch("dog training"));
})

$("#Dognut").click(function(){
    fetch("dog nutrition", watch("dog nutrition"));
})

$("#Dogfun").click(function(){
    fetch("dog funny", watch("dog funny"));
})

//Fish Section
$("#Fishgame").click(function(){
    fetch("fish exercise", watch("fish training"));
})

$("#Fishnut").click(function(){
    fetch("how to feed your fish", watch("how to feed your fish"));
})

$("#Fishfun").click(function(){
    fetch("fish funny", watch("fish funny"));
})
