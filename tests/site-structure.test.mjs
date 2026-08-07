import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pageEntries = ['index.html', 'services.html', 'gallery.html', 'contact.html'];

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
