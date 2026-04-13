/**
 * components/needs-analysis/context.ts
 * --
 * @author VJP
 * @written 14-Feb-2026
 */

import {createContext} from '@lit/context'
import {Product, ProductResultSet} from "../../api-models/products.ts";
import {action, computed, makeObservable, observable} from "mobx";
import {Fund, FundManager} from "../../api-models/funds.ts";
import {ServiceManager} from "../../api-models/services.ts";


export const context = createContext<NeedsAnalysisContext>('phi-na');


export type ProductPair = {
    hospital: Product | null;
    generalHealth: Product | null;
    premium: number;
    fund: Fund | null;
    brand: string | null;
}


/**
 * Simple class to hold properties (observables) for the needs analysis component.  This forms the base class for
 * the {@link NeedsAnalysisContext} class, which is used to provide the context for the needs analysis component.
 */
export class NeedsAnalysisObservables {

    product1: Product | null = null;
    product2: Product | null = null;
    state: string = "";
    coverType: string = "";
    familyType: string = "";
    services: string = "";
    funds: string = [...FundManager.funds.values()].filter(fund => fund.type==="Open").map(fund => fund.code).join(";");
    productRS: ProductResultSet | null = null;

    /* dependant details */

    children: boolean = true;
    students: boolean = false;
    youngAdults: boolean = false;
    disabilityDependants: boolean = false;
    maxStudentAge: number = 0;
    maxYoungAdultAge: number = 0;

    constructor() {
        const annotations: Record<string, any> = {};
        Object.keys(this).forEach(key => annotations[key] = observable);
        makeObservable(this, annotations);
    }
}

/**
 * Context class for the needs analysis component.
 */
export class NeedsAnalysisContext extends NeedsAnalysisObservables{

    constructor() {
        super();
        makeObservable(this, {
            change: action,
            hasDependants: computed,
            needsHospitalServices: computed,
            needsGeneralHealthServices: computed,
            filteredProducts: computed,
        });
    }

    /**
     * Change the observables in this context.
     * @param values - The values to change.
     */
    change(values: Partial<NeedsAnalysisObservables>) {
        Object.assign(this, values);
    }

    /**
     * Returns true if the cover type, state and family type are defined.
     */
    get isCoverDefined() {
        return (this.coverType !== "" && this.state !== "" && this.familyType !== "");
    }

    /**
     * Returns true if the family type includes dependants (Family, single parent and dependants only).
     */
    get hasDependants() {
        return ["0D", "1D", "2D"].includes(this.familyType);
    }

    /**
     * Returns true if the cover type is "Hospital" or "Combined" indicating that hospital services need to be gathered.
     */
    get needsHospitalServices() {
        return this.coverType === "Hospital" || this.coverType === "Combined"
    }

    /**
     * Returns true if the cover type is "GeneralHealth" or "Combined" indicating that general health services need to be gathered.
     */
    get needsGeneralHealthServices() {
        return this.coverType === "GeneralHealth" || this.coverType === "Combined"
    }

    /**
     * Returns the list of products that match the context filter criteria.
     * @returns Matching product records.
     */
    get filteredProducts() {
        if (this.productRS === null)
            return [];

        const results: Product[] = [];
        const hospitalServices = ServiceManager.getAll("H").filter(s => this.services.includes(s.key)).map(s => s.key);
        const generalServices = ServiceManager.getAll("G").filter(s => this.services.includes(s.key)).map(s => s.key);

        outerLoop: for (const product of this.productRS!.rows) {
            // filter for cover type (Hospital, GeneralHealth, Combined)
            if (product.type !== this.coverType && this.coverType !== "Combined")
                continue;
            // exclude corporate products
            if (product.isCorporate)
                continue;
            // exclude ambulance only
            if (product.type === "GeneralHealth" && product.services ==='')
                continue;
            // filter for dependants
            if (["0D", "1D", "2D"].includes(this.familyType)) {
                if (this.children && !product.childCover)
                    continue;
                if (this.students && ((!product.studentCover) || this.maxStudentAge > product.maxStudentAge))
                    continue;
                if (this.youngAdults && ((!product.youngAdultCover) || this.maxYoungAdultAge > product.maxYoungAdultAge))
                    continue;
                if (this.disabilityDependants && !product.disabilityCover)
                    continue
            }
            // filter for funds
            if (!this.funds.includes(product.fundCode))
                continue;
            // filter for hospital services
            if (this.needsHospitalServices)
                if (product.type === "Hospital" || product.type === "Combined")
                    for (const service of hospitalServices)
                        if (!product.services.includes(service))
                            continue outerLoop;
            // filter for general health services
            if (this.needsGeneralHealthServices)
                if (product.type === "GeneralHealth" || product.type === "Combined")
                    for (const service of generalServices)
                        if (!product.services.includes(service))
                            continue outerLoop;
            // we have a match!
            results.push(product);
        }
        return results;
    }

    /**
     * Returns valid product pairs (hospital and general health) for the current context.  If the cover type is "Hospital" or "General Health",
     * one of the pair values will be null.  For "Combined" cover types, all possible combinations of hospital and general health products
     * are added to the list of packaged products.
     * @returns Matching product pairs.
     */
    get comparisonResults() {
        const products = this.filteredProducts;
        const pairs: ProductPair[] = [];
        const combinedProducts = products.filter(p => p.type === "Combined");
        const hospitalProducts = products.filter(p => p.type === "Hospital");
        const generalHealthProducts = products.filter(p => p.type === "GeneralHealth");

        if (this.coverType === "Hospital")
            hospitalProducts.filter(p => p.onlyAvailableWith === "NotApplicable").forEach(p => pairs.push({
                hospital: p,
                generalHealth: null,
                premium: p.premium,
                fund: p.fund,
                brand: p.brandCodes,
            }));

        if (this.coverType === "GeneralHealth")
            generalHealthProducts.filter(p => p.onlyAvailableWith === "NotApplicable").forEach(p => pairs.push({
                hospital: null,
                generalHealth: p,
                premium: p.premium,
                fund: p.fund,
                brand: p.brandCodes,
            }));

        if (this.coverType === "Combined") {
            combinedProducts.forEach(p => pairs.push({
                hospital: p,
                generalHealth: p,
                premium: p.premium,
                fund: p.fund,
                brand: p.brandCodes,
            }));
            // make possible combinations of hospital/general health products...
            const fundCodes = new Set(hospitalProducts.map(p => p.fundCode));
            for (const fundCode of fundCodes) {
                const hospitalProductsForFund = hospitalProducts.filter(p => p.fundCode === fundCode);
                const generalHealthProductsForFund = generalHealthProducts.filter(p => p.fundCode === fundCode);
                for (const hospitalProduct of hospitalProductsForFund)
                    for (const generalHealthProduct of generalHealthProductsForFund)
                        if (hospitalProduct.canPackageWith(generalHealthProduct) && generalHealthProduct.canPackageWith(hospitalProduct))
                            pairs.push({
                                hospital: hospitalProduct,
                                generalHealth: generalHealthProduct,
                                premium: hospitalProduct.premium + generalHealthProduct.premium,
                                fund: hospitalProduct.fund,
                                brand: hospitalProduct.brandCodes,
                            });
            }
        }
        return pairs
    }
}