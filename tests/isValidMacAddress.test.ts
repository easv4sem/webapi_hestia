import { RegexUtils } from "../src/Utilities/regexUtils";

describe("RegexUtils", () => {
    describe("isValidMacAddress", () => {
        it("should return false for undefined input", () => {
            expect(RegexUtils.isValidMacAddress(undefined)).toBe(false);
        });

        it("should return false for null input", () => {
            expect(RegexUtils.isValidMacAddress(null)).toBe(false);
        });

        it("should return false for empty string input", () => {
            expect(RegexUtils.isValidMacAddress("")).toBe(false);
        });

        it("should return false for invalid MAC address format", () => {
            expect(RegexUtils.isValidMacAddress("invalid-mac-address")).toBe(false);
        });

        it("should return true for valid MAC address format with colons", () => {
            expect(RegexUtils.isValidMacAddress("00:1A:2B:3C:4D:5E")).toBe(true);
        });

        it("should return true for valid MAC address format with dashes", () => {
            expect(RegexUtils.isValidMacAddress("00-1A-2B-3C-4D-5E")).toBe(true);
        });

        it("should return true for valid MAC address format with mixed case", () => {
            expect(RegexUtils.isValidMacAddress("00:1a:2B:3C:4d:5E")).toBe(true);
        });

        it("should not run regex on invalid input", () => {
            const spy = jest.spyOn(RegExp.prototype, "test");

            RegexUtils.isValidMacAddress(undefined);
            RegexUtils.isValidMacAddress(null as any);
            RegexUtils.isValidMacAddress("");

            expect(spy).not.toHaveBeenCalled();

            spy.mockRestore();
        });
    });
});
