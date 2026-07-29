// ==========================================================================
// new/js/helix-marquee.js — 3D Interactive Helical Photo Gallery Engine
// Inspired by Claude Science (https://claude.com/product/claude-science)
// Maps 101 personal photos onto a 3D cylindrical spiral (helix) with
// ambient rotation, drag-to-spin / drag-to-scroll, depth of field,
// and interactive 3D card magnification.
// ==========================================================================

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var stage = document.querySelector(".helix-stage");
    if (!stage) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var TOTAL_IMAGES = 101;
    var RADIUS = window.innerWidth < 768 ? 290 : 420;
    var Y_STEP = 24;            // vertical spacing between helix nodes
    var ANGLE_STEP = 0.31;       // radians per node (~17.8 degrees)
    var DRIFT_SPEED = reduceMotion ? 0 : 0.0022; // ambient 3D Y-rotation speed
    var EASE = 0.12;             // smooth momentum chase rate

    // Create 3D World container
    var world = document.createElement("div");
    world.className = "helix-world";
    stage.appendChild(world);

    // Build 101 photo cards
    var cards = [];
    for (var i = 1; i <= TOTAL_IMAGES; i++) {
      var numStr = i < 10 ? "0" + i : "" + i;
      var card = document.createElement("div");
      card.className = "helix-card";
      card.dataset.index = i - 1;

      var img = document.createElement("img");
      img.src = "../images/marquee/m-" + numStr + ".jpg";
      img.alt = "";
      img.loading = i <= 15 ? "eager" : "lazy";

      card.appendChild(img);
      world.appendChild(card);
      cards.push(card);
    }

    // Recalculate radius on window resize
    window.addEventListener("resize", function () {
      RADIUS = window.innerWidth < 768 ? 290 : 420;
    });

    // Deter right-click context menu over 3D gallery
    stage.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });

    // State variables
    var rotY = 0;
    var targetRotY = 0;
    var offsetY = 0;
    var targetOffsetY = 0;
    var isDragging = false;
    var lastX = 0;
    var lastY = 0;
    var velocityRotY = 0;
    var velocityOffsetY = 0;
    var hoveredIndex = -1;

    // Attach hover listeners to cards
    cards.forEach(function (card, index) {
      card.addEventListener("pointerenter", function () {
        hoveredIndex = index;
      });
      card.addEventListener("pointerleave", function () {
        if (hoveredIndex === index) {
          hoveredIndex = -1;
        }
      });
    });

    // Pointer Dragging / Scrubbing
    stage.addEventListener("pointerdown", function (e) {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velocityRotY = 0;
      velocityOffsetY = 0;
      stage.classList.add("dragging");
      stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener("pointermove", function (e) {
      if (!isDragging) return;
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      velocityRotY = dx * 0.0035;
      velocityOffsetY = dy * 1.1;

      targetRotY += velocityRotY;
      targetOffsetY += velocityOffsetY;
    });

    function releasePointer(e) {
      if (!isDragging) return;
      isDragging = false;
      stage.classList.remove("dragging");
    }

    stage.addEventListener("pointerup", releasePointer);
    stage.addEventListener("pointercancel", releasePointer);

    // Prevent default browser image drag
    stage.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });

    // Render loop
    var totalHeight = TOTAL_IMAGES * Y_STEP;
    var halfHeight = totalHeight / 2;

    function render() {
      // Physics easing
      rotY += (targetRotY - rotY) * EASE;
      offsetY += (targetOffsetY - offsetY) * EASE;

      // Ambient drift when idle
      if (!isDragging && hoveredIndex === -1) {
        targetRotY += DRIFT_SPEED;
      }

      // Update 3D card layout along the helix
      for (var k = 0; k < TOTAL_IMAGES; k++) {
        var cardEl = cards[k];

        // Base height relative to center
        var yBase = (k - TOTAL_IMAGES / 2) * Y_STEP;
        var y = yBase + offsetY;

        // Wrap y endlessly across [-halfHeight, halfHeight]
        while (y < -halfHeight) y += totalHeight;
        while (y > halfHeight) y -= totalHeight;

        // Angle along helix
        var angle = (y / Y_STEP) * ANGLE_STEP + rotY;
        var x = RADIUS * Math.sin(angle);
        var z = RADIUS * Math.cos(angle);

        // Depth calculations (range 0.0 at back to 1.0 at front)
        var depthNorm = (z + RADIUS) / (2 * RADIUS);
        depthNorm = Math.max(0, Math.min(1, depthNorm));

        var scale = 0.72 + 0.38 * depthNorm;
        var opacity = 0.3 + 0.7 * depthNorm;
        var blur = (1 - depthNorm) * 2.2;
        var brightness = 0.55 + 0.45 * depthNorm;
        var isHovered = (k === hoveredIndex);

        if (isHovered) {
          scale *= 1.25;
          opacity = 1.0;
          blur = 0;
          brightness = 1.08;
          z += 50; // Pop forward in 3D
        }

        // Apply 3D matrix transform & depth effects
        cardEl.style.transform =
          "translate3d(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px, " + z.toFixed(1) + "px) " +
          "rotateY(" + angle.toFixed(3) + "rad) " +
          "scale(" + scale.toFixed(3) + ")";

        cardEl.style.filter =
          "brightness(" + brightness.toFixed(2) + ") " +
          "blur(" + blur.toFixed(1) + "px)";

        cardEl.style.opacity = opacity.toFixed(2);
        cardEl.style.zIndex = String(Math.round(z + RADIUS + (isHovered ? 10000 : 0)));
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  });
})();
