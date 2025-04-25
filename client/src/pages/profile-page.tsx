import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
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
import { Loader2, User, Shield, CreditCard, Clock, Globe, Server } from "lucide-react";
import { motion } from "framer-motion";

const profileSchema = z.object({
  full_name: z.string().min(2, {
    message: "Имя должно содержать минимум 2 символа",
  }),
  email: z.string().email({
    message: "Пожалуйста, введите корректный email",
  }),
});

type ProfileValues = z.infer<typeof profileSchema>;

const balanceSchema = z.object({
  amount: z.string()
    .min(1, { message: "Пожалуйста, введите сумму" })
    .refine((val) => !isNaN(parseInt(val)), {
      message: "Сумма должна быть числом"
    })
    .transform((val) => parseInt(val, 10)),
});

type BalanceValues = z.infer<typeof balanceSchema>;

export default function ProfilePage() {
  const { user, updateProfileMutation, addCreditsMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Получение данных о прокси
  const { data: proxies, isLoading: proxiesLoading } = useQuery({
    queryKey: ["/api/my-proxies"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Получение данных о прокси и их истории
  const { data: proxyHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/proxy-history"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
    },
  });
  
//amount: "100",
  const balanceForm = useForm<BalanceValues>({
    resolver: zodResolver(balanceSchema),
    defaultValues: {
      amount: 100,
    },
  });

  function onProfileSubmit(data: ProfileValues) {
    updateProfileMutation.mutate(data);
  }

  function onBalanceSubmit(data: BalanceValues) {
    addCreditsMutation.mutate({ amount: data.amount });
  }

  return (
    <div className="container mx-auto pt-32 pb-20">
      <div className="flex flex-col gap-8">
        {/* Профиль пользователя с информацией */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Карточка пользователя */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-black/40 backdrop-blur-md border border-green-500/20">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <CardTitle>{user?.username}</CardTitle>
                  <CardDescription>{user?.full_name}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Роль:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Shield className="h-4 w-4 text-green-500" />
                      {user?.role === "admin" ? "Администратор" : "Пользователь"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="font-medium">{user?.email || "Не указан"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Дата регистрации:</span>
                    <span className="font-medium">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Неизвестно"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Последний вход:</span>
                    <span className="font-medium">
                      {user?.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Неизвестно"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Карточка баланса */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-black/40 backdrop-blur-md border border-green-500/20">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <CardTitle>Баланс счета</CardTitle>
                  <CardDescription>Ваши средства для оплаты</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <h3 className="text-4xl font-bold text-green-500">
                    {user?.proxyCredits || 0} ₽
                  </h3>
                  <p className="text-gray-400 mt-2">доступных средств</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("credits")}>
                  Пополнить баланс
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Карточка статистики */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-black/40 backdrop-blur-md border border-green-500/20">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <CardTitle>Статистика</CardTitle>
                  <CardDescription>Использование прокси</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Активные прокси:</span>
                    <span className="font-medium">{Array.isArray(proxies) ? proxies.length : 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Передано данных:</span>
                    <span className="font-medium">428 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Время работы:</span>
                    <span className="font-medium">14 дней</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Статус:</span>
                    <span className="font-medium text-green-500">Активен</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Основные настройки и управление */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-black/40 backdrop-blur-md border border-green-500/20">
            <CardHeader>
              <CardTitle>Управление аккаунтом</CardTitle>
              <CardDescription>
                Настройки профиля, пополнение баланса и управление прокси
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="profile">Профиль</TabsTrigger>
                  <TabsTrigger value="credits">Пополнение</TabsTrigger>
                  <TabsTrigger value="proxies">Мои прокси</TabsTrigger>
                </TabsList>

                {/* Вкладка профиля */}
                <TabsContent value="profile">
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Полное имя</FormLabel>
                              <FormControl>
                                <Input placeholder="Иван Иванов" {...field} />
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
                        {user?.birth_date && (
                          <div className="md:col-span-2">
                            <div className="rounded-md border p-4 my-3">
                              <div className="font-medium">Дата рождения</div>
                              <div className="text-gray-400 mt-1">{user.birth_date}</div>
                              <p className="text-xs text-gray-400 mt-2">Дата рождения не может быть изменена после регистрации</p>
                            </div>
                          </div>
                        )}
                      </div>
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
                    </form>
                  </Form>
                </TabsContent>

                {/* Вкладка пополнения баланса */}
                <TabsContent value="credits">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Пополнение баланса</h3>
                      <Form {...balanceForm}>
                        <form onSubmit={balanceForm.handleSubmit(onBalanceSubmit)} className="space-y-6">
                          <FormField
                            control={balanceForm.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Сумма пополнения (₽)</FormLabel>
                                <FormControl>
                                  <Input type="text" placeholder="Введите сумму" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            disabled={addCreditsMutation.isPending}
                          >
                            {addCreditsMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Обработка...
                              </>
                            ) : (
                              "Пополнить баланс"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Способы оплаты</h3>
                      <div className="space-y-4">
                        <div className="p-4 border border-green-500/20 rounded-lg flex justify-between items-center">
                          <div className="flex gap-3 items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Банковская карта</h4>
                              <p className="text-sm text-gray-400">
                                Visa, Mastercard, Mir
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Выбрать
                          </Button>
                        </div>

                        <div className="p-4 border border-green-500/20 rounded-lg flex justify-between items-center">
                          <div className="flex gap-3 items-center">
                            <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <Globe className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Электронные кошельки</h4>
                              <p className="text-sm text-gray-400">
                                PayPal, Qiwi, WebMoney
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Выбрать
                          </Button>
                        </div>

                        <div className="p-4 border border-green-500/20 rounded-lg flex justify-between items-center">
                          <div className="flex gap-3 items-center">
                            <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                              <Server className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold">Криптовалюты</h4>
                              <p className="text-sm text-gray-400">
                                Bitcoin, Ethereum, USDT
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Выбрать
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Вкладка прокси и истории */}
                <TabsContent value="proxies">
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold">История прокси</h3>
                      <Button>Добавить новый прокси</Button>
                    </div>

                    {/* Фильтры и категории */}
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" className="bg-green-500/10 border-green-500/30 text-green-500">
                        Все прокси
                      </Button>
                      <Button variant="outline">
                        Активные
                      </Button>
                      <Button variant="outline">
                        Истекшие
                      </Button>
                    </div>

                    {proxiesLoading ? (
                      <div className="flex justify-center p-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : Array.isArray(proxies) && proxies.length > 0 ? (
                      <div className="space-y-4">
                        {/* Активные прокси */}
                        <h4 className="text-lg font-medium mt-6 mb-3">Активные прокси</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Активный прокси #1 */}
                          <Card className="bg-black/40 backdrop-blur-md border border-green-500/20">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base flex items-center">
                                  <Server className="h-4 w-4 mr-2 text-green-500" />
                                  Residential Proxy #101
                                </CardTitle>
                                <div className="text-xs px-2 py-1 rounded-full border border-green-500/30 text-green-500">
                                  Residential
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Подписка:</span>
                                  <a href="https://shadowlink.io/proxy/101" className="text-green-500 hover:underline">
                                    shadowlink.io/proxy/101
                                  </a>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Локация:</span>
                                  <span>Германия</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Статус:</span>
                                  <span className="text-green-500">Активен</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Осталось:</span>
                                  <span className="text-amber-500">15 дней</span>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end mt-4">
                                <Button variant="outline" size="sm">
                                  Копировать ссылку
                                </Button>
                                <Button variant="outline" size="sm">
                                  Продлить
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Активный прокси #2 */}
                          <Card className="bg-black/40 backdrop-blur-md border border-green-500/20">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base flex items-center">
                                  <Server className="h-4 w-4 mr-2 text-green-500" />
                                  Datacenter Proxy #102
                                </CardTitle>
                                <div className="text-xs px-2 py-1 rounded-full border border-green-500/30 text-green-500">
                                  Datacenter
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Подписка:</span>
                                  <a href="https://shadowlink.io/proxy/102" className="text-green-500 hover:underline">
                                    shadowlink.io/proxy/102
                                  </a>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Локация:</span>
                                  <span>США</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Статус:</span>
                                  <span className="text-green-500">Активен</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Осталось:</span>
                                  <span className="text-green-500">28 дней</span>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end mt-4">
                                <Button variant="outline" size="sm">
                                  Копировать ссылку
                                </Button>
                                <Button variant="outline" size="sm">
                                  Продлить
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Истекшие прокси */}
                        <h4 className="text-lg font-medium mt-8 mb-3">Истекшие прокси</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Истекший прокси #1 */}
                          <Card className="bg-black/40 backdrop-blur-md border border-red-500/20">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base flex items-center">
                                  <Server className="h-4 w-4 mr-2 text-red-500" />
                                  Mobile Proxy #98
                                </CardTitle>
                                <div className="text-xs px-2 py-1 rounded-full border border-red-500/30 text-red-500">
                                  Mobile
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Подписка:</span>
                                  <a href="https://shadowlink.io/proxy/98" className="text-gray-400 hover:underline">
                                    shadowlink.io/proxy/98
                                  </a>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Локация:</span>
                                  <span>Франция</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Статус:</span>
                                  <span className="text-red-500">Истек</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Истек:</span>
                                  <span className="text-gray-400">15.03.2025</span>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end mt-4">
                                <Button variant="outline" size="sm">
                                  Восстановить
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Истекший прокси #2 */}
                          <Card className="bg-black/40 backdrop-blur-md border border-red-500/20">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base flex items-center">
                                  <Server className="h-4 w-4 mr-2 text-red-500" />
                                  Datacenter Proxy #85
                                </CardTitle>
                                <div className="text-xs px-2 py-1 rounded-full border border-red-500/30 text-red-500">
                                  Datacenter
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Подписка:</span>
                                  <a href="https://shadowlink.io/proxy/85" className="text-gray-400 hover:underline">
                                    shadowlink.io/proxy/85
                                  </a>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Локация:</span>
                                  <span>Сингапур</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Статус:</span>
                                  <span className="text-red-500">Истек</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Истек:</span>
                                  <span className="text-gray-400">28.02.2025</span>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end mt-4">
                                <Button variant="outline" size="sm">
                                  Восстановить
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-10 bg-card/50 rounded-lg">
                        <Server className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium mb-2">История прокси пуста</h3>
                        <p className="text-gray-400 mb-4">
                          У вас пока нет прокси в истории. Создайте свой первый прокси,
                          чтобы начать работу.
                        </p>
                        <Button>Создать прокси</Button>
                      </div>
                    )}

                    {/* Статистика использования */}
                    <div className="bg-black/40 backdrop-blur-md border border-green-500/20 rounded-lg p-6 mt-8">
                      <h4 className="text-lg font-medium mb-4">Статистика использования</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-black/40 rounded-lg">
                          <div className="text-gray-400 text-sm mb-1">Всего запросов</div>
                          <div className="text-2xl font-bold text-green-500">1,257</div>
                          <div className="text-xs text-gray-400 mt-1">+173 с прошлой недели</div>
                        </div>
                        
                        <div className="p-4 bg-black/40 rounded-lg">
                          <div className="text-gray-400 text-sm mb-1">Использовано данных</div>
                          <div className="text-2xl font-bold text-green-500">428 MB</div>
                          <div className="text-xs text-gray-400 mt-1">+62 MB с прошлой недели</div>
                        </div>
                        
                        <div className="p-4 bg-black/40 rounded-lg">
                          <div className="text-gray-400 text-sm mb-1">Активных прокси</div>
                          <div className="text-2xl font-bold text-green-500">2</div>
                          <div className="text-xs text-gray-400 mt-1">из 4 за все время</div>
                        </div>
                      </div>
                    </div>
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