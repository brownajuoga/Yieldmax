// Import IndexedDB utility
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('my-database', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('responses', { keyPath: 'url' });
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function cacheResponse(url, data) {
    const db = await openIndexedDB();
    const transaction = db.transaction(['responses'], 'readwrite');
    const store = transaction.objectStore('responses');
    store.put({ url, data });
}

async function getCachedResponse(url) {
    const db = await openIndexedDB();
    const transaction = db.transaction(['responses'], 'readonly');
    const store = transaction.objectStore('responses');
    return new Promise((resolve, reject) => {
        const request = store.get(url);
        request.onsuccess = () => resolve(request.result ? request.result.data : null);
        request.onerror = () => reject(request.error);
    });
}

async function fetchWithCache(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        await cacheResponse(url, data);
        return data;
    } catch (error) {
        // Fallback to cache
        const cachedData = await getCachedResponse(url);
        if (cachedData) {
            return cachedData;
        } else {
            throw error;
        }
    }
}

async function queueMutation(mutation) {
    // Push mutation to a queue (could be local storage, IndexedDB, etc.)
    // Execute queued mutations when back online
}

// Example usage:
// fetchWithCache('/api/data').then(data => console.log(data));

