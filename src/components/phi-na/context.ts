/**
 * components/needs-analysis/context.ts
 * --
 * @author VJP
 * @written 14-Feb-2026
 */

import {createContext} from '@lit/context'
import {Product, ProductResultSet} from "../../api-models/products.ts";
import {action, computed, makeObservable, observable} from "mobx";
import {FundManager} from "../../api-models/funds.ts";


export const context = createContext<NeedsAnalysisContext>('phi-na');


function observeClass(object: any) {
    const observables: Record<string,any> = {};
    for(const key of Object.getOwnPropertyNames(object))
        observables[key] = observable;
    makeObservable(object, observables);
}


export class NeedsAnalysisObservables {
    product1: Product | null = null;
    product2: Product | null = null;
    state: string = "";
    coverType: string = "";
    familyType: string = "";
    services: string = "";
    funds: string = [...FundManager.funds.values()].filter(fund => fund.type==="Open").map(fund => fund.code).join(";");
    restrictedFunds: string = "";
    productRS: ProductResultSet | null = null;

    /* dependent details */

    children: boolean = true;
    students: boolean = false;
    youngAdults: boolean = false;
    disabilityDependants: boolean = false;
    maxStudentAge: number = 0;
    maxYoungAdultAge: number = 0;

    constructor() {
        observeClass(this);
    }
}


export class NeedsAnalysisContext extends NeedsAnalysisObservables{

    constructor() {
        super();
        makeObservable(this, {
            change: action,
            hasDependants: computed,
            needsHospitalServices: computed,
            needsGeneralHealthServices: computed,
        });
    }

    get hasDependants() {
        return ["0D", "1D", "2D"].includes(this.familyType);
    }

    get needsHospitalServices() {
        return this.coverType === "Hospital" || this.coverType === "Combined"
    }

    get needsGeneralHealthServices() {
        return this.coverType === "GeneralHealth" || this.coverType === "Combined"
    }

    change(values: Partial<NeedsAnalysisObservables>) {
        Object.assign(this, values);
    }

}