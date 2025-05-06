import React, { useState, useMemo, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Link } from 'wouter';
import { useMutation, useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { AiOutlineCopy } from 'react-icons/ai';

import { GetConfigResponse } from "@/hooks/use-auth"; // Путь к файлу с типами, где определён GetConfigResponse
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  User,
  Shield,
  CreditCard,
  Globe,
  Server,
} from "lucide-react";
import { motion } from "framer-motion";

export async function apiRequest(method: string, url: string, options?: RequestInit) {
  const config: RequestInit = {
    method,
    ...options,
  };

  if (method === "GET" || method === "HEAD") {
    delete config.body; // Убедиться, что body не попадает в GET
  }

  return fetch(url, config);
}

// Schemas
const profileSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
}).refine(data => !(data.newPassword && !data.currentPassword), {
  message: "Для смены пароля введите текущий пароль",
  path: ["currentPassword"],
});

type ProfileValues = z.infer<typeof profileSchema>;

const proxyPurchaseSchema = z.object({
  country: z.enum(["us", "uk", "de", "ru"]),
  duration: z.coerce.number().min(1),
  price: z.string(),
});

type ProxyPurchaseValues = z.infer<typeof proxyPurchaseSchema>;

type PurchaseVars = { country: string; duration: number; amount: number };

type TabKey = "profile" | "credits" | "proxies";





export default function ProfilePage() {
  const { user, updateProfileMutation } = useAuth();
  const { createConfigMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [paymentMethod, setPaymentMethod] = useState<"card"|"wallet"|"crypto">("card");
  const [proxyFilter, setProxyFilter] = useState<"all"|"active"|"expired">("all");


  const { data: configs, isLoading: configsLoading, error: configsError } = useQuery<GetConfigResponse>({
    queryKey: ["configurations", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Неавторизован");
    
      const res = await fetch(
        `http://localhost:4000/api/users/${user.id}/configurations`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
    
      if (!res.ok) {
        const t = await res.text();
        console.error("API error:", t);
        throw new Error(`Ошибка ${res.status}`);
      }
    
      // Получаем payload
      const payload = await res.json();
    
      // Если вернулся не массив — оборачиваем в массив
      return Array.isArray(payload) ? payload : [payload] as GetConfigResponse;
    },
    enabled: !!user,
  });
  

  // Новая мутация для покупки прокси с явными типами
  const purchaseProxyMutation = useMutation<
    any,
    Error,
    PurchaseVars
  >({
    mutationFn: (data: PurchaseVars) =>
      fetch("/api/purchase-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
  });

  // Формы
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: user?.username || "", email: user?.email || "" },
  });
  const purchaseForm = useForm<ProxyPurchaseValues>({
    resolver: zodResolver(proxyPurchaseSchema),
    defaultValues: { country: "us", duration: 1, price: "0.00" },
  });

  // Расчёт цены
  const computedPrice = useMemo(() => {
    const { country, duration } = purchaseForm.getValues();
    // базовая стоимость за 1 месяц (в долларах)
    const base = 5;

    // поправка на страну
    const multipliers: Record<string, number> = {
      us: 1,
      uk: 1.2,
      de: 1.1,
      ru: 0.8,
    };
    return (base * (multipliers[country] || 1) * duration).toFixed(2);
  }, [purchaseForm.watch("country"), purchaseForm.watch("duration")]);

  useEffect(() => {
    purchaseForm.setValue("price", computedPrice);
  }, [computedPrice]);

  // Хендлеры
  function onProfileSubmit(data: ProfileValues) {
    if (!user?.id) return;
    const { currentPassword, newPassword, ...profileData } = data;
    updateProfileMutation.mutate({
      id: user.id,
      ...profileData,
      ...(newPassword && currentPassword
        ? { currentPassword, newPassword }
        : {}),
    });
  }

  function onPurchaseSubmit(data: ProxyPurchaseValues) {
    createConfigMutation.mutate();
  }

  
  const getRemainingTime = (expirationDate: string | Date): { time: string, color: string } => {
    const now = new Date();
    const exp = new Date(expirationDate);
    const diffMs = exp.getTime() - now.getTime();
  
    if (diffMs <= 0) return { time: "Истек", color: "text-red-500" };
  
    const rtf = new Intl.RelativeTimeFormat("ru", { numeric: "always" });
  
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
  
    let remainingTime = "";
    let color = "text-green-500"; // Default color (green)
  
    if (diffDays > 0) {
      remainingTime = `${diffDays} дней`;
  
      // Цветовые условия
      if (diffDays <= 3) color = "text-red-500"; // Красный, если осталось 3 дня или меньше
      else if (diffDays <= 7) color = "text-yellow-500"; // Жёлтый, если осталось 4-7 дней
    } else if (diffHours > 0) {
      remainingTime = `${diffHours} часов`;
  
      // Цветовые условия
      if (diffHours <= 3) color = "text-red-500"; // Красный, если осталось 3 часа или меньше
      else if (diffHours <= 6) color = "text-yellow-500"; // Жёлтый, если осталось 4-6 часов
    } else {
      remainingTime = `${diffMinutes} минут`;
  
      // Цветовые условия
      if (diffMinutes <= 15) color = "text-red-500"; // Красный, если осталось 15 минут или меньше
      else if (diffMinutes <= 30) color = "text-yellow-500"; // Жёлтый, если осталось 15-30 минут
    }
  
    return { time: remainingTime, color };
  };
  
  // разделяем на активные и истёкшие
  const activeConfigs  = useMemo(
    () => configs?.filter(c => new Date(c.expiration_date) > new Date()) || [],
    [configs]
  );
  const expiredConfigs = useMemo(
    () => configs?.filter(c => new Date(c.expiration_date) <= new Date()) || [],
    [configs]
  );

  return (
    <div className="container mx-auto pt-32 pb-20">
      <div className="flex flex-col gap-8">
        {/* Основные настройки и управление */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-black/40 backdrop-blur-md border border-green-500/30">
            <CardHeader>
              <CardTitle>Управление аккаунтом</CardTitle>
              <CardDescription>
                Настройки профиля, пополнение баланса и управление прокси
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
              value={activeTab}                                    // вместо defaultValue
              onValueChange={(val: string) =>                       // val приходит как string
                setActiveTab(val as TabKey)                         // явно кастим в TabKey
              }
              className="w-full"
              >
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="profile">Профиль</TabsTrigger>
                <TabsTrigger value="credits">Покупка конфигураций</TabsTrigger>
                <TabsTrigger value="proxies">Мои прокси</TabsTrigger>
              </TabsList>
  

                {/* Вкладка профиля */}
                <TabsContent value="profile" className="w-full max-w-none">
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <div className="flex flex-row items-center gap-4 mb-6">
                            <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center">
                              <User className="h-8 w-8 text-green-500" />
                            </div>
                            <div>
                              <div className="text-xl font-bold">{user?.username}</div>
                              <span className="font-medium flex items-center gap-1 text-green-500">
                                {user?.role === "admin" ? "Администратор" : "Пользователь"}
                                <Shield className="h-4 w-4" />
                              </span>
                            </div>
                          </div>

                          {/* Поля ввода имени пользователя и email */}
                          <div className="bg-black/30 p-4 rounded-lg mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={profileForm.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Имя пользователя</FormLabel>
                                    <FormControl>
                                      <Input placeholder="cool_username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={profileForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder="email@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                              
                          {/* Смена пароля */}
                          <div className="bg-black/30 p-4 rounded-lg mb-6">
                            <div className="text-xl font-medium mb-4">Смена пароля</div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                  control={profileForm.control}
                                  name="currentPassword"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Текущий пароль</FormLabel>
                                      <FormControl>
                                        <Input type="password" placeholder="Введите текущий пароль" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={profileForm.control}
                                  name="newPassword"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Новый пароль</FormLabel>
                                      <FormControl>
                                        <Input type="password" placeholder="Введите новый пароль" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                          </div>
                              
                          {/* Дата рождения */}
                          {user?.birth_date && (
                            <div className="rounded-md p-4 my-3">
                              <div className="font-medium">Дата рождения</div>
                              <div className="text-gray-400 mt-1">{user.birth_date}</div>
                              <p className="text-xs text-gray-400 mt-2">
                                Дата рождения не может быть изменена после регистрации
                              </p>
                            </div>
                          )}

                        </div>
                      </div>
                        
                      <div className="flex justify-end space-x-2">

                        {/* Если роль администратора, отображаем кнопку для перехода на админ-панель */}
                        {/*{user?.role === "admin" && (
                          <Link href="/admin">
                            <Button>Перейти в панель администрирования</Button>
                          </Link>
                        )}*/}

                        {user?.role === "admin" && (
                          <Button
                            onClick={() => window.open("https://vk.com", "_blank")}
                          >
                            Перейти в панель администрирования
                          </Button>
                        )}

                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Сохранение...
                            </>
                          ) : (
                            "Сохранить изменения"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>


                {/* Вкладка покупки конфигурации */}
                <TabsContent value="credits" className="w-full max-w-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Способы оплаты - ЛЕВАЯ колонка */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Способы оплаты</h3>
                      <div className="space-y-4">
                        {/* Банковская карта */}
                        <div
                          onClick={() => setPaymentMethod("card")}
                          className={`p-4 rounded-lg flex justify-between items-center cursor-pointer
                            ${paymentMethod === "card"
                              ? "border-green-500/50 bg-green-500/10"
                              : "border-green-500/30"
                            }`}
                        >
                          <div className="flex gap-3 items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Банковская карта</h4>
                              <p className="text-sm text-gray-400">Visa, Mastercard, Mir</p>
                            </div>
                          </div>
                          <Button
                            variant={paymentMethod === "card" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPaymentMethod("card")}
                          >
                            {paymentMethod === "card" ? "Выбрано" : "Выбрать"}
                          </Button>
                        </div>
                          
                        {/* Электронные кошельки */}
                        <div
                          onClick={() => setPaymentMethod("wallet")}
                          className={`p-4 rounded-lg flex justify-between items-center cursor-pointer
                            ${paymentMethod === "wallet"
                              ? "border-green-500/50 bg-green-500/10"
                              : "border-green-500/30"
                            }`}
                        >
                          <div className="flex gap-3 items-center">
                            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <Globe className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Электронные кошельки</h4>
                              <p className="text-sm text-gray-400">PayPal, Qiwi, WebMoney</p>
                            </div>
                          </div>
                          <Button
                            variant={paymentMethod === "wallet" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPaymentMethod("wallet")}
                          >
                            {paymentMethod === "wallet" ? "Выбрано" : "Выбрать"}
                          </Button>
                        </div>
                          
                        {/* Криптовалюты */}
                        <div
                          onClick={() => setPaymentMethod("crypto")}
                          className={`p-4 rounded-lg flex justify-between items-center cursor-pointer
                            ${paymentMethod === "crypto"
                              ? "border-green-500/50 bg-green-500/10"
                              : "border-green-500/30"
                            }`}
                        >
                          <div className="flex gap-3 items-center">
                            <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                              <Server className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Криптовалюты</h4>
                              <p className="text-sm text-gray-400">Bitcoin, Ethereum, USDT</p>
                            </div>
                          </div>
                          <Button
                            variant={paymentMethod === "crypto" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPaymentMethod("crypto")}
                          >
                            {paymentMethod === "crypto" ? "Выбрано" : "Выбрать"}
                          </Button>
                        </div>
                      </div>
                    </div>
                                        
                    {/* Покупка прокси - ПРАВАЯ колонка */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Покупка прокси</h3>
                      <Form {...purchaseForm}>
                        <form onSubmit={purchaseForm.handleSubmit(onPurchaseSubmit)} className="space-y-6">
                          {/* Контейнер для страны прокси и срока */}
                          <div className="p-4 border border-green-500/30 rounded-lg space-y-4">
                            <FormField control={purchaseForm.control} name="country" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Страна прокси</FormLabel>
                                <FormControl>
                                  <select {...field} className="h-10 w-full rounded-md border border-input bg-black px-3 py-2 text-sm text-white shadow-sm placeholder:text-muted-foreground focus:outline-none                 focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                    <option value="us">США</option>
                                    <option value="uk">Великобритания</option>
                                    <option value="de">Германия</option>
                                    <option value="ru">Россия</option>
                                  </select>
                                </FormControl>
                              </FormItem>
                            )} />
                            <FormField control={purchaseForm.control} name="duration" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Срок (месяцев)</FormLabel>
                                <FormControl>
                                  <select {...field} className="h-10 w-full rounded-md border border-input bg-black px-3 py-2 text-sm text-white shadow-sm placeholder:text-muted-foreground focus:outline-none                 focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                    <option value={1}>1</option>
                                    <option value={3}>3</option>
                                    <option value={6}>6</option>
                                    <option value={12}>12</option>
                                  </select>
                                </FormControl>
                              </FormItem>
                            )} />
                          </div>
                          
                          <FormField control={purchaseForm.control} name="price" render={({ field }) => (
                            <div className="flex items-center justify-between gap-4">
                              {/* Блок Итого */}
                              <div className="flex items-center justify-between h-10 w-full rounded-md border border-input bg-black px-4 text-sm text-white shadow-sm">
                                <span className="text-muted-foreground">Итого: </span>
                                <span className="font-semibold">{purchaseForm.watch('price')} $</span>
                              </div>
                              
                              {/* Кнопка Купить */}
                              <Button type="submit" disabled={purchaseProxyMutation.status === "pending"} className="h-10">
                                {purchaseProxyMutation.status === "pending" ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Обработка...
                                  </>
                                ) : (
                                  "Купить прокси"
                                )}
                              </Button>
                            </div>
                          )} />
                        </form>
                      </Form>
                    </div>
                  </div>
                </TabsContent>


                {/* вкладка «Мои прокси» */}
            <TabsContent value="proxies">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Globe className="h-8 w-8 text-green-500" />
                  <h3 className="text-xl font-semibold">История прокси</h3>
                </div>

                {/* фильтры */}
                <div className="flex gap-2">
                  {(["all","active","expired"] as const).map(f => (
                    <Button
                      key={f}
                      variant="outline"
                      className={
                        proxyFilter === f
                          ? f === "expired"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-green-500/10 text-green-500"
                          : ""
                      }
                      onClick={() => setProxyFilter(f)}
                    >
                      {f === "all" ? "Все" : f === "active" ? "Активные" : "Истекшие"}
                    </Button>
                  ))}
                </div>

                {/* загрузка / ошибка */}
                {configsLoading ? (
                  <div className="flex justify-center p-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : configsError ? (
                  <div className="text-red-500">{configsError.message}</div>
                ) : (
                  // содержимое
                  <>
                    {/* пустое состояние */}
                    {proxyFilter === "all" && configs?.length === 0 && (
                      <div className="p-6 text-center">
                        У вас ещё нет прокси.{" "}
                        <Button onClick={() => setActiveTab("credits")}>
                          Купить конфигурацию
                        </Button>
                      </div>
                    )}

                    {/* активные */}
                    {(proxyFilter === "all" || proxyFilter === "active") && activeConfigs.length > 0 && (
                      <section>
                        <h4 className="font-medium mb-2">Активные прокси</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {activeConfigs.map((cfg, i) => {
                            const { time, color } = getRemainingTime(cfg.expiration_date);
                            return (
                              <Card key={i} className="text-sm">
                                <CardHeader className="flex justify-between p-2">
                                <CardTitle className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <Server className="h-4 w-4 text-green-500" />
                                    #{i+1}
                                  </div>
                                  <span className="text-xs px-2 py-0.5 rounded-lg bg-green-500/10 text-green-500">
                                    Активен
                                  </span>
                                </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1 px-2 pb-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Ссылка:</span>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <AiOutlineCopy className="text-green-500" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[260px] p-2 text-sm">
                                        <div className="space-y-2">
                                          <div className="text-muted-foreground">
                                            Копировать ссылку
                                          </div>
                                          <div className="break-all">{cfg.config_link}</div>
                                          <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() =>
                                              navigator.clipboard.writeText(cfg.config_link)
                                            }
                                          >
                                            Скопировать
                                          </Button>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Создан:</span>
                                    <span>
                                      {new Date(cfg.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Истекает:</span>
                                    <span>
                                      {new Date(cfg.expiration_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Осталось:</span>
                                    <span className={color}>{time}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    {/* истёкшие */}
                    {(proxyFilter === "all" || proxyFilter === "expired") && expiredConfigs.length > 0 && (
                      <section>
                        <h4 className="font-medium mb-2">Истекшие прокси</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {expiredConfigs.map((cfg, i) => (
                            <Card key={i} className="text-sm">
                              <CardHeader className="flex justify-between p-2">
                                <CardTitle className="flex items-center gap-1">
                                  <Server className="h-4 w-4 text-red-500" />
                                  #{i+1}
                                </CardTitle>
                                <span className="text-xs px-2 py-0.5 rounded-lg bg-red-500/10 text-red-500">
                                  Истёк
                                </span>
                              </CardHeader>
                              <CardContent className="space-y-1 px-2 pb-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-400">Ссылка:</span>
                                  <a
                                    href={cfg.config_link}
                                    target="_blank"
                                    className="text-gray-400 hover:underline break-all max-w-[150px]"
                                  >
                                    {cfg.config_link}
                                  </a>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Истёк:</span>
                                  <span>
                                    {new Date(cfg.expiration_date).toLocaleDateString()}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </div>
)};