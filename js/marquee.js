// The about-page photo marquee: an endless strip of photos that drifts
// slowly on its own, and can be grabbed (mouse or finger) and scrubbed
// at the visitor's own pace. Let go mid-swipe and it glides on with
// your momentum, then eases back into its ambient drift.
//
// HOW THE ENDLESS LOOP WORKS: the HTML lists every photo twice. This
// script wraps the strip's position at the halfway point — exactly
// where the identical second half lines up with where the first half
// started — so the jump is invisible and the strip never runs out.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var row = document.querySelector(".marquee-row");
    var track = document.querySelector(".marquee-track");
    if (!row || !track) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var driftSpeed = reduceMotion ? 0 : -0.45; // px per frame; negative drifts left
    var offset = 0;                            // current strip position
    var velocity = driftSpeed;
    var dragging = false;
    var lastX = 0;
    var half = 0;                              // width of ONE set of photos

    function measure() { half = track.scrollWidth / 2; }
    measure();
    window.addEventListener("load", measure);   // re-measure once images load
    window.addEventListener("resize", measure);

    function wrap() {
      if (half > 0) {
        offset = offset % half;
        if (offset > 0) offset -= half;        // keep within (-half, 0]
      }
    }

    function tick() {
      if (!dragging) {
        // momentum from a fling eases back into the ambient drift
        velocity += (driftSpeed - velocity) * 0.03;
        offset += velocity;
      }
      wrap();
      track.style.transform = "translateX(" + offset + "px)";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    row.addEventListener("pointerdown", function (e) {
      dragging = true;
      lastX = e.clientX;
      velocity = 0;
      row.classList.add("dragging");
      row.setPointerCapture(e.pointerId);
    });

    row.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      offset += dx;
      // remember the hand's speed (capped) so release keeps gliding
      velocity = Math.max(-30, Math.min(30, dx));
      wrap();
      track.style.transform = "translateX(" + offset + "px)";
    });

    function release() {
      dragging = false;
      row.classList.remove("dragging");
    }
    row.addEventListener("pointerup", release);
    row.addEventListener("pointercancel", release);

    // stop the browser's built-in image-drag ghost from hijacking the grab
    track.addEventListener("dragstart", function (e) { e.preventDefault(); });
  });
})();
