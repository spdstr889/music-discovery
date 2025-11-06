import test from "node:test";
import assert from "node:assert";
import { safeText } from "../src/utils.js";

test("safeText escapes basic HTML", () => {
  const out = safeText('<x>"&\'`</x>');
  assert.equal(out.includes("&lt;x&gt;"), true);
  assert.equal(out.includes("&quot;"), true);
  assert.equal(out.includes("&amp;"), true);
  assert.equal(out.includes("&#39;"), true);
  assert.equal(out.includes("&#96;"), true);
});
