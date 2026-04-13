/**
 * components/phi-na/phi-na-results.ts
 * --
 * @author VJP
 * @written 09-Apr-2026
 */

import {css, html, nothing} from 'lit'
import {customElement} from "lit/decorators.js";
import {MobxLitElement} from "@adobe/lit-mobx";
import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";
import {consume} from "@lit/context";
import type {Product} from "../../api-models/products.ts";

@customElement('phi-na-results')
export class PhiNaResults extends MobxLitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 8px;
            height: 100%;
        }
        sl-carousel {
            --aspect-ratio: 1/1;
            height: 100%;
        }
        sl-carousel-item {
            height: 100%;
        }
        img {
            max-width: 80%;
            max-height: 48px;
            min-height: 48px;
            width: auto;
            height: auto;
        }
        phi-card {
            width: 100%;
            height: 100%
        } 
        
        sl-card.product.name::part(base) {
            width: 100%;
        }
        
        sl-card.product-name::part(body) {
            background-color: var(--sl-color-gray-200);
            padding: 0.5em;
        }
        
        div.result-body {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
    `

    @consume({context: phiNAContext}) context: NeedsAnalysisContext | null = null;

    render_product(product: Product | null) {
        if (product === null)
            return nothing;
        return html `
            <sl-card class="product-name">${product!.name}</sl-card>
        `
    }

    render() {
        return html`
            <sl-carousel navigation slides-per-page="4" slides-per-move="1">
                ${this.context?.comparisonResults.sort((a, b) => a.premium - b.premium).slice(0,100).map(result => html`
                    <sl-carousel-item>
                        <phi-card header footer>
                            <div slot="header">
                                <img src="${result.fund?.logo}" alt="${result.fund?.code}">
                            </div>
                            <div class="result-body">
                                <sl-format-number type="currency" currency="AUD" value="${result?.premium}"
                                                  lang="en-AU"></sl-format-number>
                                ${this.render_product(result.hospital)}
                                ${result.generalHealth !== result.hospital ? this.render_product(result.generalHealth) : nothing}
                            </div>
                        </phi-card>
                    </sl-carousel-item>
                `)}
            </sl-carousel>
    `}
}

declare global {
    interface HTMLElementTagNameMap {
        'phi-na-results': PhiNaResults;
    }
}