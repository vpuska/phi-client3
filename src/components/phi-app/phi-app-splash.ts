/**
 * components/phi-app/phi-app-splash.ts
 * --
 * Top-Level application element and splash-screen.
 * @author VJP
 * @written 28-Sep-2025
 */

import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement} from "lit";

import logo from '/phi-logo.svg'

/**
 * PHI Application splash screen displayed while the application is loading.
 */
@customElement('phi-app-splash')
export class PhiAppSplash extends LitElement {
    static styles = css`
        :host {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
        }
        div {
            width: 100%;
            text-align: center;
        }
    `

    /**
     * The number of progress tick counts to display while application is loading.
     */
    @property({attribute:"ticks", type: Number}) tickCount: number = 1;

    render() {
        return html`
            <div>
                <h2>Private Health Insurance Comparator</h2>
                <img width="192px" height="192px" src=${logo} alt="PHI Logo" />
                <p>Please wait while loading</p>
                <p>[ :${" :".repeat(this.tickCount)} ]</p>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'phi-app-splash': PhiAppSplash;
    }
}