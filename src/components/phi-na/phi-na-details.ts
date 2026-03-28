/**
 * components/needs-analysis/phi-na-details.ts
 * --
 * @author VJP
 * @written 06-Feb-2026
 */

import {css, html, LitElement} from "lit";
import {property} from "lit/decorators.js";

/**
 * Wrapper between `sl-details` and `phi-na-details-xx` elements, with:
 * - additional styling for the PHI application.
 * - a "continue" button
 * @attribute `button-label` - label for the "continue" button. Defaults to "Continue".
 * @event phi-na-continue - fired when the "continue" button is clicked.
 * @see PhiNADetailsGroup
 */
export class PhiNADetails extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`

        :host {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 8px;
            height: 100%;
        }
    
        div#continue {
            display: flex;
            justify-content: flex-end;
        }
    `;

    // Label for the "Continue" button.
    @property({type: String, attribute: "button-label"}) buttonLabel = "Continue";

    render() {
        return html`
            <div id = "content">
                <slot></slot>
            </div>
                         
            <div id="continue">
                <sl-button @click=${(e:Event) => {
                    e.stopPropagation();
                    this.dispatchEvent(new CustomEvent("phi-na-continue", {bubbles: true, composed: true}));
                }}>
                    ${this.buttonLabel}
                </sl-button>
            </div>
        `
    }
}