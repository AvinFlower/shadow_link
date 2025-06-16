// ----------------- ИМПОРТЫ -----------------
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
import { ProxyCard } from "@/components/ProxyCard";
import { GetConfigResponse } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, User, Shield, CreditCard, Globe, Server} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

  // -------------- Константы прокси --------------
  const pricesByTariffAndCountry = {
    Russia: { "Базовый сервер": 200, "Максимальный сервер": 300, "Корпоративный сервер": 500 },
    Poland: { "Базовый сервер": 200, "Максимальный сервер": 300, "Корпоративный сервер": 500 },
    USA: { "Базовый сервер": 200, "Максимальный сервер": 300, "Корпоративный сервер": 500 },
    UK: { "Базовый сервер": 200, "Максимальный сервер": 300, "Корпоративный сервер": 500 },
    Denmark: { "Базовый сервер": 200, "Максимальный сервер": 300, "Корпоративный сервер": 500 },
  };

  const yearDiscountPricesByTariff = {
    "Базовый сервер": 1800,
    "Максимальный сервер": 2900,
    "Корпоративный сервер": 4500,
  };

// -------------- СХЕМЫ --------------
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
  tariff: z.enum(["Базовый сервер", "Максимальный сервер", "Корпоративный сервер"]),
  country: z.enum(["Russia","Poland","USA","UK","Denmark"]),
  months: z.coerce.number().min(1),
  price: z.number(), // Временно для валидации
});
type ProxyPurchaseValues = z.infer<typeof proxyPurchaseSchema>;
type PurchaseVars = { country: string; duration: number; amount: number };
type TabKey = "profile" | "credits" | "proxies" | "servers";

// ----------------- КОМПОНЕНТ -----------------
export default function ProfilePage() {
  // -------------- Авторизация и мутации --------------
  const { user, updateProfileMutation, createConfigMutation, serversQuery } = useAuth();

  // -------------- Состояния --------------
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [paymentMethod, setPaymentMethod] = useState<"card"|"wallet"|"crypto">("card");
  const [proxyFilter, setProxyFilter] = useState<"all"|"active"|"expired">("all");
  const [profileData, setProfileData] = useState<ProfileValues>({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [username, setUsername] = useState(user?.username || "");
  const [notification, setNotification] = useState<string | null>(null);

  // -------------- Запрос конфигураций --------------
  const { data: configs, isLoading: configsLoading, error: configsError } = useQuery<GetConfigResponse>({
    queryKey: ["configurations", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Неавторизован");
      const token = localStorage.getItem('access_token');
      const res = await fetch(
        `http://localhost:4000/api/users/configurations/${user.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const t = await res.text(); console.error("API error:", t);
        throw new Error(`Ошибка ${res.status}`);
      }
      const payload = await res.json();
      return Array.isArray(payload) ? payload : [payload] as GetConfigResponse;
    },
    enabled: !!user,
  });

  // -------------- Формы --------------
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileData,
  });
  const purchaseForm = useForm<ProxyPurchaseValues>({
    resolver: zodResolver(proxyPurchaseSchema),
    defaultValues: {
    tariff: "Базовый сервер",
    country: "Poland",
    months: 1,
    price: pricesByTariffAndCountry["Poland"]["Базовый сервер"],
    },
  });

  // -------------- Вычисление цены --------------
  const watchedCountry = purchaseForm.watch("country");
  const watchedMonths = purchaseForm.watch("months");
  const watchedTariff = purchaseForm.watch("tariff");
  
  const computedPrice = useMemo(() => {
    const monthsNumber = Number(watchedMonths) || 1;

    const countryPrices = pricesByTariffAndCountry[watchedCountry as keyof typeof pricesByTariffAndCountry];
    if (!countryPrices) return 0;

    const basePrice = countryPrices[watchedTariff as keyof typeof countryPrices];
    if (!basePrice) return 0;

    if (monthsNumber === 12) {
      return yearDiscountPricesByTariff[watchedTariff as keyof typeof yearDiscountPricesByTariff] ?? basePrice * monthsNumber;
    }

    return basePrice * monthsNumber;
  }, [watchedCountry, watchedTariff, watchedMonths]);




  // -------------- Обработчики --------------
  function onPurchaseSubmit(data: ProxyPurchaseValues) {
    createConfigMutation.mutate({ country: data.country, months: data.months });
  }

  const { toast } = useToast();
  function onProfileSubmit(data: ProfileValues) {
    if (!user?.id) return;
    const { currentPassword, newPassword, ...pd } = data;
    const token = localStorage.getItem('access_token');
    
    // Отправляем уведомление сразу после начала мутации, чтобы сообщить пользователю о начале изменения
    let changes: string[] = [];
    
    if (pd.username !== user.username) {
      changes.push("имя пользователя");
    }
    if (pd.email !== user.email) {
      changes.push("email");
    }
    
    if (changes.length > 0) {
      setNotification(`Вы изменили: ${changes.join(", ")}`);
    }
    
    updateProfileMutation.mutate(
      { id: user.id, ...pd, ...(newPassword && currentPassword ? { currentPassword, newPassword } : {}) },
      {
        onSuccess: updated => {
          setProfileData({ username: updated.username, email: updated.email });
          setUsername(updated.username); // Обновляем username
          sessionStorage.setItem("profileUpdateNotification", "Профиль успешно обновлён");
          setActiveTab("profile");
  
          // После успешного обновления отправляем уведомление
          const successChanges = [];
          if (updated.username !== user.username) successChanges.push("имя пользователя");
          if (updated.email !== user.email) successChanges.push("email");
  
          if (successChanges.length > 0) {
            toast({
              title: "Изменения применены",
              description: `Изменено: ${successChanges.join(", ")}`,
              variant: "default",
            });
          }
        }
      }
    );
  }

  // -------------- Эффекты --------------
  // Синхронизация profileData и username при изменении user
  useEffect(() => {
    setProfileData({ username: user?.username || "", email: user?.email || "" });
    setUsername(user?.username || "");
  }, [user]);

  // Уведомления
  useEffect(() => {
    const profileUpdateNotification = sessionStorage.getItem("profileUpdateNotification");
    if (profileUpdateNotification) {
      setNotification(profileUpdateNotification);  // Сохранить уведомление в состоянии
      sessionStorage.removeItem("profileUpdateNotification");  // Удалить уведомление из sessionStorage
    }
  }, []);

  useEffect(() => {
    purchaseForm.setValue("price", computedPrice, { shouldValidate: true, shouldDirty: true });
  }, [computedPrice]);


  // -------------- Фильтрация конфигов --------------
  const activeConfigs = useMemo(() => configs?.filter(c => new Date(c.expiration_date) > new Date()) || [], [configs]);
  const expiredConfigs = useMemo(() => configs?.filter(c => new Date(c.expiration_date) <= new Date()) || [], [configs]);

  // -------------- JSX РЕНДЕР ----------------

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
              <TabsList className={`grid ${user?.role === "admin" ? "grid-cols-4" : "grid-cols-3"} mb-8`}>
                <TabsTrigger value="profile">Профиль</TabsTrigger>
                <TabsTrigger value="credits">Покупка конфигураций</TabsTrigger>
                <TabsTrigger value="proxies">Мои прокси</TabsTrigger>
                {user?.role === "admin" && (
                  <TabsTrigger value="servers">Серверы</TabsTrigger>
                )}
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
                            <div className="text-xl font-bold">{username}</div>
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
                                      <Input placeholder="My Username" {...field} />
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
                                      <Input
                                        type="password"
                                        placeholder="Введите текущий пароль"
                                        {...field}
                                      />
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
                                      <Input
                                        type="password"
                                        placeholder="Введите новый пароль"
                                        {...field}
                                      />
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

                        {user?.role === "admin" && (
                          <Button
                            onClick={() => window.open("http://localhost:5601/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15m,to:now))&_a=(columns:!(),filters:!(),index:eedac610-3b9b-11f0-b232-79e6dd0aeeca,interval:auto,query:(language:kuery,query:''),sort:!(!('@timestamp',desc)))", "_blank")}
                          >
                            Логи
                          </Button>
                        )}
                        {user?.role === "admin" && (
                          <Button
                            onClick={() => window.open("http://localhost:16686/search?end=1748707174663000&limit=20&lookback=1h&maxDuration&minDuration&service=flaskapp&start=1748703574663000", "_blank")}
                          >
                            Трейсинг
                          </Button>
                        )}
                        {user?.role === "admin" && (
                          <Button
                            onClick={() => window.open("http://localhost:3001/a/grafana-metricsdrilldown-app/drilldown?nativeHistogramMetric=&layout=grid&filters-rule=&filters-prefix=&filters-suffix=&from=now-1h&to=now&timezone=browser&var-otel_resources=&var-filters=&var-otel_and_metric_filters=&var-deployment_environment=undefined&var-labelsWingman=%28none%29&search_txt=http_server_duration_milliseconds_count&var-metrics-reducer-sort-by=dashboard-usage&var-ds=cenfzlm5s1kw0c&var-other_metric_filters=&metric=http_server_duration_milliseconds_count&actionView=breakdown&var-groupby=$__all", "_blank")}
                          >
                            Метрики
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
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <CreditCard className="h-8 w-8 text-green-500" />
                        <h3 className="text-xl font-semibold">Способы оплаты</h3>
                      </div>
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
                              <p className="text-sm text-gray-400">Mir</p>
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
                              <p className="text-sm text-gray-400">Юмани</p>
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
                              <p className="text-sm text-gray-400">USDT</p>
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
                            <FormField control={purchaseForm.control} name="tariff" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Выберите тариф</FormLabel>
                                <FormControl>
                                  <select
                                    {...field}
                                    className="h-10 w-full rounded-md border border-input bg-black px-3 py-2 text-sm text-white shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring   focus:ring-offset-2"
                                  >
                                    <option value="Базовый сервер">Базовый сервер</option>
                                    <option value="Максимальный сервер">Максимальный сервер</option>
                                    <option value="Корпоративный сервер">Корпоративный сервер</option>
                                  </select>
                                </FormControl>
                              </FormItem>
                            )} />
                            <FormField control={purchaseForm.control} name="country" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Страна прокси</FormLabel>
                                <FormControl>
                                  <select {...field} className="h-10 w-full rounded-md border border-input bg-black px-3 py-2 text-sm text-white shadow-sm placeholder:text-muted-foreground focus:outline-none                 focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                    <option value="Russia">Россия</option>
                                    <option value="Poland">Польша</option>
                                    <option value="USA">США</option>
                                    <option value="UK">Великобритания</option>
                                    <option value="Denmark">Германия</option>
                                  </select>
                                </FormControl>
                              </FormItem>
                            )} />
                            <FormField control={purchaseForm.control} name="months" render={({ field }) => (
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
                          
                          <FormField
                            control={purchaseForm.control}
                            name="price"
                            render={() => (
                              <div className="flex items-center justify-between gap-4">
                                {/* Блок "Итого" */}
                                <div
                                  className="flex items-center justify-between h-10 w-full rounded-md border border-input bg-black px-4 text-sm text-white shadow-sm"
                                  aria-label="Сумма к оплате"
                                >
                                  <span className="text-muted-foreground">Итого:</span>
                                  <span className="font-semibold">{purchaseForm.watch("price")} ₽</span>
                                </div>
                            
                                {/* Кнопка "Купить прокси" */}
                                <Button
                                  type="submit"
                                  className="h-10"
                                  disabled={createConfigMutation.status === "pending"}
                                  aria-busy={createConfigMutation.status === "pending"}
                                >
                                  {createConfigMutation.status === "pending" ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Обработка...
                                    </>
                                  ) : (
                                    "Купить прокси"
                                  )}
                                </Button>
                              </div>
                            )}
                          />
                        </form>
                      </Form>
                    </div>
                  </div>
                </TabsContent>


            {/* Вкладка «Мои прокси»*/}
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
                    {/* Пустое состояние */}
                    {(proxyFilter === "all" || proxyFilter === "active" || proxyFilter === "expired") && configs?.length === 0 && (
                      <div className="p-6 text-center bg-black rounded-lg">
                        <h2 className="text-xl font-semibold text-white mb-4">
                          У вас ещё нет прокси.
                        </h2>
                        <p className="text-muted-foreground mb-6">
                          Для получения конфигурации вам нужно сначала купить прокси.
                        </p>
                        <Button
                          onClick={() => setActiveTab("credits")}
                          className="px-6 py-2 bg-primary hover:bg-primary/90 text-black rounded-md transition duration-300"
                        >
                          Купить конфигурацию
                        </Button>
                      </div>
                    )}



                    {/* активные */}
                    {(proxyFilter === "all" || proxyFilter === "active") && activeConfigs.length > 0 && (
                      <section>
                        <h4 className="font-medium mb-2">Активные прокси</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {activeConfigs.map((cfg, i) => (
                            <ProxyCard
                              key={i}
                              cfg={cfg}
                              i={i}
                              status="active"
                              colorClass="green-500"
                              statusText="Активен"
                            />
                          ))}
                        </div>
                      </section>
                    )}
                    
                    {/* истекшие */}
                    {(proxyFilter === "all" || proxyFilter === "expired") && expiredConfigs.length > 0 && (
                      <section>
                        <h4 className="font-medium mb-2">Истекшие прокси</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {expiredConfigs.map((cfg, i) => (
                            <ProxyCard
                              key={i}
                              cfg={cfg}
                              i={i}
                              status="expired"
                              colorClass="red-500"
                              statusText="Истёк"
                            />
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            {/* ---------------- Вкладка «Серверы» ---------------- */}
            <TabsContent value="servers" className="w-full max-w-none">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Server className="h-8 w-8 text-green-500" />
                  <h3 className="text-xl font-semibold">Список серверов</h3>
                </div>

                {/* Если не админ */}
                {user?.role !== "admin" && (
                  <p className="text-red-500">У вас нет прав для просмотра серверов.</p>
                )}

                {/* Загрузка */}
                {user?.role === "admin" && serversQuery.isLoading && (
                  <p className="text-gray-400">Загрузка серверов…</p>
                )}

                {/* Ошибка */}
                {user?.role === "admin" && serversQuery.error && (
                  <p className="text-red-500">Ошибка: {serversQuery.error.message}</p>
                )}

                {/* Данные */}
                {user?.role === "admin" &&
                  !serversQuery.isLoading &&
                  !serversQuery.error && (
                    <>
                      {serversQuery.data && serversQuery.data.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                          {serversQuery.data.map((srv) => (
                            <div
                              key={srv.id}
                              className="bg-black border border-green-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                            >
                              {/* Левая часть: ID, Host и Country */}
                              <div className="flex-1 mb-4 md:mb-0">
                                <div className="flex items-center gap-2">
                                  <span className="inline-block bg-green-500 text-black px-2 py-1 rounded-full text-xs font-semibold">
                                    #{srv.id}
                                  </span>
                                  <h3 className="text-lg font-semibold text-white">
                                    {srv.host}
                                  </h3>
                                </div>
                                <p className="mt-1 text-sm text-gray-300">
                                  {srv.country}
                                </p>
                              </div>
                          
                              {/* Правая часть (статистика + кнопка) */}
                              <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="text-center">
                                  <div className="text-xs text-gray-400 uppercase">
                                    Макс. пользователей
                                  </div>
                                  <div className="text-white font-semibold">
                                    {srv.max_users}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-400 uppercase">
                                    Активные пользователи
                                  </div>
                                  <div className="text-white font-semibold">
                                    {srv.users_count}
                                  </div>
                                </div>
                          
                                {/* Кнопка для перехода на UI-панель */}
                                <Button
                                  onClick={() => window.open(srv.ui_panel_link, "_blank")}
                                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-black rounded-md transition duration-300"
                                >
                                  UI-Панель
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">Серверы не найдены.</p>
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