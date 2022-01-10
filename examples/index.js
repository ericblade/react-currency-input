import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';

import CurrencyInput from '../dist/cjs/index.js';


const ExampleForm = ({
  allowNegative,
  allowEmpty,
  disableSelectionHandling,
  selectAllOnFocus,
  value,
  decimalSeparator,
  thousandSeparator,
  precision,
  inputType,
  prefix,
  suffix,
  onApply
}) => {
  return (
    <form>
      &lt;CurrencyInput allowNegative="{document.getElementsByName("allowNegative")[0]?.checked ? "true" : "false"}"
        allowEmpty="{document.getElementsByName("allowEmpty")[0]?.checked ? "true" : "false"}"
        selectAllOnFocus="{document.getElementsByName("selectAllOnFocus")[0]?.checked ? "true" : "false"}"
        disableSelectionHandling="{document.getElementsByName("disableSelectionHandling")[0]?.checked ? "true" : "false"}"
        {/* value="{document.getElementsByName('value')[0]?.value}" */}
        decimalSeparator="{document.getElementsByName("decimalSeparator")[0]?.value}"
        thousandSeparator="{document.getElementsByName("thousandSeparator")[0]?.value}"
        precision="{document.getElementsByName("precision")[0]?.value}"
        inputType="{document.getElementsByName("inputType")[0]?.value}"
        prefix="{document.getElementsByName("prefix")[0]?.value}"
        suffix="{document.getElementsByName("suffix")[0]?.value}"
      /&gt;
      <br />
      <CurrencyInput
        allowEmpty={allowEmpty}
        allowNegative={allowNegative}
        selectAllOnFocus={selectAllOnFocus}
        disableSelectionHandling={disableSelectionHandling}
        value={value}
        decimalSeparator={decimalSeparator}
        thousandSeparator={thousandSeparator}
        precision={precision}
        inputType={inputType}
        prefix={prefix}
        suffix={suffix}
      />
      <br />
      Use the form below to change the parameters in the CurrencyInput above.
      <br />
      <input
        type="checkbox"
        name="allowNegative"
        defaultChecked={allowNegative}
      />{" "}
      Allow negative
      <br />
      <input type="checkbox" name="allowEmpty" defaultChecked={allowEmpty} /> Allow
      empty
      <br />
      <input
        type="checkbox"
        name="selectAllOnFocus"
        defaultChecked={selectAllOnFocus}
      />{" "}
      Select all on focus
      <br />
      <input type="checkbox" name="disableSelectionHandling" defaultChecked={disableSelectionHandling} /> Disable selection handling
      <br />
      {/* <input type="text" name="value" placeholder="Value" defaultValue={value} />Value<br /> */}
      <input
        type="text"
        name="decimalSeparator"
        placeholder="Decimal separator"
        defaultValue={decimalSeparator}
      />
      Decimal separator
      <br />
      <input
        type="text"
        name="thousandSeparator"
        placeholder="Thousand separator"
        defaultValue={thousandSeparator}
      />
      Thousand separator
      <br />
      <input
        type="text"
        name="precision"
        placeholder="Precision"
        defaultValue={precision}
      />
      Precision
      <br />
      <input
        type="text"
        name="inputType"
        placeholder="Input type"
        defaultValue={inputType}
      />
      Input type
      <br />
      <input
        type="text"
        name="prefix"
        placeholder="Prefix"
        defaultValue={prefix}
      />
      Prefix
      <br />
      <input
        type="text"
        name="suffix"
        placeholder="Suffix"
        defaultValue={suffix}
      />
      Suffix
      <br />
      <input type="button" name="apply" value="Apply" onClick={onApply} />
    </form>
  );
};

function FormContainer() {
  const [allowNegative, setAllowNegative] = useState(false);
  const [allowEmpty, setAllowEmpty] = useState(false);
  const [selectAllOnFocus, setSelectAllOnFocus] = useState(false);
  const [disableSelectionHandling, setDisableSelectionHandling] = useState(false);
  const [value, setValue] = useState(0.0);
  const [decimalSeparator, setDecimalSeparator] = useState(".");
  const [thousandSeparator, setThousandSeparator] = useState(",");
  const [precision, setPrecision] = useState("2");
  const [inputType, setInputType] = useState("text");
  const [prefix, setPrefix] = useState("$");
  const [suffix, setSuffix] = useState(" USD");

  const onChangeEvent = useCallback((event, maskedValue, value) => {
    console.log(event);
    console.log(maskedValue);
    console.log(value);
  }, []);

  const onClick = useCallback((event) => {
    console.log(event);
  }, []);

  const onFocus = useCallback((event) => {
    console.log(event);
  }, []);

  const onBlur = useCallback((event) => {
    console.log(event);
  }, []);

  const onApply = useCallback(() => {
    setAllowNegative(document.getElementsByName("allowNegative")[0].checked);
    setAllowEmpty(document.getElementsByName("allowEmpty")[0].checked);
    setSelectAllOnFocus(
      document.getElementsByName("selectAllOnFocus")[0].checked
    );
    setDisableSelectionHandling(
      document.getElementsByName("disableSelectionHandling")[0].checked
    );
    // setValue(document.getElementsByName('value')[0].value);
    setDecimalSeparator(document.getElementsByName("decimalSeparator")[0].value);
    setThousandSeparator(
      document.getElementsByName("thousandSeparator")[0].value
    );
    setPrecision(document.getElementsByName("precision")[0].value);
    setInputType(document.getElementsByName("inputType")[0].value);
    setPrefix(document.getElementsByName("prefix")[0].value);
    setSuffix(document.getElementsByName("suffix")[0].value);
  }, []);

  return (
    <div>
      <ExampleForm
        allowNegative={allowNegative}
        allowEmpty={allowEmpty}
        selectAllOnFocus={selectAllOnFocus}
        disableSelectionHandling={disableSelectionHandling}
        value={value}
        decimalSeparator={decimalSeparator}
        thousandSeparator={thousandSeparator}
        precision={precision}
        inputType={inputType}
        prefix={prefix}
        suffix={suffix}
        // onChangeEvent={onChangeEvent}
        // onClick={onClick}
        // onFocus={onFocus}
        // onBlur={onBlur}
        onApply={onApply}
      />
    </div>
  );
}
ReactDOM.render(<FormContainer />, document.querySelector("#main"));
