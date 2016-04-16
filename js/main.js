var cssBezier = new Ease(BezierEasing(.7,0,.3,1));

var site = {
	breakpts : {
    sml : 650,
    med : 960,
    lrg : 1440
  },
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
      console.log(State.url);
      $.get(State.url, function(data){
        document.title = $(data).find("title").text();
        console.log($(data).find(".content"));
        $('.content').html($(data).find('.content'));
        // _gaq.push(['_trackPageview', State.url]);
      });
    });
  }
};



$(document).ready(function(){
	site.setUpHistoryJS();
	
	$(document).hammer().on("tap", ".modal .close", function(){
		site.closeModal();
	});
	
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
        break;
      case 37 : //left
        break;
      case 40 : //down
        break;
      case 38 : //up
        break;
      case 27 : //esc
        e.preventDefault();
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



