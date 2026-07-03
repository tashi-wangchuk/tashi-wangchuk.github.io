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
| `blog/index.html` | Blog post list (newest first) |
| `blog/YYYY-MM-DD-*.html` | One file per blog post |
| `css/style.css` | The one stylesheet — fonts, colors, spacing |
| `files/` | PDFs: CV, papers, lecture notes |
| `images/` | Photos |

Every editable spot in the HTML is marked with a `<!-- comment -->`
explaining what to copy and change.

## Common edits

- **Update CV**: replace `files/Tashi-Wangchuk-CV.pdf` with the new PDF
  (keep the same filename and no links need to change).
- **Add a paper**: copy a `pub` block in `papers.html`, newest at the top.
- **Add lecture notes**: copy a `course` section in `teaching.html`, put
  the PDF in `files/`.
- **New blog post**: duplicate a file in `blog/`, rename with today's
  date, then add one line at the top of the list in `blog/index.html`.
- **Change colors**: edit the variables at the top of `css/style.css`.

## Publish changes

```bash
git add .
git commit -m "Describe what you changed"
git push
```

The live site updates a minute or two after `git push`.
