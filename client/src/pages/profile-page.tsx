import React, { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Link } from 'wouter';
import { useMutation, useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
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
  const [proxyFilter, setProxyFilter] = useState<"all"|"active"|"expired">("all");
  const [paymentMethod, setPaymentMethod] = useState<"card"|"wallet"|"crypto">("card");


  // 1) Запрос всех конфигураций
  const {
    data: configs,
    isLoading: configsLoading,
    error: configsError,
  } = useQuery<{
    config_link: string;
    expiration_date: string;
    created_at: string;
  }[]>(
    {
      queryKey: ["configurations", user?.id],
      queryFn: async () => {
        if (!user) throw new Error("Неавторизован");
        const res = await apiRequest(
          "GET",
          `/api/users/${user.id}/configurations`,
          { credentials: "include" }
        );
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || "Не удалось загрузить");
        return payload;
      },
      enabled: !!user,
    }
  );
  

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

  

  // Запросы на получение прокси и истории
  const { data: proxies, isLoading: proxiesLoading } = useQuery({
    queryKey: ["/api/my-proxies"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  const { data: proxyHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/proxy-history"],
    queryFn: getQueryFn({ on401: "returnNull" }),
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


                {/* Вкладка прокси и истории */}
                <TabsContent value="proxies" className="w-full max-w-none">
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Globe className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold">История прокси</h3>
                    </div>

                    {/* Фильтры и категории */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      <Button
                        variant="outline"
                        className={proxyFilter === "all" ? "bg-green-500/10 border-green-500/30 text-green-500" : ""}
                        onClick={() => setProxyFilter("all")}
                      >
                        Все прокси
                      </Button>
                      <Button
                        variant="outline"
                        className={proxyFilter === "active" ? "bg-green-500/10 border-green-500/30 text-green-500" : ""}
                        onClick={() => setProxyFilter("active")}
                      >
                        Активные
                      </Button>
                      <Button
                        variant="outline"
                        className={proxyFilter === "expired" ? "bg-red-500/10 border-red-500/30 text-red-500" : ""}
                        onClick={() => setProxyFilter("expired")}
                      >
                        Истекшие
                      </Button>
                    </div>

                    {configsLoading ? (
                      <div className="flex justify-center p-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : configsError ? (
                      <div className="text-red-500">{configsError.message}</div>
                    ) : configs && configs.length > 0 ? (
                      <div className="space-y-4">
                        {/** фильтрация по proxyFilter */}
                        {["all","active","expired"].map((f) => {
                          const filtered = configs.filter(cfg => {
                            const isActive = new Date(cfg.expiration_date) > new Date();
                            if (f === "active") return isActive;
                            if (f === "expired") return !isActive;
                            return true;
                          });
                          if (filtered.length === 0 || (proxyFilter !== "all" && proxyFilter !== f)) return null;
                          return (
                            <div key={f}>
                              <h4 className="text-lg font-medium">
                                {f === "all" ? "Все прокси" : f === "active" ? "Активные прокси" : "Истекшие прокси"}
                              </h4>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {filtered.map((cfg, idx) => (
                                  <Card key={idx} className={`bg-black/40 backdrop-blur-md border ${f === "active" ? "border-green-500/30" : "border-red-500/20"}`}>
                                    <CardHeader className="pb-2">
                                      <div className="flex justify-between items-center">
                                        <CardTitle className="text-base flex items-center">
                                          <Server className={`h-4 w-4 mr-2 ${f === "active" ? "text-green-500" : "text-red-500"}`} />
                                          #{idx + 1}
                                        </CardTitle>
                                        <div
                                          className={`text-xs px-2 py-1 rounded-full border ${
                                            f === "active"
                                              ? "border-green-500/30 text-green-500"
                                              : "border-red-500/30 text-red-500"
                                          }`}
                                        >
                                          {f === "active" ? "Активен" : "Истек"}
                                        </div>

                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Ссылка:</span>
                                        <a href={cfg.config_link} className={`${f === "active" ? "text-green-500" : "text-gray-400"} hover:underline`} target="_blank">
                                          {cfg.config_link}
                                        </a>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">{f === "active" ? "До:" : "Истек:"}</span>
                                        <span>{new Date(cfg.expiration_date).toLocaleDateString()}</span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center p-10 bg-card/50 rounded-lg">
                        {/* ...пустой стейт... */}
                      </div>
                    )}

                  </div>
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}