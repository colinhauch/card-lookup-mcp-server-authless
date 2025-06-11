declare interface Env {
    MCP_OBJECT: DurableObjectNamespace;
    ASSETS: {
        fetch: (request: Request) => Promise<Response>;
    };
    WEAVIATE_URL: string;
    WEAVIATE_API_KEY: string;
}
