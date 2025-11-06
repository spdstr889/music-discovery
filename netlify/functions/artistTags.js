export const handler = async (event) => {
  try {
    // Safely read the name query param and trim it
    const name = event?.queryStringParameters?.name ? String(event.queryStringParameters.name).trim() : "";
    if (!name) return json(400, { error: "Missing artist name" });

    const headers = { "User-Agent": "CSCI3172-Lab4/1.0 (student@demo)" };

    // find artist
    const sUrl = `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(name)}&fmt=json&limit=1`;
    const sRes = await fetch(sUrl, { headers });
    if (!sRes.ok) return json(502, { error: "MusicBrainz search error", status: sRes.status });
    const sData = await sRes.json();
    const top = sData.artists?.[0];
    if (!top) return json(200, { topTag: null });

    // get tags for that artist
    const tUrl = `https://musicbrainz.org/ws/2/artist/${top.id}?inc=tags&fmt=json`;
    const tRes = await fetch(tUrl, { headers });
    if (!tRes.ok) return json(502, { error: "MusicBrainz tag error", status: tRes.status });
    const tData = await tRes.json();

    const tags = (tData.tags || []).sort((a, b) => (b.count || 0) - (a.count || 0));
    const topTag = tags[0]?.name || null;

    return json(200, { topTag });
  } catch (err) {
    // log the error server-side for debugging
    console.error("artistTags handler error:", err);
    return json(500, { error: "Server error" });
  }
};

function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}
