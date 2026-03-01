/**
 * shared-components/phi-keyword-search.ts
 * --
 * @author VJP
 * @written 22-Jan-2026
 */

import {LitElement, html, css, type TemplateResult} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import type {SlDropdown, SlInput} from "@shoelace-style/shoelace";
import {Product, productKeywordSearch, type ProductKeywordSearchResult, ProductResultSet} from "../api-models/products.ts";

/**
 * The drop-down menu can be either a list of product keyword search results or a list of products.  This type
 * is used to distinguish between the two.  The value of the menu item is either a search result or a product.
 */
type SearchMenuValue =
    | { variant: "search"; searchResult: ProductKeywordSearchResult }
    | { variant: "product"; product: Product }


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
     * Include combined products in the search results.
     */
    @property({ attribute:'search-combined', type: Boolean}) searchCombined: boolean = false;
    /**
     * Include hospital products in the search results.
     */
    @property({ attribute:'search-hospital', type: Boolean}) searchHospital: boolean = false;
    /**
     * Include extras (general health) products in the search results.
     */
    @property({ attribute:'search-extras', type: Boolean}) searchExtras: boolean = false;
    /**
     * Disable the component.
     */
    @property({attribute: 'disabled', type: Boolean, reflect: true}) disabled: boolean = false;
    /**
     * Set the placeholder text for the input.
     */
    @property() placeholder = "Product search keywords...";
    /**
     * Keywords to be automatically added to the keywords entered by the user when performing the search.  Useful
     * to constrain return values to a particular state or family type.
     */
    @property({attribute: 'auto-keywords'}) autoKeywords: string = "";

    /**
     * Represents an array of items to be displayed in a dropdown menu.
     * Each item is a TemplateResult, built from either a search result or a product depending
     * on the type of result.
     */
    @state() dropDownItems: TemplateResult[] = [];

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

    /**
     * Called when a keyword search result is selected from the dropdown.  This will populate the search input with the selected product name (replacing the
     * keywords).  The drop-down menu will be replaced with a list of the available cover variants for this product title.
     * @param searchResult
     * @param keyWords
     */
    async selectSearchResult(searchResult: ProductKeywordSearchResult, keyWords: string) {
        keyWords = keyWords.concat(" ", this.autoKeywords).trim();
        const params = `name=${encodeURIComponent(searchResult.productName)}&fund=${searchResult.fund}&keywords=${keyWords}&count=100`;
        const results = await ProductResultSet.fetch(`product-search/by-keyword2?${params}`);
        this.searchInput.value = searchResult.productName;
        this.value = null;
        this.dispatchChangeEvent();

        results.rows.sort((a, b) => {
            let result = a.state.localeCompare(b.state);
            if (result !== 0) return result;
            result = a.adultsCovered - b.adultsCovered;
            if (result !== 0) return result;
            result = (a.dependantCover ? 1 : 0) - (b.dependantCover ? 1 : 0);
            return result;
        })

        this.dropDownItems = results.rows.map(row => {
            return html`
                <sl-menu-item .value=${{variant: "product", product: row} as SearchMenuValue}>
                    <div style="display:inline-block; width:7em; overflow: hidden; text-overflow: ellipsis">${row.state}</div>
                    <div style="display:inline-block; width:15em; overflow: hidden; text-overflow: ellipsis">${row.coverageDescription}</div>
                    <div style="display:inline-block; overflow: hidden; text-overflow: ellipsis">${row.dependantTypesLongDescriptions.join(", ")}</div>
                </sl-menu-item>
            `})
        this.searchDropdown.open = this.dropDownItems.length > 0;
    }

    /**
     * Called when the user types into the search input.  If the input length is greater than 3 characters, a keyword search is performed.  The results are displayed in the
     * drop-down menu.  If the input length is less than 4 characters, the drop-down menu is cleared.
     * @param e The `sl-input` triggering event.
     */
    async handleInputChange(e: Event) {
        this.value = null;
        const input = (e.target as SlInput).value;
        const keywords = input.concat(" ", this.autoKeywords).trim();
        this.productCoverDetails.innerHTML = "";

        if (input.length < 4)
            return;

        let results: ProductKeywordSearchResult[];
        if (!this.searchCombined && !this.searchHospital && !this.searchExtras)
            results = await productKeywordSearch(keywords, true, true, true);
        else
            results = await productKeywordSearch(keywords, this.searchCombined, this.searchHospital, this.searchExtras);

        this.dropDownItems = results.map(result => html`
            <sl-menu-item .value=${{variant: "search", searchResult: result} as SearchMenuValue}>
                <div style="display:inline-block; width:65%; overflow: hidden; text-overflow: ellipsis">${result.productName}</div>
                <div style="display:inline-block; overflow: hidden; text-overflow: ellipsis"">${result.fundShortName}</div>
            </sl-menu-item>
        `)
        this.searchDropdown.open = this.dropDownItems.length > 0;
    }

    /**
     * Called when a menu item is selected.  If the selected item is a search result, the search is performed and the drop-down menu is cleared.  If the selected item is a product,
     * the product is selected and the drop-down menu is hidden.  The product openDetails are displayed in the product cover openDetails section.
     * @param e The `sl-menu` triggering event.
     */
    handleMenuSelect(e: CustomEvent) {
        const value = e.detail.item.value as SearchMenuValue;
        if (value.variant === "search") {
            this.selectSearchResult(value.searchResult, this.searchInput.value).then();
            this.productCoverDetails.innerHTML = `${value.searchResult.fundShortName} - `;
        } else {
            this.value = value.product!;
            this.searchInput.value = this.value.name;
            const dependants = this.value.dependantTypesLongDescriptions.length ? ` - including: ${this.value.dependantTypesLongDescriptions.join(", ")}` : "";
            this.productCoverDetails.innerHTML += `${this.value.state} - ${this.value.coverageDescription}${dependants}`;
            this.searchDropdown.hide().then();
            this.searchInput.focus();
            this.dispatchChangeEvent();
        }
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
                    ></sl-input>
                    <div id="product-details" style="display: none; margin-left: 4em"></div>
                </div>
                <sl-menu @sl-select=${this.handleMenuSelect.bind(this)}>${this.dropDownItems}</sl-menu>
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
