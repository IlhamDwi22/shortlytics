/**
 * User-Agent & Device Parser Utility
 * Extracts deviceType, browser, and referrer for click tracking (PRD Section 7.1)
 */

import { UAParser } from "ua-parser-js";

export interface ParsedClientDetails {
  deviceType: "desktop" | "mobile" | "tablet" | "bot";
  browser: string;
  referrer: string;
}

/**
 * Parses user-agent and referrer headers from request.
 */
export function parseClientDetails(req: Request): ParsedClientDetails {
  const userAgentString = req.headers.get("user-agent") || "";
  const referrerHeader = req.headers.get("referer") || req.headers.get("referrer") || "";

  // Parse User Agent
  const parser = new UAParser(userAgentString);
  const device = parser.getDevice();
  const browser = parser.getBrowser();

  // Determine device type
  let deviceType: ParsedClientDetails["deviceType"] = "desktop";
  if (device.type === "mobile") {
    deviceType = "mobile";
  } else if (device.type === "tablet") {
    deviceType = "tablet";
  } else if (
    /bot|crawler|spider|crawling|whatsapp|facebookexternalhit|twitterbot|slackbot/i.test(
      userAgentString
    )
  ) {
    deviceType = "bot";
  }

  // Determine browser name
  const browserName = browser.name || "Unknown";

  // Determine cleaned referrer — only http(s) origins are stored; anything else
  // (javascript:, data:, or malformed input) is treated as "direct".
  let cleanedReferrer = "direct";
  if (referrerHeader) {
    const trimmed = referrerHeader.trim().slice(0, 500);
    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const refUrl = new URL(trimmed);
        cleanedReferrer = refUrl.hostname.replace(/^www\./, "").slice(0, 200);
      } catch {
        cleanedReferrer = "direct";
      }
    }
  }

  return {
    deviceType,
    browser: browserName,
    referrer: cleanedReferrer,
  };
}
