/*
  jQuery moutardeSlider 
  (based on jQuery Coda-Slider v2.0 - http://www.ndoherty.biz/coda-slider)
  MIT license.
*/

// window.loadFirebugConsole();

$(function(){
  // Remove the coda-slider-no-js class from the body
  $("body").removeClass("coda-slider-no-js");
  // Preloader
  $(".coda-slider").children('.panel').hide().end().prepend('<p class="loading">Loading...</p>');
});

var sliderCount = 1;

$.fn.codaSlider = function(settings) {

  settings = $.extend({
    autoHeight: true,
    autoHeightEaseDuration: 1000,
    autoHeightEaseFunction: "easeInOutExpo",
    autoSlide: false,
    autoCycle: false,
    autoSlideInterval: 7000,
    autoSlideStopWhenClicked: true,
    crossLinking: true,
    dynamicArrows: true,
    dynamicArrowLeftText: "&#171; left",
    dynamicArrowRightText: "right &#187;",
    dynamicTabs: true,
    dynamicTabsAlign: "center",
    dynamicTabsPosition: "top",
    externalTriggerSelector: "a.xtrig",
    firstPanelToLoad: 1,
    panelTitleSelector: "h2.title",
    slideEaseDuration: 1000,
    slideEaseFunction: "easeInOutExpo"
  }, settings);
  
  return this.each(function(){
    
    // Uncomment the line below to test your preloader
    // alert("Testing preloader");
    
    var slider = $(this);
    
    // If we need arrows
    if (settings.dynamicArrows) {
      slider.parent().addClass("arrows");
      slider.before('<div class="coda-nav-left" id="coda-nav-left-' + sliderCount + '"><a href="#">' + settings.dynamicArrowLeftText + '</a></div>');
      slider.after('<div class="coda-nav-right" id="coda-nav-right-' + sliderCount + '"><a href="#">' + settings.dynamicArrowRightText + '</a></div>');
    };
    
    var panelWidth = slider.find(".panel").width();
    var panelCount = slider.find(".panel").size();
    var panelContainerWidth = panelWidth*panelCount;
    var navClicks = 0; // Used if autoSlideStopWhenClicked = true
    
    // Surround the collection of panel divs with a container div (wide enough for all panels to be lined up end-to-end)
    $('.panel', slider).wrapAll('<div class="panel-container"></div>');
    // Specify the width of the container div (wide enough for all panels to be lined up end-to-end)
    $(".panel-container", slider).css({ width: panelContainerWidth });

    // Initial Panel Load
    if (settings.crossLinking && location.hash && parseInt(location.hash.slice(1)) <= panelCount) {
      var currentPanel = parseInt(location.hash.slice(1));
    }
    else if (settings.firstPanelToLoad != 1 && settings.firstPanelToLoad <= panelCount) { 
      var currentPanel = settings.firstPanelToLoad;
    } 
    else { 
      var currentPanel = 1;
    };
    
    moveToPanel(currentPanel);
    
    $("#coda-nav-left-" + sliderCount + " a").click(function(){
      navClicks++;
      var navList = $(this).parents('div.coda-slider-wrapper').find('.coda-nav ul');
            
      if (currentPanel == 1) {
        alterPanelHeight(panelCount - 1);
        currentPanel = panelCount;
      } 
      else {
        currentPanel -= 1;
        alterPanelHeight(currentPanel - 1);
      };

      moveToPanel(currentPanel);
      
      if (settings.crossLinking) { location.hash = currentPanel }; // Change the URL hash (cross-linking)
      return false;
    });
    
    $('#coda-nav-right-' + sliderCount + ' a').click(function(){
      navClicks++;
      var navList = $(this).parents('div.coda-slider-wrapper').find('.coda-nav ul');
      
      if (currentPanel == panelCount) {
        currentPanel = 1;
        alterPanelHeight(0);
      } 
      else {
        alterPanelHeight(currentPanel);
        currentPanel += 1;
      };
      
      moveToPanel(currentPanel);
      
      if (settings.crossLinking) { location.hash = currentPanel }; // Change the URL hash (cross-linking)
      return false;
    });
      
    
    // If we need a dynamic menu
    if (settings.dynamicTabs) {
      var dynamicTabs = '<div class="coda-nav" id="coda-nav-' + sliderCount + '"><ul></ul></div>';
      switch (settings.dynamicTabsPosition) {
        case "bottom":
          slider.parent().append(dynamicTabs);
          break;
        default:
          slider.parent().prepend(dynamicTabs);
          break;
      };
      ul = $('#coda-nav-' + sliderCount + ' ul');
      // Create the nav items
      $('.panel', slider).each(function(n) {
        ul.append('<li class="tab' + (n+1) + '"><a href="#' + (n+1) + '">' + $(this).find(settings.panelTitleSelector).text() + '</a></li>');                       
      });
      navContainerWidth = slider.width() + slider.siblings('.coda-nav-left').width() + slider.siblings('.coda-nav-right').width();
      ul.parent().css({ width: navContainerWidth });
      switch (settings.dynamicTabsAlign) {
        case "center":
          ul.css({ width: ($("li", ul).width() + 2) * panelCount });
          break;
        case "right":
          ul.css({ float: 'right' });
          break;
      };
    };
      
    // If we need a tabbed nav
    $('#coda-nav-' + sliderCount + ' a').each(function(z) {
      // What happens when a nav link is clicked
      $(this).bind("click", function() {
        navClicks++;
        alterPanelHeight(z);
        moveToPanel(z + 1)
        if (!settings.crossLinking) { return false }; // Don't change the URL hash unless cross-linking is specified
      });
    });
    
    // External triggers (anywhere on the page)
    $(settings.externalTriggerSelector).each(function() {
      // Make sure this only affects the targeted slider
      if (sliderCount == parseInt($(this).attr("rel").slice(12))) {
        $(this).bind("click", function() {
          navClicks++;
          targetPanel = parseInt($(this).attr("href").slice(1));
          offset = - (panelWidth*(targetPanel - 1));
          alterPanelHeight(targetPanel - 1);
          currentPanel = targetPanel;
          // Switch the current tab:
          slider.siblings('.coda-nav').find('a').removeClass('current').parents('ul').find('li:eq(' + (targetPanel - 1) + ') a').addClass('current');
          // Slide
          $('.panel-container', slider).animate({ marginLeft: offset }, settings.slideEaseDuration, settings.slideEaseFunction);
          if (!settings.crossLinking) { return false }; // Don't change the URL hash unless cross-linking is specified
        });
      };
    });
      
    // Specify which tab is initially set to "current". Depends on if the loaded URL had a hash or not (cross-linking).
    if (settings.crossLinking && location.hash && parseInt(location.hash.slice(1)) <= panelCount) {
      $("#coda-nav-" + sliderCount + " a:eq(" + (location.hash.slice(1) - 1) + ")").addClass("current");
    // If there's no cross-linking, check to see if we're supposed to load a panel other than Panel 1 initially...
    } else if (settings.firstPanelToLoad != 1 && settings.firstPanelToLoad <= panelCount) {
      $("#coda-nav-" + sliderCount + " a:eq(" + (settings.firstPanelToLoad - 1) + ")").addClass("current");
    // Otherwise we must be loading Panel 1, so make the first tab the current one.
    } else {
      $("#coda-nav-" + sliderCount + " a:eq(0)").addClass("current");
    };
    
    // Set the height of the first panel
    if (settings.autoHeight) {
      panelHeight = $('.panel:eq(' + (currentPanel - 1) + ')', slider).height();
      slider.css({ height: panelHeight });
    };
    
    // Trigger autoSlide
    if (settings.autoSlide) {
      slider.ready(function() {
        setTimeout(autoSlide,settings.autoSlideInterval);
      });
    };
    
    function alterPanelHeight(x) {
      if (settings.autoHeight) {
        panelHeight = $('.panel:eq(' + x + ')', slider).height()
        slider.animate({ height: panelHeight }, settings.autoHeightEaseDuration, settings.autoHeightEaseFunction);
      };
    };
    
    function autoSlide() {
      if (navClicks == 0 || !settings.autoSlideStopWhenClicked) {
        if (currentPanel == panelCount) {
          if(!settings.autoCycle)
            return false;
          currentPanel = 1;
        } else {
          currentPanel += 1;
        };
        alterPanelHeight(currentPanel - 1);
        moveToPanel(currentPanel);
        
        setTimeout(autoSlide,settings.autoSlideInterval);
      };
    };
    
    function moveToPanel(targetPanelIndex) {
      // Navigation
      var navList = slider.parents('div.coda-slider-wrapper').find('.coda-nav ul');
      var currentLink = navList.find('li:eq(' + (targetPanelIndex - 1) + ') a');

      navList.find('a').removeClass('current');
      currentLink.addClass('current');
      
      // Panel itself
      var offset = - panelWidth*(targetPanelIndex -1);
      $('.panel-container', slider).animate({ marginLeft: offset }, 
                                            settings.slideEaseDuration,
                                            settings.slideEaseFunction);
                                            
      slider.find('div.panel-container div.panel').removeClass('current');
      slider.find('div.panel-container div.panel:eq('+ (targetPanelIndex - 1) + ')').addClass('current');
    };
    
    // Kill the preloader
    $('.panel', slider).show().end().find("p.loading").remove();
    slider.removeClass("preload");
    
    sliderCount++;
    
  });
};