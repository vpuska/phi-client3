// noinspection JSUnusedGlobalSymbols

import {ProductGroup, ProductVariant, AUS_STATES} from "phi-common"
import type {SerializedProductGroup, ProductStatus, AccommodationType, AusState, ProductType, ProductPairingType, HospitalTier} from "phi-common"

const PRODUCT_API = 'https://phi-demo-api.spartlet.net'

import {Fund, FundManager} from "./funds.ts";

export type ProductStatisticsType = {
    combinedCount: number;
    hospitalCount: number;
    generalCount: number;
}

export type ProductKeywordSearchResult = {
    fund: string,
    productName: string,
    fundName: string,
    fundShortName: string
};


export type ProductSearchOptions = {
    code: string[],
    keyWords: string[],
    type: ProductType[],
    status: ProductStatus[],
    funds: string[],
    brands: string[],
    isCorporate: boolean[],
    hospitalTier: HospitalTier[],
    accommodationType: AccommodationType[],
    state: (AusState | "ALL")[],
    excess: number[],
    adults: number[],
    dependantCoverFlags: number[],
    childCover: boolean[],
    studentCover: boolean[],
    nonStudentCover: boolean[],
    nonClassifiedCover: boolean[],
    conditionalNonStudentCover: boolean[],
    disabilityCover: boolean[],
}

/**
 * Class encapsulating the product combining the {@Link ProductGroup} and {@Link ProductVariant}.
 */
export class Product {
    fund: Fund;
    group: ProductGroup;
    variant: ProductVariant;
    maxYoungAdultAge: number = 0;
    maxStudentAge: number = 0;

    constructor(group: ProductGroup, variant: ProductVariant) {
        this.group = group;
        this.variant = variant;

        this.fund = FundManager.get(group.fundCode)!;
        this.maxYoungAdultAge = Math.max(
            this.nonStudentCover ? this.fund.dependantLimits.dependantLimits.get("NonStudent")!.maxAge : 0,
            this.nonClassifiedCover ? this.fund.dependantLimits.dependantLimits.get("NonClassified")!.maxAge : 0,
            this.conditionalNonStudentCover ? this.fund.dependantLimits.dependantLimits.get("ConditionalNonStudent")!.maxAge : 0,
        )
        this.maxStudentAge = this.studentCover ? this.fund.dependantLimits.dependantLimits.get("Student")!.maxAge : 0;
    }

    // Product's PHIS code.  Eg: `H24/A2741D0`
    get code() { return this.variant.code; }
    // Product's fund code.  Eg: `BUP`
    get fundCode() { return this.group.fundCode; }
    get name() { return this.group.name; }
    get type() { return this.group.type as ProductType; }
    get state() { return this.variant.state as "ALL" | AusState; }
    get isCorporate() { return this.group.isCorporate; }
    get brandCodes() { return this.group.brands; }
    get onlyAvailableWith() { return this.group.onlyAvailableWith as ProductPairingType; }
    get onlyAvailableWithProducts() { return this.group.onlyAvailableWithProducts || "" }
    get adultsCovered() { return this.variant.adultsCovered; }
    get dependantCover() { return this.variant.dependantCover; }
    get childCover() { return this.variant.childCover; }
    get studentCover() { return this.variant.studentCover; }
    get youngAdultCover() { return this.variant.nonClassifiedCover || this.variant.nonStudentCover || this.variant.conditionalNonStudentCover; }
    get nonClassifiedCover() { return this.variant.nonClassifiedCover; }
    get nonStudentCover() { return this.variant.nonStudentCover; }
    get conditionalNonStudentCover() { return this.variant.conditionalNonStudentCover; }
    get disabilityCover() { return this.variant.disabilityCover; }
    get premium() { return this.variant.premium; }
    get hospitalComponent() { return this.variant.hospitalComponent; }
    get hospitalTier()  { return this.group.hospitalTier as HospitalTier }
    get accommodationType() { return (this.group.accommodationType || "") as AccommodationType; }
    get services() { return this.group.services; }
    get excess() { return this.variant.excess }


    get fundBrand() {
        //TODO: In theory, there could be more than one brand code, but no such case appears in PHIO data
        if (this.brandCodes && this.brandCodes.length > 0)
            return FundManager.fundBrandMap.get(this.brandCodes)!;
        else
            return FundManager.fundBrandMap.get(this.fundCode)!;
    }

    get isHospital() {
        return this.type === "Hospital" || this.type === "Combined";
    }

    get isGeneralHealth() {
        return this.type === "GeneralHealth" || this.type === "Combined";
    }

    get coverageDescription() {
        if (this.adultsCovered === 0)
            return "Dependants Only"
        else
            if (this.adultsCovered === 1)
                return this.dependantCover ? "Single Parent Family" : "Single";
            else
                return this.dependantCover ? "Family" : "Couple";
    }

    get dependantTypesShortDescription() {
        let types = "";
        if (this.childCover)
            types += "Ch ";
        if (this.studentCover)
            types += "St ";
        if (this.nonStudentCover)
            types += "NonSt ";
        if (this.youngAdultCover)
            types += "YAdlt ";
        if (this.nonClassifiedCover)
            types += "NonCls ";
        if (this.conditionalNonStudentCover)
            types += "Cond ";
        if (this.disabilityCover)
            types += "Dis ";
        return types;
    }

    get dependantTypesLongDescriptions() {
        const types = [];
        if (this.childCover)
            types.push("Children")
        if (this.studentCover)
            types.push("Students")
        if (this.nonStudentCover)
            types.push("Non-Students")
        if (this.youngAdultCover)
            types.push("Young Adults")
        if (this.nonClassifiedCover)
            types.push("Non-Classified Dependants")
        if (this.conditionalNonStudentCover)
            types.push("Conditional Non-Students")
        if (this.disabilityCover)
            types.push("Disability Dependants")
        return types;
    }

    get searchableKeys() : string[] {
        let keys = this.name.toUpperCase().split(" ").filter(term => term.length > 0);
        keys.push(this.code);
        keys = keys.concat(this.fundBrand.shortName.toUpperCase().split(" ").filter(term => term.length > 0));
        if (this.state === "ALL")
            keys.concat(AUS_STATES)
        else
            keys.push(this.state);
        if (this.adultsCovered === 1)
            keys = keys.concat(this.dependantCover ? ["SOLE", "PARENT"] : ["SINGLE"]);
        if (this.adultsCovered === 2)
            keys.push(this.dependantCover ? "FAMILY" : "COUPLE");
        if (this.adultsCovered === 0)
            keys = keys.concat(["DEPENDANTS", "ONLY"])
        if (this.disabilityCover)
            keys.push("DISABILITY");
        return keys;
    }

    canPackageWith(product: Product) : boolean {
        // Check matching attributes...
        if (this.fundCode !== product.fundCode ||
            this.brandCodes !== product.brandCodes || // assuming only 1 brand per product for now
            this.isCorporate !== product.isCorporate ||
            this.state !== product.state ||
            this.adultsCovered !== product.adultsCovered ||
            this.childCover !== product.childCover ||
            this.studentCover !== product.studentCover ||
            this.youngAdultCover !== product.youngAdultCover ||
            this.nonClassifiedCover !== product.nonClassifiedCover ||
            this.adultsCovered !== product.adultsCovered ||
            this.disabilityCover !== product.disabilityCover)
            return false;

        // Can only package hospital with general health...
        if (this.type === "Combined" || product.type === "Combined" || this.type === product.type )
            return false;

        // Check if the product is only available with certain products...
        if (this.onlyAvailableWith === "NotApplicable" ||
            this.onlyAvailableWith === "AnyHospital" ||
            this.onlyAvailableWith === "AnyGeneralHealth" )
            return true;

        // We get here if the product is only available with certain products...
        const validTableCodes = this.onlyAvailableWithProducts!.split(";");
        if (validTableCodes.length === 0)
            return false;
        const otherTableCode = product.code.split("/")[0];
        return validTableCodes.includes(otherTableCode);
    }

    coversService(service: string) : "Y" | "N" | "R" {
        if (this.services === null || this.services === undefined)
            return "N";
        if (this.services.includes(service + "-"))
            return "R";
        if (this.services.includes(service))
            return "Y"
        else
            return "N";
    }

    /**
     * Returns the product JSON field value.
     * @param fieldName
     */
    getField(fieldName: string): any {
        return this[fieldName as keyof Product];
    }

    async getXml() : Promise<string> {
        const response = await fetch(`${PRODUCT_API}/products/xml/${this.fundCode}/${this.code}`);
        if (response.ok) {
            return await response.text();
        }
        return "";
    }
}

/**
 * The products returned from the product dataset.
 */
export class ProductResultSet {

    private readonly resultSet: Array<Product>;
    sortOrder: Array<string|null> = [ null, null, null ];

    /**
     * @param resultSet The array of {@link Product}s returned by the api.
     */
    constructor(resultSet: Array<Product>) {
        this.resultSet = resultSet;
        this.sort('type', 'state', 'name');
    }

    /**
     * Accesses the {@link Product} array returned by the api.
     */
    get rows() {
        return this.resultSet;
    }

    /**
     * Sorts the result set on the nominated field.  The sort function uses the last 2
     * fields as secondary sort keys.
     * @param fields
     */
    sort(...fields: string[]) {
        for (const field of fields.reverse()) {
            this.sortOrder[2] = this.sortOrder[1];
            this.sortOrder[1] = this.sortOrder[0];
            this.sortOrder[0] = field;
        }
        this.resultSet.sort(this._compare.bind(this));
    }

    private _compare(a : Product, b : Product) : number {
        for (const field of this.sortOrder) {
            if (field == null)
                return 0;
            if (a.getField(field) < b.getField(field))
                return -1;
            if (a.getField(field) > b.getField(field))
                return 1;
        }
        return 0;
    }

    /**
     * Returns the distinct excess values in the result set.
     * Eg. [0, 250, 500, 750]
     */
    distinctExcessValues() : number[] {
        const values = new Set<number>();
        for(const row of this.rows)
            values.add(row.excess)
        return Array.from(values).sort((a,b)=>a-b);
    }
}


/**
 * The ProductManager class is responsible for managing product groups and providing
 * functionalities to load product data sets and perform searches based on various criteria.
 */

export class ProductManager {

    /**
     * The product groups managed by the ProductManager.  These are loaded by {@link ProductManager.loadDataSet}.
     * @private
     */
    private static productGroups: ProductGroup[] = [];

    /**
     * Asynchronously loads a dataset of product groups by fetching data from the specified API endpoint.
     * The retrieved dataset is processed and stored in the `productGroups` property as instances of `ProductGroup`.
     * This method clears any existing data in `productGroups` before populating it with the fetched data.
     * This method only needs to be called once to initialize the product groups.
     *
     * @return {Promise<void>} A promise that resolves once the dataset has been successfully fetched and processed.
     */
    public static async loadDataSet() {
        this.productGroups = [];
        const response = await fetch(`${PRODUCT_API}/products/dataset`);
        if (response.ok) {
            const groups: SerializedProductGroup[] = await response.json();
            for (const group of groups)
                this.productGroups.push(new ProductGroup(group));
        }
    }

    /**
     * Product search method.  This method searches the product groups managed by the ProductManager for products that match the specified search options.
     * @param options
     * @param limit
     * @param signal
     */
    public static async search(options: Partial<ProductSearchOptions>, limit: number = 0, signal?: AbortSignal) {

        // helper function to check if a value is not found in the product search options
        const not_includes = function <K extends keyof ProductSearchOptions>(key: K, value: ProductSearchOptions[K][number]) : boolean {
            if (key in options) {
                const filter = options[key] as any;
                return !filter.includes(value);
            } else
                return false;
        }

        // helper function to check if all search keys can be found in an array of tokens (target)
        const all_search_keys_found = function(target: string, searchKeys: string[]) {
            return searchKeys.every(key => target.includes(key));
        }

        const results: ProductGroup[] = [];

        let iterations = 0;
        let count = 0;

        const variantKeyWords = [ ...AUS_STATES, "FAMILY", "COUPLE", "SINGLE", "SOLE", "PARENT", "DEPENDANTS", "ONLY", "DISABILITY" ];
        const optionsKeyWords = ("keyWords" in options && options["keyWords"] !== undefined) ? options["keyWords"].map(word => word.toUpperCase()) : [];
        const codeKeyWords = ("code" in options && options["code"] !== undefined) ? options["code"].map(word => word.toUpperCase()) : [];
        const keywordsThatMustMatchTitle = optionsKeyWords.filter(keyWord => !variantKeyWords.some(key => key.includes(keyWord)));

        for (const group of this.productGroups) {
            const brands = group.brands ? group.brands : group.fundCode;

            if (not_includes("type", group.type)) continue;
            if (not_includes("status", group.status)) continue;
            if (not_includes("isCorporate", group.isCorporate)) continue;
            if (not_includes("hospitalTier", group.hospitalTier)) continue;
            if (not_includes("funds", group.fundCode)) continue;
            if (not_includes("brands", brands)) continue;
            if (not_includes("accommodationType", group.accommodationType)) continue;

            // Filter out groups that don't contain all the keywords in the title.
            const extendedGroupTitle = `${group.name} ${FundManager.fundBrandMap.get(brands)!.shortName}`.toUpperCase();
            if (!all_search_keys_found(extendedGroupTitle, keywordsThatMustMatchTitle))
                continue;

            const filteredGroup = group.clone();

            for (const variant of group) {
                if (iterations++ % 12500 === 0) {
                    await new Promise((resolve) => setTimeout(resolve,0));
                    signal?.throwIfAborted();
                }

                if (variant.state !== "ALL")
                    if (not_includes("state", variant.state)) continue;
                if (not_includes("adults", variant.adultsCovered)) continue;
                if (not_includes("dependantCoverFlags", variant.dependantCoverFlags)) continue;
                if (not_includes("childCover", variant.childCover)) continue;
                if (not_includes("studentCover", variant.studentCover)) continue;
                if (not_includes("nonStudentCover", variant.nonStudentCover)) continue;
                if (not_includes("nonClassifiedCover", variant.nonClassifiedCover)) continue;
                if (not_includes("conditionalNonStudentCover", variant.conditionalNonStudentCover)) continue;
                if (not_includes("disabilityCover", variant.disabilityCover)) continue;
                if (not_includes("excess", variant.excess)) continue;

                if (!all_search_keys_found(variant.code, codeKeyWords))
                    continue;

                const productKeys = (new Product(group, variant)).searchableKeys.join(" ").toUpperCase();
                if (!all_search_keys_found(productKeys, optionsKeyWords))
                    continue;

                filteredGroup.addVariant(variant)
                count++;
                if (count >= limit && limit > 0) break;
            }

            if (filteredGroup.variants.length > 0)
                results.push(filteredGroup);
            if (count >= limit && limit > 0) break;
        }
        return results;
    }
}
