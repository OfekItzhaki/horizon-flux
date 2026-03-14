export declare class ApiClient {
    private urlResolver;
    private isRefreshing;
    private refreshPromise;
    constructor(urlResolver?: (path: string) => string);
    private request;
    private handleUnauthorized;
    private refreshToken;
    get<T>(path: string, options?: RequestInit): Promise<T>;
    post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T>;
    patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T>;
    delete<T>(path: string, options?: RequestInit): Promise<T>;
}
export declare const apiClient: ApiClient;
export declare const authClient: ApiClient;
