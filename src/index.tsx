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
    precision?: number | string,
    inputType?: string,
    allowNegative?: boolean,
    allowEmpty?: boolean,
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
    customProps: any,
};

class CurrencyInput extends React.Component<CurrencyInputProps, CurrencyInputState> {
    static defaultProps = {
        onChangeEvent: function(event, maskedValue, value) {},
        autoFocus: false,
        value: '0',
        decimalSeparator: '.',
        thousandSeparator: ',',
        precision: '2',
        inputType: 'text',
        allowNegative: false,
        allowEmpty: false,
        prefix: '',
        suffix: '',
        selectAllOnFocus: false,
    }
    inputSelectionStart: number;
    inputSelectionEnd: number;
    theInput: RefObject<HTMLInputElement>;

    constructor(props: CurrencyInputProps) {
        super(props);
        this.handleChangeEvent = this.handleChangeEvent.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.setSelectionRange = this.setSelectionRange.bind(this);
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


    /**
     * General function used to cleanup and define the final props used for rendering
     * @returns {{ maskedValue: {String}, value: {Number}, customProps: {Object} }}
     */
    static prepareProps(props) {
        let customProps = {...props}; // babeljs converts to Object.assign, then polyfills.
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

        let initialValue = props.value;
        if (initialValue === null) {
            initialValue = props.allowEmpty? null : '';
        }else{

            if (typeof initialValue == 'string') {
                // Some people, when confronted with a problem, think "I know, I'll use regular expressions."
                // Now they have two problems.

                // Strip out thousand separators, prefix, and suffix, etc.
                if (props.thousandSeparator === "."){
                    // special handle the . thousand separator
                    initialValue = initialValue.replace(/\./g, '');
                }

                if (props.decimalSeparator != "."){
                    // fix the decimal separator
                    initialValue = initialValue.replace(new RegExp(props.decimalSeparator, 'g'), '.');
                }

                //Strip out anything that is not a digit, -, or decimal separator
                initialValue = initialValue.replace(/[^0-9-.]/g, '');

                // now we can parse.
                initialValue = Number.parseFloat(initialValue);
            }
            initialValue = Number(initialValue).toLocaleString(undefined, {
                style                : 'decimal',
                minimumFractionDigits: props.precision,
                maximumFractionDigits: props.precision
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

        return { maskedValue, value, customProps };
    }

    // TODO: This function was definitely here for a reason, but converting it to the getDerivedState causes total failure of component.
    // and willReceiveProps is going away. So, I'm commenting it out for now.
    /**
     * Component lifecycle function.
     * Invoked when a component is receiving new props. This method is not called for the initial render.
     *
     * @param nextProps
     * @see https://facebook.github.io/react/docs/component-specs.html#updating-componentwillreceiveprops
     */
/*     static getDerivedStateFromProps(nextProps) {
        console.warn('* getDerivedStateFromProps', nextProps.value, nextProps.maskedValue);
        return CurrencyInput.prepareProps(nextProps);
    }
 */

    /**
     * Component lifecycle function.
     * @returns {XML}
     * @see https://facebook.github.io/react/docs/react-component.html#componentdidmount
     */
    componentDidMount() {
        const node = this.theInput.current;
        let selectionStart, selectionEnd;

        if (this.props.autoFocus) {
            // set cursor to end of input field excluding suffix
            selectionEnd = this.state.maskedValue.length - this.props.suffix.length;
            selectionStart = selectionEnd;
        } else {
            // TODO: should this be this.state.value.length - this.props.suffix.length ?
            selectionEnd = Math.min(node.selectionEnd, node.value.length - this.props.suffix.length);
            selectionStart = Math.min(node.selectionStart, selectionEnd);
        }

        this.setSelectionRange(node, selectionStart, selectionEnd);
    }


    /**
     * Component lifecycle function
     * @returns {XML}
     * @see https://facebook.github.io/react/docs/react-component.html#componentwillupdate
     */
    getSnapshotBeforeUpdate(prevProps: Readonly<CurrencyInputProps>, prevState: Readonly<CurrencyInputState>) {
        const node = this.theInput.current;
        return {
            inputSelectionStart: node.selectionStart,
            inputSelectionEnd: node.selectionEnd,
        };
    }


    /**
     * Component lifecycle function.
     * @returns {XML}
     * @see https://facebook.github.io/react/docs/react-component.html#componentdidupdate
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (snapshot !== null) {
            this.inputSelectionStart = snapshot.inputSelectionStart;
            this.inputSelectionEnd = snapshot.inputSelectionEnd;
        }

        const { decimalSeparator } = this.props;
        const node = this.theInput.current;
        // let isNegative = (this.theInput.current.value.match(/-/g) || []).length % 2 === 1;
        let isNegative = (node.value.match(/-/g) || []).length % 2 === 1;
        let minPos: number = this.props.prefix.length + (isNegative ? 1 : 0);
        // TODO: should this be this.state.value.length - this.props.suffix.length ?
        // TODO: also, we do this math in mount and in update, so we should DRY it up.
        let selectionEnd = Math.max(minPos, Math.min(this.inputSelectionEnd, node.value.length - this.props.suffix.length));
        let selectionStart = Math.max(minPos, Math.min(this.inputSelectionEnd, selectionEnd));

        let regexEscapeRegex = /[-[\]{}()*+?.,\\^$|#\s]/g;
        let separatorsRegex = new RegExp(decimalSeparator.replace(regexEscapeRegex, '\\$&') + '|' + this.props.thousandSeparator.replace(regexEscapeRegex, '\\$&'), 'g');
        let currSeparatorCount: number = (this.state.maskedValue.match(separatorsRegex) || []).length;
        let prevSeparatorCount: number = (prevState.maskedValue.match(separatorsRegex) || []).length;
        let adjustment: number = Math.max(currSeparatorCount - prevSeparatorCount, 0);

        selectionEnd = selectionEnd + adjustment;
        selectionStart = selectionStart + adjustment;

        const precision = Number(this.props.precision);

        let baselength = this.props.suffix.length
            + this.props.prefix.length
            + (precision > 0 ? decimalSeparator.length : 0) // if precision is 0 there will be no decimal part
            + precision
            + 1; // This is to account for the default '0' value that comes before the decimal separator

        if (this.state.maskedValue.length == baselength){
            // if we are already at base length, position the cursor at the end.
            selectionEnd = node.value.length - this.props.suffix.length;
            selectionStart = selectionEnd;
        }

        this.setSelectionRange(node, selectionStart, selectionEnd);
        this.inputSelectionStart = selectionStart;
        this.inputSelectionEnd = selectionEnd;
    }

    /**
     * Set selection range only if input is in focused state
     * @param node DOMElement
     * @param start number
     * @param end number
     */
    setSelectionRange(node: HTMLInputElement, start: number, end: number) {
        if (!node) {
            console.warn('* setSelectionRange: node is empty');
            return;
        }
        if (isNaN(start) || isNaN(end)) {
            console.warn('* setSelectionRange: received NaN!');
            return;
        }
        if (document.activeElement === node) {
            console.warn('* setting selection range', start, end);
            node.setSelectionRange(start, end);
        } else {
            console.warn('* setSelectionRange not activeElement!', document.activeElement, node);
        }
    }


    /**
     * onChange Event Handler
     * @param event
     */
    handleChangeEvent(event) {
        event.persist();  // fixes issue #23
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


    /**
     * onFocus Event Handler
     * @param event
     */
    handleFocus(event) {
        // console.warn('**** handleFocus called!', this.theInput.current);
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
        const node = this.theInput.current;
        if (!node) {
            return;
        }

        //Whenever we receive focus check to see if the position is before the suffix, if not, move it.
        let selectionEnd = node.value.length - this.props.suffix.length;
        let isNegative = (node.value.match(/-/g) || []).length % 2 === 1;
        let selectionStart = this.props.prefix.length + (isNegative ? 1 : 0);
        this.props.selectAllOnFocus && event.target.setSelectionRange(selectionStart, selectionEnd);
        this.inputSelectionStart = selectionStart;
        this.inputSelectionEnd = selectionEnd;
    }


    handleBlur(event) {
        console.warn('**** handleBlur called');
        if (this.props.onBlur) {
            this.props.onBlur(event);
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
            />
        )
    }
}

export default CurrencyInput;
