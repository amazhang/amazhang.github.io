var cssBezier = new Ease(BezierEasing(.7,0,.3,1));
var polaroidAngle = "-2deg";

var site = {
	breakpts : {
    sml : 750,
    med : 1024,
    lrg : 1440
  },
  pageTransitionTime : 500,
  transistionEnd : 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
  breakpt : function() {
    var ww = window.innerWidth;
    var breakptval = 'lrg';

    for( var key in site.breakpts){
      if( site.breakpts[key] >= ww ){
        breakptval = key;
        break;
      }
    }
    return breakptval;
  },
  isTouch : function() {
    return !!('ontouchstart' in window);
  },
  textToHTML : function(str){
    // order matters. HTML strip + hardcoding whitespace.
    str = str.replace(/[<]/g, "&lt;")
             .replace(/[>]/g, "&gt;")
             .replace(/\n/g, "<br/>")
             .replace(/[ ]{2}/g, " &nbsp;");
             
    return str;
  },
  htmlToText : function(str){
    // order matters. HTML strip + hardcoding whitespace.
    str = str.replace(/(&lt;)/g, "<")
             .replace(/(&gt;)/g, ">")
             .replace(/(<br\/>)/g, "<br/>")
             .replace(/( &nbsp;){2}/g, "  ");
    return str;
  },
  scrollTo : function($div, animate, onComplete){
  	var spot = $div.offset().top - $(".header").height();
  	var currY = $(window).scrollTop();
  	var diff = Math.abs(currY - spot);
  	
  	if ($div[0].tagName == "SECTION"){
  		var id = $div.attr("class");
			site.switchNavSel(id);
  	}

  	if (typeof animate === "undefined" || animate) time = diff / 3;
  	else time = 0;
  	
		$('html,body').animate({
    	scrollTop : ($div.offset().top - $(".header").height())
  	}, time, function(){
  		if (typeof onComplete !== "undefined") onComplete();
  	});
  },
  getTransformValue : function($el, orientation){
    var matrix = $el.css('transform').replace(/[^0-9\-.,]/g, '').split(',');
    var x = matrix[12] || matrix[4];
    var y = matrix[13] || matrix[5];

    if (x === undefined){
      x = 0;
    }
    if (y === undefined){
      y = 0;
    }

    if (orientation === "x"){
      return x;
    }
    else if (orientation === "y"){
      return y;
    }
  },
  makeModal : function(className, html){
  	// if there's already a modal, don't make another. might break shit
  	if ($(".modal").hasClass("open"))
  		return;

  	$(".modal").addClass(className);
  	var $modal = $("<div />",{
  		class : "modal-wrap",
  		html : html + "<div class='close'></div>"
  	}).appendTo(".modal");

  	$(".modal").addClass("open");

  	setTimeout(function(){
  		$(".modal .modal-wrap").addClass("displayContents");
  	}, 300);

  	$("body").addClass("lock-scroll");
  },
  closeModal : function(){
  	$(".modal .modal-wrap.displayContents").removeClass("displayContents");

  	setTimeout(function(){
  		$(".modal.open").removeClass("open");

  		setTimeout(function(){
  			$(".modal").empty();
  			$(".modal").attr("class", "modal");
  			$("body").removeClass("lock-scroll");
  		}, 300);
  	}, 300);
  },
  setUpHistoryJS : function() {
  	var siteUrl = 'http://'+(document.location.hostname||document.location.host);

    $(document).delegate('a[href^="/"],a[href^="'+siteUrl+'"]', "click", function(e) {
      e.preventDefault();
      History.pushState({}, "", this.pathname);
    });

    History.Adapter.bind(window, 'statechange', function(){
      var State = History.getState();
      $.get(State.url, function(data){
      	
      	// this may fail at some point... can't grab it with "title" for some reason.
        document.title = $($(data)[7]).text();	  	
        
        if (site.breakpt() === "lrg") {
        	
        	var pageTransition = "default";
			  	var urlStr = State.url;
			  	
			  	// if its to a post
			  	if (urlStr.indexOf("/posts") !== -1){
			  		var urlStrSlug = urlStr.substr(urlStr.indexOf("/posts"));
			  		var $link = $("a[href='" + urlStrSlug + "']");
			  		
			  		if ($link.length && $link.find(".post-polaroid").length > 0) {
			  			pageTransition = "listToPost";
			        $(".swap-content:not(.disappearDown)").addClass("disappearDown");
			  		}
			  		else if ($link.length && $link.hasClass("skipLink")){
			  			pageTransition = "postToPost";
			  			
			  			if ($link.hasClass("next")){
				        $(".swap-content-all").addClass("disappearLeft");
			  			}
				      else if ($link.hasClass("prev")){
				        $(".swap-content-all").addClass("disappearRight");
				      }
				    }
			  	}
			  	// if its to a lost
			  	else {
			  		$('.swap-content').addClass("disappearDown");
			  		site.transitionDefault($(data));
			  	}
        	
	        setTimeout(function(){
	       
			  		if (pageTransition == "listToPost") {
			  			
			  			$('.swap-content').html($(data).find('.swap-content').html());
		        	if ($(".swap-content.fixed-wrapper").children(".scrollable-contents").length > 0)
		          	$(".swap-content.fixed-wrapper").addClass("scrollable-wrapper").removeClass("fixed-wrapper");
			  			if ($(".swap-content.scrollable-wrapper").children(".fixed-contents").length > 0)
		          	$(".swap-content.scrollable-wrapper").addClass("fixed-wrapper").removeClass("scrollable-wrapper");
			  			
			  			site.transitionToPost($link, $(data));
			  			
			  		} else if (pageTransition == "default") {
			  			
			  			$('.swap-content').html($(data).find('.swap-content').html());
		        	if ($(".swap-content.fixed-wrapper").children(".scrollable-contents").length > 0)
		          	$(".swap-content.fixed-wrapper").addClass("scrollable-wrapper").removeClass("fixed-wrapper");
			  			if ($(".swap-content.scrollable-wrapper").children(".fixed-contents").length > 0)
		          	$(".swap-content.scrollable-wrapper").addClass("fixed-wrapper").removeClass("scrollable-wrapper");
		          
				  	
				  	} else if (pageTransition == "postToPost") {
				  		$('.swap-content-all').css("transition", "0s");
				  		$('.swap-content-all').toggleClass("disappearLeft disappearRight").html($(data).find('.swap-content-all').html());
							$('.swap-content-all').css("transition", "");
							$("html,body").scrollTop(0);
							$('.swap-content-all').removeClass("disappearLeft disappearRight");
				  	}
	          
	        }, site.pageTransitionTime);
        }
        
        // else use mobile transition
        else {
        	site.mobileTransitionDefault($(data));
        }
        
        // _gaq.push(['_trackPageview', State.url]);
      });
    });
  },
  mobileTransitionDefault : function($data) {
  	$(".swap-content-all").addClass("disappearDown");
  	setTimeout(function() {
  		$("html,body").scrollTop(0);
  		$('.swap-content-all').html($data.find('.swap-content-all').html());
  		$('.swap-content-all, .swap-content').removeClass("disappearDown");
  	}, site.pageTransitionTime);
  },
  transitionDefault : function($data) {
  	TweenLite.to($(".polaroid-wrap"), (site.pageTransitionTime / 1000), {
  		y : 100,
  		alpha : 0,
  		ease : cssBezier,
  		onComplete : function(){
  			$(".page-name").attr("class", $data.find(".page-name").attr("class") );
				$(".scrollable-fixed-wrap").append($data.find(".post-list-wrapper"));
  			$(".post-list-wrapper").css("opacity", "0").css("transform", "translateY(100px)");
  			setTimeout(function(){
  				$(".polaroid-wrap.fixed-wrapper").remove();
  				
  				$('.swap-content, .swap-content-all').removeClass("disappearDown");
  				TweenLite.to($(".post-list-wrapper"), (site.pageTransitionTime / 1000), {
			  		y : 0,
			  		alpha : 1,
			  	});
  			}, 100);
  		}
  	});
  },
  transitionToPost : function($polaroidLink, $data) {
  	var polaroidNum = $polaroidLink.index() + 1;
  	var distFromWindowTop = $polaroidLink.offset().top - $(window).scrollTop();
  	var windowHeight = $(window).height();
  	var polaroidHeight = $polaroidLink.find("li").outerHeight();
  	
  	// the ones we didn't click
  	TweenLite.to($(".post-list a:not(:nth-child(" + polaroidNum + "))"), (site.pageTransitionTime / 1000), {
  		alpha : 0,
  		x : -400,
  		ease : cssBezier,
  	});
  	
  	$('.swap-content, .swap-content-all').removeClass("disappearDown");
		$(".post-list a:nth-child(" + polaroidNum + ") li").css("transform", "rotate(-2deg)");
  	TweenLite.to($(".post-list a:nth-child(" + polaroidNum + ")"), (site.pageTransitionTime / 1000), {
  		y : ((windowHeight - polaroidHeight)/2) - distFromWindowTop,
  		ease : cssBezier,
  		onComplete : function(){
  			$(".page-name").attr("class", $data.find(".page-name").attr("class") );
  			$(".post-list-wrapper").addClass("lock").css("z-index", "2");
				$(".scrollable-fixed-wrap").prepend($data.find(".fixed-wrapper"));
				
  			setTimeout(function(){
  				$(".post-list-wrapper").remove();
  			}, 100);
  		}
  	});
  }
};



$(document).ready(function(){
	site.setUpHistoryJS();
	
	$(document).hammer().on("tap", ".modal .close", function(){
		site.closeModal();
	});
	
	// $(document).hammer().on("tap", ".post-list a", function(){
	// 	site.transitionToPost($(this));
	// });
	
	$(document).keydown(function(e){
		// close modal.
    if ( $(".modal.open").length > 0 ){
      if (e.keyCode == 27) { //esc
        site.closeModal();
      	return;
      }
    }

    var key = e.keyCode;
    switch (key){
      case 39 : //right
      	if ($(".page-name").hasClass("post")){
      		var nextURL = $("div.post a.next.skipLink").attr("href");
      		if (nextURL) History.pushState({}, "", nextURL);
      	}
        break;
      case 37 : //left
      	if ($(".page-name").hasClass("post")){
      		var prevURL = $("div.post a.prev.skipLink").attr("href");
      		if (prevURL) History.pushState({}, "", prevURL);
      	}
        break;
      case 40 : //down
        break;
      case 38 : //up
        break;
      case 27 : //esc
        e.preventDefault();
        if ($(".page-name").hasClass("post")){
      		var homeURL = $("div.post a.homelink").attr("href");
      		if (homeURL) History.pushState({}, "", homeURL);
      	}
        if ( !$(".modal").hasClass("open") ) site.closeModal();
        break;
      default : break;
    }
  });

	$(window).scroll(function(){
		var scroll = $(window).scrollTop();
	});
	
	$(window).resize(function(){
		
	});

});



