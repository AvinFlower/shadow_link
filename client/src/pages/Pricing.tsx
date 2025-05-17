import React from 'react';
import PricingCard from '@/components/PricingCard';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
  // Планы по месячной подписке
  const monthlyPlans = [
    {
      title: 'Базовый сервер',
      price: '200₽',
      features: [
        { name: '1 core' },
        { name: '1 GB RAM' },
        { name: '10 GB NVMe' },
        { name: 'До 200 Mbps ∞' },
        { name: 'Ресурсы сервера делятся на всех клиентов' },
        { name: 'Максимум клиентов: 10' },
      ],
      popular: false
    },
    {
      title: 'Максимальный сервер',
      price: '300₽',
      features: [
        { name: '1 core' },
        { name: '2 GB RAM' },
        { name: '30 GB NVMe' },
        { name: 'До 1 Gbs ∞' },
        { name: 'Ресурсы сервера делятся на всех клиентов' },
        { name: 'Максимум клиентов: 10' },
      ],
      popular: true
    },
    {
      title: 'Корпоративный сервер',
      price: '500₽',
      features: [
        { name: '1 core' },
        { name: '2 GB RAM' },
        { name: '30 GB NVMe' },
        { name: 'До 1 Gbs ∞' },
        { name: 'Выделенная часть сервера используется только вами' },
        { name: 'Максимум клиентов: 5' },
      ],
      popular: false
    }
  ];

  // Планы по годовой подписке (со скидкой)
  const yearlyPlans = [
    {
      title: 'Базовый сервер',
      price: '1800₽',
      features: [
        { name: '1 core' },
        { name: '1 GB RAM' },
        { name: '10 GB NVMe' },
        { name: 'До 200 Mbps ∞' },
        { name: 'Ресурсы сервера делятся на всех клиентов' },
        { name: 'Максимум клиентов: 10' },
      ],
      popular: false
    },
    {
      title: 'Максимальный сервер',
      price: '2900₽',
      features: [
        { name: '1 core' },
        { name: '2 GB RAM' },
        { name: '30 GB NVMe' },
        { name: 'До 1 Gbs ∞' },
        { name: 'Ресурсы сервера делятся на всех клиентов' },
        { name: 'Максимум клиентов: 10' },
      ],
      popular: true
    },
    {
      title: 'Корпоративный сервер',
      price: '4500₽',
      features: [
        { name: '1 core' },
        { name: '2 GB RAM' },
        { name: '30 GB NVMe' },
        { name: 'До 1 Gbs ∞' },
        { name: 'Выделенная часть сервера используется только вами' },
        { name: 'Максимум клиентов: 5' },
      ],
      popular: false
    }
  ];

    // Сравнение функций
    const compareFeatures = [
    { name: 'CPU', basicServer: '1 core', maxServer: '1 core', corpServer: '1 core' },
    { name: 'ОЗУ', basicServer: '1 GB RAM', maxServer: '2 GB RAM', corpServer: '2 GB RAM' },
    { name: 'Диск', basicServer: '10 GB NVMe', maxServer: '30 GB NVMe', corpServer: '30 GB NVMe' },
    { name: 'Скорость', basicServer: 'До 200 Mbps ∞', maxServer: 'До 1 Gbs ∞', corpServer: 'До 1 Gbs ∞' },
    { name: 'Выделенность ресурсов', basicServer: false, maxServer: false, corpServer: true },
    { name: 'Макс. клиентов на сервер', basicServer: '10', maxServer: '10', corpServer: '5' }
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
                  <th className="py-4 px-6 text-center">Базовый сервер</th>
                  <th className="py-4 px-6 text-center">Максимальный сервер</th>
                  <th className="py-4 px-6 text-center">Корпоративный сервер</th>
                </tr>
              </thead>
              <tbody>
                {compareFeatures.map((feature, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-4 px-6 font-medium">{feature.name}</td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.basicServer === 'boolean' ? 
                        (feature.basicServer ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>) : 
                        feature.basicServer
                      }
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.maxServer === 'boolean' ? 
                        (feature.maxServer ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>) : 
                        feature.maxServer
                      }
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.corpServer === 'boolean' ? 
                        (feature.corpServer ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>) : 
                        feature.corpServer
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
            sales@shadowlink.com | +7 (912) 736-6610
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
