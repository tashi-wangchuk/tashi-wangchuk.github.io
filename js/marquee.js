// The about-page photo marquee: two rows of photos drifting slowly in
// opposite directions. Either row can be grabbed (mouse or finger) and
// scrubbed at the visitor's own pace. Photos near the pointer swell like
// macOS-dock icons — the one under the pointer grows most, its neighbours
// a little less, and (as in the real dock) they push each other apart to
// make room, so nothing overlaps. The whole thing eases smoothly.
//
// HOW THE ENDLESS LOOP WORKS: each row's HTML lists its photos twice. The
// position wraps at the halfway point — exactly where the identical second
// half lines up with where the first began — so the jump is invisible.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var DRIFT = 0.32;   // ambient speed, px/frame (~19 px/s)
    var MAG = 0.45;     // how much the focused photo grows (45%)
    var SIGMA = 1.35;   // spread of the swell, in photo-widths (bigger = wider ripple)
    var EASE = 0.18;    // how quickly sizes chase their target (smaller = smoother/slower)

    // deter casual saving: no right-click menu over the photos
    var wrap = document.querySelector(".photo-marquee");
    if (wrap) wrap.addEventListener("contextmenu", function (e) { e.preventDefault(); });

    document.querySelectorAll(".marquee-row").forEach(function (row) {
      var track = row.querySelector(".marquee-track");
      if (!track) return;

      var driftSpeed = (reduceMotion ? 0 : DRIFT) * (row.classList.contains("reverse") ? 1 : -1);
      var offset = 0, velocity = driftSpeed, dragging = false, lastX = 0, pointerX = null;
      var imgs = Array.prototype.slice.call(track.querySelectorAll("img"));
      var half = 0, imgW = 0, gap = 0, step = 0;
      var centers = [];                                  // rest center of each photo, track-local
      var scale = imgs.map(function () { return 1; });   // current (eased) scale per photo

      function measure() {
        half = track.scrollWidth / 2;
        centers = imgs.map(function (im) { return im.offsetLeft + im.offsetWidth / 2; });
        imgW = imgs.length ? imgs[0].offsetWidth : 0;
        step = imgs.length > 1 ? centers[1] - centers[0] : imgW;
        gap = step - imgW;
      }
      measure();
      window.addEventListener("load", measure);
      window.addEventListener("resize", measure);

      function wrapOffset() {
        if (half > 0) { offset = offset % half; if (offset > 0) offset -= half; }
      }

      // ease every photo toward the size it should be given the pointer,
      // then lay them out left-to-right at those sizes so they push apart,
      // anchored so the point under the pointer stays put (macOS dock)
      function dock() {
        var pT = pointerX === null ? null : pointerX - row.getBoundingClientRect().left - offset;
        var idle = true;

        for (var i = 0; i < imgs.length; i++) {
          var target = 1;
          if (pT !== null && step > 0) {
            var du = (centers[i] - pT) / step;
            target = 1 + MAG * Math.exp(-(du * du) / (2 * SIGMA * SIGMA));
          }
          scale[i] += (target - scale[i]) * EASE;
          if (Math.abs(scale[i] - 1) > 0.002) idle = false;
        }
        if (idle && pT === null) {                       // fully at rest — clear transforms once
          for (var j = 0; j < imgs.length; j++) {
            if (imgs[j].style.transform) { imgs[j].style.transform = ""; imgs[j].style.filter = ""; imgs[j].style.zIndex = ""; }
            scale[j] = 1;
          }
          return;
        }

        // displaced layout: accumulate scaled widths, keep the gaps
        var x = 0, disp = [];
        for (var k = 0; k < imgs.length; k++) {
          var w = imgW * scale[k];
          disp[k] = x + w / 2;
          x += w + gap;
        }
        // anchor: find where the pointer sits at rest, keep it there after displacement
        var shift = 0;
        if (pT !== null) {
          var a = 0;
          while (a < centers.length - 1 && centers[a + 1] < pT) a++;
          var span = centers[a + 1] !== undefined ? (centers[a + 1] - centers[a]) : step;
          var t = span ? (pT - centers[a]) / span : 0;
          t = Math.max(0, Math.min(1, t));
          var dispAtPointer = disp[a] + (disp[a + 1] !== undefined ? (disp[a + 1] - disp[a]) * t : 0);
          shift = pT - dispAtPointer;
        }

        for (var m = 0; m < imgs.length; m++) {
          var tx = disp[m] + shift - centers[m];
          var s = scale[m];
          imgs[m].style.transform = "translateX(" + tx.toFixed(2) + "px) scale(" + s.toFixed(3) + ")";
          imgs[m].style.filter = "grayscale(" + (0.15 * (1 - (s - 1) / MAG)).toFixed(3) + ")";
          imgs[m].style.zIndex = s > 1.01 ? String(Math.round(s * 100)) : "";
        }
      }

      function frame() {
        if (!dragging) {
          velocity += (driftSpeed - velocity) * 0.03;    // momentum eases back into drift
          offset += velocity;
          wrapOffset();
          track.style.transform = "translateX(" + offset + "px)";
        }
        dock();
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);

      row.addEventListener("pointerdown", function (e) {
        dragging = true; lastX = e.clientX; pointerX = e.clientX; velocity = 0;
        row.classList.add("dragging"); row.setPointerCapture(e.pointerId);
      });
      row.addEventListener("pointermove", function (e) {
        pointerX = e.clientX;
        if (!dragging) return;
        var dx = e.clientX - lastX; lastX = e.clientX;
        offset += dx;
        velocity = Math.max(-30, Math.min(30, dx));
        wrapOffset();
        track.style.transform = "translateX(" + offset + "px)";
      });
      function release() { dragging = false; row.classList.remove("dragging"); }
      row.addEventListener("pointerup", release);
      row.addEventListener("pointercancel", release);
      row.addEventListener("pointerleave", function () { pointerX = null; });
      track.addEventListener("dragstart", function (e) { e.preventDefault(); });
    });
  });
})();
