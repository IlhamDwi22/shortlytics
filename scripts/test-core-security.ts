/**
 * Automated Verification Script for Fase 4 (Core Security & Business Logic)
 */

import { validateOriginalUrl, MAX_URL_LENGTH } from "../lib/validators";
import { isSelfReferentialOrShortener } from "../lib/anti-loop";
import { generateBase62Code, SHORT_CODE_LENGTH } from "../lib/shortener";
import { maskIp } from "../lib/privacy";
import { parseClientDetails } from "../lib/user-agent";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failCount++;
  }
}

console.log("\n=== Testing Fase 4: Core Security & Business Logic ===\n");

// 1. Test Validators
console.log("1. URL Validator & Scheme Whitelist:");
assert(
  validateOriginalUrl("https://example.com/path?query=1").valid === true,
  "Accepts valid https URL"
);
assert(
  validateOriginalUrl("http://my-blog.org/post/1").valid === true,
  "Accepts valid http URL"
);
assert(
  validateOriginalUrl("javascript:alert(1)").valid === false &&
    validateOriginalUrl("javascript:alert(1)").error === "DISALLOWED_SCHEME",
  "Rejects javascript: scheme (XSS prevention)"
);
assert(
  validateOriginalUrl("data:text/html,<h1>hacked</h1>").valid === false &&
    validateOriginalUrl("data:text/html,<h1>hacked</h1>").error === "DISALLOWED_SCHEME",
  "Rejects data: scheme"
);
assert(
  validateOriginalUrl("file:///C:/secret.txt").valid === false,
  "Rejects file: scheme"
);
assert(
  validateOriginalUrl("not-a-valid-url").valid === false &&
    validateOriginalUrl("not-a-valid-url").error === "INVALID_URL_FORMAT",
  "Rejects non-URL string format"
);
assert(
  validateOriginalUrl("").valid === false &&
    validateOriginalUrl("").error === "EMPTY_URL",
  "Rejects empty URL string"
);

const superLongUrl = "https://example.com/" + "a".repeat(MAX_URL_LENGTH + 10);
assert(
  validateOriginalUrl(superLongUrl).valid === false &&
    validateOriginalUrl(superLongUrl).error === "URL_TOO_LONG",
  `Rejects URLs longer than ${MAX_URL_LENGTH} characters`
);

// 2. Test Anti-Loop & Shortener Blocklist
console.log("\n2. Anti-Loop & Self-Referential Detection:");
assert(
  isSelfReferentialOrShortener("https://shortlytics.app/aZ3kP9") === true,
  "Detects and blocks shortlytics.app (own domain)"
);
assert(
  isSelfReferentialOrShortener("http://localhost:3000/xyz123") === true,
  "Detects and blocks localhost (infinite loop prevention)"
);
assert(
  isSelfReferentialOrShortener("https://bit.ly/my-link") === true,
  "Blocks bit.ly shortener"
);
assert(
  isSelfReferentialOrShortener("https://tinyurl.com/special") === true,
  "Blocks tinyurl.com shortener"
);
assert(
  isSelfReferentialOrShortener("https://is.gd/short") === true,
  "Blocks is.gd shortener"
);
assert(
  isSelfReferentialOrShortener("https://sub.cutt.ly/123") === true,
  "Blocks subdomain of shortener (sub.cutt.ly)"
);
assert(
  isSelfReferentialOrShortener("https://github.com/vercel/next.js") === false,
  "Allows valid external website (github.com)"
);

// 3. Test Base62 CSPRNG Generator
console.log("\n3. Base62 CSPRNG Short Code Generator:");
const generatedCodes = new Set<string>();
let allCodesValid = true;
for (let i = 0; i < 1000; i++) {
  const code = generateBase62Code();
  if (code.length !== SHORT_CODE_LENGTH || !/^[a-zA-Z0-9]+$/.test(code)) {
    allCodesValid = false;
  }
  generatedCodes.add(code);
}
assert(allCodesValid, `All 1000 generated codes have length ${SHORT_CODE_LENGTH} and are alphanumeric`);
assert(generatedCodes.size === 1000, "Zero collisions in 1000 random CSPRNG codes");

// 4. Test IP Privacy Masking
console.log("\n4. Privacy Masking:");
assert(maskIp("192.168.1.100") === "192.168.1.xxx", "Masks IPv4 address correctly");
assert(maskIp("103.245.38.12") === "103.245.38.xxx", "Masks public IPv4 address correctly");
assert(maskIp("127.0.0.1") === "127.0.0.xxx", "Masks localhost IPv4");
assert(
  maskIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334") === "2001:0db8:85a3:xxxx:xxxx:xxxx:xxxx:xxxx",
  "Masks IPv6 address correctly"
);

// 5. Test User-Agent Parsing
console.log("\n5. User-Agent Parsing:");
const fakeMobileReq = new Request("http://localhost:3000/aZ3kP9", {
  headers: {
    "user-agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
    referer: "https://www.instagram.com/",
  },
});
const mobileDetails = parseClientDetails(fakeMobileReq);
assert(mobileDetails.deviceType === "mobile", "Correctly identifies mobile device (iPhone)");
assert(mobileDetails.browser === "Mobile Safari", "Correctly identifies browser (Mobile Safari)");
assert(mobileDetails.referrer === "instagram.com", "Correctly cleans referrer to hostname");

console.log(`\n=== Verification Summary: ${passCount} PASSED, ${failCount} FAILED ===\n`);

if (failCount > 0) {
  process.exit(1);
}
