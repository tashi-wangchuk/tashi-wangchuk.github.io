# tashi-wangchuk.github.io

My personal academic website, served by GitHub Pages at
**https://tashi-wangchuk.github.io**.

Plain HTML and CSS — no build step, no framework. What's in this folder
is exactly what visitors see.

## Map of the site

| File / folder | What it is |
|---|---|
| `index.html` | Home / about page (links to the CV PDF) |
| `papers.html` | Publications list |
| `teaching.html` | Lecture notes, davidtong.org style |
| `blog/index.html` | "thoughts" — post list (newest first) |
| `blog/YYYY-MM-DD-*.html` | One file per blog post |
| `courses/*.html` | One page per course, linked from `teaching.html` |
| `css/style.css` | The one stylesheet — fonts, colors, spacing |
| `js/theme.js` | The light/dark toggle (the only JavaScript) |
| `files/` | PDFs: CV, papers, lecture notes, assignments |
| `images/` | Photos |

Every editable spot in the HTML is marked with a `<!-- comment -->`
explaining what to copy and change.

## Common edits

- **Update CV**: replace `files/Tashi-Wangchuk-CV.pdf` with the new PDF
  (keep the same filename and no links need to change).
- **Add a paper**: copy a `pub` block in `papers.html`, newest at the top.
- **Add a course**: copy a `course-card` block in `teaching.html`, then
  duplicate a page in `courses/` and point the card at it. PDFs go in
  `files/teaching/`.
- **New blog post**: duplicate a file in `blog/`, rename with today's
  date, then add one `post-card` box at the top of `blog/index.html`.
- **Change colors**: edit the variables at the top of `css/style.css`.
- **Add a photo to the about-page marquee**: crop it to a square (any
  image editor, or on a Mac:
  `sips -s format jpeg -c SIDE SIDE --cropOffset Y X photo.jpg --out sq.jpg`
  where SIDE is the shorter side of the original), shrink it with
  `sips -Z 340 sq.jpg --out images/marquee/m-XX.jpg`, and pick XX so it
  sits at the right chronological spot. Then add the same `<img>` line
  in BOTH halves of the marquee block in `index.html` — every photo
  appears twice; the duplicate half is what makes the endless loop
  seamless. The drift-and-drag motion lives in `js/marquee.js`.

## Publish changes

```bash
git add .
git commit -m "Describe what you changed"
git push
```

The live site updates a minute or two after `git push`.
