interface Env {
    MCP_OBJECT: DurableObjectNamespace;
    __STATIC_CONTENT?: {
        fetch: (request: Request) => Promise<Response>;
    };
}
