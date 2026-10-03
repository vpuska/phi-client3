/**
 * shared-components/phi-keyword-search.ts
 * --
 * @author VJP
 * @written 22-Jan-2026
 */

import {LitElement, html, css} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import type {SlDropdown, SlInput} from "@shoelace-style/shoelace";
import {Product, type ProductSearchOptions, ProductManager} from "../../api-models/products.ts";
import {Task} from "@lit/task";


/**
 * Combo-box style input for searching products.  Input is in the form of search keywords.  Eg. `hospital gold nsw family`
 *
 * The component supports two modes of operation:
 * 1. Keyword search - Entering keywords will perform a keyword search and display the results in a drop-down menu.  Selecting a result will populate the input with
 * the product name and display a menu of product variants (state and cover types) for the second mode of operation.
 * 2. Product selection - Entering a product name will display a list of available variants for that product.  Selecting a variant will populate the input
 * with the product name and hide the drop-down menu.  The product openDetails are displayed in the product cover openDetails section.
 */
@customElement('phi-keyword-search')
export class PhiKeywordSearch extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: block;
        }
        sl-dropdown {
            width: 100%;
        }
    `
    constructor() {
        super();
        this.addEventListener('sl-hide', (e) => e.stopPropagation());
        this.addEventListener('sl-show', (e) => e.stopPropagation());
    }

    /**
     * Label text used to indicate a prompt for selecting a product.
     */
    @property() label = "Select product:";

    /**
     * Search options.  See {@link ProductSearchOptions}.
     */
    @property({attribute: 'search-options'}) searchOptions: Partial<ProductSearchOptions> = {
        type: [ "Combined", "Hospital", "GeneralHealth" ]
    };
    /**
     * Disable the component.
     */
    @property({attribute: 'disabled', type: Boolean, reflect: true}) disabled: boolean = false;
    /**
     * Set the placeholder text for the input.
     */
    @property() placeholder = "Product search keywords...";

    @state() searchTerms: string[] = [];

    @query('#search-dropdown') searchDropdown!: SlDropdown;
    @query('#search-input') searchInput!: SlInput;
    @query('#product-details') productCoverDetails!: HTMLElement;

    /**
     * Represents the currently selected product, if any.  This value is the output of the component.
     */
    public value: Product | null = null;

    dispatchChangeEvent() {
        this.dispatchEvent(new Event('phi-keyword-search-change', {composed: true, bubbles: true}));
    }

    private searchTask = new Task(this, {
        task: async ([terms, options], {signal}) => {
            (options as ProductSearchOptions).keyWords = terms as string[]
            const groups = await ProductManager.search(options, 100, signal)
            const products: Product[] = [];
            for (const group of groups) {
                for (const variant of group) {
                    products.push(new Product(group, variant));
                }
            }
            return products;
        },
        args: () => [this.searchTerms, this.searchOptions]
    });

    /**
     * Called when the user types into the search input.  If the input length is greater than 3 characters, a keyword search is performed.  The results are displayed in the
     * drop-down menu.  If the input length is less than 4 characters, the drop-down menu is cleared.
     * @param e The `sl-input` triggering event.
     */
    handleInputChange(e: Event) {
        // clear any previous selection
        this.value = null;
        const input = (e.target as SlInput).value.trim();
        this.productCoverDetails.innerHTML = "";

        if (input.length < 4)
            return;

        const searchTerms = input.toUpperCase().split(" ").filter(word => word.length > 0);
        if (searchTerms.length !== this.searchTerms.length)
            this.searchTerms = searchTerms;
        if (searchTerms.some((term, index) => term !== this.searchTerms[index]))
            this.searchTerms = searchTerms;

        this.searchDropdown.show().then();
    }

    /**
     * Called when a menu item is selected.  If the selected item is a search result, the search is performed and the drop-down menu is cleared.  If the selected item is a product,
     * the product is selected and the drop-down menu is hidden.  The product openDetails are displayed in the product cover openDetails section.
     * @param e The `sl-menu` triggering event.
     */
    async handleMenuSelect(e: CustomEvent) {
        const product = e.detail.item.value as Product;
        this.searchInput.value = product!.name;
        const dependants = product!.dependantTypesLongDescriptions.length ? ` - including: ${product!.dependantTypesLongDescriptions.join(", ")}` : "";
        this.productCoverDetails.innerHTML = `${product!.state} - ${product!.coverageDescription}${dependants}`;
        this.searchDropdown.hide().then();
        this.searchInput.focus();
        this.value = product;
        this.dispatchChangeEvent();
        e.stopPropagation();
    }

    /**
     * Render.
     */
    render() {
        return html`
            <sl-dropdown id="search-dropdown" placement="bottom" distance="1" sync="width" stay-open-on-select
                @sl-show=${() => this.productCoverDetails.style.display = "none"}
                @sl-hide=${() => this.productCoverDetails.style.display = "block"}
            >
                <div slot="trigger">
                    <sl-input
                            id="search-input"
                            autocomplete="off"
                            label=${this.label}
                            clearable
                            .disabled=${this.disabled}
                            placeholder=${this.placeholder}
                            @sl-input=${this.handleInputChange.bind(this)}
                            @keydown=${(e: KeyboardEvent) => {if (e.key === ' ') {e.stopPropagation();} } }
                    >
                        <sl-icon name="search" slot="suffix"></sl-icon>
                    </sl-input>
                    <div id="product-details" style="display: none; margin-left: 4em"></div>
                </div>
                <sl-menu @sl-select=${this.handleMenuSelect.bind(this)}>
                    ${this.searchTask.render({
                        pending: () => html`<sl-menu-item disabled>Searching...</sl-menu-item>`,
                        complete: (products) => products!.map(product => html`
                            <sl-menu-item .value=${product}>
                                <div style="display:inline-block; width:65%; overflow: hidden; text-overflow: ellipsis">${product.name}</div>
                                <div style="display:inline-block; overflow: hidden; text-overflow: ellipsis"">${product.fundBrand.code}/${product.code} ${product.state}</div>
                                <div style="display:inline-block; overflow: hidden; text-overflow: ellipsis"">${product.coverageDescription}</div>
                            </sl-menu-item>
                        `)
                    })}
                </sl-menu>
            </sl-dropdown>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-keyword-search': PhiKeywordSearch,
    }
}
