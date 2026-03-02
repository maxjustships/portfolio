# Project Overview
This project is a static personal portfolio website for a "10x Web Developer" named Max. It showcases selected works and provides contact information. The architecture is straightforward, utilizing pure HTML, vanilla JavaScript (ES Modules), and Tailwind CSS via CDN for styling. It features a "neo-brutalism" aesthetic with custom stencil text and distinct hover effects.

## Main Technologies
- **HTML5:** Semantic structure.
- **JavaScript (Vanilla):** Dynamic injection of project cards from `data.js`.
- **Tailwind CSS:** Styling, layout, and responsive design (loaded via CDN).
- **Google Fonts:** Uses the 'Fraunces' serif font.

# Building and Running
As a static website, there is no build step required.

## Local Development Server
A bash script (`serve.sh`) is provided to easily spin up a local server. It relies on Python 3 being installed on your system.

To start the server:
```bash
./serve.sh start
```
The site will be available at `http://localhost:8000`.

To stop the server:
```bash
./serve.sh stop
```

# Development Conventions
- **Data-Driven UI:** Project data (titles, descriptions, links, image paths, tags) should be strictly maintained in `data.js`. The `index.html` file automatically iterates over this data to render the project grid.
- **Tag Management:** Keep the project tags concise and standardized. Before adding a new tag, check `data.js` and reuse an existing one if it fits.
- **Styling:** Adhere to the existing Tailwind utility classes and the custom "neo-brutalism" CSS defined in the `<style>` block of `index.html` (e.g., `neo-brutalism-card`, `neo-brutalism-button-orange`).
- **Assets:** Images and visual assets are stored in the `assets/` directory. Ensure new assets are optimized (e.g., WebP format) to maintain performance.
