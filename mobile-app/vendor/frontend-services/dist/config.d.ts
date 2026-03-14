export declare const configure: (config: {
    baseURL?: string;
    authBaseURL?: string;
    turnstileSiteKey?: string;
}) => void;
export declare const getTurnstileSiteKey: () => string | null;
export declare const API_CONFIG: {
    baseURL: string;
    timeout: number;
};
export declare const AUTH_CONFIG: {
    baseURL: string;
    timeout: number;
};
export declare const getApiUrl: (path: string) => string;
export declare const getAuthUrl: (path: string) => string;
/**
 * Helper to get the root URL (without /api/v1) for static assets like uploads
 */
export declare const getAssetUrl: (path: string, includeCacheBuster?: boolean) => string;
