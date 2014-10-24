// Hackathon Endpoint
// http://nybdssmodel1.ops.about.com:8256/hackathon/site_trends/comicbooks

// Atlas Endpoint
var token = "eyJleHBpcmVzIjoxNDE0MTk2NzczLCJ1c2VyX2lkIjoiMjc5MzEi.u1uVhgMm1Enb9bbLWjnGJ/X0"; // Atlas endpoints
var atlasEndpoint = "http://nyqaguide2.ops.about.com:5000/api/search/atlas?access_token=" + token + "&url=";

//function init() {
//	console.log("called init");
//	getTrendingTopics ();
//
//}

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

function getTrendingTopics (site) {
	$.getJSON(
//		"http://localhost/development/hackathon/js/wikitrends2.json",
        "http://nybdssmodel1.ops.about.com:8256/hackathon/site_trends/" + site,
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
		function (i) {
			getArticleAndReplaceName($(this));
		}
	)
}

function getArticleAndReplaceName(anchor) {
console.log("CALLED getArticleAndReplaceName");
//	$("#debug").ajaxError(
//		function (event, xhr, opt, exception) {
			
			$.getJSON(
				atlasEndpoint + encodeURIComponent(anchor.attr('href')),
				function (data) {
					if (data.docs.length > 0) {
						var published = Date.parse(data.docs[0].published);
						var refreshed = Date.parse(data.docs[0].refreshed);
						var title = data.docs[0].title;
						var pv = data.docs[0].pv;
						var movement = data.docs[0].move;
						
						var info = "Published: " + published + "<br>Refreshed: " + refreshed + "<br>PV: " + pv + "<br>movement: " + movement;
						
						anchor.text(title);
						anchor.attr('data-published', published);
						anchor.attr('data-refreshed', refreshed);
						anchor.attr('data-pv', pv);
						anchor.attr('data-movement', movement);
						anchor.attr('data-original-title', info);
						anchor.attr('data-toggle', 'tooltip');
						anchor.tooltip({
							placement:"top",
							html:true
						});
						console.log("getArticleAndReplaceName for " + title);
					}
				}
			);
	
//		}
//	);

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
				if (i > 0 && i < 6) {
					topicMatches += "<li class=''><a href='#'>" + v.title + "</a><ul name='related-topic' data-mid='" + v.mid + "'></ul></li>";	
				}
			}
		);
/*
		if (size > 5) {
			topicMatches += "...";
		}
*/
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
				articleMatches += "<a name= 'replace-url' href='" + linkToArticle +"'>" + v.path.replace(/^.*\//, "") + "</a> <a target='_blank' href='" + linkToEdit + "'> <img src='img/facebook.png'> <span class='glyphicon glyphicon-edit'></span></a><br>";
			}
		);		
	}
	topicMatches = constructRelatedTopics ( relatedTopics );

    var fb_link = "";
    var wiki_link = "";
    if (wikiTopic.fb_mid) {
        fb_link = "<a href='http://www.freebase.com" + wikiTopic.fb_mid + "'><img src='img/freebase.png'></a>";
    }

    if (wikiTopic.wiki) {
        wiki_link = "<a href='" + wikiTopic.wiki + "'><img src='img/wikipedia-icon.png'></a>";
    }

    var views = "<div style='margin: 5px'>" + wikiTopic.views + " views</div>";

	var row = "";
	row += "<tr>";
	row += "<td>" + "<span style='font-weight: bold'>" + topic + "</span>" + "<span style='margin: 0 5px'>" + fb_link + wiki_link + "</span>" + views + "</td>";
	row += "<td>" + articleMatches + "</td>";
	row += "<td>" + topicMatches + "</td>";
	row += "</tr>";
	//console.log(row);
	return row;
}

