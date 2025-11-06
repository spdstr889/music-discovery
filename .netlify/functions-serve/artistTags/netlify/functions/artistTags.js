var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/artistTags.js
var artistTags_exports = {};
__export(artistTags_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(artistTags_exports);
var handler = async (event) => {
  try {
    const name = event?.queryStringParameters?.name ? String(event.queryStringParameters.name).trim() : "";
    if (!name) return json(400, { error: "Missing artist name" });
    const headers = { "User-Agent": "CSCI3172-Lab4/1.0 (student@demo)" };
    const sUrl = `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(name)}&fmt=json&limit=1`;
    const sRes = await fetch(sUrl, { headers });
    if (!sRes.ok) return json(502, { error: "MusicBrainz search error", status: sRes.status });
    const sData = await sRes.json();
    const top = sData.artists?.[0];
    if (!top) return json(200, { topTag: null });
    const tUrl = `https://musicbrainz.org/ws/2/artist/${top.id}?inc=tags&fmt=json`;
    const tRes = await fetch(tUrl, { headers });
    if (!tRes.ok) return json(502, { error: "MusicBrainz tag error", status: tRes.status });
    const tData = await tRes.json();
    const tags = (tData.tags || []).sort((a, b) => (b.count || 0) - (a.count || 0));
    const topTag = tags[0]?.name || null;
    return json(200, { topTag });
  } catch (err) {
    console.error("artistTags handler error:", err);
    return json(500, { error: "Server error" });
  }
};
function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=artistTags.js.map
