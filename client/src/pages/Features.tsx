import React from 'react';
import { Shield, Zap, Lock, Globe, LifeBuoy, BarChart4, Server, Clock, RefreshCw, Database, Layers, Users, Key } from 'lucide-react';
import FeatureCard from '@/components/FeatureCard';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';  // Импортируем для навигации
import { useAuth } from '@/hooks/use-auth'; // Импортируем для проверки авторизации

const Features: React.FC = () => {

  const { user } = useAuth(); // Получаем данные пользователя из контекста
  const [, navigate] = useLocation(); // Навигация с помощью useLocation

  const handleButtonClick = () => {
    if (user) {
      // Если пользователь авторизован, переходим в профиль
      navigate('/profile');
    } else {
      // Если пользователь не авторизован, переходим на страницу логина
      navigate('/auth');
    }
  };

  // Расширенный список функций
  const features = [
    {
      icon: Shield,
      title: 'Полная Анонимность',
      description: 'Весь ваш трафик маскируется под обычный HTTPS-трафик: фаерволы и DPI не увидят, что вы используете прокси.',
    },
    {
      icon: Zap,
      title: 'Молниеносная Скорость',
      description: 'XTLS-соединение передаёт данные напрямую без лишних буферов — вы не почувствуете разницы с прямым подключением.',
    },
    {
      icon: Lock,
      title: 'Надёжная Защита',
      description: 'Современное шифрование уровня банковских сайтов (TLS 1.3 + VLESS) + проверка подлинности пользователя по UUID.',
    },
    {
      icon: Globe,
      title: 'Региональные Серверы',
      description: 'Несколько точек присутствия в ключевых регионах для низкого пинга и стабильного соединения.',
    },
    {
      icon: LifeBuoy,
      title: 'Техническая Поддержка',
      description: 'Тех-поддержка всегда на связи в рабочие часы — поможем с настройкой, обновлением и любыми вопросами.',
    },
    {
      icon: BarChart4,
      title: 'Масштабируемые Решения',
      description: 'От индивидуальных пользователей до крупных предприятий — наши прокси-решения могут масштабироваться в зависимости от ваших потребностей.',
    },
    {
      icon: Server,
      title: 'Выделенные Серверы',
      description: 'Возможность выбрать свой сервер без шаринга ресурсов для максимальной производительности и конфиденциальности.',
    },
    {
      icon: Clock,
      title: 'Неограниченный трафик',
      description: 'Нет ограничений по трафику — используйте прокси столько, сколько нужно, пока есть подписка.',
    },
    {
      icon: RefreshCw,
      title: 'Стабильный IP-адрес',
      description: 'Ваш внешний IP остаётся неизменным на весь период — удобно, если нужно «белый список» на сторонних сервисах.',
    },
    {
      icon: Database,
      title: 'Обширная География',
      description: 'Сервера расположены в разных странах — выбирайте ближайший для наилучшей скорости и обхода локальных блокировок.',
    },
    {
      icon: Layers,
      title: 'VLESS + XTLS Reality',
      description: 'Современный транспортный протокол с маскировкой под HTTPS для надёжного обхода цензуры и DPI.',
    },
    {
      icon: Users,
      title: 'Множественные Подключения',
      description: 'Одновременно подключайте все свои устройства — десктоп, смартфон, планшет и роутер.',
    },
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
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Инновационный Транспорт VLESS + XTLS Reality</h2>
              <p className="text-muted-foreground mb-4">
                Мы используем современный протокол VLESS с ускоренным шифрованием XTLS и маскировкой трафика Reality. Это означает:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Key className="h-5 w-5 text-primary mr-2" />
                  <span>VLESS – лёгкий, быстрый и минималистичный транспортный протокол.</span>
                </li>
                <li className="flex items-center">
                  <Key className="h-5 w-5 text-primary mr-2" />
                  <span>XTLS – передача без промежуточных буферов для сверхнизкой задержки.</span>
                </li>
                <li className="flex items-center">
                  <Key className="h-5 w-5 text-primary mr-2" />
                  <span>Reality – маскировка под обычный HTTPS, чтобы обходить DPI и блокировки.</span>
                </li>
                <li className="flex items-center">
                  <Key className="h-5 w-5 text-primary mr-2" />
                  <span>TLS 1.3 – проверенный на практике и используемый крупнейшими сайтами.</span>
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
            onClick={handleButtonClick} // Добавляем обработчик клика для перехода
          >
            Начать Сегодня
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;
