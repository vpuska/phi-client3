import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement} from "lit";

@customElement('phi-logo')
export class PhiLogo extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        img {
            max-width: 80%;
            max-height: 48px;
            min-height: 48px;
            width: auto;
            height: auto;
        }
    `
    /**
     * This image URL.
     */
    @property() src: string = "";
    /**
     * This image alt text.
     */
    @property() alt: string = "";

    render() {
        return html`
            <img slot="header" class="logo" src="${this.src}" alt="${this.alt}">
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-logo': PhiLogo,
    }
}
