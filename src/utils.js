export function safeText(s) {
  return String(s || "").replace(/[<>&"'`]/g, c => (
    { "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&#39;", "`": "&#96;" }[c]
  ));
}
