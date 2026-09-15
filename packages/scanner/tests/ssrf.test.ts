import { describe, expect, it } from "vitest";
import { isPrivateOrReservedIp } from "../src/ssrf.js";

describe("isPrivateOrReservedIp", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "::1",
    "fc00::1",
    "::ffff:127.0.0.1",
  ])("blocks %s", (ip) => {
    expect(isPrivateOrReservedIp(ip)).toBe(true);
  });

  it.each(["1.1.1.1", "8.8.8.8", "93.184.216.34", "2606:4700:4700::1111"])(
    "allows public address %s",
    (ip) => {
      expect(isPrivateOrReservedIp(ip)).toBe(false);
    }
  );
});
