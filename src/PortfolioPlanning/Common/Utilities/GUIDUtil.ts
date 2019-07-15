export class GUIDUtil {
    /**
     * Returns a GUID such as xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx.
     * @return New GUID.(UUID version 4 = xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
     * @notes Disclaimer: This implementation uses non-cryptographic random number generator so absolute uniqueness is not guaranteed.
     */
    public static newGuid(): string {
        // c.f. rfc4122 (UUID version 4 = xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
        // "Set the two most significant bits (bits 6 and 7) of the clock_seq_hi_and_reserved to zero and one, respectively"
        var clockSequenceHi = (128 + Math.floor(Math.random() * 64)).toString(16);
        return (
            GUIDUtil.oct(8) +
            "-" +
            GUIDUtil.oct(4) +
            "-4" +
            GUIDUtil.oct(3) +
            "-" +
            clockSequenceHi +
            GUIDUtil.oct(2) +
            "-" +
            GUIDUtil.oct(12)
        );
    }

    public static isGuid(str: string): boolean {
        const guidRegex = /^\{?([\dA-F]{8})-?([\dA-F]{4})-?([\dA-F]{4})-?([\dA-F]{4})-?([\dA-F]{12})\}?$/i;
        return guidRegex.test(str);
    }

    /**
     * Generated non-zero octet sequences for use with GUID generation.
     *
     * @param length Length required.
     * @return Non-Zero hex sequences.
     */
    private static oct(length?: number): string {
        if (!length) {
            return Math.floor(Math.random() * 0x10).toString(16);
        }

        var result: string = "";
        for (var i: number = 0; i < length; i++) {
            result += GUIDUtil.oct();
        }

        return result;
    }
}
