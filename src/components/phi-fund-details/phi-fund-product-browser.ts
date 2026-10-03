/*
 * components/phi-fund-product-browser.ts
 * --
 * @author VJP
 * @written 23-Nov-2025
 */

import {LitElement, html, css, nothing, type PropertyValues} from 'lit'
import {customElement, property, query, queryAll, state} from 'lit/decorators.js'

import {SlCheckbox, SlDrawer, SlInput} from "@shoelace-style/shoelace";

import {ProductGroup, ProductVariant} from 'phi-common'
import type {ProductType, HospitalTier, AccommodationType, AusState, DependantCoverFlags} from 'phi-common'

import {Product, ProductManager} from "../../api-models/products.ts";
import {Fund, FundManager} from "../../api-models/funds.ts";
import {Globals} from "../../modules/globals.ts";


type ProductFilterFieldType = "brand" | "policy-type" | "tier" | "adults" | "dependants" | "state" | "excess" | "accommodation";

/**
 * Fund product browser page..
 */
@customElement('phi-fund-product-group-browser')
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

        table {
            margin: 0;
            font-size: var(--sl-font-size-x-small);
        }

        /* Group table container and sub-container */
        div#groups {
            display: flex;
            flex-flow: column nowrap;
            flex: 1 1 0;
        }
        div#groups > div {
            display: flex;
            flex-flow: column nowrap;
            flex: 1 1 0;
            overflow-y: scroll;
        }
        
        /* Group table formatting */
        table#group-table > thead th {
            position: sticky;
            top: 0;
            background-color: gray;
            z-index: 1;
        }
        
        /* Variant table and row styles */
        div.variants {
            display: flex;
            margin-left: 2em;
            margin-right: 2em;
            flex-flow: column wrap;
            align-content: center;
            justify-content: center;
            background-color: var(--sl-color-primary-100);
        }
        div.variants > table {
            width: fit-content;
            border-collapse: separate;
            border-spacing: 4em 2px;
        }
        
        td.dependant-cover {
            text-align: center;
        }
        
        /* Spinner style */
        sl-spinner {
            position: absolute;
            top:  50%;
            left: 50%;
            transform: translate(-50%,-50%);
            font-size: 64px; 
            --track-width: 12px;
        }
    `

    @property({attribute: "fund"}) fundCode!: string;
    @state() productGroups: ProductGroup[] = [];
    @state() filteredGroups: ProductGroup[] = [];
    @state() excessCodes: number[] = [];
    @state() coverCombinations: number[] = [];
    @state() expandedGroups: Set<ProductGroup> = new Set();

    @query("sl-drawer") drawer!: SlDrawer;

    /* ------ Groups filters checkboxes ------ */

    @query('sl-input#text-search') textFilter!: SlInput;
    @query('sl-input#code-search') codeFilter!: SlInput;

    @query('sl-checkbox[data-phi-filter-field="brand"][data-phi-filter-value="*"]') brandSelectAllCheckBox! : SlCheckbox;
    @query('sl-checkbox[data-phi-filter-field="tier"][data-phi-filter-value="*"]') tierSelectAllCheckBox! : SlCheckbox;
    @query('sl-checkbox[data-phi-filter-field="accommodation"][data-phi-filter-value="*"]') accommodationSelectAllCheckBox! : SlCheckbox;

    @queryAll('sl-checkbox[data-phi-filter-field="brand"]:not([data-phi-filter-value="*"])') brandFilterCheckBoxes! : NodeListOf<SlCheckbox>;
    @queryAll('sl-checkbox[data-phi-filter-field="tier"]:not([data-phi-filter-value="*"])') tierFilterCheckBoxes! : NodeListOf<SlCheckbox>;
    @queryAll('sl-checkbox[data-phi-filter-field="policy-type"]:not([data-phi-filter-value="*"])') typeFilterCheckBoxes! : NodeListOf<SlCheckbox>;
    @queryAll('sl-checkbox[data-phi-filter-field="accommodation"]:not([data-phi-filter-value="*"])') accommodationFilterCheckBoxes! : NodeListOf<SlCheckbox>;

    /* ------- Variant filters checkboxes ------- */

    @query('sl-checkbox[data-phi-filter-field="state"][data-phi-filter-value="*"]') stateSelectAllCheckBox! : SlCheckbox;
    @query('sl-checkbox[data-phi-filter-field="dependants"][data-phi-filter-value="*"]') dependantSelectAllCheckBox! : SlCheckbox;
    @query('sl-checkbox[data-phi-filter-field="excess"][data-phi-filter-value="*"]') excessSelectAllCheckBox! : SlCheckbox;

    @queryAll('sl-checkbox[data-phi-filter-field="state"]:not([data-phi-filter-value="*"])') stateFilterCheckBoxes! : NodeListOf<SlCheckbox>;
    @queryAll('sl-checkbox[data-phi-filter-field="adults"]:not([data-phi-filter-value="*"])') adultsFilterCheckBoxes! : NodeListOf<SlCheckbox>;
    @queryAll('sl-checkbox[data-phi-filter-field="dependants"]:not([data-phi-filter-value="*"])') dependantsFilterCheckBoxes! : NodeListOf<SlCheckbox>;
    @queryAll('sl-checkbox[data-phi-filter-field="excess"]:not([data-phi-filter-value="*"])') excessFilterCheckBoxes! : NodeListOf<SlCheckbox>;

    /**
     * Updated lifecycle event
     * @param _changedProperties
     * @protected
     */
    protected updated(_changedProperties: PropertyValues) {
        const setupHandlers = function(filterCheckBoxes: NodeListOf<SlCheckbox>, selectAllCheckBox: SlCheckbox | null) {
            if (selectAllCheckBox) {
                // don't display "Select all" if less than 3 options
                selectAllCheckBox.parentElement!.style.display = filterCheckBoxes.length < 3 ? "none" : "block";
                // select/unselect all filters...
                selectAllCheckBox.addEventListener('sl-change', () => {
                    filterCheckBoxes.forEach(checkBox => { checkBox.checked = selectAllCheckBox.checked });
                })
            }
            // update "Select all" value when individual filter value changes
            const filterArray = Array.from(filterCheckBoxes);
            filterCheckBoxes.forEach(checkBox => {
                checkBox.addEventListener('sl-change', () => {
                    // Are they all checked?
                    if (selectAllCheckBox)
                        selectAllCheckBox.checked = filterArray.filter(checkBox => !checkBox.checked).length === 0;
                })
            })
        }
        setupHandlers(this.brandFilterCheckBoxes, this.brandSelectAllCheckBox);
        setupHandlers(this.typeFilterCheckBoxes, null)
        setupHandlers(this.tierFilterCheckBoxes, this.tierSelectAllCheckBox);
        setupHandlers(this.accommodationFilterCheckBoxes, this.accommodationSelectAllCheckBox);
        setupHandlers(this.adultsFilterCheckBoxes, null);
        setupHandlers(this.dependantsFilterCheckBoxes, this.dependantSelectAllCheckBox);
        setupHandlers(this.stateFilterCheckBoxes, this.stateSelectAllCheckBox);
        setupHandlers(this.excessFilterCheckBoxes, this.excessSelectAllCheckBox);
    }

    /**
     * Load the products for the fund.  Called by the parent component.
     */
    loadProducts() {
        ProductManager.search({funds: [this.fundCode]}).then(groups => {
            this.productGroups = groups;
            this.filteredGroups = groups;
            const excessCodes = new Set<number>();
            const dependants = new Set<number>();
            for (const group of this.productGroups) {
                for (const variant of group) {
                    excessCodes.add(variant.excess);
                    dependants.add(variant.dependantCoverFlags);
                }
            }
            this.excessCodes = [...excessCodes.values()].sort();
            this.coverCombinations = [...dependants.values()].sort();
        });
    }

    /**
     * Filter change event handler.
     */
    filterChanged() {
        // helper function to extract filter values into a string array.
        const extractFilter = function (checkBoxes: NodeListOf<SlCheckbox>) {
            return Array.from(checkBoxes).filter(cb => cb.checked).map(cb => cb.getAttribute('data-phi-filter-value'))
        }

        ProductManager.search({
            keyWords:           this.textFilter.value.split(' ').filter((word) => word.length > 0),
            code:               [this.codeFilter.value].filter((word) => word.length > 0),
            funds:              [this.fundCode],
            brands:             extractFilter(this.brandFilterCheckBoxes) as string[],
            type:               extractFilter(this.typeFilterCheckBoxes) as ProductType[],
            accommodationType:  extractFilter(this.accommodationFilterCheckBoxes) as AccommodationType[],
            hospitalTier:       extractFilter(this.tierFilterCheckBoxes) as HospitalTier[],
            state:              extractFilter(this.stateFilterCheckBoxes) as AusState[],
            adults:             extractFilter(this.adultsFilterCheckBoxes).map((filter) => parseInt(filter!)) as number[],
            excess:             extractFilter(this.excessFilterCheckBoxes).map((filter) => parseInt(filter!)) as number[],
            dependantCoverFlags: extractFilter(this.dependantsFilterCheckBoxes).map((filter) => parseInt(filter!)) as number[],
        }).then(groups => {
            this.filteredGroups = groups;
        });
    }

    /**
     * Render a filter form for the fund's products.
     * @param fund
     */
    render_filter(fund: Fund) {
        // map of cover flags to desired description
        const coverMap:  Record<keyof DependantCoverFlags, string> = {
            childCover: "Child",
            studentCover: "Student",
            nonStudentCover: "Non-St",
            conditionalNonStudentCover: "Non-St(cond)",
            nonClassifiedCover: "Non-Class",
            disabilityCover: "Disabled"
        }
        // helper function to render a checkbox
        const render_checkbox = function (dataAttribute: ProductFilterFieldType, dataValue: string, label: string) {
           return html`
            <sl-tree-item>
                <sl-checkbox checked data-phi-filter-field="${dataAttribute}" data-phi-filter-value="${dataValue}">
                    ${label}
                </sl-checkbox>
            </sl-tree-item>
        `}
        // helper function to render the dependent cover
        const _coverComboDescription = function(cover:number) {
            if (cover === 0)
                return "No dependants";
            const coverFlags = ProductVariant.unpackDependantCoverFlags(cover);
            return Array.from(Object.getOwnPropertyNames(coverMap))
                .filter((prop) => coverFlags[prop as keyof DependantCoverFlags])
                .map((prop) => coverMap[prop as keyof DependantCoverFlags])
                .join(",")
        }
        // main filter render..
        return html`
            <sl-tree @sl-change=${() => this.filterChanged()}>
                <sl-tree-item>Text search
                    <sl-tree-item>
                        <sl-input id="text-search"></sl-input>
                    </sl-tree-item>
                </sl-tree-item>
                <sl-tree-item>Product code search
                    <sl-tree-item>
                        <sl-input id="code-search"></sl-input>
                    </sl-tree-item>
                </sl-tree-item>
                <sl-tree-item>Brands
                    ${render_checkbox("brand", "*", "Select all")}
                    ${render_checkbox("brand", fund.code, `${fund.name} (${fund.code})`)}
                    ${fund.brands.map(brand =>
                            render_checkbox("brand", brand.code, `${brand.name} (${brand.code})`)
                    )}
                </sl-tree-item>
                <sl-tree-item>Policy Type
                    ${render_checkbox("policy-type", "Combined", "Combined")}
                    ${render_checkbox("policy-type", "Hospital", "Hospital")}
                    ${render_checkbox("policy-type", "GeneralHealth", "General Health")}
                </sl-tree-item>
                <sl-tree-item>Hospital Tier
                    ${render_checkbox("tier", "*", "Select all")}
                    ${render_checkbox("tier", "None", "None")}
                    ${render_checkbox("tier", "Basic", "Basic")}
                    ${render_checkbox("tier", "BasicPlus", "Basic Plus")}
                    ${render_checkbox("tier", "Bronze", "Bronze")}
                    ${render_checkbox("tier", "BronzePlus", "Bronze Plus")}
                    ${render_checkbox("tier", "Silver", "Silver")}
                    ${render_checkbox("tier", "SilverPlus", "Silver Plus")}
                    ${render_checkbox("tier", "Gold", "Gold")}
                </sl-tree-item>
                <sl-tree-item>Accommodation
                    ${render_checkbox("accommodation", "*", "Select all")}
                    ${render_checkbox("accommodation", "None", "N/a")}
                    ${render_checkbox("accommodation", "PrivateOrPublic", "PrivateOrPublic")}
                    ${render_checkbox("accommodation", "PrivateSharedPublic", "PrivateSharedPublic")}
                    ${render_checkbox("accommodation", "PrivateSharedPublicShared", "PrivateSharedPublicShared")}
                    ${render_checkbox("accommodation", "Public", "Public")}
                    ${render_checkbox("accommodation", "PublicShared", "PublicShared")}
                    ${render_checkbox("accommodation", "PrivatePublicShared", "PrivatePublicShared")}
                </sl-tree-item>
                <sl-tree-item>Adults Covered
                    ${render_checkbox("adults", "1", "1 Adult")}
                    ${render_checkbox("adults", "2", "2 Adults")}
                    ${render_checkbox("adults", "0", "No Adult")}
                </sl-tree-item>
                <sl-tree-item>Dependants
                    ${render_checkbox("dependants", "*", "Select all")}
                    ${this.coverCombinations.map((coverCombination) => 
                         render_checkbox("dependants", coverCombination.toString(), _coverComboDescription(coverCombination))
                    )}
                </sl-tree-item>
                <sl-tree-item>State
                    ${render_checkbox("state", "*", "Select all")}
                    ${render_checkbox("state", "ALL", "ALL")}
                    ${render_checkbox("state", "NSW", "NSW/ACT")}
                    ${render_checkbox("state", "VIC", "VIC")}
                    ${render_checkbox("state", "QLD", "QLD")}
                    ${render_checkbox("state", "SA", "SA")}
                    ${render_checkbox("state", "WA", "WA")}
                    ${render_checkbox("state", "TAS", "TAS")}
                    ${render_checkbox("state", "NT", "NT")}
                </sl-tree-item>
                <sl-tree-item>Excess
                    ${render_checkbox("excess", "*", "Select all")}
                    ${this.excessCodes.map(excess =>
                         render_checkbox("excess", excess.toString(), excess === 0 ? "Nil" : excess.toString())
                    )}
                </sl-tree-item>
            </sl-tree>
        `
    }

    /**
     * Render the number of product variants in this group.  Only includes variants that match the current filter settings.
     * @param group
     */
    render_variant_count(group: ProductGroup) {
        const expanded = this.expandedGroups.has(group.origin);
        const iconName = expanded ? "caret-down-fill" : "caret-right-fill";

        return html`
            <sl-icon-button 
                name="${iconName}" 
                label="Expand/collapse"
                @click=${() => {
                    if (expanded) {
                        this.expandedGroups.delete(group.origin);
                    } else {
                        this.expandedGroups.add(group.origin);
                    }
                    this.requestUpdate();
                }}
            >
            </sl-icon-button>
            ${group.variants.length}
        `
    }

    /**
     * Render the variants for a product group
     * @param group
     */
    render_variants(group: ProductGroup) {
        const currency = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'AUD',
            currencyDisplay: "narrowSymbol",
            minimumFractionDigits: 2,
        })
        // Render a tick or blank for the dependant cover
        const render_cover = function(covered: boolean) {
            return covered ? html `<sl-icon name="check" label="Covered"></sl-icon>` : nothing;
        }
        // click handler to drill-down into an individual product variant
        const display_product = (variant: ProductVariant) => {
            const element = document.createElement("phi-product-details");
            element.setAttribute("fund-code", this.fundCode);
            element.product = new Product(group, variant)
            Globals.get.pageManager().pushPage(element);
        }

        const variants = [...group.variants].map((variant) => new ProductVariant(variant));
        if (variants.length > 0 && this.expandedGroups.has(group.origin)) {
            return html`
                <tr><td colspan="7">
                    <div class="variants">
                        <table>
                            <thead>
                                <th>Code</th>
                                <th>State</th>
                                <th class="dependant-cover">Adults</th>
                                <th class="dependant-cover">Child</th>
                                <th class="dependant-cover">Student</th>
                                <th class="dependant-cover">Non-Student</th>
                                <th class="dependant-cover">Non-St (cond)</th>
                                <th class="dependant-cover">Non-Clss'ed</th>
                                <th class="dependant-cover">Disability</th>
                                <th>Excess</th>
                                <th>Premium</th>
                                <th></th>
                            </thead>
                            ${variants.map((variant) => html `
                                <tr>
                                    <td>${variant.code}</td>
                                    <td>${variant.state}</td>
                                    <td class="dependant-cover">${variant.adultsCovered}</td>
                                    <td class="dependant-cover">${render_cover(variant.childCover)}</td>
                                    <td class="dependant-cover">${render_cover(variant.studentCover)}</td>
                                    <td class="dependant-cover">${render_cover(variant.nonStudentCover)}</td>
                                    <td class="dependant-cover">${render_cover(variant.conditionalNonStudentCover)}</td>
                                    <td class="dependant-cover">${render_cover(variant.nonClassifiedCover)}</td>
                                    <td class="dependant-cover">${render_cover(variant.disabilityCover)}</td>
                                    <td>${variant.excess}</td>
                                    <td style="text-align: right">${currency.format(variant.premium)}</td>
                                    <td>
                                        <sl-icon-button
                                                name="arrow-right"
                                                label="Display product details"
                                                @click=${() => display_product(variant)}
                                        ></sl-icon-button>
                                    </td>

                                </tr>
                            `)}
                        </table>
                    </div>
                </td></tr>
            `
        }
        return nothing;
    }
    /**
     * Render the product result set in a `<table>`.
     */
    render_group_table(groups: ProductGroup[]) {
        const headings = ["Name", "Brands", "Tier", "Accommodation", "Type", "Corporate", "Variants"];
        return html`
            <div>
                <table id="group-table">
                    <thead>
                        ${headings.map((header) => html`<th>${header}</th>`)}
                    </thead>
                    ${groups.filter((row) => row.variants.length > 0).map((row) => html`
                        <tr>
                            <td>${row.name}</td>
                            <td>${row.brands}</td>
                            <td>${row.hospitalTier}</td>
                            <td>${row.accommodationType}</td>
                            <td>${row.type}</td>
                            <td>${row.isCorporate}</td>
                            <td>${this.render_variant_count(row)}</td>
                        </tr>
                        ${this.render_variants(row)}
                    `)}
                </table>
            </div>
        `
    }

    /**
     * Main render routine
     */
    render() {
        const fund = FundManager.get(this.fundCode)!;
        return html`
            <div id="content-area">
                <sl-drawer label="Filter" placement="start" contained class="drawer-contained">
                    ${this.productGroups === undefined ? nothing : this.render_filter(fund)}
                </sl-drawer>

                <div id="toolbar">
                    <sl-icon-button name="funnel" @click="${()=>this.drawer.show()}"></sl-icon-button>
                    <sl-icon-button name="filter-circle"></sl-icon-button>
                </div>

                <div id ="groups">
                    ${this.filteredGroups === undefined ? html `<sl-spinner></sl-spinner>` : this.render_group_table(this.filteredGroups)}
                </div>
            </div>
        `
    }
}

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-fund-product-browser': PhiFundProductBrowser;
    }
}