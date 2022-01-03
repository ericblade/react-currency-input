/// <reference types="react" />
declare module "mask" {
    export default function mask(value?: string | number | undefined | null, precision?: string | number, decimalSeparator?: string, thousandSeparator?: string, allowNegative?: boolean, prefix?: string, suffix?: string): {
        value: number;
        maskedValue: string;
    };
}
declare module "index" {
    import React, { RefObject } from 'react';
    export type CurrencyInputProps = {
        onChangeEvent?: (event: Event, maskedValue: string, value: number | string) => void;
        onClick?: (event: Event) => void;
        onFocus?: (event: FocusEvent) => void;
        onBlur?: (event: FocusEvent) => void;
        value?: number | string;
        decimalSeparator?: string;
        thousandSeparator?: string;
        precision?: number | string;
        inputType?: string;
        allowNegative?: boolean;
        allowEmpty?: boolean;
        prefix?: string;
        suffix?: string;
        selectAllOnFocus?: boolean;
        autoFocus?: boolean;
        style?: React.CSSProperties;
        id?: string;
        tabIndex?: number;
    };
    type CurrencyInputState = {
        maskedValue: string;
        value: number | string;
        customProps: any;
    };
    class CurrencyInput extends React.Component<CurrencyInputProps, CurrencyInputState> {
        static defaultProps: {
            onChangeEvent: (event: any, maskedValue: any, value: any) => void;
            autoFocus: boolean;
            value: string;
            decimalSeparator: string;
            thousandSeparator: string;
            precision: string;
            inputType: string;
            allowNegative: boolean;
            allowEmpty: boolean;
            prefix: string;
            suffix: string;
            selectAllOnFocus: boolean;
        };
        inputSelectionStart: number;
        inputSelectionEnd: number;
        theInput: RefObject<HTMLInputElement>;
        constructor(props: CurrencyInputProps);
        /**
         * Exposes the current masked value.
         *
         * @returns {String}
         */
        getMaskedValue(): string;
        /**
         * General function used to cleanup and define the final props used for rendering
         * @returns {{ maskedValue: {String}, value: {Number}, customProps: {Object} }}
         */
        static prepareProps(props: any): {
            maskedValue: string;
            value: number;
            customProps: any;
        };
        /**
         * Component lifecycle function.
         * Invoked when a component is receiving new props. This method is not called for the initial render.
         *
         * @param nextProps
         * @see https://facebook.github.io/react/docs/component-specs.html#updating-componentwillreceiveprops
         */
        /**
         * Component lifecycle function.
         * @returns {XML}
         * @see https://facebook.github.io/react/docs/react-component.html#componentdidmount
         */
        componentDidMount(): void;
        /**
         * Component lifecycle function
         * @returns {XML}
         * @see https://facebook.github.io/react/docs/react-component.html#componentwillupdate
         */
        getSnapshotBeforeUpdate(prevProps: Readonly<CurrencyInputProps>, prevState: Readonly<CurrencyInputState>): {
            inputSelectionStart: number;
            inputSelectionEnd: number;
        };
        /**
         * Component lifecycle function.
         * @returns {XML}
         * @see https://facebook.github.io/react/docs/react-component.html#componentdidupdate
         */
        componentDidUpdate(prevProps: any, prevState: any, snapshot: any): void;
        /**
         * Set selection range only if input is in focused state
         * @param node DOMElement
         * @param start number
         * @param end number
         */
        setSelectionRange(node: HTMLInputElement, start: number, end: number): void;
        /**
         * onChange Event Handler
         * @param event
         */
        handleChangeEvent(event: any): void;
        /**
         * onFocus Event Handler
         * @param event
         */
        handleFocus(event: any): void;
        handleBlur(event: any): void;
        /**
         * Component lifecycle function.
         * @returns {XML}
         * @see https://facebook.github.io/react/docs/component-specs.html#render
         */
        render(): JSX.Element;
    }
    export default CurrencyInput;
}
