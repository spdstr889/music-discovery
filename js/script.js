import { safeText } from "../src/utils.js";

const form = document.getElementById("searchForm");
const artistInput = document.getElementById("artist");
const statusBox = document.getElementById("status");
const tagBox = document.getElementById("tag");
const tracksList = document.getElementById("tracks");

function setStatus(msg, show = true) {
  statusBox.textContent = msg;
  statusBox.classList.toggle("sr-only", !show);
}

async function toJSON(res) {
  if (!res.ok) throw new Error("Network error");
  return res.json();
}

function renderTracks(items) {
  tracksList.innerHTML = "";
  items.forEach(t => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${safeText(t.trackName)}</strong><br>
      <small>${safeText(t.artistName)}</small>
      <audio controls src="${t.previewUrl}" aria-label="Preview ${safeText(t.trackName)} by ${safeText(t.artistName)}"></audio>
    `;
    tracksList.appendChild(li);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = artistInput.value.trim();
  if (!name) return;

  setStatus("Finding tag...");
  tagBox.textContent = "Loading...";
  tracksList.innerHTML = "";

  try {
    // server side: MusicBrainz via Netlify function
    const tagRes = await fetch(`/.netlify/functions/artistTags?name=${encodeURIComponent(name)}`).then(toJSON);
    const topTag = tagRes.topTag || null;

    if (!topTag) {
      tagBox.textContent = "No tag found. Try another artist.";
      setStatus("Done", false);
      return;
    }

    tagBox.textContent = topTag;

    setStatus("Loading tracks...");
    // client side: iTunes Search API (no key)
    const itRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(topTag)}&entity=song&limit=12`)
      .then(toJSON);

    const tracks = (itRes.results || [])
      .filter(r => r.previewUrl)
      .map(r => ({ trackName: r.trackName, artistName: r.artistName, previewUrl: r.previewUrl }));

    renderTracks(tracks);
    setStatus("Done", false);
  } catch {
    setStatus("Something went wrong. Please try again.");
    tagBox.textContent = "Error.";
  }
});
