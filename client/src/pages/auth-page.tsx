import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";


const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Имя пользователя должно содержать минимум 3 символа",
  }),
  password: z.string().min(6, {
    message: "Пароль должен содержать минимум 6 символов",
  }),
});

const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Имя пользователя должно содержать минимум 3 символа",
  }),
  password: z.string().min(6, {
    message: "Пароль должен содержать минимум 6 символов",
  }),
  email: z.string().email({
    message: "Пожалуйста, введите корректный email",
  }),
  full_name: z.string().min(2, {
    message: "Имя должно содержать минимум 2 символа",
  }),
  birth_date: z.string().min(1, {
    message: "Пожалуйста, укажите дату рождения",
  }),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [location, navigate] = useLocation();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      full_name: "",
      birth_date: "",
    },
  });

  useEffect(() => {
    // Перенаправление на страницу профиля, если пользователь уже авторизован
    if (!isLoading && user) {
      navigate("/profile");
    }
  }, [user, isLoading, navigate]);  

  function onLoginSubmit(data: LoginValues) {
    loginMutation.mutate(data);
  }

  function onRegisterSubmit(data: RegisterValues) {
    registerMutation.mutate(data);
  }

  return (
    <div className="container mx-auto pt-32 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Login/Register Form */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-black/40 backdrop-blur-md p-8 rounded-lg border border-green-500/20 shadow-lg shadow-green-500/10"
        >
          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2">Платформа Shadowlink</h2>
              <p className="text-gray-300">
                Войдите в систему или создайте новый аккаунт
              </p>
            </div>
            
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            {/* Login Form */}
            <TabsContent value="login">
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имя пользователя</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                            <Input
                              placeholder="username"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Пароль</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                            <Input
                              type="password"
                              placeholder="******"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Вход...
                      </>
                    ) : (
                      "Войти"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            {/* Register Form */}
            <TabsContent value="register">
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя пользователя</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="username"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Полное имя</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Иван Иванов"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Пароль</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="******"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="birth_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Дата рождения</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Регистрация...
                      </>
                    ) : (
                      "Зарегистрироваться"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </motion.div>
        
        {/* Hero section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center md:text-left space-y-6"
        >
          <div className="inline-block p-3 bg-green-500/20 rounded-full mb-4">
            <Shield className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Безопасность и приватность
          </h1>
          <p className="text-xl text-gray-300">
            Shadowlink предлагает высококачественные прокси-сервисы для обеспечения вашей приватности и безопасности в сети. Наши прокси-серверы расположены по всему миру и обеспечивают стабильное соединение.
          </p>
          <ul className="space-y-3 text-left text-gray-300">
            <li className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              Полная анонимность и скрытие IP-адреса
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              Высокоскоростное соединение без ограничений
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              Выделенные и ротационные IP-адреса
            </li>
            <li className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              24/7 техническая поддержка
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}