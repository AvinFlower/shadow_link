import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Функция для проверки успешности ответа
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Универсальный запрос для любого метода (GET, POST, PUT, DELETE и т. д.)
export async function apiRequest<T>(method: string, url: string, data?: T) {
  const token = localStorage.getItem("access_token");
  
  // Настройка запроса с авторизацией, если токен есть
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  await throwIfResNotOk(res);
  return res;
}

// Определяем поведение при получении ошибки 401
type UnauthorizedBehavior = "returnNull" | "throw";

// Функция запроса с использованием React Query
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;

    try {
      const res = await apiRequest("GET", url);
      return await res.json();
    } catch (error: any) {
      if (
        unauthorizedBehavior === "returnNull" &&
        error instanceof Error &&
        error.message.includes("401")
      ) {
        return null;
      }
      throw error;
    }
  };

// Настройки клиента React Query, с дефолтными значениями для запросов и мутаций
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),  // Если ошибка 401, то выбрасывается исключение
      refetchInterval: 60000, // Обновление данных каждую минуту
      refetchOnWindowFocus: false, // Не обновлять данные при возврате фокуса на окно
      staleTime: 300000, // Данные считаются актуальными в течение 5 минут
      retry: false, // Отключаем повторный запрос
    },
    mutations: {
      retry: false, // Также отключаем повтор для мутаций
    },
  },
});
