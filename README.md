# Web Portfolio (Tailwind CDN)

This project now uses **Tailwind CSS via CDN** directly in each HTML page.

## Current setup

- No local Tailwind build step
- No PostCSS pipeline
- No generated CSS file required
- Theme and interactions are handled in `js/main.js`

## Run locally

You can open files directly, but component loading is best with a local server:

```bash
npm run serve
```

Then open:

```text
http://localhost:8000
```

## Project structure

```text
.
|-- index.html
|-- about.html
|-- contact.html
|-- web-development.html
|-- ui-ux-design.html
|-- consulting.html
|-- components/
|   |-- header.html
|   `-- footer.html
|-- js/
|   `-- main.js
`-- package.json
```

## Notes

- Tailwind config is defined inline in each page before loading `https://cdn.tailwindcss.com`.
- If you change class names, just refresh the browser. No CSS build is needed.
