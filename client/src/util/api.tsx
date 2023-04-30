import { ReactNode, createContext, useContext, useMemo } from "react";
import { SessionData } from "../types/auth";

const ApiContext = createContext<ApiAccess>(null as unknown as ApiAccess);

export type ApiResponse<T> =
    | {
          success: true;
          result: T;
      }
    | {
          success: false;
          code: number;
          detail: string | null;
      };

type URLParamsType = {
    [key: string]: string;
};

export class ApiAccess {
    private authToken: string | null;
    constructor() {
        this.authToken = localStorage.getItem("token");
        this.get<SessionData>("auth/session").then((result) => {
            if (result.success) {
                this.authToken = result.result.id;
                if (localStorage.getItem("token") !== this.authToken) {
                    localStorage.setItem("token", this.authToken);
                }
            }
        });

        this.request = this.request.bind(this);
        this.get = this.get.bind(this);
        this.post = this.post.bind(this);
        this.delete = this.delete.bind(this);
        this.put = this.put.bind(this);
        this.patch = this.patch.bind(this);
    }

    public async request<T>(
        method: "GET" | "POST" | "DELETE" | "PUT" | "PATCH",
        endpoint: string,
        options?: {
            urlParameters?: URLParamsType;
            body?: any;
        }
    ): Promise<ApiResponse<T>> {
        const result = await fetch(
            "/api/" +
                endpoint +
                (options && options.urlParameters
                    ? new URLSearchParams(options.urlParameters).toString()
                    : ""),
            {
                method,
                body:
                    options && options.body
                        ? JSON.stringify(options.body)
                        : undefined,
                headers: this.authToken
                    ? {
                          Authorization: this.authToken,
                      }
                    : undefined,
            }
        );
        if (result.status < 300 && result.status >= 200) {
            return {
                success: true,
                result: await result.json(),
            };
        } else {
            return {
                success: false,
                code: result.status,
                detail: await result.text(),
            };
        }
    }

    public async get<T>(
        endpoint: string,
        options?: { urlParameters: URLParamsType }
    ): Promise<ApiResponse<T>> {
        return await this.request<T>("GET", endpoint, options);
    }

    public async delete<T>(
        endpoint: string,
        options?: { urlParameters: URLParamsType }
    ): Promise<ApiResponse<T>> {
        return await this.request<T>("DELETE", endpoint, options);
    }

    public async post<T>(
        endpoint: string,
        options?: { urlParameters?: URLParamsType; body?: any }
    ): Promise<ApiResponse<T>> {
        return await this.request<T>("POST", endpoint, options);
    }

    public async put<T>(
        endpoint: string,
        options?: { urlParameters?: URLParamsType; body?: any }
    ): Promise<ApiResponse<T>> {
        return await this.request<T>("PUT", endpoint, options);
    }

    public async patch<T>(
        endpoint: string,
        options?: { urlParameters?: URLParamsType; body?: any }
    ): Promise<ApiResponse<T>> {
        return await this.request<T>("PATCH", endpoint, options);
    }
}

export function ApiProvider(props: { children?: ReactNode | ReactNode[] }) {
    const api = useMemo(() => new ApiAccess(), []);
    return (
        <ApiContext.Provider value={api}>{props.children}</ApiContext.Provider>
    );
}

export function useAPI(): ApiAccess {
    const api = useContext(ApiContext);
    return api;
}
