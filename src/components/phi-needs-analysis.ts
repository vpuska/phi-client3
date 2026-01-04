/**
 * components/phi-needs-analysis.ts
 * --
 * @author VJP
 * @written 04-Jan-2026
 */

import {LitElement, html, css} from 'lit'
import {customElement} from 'lit/decorators.js'


/**
 * Health insurance needs analysis.
 */
@customElement('phi-needs-analysis')
export class PhiNeedsAnalysis extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            padding: 0;
        }
    `


    render() {
        return html`
            Needs analsys
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-needs-analysis': PhiNeedsAnalysis,
    }
}
