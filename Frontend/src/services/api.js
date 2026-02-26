// Complete offline-first caching and sync queue implementation

class ApiService {
    constructor() {
        this.cache = new Map();
        this.syncQueue = [];
        this.isSyncing = false;
    }

    async fetchData(url) {
        // Check the cache first
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            const response = await fetch(url);
            const data = await response.json();
            this.cache.set(url, data);
            return data;
        } catch (error) {
            // Handle errors accordingly
            console.error('Fetch error:', error);
            // Optionally trigger sync if there's a network issue
            this.syncQueue.push(url);
            return null;
        }
    }

    async sync() {
        if (this.isSyncing) return;
        this.isSyncing = true;

        while (this.syncQueue.length) {
            const url = this.syncQueue.shift();
            try {
                const response = await fetch(url);
                const data = await response.json();
                this.cache.set(url, data);
            } catch (error) {
                console.error('Sync error:', error);
            }
        }

        this.isSyncing = false;
    }
}

const apiService = new ApiService();
export default apiService;