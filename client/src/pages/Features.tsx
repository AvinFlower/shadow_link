import React from 'react';
import { Shield, Zap, Lock, Globe, LifeBuoy, BarChart4, Server, Clock, RefreshCw, Database, Layers, Users, Key } from 'lucide-react';
import FeatureCard from '@/components/FeatureCard';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Features: React.FC = () => {
  // Расширенный список функций
  const features = [
    {
      icon: Shield,
      title: 'Полная Анонимность',
      description: 'Ваш реальный IP-адрес остается скрытым, позволяя вам просматривать веб-страницы, не оставляя следов своей личности.',
    },
    {
      icon: Zap,
      title: 'Молниеносная Скорость',
      description: 'Наши прокси оптимизированы для производительности, обеспечивая минимальное влияние на скорость загрузки и серфинга.',
    },
    {
      icon: Lock,
      title: 'Корпоративная Безопасность',
      description: 'Наши прокси используют передовые протоколы шифрования для защиты ваших данных от хакеров и слежки.',
    },
    {
      icon: Globe,
      title: 'Глобальный Доступ',
      description: 'Подключайтесь через серверы, расположенные более чем в 50 странах, для доступа к контенту, ограниченному по географическому положению.',
    },
    {
      icon: LifeBuoy,
      title: 'Поддержка 24/7',
      description: 'Наша команда поддержки доступна круглосуточно, чтобы помочь вам с любыми техническими вопросами.',
    },
    {
      icon: BarChart4,
      title: 'Масштабируемые Решения',
      description: 'От индивидуальных пользователей до крупных предприятий — наши прокси-решения могут масштабироваться в зависимости от ваших потребностей.',
    },
    {
      icon: Server,
      title: 'Выделенные Серверы',
      description: 'Получите эксклюзивное использование прокси-серверов для максимальной производительности и безопасности вашего бизнеса.',
    },
    {
      icon: Clock,
      title: 'Неограниченная Длительность',
      description: 'Нет временных ограничений на использование прокси — держите свои соединения активными столько, сколько нужно.',
    },
    {
      icon: RefreshCw,
      title: 'Автоматическая Ротация',
      description: 'Наша система может автоматически менять ваши IP-адреса через определенные интервалы для улучшенной анонимности.',
    },
    {
      icon: Database,
      title: 'Обширная География',
      description: 'Выбирайте из обширной сети прокси-серверов, расположенных в городах по всему миру.',
    },
    {
      icon: Layers,
      title: 'Множество Протоколов',
      description: 'Поддержка протоколов HTTP, HTTPS, SOCKS4 и SOCKS5 для удовлетворения всех ваших потребностей в прокси.',
    },
    {
      icon: Users,
      title: 'Совместимые Подключения',
      description: 'Подключайте несколько устройств одновременно с нашими планами прокси для нескольких пользователей.',
    }
  ];

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Наши <span className="text-primary">Особенности</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Изучите всеобъемлющий набор функций, который делает Shadowlink ведущим выбором для безопасных прокси-сервисов.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={0.05 * index}
            />
          ))}
        </div>
        
        <motion.div 
          className="bg-card p-8 md:p-12 rounded-xl border border-border mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Передовые Технологии Безопасности</h2>
              <p className="text-muted-foreground mb-4">
                Наши прокси-серверы используют шифрование уровня военной безопасности и современные меры защиты, чтобы ваши данные оставались конфиденциальными и защищенными от угроз.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Key className="h-5 w-5 text-primary mr-2" />
                  <span>Шифрование AES 256-бит</span>
                </li>
                <li className="flex items-center">
                  <Key className="h-5 w-5 text-primary mr-2" />
                  <span>SSL/TLS безопасные соединения</span>
                </li>
                <li className="flex items-center">
                  <Key className="h-5 w-5 text-primary mr-2" />
                  <span>Политика отсутствия логов</span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <div className="absolute inset-0 bg-gradient-radial from-primary to-transparent opacity-10 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-20 h-20 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Готовы ощутить разницу?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам довольных клиентов, которые доверяют Shadowlink для защиты своей онлайн-конфиденциальности и безопасности.
          </p>
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-full px-8 py-6 transition duration-300 transform hover:scale-105"
          >
            Начать Сегодня
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;
