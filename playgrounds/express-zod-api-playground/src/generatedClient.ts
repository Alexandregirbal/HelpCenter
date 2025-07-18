type SomeOf<T> = T[keyof T];

/** get /v1/hello */
type GetV1HelloInput = {
    name?: string | undefined;
};

/** get /v1/hello */
type GetV1HelloPositiveVariant1 = {
    status: "success";
    data: {
        greetings: string;
    };
};

/** get /v1/hello */
interface GetV1HelloPositiveResponseVariants {
    200: GetV1HelloPositiveVariant1;
}

/** get /v1/hello */
type GetV1HelloNegativeVariant1 = {
    status: "error";
    error: {
        message: string;
    };
};

/** get /v1/hello */
interface GetV1HelloNegativeResponseVariants {
    400: GetV1HelloNegativeVariant1;
}

export type Path = "/v1/hello";

export type Method = "get" | "post" | "put" | "delete" | "patch";

export interface Input {
    "get /v1/hello": GetV1HelloInput;
}

export interface PositiveResponse {
    "get /v1/hello": SomeOf<GetV1HelloPositiveResponseVariants>;
}

export interface NegativeResponse {
    "get /v1/hello": SomeOf<GetV1HelloNegativeResponseVariants>;
}

export interface EncodedResponse {
    "get /v1/hello": GetV1HelloPositiveResponseVariants & GetV1HelloNegativeResponseVariants;
}

export interface Response {
    "get /v1/hello": PositiveResponse["get /v1/hello"] | NegativeResponse["get /v1/hello"];
}

export type Request = keyof Input;

export const endpointTags = { "get /v1/hello": [] };

const parseRequest = (request: string) => request.split(/ (.+)/, 2) as [
    Method,
    Path
];

const substitute = (path: string, params: Record<string, any>) => { const rest = { ...params }; for (const key in params) {
    path = path.replace(`:${key}`, () => { delete rest[key]; return params[key]; });
} return [path, rest] as const; };

export type Implementation<T = unknown> = (method: Method, path: string, params: Record<string, any>, ctx?: T) => Promise<any>;

const defaultImplementation: Implementation = async (method, path, params) => { const hasBody = !["get", "delete"].includes(method); const searchParams = hasBody ? "" : `?${new URLSearchParams(params)}`; const response = await fetch(new URL(`${path}${searchParams}`, "https://example.com"), { method: method.toUpperCase(), headers: hasBody ? { "Content-Type": "application/json" } : undefined, body: hasBody ? JSON.stringify(params) : undefined }); const contentType = response.headers.get("content-type"); if (!contentType)
    return; const isJSON = contentType.startsWith("application/json"); return response[isJSON ? "json" : "text"](); };

export class Client<T> {
    public constructor(protected readonly implementation: Implementation<T> = defaultImplementation) { }
    public provide<K extends Request>(request: K, params: Input[K], ctx?: T): Promise<Response[K]> { const [method, path] = parseRequest(request); return this.implementation(method, ...substitute(path, params), ctx); }
}

export class Subscription<K extends Extract<Request, `get ${string}`>, R extends Extract<PositiveResponse[K], { event: string; }>> {
    public source: EventSource;
    public constructor(request: K, params: Input[K]) { const [path, rest] = substitute(parseRequest(request)[1], params); const searchParams = `?${new URLSearchParams(rest)}`; this.source = new EventSource(new URL(`${path}${searchParams}`, "https://example.com")); }
    public on<E extends R["event"]>(event: E, handler: (data: Extract<R, { event: E; }>["data"]) => void | Promise<void>) { this.source.addEventListener(event, msg => handler(JSON.parse((msg as MessageEvent).data))); return this; }
}

// Usage example:
/*
const client = new Client();
client.provide("get /v1/user/retrieve", { id: "10" })
new Subscription("get /v1/events/stream", {}).on("time", time => { })*/ 