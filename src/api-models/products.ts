// noinspection JSUnusedGlobalSymbols

import {ProductGroup, ProductVariant} from "phi-common"
import type {SerializedProductGroup, AccommodationType, AusState, ProductType, ProductPairingType, HospitalTier} from "phi-common"

const PRODUCT_API = 'https://phi-demo-api.spartlet.net'

import {Fund, FundManager} from "./funds.ts";

/**
 * JSON structure returned by the phi-api product list/search endpoints.
 */
export type ProductJsonType = {
    code: string;
    fundCode: string;
    name: string;
    type: ProductType;
    state: AusState | "ALL",
    adultsCovered: 0 | 1 | 2,
    isCorporate: boolean,
    brands: string | null,
    onlyAvailableWith: ProductPairingType,
    onlyAvailableWithProducts: string | null,
    dependantCover: boolean,
    childCover: boolean,
    studentCover: boolean,
    youngAdultCover: boolean,
    nonClassifiedCover: boolean,
    nonStudentCover: boolean,
    conditionalNonStudentCover: boolean,
    disabilityCover: boolean,
    excess: number,
    excessPerAdmission: number,
    excessPerPerson: number,
    excessPerPolicy: number,
    premium: number,
    hospitalComponent: number,
    hospitalTier: HospitalTier,
    accommodationType: AccommodationType,
    services: string,
}

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


/**
 * Class encapsulating the product JSON for a single product ({@link ProductJsonType}).
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

    // TODO: Remove this method as it is not used
    // @ts-ignore
    static async find(fundCode: string, productCode: string) : Promise<Product | null> {
        /*
        const response = await fetch(`${PRODUCT_API}/products/find/${fundCode}/${productCode}`);
        if (response.ok) {
            const productJson: ProductJsonType = await response.json();
            return new Product(productJson);
        }

         */
        return null;
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
     * Factory method to call the nominated endpoint and return a {@link Product} result set.
     * @param productApiEndpoint
     */
    // TODO: Remove this method as it is not used.
    // @ts-ignore
    static async fetch(productApiEndpoint: string): Promise<ProductResultSet> {
        return new ProductResultSet([]);
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
 * Calls the `product-search/by-keyword` API endpoint to search for products by keyword.
 * @param keywords Keyword string. Eg `hospital gold nsw family`
 * @param combined Include products with combined cover. Default `true`.
 * @param hospital Include products with hospital cover. Default `true`.
 * @param extras Include products with extras cover. Default `true`.
 * @param count Maximum number of results to return. Default `50`.
 * @param timeout Maximum time to wait for response in milliseconds. Default `1500`.
 */
export async function productKeywordSearch(
    keywords: string,
    combined: boolean = true,
    hospital: boolean = true,
    extras: boolean = true,
    count: number = 50,
    timeout: number = 1500) : Promise<ProductKeywordSearchResult[]> {

    const params = `keywords=${encodeURIComponent(keywords)}&count=${count}&combined=${combined}&hospital=${hospital}&extras=${extras}&timeout=${timeout}`;
    const response = await fetch(`${PRODUCT_API}/product-search/by-keyword?${params}`);
    if (response.ok)
        return await response.json();
    else
        return [];
}


export class ProductManager {

    private static productGroups: ProductGroup[] = [];

    public static async loadDataSet() {
        this.productGroups = [];
        const response = await fetch(`${PRODUCT_API}/products/dataset`);
        if (response.ok) {
            const groups: SerializedProductGroup[] = await response.json();
            for (const group of groups)
                this.productGroups.push(new ProductGroup(group));
        }
    }

    public static getFundProductGroups(fundCode: string) {
        const groups: ProductGroup[] = [];
        for (const group of this.productGroups) {
            if (group.fundCode === fundCode)
                groups.push(group);
        }
        return groups;
    }

    public static getFundProducts(fundCode: string) {
        const products: Product[] = [];

        for (const group of this.productGroups) {
            if (group.fundCode === fundCode) {
                for (const variant of group)
                    products.push(new Product(group, variant));
            }
        }
        return new ProductResultSet(products);
    }

    public static getSegment(state: string, numAdults: number, dependants: boolean) {
        const products: Product[] = [];
        for (const group of this.productGroups) {
            for (const variant of group) {
                if (variant.state === state && variant.adultsCovered === numAdults && variant.dependantCover === dependants)
                    products.push(new Product(group, variant));
            }
        }
        return new ProductResultSet(products);
    }
}
