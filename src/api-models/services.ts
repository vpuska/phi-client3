
const SERVICES_API = "https://phi-demo-api.spartlet.net/product-services"

export type HospitalTierType = "None" | "Basic" | "Bronze" | "Silver" | "Gold";
export type ServiceType = "G" | "H" | "";

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

export class ServiceCollection {
    private serviceKeys: string[] = [];

    constructor(serviceKeys: string) {
        this.serviceKeys = serviceKeys.split(";").filter(key => key.trim() !== "");
    }

    get length() {
        return this.serviceKeys.length;
    }

    get keys() {
        return this.serviceKeys;
    }

    get services() {
        return this.serviceKeys
            .map(key => ServiceManager.get(key))
            .filter(service => service !== undefined);
    }

    get covered() {
        return this.serviceKeys
            .filter(key => key.length===3)
            .map(key => ServiceManager.get(key)).
            filter(service => service !== undefined);
    }

    get restricted() {
        return this.serviceKeys.filter(key => key.length===4)
            .map(key => ServiceManager.get(key))
            .filter(service => service !== undefined);
    }

    has(service: string | Service) {
        const target = (typeof service === "string" ? service : service.key).substring(0, 3);
        return this.serviceKeys.some(key => key.substring(0, 3) === target);
    }

    *[Symbol.iterator]() : ArrayIterator<string> {
        for (const item of this.serviceKeys) {
            yield item;
        }
    }
}

export class ServiceManager {

    static services = new Map<string,Service>;

    static basicServices: Service[] = [];
    static bronzeServices: Service[] = [];
    static silverServices: Service[] = [];
    static goldServices: Service[] = [];
    static generalServices: Service[] = [];

    static async fetchServices() {
        const response = await fetch(SERVICES_API);
        if (response.ok) {
            const servicesJSON: Object[] = await response.json();
            for (const row of servicesJSON) {
                const service = new Service();
                Object.assign(service, row);
                this.services.set(service.key, service);
            }
            ServiceManager.basicServices = ServiceManager.getAll("H", "Basic");
            ServiceManager.bronzeServices = ServiceManager.getAll("H", "Bronze");
            ServiceManager.silverServices = ServiceManager.getAll("H", "Silver");
            ServiceManager.goldServices = ServiceManager.getAll("H", "Gold");
            ServiceManager.generalServices = ServiceManager.getAll("G", "None");
        }
    }

    static get(key: string) {
        return this.services.get(key.substring(0,3));
    }

    static getAll(serviceType: ServiceType, hospitalTier?: HospitalTierType) : Service[] {
        let subset = [...this.services.values()].filter((service) => service.serviceType === serviceType);
        if (hospitalTier)
            subset = subset.filter( (service) => service.hospitalTier === hospitalTier);
        return subset.sort((a,b) => a.description.localeCompare(b.key));
    }
}

// ServiceManager.fetchServices().then()

await ServiceManager.fetchServices();
const col = new ServiceCollection("BLO-;BCC;CDD")

for (const i of col) {
    console.log(i)
}
console.log(col.services);
console.log(col.covered);
console.log(col.restricted);
