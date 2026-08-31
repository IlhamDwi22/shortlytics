/**
 * Automated Verification Script for Fase 5 (Core Shortener & Redirect Engine)
 */

import { prisma } from "../lib/db";
import { generateUniqueShortCode } from "../lib/shortener";
import { validateOriginalUrl } from "../lib/validators";
import { isSelfReferentialOrShortener } from "../lib/anti-loop";

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

async function runTests() {
  console.log("\n=== Testing Fase 5: Core Shortener & Redirect Engine ===\n");

  // 1. Create a dummy test user in Supabase
  console.log("1. Setup Test User:");
  const testEmail = `test-fase5-${Date.now()}@shortlytics.test`;
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      password: "hashedpassword123",
      name: "Fase 5 Tester",
    },
  });
  assert(Boolean(user.id), `Created test user [${user.email}]`);

  // 2. Validate URL and check Anti-Loop
  console.log("\n2. URL Validation & Anti-Loop Integration:");
  const targetUrl = "https://github.com/google/gemini-cli";
  const validation = validateOriginalUrl(targetUrl);
  assert(validation.valid === true, "Validates destination URL successfully");

  const isLoop = isSelfReferentialOrShortener(targetUrl);
  assert(isLoop === false, "Confirmed non-loop destination URL");

  // 3. Generate Short Code & Save Link
  console.log("\n3. Short Link Generation & DB Persistence:");
  const shortCode = await generateUniqueShortCode(prisma);
  assert(typeof shortCode === "string" && shortCode.length === 7, "Generated 7-char Base62 short code");

  const link = await prisma.link.create({
    data: {
      userId: user.id,
      originalUrl: targetUrl,
      shortCode,
    },
  });
  assert(link.shortCode === shortCode, `Saved link with shortCode [${link.shortCode}]`);
  assert(link.userId === user.id, "Link belongs to test user");

  // 4. Simulate Clicks
  console.log("\n4. Click Metric Tracking & Geolocation Simulation:");
  const click1 = await prisma.click.create({
    data: {
      linkId: link.id,
      ipAddress: "103.21.244.xxx",
      country: "Indonesia",
      city: "Jakarta",
      deviceType: "mobile",
      browser: "Chrome",
      referrer: "instagram.com",
    },
  });
  assert(Boolean(click1.id), "Recorded first click (Mobile, Indonesia, Instagram)");

  const click2 = await prisma.click.create({
    data: {
      linkId: link.id,
      ipAddress: "180.252.160.xxx",
      country: "Indonesia",
      city: "Surabaya",
      deviceType: "desktop",
      browser: "Firefox",
      referrer: "direct",
    },
  });
  assert(Boolean(click2.id), "Recorded second click (Desktop, Surabaya, Direct)");

  // 5. Query Link with Count
  console.log("\n5. Query Aggregated Links:");
  const userLinks = await prisma.link.findMany({
    where: { userId: user.id, isActive: true },
    include: { _count: { select: { clicks: true } } },
  });
  assert(userLinks.length === 1, "User has exactly 1 active link");
  assert(userLinks[0]._count.clicks === 2, "Link click count accurately aggregated to 2 clicks");

  // 6. Test Cascade Deletion
  console.log("\n6. Cascade Deletion (Link -> Clicks):");
  await prisma.link.delete({
    where: { id: link.id },
  });

  const remainingClicks = await prisma.click.count({
    where: { linkId: link.id },
  });
  assert(remainingClicks === 0, "Associated Click records cascade deleted automatically");

  // Cleanup test user
  await prisma.user.delete({
    where: { id: user.id },
  });
  console.log("  ✓ PASS: Cleaned up test user");

  console.log(`\n=== Verification Summary: ${passCount + 1} PASSED, ${failCount} FAILED ===\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error("Test execution error:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
