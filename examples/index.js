/**
 * Created by jrs1 on 3/7/17.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import CurrencyInput from '../dist/cjs/index.js';

const onChangeEvent = function (event, mask, floatValue) {
  console.log(event)
  console.log(mask)
  console.log(floatValue)
}

const Container = ({ title, ...rest }) => {
  return (
    <div>
      <div>{title}</div>
      <CurrencyInput onChangeEvent={onChangeEvent} {...rest} />
    </div>
  );
}

ReactDOM.render(<Container title="value float 0.0" value={0.0}/>, document.getElementById('example0'));

ReactDOM.render(<Container title="suffix ' kr'" suffix=" kr"/>, document.getElementById('example1'));

ReactDOM.render(<Container title="suffix ' kr' precision=0" suffix=" kr" precision="0"/>, document.getElementById('example2'));

ReactDOM.render(<Container title="prefix '$'" prefix="$"/>, document.getElementById('example3'));

ReactDOM.render(<Container title="prefix '$' precision=0" prefix="$" precision="0"/>, document.getElementById('example4'));

ReactDOM.render(<Container title="prefix '$' suffix ' kr'" prefix="$" suffix=" kr"/>, document.getElementById('example5'));

ReactDOM.render(<Container title="value=string 1 allowNegative" value="1" allowNegative={true}/>, document.getElementById('example6'));

ReactDOM.render(
  <Container title="decimalSeparator='.' thousandSeparator=','" decimalSeparator="." thousandSeparator="," />,
  document.getElementById('example7')
);

ReactDOM.render(<Container title="prefix '$' autoFocus" prefix="$" autoFocus={true}/>, document.getElementById('example8'));
