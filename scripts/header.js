(function() {
    // Variables
    var $curve = document.getElementById("curve");
    var last_known_scroll_position = 0;
    var defaultCurveValue = 350;
    var curveRate = 3;
    var ticking = false;
    var curveValue;
  
    // Handle the functionality
    function scrollEvent(scrollPos) {
      if (scrollPos >= 0 && scrollPos < defaultCurveValue) {
        curveValue = defaultCurveValue - parseFloat(scrollPos / curveRate);
        $curve.setAttribute(
          "d",
          "M 800 300 Q 400 " + curveValue + " 0 300 L 0 0 L 800 0 L 800 300 Z"
        );
      }
    }
  
    // Scroll Listener
    // https://developer.mozilla.org/en-US/docs/Web/Events/scroll
    window.addEventListener("scroll", function(e) {
      last_known_scroll_position = window.scrollY;
  
      if (!ticking) {
        window.requestAnimationFrame(function() {
          scrollEvent(last_known_scroll_position);
          ticking = false;
        });
      }
  
      ticking = true;
    });
  })();
  
  // Select the SVG path element
var pathElement = document.querySelector("svg path");

// Add hover event listeners
pathElement.addEventListener("mouseenter", function () {
  pathElement.setAttribute(
    "d",
    "M 800 300 Q 400 250 0 300 L 0 0 L 800 0 L 800 300 Z"
  );
});

pathElement.addEventListener("mouseleave", function () {
  pathElement.setAttribute(
    "d",
    "M 800 300 Q 400 350 0 300 L 0 0 L 800 0 L 800 300 Z"
  );
});
