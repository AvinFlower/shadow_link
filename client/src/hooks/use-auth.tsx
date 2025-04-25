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

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  updateProfileMutation: UseMutationResult<SelectUser, Error, Partial<SelectUser>>;
  addCreditsMutation: UseMutationResult<SelectUser, Error, { amount: number }>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const [location, navigate] = useLocation();  // Правильная деструктуризация

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "http://localhost:4000/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Вход выполнен успешно",
        description: `Добро пожаловать, ${user.username}!`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка входа",
        description: error.message || "Неверное имя пользователя или пароль",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const birthDateParts = credentials.birth_date.split('-');
      const formattedDate = `${birthDateParts[2]}.${birthDateParts[1]}.${birthDateParts[0]}`;
  
      // Обновляем дату в credentials
      credentials.birth_date = formattedDate;
  
      const res = await apiRequest("POST", "http://localhost:4000/api/register", credentials);
      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(errorResponse.message || "Ошибка на сервере");
      }
  
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Регистрация выполнена",
        description: "Аккаунт успешно создан!",
        variant: "default",
      });
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
      await apiRequest("POST", "http://localhost:4000/api/logout", {
        credentials: 'include',
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из аккаунта",
        variant: "default",
      });
  
      setTimeout(() => {
        window.location.href = "/auth";  // Принудительный редирект
      }, 200);
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка выхода",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<SelectUser>) => {
      const res = await apiRequest("POST", "http://localhost:4000/api/profile", profileData);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Профиль обновлен",
        description: "Ваши данные успешно обновлены",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка обновления",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const addCreditsMutation = useMutation({
    mutationFn: async ({ amount }: {amount: number}) => {
      const res = await apiRequest("POST", "http://localhost:4000/api/proxy-credits", { amount });
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Кредиты добавлены",
        description: `Ваш баланс успешно пополнен`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка пополнения",
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
        addCreditsMutation
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