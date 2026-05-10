
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
