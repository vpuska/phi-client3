/**
 * components/needs-analysis/context.ts
 * --
 * @author VJP
 * @written 14-Feb-2026
 */

import {createContext} from '@lit/context'
import {Product} from "../../api-models/products.ts";
import {action, makeObservable, observable} from "mobx";
import type {TemplateResult} from "lit";


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

    tab20Label: TemplateResult | string = "Cover Type";

    constructor() {
        observeClass(this);
    }
}


export class NeedsAnalysisContext extends NeedsAnalysisObservables{

    constructor() {
        super();
        makeObservable(this, {
            change: action
        });
    }
    change(values: Partial<NeedsAnalysisObservables>) {
        Object.assign(this, values);
    }
}