
const SERVICES_API = "https://phi-demo-api.spartlet.net/product-services"

export type HospitalTierType = "None" | "Basic" | "Bronze" | "Silver" | "Gold";
export type ServiceType = "G" | "H" | "";

export class Service {
    key: string = "";
    serviceType: ServiceType = "";
    serviceCode: string = "";
    hospitalTier: HospitalTierType = "None";
    description: string = "";
}


export class ServiceManager {

    static services = new Map<string,Service>;

    static async fetchServices() {
        const response = await fetch(SERVICES_API);
        if (response.ok) {
            const servicesJSON: Object[] = await response.json();
            for (const row of servicesJSON) {
                const service = new Service();
                Object.assign(service, row);
                this.services.set(service.key, service);
            }
        }
    }

    static get(key: string) {
        return this.services.get(key);
    }

    static getAll(serviceType: ServiceType, hospitalTier?: HospitalTierType) : Service[] {
        let subset = [...this.services.values()].filter((service) => service.serviceType === serviceType);
        if (hospitalTier)
            subset = subset.filter( (service) => service.hospitalTier === hospitalTier);
        return subset.sort((a,b) => a.description.localeCompare(b.key));
    }
}

// ServiceManager.fetchServices().then()
