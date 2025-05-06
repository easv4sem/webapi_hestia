import {validateNumberArray, isNonEmptyArray, isValidDate, isValidNumber} from '../src/Utilities/validateData';


describe('validateNumberArray', () => {
    it('should throw an error if input is not an array', () => {
        // @ts-ignore
        expect(() => validateNumberArray(123 as any)).toThrow('Input is not an array');
    });

    it('should throw an error if array contains non-numeric values', () => {
        // @ts-ignore
        expect(() => validateNumberArray([1, 2, '3', 4] as any)).toThrow('Array contains non-numeric values');
    });

    it('should throw an error if array is empty', () => {
        expect(() => validateNumberArray([])).toThrow('Array is empty');
    });

    it('should not throw an error for a valid number array', () => {
        expect(() => validateNumberArray([1, 2, 3, 4])).not.toThrow();
    });
})

describe('isNonEmptyArray', () => {
    it('should return false if its an empty array', () => {
        expect(isNonEmptyArray([])).toBe(false);
    });

    it('should return false if its not an array', () => {
        // @ts-ignore
        expect(isNonEmptyArray(123 as any)).toBe(false);
    })
})

describe('isValidDate', () => {
    it('should return false for invalid date string', () => {
        expect(isValidDate('invalid-date')).toBe(false);
    });

    it('should return true for valid date string', () => {
        expect(isValidDate('2023-10-01')).toBe(true);
    });

    it('should return false for non-string input', () => {
        // @ts-ignore
        expect(isValidDate(123 as any)).toBe(false);
    });
});

describe('isValidNumber', () => {
    it('should return false for NaN', () => {
        expect(isValidNumber(NaN)).toBe(false);
    });

    it('should return false for non-number input', () => {
        // @ts-ignore
        expect(isValidNumber('string' as any)).toBe(false);
    });

    it('should return true for valid number', () => {
        expect(isValidNumber(123)).toBe(true);
    });

    it('should return true for zero if allowZero is true', () => {
        expect(isValidNumber(0, true)).toBe(true);
    });

    it('should return false for zero if allowZero is false', () => {
        expect(isValidNumber(0, false)).toBe(false);
    });
});