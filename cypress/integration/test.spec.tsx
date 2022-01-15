// for some reason, visual studio isn't parsing the tsconfig.json in the cypress folder?
/// <reference types="cypress" />

describe('test', () => {
    beforeEach(() => {
        cy.visit('./examples/index.html');
    });
    it('sanity startup', () => {
        cy.get('#currency-input').should('have.value', '$0.00 USD');
    });
});

describe('input caret selection', function() {
    describe('default params: precision = 2, prefix = $, suffix = " USD"', () => {
        const suffix = ' USD';
        const prefix = '$';
        const precision = '2';
        beforeEach(() => {
            cy.visit('./examples/index.html');
            cy.get('[name=suffix]').focus().type(`{selectall}${suffix}`);
            cy.get('[name=prefix]').focus().type(`{selectall}${prefix}`);
            cy.get('[name=precision]').focus().type(`{selectall}${precision}`);
            cy.get('[name=apply]').click();
        });
        // NOTE: Tests that require focus and selection require a wait(1) after focus so that the
        // ugly workaround for the focus selection problem in Chrome is worked around.
        // see CurrencyInput#handleFocus()
        describe('basic caret movement', () => {
            it('focus sets selection to last character before suffix', () => {
                cy.get('#currency-input').focus().wait(1).then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                });
            });
            it('cursor right from end does not allow caret selection to move', () => {
                cy.get('#currency-input').focus().wait(1).type('{rightarrow}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                });
            });
            it('cursor left from end allows caret to move one backwards', () => {
                cy.get('#currency-input').focus().wait(1).type('{leftarrow}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length - 1);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length - 1);
                });
            });
            it('cursor left twice from end allows caret to move two backwards', () => {
                cy.get('#currency-input').focus().wait(1).type('{leftarrow}{leftarrow}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length - 2);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length - 2);
                });
            });
            it('cursor left thrice from end allows caret to move three backwards', () => {
                cy.get('#currency-input').focus().wait(1).type('{leftarrow}{leftarrow}{leftarrow}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length - 3);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length - 3);
                });
            });
            it('cursor home from end places caret selection in front of prefix', () => {
                cy.get('#currency-input').focus().wait(1).type('{home}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(prefix.length);
                    expect(inputSelectionEnd).to.equal(prefix.length);
                });
            });
            it('cursor left from beginning does not allow caret selection to move', () => {
                cy.get('#currency-input').focus().wait(1).type('{home}{leftarrow}').wait(1).then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(prefix.length);
                    expect(inputSelectionEnd).to.equal(prefix.length);
                });
            });
        });
        describe('numeric entry and backspacing within precision', () => {
            it('enter 123 from end sets value to $1.23', () => {
                cy.get('#currency-input').focus().wait(1).type('123').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                    expect(inputValue).to.equal(`${prefix}1.23${suffix}`);
                });
            });
            it('enter 123 then backspace once sets value to $0.12', () => {
                cy.get('#currency-input').focus().wait(1).type('123').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                    expect(inputValue).to.equal(`${prefix}0.12${suffix}`);
                });
            });
            it('enter 123 then backspace twice sets value to $0.01', () => {
                cy.get('#currency-input').focus().wait(1).type('123').type('{backspace}').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                    expect(inputValue).to.equal(`${prefix}0.01${suffix}`);
                });
            });
            it('enter 123 then backspace thrice sets value to $0.00', () => {
                cy.get('#currency-input').focus().wait(1).type('123').type('{backspace}').type('{backspace}').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                    expect(inputValue).to.equal(`${prefix}0.00${suffix}`);
                });
            });
            it('enter 123 then left arrow then backspace sets value to $0.13 and leaves caret selection one left of end', () => {
                cy.get('#currency-input').focus().wait(1).type('123').type('{leftarrow}').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length - 1);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length - 1);
                    expect(inputValue).to.equal(`${prefix}0.13${suffix}`);
                });
            });
            it('enter 123 then left arrow then backspace twice sets value to $0.03 and leaves caret selection one left of end', () => {
                cy.get('#currency-input').focus().wait(1).type('123').type('{leftarrow}').type('{backspace}').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length - 1);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length - 1);
                    expect(inputValue).to.equal(`${prefix}0.03${suffix}`);
                });
            });
            it('left arrow then enter 1 sets value to $0.10 and leaves caret selection one from end', () => {
                cy.get('#currency-input').focus().wait(1).type('{leftarrow}').type('1').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length - 1);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length - 1);
                    expect(inputValue).to.equal(`${prefix}0.10${suffix}`);
                });
            });
            it('left arrow twice then enter 1 sets value to $1.00 and leaves caret selection 2 from end', () => {
                cy.get('#currency-input').focus().wait(1).type('{leftarrow}').type('{leftarrow}').type('1').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length - 2);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length - 2);
                    expect(inputValue).to.equal(`${prefix}1.00${suffix}`);
                });
            });
        });
        describe('numeric entry and backspace outside of precision', () => {
            it('enter 1234 sets value to $12.34 and leaves caret selection at end', () => {
                cy.get('#currency-input').focus().wait(1).type('1234').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                    expect(inputValue).to.equal(`${prefix}12.34${suffix}`);
                });
            });
            it('enter 1234 then backspace from end sets value to $1.23 and leaves caret selection at end', () => {
                cy.get('#currency-input').focus().wait(1).type('1234').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                    expect(inputValue).to.equal(`${prefix}1.23${suffix}`);
                });
            });
            it('enter 1234 then backspace twice from end sets value to $0.12 and leaves caret selection at end', () => {
                cy.get('#currency-input').focus().wait(1).type('1234').type('{backspace}').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                    expect(inputValue).to.equal(`${prefix}0.12${suffix}`);
                });
            });
            it('enter 1234 then backspace thrice from end sets value to $0.01 and leaves caret selection at end', () => {
                cy.get('#currency-input').focus().wait(1).type('1234').type('{backspace}').type('{backspace}').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                    expect(inputValue).to.equal(`${prefix}0.01${suffix}`);
                });
            });
            it('enter 1234 then backspace four times from end sets value to $0.00 and leaves caret selection at end', () => {
                cy.get('#currency-input').focus().wait(1).type('1234').type('{backspace}').type('{backspace}').type('{backspace}').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                    expect(inputValue).to.equal(`${prefix}0.00${suffix}`);
                });
            });
            it('enter 1234 then leftarrow then backspace sets value to $1.24 and leaves caret selection at 1 before end', () => {
                cy.get('#currency-input').focus().wait(1).type('1234').type('{leftarrow}').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length - 1);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length - 1);
                    expect(inputValue).to.equal(`${prefix}1.24${suffix}`);
                });
            });
            it('enter 1234 then leftarrow then backspace twice sets value to $0.14 and leaves caret selection at 1 before end', () => {
                cy.get('#currency-input').focus().wait(1).type('1234').type('{leftarrow}').type('{backspace}').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length - 1);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length - 1);
                    expect(inputValue).to.equal(`${prefix}0.14${suffix}`);
                });
            });
        });
        describe('tests with thousands', () => {
            it('enter 123456 sets value to $1,234.56 and leaves caret selection at end', () => {
                cy.get('#currency-input').focus().wait(1).type('123456').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                    expect(inputValue).to.equal(`${prefix}1,234.56${suffix}`);
                });
            });
            // TODO: THIS TEST FAILS, THE CURSOR MOVES ONE SPOT BACKWARDS WHEN WE DELETE THE THOUSANDS SEPARATOR
            it('enter 123456 then backspace sets value to $123.45 and leaves caret selection at end', () => {
                cy.get('#currency-input').focus().wait(1).type('123456').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                    expect(inputValue).to.equal(`${prefix}123.45${suffix}`);
                });
            });
            // TODO: THIS TEST FAILS BECAUSE OF THE PREVIOUS ISSUE, WHICH LEAVES US WITH AN INCORRECT RESULT AT THE END.
            it('enter 123456 then backspace twice sets value to $12.34 and leaves caret selection at end', () => {
                cy.get('#currency-input').focus().wait(1).type('123456').type('{backspace}').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length);
                    expect(inputValue).to.equal(`${prefix}12.34${suffix}`);
                });
            });
            it('enter 123456 then left backspace sets value to $123.46 and leaves caret selection at 1 before end', () => {
                cy.get('#currency-input').focus().wait(1).type('123456').type('{leftarrow}').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length - 1);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length - 1);
                    expect(inputValue).to.equal(`${prefix}123.46${suffix}`);
                });
            });
            it('enter 123456 then left backspace twice sets value to $12.36 and leaves caret selection at 1 before end', () => {
                cy.get('#currency-input').focus().wait(1).type('123456').type('{leftarrow}').type('{backspace}').type('{backspace}').then((el) => {
                    const input = el[0] as HTMLInputElement;
                    const inputValue = input.value;
                    const inputLength = inputValue.length;
                    const inputSelectionStart = input.selectionStart;
                    const inputSelectionEnd = input.selectionEnd;
                    expect(inputSelectionStart).to.equal(inputLength - suffix.length - 1);
                    expect(inputSelectionEnd).to.equal(inputLength - suffix.length - 1);
                    expect(inputValue).to.equal(`${prefix}12.36${suffix}`);
                });
            });
        });
    });
});
