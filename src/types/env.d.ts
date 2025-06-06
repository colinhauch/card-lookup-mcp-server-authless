declare interface Env {
    MCP_OBJECT: DurableObjectNamespace;
    ASSETS: {
        fetch: (request: Request) => Promise<Response>;
    };
}
