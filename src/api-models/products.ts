// noinspection JSUnusedGlobalSymbols

const PRODUCT_API = 'https://phi-demo-api.spartlet.net/products'

import {Fund, FundManager} from "./funds.ts";

export type BaseStateType = "NSW" | "VIC" | "QLD" | "TAS" | "SA" | "WA" | "NT"

/**
 * JSON structure returned by the phi-api product list/search endpoints.
 */
export type ProductJsonType = {
    code: string;
    fundCode: string;
    name: string;
    type: "Combined" | "Hospital" | "GeneralHealth",
    state: BaseStateType | "ALL",
    adultsCovered: 0 | 1 | 2,
    isCorporate: boolean,
    brands: string | null,
    onlyAvailableWith: string,
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
    hospitalTier: string,
    accommodationType: string,
    services: string,
}


export type ProductStatisticsType = {
    combinedCount: number;
    hospitalCount: number;
    generalCount: number;
}


/**
 * Class encapsulating the product JSON for a single product ({@link ProductJsonType}).
 */
export class Product {
    fund: Fund;
    maxYoungAdultAge: number = 0;
    maxStudentAge: number = 0;
    private readonly rawData: ProductJsonType;
    /**
     * @param rawData The Product JSON returned by the api.
     */
    constructor(rawData: ProductJsonType) {
        this.rawData= rawData;
        this.fund = FundManager.get(this.fundCode)!;
        this.maxYoungAdultAge = Math.max(
            this.nonStudentCover ? this.fund.dependantLimits.dependantLimits.get("NonStudent")!.maxAge : 0,
            this.nonClassifiedCover ? this.fund.dependantLimits.dependantLimits.get("NonClassified")!.maxAge : 0,
            this.conditionalNonStudentCover ? this.fund.dependantLimits.dependantLimits.get("ConditionalNonStudent")!.maxAge : 0,
        )
        this.maxStudentAge = this.studentCover ? this.fund.dependantLimits.dependantLimits.get("Student")!.maxAge : 0;
    }

    get code() { return this.rawData.code; }
    get fundCode() { return this.rawData.fundCode; }
    get name() { return this.rawData.name; }
    get type() { return this.rawData.type; }
    get state() { return this.rawData.state; }
    get isCorporate() { return this.rawData.isCorporate; }
    get brands() { return this.rawData.brands; }
    get onlyAvailableWith() { return this.rawData.onlyAvailableWith; }
    get onlyAvailableWithProducts() { return this.rawData.onlyAvailableWithProducts; }
    get adultsCovered() { return this.rawData.adultsCovered; }
    get dependantCover() { return this.rawData.dependantCover; }
    get childCover() { return this.rawData.childCover; }
    get studentCover() { return this.rawData.studentCover; }
    get youngAdultCover() { return this.rawData.youngAdultCover; }
    get nonClassifiedCover() { return this.rawData.nonClassifiedCover; }
    get nonStudentCover() { return this.rawData.nonStudentCover; }
    get conditionalNonStudentCover() { return this.rawData.conditionalNonStudentCover; }
    get disabilityCover() { return this.rawData.disabilityCover; }
    get excess() { return this.rawData.excess; }
    get excessPerAdmission() { return this.rawData.excessPerAdmission; }
    get excessPerPerson() { return this.rawData.excessPerPerson; }
    get excessPerPolicy() { return this.rawData.excessPerPerson; }
    get premium() { return this.rawData.premium; }
    get hospitalComponent() { return this.rawData.hospitalComponent; }
    get hospitalTier() { return this.rawData.hospitalTier; }
    get accommodationType() { return this.rawData.accommodationType; }
    get services() { return this.rawData.services; }

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
            types += "NonCls";
        if (this.conditionalNonStudentCover)
            types += "Cond ";
        if (this.disabilityCover)
            types += "Dis ";
        return types;
    }

    /**
     * Returns the product JSON field value.
     * @param fieldName
     */
    getField(fieldName: string): any {
        return (this.rawData as any)[fieldName];
    }
}

/**
 * The products returned from the product api endpoint.
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
    static async fetch(productApiEndpoint: string): Promise<ProductResultSet> {
        const response = await fetch(`${PRODUCT_API}/${productApiEndpoint}`);
        const resultSet = new Array<Product>;
        if (response.ok) {
            const productsJSON: ProductJsonType[] = await response.json();
            for (const product of productsJSON) {
                resultSet.push(new Product(product));
            }
        }
        return new ProductResultSet(resultSet);
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

    filter(field: string, value: any) {
        const results = new Array<Product>();
        for (const product of this.rows) {
            if (product.getField(field) === value)
                results.push(product);
        }
        return new ProductResultSet(results);
    }
}


async function fetchProducts(state: string, productType: string, coverType: string): Promise<Response> {
    const response = await fetch(`${PRODUCT_API}/${state}/${productType}/${coverType}`);
    const fetchedProducts = new Array<Product>;
    if (response.ok) {
        const products: ProductJsonType[] = await response.json();
        for (const product of products) {
            fetchedProducts.push(new Product(product));
        }
    }
    ProductManager.fetchedProducts = fetchedProducts;
    ProductManager.filteredProducts = fetchedProducts;
    return response;
}


function statistics() : ProductStatisticsType {
    const stats: ProductStatisticsType = {
        combinedCount: 0,
        hospitalCount: 0,
        generalCount: 0,
    }
    for (const product of ProductManager.filteredProducts) {
        stats.combinedCount += (product.type === "Combined") ? 1 : 0;
        stats.hospitalCount += (product.type === "Hospital") ? 1 : 0;
        stats.generalCount += (product.type === "GeneralHealth") ? 1 : 0;
    }
    return stats;
}


function filterDependantAges(studentAge: number, youngAdultAge: number) {
    if(studentAge ===0 && youngAdultAge ===0)
        return;
    const newList: Product[] = [];
    for (const product of ProductManager.filteredProducts) {
        if (product.maxStudentAge >= studentAge && product.maxYoungAdultAge >= youngAdultAge)
            newList.push(product);
    }
    ProductManager.filteredProducts = newList;
}


export const ProductManager = {
    fetchedProducts: new Array<Product>,
    filteredProducts: new Array<Product>,
    fetchProducts: fetchProducts,
    filterDependantAges: filterDependantAges,
    statistics: statistics,
}

