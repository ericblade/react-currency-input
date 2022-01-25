import React from 'react';
import { mount } from '@cypress/react';
import CurrencyInput from './'

describe('CurrencyInput', () => {
  it('works', () => {
    mount(<CurrencyInput />)
    cy.get('input').type('12.50')
  })
})