# Le Lani Nail Spa Static Site

Static multi-page website for Le Lani Nail Spa, built with plain HTML, CSS, JavaScript, and Vite for local development and production builds.

## Pages

- `index.html` - Home page with hero, services highlights, testimonials, and salon information.
- `services.html` - Service menu with a cash/credit price toggle.
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

- `assets/js/services.js` updates service prices when visitors switch between cash and credit pricing.
- `assets/js/contact.js` validates required contact form fields and email format before showing a mock success state.
- Both scripts also handle the sticky header scroll state and mobile navigation toggle on their respective pages.

The contact form is currently front-end only. To process real submissions, connect it to a trusted backend or form service and validate all submitted fields server-side.

## Build Notes

The Vite build includes all four HTML entry points configured in `vite.config.js`.

Current build output succeeds, but Vite warns that these page scripts are not bundled because their script tags do not use `type="module"`:

- `/assets/js/services.js` in `services.html`
- `/assets/js/contact.js` in `contact.html`

This is acceptable for the current static setup because the scripts are plain browser JavaScript. Convert them to module scripts if they need bundling, imports, or Vite processing later.

## Testing

There is no automated test suite configured yet. For now, verify changes by running:

```sh
npm run build
```

Then manually check the home, services, gallery, and contact pages in a browser.

## Deployment

Deploy the generated `dist/` directory to any static hosting provider. Make sure the host serves the site from the domain root, because asset paths currently use root-relative URLs such as `/assets/css/global.css`.
