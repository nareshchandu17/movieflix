/**
 * @file dns-init.ts
 * @description Core utility services, backend API clients, or database connectors for MovieFlix services.
 * Provides enterprise-grade reliability, streaming controls, and robust type safety.
 * 
 * @author CHANDU NARESH <nareshchandu27@gmail.com>
 * @copyright (c) 2026 MovieFlix. All rights reserved.
 */


import dns from "node:dns";

if (typeof window === "undefined") {
  try {
    if (dns && dns.setDefaultResultOrder) {
      dns.setDefaultResultOrder("ipv4first");
      console.log("[Init] DNS priority set to IPv4 First (Node.js 18+ Compatibility)");
    }
  } catch (e) {
    console.error("[Init] Failed to set DNS priority:", e);
  }
}
