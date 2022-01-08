# @ericblade/react-currency-input

Modern React component for currency input. Fork from https://github.com/jsillitoe/react-currency-input

Supports custom decimal and thousand separators as well as precision.

Uniquely formats while inputting, including decimal and thousands separators, precision, prefixes and suffixes.  I have not found any other currency inputs that do this, and the original hasn't been touched for quite a long time, so that is why I fork this.

## Codepen Demonstration

There is a CodePen available which you may use to see the component in action, and play with all of it's various parameters to see how it works.  It is written with React and TypeScript.
[Codepen Link](https://codepen.io/ericblade/pen/NWaLbGK)

## Pre-fork README below

## Changes

## v1.3.0

- Deprecated "onChange" option in favor of "onChangeEvent". This fixes the argument order to better match React's default input handling
- Updated dependencies to React 15
- Added parseFloat polyfill
- Persist events to deal with an issue of event pooling
- Other bug fixes.

## Installation

```bash
npm install react-currency-input --save
```

## Integration

You can store the value passed in to the change handler in your state.

```javascript
import React from 'react'
import CurrencyInput from 'react-currency-input';

const MyApp = React.createClass({
    getInitialState(){
        return ({amount: "0.00"});
    },

    handleChange(event, maskedvalue, floatvalue){
        this.setState({amount: maskedvalue});
    },
    render() {
        return (
            <div>
                <CurrencyInput value={this.state.amount} onChangeEvent={this.handleChange}/>
            </div>
        );
    }
});
export default MyApp
```

You can also assign a reference then access the value using a call to getMaskedValue().

```javascript
import React from 'react'
import CurrencyInput from 'react-currency-input';

const MyApp = React.createClass({
    handleSubmit(event){
        event.preventDefault();
        console.log(this.refs.myinput.getMaskedValue())
    },
    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <CurrencyInput ref="myinput" />
            </form>
        );
    }
});
export default MyApp
```

## Separators and Precision

Specify custom decimal and thousand separators:

```javascript
    // 1.234.567,89
    <CurrencyInput decimalSeparator="," thousandSeparator="." />
```

Specify a specific precision:

```javascript
    // 123,456.789
    <CurrencyInput precision="3" />
```

```javascript
    // 123,456,789
    <CurrencyInput precision="0" />
```

## Currency

Optionally set a currency symbol as a prefix or suffix

```javascript
    // $1,234,567.89
    <CurrencyInput prefix="$" />
```

```javascript
    // 1,234,567.89 kr
    <CurrencyInput suffix=" kr" />
```

Negative signs come before the prefix

```javascript
    // -$20.00
    <CurrencyInput prefix="$" value="-20.00" />
```

All other attributes are applied to the input element. For example, you can integrate bootstrap styling:

```javascript
    <CurrencyInput className="form-control" />
```

## Options

Option            | Default Value | Description
----------------- | ------------- | -----------------------------------------------------------------------------
value             | 0             | The initial currency value
onChangeEvent     | n/a           | Callback function to handle value changes
precision         | 2             | Number of digits after the decimal separator
decimalSeparator  | '.'           | The decimal separator
thousandSeparator | ','           | The thousand separator
inputType         | "text"        | Input field tag type. You may want to use `number` or `tel`*
allowNegative     | false         | Allows negative numbers in the input
allowEmpty        | false         | If no `value` is given, defines if it starts as null (`true`) or '' (`false`)
selectAllOnFocus  | false         | Selects all text on focus or does not
prefix            | ''            | Currency prefix
suffix            | ''            | Currency suffix
autoFocus         | false         | Autofocus
onClick           | none          | Passed through to input
onFocus           | none          | Called after internal focus handling
onBlur            | none          | Called after internal blur handling
style             | none          | Passed through to input
id                | none          | Passed through to input
tabIndex          | none          | Passed through to input

***Note:** Enabling any mask-related features such as prefix, suffix or separators with an inputType="number" or "tel" could trigger errors. Most of those characters would be invalid in such input types.
