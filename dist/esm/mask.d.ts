export default function mask(value?: string | number | undefined | null, precision?: string | number, decimalSeparator?: string, thousandSeparator?: string, allowNegative?: boolean, prefix?: string, suffix?: string): {
    value: number;
    maskedValue: string;
};
