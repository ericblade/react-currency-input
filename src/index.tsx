// TODO: disableSelectionHandling really breaks behavior in a way i didn't even kind of expect, will try to figure out root cause later and fix if possible? that may be the way browser deals with it tho
// TODO: backspace from > precision casues caret to move one space back :(

import React, { RefObject } from 'react';
import { DOMElement } from 'react';
import mask from './mask';

export type CurrencyInputProps = {
    onChangeEvent?: (event: Event, maskedValue: string, value: number | string) => void,
    onClick?: (event: Event) => void,
    onFocus?: (event: FocusEvent) => void,
    onBlur?: (event: FocusEvent) => void,
    value?: number | string,
    decimalSeparator?: string,
    thousandSeparator?: string,
    precision?: number,
    inputType?: string,
    allowNegative?: boolean,
    allowEmpty?: boolean,
    disableSelectionHandling?: boolean,
    prefix?: string,
    suffix?: string,
    selectAllOnFocus?: boolean,
    autoFocus?: boolean,
    style?: React.CSSProperties,
    id?: string,
    tabIndex?: number,
};

type CurrencyInputState = {
    maskedValue: string,
    value: number | string, // TODO: should be string? should also have a separate float field for 'pennies'
    disableSelectionHandling: boolean,
    customProps: any,
};

class CurrencyInput extends React.Component<CurrencyInputProps, CurrencyInputState> {
    static defaultProps = {
        onChangeEvent: function(event, maskedValue, value) {},
        autoFocus: false,
        value: '0',
        decimalSeparator: '.',
        thousandSeparator: ',',
        precision: 2,
        inputType: 'text',
        allowNegative: false,
        allowEmpty: false,
        prefix: '',
        suffix: '',
        selectAllOnFocus: false,
        disableSelectionHandling: false,
    }
    inputSelectionStart: number;
    inputSelectionEnd: number;
    theInput: RefObject<HTMLInputElement>;
    static DEBUG_SELECTION = false;

    constructor(props: CurrencyInputProps) {
        super(props);
        this.handleChangeEvent = this.handleChangeEvent.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.setSelectionRange = this.setSelectionRange.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.state = CurrencyInput.prepareProps(props);
        this.theInput = React.createRef<HTMLInputElement>();

        this.inputSelectionStart = 1;
        this.inputSelectionEnd = 1;
    }


    /**
     * Exposes the current masked value.
     *
     * @returns {String}
     */
    getMaskedValue() {
        return this.state.maskedValue;
    }


    static stringValueToFloat(value: string, thousandSeparator: string, decimalSeparator: string) {
        // Some people, when confronted with a problem, think "I know, I'll use regular expressions."
        // Now they have two problems.

        // Strip out thousand separators, prefix, and suffix, etc.
        if (thousandSeparator === ".") {
            // special handle the . thousand separator
            value = value.replace(/\./g, '');
        }

        if (decimalSeparator != ".") {
            // fix the decimal separator
            value = value.replace(new RegExp(decimalSeparator, 'g'), '.');
        }

        //Strip out anything that is not a digit, -, or decimal separator
        value = value.replace(/[^0-9-.]/g, '');

        // now we can parse.
        return Number.parseFloat(value);
    }

    /**
     * General function used to cleanup and define the final props used for rendering
     * @returns {{ maskedValue: {String}, value: {Number}, customProps: {Object} }}
     */
    static prepareProps(props: CurrencyInputProps) {
        let customProps = {...props};
        delete customProps.onChangeEvent;
        delete customProps.value;
        delete customProps.decimalSeparator;
        delete customProps.thousandSeparator;
        delete customProps.precision;
        delete customProps.inputType;
        delete customProps.allowNegative;
        delete customProps.allowEmpty;
        delete customProps.prefix;
        delete customProps.suffix;
        delete customProps.selectAllOnFocus;
        delete customProps.autoFocus;
        delete customProps.disableSelectionHandling;

        let initialValue = props.value;
        if (initialValue === null) {
            initialValue = props.allowEmpty ? null : '';
        } else {
            if (typeof initialValue == 'string') {
                initialValue = this.stringValueToFloat(initialValue, props.thousandSeparator, props.decimalSeparator);
            }
            initialValue = Number(initialValue).toLocaleString(undefined, {
                style                : 'decimal',
                minimumFractionDigits: props.precision,
                maximumFractionDigits: props.precision,
            })

        }

        const { maskedValue, value } = mask(
            initialValue,
            props.precision,
            props.decimalSeparator,
            props.thousandSeparator,
            props.allowNegative,
            props.prefix,
            props.suffix
        );

        const disableSelectionHandling = props.disableSelectionHandling || props.inputType === 'number';
        return { maskedValue, value, customProps, disableSelectionHandling };
    }

    /**
     * Component lifecycle function.
     * Invoked when a component is receiving new props.
     * This is used to automatically update the value state if the props have changed --
     * so changing the decimal separator on the fly will cause the value to be updated with the new
     * separator.  Similarly, changing allowNegative on the fly will force the value to remove the
     * negative sign.
     *
     * @param nextProps
     * @param prevState
     * @see https://reactjs.org/docs/react-component.html#static-getderivedstatefromprops
     */
    static getDerivedStateFromProps(nextProps, prevState) {
        const props = { ...nextProps };
        if (nextProps.value !== prevState.value) {
            props.value = prevState.value;
        }
        return CurrencyInput.prepareProps(props);
    }

    /**
     * Component lifecycle function
     * This also performs management of selection values.
     * @returns {XML}
     * @see https://facebook.github.io/react/docs/react-component.html#componentwillupdate
     */
    getSnapshotBeforeUpdate(prevProps: Readonly<CurrencyInputProps>, prevState: Readonly<CurrencyInputState>) {
        if (prevState.disableSelectionHandling) {
            return null;
        }
        const node = this.theInput.current;
        return {
            inputSelectionStart: node.selectionStart,
            inputSelectionEnd: node.selectionEnd,
        };
    }


    /**
     * Component lifecycle function.
     * Also performs management of selection values
     * @returns {XML}
     * @see https://facebook.github.io/react/docs/react-component.html#componentdidupdate
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.disableSelectionHandling) {
            return;
        }

        let prevSelectionStart = this.inputSelectionStart;
        let prevSelectionEnd = this.inputSelectionEnd;
        if (snapshot !== null) {
            this.inputSelectionStart = snapshot.inputSelectionStart;
            this.inputSelectionEnd = snapshot.inputSelectionEnd;
            // TODO: we should store the selection direction last moved, in node.selectionDirection, so we can investigate properly skipping separators in both directions.
        }
        const selectionConstraints = this.getSelectionConstraints();
        CurrencyInput.DEBUG_SELECTION && console.warn('* componentDidUpdate inputSelection received', this.inputSelectionStart, this.inputSelectionEnd, selectionConstraints, prevSelectionStart, prevSelectionEnd);

        const { decimalSeparator } = this.props;
        const node = this.theInput.current;
        if (this.inputSelectionStart == this.inputSelectionEnd) {
            let selectionPosition = Math.max(selectionConstraints.start, Math.min(this.inputSelectionEnd, selectionConstraints.end));
            CurrencyInput.DEBUG_SELECTION && console.warn('* initial selectionPosition', selectionPosition);
            // if we erased digits, we shouldn't move the cursor, so adjust to compensate for the number of digits removed.
            const prevValueFloat = CurrencyInput.stringValueToFloat(String(prevState.value), this.props.thousandSeparator, this.props.decimalSeparator);
            const currValueFloat = CurrencyInput.stringValueToFloat(String(this.state.value), this.props.thousandSeparator, this.props.decimalSeparator);
            CurrencyInput.DEBUG_SELECTION && console.warn('* value prev/now', prevValueFloat, currValueFloat);

            const minimumLength = this.props.prefix.length + this.props.suffix.length + this.props.precision;
            const bDeletedDigits = ((prevSelectionEnd > this.inputSelectionEnd) && prevValueFloat > currValueFloat);
            const bAddedDigits = ((prevSelectionEnd < this.inputSelectionEnd) && prevValueFloat < currValueFloat);
            CurrencyInput.DEBUG_SELECTION && console.warn('* bDeletedDigits =', bDeletedDigits, 'bAddedDigits =', bAddedDigits);
            if (currValueFloat === 0) {
                CurrencyInput.DEBUG_SELECTION && console.warn('* selection case 0');
                selectionPosition = selectionConstraints.end;
            } else if (bDeletedDigits) {
                if (prevSelectionEnd > selectionConstraints.end) { // deleted from end
                    CurrencyInput.DEBUG_SELECTION && console.warn('* selectionCase 1');
                    selectionPosition = selectionConstraints.end;
                    // if (String(prevValueFloat).length > String(currValueFloat).length) {
                        // selectionPosition -= 1;
                    // }
                } else {
                    if(String(prevValueFloat).length > String(currValueFloat).length) {
                        CurrencyInput.DEBUG_SELECTION && console.warn('* selectionCase 2');
                        selectionPosition = this.inputSelectionEnd;
                    } else {
                        CurrencyInput.DEBUG_SELECTION && console.warn('* selectionCase 3');
                        selectionPosition = prevSelectionEnd;
                    }
                }
            } else if (bAddedDigits) {
                if (String(this.state.maskedValue).length === String(prevState.maskedValue).length) {
                    CurrencyInput.DEBUG_SELECTION && console.warn('* selectionCase 4');
                    selectionPosition = prevSelectionEnd;
                } else {
                    CurrencyInput.DEBUG_SELECTION && console.warn('* selectionCase 5');
                    selectionPosition = this.inputSelectionEnd;
                }
            }
            CurrencyInput.DEBUG_SELECTION && console.warn('* tentative selectionPosition=', selectionPosition);

            let regexEscapeRegex = /[-[\]{}()*+?.,\\^$|#\s]/g;
            let separatorsRegex = new RegExp(decimalSeparator.replace(regexEscapeRegex, '\\$&') + '|' + this.props.thousandSeparator.replace(regexEscapeRegex, '\\$&'), 'g');
            let currSeparatorCount: number = (this.state.maskedValue.match(separatorsRegex) || []).length;
            let prevSeparatorCount: number = (prevState.maskedValue.match(separatorsRegex) || []).length;
            let adjustment: number = Math.abs(currSeparatorCount - prevSeparatorCount); //Math.max(currSeparatorCount - prevSeparatorCount, 0);
            CurrencyInput.DEBUG_SELECTION && console.warn('* separator adjustment=', currSeparatorCount, prevSeparatorCount, adjustment);
            // TODO: There is something going wrong here if you enter from the input end, 123456789 then cursor left one, then backspace. At that point, the adjustment should be ignored, but I can't figure out what criteria to hinge it upon.
            if (bAddedDigits) {
                selectionPosition += adjustment;
            } else if (bDeletedDigits) {
                selectionPosition -= adjustment;
            }

            selectionPosition = Math.max(selectionConstraints.start, Math.min(selectionPosition, selectionConstraints.end));
            this.setSelectionRange(node, selectionPosition, selectionPosition);
        } // TODO: do we need to do anything with multiselect? probably just make sure the caret is still in proper constraints?
    }

    /**
     * Set selection range only if input is in focused state
     * @param node DOMElement
     * @param start number
     * @param end number
     */
    setSelectionRange(node: HTMLInputElement, start: number, end: number) {
        if (this.state.disableSelectionHandling) {
            console.warn('* setSelectionRange disabled!');
            return;
        }
        if (!node) {
            console.warn('* setSelectionRange: node is empty');
            return;
        }
        if (isNaN(start) || isNaN(end)) {
            console.warn('* setSelectionRange: received NaN!');
            return;
        }
        if (document.activeElement === node) {
            // console.warn('* setting selection range', start, end);
            node.setSelectionRange(start, end);
            this.inputSelectionStart = start;
            this.inputSelectionEnd = end;
        } else {
            // console.warn('* setSelectionRange not activeElement!', document.activeElement, node);
        }
    }


    /**
     * onChange Event Handler
     * @param event
     */
    handleChangeEvent(event) {
        event.persist();  // fixes issue https://github.com/jsillitoe/react-currency-input/issues/23
        event.preventDefault();
        this.setState((prevState, props) => {
            const { maskedValue, value } = mask(
                event.target.value,
                props.precision,
                props.decimalSeparator,
                props.thousandSeparator,
                props.allowNegative,
                props.prefix,
                props.suffix,
            );
            return { maskedValue, value };
        }, () => {
            this.props.onChangeEvent(event, this.state.maskedValue, this.state.value);
        })
    }

    /*
     * Returns the minimum (start) and maximum (end) selection values, based on prefix, suffix, and negative status.
     */
    getSelectionConstraints() {
        const node = this.theInput.current;
        if (this.state.disableSelectionHandling) {
            return {
                start: 0,
                end: node.value.length,
            };
        }

        let isNegative = node ? (node.value.match(/-/g) || []).length % 2 === 1 : false;
        return {
            start: this.props.prefix.length + (isNegative ? 1 : 0),
            end: node ? node.value.length - this.props.suffix.length : this.props.prefix.length + this.props.suffix.length,
        };
    }

    /**
     * onFocus Event Handler
     * @param event
     */
    handleFocus(event) {
        event.persist();
        // console.warn('**** handleFocus called!', this.theInput.current);
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
        const node = this.theInput.current;
        if (!node) {
            return;
        }

        if (this.state.disableSelectionHandling) {
            return;
        }

        const selection = this.getSelectionConstraints();
        if (!this.props.selectAllOnFocus) {
            selection.start = selection.end;
        }
        this.setSelectionRange(node, selection.start, selection.end);
        // I hate this hack. Chrome says this was fixed back in 2015, but it only seems to work when using a range, rather than a single location.
        // what we are doing here, is setting it, then setting it again on the next tick, so that it remains set, instead of the browser resetting it.
        setTimeout(() => { this.setSelectionRange(node, selection.start, selection.end); }, 0);
    }

    handleBlur(event) {
        event.persist();
        // console.warn('**** handleBlur called');
        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    }

    handleSelect(event) {
        if (this.state.disableSelectionHandling) {
            return;
        }
        const node = this.theInput.current;
        const constraints = this.getSelectionConstraints();
        CurrencyInput.DEBUG_SELECTION && console.warn('**** handleSelect', event, node.selectionStart, node.selectionEnd, constraints);
        this.inputSelectionStart = Math.max(node.selectionStart, constraints.start);
        this.inputSelectionEnd = Math.max(constraints.start, Math.min(node.selectionEnd, constraints.end));
        if (this.inputSelectionStart != node.selectionStart || this.inputSelectionEnd != node.selectionEnd) {
            CurrencyInput.DEBUG_SELECTION && console.warn('* resetting selection to', this.inputSelectionStart, this.inputSelectionEnd);
            this.setSelectionRange(node, this.inputSelectionStart, this.inputSelectionEnd);
        }
    }

    /**
     * Component lifecycle function.
     * @returns {XML}
     * @see https://facebook.github.io/react/docs/component-specs.html#render
     */
    render() {
        return (
            <input
                ref={this.theInput}
                type={this.props.inputType}
                value={this.state.maskedValue}
                onChange={this.handleChangeEvent}
                onFocus={this.handleFocus}
                // onMouseUp={this.handleFocus}
                {...this.state.customProps}
                style={this.props.style}
                onClick={this.props.onClick}
                onBlur={this.handleBlur}
                id={this.props.id}
                autoFocus={this.props.autoFocus}
                tabIndex={this.props.tabIndex}
                onSelect={this.handleSelect}
            />
        )
    }
}

export default CurrencyInput;
if (typeof 'window' !== 'undefined') {
    window['CurrencyInput'] = CurrencyInput;
}
