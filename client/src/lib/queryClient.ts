import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

interface RequestOptions {
  method?: string; 
  body?: string;
  headers?: Record<string, string>;
}

// New implementation to handle both string and object params
export async function apiRequest(
  urlOrOptions: string | RequestOptions,
  options?: RequestOptions,
): Promise<any> {
  let url: string;
  let fetchOptions: RequestInit = {
    credentials: "include",
  };

  // If first parameter is a string (URL)
  if (typeof urlOrOptions === 'string') {
    url = urlOrOptions;
    if (options) {
      fetchOptions = {
        ...fetchOptions,
        method: options.method || 'GET',
        headers: options.headers || (options.body ? { 'Content-Type': 'application/json' } : {}),
        body: options.body,
      };
    }
  } else {
    // If first parameter is an options object
    throw new Error('URL must be provided as the first parameter');
  }

  const res = await fetch(url, fetchOptions);

  // Check if response is OK
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  // Try to parse as JSON, but return text if it fails
  try {
    const data = await res.json();
    return data;
  } catch (e) {
    return { success: true };
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
