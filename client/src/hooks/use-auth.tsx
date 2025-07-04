// src/hooks/use-auth.ts

import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation, UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";


export interface Server {
  id: number;
  host: string;
  country: string;
  max_users: number;
  users_count: number;
  ui_panel_link: string;
}

export type CreateConfigResponse = {
  config_link: string;
  expiration_date: string;
};

export type GetConfigResponse = {
  config_link: string;
  expiration_date: string;
  created_at: string;
}[];

type CreateConfigArgs = {
  country: "Russia" | "Poland" | "USA" | "UK" | "Denmark";
  months: number;
};

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
  birth_date: string;
}

type UpdateProfileData = {
  id: number;
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
};

export type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;

  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
  updateProfileMutation: UseMutationResult<SelectUser, Error, UpdateProfileData>;
  createConfigMutation: UseMutationResult<CreateConfigResponse, Error, CreateConfigArgs>;

  serversQuery: UseQueryResult<Server[], Error>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [location, navigate] = useLocation();  // Правильная деструктуризация

  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "http://localhost:4000/api/profile");
        if (!res.ok) {
          if (res.status === 401) {
            return null; // если не авторизован
          }
          throw new Error("Ошибка при получении профиля");
        }
        return (await res.json()) as SelectUser;
      } catch (err) {
        if (err instanceof Error) {
          console.error("Ошибка при запросе профиля:", err.message);
        }
        throw err;
      }
    },
  });

const serversQuery: UseQueryResult<Server[], Error> = useQuery<Server[], Error>({
  queryKey: ["/api/servers"],
  queryFn: async () => {
    // 1) ждём, пока user перестанет быть undefined
    if (user === undefined) {
      throw new Error("Ожидаем профиль"); // React Query будет автоматически ждать
    }
    // 2) если user === null → не залогинен
    if (!user) {
      throw new Error("Неавторизован");
    }
    // 3) если не админ → сразу возвращаем пустой массив
    if (user.role !== "admin") {
      return [];
    }
    // 4) проверяем, что токен точно есть (apiRequest внутри тоже проверит, но на всякий случай)
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("Необходим токен для авторизации");
    }
    // 5) делаем запрос через apiRequest
    //    apiRequest сам добавит Authorization: Bearer <token> и проверит res.ok
    const res = await apiRequest<null>("GET", "http://localhost:4000/api/servers");
    // 6) парсим JSON и возвращаем
    const payload = (await res.json()) as Server[];
    return payload;
  },
  enabled: user !== undefined,    // дёргаем только после того, как user прочтётся
  staleTime: 1000 * 60 * 2,       // кешируем 2 минуты
  retry: 1,
});


  const loginMutation = useMutation<SelectUser, Error, LoginData>({
    mutationFn: async ({ username, password }) => {
      // Выводим, что отправляем
      console.log("Login payload:", { username, password });
  
      // Передаём только данные, apiRequest сам добавит Content-Type и credentials
      const res = await apiRequest(
        "POST",
        "http://localhost:4000/api/login",
        { username, password }
      );
  
      // Раз JSON уже проверен на ok, просто парсим
      const data = await res.json();
  
      // Сохраняем JWT
      localStorage.setItem("access_token", data.access.jwt_token);
      // localStorage.setItem("access_token", data.access_token);
      return data.user as SelectUser;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Вход выполнен успешно",
        description: `Добро пожаловать, ${user.username}!`,
        variant: "default",
      });
      window.location.href = "/profile";
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const registerMutation = useMutation<SelectUser, Error, RegisterData>({
    mutationFn: async ({ username, email, password, full_name, birth_date }) => {
      // Проверка обязательных полей
      if (!username || !email || !password || !birth_date || !full_name) {
        throw new Error("Все поля обязательны для заполнения");
      }
  
      // Форматирование даты (YYYY-MM-DD → DD.MM.YYYY)
      if (birth_date.includes('-')) {
        const [year, month, day] = birth_date.split('-');
        birth_date = `${day}.${month}.${year}`;
      }
  
      console.log("Отправляемые данные:", { username, email, password, full_name, birth_date });
  
      // Правильный вызов apiRequest
      const res = await apiRequest(
        "POST",
        "http://localhost:4000/api/register",
        { username, email, password, full_name, birth_date }
      );
  
      // Теперь res.ok уже гарантирован, получаем JSON
      const data = await res.json();
  
      // Сохраняем токен и возвращаем пользователя
      // localStorage.setItem("access_token", data.jwt_token);
      localStorage.setItem("access_token", data.access.jwt_token);
      // localStorage.setItem("access_token", data.access_token);
      return data.user as SelectUser;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Регистрация выполнена",
        description: "Аккаунт успешно создан!",
        variant: "default",
      });
      window.location.href = "/profile";
    },
    onError: (error) => {
      toast({
        title: "Ошибка регистрации",
        description: error.message || "Ошибка на сервере",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "http://localhost:4000/api/logout");
  
      if (!response.ok) {
        throw new Error("Не удалось выйти");
      }
  
      // Очистка токена и кэша
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
      queryClient.setQueryData(["/api/user"], null);
  
      document.cookie = "token=; Max-Age=0";  // Очистка куки
    },
    onSuccess: () => {
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из аккаунта",
        variant: "default",
      });
  
      // Редирект на страницу входа
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка выхода",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  
  const updateProfileMutation = useMutation< SelectUser, Error, UpdateProfileData, { previousUser?: SelectUser }>({
    mutationFn: async ({ id, currentPassword, newPassword, ...rest }) => {
      if (currentPassword && newPassword) {
        const res = await apiRequest(
          "POST",
          "http://localhost:4000/api/change-password",
          { old_password: currentPassword, new_password: newPassword }
        );
        return res.json();
      }

      const res = await apiRequest(
        "PUT",
        `http://localhost:4000/api/users/${id}`,
        rest
      );
      return res.json();
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["/api/user"] });
      const previousUser = queryClient.getQueryData<SelectUser>(["/api/user"]);
      return { previousUser };
    },

    onSuccess: (user, variables, context) => {
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      const previousUser = context?.previousUser;
      const changes: string[] = [];

      if (previousUser) {
        if (
          variables.username &&
          variables.username !== previousUser.username
        ) {
          changes.push("имя пользователя");
        }
        if (
          variables.email &&
          variables.email !== previousUser.email
        ) {
          changes.push("email");
        }
        if (variables.currentPassword && variables.newPassword) {
          changes.push("пароль");
        }
      }

      if (changes.length > 0) {
        toast({
          title: "Изменения применены",
          description: `Изменено: ${changes.join(", ")}`,
          variant: "default",
        });
      }
    },

    onError: (error, _vars, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["/api/user"], context.previousUser);
      }
      toast({
        title: "Ошибка обновления",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
    const createConfigMutation = useMutation<CreateConfigResponse, Error, CreateConfigArgs>({
      // теперь fn принимает переменные
      mutationFn: async ({ country, months }) => {
        if (!user) throw new Error("Пользователь не найден");
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Необходим токен для авторизации");
        
        const res = await apiRequest(
          "POST",
          `http://localhost:4000/api/users/configurations/${user.id}`,
          {
            country,
            months,
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Ошибка генерации конфигурации");
        return data as CreateConfigResponse;
      },
      onSuccess: (data) => {
        toast({
          title: "Конфигурация создана",
          description: `Срок действия: ${new Date(data.expiration_date).toLocaleString()}`,
          variant: "default",
        });
        queryClient.invalidateQueries({ queryKey: ["configurations", user!.id] });
        window.location.href = "/profile?tab=proxies";
      },
      onError: (error) => {
        toast({
          title: "Ошибка генерации",
          description: error.message,
          variant: "destructive",
        });
      },
    });
    

  
  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateProfileMutation,
        createConfigMutation,
        serversQuery
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}