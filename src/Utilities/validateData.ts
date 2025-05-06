export function validateNumberArray (numbers: number[]) {
    if (!Array.isArray(numbers)) {
        throw new Error('Input is not an array');
    }

    if (numbers.some(n => typeof n !== 'number' || isNaN(n))) {
        throw new Error('Array contains non-numeric values');
    }

    if (numbers.length === 0) {
        throw new Error('Array is empty');
    }
}

export function isNonEmptyArray(value: any): value is any[] {
    return Array.isArray(value) && value.length > 0;
}

export function isValidDate(value: string): boolean {
    return typeof value === "string" && !isNaN(Date.parse(value));
}

export function isValidNumber(value: any, allowZero = false): boolean {
    return typeof value === "number" && !isNaN(value) && (allowZero || value > 0);
}
