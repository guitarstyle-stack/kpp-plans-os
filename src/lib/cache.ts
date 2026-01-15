// Simple in-memory cache with TTL (Time To Live)

interface CacheEntry<T> {
    data: T;
    expiry: number;
}

class MemoryCache {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private cache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL = 60000; // 1 minute in milliseconds

    set<T>(key: string, data: T, ttl?: number): void {
        const expiry = Date.now() + (ttl || this.defaultTTL);
        this.cache.set(key, { data, expiry });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    invalidate(key: string): void {
        this.cache.delete(key);
    }

    invalidatePattern(pattern: string): void {
        const keysToDelete: string[] = [];

        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
    }

    clear(): void {
        this.cache.clear();
    }

    // Clean expired entries periodically
    cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));
    }
}

// Global cache instance
export const cache = new MemoryCache();

// Automatic cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => cache.cleanup(), 5 * 60 * 1000);
}

// Cache key helpers
export const CacheKeys = {
    PROJECTS: 'projects',
    DEPARTMENTS: 'departments',
    CATEGORIES: 'categories',
    USERS: 'users',
    STRATEGIC_PLANS: 'strategic_plans',
    STRATEGIC_GOALS: 'strategic_goals',
    STRATEGIC_INDICATORS: 'strategic_indicators',
    SHEET_HEADERS: (sheetName: string) => `sheet_headers:${sheetName}`,
};
