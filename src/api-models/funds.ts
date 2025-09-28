// noinspection CssInvalidHtmlTagReference,JSUnusedGlobalSymbols

const FUND_API = 'https://phi-demo-api.spartlet.net/funds?tags=Fund'

export type FundType = "Open" | "Restricted"
export type FundWebSiteLinkTitleType = "NoGapDoctors" | "AgreementHospitals" | "PreferredProviders" | "Branches" | "Ambulance";
export type FundDependantLimitTitleType = "Child" | "Student" | "NonClassified" | "NonStudent" | "ConditionalNonStudent" | "Disability";

type FundAPIResultRowType = {
    code: string;
    name: string;
    type: FundType;
    Fund: string;
}

export type FundCommunicationType = {
    phone: string;
    email: string;
    website: string;
}

export type FundAddressType = {
    lines: string[],
    town: string,
    state: string,
    postcode: string,
}

export type FundRestrictionsType = {
    hint: string;
    paragraph: string;
    details: string;
}

export type FundBrandType = {
    code: string;
    name: string;
    communication: FundCommunicationType;
    websiteLinks: FundWebSiteLinkType[];
}


export type FundWebSiteLinkType = {
    title: FundWebSiteLinkTitleType,
    link: string
}


export type FundDependantLimitType = {
    title: FundDependantLimitTitleType,
    supported: boolean,
    minAge: number,
    maxAge: number
}

export type FundDependantLimitsType = {
    nonClassifiedDependantDescription: string;
    dependantLimits: Map<FundDependantLimitTitleType, FundDependantLimitType>;
}

/**
 * Fund/brand data object.
 */
export class Fund {
    private document : Document;
    private data: FundAPIResultRowType;

    constructor(data: FundAPIResultRowType) {
        const parser = new DOMParser();
        this.data = data;
        this.document = parser.parseFromString(data.Fund, "text/xml");
    }

    get code() {
        return this.data.code;
    }

    get name() {
        return this.data.name;
    }

    get type() {
        return this.data.type;
    }

    get description() {
        return this.document.querySelector('Fund > FundDescription')?.textContent;
    }

    get communications() : FundCommunicationType {
        return {
            phone: this.document.querySelector("Fund > Phone")?.textContent || "",
            email: this.document.querySelector("Fund > Email")?.textContent || "",
            website: this.document.querySelector("Fund > Website")?.textContent || "",
        }
    }

    get websiteLinks() : FundWebSiteLinkType[] {
        const links: FundWebSiteLinkType[] = [];
        for (const linkElem of this.document.querySelectorAll("Fund > WebsiteLinks > Link")) {
            links.push( {
                title: (linkElem.getAttribute("Title") || "") as FundWebSiteLinkTitleType,
                link: linkElem.textContent || ""
            })
        }
        return links;
    }

    get brands() : FundBrandType[] {
        let list: FundBrandType[] = [];
        for (const elem of this.document.querySelectorAll("Fund > RelatedBrandNames > FundBrandType")) {
            const b: FundBrandType = {
                code: elem.querySelector("BrandCode")?.textContent || "",
                name: elem.querySelector("BrandName")?.textContent || "",
                communication: {
                    phone: elem.querySelector("BrandPhone")?.textContent || "",
                    email: elem.querySelector("BrandEmail")?.textContent || "",
                    website: elem.querySelector("BrandWebsite")?.textContent || ""
                },
                websiteLinks: []
            }
            for (const linkElem of elem.querySelectorAll("BrandWebsiteLinks > Link")) {
                b.websiteLinks.push( {
                    title: (linkElem.getAttribute("Title") || "") as FundWebSiteLinkTitleType,
                    link: linkElem.textContent || ""
                })
            }
            list.push(b);
        }
        return list;
    }

    get address() : FundAddressType {
        const lines : string[] = [];
        for (let j = 1; j < 4; j++) {
            const tag = "Fund > Address > AddressLine" + j;
            if (this.document.querySelector(tag))
                lines.push(this.document.querySelector(tag)!.textContent || "");
        }
        return {
            lines: lines,
            town: this.document.querySelector("Fund > Address > Town")?.textContent || "",
            state: this.document.querySelector("Fund > Address > State")?.textContent || "",
            postcode: this.document.querySelector("Fund > Address > Postcode")?.textContent || ""
        }
    }

    get restrictions() : FundRestrictionsType {
        return {
            hint: this.document.querySelector("Fund > Restrictions > RestrictionHint")?.textContent || "",
            paragraph: this.document.querySelector("Fund > Restrictions > RestrictionParagraph")?.textContent || "",
            details: this.document.querySelector("Fund > Restrictions > RestrictionDetails")?.textContent || "",
        }
    }

    get dependantLimits() : FundDependantLimitsType {
        const map = new Map<FundDependantLimitTitleType,FundDependantLimitType>();
        for (const elem of this.document.querySelectorAll("Fund > FundDependants > FundDependantLimitType > DependantLimit")) {
            const title = elem.getAttribute("Title")! as FundDependantLimitTitleType;
            map.set(title, {
                title: title,
                maxAge: + (elem.getAttribute("MaxAge") || 0),
                minAge: + (elem.getAttribute("minAge") || 0),
                supported: elem.getAttribute("Supported") === "true",
            })
        }
        return {
            dependantLimits: map,
            nonClassifiedDependantDescription:
                this.document.querySelector("Fund > FundDependants > NonClassifiedDependantDescription")?.textContent || "",
        };
    }
}

/**
 * A `Map` structure holding all the fund records using the fund code (Eg. MBP) as the map key.
 */
const fundMap = new Map<string, Fund>();


/**
 * Read the fund map to determine the age cutoffs used for dependants.
 * @param dependantTitle
 * @returns Sorted array of ages.
 */
function dependantAgeTiers(dependantTitle: FundDependantLimitTitleType) : number[] {
    let tiers: number[] = [0];
    for (const fund of fundMap.values()) {
        const depLimit = fund.dependantLimits.dependantLimits.get(dependantTitle);
        if (depLimit?.supported)
            tiers.push(depLimit.maxAge);
    }
    tiers = Array.from(new Set(tiers)).sort((a, b) => b - a);
    return tiers;
}

/**
 * Read the fund map to determine the age cutoff for young adults: `NonClassified`, `NonStudent`, `ConditionalNonStudent`.
 * @returns Sorted array of ages
 */
function youngAdultAgeTiers() : number[] {
    return Array.from(new Set([
        ...dependantAgeTiers("NonClassified"),
        ...dependantAgeTiers("NonStudent"),
        ...dependantAgeTiers("ConditionalNonStudent")
    ])).sort((a, b) => b - a);
}

/**
 * Downloads the fund data from the API and loads the {@link fundMap} variable.
 */
async function downloadFundData() {
    const response = await fetch(FUND_API);
    if (!response.ok) {
        alert(`Error fetching fund data from server ${response.status}: ${response.statusText}`);
        return;
    }
    const funds = await response.json();
    funds.sort((a:FundAPIResultRowType, b:FundAPIResultRowType) => a.name.localeCompare(b.name));
    for (const f_raw of funds) {
        const f = new Fund(f_raw);
        fundMap.set(f.code, f);
    }
}


/**
 * Object encapsulating PHIO fund and brand data.
 */
export const FundManager = {

    /**
     * Return a fund record from the fund map.
     * @param fundCode The fund code.  Eg. `BUP`
     * @returns Fund
     */
    get: (fundCode: string) => { return fundMap.get(fundCode); },

    /**
     * The fund map.
     */
    funds: fundMap,

    /**
     * Download the fund data from the API.  This function should be called at startup before any other fund actions.
     */
    download: downloadFundData,

    /**
     * Returns a number array of age tiers for the young adult dependant category: `NonClassified`, `NonStudent`, `ConditionalNonStudent`
     */
    youngAdultAgeTiers: youngAdultAgeTiers(),

    /**
     * Returns a number array of age ties for the `Student` category.
     */
    studentAgeTiers: dependantAgeTiers("Student"),
}