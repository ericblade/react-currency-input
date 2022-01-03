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
define("mask", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function mask(value, precision, decimalSeparator, thousandSeparator, allowNegative, prefix, suffix) {
        if (precision === void 0) { precision = 2; }
        if (decimalSeparator === void 0) { decimalSeparator = '.'; }
        if (thousandSeparator === void 0) { thousandSeparator = ','; }
        if (allowNegative === void 0) { allowNegative = false; }
        if (prefix === void 0) { prefix = ''; }
        if (suffix === void 0) { suffix = ''; }
        precision = Number(precision);
        // provide some default values and arg validation.
        if (precision < 0) {
            precision = 0;
        } // precision cannot be negative
        if (precision > 20) {
            precision = 20;
        } // precision cannot be greater than 20
        if (value === null || value === undefined) {
            return {
                value: 0,
                maskedValue: ''
            };
        }
        value = String(value); //if the given value is a Number, let's convert into String to manipulate that
        if (value.length == 0) {
            return {
                value: 0,
                maskedValue: ''
            };
        }
        // extract digits. if no digits, fill in a zero.
        var digits = value.match(/\d/g) || ['0'];
        var numberIsNegative = false;
        if (allowNegative) {
            var negativeSignCount = (value.match(/-/g) || []).length;
            // number will be negative if we have an odd number of "-"
            // ideally, we should only ever have 0, 1 or 2 (positive number, making a number negative
            // and making a negative number positive, respectively)
            numberIsNegative = negativeSignCount % 2 === 1;
            // if every digit in the array is '0', then the number should never be negative
            var allDigitsAreZero = true;
            for (var idx = 0; idx < digits.length; idx += 1) {
                if (digits[idx] !== '0') {
                    allDigitsAreZero = false;
                    break;
                }
            }
            if (allDigitsAreZero) {
                numberIsNegative = false;
            }
        }
        // zero-pad a input
        while (digits.length <= precision) {
            digits.unshift('0');
        }
        if (precision > 0) {
            // add the decimal separator
            digits.splice(digits.length - precision, 0, ".");
        }
        // clean up extraneous digits like leading zeros.
        digits = Number(digits.join('')).toFixed(precision).split('');
        var raw = Number(digits.join(''));
        var decimalpos = digits.length - precision - 1; // -1 needed to position the decimal separator before the digits.
        if (precision > 0) {
            // set the final decimal separator
            digits[decimalpos] = decimalSeparator;
        }
        else {
            // when precision is 0, there is no decimal separator.
            decimalpos = digits.length;
        }
        // add in any thousand separators
        for (var x = decimalpos - 3; x > 0; x = x - 3) {
            digits.splice(x, 0, thousandSeparator);
        }
        // if we have a prefix or suffix, add them in.
        if (prefix.length > 0) {
            digits.unshift(prefix);
        }
        if (suffix.length > 0) {
            digits.push(suffix);
        }
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
    exports.default = mask;
});
define("index", ["require", "exports", "react", "react-dom", "mask"], function (require, exports, react_1, react_dom_1, mask_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    react_1 = __importDefault(react_1);
    react_dom_1 = __importDefault(react_dom_1);
    mask_1 = __importDefault(mask_1);
    var CurrencyInput = /** @class */ (function (_super) {
        __extends(CurrencyInput, _super);
        function CurrencyInput(props) {
            var _this = _super.call(this, props) || this;
            // this.prepareProps = this.prepareProps.bind(this);
            _this.handleChangeEvent = _this.handleChangeEvent.bind(_this);
            _this.handleFocus = _this.handleFocus.bind(_this);
            _this.setSelectionRange = _this.setSelectionRange.bind(_this);
            _this.state = CurrencyInput.prepareProps(props);
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
        CurrencyInput.prototype.componentDidMount = function () {
            var node = react_dom_1.default.findDOMNode(this.theInput);
            var selectionStart, selectionEnd;
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
        };
        /**
         * Component lifecycle function
         * @returns {XML}
         * @see https://facebook.github.io/react/docs/react-component.html#componentwillupdate
         */
        CurrencyInput.prototype.getSnapshotBeforeUpdate = function (prevProps, prevState) {
            var node = react_dom_1.default.findDOMNode(this.theInput);
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
                this.inputSelectionStart = snapshot.selectionStart;
                this.inputSelectionEnd = snapshot.selectionEnd;
            }
            var decimalSeparator = this.props.decimalSeparator;
            var node = react_dom_1.default.findDOMNode(this.theInput);
            // let isNegative = (this.theInput.value.match(/-/g) || []).length % 2 === 1;
            var isNegative = (node.value.match(/-/g) || []).length % 2 === 1;
            var minPos = this.props.prefix.length + (isNegative ? 1 : 0);
            // let selectionEnd = Math.max(minPos, Math.min(this.inputSelectionEnd, this.theInput.value.length - this.props.suffix.length));
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
                // selectionEnd = this.theInput.value.length - this.props.suffix.length;
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
            if (document.activeElement === node) {
                node.setSelectionRange(start, end);
            }
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
            if (this.props.onFocus) {
                this.props.onFocus(event);
            }
            if (!this.theInput)
                return;
            var node = react_dom_1.default.findDOMNode(this.theInput);
            //Whenever we receive focus check to see if the position is before the suffix, if not, move it.
            var selectionEnd = node.value.length - this.props.suffix.length;
            var isNegative = (node.value.match(/-/g) || []).length % 2 === 1;
            var selectionStart = this.props.prefix.length + (isNegative ? 1 : 0);
            this.props.selectAllOnFocus && event.target.setSelectionRange(selectionStart, selectionEnd);
            this.inputSelectionStart = selectionStart;
            this.inputSelectionEnd = selectionEnd;
        };
        CurrencyInput.prototype.handleBlur = function (event) {
            this.inputSelectionStart = 0;
            this.inputSelectionEnd = 0;
        };
        /**
         * Component lifecycle function.
         * @returns {XML}
         * @see https://facebook.github.io/react/docs/component-specs.html#render
         */
        CurrencyInput.prototype.render = function () {
            var _this = this;
            return (react_1.default.createElement("input", __assign({ ref: function (input) { _this.theInput = input; }, type: this.props.inputType, value: this.state.maskedValue, onChange: this.handleChangeEvent, onFocus: this.handleFocus, onMouseUp: this.handleFocus }, this.state.customProps, { style: this.props.style, onClick: this.props.onClick, onBlur: this.props.onBlur, id: this.props.id })));
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
});
Object.assign = Object.assign ||
    function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
