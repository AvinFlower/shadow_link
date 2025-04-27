import React from 'react';
import PricingCard from '@/components/PricingCard';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
  // Планы по месячной подписке
  const monthlyPlans = [
    {
      title: 'Базовый',
      price: '$9',
      features: [
        { name: '5 частных прокси' },
        { name: '10 стран' },
        { name: '1 ГБ трафика/день' },
        { name: 'Поддержка по электронной почте' }
      ],
      popular: false
    },
    {
      title: 'Профессиональный',
      price: '$19',
      features: [
        { name: '20 частных прокси' },
        { name: '30 стран' },
        { name: '5 ГБ трафика/день' },
        { name: 'Приоритетная поддержка' },
        { name: 'Ротация прокси' }
      ],
      popular: true
    },
    {
      title: 'Корпоративный',
      price: '$49',
      features: [
        { name: '100 частных прокси' },
        { name: '50+ стран' },
        { name: 'Неограниченный трафик' },
        { name: 'Круглосуточная поддержка' },
        { name: 'Продвинутые функции безопасности' }
      ],
      popular: false
    }
  ];

  // Планы по годовой подписке (со скидкой)
  const yearlyPlans = [
    {
      title: 'Базовый',
      price: '$90',
      features: [
        { name: '5 частных прокси' },
        { name: '10 стран' },
        { name: '1 ГБ трафика/день' },
        { name: 'Поддержка по электронной почте' },
        { name: '2 месяца бесплатно' }
      ],
      popular: false
    },
    {
      title: 'Профессиональный',
      price: '$190',
      features: [
        { name: '20 частных прокси' },
        { name: '30 стран' },
        { name: '5 ГБ трафика/день' },
        { name: 'Приоритетная поддержка' },
        { name: 'Ротация прокси' },
        { name: '2 месяца бесплатно' }
      ],
      popular: true
    },
    {
      title: 'Корпоративный',
      price: '$490',
      features: [
        { name: '100 частных прокси' },
        { name: '50+ стран' },
        { name: 'Неограниченный трафик' },
        { name: 'Круглосуточная поддержка' },
        { name: 'Продвинутые функции безопасности' },
        { name: '2 месяца бесплатно' }
      ],
      popular: false
    }
  ];

  // Сравнение функций
  const compareFeatures = [
    { name: 'Частные прокси', basic: '5', pro: '20', enterprise: '100' },
    { name: 'Страны', basic: '10', pro: '30', enterprise: '50+' },
    { name: 'Трафик', basic: '1 ГБ/день', pro: '5 ГБ/день', enterprise: 'Неограниченно' },
    { name: 'Поддержка', basic: 'Электронная почта', pro: 'Приоритетная', enterprise: 'Круглосуточная' },
    { name: 'Ротация прокси', basic: false, pro: true, enterprise: true },
    { name: 'API доступ', basic: false, pro: true, enterprise: true },
    { name: 'Выделенные IP-адреса', basic: false, pro: true, enterprise: true },
    { name: 'Аутентификация по IP', basic: true, pro: true, enterprise: true },
    { name: 'Несколько подсетей', basic: false, pro: true, enterprise: true },
    { name: 'Продвинутая безопасность', basic: false, pro: false, enterprise: true }
  ];

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Простое и прозрачное <span className="text-primary">ценообразование</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Выберите план, который вам подходит. Без скрытых платежей, без сложных условий и полный доступ ко всем функциям на всех планах.
          </p>
        </motion.div>
        
        <Tabs defaultValue="monthly" className="w-full mb-16">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-64 grid-cols-2">
              <TabsTrigger value="monthly">Месячный</TabsTrigger>
              <TabsTrigger value="yearly">Годовой</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="monthly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {monthlyPlans.map((plan, index) => (
                <PricingCard 
                  key={index}
                  title={plan.title}
                  price={plan.price}
                  features={plan.features}
                  popular={plan.popular}
                  delay={0.1 * index}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="yearly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {yearlyPlans.map((plan, index) => (
                <PricingCard 
                  key={index}
                  title={plan.title}
                  price={plan.price}
                  features={plan.features}
                  popular={plan.popular}
                  delay={0.1 * index}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Сравнение планов</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 px-6 text-left">Особенности</th>
                  <th className="py-4 px-6 text-center">Базовый</th>
                  <th className="py-4 px-6 text-center">Профессиональный</th>
                  <th className="py-4 px-6 text-center">Корпоративный</th>
                </tr>
              </thead>
              <tbody>
                {compareFeatures.map((feature, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-4 px-6 font-medium">{feature.name}</td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.basic === 'boolean' ? 
                        (feature.basic ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>) : 
                        feature.basic
                      }
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.pro === 'boolean' ? 
                        (feature.pro ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>) : 
                        feature.pro
                      }
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.enterprise === 'boolean' ? 
                        (feature.enterprise ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>) : 
                        feature.enterprise
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-card p-8 rounded-xl border border-border mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4">Нужна индивидуальная настройка?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Мы предлагаем индивидуальные пакеты прокси для бизнеса с особыми требованиями.
            Свяжитесь с нашей командой продаж, чтобы обсудить ваши нужды.
          </p>
          <div className="text-primary font-semibold">
            sales@shadowlink.com | +1 (555) 987-6543
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
