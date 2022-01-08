"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var mask_1 = __importDefault(require("./mask"));
var CurrencyInput = /** @class */ (function (_super) {
    __extends(CurrencyInput, _super);
    function CurrencyInput(props) {
        var _this = _super.call(this, props) || this;
        _this.handleChangeEvent = _this.handleChangeEvent.bind(_this);
        _this.handleFocus = _this.handleFocus.bind(_this);
        _this.handleBlur = _this.handleBlur.bind(_this);
        _this.setSelectionRange = _this.setSelectionRange.bind(_this);
        _this.state = CurrencyInput.prepareProps(props);
        _this.theInput = react_1.default.createRef();
        _this.inputSelectionStart = 1;
        _this.inputSelectionEnd = 1;
        return _this;
    }
    /**
     * Exposes the current masked value.
     *
     * @returns {String}
     */
    CurrencyInput.prototype.getMaskedValue = function () {
        return this.state.maskedValue;
    };
    /**
     * General function used to cleanup and define the final props used for rendering
     * @returns {{ maskedValue: {String}, value: {Number}, customProps: {Object} }}
     */
    CurrencyInput.prepareProps = function (props) {
        var customProps = __assign({}, props); // babeljs converts to Object.assign, then polyfills.
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
        var initialValue = props.value;
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
        var _a = (0, mask_1.default)(initialValue, props.precision, props.decimalSeparator, props.thousandSeparator, props.allowNegative, props.prefix, props.suffix), maskedValue = _a.maskedValue, value = _a.value;
        return { maskedValue: maskedValue, value: value, customProps: customProps };
    };
    // TODO: This function was definitely here for a reason, but converting it to the getDerivedState causes total failure of component.
    // and willReceiveProps is going away. So, I'm commenting it out for now.
    /**
     * Component lifecycle function.
     * Invoked when a component is receiving new props. This method is not called for the initial render.
     *
     * @param nextProps
     * @see https://facebook.github.io/react/docs/component-specs.html#updating-componentwillreceiveprops
     */
    // static getDerivedStateFromProps(nextProps) {
    // console.warn('* getDerivedStateFromProps', nextProps.value, nextProps.maskedValue);
    // return CurrencyInput.prepareProps(nextProps);
    // }
    /**
     * Component lifecycle function.
     * @returns {XML}
     * @see https://facebook.github.io/react/docs/react-component.html#componentdidmount
     */
    CurrencyInput.prototype.componentDidMount = function () {
        var node = this.theInput.current;
        var selectionStart, selectionEnd;
        if (this.props.autoFocus) {
            // set cursor to end of input field excluding suffix
            selectionEnd = this.state.maskedValue.length - this.props.suffix.length;
            selectionStart = selectionEnd;
        }
        else {
            // TODO: should this be this.state.value.length - this.props.suffix.length ?
            selectionEnd = Math.min(node.selectionEnd, node.value.length - this.props.suffix.length);
            selectionStart = Math.min(node.selectionStart, selectionEnd);
        }
        this.setSelectionRange(node, selectionStart, selectionEnd);
    };
    /**
     * Component lifecycle function
     * @returns {XML}
     * @see https://facebook.github.io/react/docs/react-component.html#componentwillupdate
     */
    CurrencyInput.prototype.getSnapshotBeforeUpdate = function (prevProps, prevState) {
        var node = this.theInput.current;
        return {
            inputSelectionStart: node.selectionStart,
            inputSelectionEnd: node.selectionEnd,
        };
    };
    /**
     * Component lifecycle function.
     * @returns {XML}
     * @see https://facebook.github.io/react/docs/react-component.html#componentdidupdate
     */
    CurrencyInput.prototype.componentDidUpdate = function (prevProps, prevState, snapshot) {
        if (snapshot !== null) {
            this.inputSelectionStart = snapshot.inputSelectionStart;
            this.inputSelectionEnd = snapshot.inputSelectionEnd;
        }
        var decimalSeparator = this.props.decimalSeparator;
        var node = this.theInput.current;
        // let isNegative = (this.theInput.current.value.match(/-/g) || []).length % 2 === 1;
        var isNegative = (node.value.match(/-/g) || []).length % 2 === 1;
        var minPos = this.props.prefix.length + (isNegative ? 1 : 0);
        // TODO: should this be this.state.value.length - this.props.suffix.length ?
        // TODO: also, we do this math in mount and in update, so we should DRY it up.
        var selectionEnd = Math.max(minPos, Math.min(this.inputSelectionEnd, node.value.length - this.props.suffix.length));
        var selectionStart = Math.max(minPos, Math.min(this.inputSelectionEnd, selectionEnd));
        var regexEscapeRegex = /[-[\]{}()*+?.,\\^$|#\s]/g;
        var separatorsRegex = new RegExp(decimalSeparator.replace(regexEscapeRegex, '\\$&') + '|' + this.props.thousandSeparator.replace(regexEscapeRegex, '\\$&'), 'g');
        var currSeparatorCount = (this.state.maskedValue.match(separatorsRegex) || []).length;
        var prevSeparatorCount = (prevState.maskedValue.match(separatorsRegex) || []).length;
        var adjustment = Math.max(currSeparatorCount - prevSeparatorCount, 0);
        selectionEnd = selectionEnd + adjustment;
        selectionStart = selectionStart + adjustment;
        var precision = Number(this.props.precision);
        var baselength = this.props.suffix.length
            + this.props.prefix.length
            + (precision > 0 ? decimalSeparator.length : 0) // if precision is 0 there will be no decimal part
            + precision
            + 1; // This is to account for the default '0' value that comes before the decimal separator
        if (this.state.maskedValue.length == baselength) {
            // if we are already at base length, position the cursor at the end.
            selectionEnd = node.value.length - this.props.suffix.length;
            selectionStart = selectionEnd;
        }
        this.setSelectionRange(node, selectionStart, selectionEnd);
        this.inputSelectionStart = selectionStart;
        this.inputSelectionEnd = selectionEnd;
    };
    /**
     * Set selection range only if input is in focused state
     * @param node DOMElement
     * @param start number
     * @param end number
     */
    CurrencyInput.prototype.setSelectionRange = function (node, start, end) {
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
        }
        else {
            console.warn('* setSelectionRange not activeElement!', document.activeElement, node);
        }
        this.inputSelectionStart = start;
        this.inputSelectionEnd = end;
    };
    /**
     * onChange Event Handler
     * @param event
     */
    CurrencyInput.prototype.handleChangeEvent = function (event) {
        var _this = this;
        event.persist(); // fixes issue #23
        event.preventDefault();
        this.setState(function (prevState, props) {
            var _a = (0, mask_1.default)(event.target.value, props.precision, props.decimalSeparator, props.thousandSeparator, props.allowNegative, props.prefix, props.suffix), maskedValue = _a.maskedValue, value = _a.value;
            return { maskedValue: maskedValue, value: value };
        }, function () {
            _this.props.onChangeEvent(event, _this.state.maskedValue, _this.state.value);
        });
    };
    /**
     * onFocus Event Handler
     * @param event
     */
    CurrencyInput.prototype.handleFocus = function (event) {
        // console.warn('**** handleFocus called!', this.theInput.current);
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
        var node = this.theInput.current;
        if (!node) {
            return;
        }
        //Whenever we receive focus check to see if the position is before the suffix, if not, move it.
        var selectionEnd = node.value.length - this.props.suffix.length;
        var isNegative = (node.value.match(/-/g) || []).length % 2 === 1;
        var selectionStart = this.props.prefix.length + (isNegative ? 1 : 0);
        this.props.selectAllOnFocus && event.target.setSelectionRange(selectionStart, selectionEnd);
        this.inputSelectionStart = selectionStart;
        this.inputSelectionEnd = selectionEnd;
    };
    CurrencyInput.prototype.handleBlur = function (event) {
        console.warn('**** handleBlur called');
        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    };
    /**
     * Component lifecycle function.
     * @returns {XML}
     * @see https://facebook.github.io/react/docs/component-specs.html#render
     */
    CurrencyInput.prototype.render = function () {
        return (react_1.default.createElement("input", __assign({ ref: this.theInput, type: this.props.inputType, value: this.state.maskedValue, onChange: this.handleChangeEvent, onFocus: this.handleFocus }, this.state.customProps, { style: this.props.style, onClick: this.props.onClick, onBlur: this.handleBlur, id: this.props.id, autoFocus: this.props.autoFocus, tabIndex: this.props.tabIndex })));
    };
    CurrencyInput.defaultProps = {
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
    return CurrencyInput;
}(react_1.default.Component));
exports.default = CurrencyInput;
