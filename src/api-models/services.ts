/**
 * api-models/services.ts
 * --
 * @author VJP
 * @written 09-Apr-2026
 */

const SERVICES_API = "https://phi-demo-api.spartlet.net/product-services"

export type HospitalTierType = "None" | "Basic" | "Bronze" | "Silver" | "Gold";
export type ServiceType = "G" | "H" | "";

/**
 * Represents a hospital/general health service as retrieved from the API.
 */
export class Service {
    key: string = "";
    serviceType: ServiceType = "";
    serviceCode: string = "";
    hospitalTier: HospitalTierType = "None";
    description: string = "";

    get isBasicHospital() { return this.hospitalTier === "Basic" }
    get isBronzeHospital() { return this.hospitalTier === "Bronze" }
    get isSilverHospital() { return this.hospitalTier === "Silver" }
    get isGoldHospital() { return this.hospitalTier === "Gold" }
    get isGeneralHealth() { return this.serviceType === "G" }
    get isHospital() { return this.serviceType === "H" }
}

/**
 * Represents a collection of {@link Service} records.
 */
export class ServiceCollection {
    private readonly serviceKeys: string[] = [];

    /**
     * <p>Constructs a new ServiceCollection from the provided services.  The service keys are 3-character mnemonics defined by the API.  The key may
     * include a trailing hyphen to indicate a restricted service. Eg. `SPS-`.</p>
     * <p>Duplicate keys are removed, and the resulting collection is sorted alphabetically.  However, the restricted and unrestricted version of a key
     * are treated as distinct.</p>
     * - When `services` is a string, it is treated as a semicolon-separated list of service keys.
     * - when `services` is a string[], it is treated as an array of service keys.
     * - when `services` is an empty string, an empty collection is created.
     * @param services - A string, array of strings, or another ServiceCollection to initialize the collection.
     * @example
     *  new ServiceCollection("SPS;OPT;PHY-;POD;REM;CAT")
     *  new ServiceCollection(["SPS", "OPT", "PHY-", "CAT"])
     *  new ServiceCollection(myCollection)
     */
    constructor(services: string | string[] | ServiceCollection = "" ) {
        let keys: string[] = [];
        if (typeof services === "string")
            keys = services.split(";");
        else if (services instanceof ServiceCollection)
            keys = services.keys;
        else keys = services;
        this.serviceKeys = [...new Set(keys)].sort((a, b) => a.localeCompare(b)).filter(key => key !== "");
    }

    /**
     * The number of services in the collection.
     */
    get length() : number {
        return this.serviceKeys.length;
    }

    /**
     * The service keys in the collection.
     */
    get keys() : string[] {
        return this.serviceKeys;
    }

    /**
     * The tier of the services in the collection.
     * @returns `none`, `mixed`, `general` or the hospital tier in lower case.
     */
    get tier() : string {
        const services = this.services;
        if (services.length === 0)
            return "none";
        else if (services.every(service => service.serviceType === "G"))
            return "general";
        else if (services.every(service => service.hospitalTier === services[0].hospitalTier))
            return services[0].hospitalTier.toLowerCase();
        else
            return "mixed";
    }

    /**
     * The services in the collection.
     */
    get services() : Service[] {
        const collection = new ServiceCollection(this.keys.map(key => key.substring(0,3)));
        return collection.keys.map(key => ServiceManager.get(key)).filter(service => service !== undefined);
    }

    /**
     * The services in the collection that are not restricted.
     */
    get covered() : ServiceCollection {
        return new ServiceCollection(this.serviceKeys.filter(key => key.length===3));
    }

    /**
     * The services in the collection that are restricted.
     * @note The collection returned will not have its services flagged as restricted.
     */
    get restricted() : ServiceCollection {
        return new ServiceCollection(this.serviceKeys.filter(key => key.length===4).map(key => key.substring(0,3)));
    }

    /**
     * Returns true if the collection contains the specified service.
     * @param service - The service to check for.  May be a string or a Service object.
     */
    has(service: string | Service) : boolean {
        const target = (typeof service === "string" ? service : service.key);
        return this.serviceKeys.some(key => key === target);
    }

    /**
     * Creates a new `ServiceCollection` containing the union of this collection and the specified argument. The argument
     * can be provided in a similar format as the {@link ServiceCollection.constructor}.
     * @param arg A string, array of strings, or another ServiceCollection
     */
    union(arg: string | string[] | ServiceCollection) : ServiceCollection {
        return new ServiceCollection(this.keys.concat(new ServiceCollection(arg).keys));
    }

    /**
     * Creates a new `ServiceCollection` containing the intersection of this collection and the specified argument.
     * @param collection
     */
    intersect(collection: ServiceCollection) {
        return new ServiceCollection(this.keys.filter(key => collection.has(key)));
    }

    /**
     * Creates a new `ServiceCollection` by removing the services in the argument from this collection.
     * @param collection `ServiceCollection` containing services to be removed.
     */
    subtract(collection: ServiceCollection) {
        return new ServiceCollection(this.keys.filter(key => !collection.has(key)));
    }

    *[Symbol.iterator]() : ArrayIterator<string> {
        for (const item of this.serviceKeys) {
            yield item;
        }
    }
}

export class ServiceManager {

    static services = new Map<string,Service>;

    static basicServices: ServiceCollection;
    static bronzeServices: ServiceCollection;
    static silverServices: ServiceCollection;
    static goldServices: ServiceCollection;
    static generalServices: ServiceCollection;
    static allServices: ServiceCollection;
    /**
     * Fetches the list of services from the API and populates the {@link ServiceManager.services} map.
     */
    static async fetchServices() {
        const response = await fetch(SERVICES_API);
        if (response.ok) {
            const servicesJSON: Object[] = await response.json();
            for (const row of servicesJSON) {
                const service = new Service();
                Object.assign(service, row);
                this.services.set(service.key, service);
            }
            ServiceManager.basicServices = new ServiceCollection(ServiceManager.getAllKeys("H", "Basic"));
            ServiceManager.bronzeServices = new ServiceCollection(ServiceManager.getAllKeys("H", "Bronze"));
            ServiceManager.silverServices = new ServiceCollection(ServiceManager.getAllKeys("H", "Silver"));
            ServiceManager.goldServices = new ServiceCollection(ServiceManager.getAllKeys("H", "Gold"));
            ServiceManager.generalServices = new ServiceCollection(ServiceManager.getAllKeys("G", "None"));
            ServiceManager.allServices = new  ServiceCollection(ServiceManager.getAllKeys("H").concat(ServiceManager.getAllKeys("G")));
        }
    }

    /**
     * Returns the service with the specified key.
     * @param key - The key of the service to retrieve.  Only the 1st 3 characters are used.
     * @example
     *  ServiceManager.get("PHY") // returns the PHY service
     *  ServiceManager.get("PHY-") // also returns the PHY service
     */
    static get(key: string) {
        return this.services.get(key.substring(0,3));
    }

    /**
     * Returns a collection of all services of the specified type.
     * @param serviceType
     * @param hospitalTier
     */
    static getAll(serviceType: ServiceType, hospitalTier?: HospitalTierType) : Service[] {
        let subset = [...this.services.values()].filter((service) => service.serviceType === serviceType);
        if (hospitalTier)
            subset = subset.filter( (service) => service.hospitalTier === hospitalTier);
        return subset.sort((a,b) => a.description.localeCompare(b.key));
    }

    /**
     * Returns the service keys of the specified type.
     * @param serviceType
     * @param hospitalTier
     * @example
     *  ServiceManager.getAllKeys("H", "Basic") // returns all basic hospital ==> ["HPS", "PAL", "REH"]
     */
    static getAllKeys(serviceType: ServiceType, hospitalTier?: HospitalTierType) : string[] {
        return ServiceManager.getAll(serviceType, hospitalTier).map(service => service.key);
    }
}

