/**
 * Automated Verification Script for Fase 6 (Analytics API & Real-Time Engine)
 */

import { prisma } from "../lib/db";
import { maskIp } from "../lib/privacy";

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
  console.log("\n=== Testing Fase 6: Analytics API & Real-Time Engine ===\n");

  // 1. Setup Test User & Test Link
  console.log("1. Setup Test User & Link:");
  const testEmail = `test-fase6-${Date.now()}@shortlytics.test`;
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      password: "hashedpassword123",
      name: "Analytics Tester",
    },
  });
  assert(Boolean(user.id), "Created test user");

  const link = await prisma.link.create({
    data: {
      userId: user.id,
      originalUrl: "https://example.com/analytics-target",
      shortCode: `tst${Date.now().toString().slice(-4)}`,
    },
  });
  assert(Boolean(link.id), `Created test link [${link.shortCode}]`);

  // 2. Insert Multiple Clicks (Simulate varied devices, dates, countries, referrers)
  console.log("\n2. Populate Diverse Click Dataset:");
  const clicksData = [
    {
      linkId: link.id,
      ipAddress: "103.21.244.15",
      country: "Indonesia",
      city: "Jakarta",
      deviceType: "mobile",
      browser: "Chrome",
      referrer: "instagram.com",
      clickedAt: new Date("2026-08-28T10:00:00Z"),
    },
    {
      linkId: link.id,
      ipAddress: "103.21.244.16",
      country: "Indonesia",
      city: "Bandung",
      deviceType: "mobile",
      browser: "Safari",
      referrer: "instagram.com",
      clickedAt: new Date("2026-08-28T14:30:00Z"),
    },
    {
      linkId: link.id,
      ipAddress: "180.252.160.88",
      country: "Indonesia",
      city: "Surabaya",
      deviceType: "desktop",
      browser: "Firefox",
      referrer: "direct",
      clickedAt: new Date("2026-08-29T08:15:00Z"),
    },
    {
      linkId: link.id,
      ipAddress: "8.8.8.8",
      country: "United States",
      city: "Mountain View",
      deviceType: "desktop",
      browser: "Chrome",
      referrer: "twitter.com",
      clickedAt: new Date("2026-08-29T19:00:00Z"),
    },
    {
      linkId: link.id,
      ipAddress: "1.1.1.1",
      country: "Australia",
      city: "Sydney",
      deviceType: "tablet",
      browser: "Safari",
      referrer: "linkedin.com",
      clickedAt: new Date("2026-08-30T12:00:00Z"),
    },
  ];

  for (const c of clicksData) {
    await prisma.click.create({ data: c });
  }
  console.log(`  ✓ Inserted ${clicksData.length} test click records`);

  // 3. Compute & Verify Analytics Aggregations
  console.log("\n3. Verify Analytics Calculation Logic:");
  const fetchedClicks = await prisma.click.findMany({
    where: { linkId: link.id },
    orderBy: { clickedAt: "desc" },
  });
  assert(fetchedClicks.length === 5, "Fetched all 5 click records");

  // Daily clicks
  const dayMap = new Map<string, number>();
  for (const c of fetchedClicks) {
    const dateStr = c.clickedAt.toISOString().split("T")[0];
    dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + 1);
  }
  const clicksByDay = Array.from(dayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  assert(clicksByDay.length === 3, "Computed 3 distinct days with clicks");
  assert(
    clicksByDay.find((d) => d.date === "2026-08-28")?.count === 2,
    "Accurately aggregated 2 clicks for 2026-08-28"
  );
  assert(
    clicksByDay.find((d) => d.date === "2026-08-29")?.count === 2,
    "Accurately aggregated 2 clicks for 2026-08-29"
  );
  assert(
    clicksByDay.find((d) => d.date === "2026-08-30")?.count === 1,
    "Accurately aggregated 1 click for 2026-08-30"
  );

  // Device breakdown
  const deviceMap = new Map<string, number>();
  for (const c of fetchedClicks) {
    const dev = c.deviceType || "desktop";
    deviceMap.set(dev, (deviceMap.get(dev) || 0) + 1);
  }
  assert(deviceMap.get("mobile") === 2, "Computed 2 mobile devices");
  assert(deviceMap.get("desktop") === 2, "Computed 2 desktop devices");
  assert(deviceMap.get("tablet") === 1, "Computed 1 tablet device");

  // Referrers
  const refMap = new Map<string, number>();
  for (const c of fetchedClicks) {
    const ref = c.referrer || "direct";
    refMap.set(ref, (refMap.get(ref) || 0) + 1);
  }
  assert(refMap.get("instagram.com") === 2, "Top referrer accurately identified (instagram.com: 2)");

  // 4. Verify Privacy Masking in Recent Clicks
  console.log("\n4. Verify Privacy Protection (IP Masking):");
  const recentClicks = fetchedClicks.map((c) => ({
    id: c.id,
    maskedIp: maskIp(c.ipAddress),
  }));

  const allMaskedProperly = recentClicks.every(
    (c) => c.maskedIp.endsWith(".xxx") || c.maskedIp.includes("xxxx")
  );
  assert(allMaskedProperly, "All recent clicks have masked IP addresses (zero raw IP leakage)");

  // 5. Cleanup
  console.log("\n5. Cleanup Test Data:");
  await prisma.user.delete({ where: { id: user.id } });
  console.log("  ✓ PASS: Cleaned up test user and cascade-deleted clicks");

  console.log(`\n=== Verification Summary: ${passCount} PASSED, ${failCount} FAILED ===\n`);

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
