/**
 * components/phi-color.ts
 * --
 * @author VJP
 * @written 21-Oct-2025
 */

import {LitElement, html, css} from 'lit'
import {customElement, property} from 'lit/decorators.js'

/**
 * Container to set the primary color: `--sl-color-primary-nnn` for child elements
 */
@customElement('phi-color')
export class PhiColor extends LitElement {

    static styles = css`
        :host {
            --sl-color-primary-50:  var(--phi-color-primary-50);
            --sl-color-primary-100: var(--phi-color-primary-100);
            --sl-color-primary-200: var(--phi-color-primary-200);
            --sl-color-primary-300: var(--phi-color-primary-300);
            --sl-color-primary-400: var(--phi-color-primary-400);
            --sl-color-primary-500: var(--phi-color-primary-500);
            --sl-color-primary-600: var(--phi-color-primary-600);
            --sl-color-primary-700: var(--phi-color-primary-700);
            --sl-color-primary-800: var(--phi-color-primary-800);
            --sl-color-primary-900: var(--phi-color-primary-900);
            --sl-color-primary-950: var(--phi-color-primary-950);
        }
        :host([variant=alternate]) {
            --sl-color-primary-50:  var(--phi-color-alternate-50);
            --sl-color-primary-100: var(--phi-color-alternate-100);
            --sl-color-primary-200: var(--phi-color-alternate-200);
            --sl-color-primary-300: var(--phi-color-alternate-300);
            --sl-color-primary-400: var(--phi-color-alternate-400);
            --sl-color-primary-500: var(--phi-color-alternate-500);
            --sl-color-primary-600: var(--phi-color-alternate-600);
            --sl-color-primary-700: var(--phi-color-alternate-700);
            --sl-color-primary-800: var(--phi-color-alternate-800);
            --sl-color-primary-900: var(--phi-color-alternate-900);
            --sl-color-primary-950: var(--phi-color-alternate-950);            
        }
    `
    @property({type: String}) variant: "primary" | "alternate" = "primary";

    render() {
        return html`<slot></slot>`;
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-color': PhiColor,
    }
}
