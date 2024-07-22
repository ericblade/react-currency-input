
export default function mask(
    value?: string | number | undefined | null,
    precision: string | number = 2,
    decimalSeparator = '.',
    thousandSeparator = ',',
    allowNegative = false,
    prefix = '',
    suffix = ''
) {
    precision = Number(precision);
    // provide some default values and arg validation.
    if (precision < 0) { precision = 0; } // precision cannot be negative
    if (precision > 20) { precision = 20; } // precision cannot be greater than 20

    if (value === undefined || value === null || value === '') {
        return { value: 0, maskedValue: '' };
    }

    if (!value) {
        return {
            value: 0,
            maskedValue: `${prefix}0${decimalSeparator}${'0'.repeat(precision)}${suffix}`,
        };
    }

    value = String(value); //if the given value is a Number, let's convert into String to manipulate that

    // extract digits. if no digits, fill in a zero.
    const matchedDigits = value.match(/\d/g) || ['0'];

    let numberIsNegative = false;
    if (allowNegative) {
        let negativeSignCount = (value.match(/-/g) || []).length;
        // number will be negative if we have an odd number of "-"
        // ideally, we should only ever have 0, 1 or 2 (positive number, making a number negative
        // and making a negative number positive, respectively)
        numberIsNegative = negativeSignCount % 2 === 1;

        // if every digit in the array is '0', then the number should never be negative
        if (matchedDigits.every(digit => digit === '0')) {
            numberIsNegative = false;
        }
    }

    // zero-pad a input
    while (matchedDigits.length <= precision) { matchedDigits.unshift('0'); }

    if (precision > 0) {
        // add the decimal separator
        matchedDigits.splice(matchedDigits.length - precision, 0, ".");
    }

    // clean up extraneous digits like leading zeros.
    const digits = Number(matchedDigits.join('')).toFixed(precision).split('');
    let raw = Number(digits.join('')); // not const, we may make it negative later

    const decimalPosition = (precision > 0) ? digits.length - precision - 1 : digits.length;
    if (precision > 0) {
        // set the final decimal separator
        digits[decimalPosition] = decimalSeparator;
    }

    // add in any thousand separators
    for (let x = decimalPosition - 3; x > 0; x = x - 3) {
        digits.splice(x, 0, thousandSeparator);
    }

    // if we have a prefix or suffix, add them in.
    if (prefix.length > 0) { digits.unshift(prefix); }
    if (suffix.length > 0) { digits.push(suffix); }

    // if the number is negative, insert a "-" to
    // the front of the array and negate the raw value
    if (allowNegative && numberIsNegative) {
        digits.unshift('-');
        raw = -raw;
    }

    return {
        value: raw,
        maskedValue: digits.join('').trim()
    };
}
