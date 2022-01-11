// TODO: disableSelectionHandling really breaks behavior in a way i didn't even kind of expect, will try to figure out root cause later and fix if possible? that may be the way browser deals with it tho

import React, { type RefObject } from 'react';
import mask from './mask';

export type CurrencyInputProps = {
    onBlur?: (event: React.FocusEvent) => void,
    onChangeEvent?: (event: React.ChangeEvent, maskedValue: string, value: number | string) => void,
    onClick?: (event: Event) => void,
    onFocus?: (event: React.FocusEvent) => void,

    allowEmpty?: boolean,
    allowNegative?: boolean,
    autoFocus?: boolean,
    disableSelectionHandling?: boolean,
    selectAllOnFocus?: boolean,

    decimalSeparator?: string,
    inputType?: string,
    precision?: number,
    prefix?: string,
    style?: React.CSSProperties,
    suffix?: string,
    thousandSeparator?: string,

    id?: string,
    tabIndex?: number,
    value?: number | string, // TODO: this should probably just be string? at least until we drive this thing by pennies.
};

type CurrencyInputState = {
    customProps: any,
    disableSelectionHandling: boolean,
    maskedValue: string,
    value: number | string, // TODO: should be string? should also have a separate float field for 'pennies'
};

type SelectionSnapshot = {
    inputSelectionStart: number,
    inputSelectionEnd: number,
};

type SelectionConstraints = {
    start: number,
    end: number,
};

class CurrencyInput extends React.Component<CurrencyInputProps, CurrencyInputState> {
    static defaultProps: CurrencyInputProps = {
        onChangeEvent: function(event: React.ChangeEvent<HTMLInputElement>, maskedValue: string, value: number) {},
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
    inputSelectionStart: number = 1; // TODO: can we upgrade to target es2015+ and use private fields here?
    inputSelectionEnd: number = 1;
    theInput: RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();
    static DEBUG_SELECTION = false;
    static DEBUG_FULL = false;

    constructor(props: CurrencyInputProps) {
        super(props);

        this.state = CurrencyInput.prepareProps(props);
    }


    /**
     * Exposes the current masked value.
     *
     * @returns {String}
     */
    getMaskedValue() {
        return this.state.maskedValue;
    }

    /**
     * Converts a string value with specified thousandSeparator and decimalSeparator into a plain
     * Javascript string that looks like what the Javascript Number.parseFloat function can handle,
     * and then calls Number.parseFloat on it, returning a float value.  This is a pretty gross
     * thing to have to implement, but it came from the original code, and should be removed when
     * we upgrade to handling all internal data in pennies.
     */
    static stringValueToFloat(value: string, thousandSeparator: string, decimalSeparator: string) {
        // Some people, when confronted with a problem, think "I know, I'll use regular expressions."
        // Now they have two problems.

        // Strip out thousand separators, prefix, and suffix, etc.
        if (thousandSeparator === ".") {
            // special handle the . thousand separator
            value = value.replace(/\./g, '');
        }

        if (decimalSeparator !== ".") {
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
     * @returns CurrencyInputState
     */
    static prepareProps({
        onChangeEvent,
        value: propValue,
        decimalSeparator,
        thousandSeparator,
        precision,
        inputType,
        allowNegative,
        allowEmpty,
        prefix,
        suffix,
        selectAllOnFocus,
        autoFocus,
        disableSelectionHandling: propDisableSelectionHandling,
        ...customProps
    }: Readonly<CurrencyInputProps>): CurrencyInputState {
        let initialValue = propValue;
        if (initialValue === null) {
            initialValue = allowEmpty ? null : '';
        } else {
            if (typeof initialValue == 'string') {
                initialValue = this.stringValueToFloat(initialValue, thousandSeparator, decimalSeparator);
            }
            initialValue = Number(initialValue).toLocaleString(undefined, {
                style                : 'decimal',
                minimumFractionDigits: precision,
                maximumFractionDigits: precision,
            })

        }

        const { maskedValue, value } = mask(
            initialValue,
            precision,
            decimalSeparator,
            thousandSeparator,
            allowNegative,
            prefix,
            suffix
        );

        const disableSelectionHandling = propDisableSelectionHandling || inputType === 'number';
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
    static getDerivedStateFromProps(nextProps: Readonly<CurrencyInputProps>, prevState: Readonly<CurrencyInputState>) {
        const props = { ...nextProps };
        if (nextProps.value !== prevState.value) {
            props.value = prevState.value;
        }
        return CurrencyInput.prepareProps(props);
    }

    /**
     * Component lifecycle function
     * Whenever the input field is updated (such as when a change is made, inputting a number), this
     * will record the selectionStart and selectionEnd that was set before the update.  Similarly,
     * when the selection is moved without causing an update (ie, cursor keys, or mouse clicking to
     * change the caret position), that is handled in handleSelect.
     *
     * TODO: This piece may not actually be necessary with the re-written componentDidUpdate and
     * handleSelect.  Should investigate removing it, and using this.theInput.current.selectionStart/selectionEnd
     * rather than the snapshot data.
     * @returns {XML}
     * @see https://facebook.github.io/react/docs/react-component.html#componentwillupdate
     */
    getSnapshotBeforeUpdate(prevProps: Readonly<CurrencyInputProps>, prevState: Readonly<CurrencyInputState>): SelectionSnapshot {
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
     * Handles where the selection should be
     * Basically: When an update happens from user input (ie adding or removing a number),
     * we will receive that update, along with the previous properties, previous state, and the
     * current state is available in this.state.  The previous caret selection is stored in inputSelectionStart
     * and inputSelectionEnd.  If we know which way the caret moved (based on comparing inputSelectionEnd to the current selectionEnd)
     * and whether we've added or removed numbers from the display, then we can determine where the
     * selection *should* be placed, because we want this to behave like a proper money-input type field,
     * and regular HTML inputs do *not* behave like that, so we have to manage the caret position entirely ourselves.
     * @returns {XML}
     * @see https://facebook.github.io/react/docs/react-component.html#componentdidupdate
     */
    componentDidUpdate(
        prevProps: Readonly<CurrencyInputProps>,
        prevState: Readonly<CurrencyInputState>,
        snapshot: Readonly<SelectionSnapshot>
    ) {
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
        if (this.inputSelectionStart === this.inputSelectionEnd) {
            let selectionPosition = Math.max(selectionConstraints.start, Math.min(this.inputSelectionEnd, selectionConstraints.end));
            CurrencyInput.DEBUG_SELECTION && console.warn('* initial selectionPosition', selectionPosition);
            // if we erased digits, we shouldn't move the cursor, so adjust to compensate for the number of digits removed.
            const prevValueFloat = CurrencyInput.stringValueToFloat(String(prevState.value), this.props.thousandSeparator, this.props.decimalSeparator);
            const currValueFloat = CurrencyInput.stringValueToFloat(String(this.state.value), this.props.thousandSeparator, this.props.decimalSeparator);
            CurrencyInput.DEBUG_SELECTION && console.warn('* value prev/now', prevValueFloat, currValueFloat);

            // const minimumLength = this.props.prefix.length + this.props.suffix.length + this.props.precision;
            const bDeletedDigits = ((prevSelectionEnd > this.inputSelectionEnd) && prevValueFloat > currValueFloat);
            const bAddedDigits = ((prevSelectionEnd < this.inputSelectionEnd) && prevValueFloat < currValueFloat);
            CurrencyInput.DEBUG_SELECTION && console.warn('* bDeletedDigits =', bDeletedDigits, 'bAddedDigits =', bAddedDigits);
            if (currValueFloat === 0 || prevValueFloat === 0) {
                // shortcut, when value is zero, we're always entering from the last position.
                // If value was zero, we just entered the first number, so we should be at the end.
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
        } // TODO: do we need to do anything with multi-select? probably just make sure the caret is still in proper constraints?
    }

    /**
     * Set selection range only if input is in focused state
     * TODO: can probably reduce this to an external function removing the dependency on this
     * @param node DOMElement
     * @param start number
     * @param end number
     */
    setSelectionRange = (node: HTMLInputElement, start: number, end: number) => {
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
     * When the underlying input receives input, make sure that we update the internal state of this
     * component, as well as notify any custom event handlers passed down to us, after the state has
     * changed.
     * @param event
     */
    handleChangeEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.persist();  // fixes issue https://github.com/jsillitoe/react-currency-input/issues/23
        event.preventDefault();
        CurrencyInput.DEBUG_FULL && console.log('* handleChangeEvent newValue=', event.target.value);
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
    getSelectionConstraints(): SelectionConstraints {
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
     * notify any onFocus events passed into is, and then ensure that the text caret remains within
     * the correct bounds for this input.
     * @param event
     */
    handleFocus = (event: React.FocusEvent) => {
        event.persist();
        CurrencyInput.DEBUG_FULL && console.log('* handleFocus');
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

    /*
     * We don't do anything special currently with blur, but we do want to forward it onto any
     * interested component that passed us an onBlur event
     */
    handleBlur = (event: React.FocusEvent) => {
        event.persist();
        CurrencyInput.DEBUG_FULL && console.log('* handleBlur');
        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    }

    /**
     * Ensure that selection remains within the minimum and maximum bounds at all times.
     */
    handleSelect = (event: React.SyntheticEvent<HTMLInputElement>) => {
        if (this.state.disableSelectionHandling) {
            return;
        }
        CurrencyInput.DEBUG_FULL && console.log('* handleSelect', event);
        const node = this.theInput.current;
        const constraints = this.getSelectionConstraints();
        CurrencyInput.DEBUG_SELECTION && console.warn('**** handleSelect', node.selectionStart, node.selectionEnd, constraints);
        this.inputSelectionStart = Math.max(node.selectionStart, constraints.start);
        this.inputSelectionEnd = Math.max(constraints.start, Math.min(node.selectionEnd, constraints.end));
        if (this.inputSelectionStart !== node.selectionStart || this.inputSelectionEnd !== node.selectionEnd) {
            CurrencyInput.DEBUG_SELECTION && console.warn('* resetting selection to', this.inputSelectionStart, this.inputSelectionEnd);
            this.setSelectionRange(node, this.inputSelectionStart, this.inputSelectionEnd);
        }
    }

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
// TODO: quick way to enable/disable debugging on the fly, but should really be removed when we are
// certain of stability.
if (typeof 'window' !== 'undefined') {
    window['CurrencyInput'] = CurrencyInput;
}
