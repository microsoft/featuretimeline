export function convertToString(value: any, upperCase: boolean, useLocale: boolean): string {
    let result: string;

    if (value === null || value === undefined) {
        return "";
    }

    result = useLocale ? value.toLocaleString() : value.toString();

    if (upperCase) {
        result = useLocale ? result.toLocaleUpperCase() : result.toUpperCase();
    }

    return result;
}

export function isNullOrWhiteSpace(str: string): boolean {
    return str == null || str.trim() === "";
}

export function defaultComparer(a: string, b: string): number {
    if (a === b) {
        return 0;
    }

    const a1 = convertToString(a, false, false);
    const b1 = convertToString(b, false, false);

    if (a1 === b1) {
        return 0;
    } else if (a1 > b1) {
        return 1;
    } else {
        return -1;
    }
}

export function startsWith(
    str: string,
    prefix: string,
    comparer?: (param1: string, param2: string) => number
): boolean {
    const innerComparer = comparer || defaultComparer;
    return innerComparer(prefix, str.substr(0, prefix.length)) === 0;
}

export function toString(val: any): string {
    if (typeof val === "boolean") {
        return val ? "True" : "False";
    } else if (typeof val === "number") {
        return `${val}`;
    } else if (val instanceof Date) {
        val.toLocaleDateString();
    } else {
        return val;
    }
}
