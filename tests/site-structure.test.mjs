import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pageEntries = ['index.html', 'services.html', 'gallery.html', 'contact.html'];
const brandSurfaceFiles = [...pageEntries, 'README.md', 'package.json', 'package-lock.json'];

test('every Vite page entry exists and contains a document', () => {
  for (const pageEntry of pageEntries) {
    const pagePath = resolve(projectRoot, pageEntry);

    assert.ok(existsSync(pagePath), `${pageEntry} is missing`);
    assert.ok(statSync(pagePath).size > 0, `${pageEntry} is empty`);
    assert.match(readFileSync(pagePath, 'utf8'), /<!doctype html>/i);
  }
});

test('local asset references stay inside /assets and resolve to files', () => {
  const assetReferencePattern = /(?:href|src)=["'](\/assets\/[^"'?#]+)["']/g;

  for (const pageEntry of pageEntries) {
    const html = readFileSync(resolve(projectRoot, pageEntry), 'utf8');

    for (const [, assetReference] of html.matchAll(assetReferencePattern)) {
      assert.ok(!assetReference.includes('..'), `${pageEntry} contains an unsafe asset path`);

      const assetPath = resolve(projectRoot, `.${assetReference}`);
      assert.ok(existsSync(assetPath), `${pageEntry} references missing ${assetReference}`);
    }
  }
});

test('public content uses only the 2001 Nails brand', () => {
  for (const pageEntry of pageEntries) {
    const html = readFileSync(resolve(projectRoot, pageEntry), 'utf8');
    assert.match(html, /2001 Nails/i, `${pageEntry} is missing the current brand`);
  }

  for (const brandSurfaceFile of brandSurfaceFiles) {
    const content = readFileSync(resolve(projectRoot, brandSurfaceFile), 'utf8');
    assert.doesNotMatch(
      content,
      /le[\s-]*lani|lelani/i,
      `${brandSurfaceFile} contains legacy branding`,
    );
  }
});

test('services use one price list and a photo-free banner', () => {
  const servicesHtml = readFileSync(resolve(projectRoot, 'services.html'), 'utf8');
  const servicesScript = readFileSync(resolve(projectRoot, 'assets/js/services.js'), 'utf8');

  assert.doesNotMatch(servicesHtml, /cash rate|credit rate|price-toggle|data-(?:cash|credit)/i);
  assert.doesNotMatch(servicesScript, /price-toggle|data-(?:cash|credit)/i);
  assert.doesNotMatch(servicesHtml, /services-banner\.jpg/i);
});

test('homepage highlights manicure, pedicure, and kids services', () => {
  const homeHtml = readFileSync(resolve(projectRoot, 'index.html'), 'utf8');

  for (const serviceSection of ['manicure', 'pedicure', 'kids']) {
    assert.match(homeHtml, new RegExp(`services\\.html#${serviceSection}`));
  }

  assert.match(homeHtml, /\/assets\/images\/web\/manicure-service\.jpg/);
  assert.match(homeHtml, /\/assets\/images\/stock-pedicure-service\.jpg/);
  assert.match(homeHtml, /\/assets\/images\/web\/kids-service\.jpg/);
  assert.doesNotMatch(homeHtml, /services\.html#(?:enhancements|waxing)/i);
});

test('homepage service overlays keep the photos clearly visible', () => {
  const homeHtml = readFileSync(resolve(projectRoot, 'index.html'), 'utf8');

  assert.match(homeHtml, /rgba\(48, 45, 40, 0\.72\)/);
  assert.match(homeHtml, /rgba\(79, 90, 66, 0\.22\)/);
  assert.doesNotMatch(homeHtml, /rgba\(48, 45, 40, 0\.9[05]\)/);
});

test('gallery displays every provided browser-compatible photo', () => {
  const galleryHtml = readFileSync(resolve(projectRoot, 'gallery.html'), 'utf8');
  const galleryImages = [
    'web/nails1.jpg',
    'web/nails2.jpg',
    'web/nails3.jpg',
    'web/nails4.jpg',
    'web/nails5.jpg',
    'web/nails6.jpg',
    'web/nails7.jpg',
  ];

  for (const galleryImage of galleryImages) {
    const escapedImage = galleryImage.replace('.', '\\.');
    assert.match(
      galleryHtml,
      new RegExp(`src="/assets/gallery/${escapedImage}"[^>]+alt="[^"]+"`),
      `${galleryImage} is missing or lacks alternative text`,
    );
  }

  assert.equal((galleryHtml.match(/class="gallery-image"/g) ?? []).length, galleryImages.length);
  assert.doesNotMatch(galleryHtml, /gallery-placeholder-card|placeholder container/i);
});

test('site uses the current hours, founding year, footer copy, and standard gallery frames', () => {
  for (const pageEntry of pageEntries) {
    const html = readFileSync(resolve(projectRoot, pageEntry), 'utf8');

    assert.match(html, /9:30 AM\s*(?:-|–)\s*7:30 PM/, `${pageEntry} is missing weekday hours`);
    assert.match(html, /9:00 AM\s*(?:-|–)\s*6:00 PM/, `${pageEntry} is missing Saturday hours`);
    assert.match(html, /Sunday(?:<\/strong>)?:?(?:<br>)?\s*Closed/, `${pageEntry} is missing Sunday closure`);
    assert.doesNotMatch(html, /nail salon 55125\s*(?:\||&bull;|•)\s*best nail salon woodbury/i);
    assert.doesNotMatch(html, /10(?::00)?\s*AM\s*(?:-|–)\s*[57](?::00)?\s*PM/i);
  }

  const homeHtml = readFileSync(resolve(projectRoot, 'index.html'), 'utf8');
  assert.match(homeHtml, /Since 2000/);
  assert.doesNotMatch(homeHtml, /Since 2024/);

  const galleryHtml = readFileSync(resolve(projectRoot, 'gallery.html'), 'utf8');
  assert.match(galleryHtml, /\.gallery-card\s*\{[^}]*border-radius:\s*12px;/s);
  assert.doesNotMatch(galleryHtml, /\.gallery-card\s*\{[^}]*var\(--radius-organic\)/s);
});

test('GitHub Pages deployment uses the repository base path and safe navigation', () => {
  const viteConfig = readFileSync(resolve(projectRoot, 'vite.config.js'), 'utf8');
  const workflowPath = resolve(projectRoot, '.github/workflows/deploy-pages.yml');

  assert.match(viteConfig, /base:\s*['"]\/2001_nails\/['"]/);
  assert.ok(existsSync(workflowPath), 'GitHub Pages deployment workflow is missing');

  const workflow = readFileSync(workflowPath, 'utf8');
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /actions\/configure-pages@[a-f0-9]{40}/);
  assert.match(workflow, /actions\/upload-pages-artifact@[a-f0-9]{40}/);
  assert.match(workflow, /actions\/deploy-pages@[a-f0-9]{40}/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);

  for (const pageEntry of pageEntries) {
    const html = readFileSync(resolve(projectRoot, pageEntry), 'utf8');
    assert.doesNotMatch(
      html,
      /href=["']\/(?:["']|(?:index|gallery|services|contact)\.html)/,
      `${pageEntry} contains root-relative navigation that breaks on project Pages`,
    );
    assert.doesNotMatch(
      html,
      /<a\b[^>]*href=["']\/assets\//,
      `${pageEntry} contains a root-relative asset link that Vite cannot rewrite`,
    );
  }

  assert.match(
    readFileSync(resolve(projectRoot, 'services.html'), 'utf8'),
    /<script\s+type="module"\s+src="\/assets\/js\/services\.js"><\/script>/,
  );
  assert.match(
    readFileSync(resolve(projectRoot, 'contact.html'), 'utf8'),
    /<script\s+type="module"\s+src="\/assets\/js\/contact\.js"><\/script>/,
  );

  const galleryHtml = readFileSync(resolve(projectRoot, 'gallery.html'), 'utf8');
  assert.doesNotMatch(
    galleryHtml,
    /<a\b[^>]*class="gallery-photo-link"/,
    'gallery links to source files that are not copied to the Pages artifact',
  );
});
