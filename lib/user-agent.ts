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

  // Determine cleaned referrer
  let cleanedReferrer = "direct";
  if (referrerHeader) {
    try {
      const refUrl = new URL(referrerHeader);
      cleanedReferrer = refUrl.hostname.replace(/^www\./, "");
    } catch {
      cleanedReferrer = referrerHeader.slice(0, 100);
    }
  }

  return {
    deviceType,
    browser: browserName,
    referrer: cleanedReferrer,
  };
}
