/*
 * api-models/search.ts
 * --------------------
 * Author: V.Puska
 * Date: 21-Aug-2026
 */

import type { AusState } from 'phi-common';

//const API = 'https://phi-demo-api.spartlet.net/product-search/dataset'

export type SearchResult = {
    fundBrandCode: string,
    brandShortName: string,
    productCode: string,
    productName: string,
    state: AusState | "ALL";
    adultsCovered: number;
    childCover: boolean;
    youngAdultCover: boolean;
    studentCover: boolean;
    disabilityCover: boolean;
    type: string,
    excess: number
}


export class SearchResultClass {
    public searchResult: SearchResult;

    constructor(searchResult: SearchResult){
        this.searchResult = searchResult;
    }

    get dependants(): boolean {
        return this.searchResult.childCover || this.searchResult.youngAdultCover || this.searchResult.studentCover || this.searchResult.disabilityCover;
    }

    get familyCoverDescription() : string {
        switch (this.searchResult.adultsCovered) {
            case 0: return "Dependants Only";
            case 1: return this.dependants ? "S/Parent" : "Single";
            case 2: return this.dependants ? "Family" : "Couple";
        }
        return "";
    }

    get dependantCoverDescription(): string {
        const s = (this.searchResult.childCover ? "Child, " : "") +
            (this.searchResult.youngAdultCover ? "Young Adult, " : "") +
            (this.searchResult.studentCover ? "Student, " : "") +
            (this.searchResult.disabilityCover ? "Disabled, " : "");
        return s.substring(0, s.length - 2);
    }

    get coverDescription(): string {
        return this.dependants ? `${this.familyCoverDescription} with ${this.dependantCoverDescription} dependants` : this.familyCoverDescription;
    }
}


export class ProductSearchManager {

    private static dataset = [];

    static async downloadDataset() {
        return this.dataset;
    }

    // @ts-ignore
    static search(combined: boolean, hospital: boolean, extras: boolean, keywords: string) {
        return [];
    }
}