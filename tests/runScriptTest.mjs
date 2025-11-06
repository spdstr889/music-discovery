import { JSDOM } from "jsdom";
import assert from "node:assert";

// Create a minimal HTML page similar to index.html
const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Test</title>
</head>
<body>
  <form id="searchForm" aria-describedby="desc">
    <label for="artist">Artist</label>
    <input id="artist" name="artist" type="text" placeholder="e.g., Taylor Swift" required>
    <button type="submit">Go</button>
  </form>
  <p id="status" class="sr-only" aria-live="polite"></p>
  <section id="infoBox" class="card">
    <h2>Tag</h2>
    <p id="tag">None yet</p>
  </section>
  <section id="tracksBox" class="card">
    <h2>Sample Tracks</h2>
    <ul id="tracks"></ul>
  </section>
</body>
</html>`;

// Setup JSDOM
const dom = new JSDOM(html, { runScripts: "outside-only", url: "http://localhost/" });
const { window } = dom;
global.window = window;
global.document = window.document;
global.HTMLElement = window.HTMLElement;
global.Node = window.Node;
global.getComputedStyle = window.getComputedStyle;

// Mock fetch to intercept the two fetches in script.js
const mockArtistTags = { topTag: "pop" };
const mockItunes = {
  results: [
    { trackName: "Song 1", artistName: "Artist A", previewUrl: "https://example.com/p1.mp3" },
    { trackName: "Song 2", artistName: "Artist B", previewUrl: "https://example.com/p2.mp3" }
  ]
};

global.fetch = async (url) => {
  // simple routing by URL
  if (url.startsWith("/.netlify/functions/artistTags")) {
    return { ok: true, json: async () => mockArtistTags };
  }
  if (url.startsWith("https://itunes.apple.com/search")) {
    return { ok: true, json: async () => mockItunes };
  }
  // fallback
  return { ok: false, status: 404, json: async () => ({}) };
};

// Provide a minimal console to suppress noise
global.console = console;

// Import the module under test. It expects to run in module script environment and binds event listeners.
await import("../js/script.js");

// Now simulate a user filling the form and submitting
const input = document.getElementById("artist");
input.value = "Test Artist";

// Submit the form by dispatching submit event
const form = document.getElementById("searchForm");
const submitEvent = new window.Event("submit", { bubbles: true, cancelable: true });

// Because script.js uses async handler, wait for updates using a small timeout
form.dispatchEvent(submitEvent);

// Wait briefly for async handlers
await new Promise(r => setTimeout(r, 200));

// Assertions: tag text updated and tracks rendered
const tag = document.getElementById("tag").textContent;
assert.strictEqual(tag, "pop", "Tag should be updated from mockArtistTags");

const tracks = Array.from(document.querySelectorAll("#tracks li"));
assert.ok(tracks.length >= 1, "At least one track should be rendered");

console.log("Integration test passed: script loaded and updated DOM as expected.");
