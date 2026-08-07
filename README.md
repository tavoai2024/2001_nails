# 2001 Nails of Woodbury Static Site

Static multi-page website for 2001 Nails of Woodbury, built with plain HTML, CSS, JavaScript, and Vite for local development and production builds.

## Pages

- `index.html` - Home page with hero, services highlights, testimonials, and salon information.
- `services.html` - Manicure, pedicure, kids, and add-on service menu.
- `gallery.html` - Gallery and design inspiration page.
- `contact.html` - Contact details, embedded map, and client-side contact form validation.

## Tech Stack

- Vite 5
- HTML, CSS, and vanilla JavaScript
- Local image assets in `assets/images`
- Shared global styles in `assets/css/global.css`

External runtime assets are loaded from CDNs:

- Google Fonts
- Font Awesome

## Getting Started

Install dependencies:

```sh
npm install
```

Start the local development server:

```sh
npm run dev
```

Build the production site:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Project Structure

```text
.
├── assets/
│   ├── css/
│   │   └── global.css
│   ├── images/
│   └── js/
│       ├── contact.js
│       └── services.js
├── contact.html
├── gallery.html
├── index.html
├── services.html
├── package.json
└── vite.config.js
```

## JavaScript Behavior

- `assets/js/services.js` handles the services page header and mobile navigation.
- `assets/js/contact.js` validates required contact form fields and email format before showing a mock success state.
- Both scripts also handle the sticky header scroll state and mobile navigation toggle on their respective pages.

The contact form is currently front-end only. To process real submissions, connect it to a trusted backend or form service and validate all submitted fields server-side.

## Testing

Run the automated site checks:

```sh
npm test
```

Then build and preview the production site:

```sh
npm run build
npm run preview
```

## GitHub Pages Deployment

The repository includes `.github/workflows/deploy-pages.yml`. Every push to `main` tests the site, builds the `dist/` directory with the `/2001_nails/` base path, and deploys it to GitHub Pages.

For the initial setup, open the repository on GitHub and select **Settings → Pages → Build and deployment → Source → GitHub Actions**. After that, pushes to `main` deploy automatically. The default project URL is:

`https://tavoai2024.github.io/2001_nails/`
