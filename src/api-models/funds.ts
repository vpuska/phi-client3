// noinspection CssInvalidHtmlTagReference,JSUnusedGlobalSymbols

const FUND_XML_API = 'https://phi-demo-api.spartlet.net/fund-xml'

export type FundType = "Open" | "Restricted"
export type FundWebSiteLinkTitleType = "NoGapDoctors" | "AgreementHospitals" | "PreferredProviders" | "Branches" | "Ambulance";
export type FundDependantLimitTitleType = "Child" | "Student" | "NonClassified" | "NonStudent" | "ConditionalNonStudent" | "Disability";

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
    logo: string;
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
    private element : Element;
    public logo: string = "";
    private brandLogos= new Map<string,string>;

    constructor(element: Element) {
        this.element = element;
    }

    get xml() {
        return this.element.outerHTML;
    }

    get code() {
        return this.element.querySelector('FundCode')?.textContent as string;
    }

    get name() {
        return this.element.querySelector('FundName')?.textContent as string;
    }

    get type() : FundType {
        return this.element.querySelector('FundType')?.textContent as FundType;
    }

    get description() {
        return this.element.querySelector('FundDescription')?.textContent as string;
    }

    get communications() : FundCommunicationType {
        return {
            phone: this.element.querySelector("Phone")?.textContent || "",
            email: this.element.querySelector("Email")?.textContent || "",
            website: this.element.querySelector("Website")?.textContent || "",
        }
    }

    get websiteLinks() : FundWebSiteLinkType[] {
        const links: FundWebSiteLinkType[] = [];
        for (const linkElem of this.element.querySelectorAll("WebsiteLinks > Link")) {
            links.push( {
                title: (linkElem.getAttribute("Title") || "") as FundWebSiteLinkTitleType,
                link: linkElem.textContent || ""
            })
        }
        return links;
    }

    get brands() : FundBrandType[] {
        let list: FundBrandType[] = [];
        for (const elem of this.element.querySelectorAll("RelatedBrandNames > Brand")) {
            const brandCode = elem.querySelector("BrandCode")?.textContent || "";
            const b: FundBrandType = {
                code: brandCode,
                name: elem.querySelector("BrandName")?.textContent || "",
                communication: {
                    phone: elem.querySelector("BrandPhone")?.textContent || "",
                    email: elem.querySelector("BrandEmail")?.textContent || "",
                    website: elem.querySelector("BrandWebsite")?.textContent || ""
                },
                websiteLinks: [],
                logo: this.brandLogos.get(brandCode) || this.logo,
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
            if (this.element.querySelector(tag))
                lines.push(this.element.querySelector(tag)!.textContent || "");
        }
        return {
            lines: lines,
            town: this.element.querySelector("Address > Town")?.textContent || "",
            state: this.element.querySelector("Address > State")?.textContent || "",
            postcode: this.element.querySelector("Address > Postcode")?.textContent || ""
        }
    }

    get restrictions() : FundRestrictionsType {
        return {
            hint: this.element.querySelector("Restrictions > RestrictionHint")?.textContent || "",
            paragraph: this.element.querySelector("Restrictions > RestrictionParagraph")?.textContent || "",
            details: this.element.querySelector("Restrictions > RestrictionDetails")?.textContent || "",
        }
    }

    get dependantLimits() : FundDependantLimitsType {
        const map = new Map<FundDependantLimitTitleType,FundDependantLimitType>();
        for (const elem of this.element.querySelectorAll("FundDependants > DependantLimits > DependantLimit")) {
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
                this.element.querySelector("FundDependants > NonClassifiedDependantDescription")?.textContent || "",
        };
    }

    private async determineLogoFileName(base : string) : Promise<string|null> {
        const extensions = ["svg", "png", "jpg", "webp"];

        for (const ext of extensions) {
            const url = `${base}.${ext}`;
            const p = new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = url;
            });
            if (await p)
                return url;
        }
        return null;
    }

    async findFundLogo(): Promise<void> {
        const logo = await this.determineLogoFileName(`/fund_logos/${this.code}`);
        if (logo !== null)
            this.logo = logo;

        for(const brand of this.brands) {
            const logo = await this.determineLogoFileName(`/fund_logos/${brand.code}`);
            if (logo !== null)
                this.brandLogos.set(brand.code, logo);
        }
    }
}

export class FundManager {

    // Map collection of fund records keyed by fundCode.
    public static readonly fundMap = new Map<string, Fund>();
    public static readonly funds = FundManager.fundMap;

    /**
     * Return a fundCode record from the fundCode map.
     * @param fundCode The fundCode code.  Eg. `BUP`
     * @returns Fund
     */
    static get (fundCode: string) {
        return FundManager.fundMap.get(fundCode)
    }

    /**
     * Read the fundCode map to determine the age cutoffs used for dependants.
     * @param dependantTitle
     * @returns Sorted array of ages.
     */
    static dependantAgeTiers(dependantTitle: FundDependantLimitTitleType) : number[] {
        let tiers: number[] = [0];
        for (const fund of FundManager.fundMap.values()) {
            const depLimit = fund.dependantLimits.dependantLimits.get(dependantTitle);
            if (depLimit?.supported)
                tiers.push(depLimit.maxAge);
        }
        tiers = Array.from(new Set(tiers)).sort((a, b) => b - a);
        return tiers;
    }

    /**
     * Read the fundCode map to determine the age cutoff for young adults: `NonClassified`, `NonStudent`, `ConditionalNonStudent`.
     * @returns Sorted array of ages
     */
    static youngAdultAgeTiers() : number[] {
        return Array.from(new Set([
            ...FundManager.dependantAgeTiers("NonClassified"),
            ...FundManager.dependantAgeTiers("NonStudent"),
            ...FundManager.dependantAgeTiers("ConditionalNonStudent")
        ])).sort((a, b) => b - a);
    }

    static fundList(fundType: FundType) {
        const funds: {
            code: string,
            name: string,
        }[] = [];
        [...FundManager.fundMap.values()].filter((fund: Fund) => fund.type === fundType).forEach((fund: Fund) => {
            funds.push({code: fund.code, name: fund.name});
            fund.brands.forEach((brand: FundBrandType) => {
                funds.push({code: brand.code, name: brand.name + " (" + fund.code + ")"});
            })
        })
        return funds;
    }

    /**
     * Download the fund XML
     */
    static async downloadFundXml() {
        const response = await fetch(FUND_XML_API);
        if (!response.ok) {
            alert(`Error fetching fund data from server ${response.status}: ${response.statusText}`);
            return;
        }
        const xmlDoc = (new DOMParser()).parseFromString(await response.text(), "text/xml");
        const fundElements = xmlDoc.querySelectorAll("Funds > Fund");
        const funds : Fund[] = [];
        for (const fundElement of fundElements) {
            const f = new Fund(fundElement);
            await f.findFundLogo();
            funds.push(f);
        }
        funds.sort((a, b) => a.code > b.code ? 1 : -1);
        funds.forEach((f: Fund) => {FundManager.fundMap.set(f.code, f)})
    }

}
