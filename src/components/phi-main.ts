/**
 * components/phi-main.ts
 * --
 * @author VJP
 * @written 29-Sep-2025
 */

import {LitElement, html, css} from 'lit'
import {customElement} from 'lit/decorators.js'


/**
 * Main application screen containing header, navigation and body
 */
@customElement('phi-main')
export class PhiMain extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }
        .content {
            height: 100%;
        }
    `

    render() {
        return html`
            <phi-main-header></phi-main-header>
            <div class="content">
                <phi-home></phi-home>
            </div>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-main': PhiMain,
    }
}
