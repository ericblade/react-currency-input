import './object-assign-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import mask from './mask';
class CurrencyInput extends React.Component {
    constructor(props) {
        super(props);
        // this.prepareProps = this.prepareProps.bind(this);
        this.handleChangeEvent = this.handleChangeEvent.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.setSelectionRange = this.setSelectionRange.bind(this);
        this.state = CurrencyInput.prepareProps(props);
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
        let customProps = Object.assign({}, props); // babeljs converts to Object.assign, then polyfills.
        delete customProps.onChange;
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
            initialValue = props.allowEmpty ? null : '';
        }
        else {
            if (typeof initialValue == 'string') {
                // Some people, when confronted with a problem, think "I know, I'll use regular expressions."
                // Now they have two problems.
                // Strip out thousand separators, prefix, and suffix, etc.
                if (props.thousandSeparator === ".") {
                    // special handle the . thousand separator
                    initialValue = initialValue.replace(/\./g, '');
                }
                if (props.decimalSeparator != ".") {
                    // fix the decimal separator
                    initialValue = initialValue.replace(new RegExp(props.decimalSeparator, 'g'), '.');
                }
                //Strip out anything that is not a digit, -, or decimal separator
                initialValue = initialValue.replace(/[^0-9-.]/g, '');
                // now we can parse.
                initialValue = Number.parseFloat(initialValue);
            }
            initialValue = Number(initialValue).toLocaleString(undefined, {
                style: 'decimal',
                minimumFractionDigits: props.precision,
                maximumFractionDigits: props.precision
            });
        }
        const { maskedValue, value } = mask(initialValue, props.precision, props.decimalSeparator, props.thousandSeparator, props.allowNegative, props.prefix, props.suffix);
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
        let node = ReactDOM.findDOMNode(this.theInput);
        let selectionStart, selectionEnd;
        if (this.props.autoFocus) {
            // (this.theInput as HTMLInputElement).focus();
            node.focus();
            selectionEnd = this.state.maskedValue.length - this.props.suffix.length;
            selectionStart = selectionEnd;
        }
        else {
            // selectionEnd = Math.min(node.selectionEnd, this.theInput.value.length - this.props.suffix.length);
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
    getSnapshotBeforeUpdate(prevProps, prevState) {
        let node = ReactDOM.findDOMNode(this.theInput);
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
            this.inputSelectionStart = snapshot.selectionStart;
            this.inputSelectionEnd = snapshot.selectionEnd;
        }
        const { decimalSeparator } = this.props;
        let node = ReactDOM.findDOMNode(this.theInput);
        // let isNegative = (this.theInput.value.match(/-/g) || []).length % 2 === 1;
        let isNegative = (node.value.match(/-/g) || []).length % 2 === 1;
        let minPos = this.props.prefix.length + (isNegative ? 1 : 0);
        // let selectionEnd = Math.max(minPos, Math.min(this.inputSelectionEnd, this.theInput.value.length - this.props.suffix.length));
        let selectionEnd = Math.max(minPos, Math.min(this.inputSelectionEnd, node.value.length - this.props.suffix.length));
        let selectionStart = Math.max(minPos, Math.min(this.inputSelectionEnd, selectionEnd));
        let regexEscapeRegex = /[-[\]{}()*+?.,\\^$|#\s]/g;
        let separatorsRegex = new RegExp(decimalSeparator.replace(regexEscapeRegex, '\\$&') + '|' + this.props.thousandSeparator.replace(regexEscapeRegex, '\\$&'), 'g');
        let currSeparatorCount = (this.state.maskedValue.match(separatorsRegex) || []).length;
        let prevSeparatorCount = (prevState.maskedValue.match(separatorsRegex) || []).length;
        let adjustment = Math.max(currSeparatorCount - prevSeparatorCount, 0);
        selectionEnd = selectionEnd + adjustment;
        selectionStart = selectionStart + adjustment;
        const precision = Number(this.props.precision);
        let baselength = this.props.suffix.length
            + this.props.prefix.length
            + (precision > 0 ? decimalSeparator.length : 0) // if precision is 0 there will be no decimal part
            + precision
            + 1; // This is to account for the default '0' value that comes before the decimal separator
        if (this.state.maskedValue.length == baselength) {
            // if we are already at base length, position the cursor at the end.
            // selectionEnd = this.theInput.value.length - this.props.suffix.length;
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
    setSelectionRange(node, start, end) {
        if (document.activeElement === node) {
            node.setSelectionRange(start, end);
        }
    }
    /**
     * onChange Event Handler
     * @param event
     */
    handleChangeEvent(event) {
        event.persist(); // fixes issue #23
        event.preventDefault();
        this.setState((prevState, props) => {
            const { maskedValue, value } = mask(event.target.value, props.precision, props.decimalSeparator, props.thousandSeparator, props.allowNegative, props.prefix, props.suffix);
            return { maskedValue, value };
        }, () => {
            this.props.onChange(this.state.maskedValue, this.state.value, event);
            this.props.onChangeEvent(event, this.state.maskedValue, this.state.value);
        });
    }
    /**
     * onFocus Event Handler
     * @param event
     */
    handleFocus(event) {
        if (!this.theInput)
            return;
        let node = ReactDOM.findDOMNode(this.theInput);
        //Whenever we receive focus check to see if the position is before the suffix, if not, move it.
        let selectionEnd = node.value.length - this.props.suffix.length;
        let isNegative = (node.value.match(/-/g) || []).length % 2 === 1;
        let selectionStart = this.props.prefix.length + (isNegative ? 1 : 0);
        this.props.selectAllOnFocus && event.target.setSelectionRange(selectionStart, selectionEnd);
        this.inputSelectionStart = selectionStart;
        this.inputSelectionEnd = selectionEnd;
    }
    handleBlur(event) {
        this.inputSelectionStart = 0;
        this.inputSelectionEnd = 0;
    }
    /**
     * Component lifecycle function.
     * @returns {XML}
     * @see https://facebook.github.io/react/docs/component-specs.html#render
     */
    render() {
        return (React.createElement("input", Object.assign({ ref: (input) => { this.theInput = input; }, type: this.props.inputType, value: this.state.maskedValue, onChange: this.handleChangeEvent, onFocus: this.handleFocus, onMouseUp: this.handleFocus }, this.state.customProps)));
    }
}
CurrencyInput.defaultProps = {
    onChange: function (maskedValue, value, event) { },
    onChangeEvent: function (event, maskedValue, value) { },
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
};
/**
 * Prop validation.
 * @see https://facebook.github.io/react/docs/component-specs.html#proptypes
 */
export default CurrencyInput;
