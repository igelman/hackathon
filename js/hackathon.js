// Hackathon Endpoint
// http://nybdssmodel1.ops.about.com:8256/hackathon/site_trends/comicbooks

// Atlas Endpoint
var token = "eyJleHBpcmVzIjoxNDE0MTk2NzczLCJ1c2VyX2lkIjoiMjc5MzEi.u1uVhgMm1Enb9bbLWjnGJ/X0"; // Atlas endpoints
var atlasEndpoint = "http://nyqaguide2.ops.about.com:5000/search/atlas?access_token=" + token + "url=";

function init() {
	console.log("called init");
	getTrendingTopics ();

}

function getArticleInfo (url) {
	$.getJSON (
		atlasEndpoint + encodeURIComponent(url),
		function (data) {
			if (data.docs.length > 0) {
				var published = Date.parse(data.docs[0].published);
				var refreshed = Date.parse(data.docs[0].refreshed);
				var title = data.docs[0].title;
				var pv = data.docs[0].pv;
				var movement = data.docs[0].movement;
			}
		}
	);
}

function getTrendingTopics () {
	$.getJSON(
		"http://localhost/development/hackathon/js/wikitrends2.json",
		function( data ) {
			var trendingData = data;
			var rows = "";
			$.each (
				trendingData,
				function ( i, v ) {
					rows += constructRow(v);
				}
			);
			drawRows(rows);
			fetchRelated();
			fetchArticleNames();
		}
	);
}

function fetchArticleNames () {

	$("[name='replace-url']").each(
		function () {
			getArticleAndReplaceName($(this));
		}
	)
}

function getArticleAndReplaceName(anchor) {
	$.getJSON(
		atlasEndpoint + encodeURIComponent(anchor.attr('href')),
		function (data) {
			if (data.docs.length > 0) {
				var published = data.docs[0].published;
				var refreshed = data.docs[0].refreshed;
				var title = data.docs[0].title;
				var pv = data.docs[0].pv;
				var movement = data.docs[0].movement;
				anchor.text(title);
				anchor.attr('data-published', published);
				anchor.attr('data-refreshed', refreshed);
				anchor.attr('data-pv', pv);
				anchor.attr('data=movement', movement);
			}
		}
	);
}

function fetchRelated () {
	$("[name='related-topic']").each(
		function (i) {
			getRelatedArticlesFromMid ($(this).attr("data-mid"), $(this));
		}
	);
}

function drawRows (rows) {
	$("#theTableBody").html(rows);
}

function constructTopic ( topic ) {
	
}

function constructRelatedTopics ( relatedTopics ) {
	var topicMatches = "";
	if ( relatedTopics != null ) {
		size = relatedTopics.length;
		topicMatches += "<ul class='nav nav-pills nav-stacked'>";
		$.each (
			relatedTopics,
			function ( i, v ) {
				if (i < 5) {
					topicMatches += "<li class=''><a href='#'>" + v.title + "</a><ul name='related-topic' data-mid='" + v.mid + "'></ul></li>";	
				}
			}
		);
		if (size > 5) {
			topicMatches += "...";
		}
		topicMatches += "</ul>";
	}
	return topicMatches;
}

function getRelatedArticlesFromMid (mid, span) {
	var relatedArticles = "";
	var api = "http://beta.api.dss.about.com:3000/meta_freebase/v1/m/" + mid;
	$.getJSON (
		api,
		function (data) {
		console.log(data);
			if (data != null && data.matches != null) {
				if (data.matches.length) {
	 				span.addClass("dropdown-menu");
				}
				$.each (
					data.matches,
					function ( i, v ) {
						relatedArticles += "<li>" + v.host + "/" + v.path + "</li>";
					}
				);
				span.html(relatedArticles);
				span.parent().addClass("dropdown");
				span.parent().children(":first-child").addClass("dropdown-toggle");
				span.parent().children(":first-child").attr("data-toggle", "dropdown");
				span.parent().children(":first-child").append("<b class='caret'></b>");

			}
		}
	);
	// http://beta.api.dss.about.com:3000/meta_freebase/v1/m/02jq_k

}

function constructArticleMatches ( articles ) {
	
}


function constructRow ( wikiTopic ) {
	var topic = wikiTopic.topic;
	var articles = wikiTopic.articles;
	var articleMatches = "";
	var topicMatches = "";
	var relatedTopics = wikiTopic.related;
	
	if ( articles != null ) {
		$.each (
			articles,
			function ( i, v ) {
				linkToArticle = "http://" + v.host + "/" + v.path;
				linkToEdit = "http://" + v.site + "admin.about.com" + "/" + v.path;
				articleMatches += "<a name= 'replace-url' href='" + linkToArticle +"'>" + v.path.replace(/^.*\//, "") + "</a> <a target='_blank' href='" + linkToEdit + "'><span class='glyphicon glyphicon-edit'></span></a><br>";
			}
		);		
	}
	topicMatches = constructRelatedTopics ( relatedTopics );

	
	var row = "";
	row += "<tr>";
	row += "<td>" + topic + "</td>";
	row += "<td>" + articleMatches + "</td>";
	row += "<td>" + topicMatches + "</td>";
	row += "</tr>";
	//console.log(row);
	return row;
}

