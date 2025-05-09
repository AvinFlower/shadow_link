import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';  // Импортируем useLocation

export type CreateConfigResponse = {
  config_link: string;
  expiration_date: string;
};

export type GetConfigResponse = {
  config_link: string;
  expiration_date: string;
  created_at: string;
}[];


// type LoginData = Pick<InsertUser, "username" | "password">;
// // Типы данных для логина и регистрации
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

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  updateProfileMutation: UseMutationResult<SelectUser, Error, UpdateProfileData>;
  createConfigMutation: UseMutationResult<CreateConfigResponse, Error, void>;
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
              // напрямую через apiRequest, чтобы сразу авторизационный заголовок повесить
              const res = await apiRequest("GET", "http://localhost:4000/api/profile");

              if (!res.ok) {
                  if (res.status === 401) {
                      return null;  // если ошибка 401, возвращаем null
                  }
                  throw new Error("Ошибка при получении профиля");
              }

              return (await res.json()) as SelectUser;
          } catch (err) {
              // Обрабатываем ошибку в queryFn
              if (err instanceof Error) {
                  console.error("Ошибка при запросе профиля:", err.message);
              }
              throw err;  // Прокидываем ошибку дальше, чтобы она была обработана в error
          }
      },
  });


  async function checkCurrentPassword(password: string): Promise<boolean> {
    const res = await apiRequest("POST", "/api/check-password", { password });
    const { isPasswordCorrect } = await res.json();
    return isPasswordCorrect;
  }

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
      localStorage.setItem("access_token", data.access_token);
      return data.user as SelectUser;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] }); // Инвалидация кэша пользователя
      toast({
        title: "Вход выполнен успешно",
        description: `Добро пожаловать, ${user.username}!`,
        variant: "default",
      });
      // Перенаправление на профиль
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
      localStorage.setItem("access_token", data.access_token);
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
  
  
  const updateProfileMutation = useMutation<SelectUser, Error, UpdateProfileData, { previousUser?: SelectUser; changes: string[] }>(
    {
      mutationFn: async ({ id, currentPassword, newPassword, ...rest }) => {
        // Если меняем пароль
        if (currentPassword && newPassword) {
          // Отправляем только необходимые поля
          const res = await apiRequest(
            "POST",
            "http://localhost:4000/api/change-password",
            { old_password: currentPassword, new_password: newPassword }
          );
          return res.json();
        }
    
        // Иначе обновляем профиль (username, email, full_name и т.п.)
        const res = await apiRequest(
          "PUT",
          `http://localhost:4000/api/users/${id}`,
          rest  // <-- здесь передаём только { username?, email?, full_name?, birth_date? }
        );
        return res.json();
      },
      onMutate: async (profileData) => {
        await queryClient.cancelQueries({ queryKey: ["/api/user"] });
        const previousUser = queryClient.getQueryData<SelectUser>(["/api/user"]);
        const changes: string[] = [];
        if (previousUser) {
          if (profileData.username && profileData.username !== previousUser.username) {
            changes.push("имя пользователя");
          }
          if (profileData.email && profileData.email !== previousUser.email) {
            changes.push("email");
          }
          if (profileData.currentPassword && profileData.newPassword) {
            changes.push("пароль");
          }
        }
        return { previousUser, changes };
      },
      onSuccess: (user, _vars, context) => {  
        // Обновляем кэш вручную
        queryClient.setQueryData(["/api/user"], user);
      
        // Дополнительно форсируем рефетч запроса (перезагрузка данных)
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
        if (context.changes.length) {
          toast({
            title: "Изменения применены",
            description: `Изменено: ${context.changes.join(", ")}`,
            variant: "default",
          });
        }
      },
      onError: (error, _vars, context) => {
        // можно вернуть старые данные, если нужно
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
  
    const createConfigMutation = useMutation<CreateConfigResponse>({
      mutationFn: async () => {
        if (!user) throw new Error("Пользователь не найден");
    
        // Получаем токен
        const token = localStorage.getItem("access_token");
        console.log("Токен из localStorage:", token); // Логируем токен
    
        if (!token) throw new Error("Необходим токен для авторизации");
    
        const res = await apiRequest(
          "POST",
          `http://localhost:4000/api/users/${user.id}/configurations`,
          {
            headers: {
              "Authorization": `Bearer ${token}`, // Добавляем токен в заголовок
            },
            credentials: "include",
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
    
        // 1) Сбрасываем кэш списка конфигураций
        queryClient.invalidateQueries({ queryKey: ["configurations", user!.id] });
        // 2) Переключаем вкладку профиля на «proxies»
        window.location.href = "/profile?tab=proxies";
      },
    
      onError: (error: Error) => {
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