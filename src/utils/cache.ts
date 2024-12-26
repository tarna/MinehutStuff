export class CustomCache<T> {
    private cache: T;
    private lastUpdate: number;
    private updateInterval: number;
    private updateFunction: () => Promise<T>;

    constructor(updateFunction: () => Promise<T>, updateInterval: number) {
        this.updateFunction = updateFunction;
        this.updateInterval = updateInterval;
        this.cache = null;
        this.lastUpdate = 0;
    }

    async getCache() {
        if (Date.now() - this.lastUpdate > this.updateInterval) {
            this.cache = await this.updateFunction();
            this.lastUpdate = Date.now();
        }
        return this.cache;
    }
}