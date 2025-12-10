/**
 * components/phi-fund-product-browser.ts
 * --
 * @author VJP
 * @written 23-Nov-2025
 */

import {LitElement, html, css, type PropertyValues, nothing} from 'lit'
import {customElement, property, query, queryAll, state} from 'lit/decorators.js'
import {ref, createRef} from 'lit/directives/ref.js';

import {SlCheckbox, SlDrawer, SlInput, SlSelect} from "@shoelace-style/shoelace";

import {Product, ProductResultSet} from "../../api-models/products.ts";
import {Fund, FundManager} from "../../api-models/funds.ts";
import {matchAll, matchAny, matchExactly, matchOnly} from "../../modules/utilities.ts";
import {Globals} from "../../modules/globals.ts";
import type {PhiProductDetails} from "../phi-product-details.ts";

type ProductFilterFieldType = "brand" | "policy-type" | "tier" | "adults" | "dependants" | "state" | "excess";

/**
 * Fund product browser page..
 */
@customElement('phi-fund-product-browser')
export class PhiFundProductBrowser extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex: 1 1 0;
            flex-flow: column nowrap;
            padding: 0;
        }
        div#content-area {
            display: flex;
            flex: 1 1 0;
            align-content: start;
            flex-flow: row nowrap;
            position: relative;
        }
        div#toolbar {
            display: flex;
            flex-flow: column nowrap;
            align-items: center;
            width: 48px;
            background-color: var(--sl-color-gray-400);
        }
        div#table {
            display: flex;
            flex-flow: column nowrap;
            flex: 1 1 0;
        }
        div#table > div {
            display: flex;
            flex-flow: column nowrap;
            flex: 1 1 0;
            overflow-y: scroll;
        }
        table {
            margin: 0;
            font-size: var(--sl-font-size-x-small);
        }
        thead th {
            position: sticky;
            top: 0;
            background-color: gray;
            z-index: 1;
        }
    `

    @property({attribute: "fund"}) fundCode!: string;

    @state() productResultSet: ProductResultSet | undefined;
    @state() savedResultSet: ProductResultSet | undefined;

    @query("sl-drawer") drawer!: SlDrawer;

    @query('sl-select#dependant-filter-option') dependantFilterOption!: SlSelect;
    @query('sl-input#text-search') textFilter!: SlInput;

    @query('sl-checkbox[data-phi-filter-field="brand"][data-phi-filter-value="*"]') brandSelectAllCheckBox! : SlCheckbox;
    @query('sl-checkbox[data-phi-filter-field="state"][data-phi-filter-value="*"]') stateSelectAllCheckBox! : SlCheckbox;
    @query('sl-checkbox[data-phi-filter-field="dependants"][data-phi-filter-value="*"]') dependantSelectAllCheckBox! : SlCheckbox;
    @query('sl-checkbox[data-phi-filter-field="tier"][data-phi-filter-value="*"]') tierSelectAllCheckBox! : SlCheckbox;
    @query('sl-checkbox[data-phi-filter-field="excess"][data-phi-filter-value="*"]') excessSelectAllCheckBox! : SlCheckbox;

    @queryAll('sl-checkbox[data-phi-filter-field="brand"]:not([data-phi-filter-value="*"])') brandFilterCheckBoxes! : NodeListOf<SlCheckbox>;
    @queryAll('sl-checkbox[data-phi-filter-field="state"]:not([data-phi-filter-value="*"])') stateFilterCheckBoxes! : NodeListOf<SlCheckbox>;
    @queryAll('sl-checkbox[data-phi-filter-field="adults"]:not([data-phi-filter-value="*"])') adultsFilterCheckBoxes! : NodeListOf<SlCheckbox>;
    @queryAll('sl-checkbox[data-phi-filter-field="dependants"]:not([data-phi-filter-value="*"])') dependantsFilterCheckBoxes! : NodeListOf<SlCheckbox>;
    @queryAll('sl-checkbox[data-phi-filter-field="tier"]:not([data-phi-filter-value="*"])') tierFilterCheckBoxes! : NodeListOf<SlCheckbox>;
    @queryAll('sl-checkbox[data-phi-filter-field="policy-type"]:not([data-phi-filter-value="*"])') typeFilterCheckBoxes! : NodeListOf<SlCheckbox>;
    @queryAll('sl-checkbox[data-phi-filter-field="excess"]:not([data-phi-filter-value="*"])') excessFilterCheckBoxes! : NodeListOf<SlCheckbox>;


    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);

        // Once product resultset is loaded, we can add the filter box handlers and make final adjustments.
        // We do this here because the excess filters require the product result loaded to determine what
        // excess values are required.
        if (this.savedResultSet) {
            // helper function to create handlers and make final adjustments
            const _linkFilterHandlers = function (selectAllCheckBox: SlCheckbox, filterCheckBoxes: NodeListOf<SlCheckbox>) {
                // don't display "Select all" if less than 3 options
                if (filterCheckBoxes.length < 3)
                    selectAllCheckBox.parentElement!.style.display = "none";
                // select/unselect all filters...
                selectAllCheckBox.addEventListener('sl-change', () => {
                    filterCheckBoxes.forEach(checkBox => {
                        checkBox.checked = selectAllCheckBox.checked;
                    });
                })
                // update "Select all" value when individual filter value changes
                const filterArray = Array.from(filterCheckBoxes);
                filterCheckBoxes.forEach(checkBox => {
                    checkBox.addEventListener('sl-change', () => {
                        // Are they all checked?
                        selectAllCheckBox.checked = filterArray.filter(checkBox => !checkBox.checked).length === 0;
                    })
                })
            }
            _linkFilterHandlers(this.brandSelectAllCheckBox, this.brandFilterCheckBoxes);
            _linkFilterHandlers(this.stateSelectAllCheckBox, this.stateFilterCheckBoxes);
            _linkFilterHandlers(this.tierSelectAllCheckBox, this.tierFilterCheckBoxes);
            _linkFilterHandlers(this.dependantSelectAllCheckBox, this.dependantsFilterCheckBoxes);
            _linkFilterHandlers(this.excessSelectAllCheckBox, this.excessFilterCheckBoxes);
        }
    }

    /**
     * Fetches the products from the database.  This procedure is called by the element's container when the user
     * first displays the product table.
     */
    loadProducts() {
        ProductResultSet.fetch(this.fundCode).then(rslt => {
            this.productResultSet = rslt;
            this.savedResultSet = rslt;
        });
    }

    /**
     * Handle click on individual product
     */
    displayProduct(e: MouseEvent) {
        const row = (e.target as HTMLInputElement).getAttribute("data-row-code")!;
        const element: PhiProductDetails = document.createElement("phi-product-details");
        element.setAttribute("fund-code", this.fundCode);
        element.product = this.productResultSet!.rows[Number(row)];
        Globals.get.pageManager().pushPage(element)
    }

    /**
     * Called when the product resultset filter drawer is closed.  Rebuilds the product result set.
     */
    filterChanged() {
        // helper function to extract filter values into a string.
        const extractFilter = function (checkBoxes: NodeListOf<SlCheckbox>) {
            return Array.from(checkBoxes).filter(cb => cb.checked).map(cb => cb.getAttribute('data-phi-filter-value'))
        }
        const fund = FundManager.get(this.fundCode)!;

        const stateFilter = extractFilter(this.stateFilterCheckBoxes);
        const tierFilter = extractFilter(this.tierFilterCheckBoxes);
        const adultsFilter = extractFilter(this.adultsFilterCheckBoxes);
        const typeFilter = extractFilter(this.typeFilterCheckBoxes);
        const brandsFilter = extractFilter(this.brandFilterCheckBoxes);
        const dependantsFilter = extractFilter(this.dependantsFilterCheckBoxes);
        const excessFilter = extractFilter(this.excessFilterCheckBoxes);
        const textFilter = this.textFilter.value.toUpperCase().split(' ')

        const dependantFilterFunction = [matchAny, matchAll, matchExactly, matchOnly][+this.dependantFilterOption.value]

        const rows : Product[] = []
        console.log(brandsFilter);
        for (const row of this.savedResultSet!.rows) {
            const searchableText = (row.code + " " + row.name).toUpperCase();
            const brands = (row.brands ? row.brands : fund.code) + ";";
            const dependants = (row.dependantTypesShortDescription ? row.dependantTypesShortDescription : "None").split(" ");
            console.log(brands);
            if (stateFilter.includes(row.state) &&
                tierFilter.includes(row.hospitalTier) &&
                adultsFilter.includes(row.adultsCovered.toString()) &&
                typeFilter.includes(row.type) &&
                excessFilter.includes(row.excess.toString()) &&
                brandsFilter.map(filter => brands.includes(filter!+";")).includes(true) &&
                dependantFilterFunction(dependantsFilter, dependants) &&
                matchAll(textFilter, searchableText)
            )
                rows.push(row);
        }
        this.productResultSet = new ProductResultSet(rows);
    }

    /**
     * Render a filter form for the fundCode's products.
     * @param fund
     * @param resultSet
     */
    render_filter(fund: Fund, resultSet: ProductResultSet) {
        // helper function to render a check box
        const _render_checkbox = function (dataAttribute: ProductFilterFieldType, dataValue: string, label: string) {
            return html`
            <sl-tree-item>
                <sl-checkbox checked data-phi-filter-field="${dataAttribute}" data-phi-filter-value="${dataValue}">
                    ${label}
                </sl-checkbox>
            </sl-tree-item>
        `}
        // render..
        return html`
            <sl-tree>
                <sl-tree-item>Text search
                    <sl-tree-item>
                        <sl-input id="text-search"></sl-input>
                    </sl-tree-item>
                </sl-tree-item>
                <sl-tree-item>Brands
                    ${_render_checkbox("brand", "*", "Select all")}
                    ${_render_checkbox("brand", fund.code, `${fund.name} (${fund.code})`)}
                    ${fund.brands.map(brand =>
                            _render_checkbox("brand", brand.code, `${brand.name} (${brand.code})`)
                    )}
                </sl-tree-item>
                <sl-tree-item>Policy Type
                    ${_render_checkbox("policy-type", "Combined", "Combined")}
                    ${_render_checkbox("policy-type", "Hospital", "Hospital")}
                    ${_render_checkbox("policy-type", "GeneralHealth", "General Health")}
                </sl-tree-item>
                <sl-tree-item>Hospital Tier
                    ${_render_checkbox("tier", "*", "Select all")}
                    ${_render_checkbox("tier", "None", "None")}
                    ${_render_checkbox("tier", "Basic", "Basic")}
                    ${_render_checkbox("tier", "BasicPlus", "Basic Plus")}
                    ${_render_checkbox("tier", "Bronze", "Bronze")}
                    ${_render_checkbox("tier", "BronzePlus", "Bronze Plus")}
                    ${_render_checkbox("tier", "Silver", "Silver")}
                    ${_render_checkbox("tier", "SilverPlus", "Silver Plus")}
                    ${_render_checkbox("tier", "Gold", "Gold")}
                </sl-tree-item>
                <sl-tree-item>Adults Covered
                    ${_render_checkbox("adults", "1", "1 Adult")}
                    ${_render_checkbox("adults", "2", "2 Adults")}
                    ${_render_checkbox("adults", "0", "No Adult")}
                </sl-tree-item>
                <sl-tree-item>Dependants
                    <sl-tree-item>
                        <sl-select id="dependant-filter-option" value="0">
                            <sl-option value="0">Match Any</sl-option>
                            <sl-option value="1">Match All</sl-option>
                            <sl-option value="2">Match Exactly</sl-option>
                            <sl-option value="3">Match Only</sl-option>
                        </sl-select>
                    </sl-tree-item>
                    ${_render_checkbox("dependants", "*", "Select all")}
                    ${_render_checkbox("dependants", "None", "No Dependants")}
                    ${_render_checkbox("dependants", "Ch", "Child")}
                    ${_render_checkbox("dependants", "St", "Student")}
                    ${_render_checkbox("dependants", "NonSt", "Non Student")}
                    ${_render_checkbox("dependants", "YAdlt", "Young Adult")}
                    ${_render_checkbox("dependants", "NonCls", "Non Classified")}
                </sl-tree-item>
                <sl-tree-item>State
                    ${_render_checkbox("state", "*", "Select all")}
                    ${_render_checkbox("state", "ALL", "ALL")}
                    ${_render_checkbox("state", "NSW", "NSW/ACT")}
                    ${_render_checkbox("state", "VIC", "VIC")}
                    ${_render_checkbox("state", "QLD", "QLD")}
                    ${_render_checkbox("state", "SA", "SA")}
                    ${_render_checkbox("state", "WA", "WA")}
                    ${_render_checkbox("state", "TAS", "TAS")}
                    ${_render_checkbox("state", "NT", "NT")}
                </sl-tree-item>
                <sl-tree-item>Excess
                    ${_render_checkbox("excess", "*", "Select all")}
                    ${resultSet.distinctExcessValues().map(excess =>
                            _render_checkbox("excess", excess.toString(), excess === 0 ? "Nil" : excess.toString())
                    )}
                </sl-tree-item>
            </sl-tree>
        `
    }

    /**
     * Render the product result set in a `<table>`.
     * @param resultSet
     */
    render_product_table(resultSet: ProductResultSet) {
        const currency = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'AUD',
                currencyDisplay: "narrowSymbol",
                minimumFractionDigits: 2,
            })
        return html`
        <div>
            <table @click=${this.displayProduct}>
                <thead>
                <th></th>
                <th>Code</th>
                <th>Brands</th>
                <th>Name</th>
                <th>State</th>
                <th>Tier</th>
                <th>Excess</th>
                <th>Type</th>
                <th>Adults</th>
                <th>Dependants</th>
                <th>Corporate</th>
                <th>Premium</th>
                </thead>
                ${resultSet.rows.map((row, index) => html`
                    <tr>
                        <td>
                            <sl-icon-button
                                name="arrow-right"
                                data-row-code="${index}"
                                label="Display product details"
                            ></sl-icon-button>
                        </td>
                        <td>${row.code}</td>
                        <td>${row.brands}</td>
                        <td>${row.name}</td>
                        <td>${row.state}</td>
                        <td>${row.hospitalTier}</td>
                        <td>${row.excess ? row.excess : ""}</td>
                        <td>${row.type}</td>
                        <td>${row.adultsCovered}</td>
                        <td>${row.dependantTypesShortDescription}</td>
                        <td>${row.isCorporate}</td>
                        <td style="text-align: right">${currency.format(row.premium)}</td>
                    </tr>
                `)}
            </table>
        </div>
    `
    }

    render() {
        const fund = FundManager.get(this.fundCode)!;
        const filterDrawerRef = createRef();
        const spinners = html `
            <sl-spinner style="font-size: 50px; --track-width: 10px;"></sl-spinner>
            <sl-spinner style="font-size: 50px; --track-width: 10px;"></sl-spinner>
            <sl-spinner style="font-size: 50px; --track-width: 10px;"></sl-spinner>
        `
        return html`
            <div id="content-area">
                <sl-drawer ${ref(filterDrawerRef)} label="Filter" placement="start" contained class="drawer-contained" @sl-hide=${(e:Event)=> {
                    if (e.target === filterDrawerRef.value)
                        this.filterChanged()
                }}>
                    ${this.productResultSet === undefined ? nothing : this.render_filter(fund, this.savedResultSet!)}
                </sl-drawer>

                <div id="toolbar">
                    <sl-icon-button name="funnel" @click="${()=>this.drawer.show()}"></sl-icon-button>
                    <sl-icon-button name="filter-circle"></sl-icon-button>
                </div>

                <div id ="table">
                    ${this.productResultSet === undefined ? spinners : this.render_product_table(this.productResultSet!)}
                </div>
            </div>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-fund-product-browser': PhiFundProductBrowser,
    }
}
