// The about-page photo marquee: two rows of photos drifting slowly in
// opposite directions. Either row can be grabbed (mouse or finger) and
// scrubbed backward or forward at the visitor's own pace — release and
// the drift resumes. Photos near the pointer swell gently, macOS-dock
// style, and relax when it moves away.
//
// HOW THE ENDLESS LOOP WORKS: each row's HTML lists its photos twice.
// The row's position wraps at the halfway point — exactly where the
// identical second half lines up with where the first began — so the
// jump is invisible and the strip never runs out.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var DRIFT = 0.32;    // ambient speed, px per frame (~19 px/s)
    var MAGNIFY = 0.3;   // how much a touched photo grows (30%)
    var RADIUS = 150;    // px around the pointer that feels the growth

    document.querySelectorAll(".marquee-row").forEach(function (row) {
      var track = row.querySelector(".marquee-track");
      if (!track) return;

      // the "reverse" row drifts rightward, the other leftward
      var driftSpeed = (reduceMotion ? 0 : DRIFT) * (row.classList.contains("reverse") ? 1 : -1);
      var offset = 0;
      var velocity = driftSpeed;
      var dragging = false;
      var lastX = 0;
      var pointerX = null;    // pointer x over this row (null = pointer away)
      var half = 0;           // width of ONE set of photos
      var imgs = Array.prototype.slice.call(track.querySelectorAll("img"));
      var centers = [];       // each photo's untransformed center inside the track
      var scales = imgs.map(function () { return 1; });
      var magnifyIdle = true; // true when every photo is back at normal size

      function measure() {
        half = track.scrollWidth / 2;
        centers = imgs.map(function (im) { return im.offsetLeft + im.offsetWidth / 2; });
      }
      measure();
      window.addEventListener("load", measure);
      window.addEventListener("resize", measure);

      function wrap() {
        if (half > 0) {
          offset = offset % half;
          if (offset > 0) offset -= half;   // keep within (-half, 0]
        }
      }

      // macOS-dock swell: each photo eases toward a size set by how close
      // it currently is to the pointer (cosine falloff = no sudden edges)
      function magnify() {
        if (pointerX === null && magnifyIdle) return;   // nothing to do
        var rowLeft = row.getBoundingClientRect().left;
        magnifyIdle = true;
        for (var i = 0; i < imgs.length; i++) {
          var target = 1;
          if (pointerX !== null) {
            var d = Math.abs(pointerX - (rowLeft + offset + centers[i]));
            if (d < RADIUS) {
              target = 1 + MAGNIFY * (0.5 + 0.5 * Math.cos(Math.PI * d / RADIUS));
            }
          }
          scales[i] += (target - scales[i]) * 0.3;      // ease toward target
          if (Math.abs(scales[i] - 1) < 0.004) {
            scales[i] = 1;
            imgs[i].style.transform = "";
            imgs[i].style.zIndex = "";
          } else {
            magnifyIdle = false;
            imgs[i].style.transform = "scale(" + scales[i].toFixed(3) + ")";
            imgs[i].style.zIndex = "1";
          }
        }
      }

      function tick() {
        if (!dragging) {
          // momentum from a fling eases back into the ambient drift
          velocity += (driftSpeed - velocity) * 0.03;
          offset += velocity;
          wrap();
          track.style.transform = "translateX(" + offset + "px)";
        }
        magnify();
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);

      row.addEventListener("pointerdown", function (e) {
        dragging = true;
        lastX = e.clientX;
        pointerX = e.clientX;
        velocity = 0;
        row.classList.add("dragging");
        row.setPointerCapture(e.pointerId);
      });

      row.addEventListener("pointermove", function (e) {
        pointerX = e.clientX;
        if (!dragging) return;
        var dx = e.clientX - lastX;
        lastX = e.clientX;
        offset += dx;                                    // drag back = see earlier photos
        velocity = Math.max(-30, Math.min(30, dx));      // remember the hand's speed
        wrap();
        track.style.transform = "translateX(" + offset + "px)";
      });

      function release() {
        dragging = false;
        row.classList.remove("dragging");
      }
      row.addEventListener("pointerup", release);
      row.addEventListener("pointercancel", release);
      row.addEventListener("pointerleave", function () { pointerX = null; });

      // stop the browser's built-in image-drag ghost from hijacking the grab
      track.addEventListener("dragstart", function (e) { e.preventDefault(); });
    });
  });
})();
