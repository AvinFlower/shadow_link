import React, {useRef} from 'react';
import Hero from '@/components/Hero';
import { useLocation, useRoute } from 'wouter';
import { Shield, Zap, Lock, Globe, LifeBuoy, BarChart4 } from 'lucide-react';
import FeatureCard from '@/components/FeatureCard';
import PricingCard from '@/components/PricingCard';
import ContactForm from '@/components/ContactForm';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  
  const featuresSectionRef = useRef<HTMLDivElement>(null); // Реф для секции Features
  // Данные для секции Features
  const features = [
    {
      icon: Shield,
      title: 'Полная анонимность',
      description: 'Ваш реальный IP-адрес остается скрытым, позволяя вам просматривать веб без следов вашей личности.',
    },
    {
      icon: Zap,
      title: 'Молниеносная скорость',
      description: 'Наши прокси оптимизированы для производительности, обеспечивая минимальное воздействие на скорость вашего браузинга и загрузки.',
    },
    {
      icon: Lock,
      title: 'Безопасность уровня Enterprise',
      description: 'Наши прокси используют продвинутые протоколы шифрования для защиты ваших данных от хакеров и слежки.',
    },
    {
      icon: Globe,
      title: 'Глобальный доступ',
      description: 'Подключайтесь через серверы, расположенные более чем в 50 странах, чтобы получить доступ к гео-ограниченному контенту из любой точки мира.',
    },
    {
      icon: LifeBuoy,
      title: 'Круглосуточная поддержка',
      description: 'Наша преданная команда доступна круглосуточно, чтобы помочь вам с любыми техническими вопросами или проблемами.',
    },
    {
      icon: BarChart4,
      title: 'Масштабируемые решения',
      description: 'От индивидуальных пользователей до крупных предприятий, наши прокси-решения могут масштабироваться для удовлетворения ваших конкретных потребностей.',
    }
  ];

  // Данные для секции Pricing
  const pricingPlans = [
    {
      title: 'Базовый',
      price: '$9',
      features: [
        { name: '5 приватных прокси' },
        { name: '10 стран' },
        { name: '1 ГБ трафика в день' },
        { name: 'Поддержка по email' }
      ],
      popular: false
    },
    {
      title: 'Профессиональный',
      price: '$19',
      features: [
        { name: '20 приватных прокси' },
        { name: '30 стран' },
        { name: '5 ГБ трафика в день' },
        { name: 'Приоритетная поддержка' },
        { name: 'Ротация прокси' }
      ],
      popular: true
    },
    {
      title: 'Корпоративный',
      price: '$49',
      features: [
        { name: '100 приватных прокси' },
        { name: '50+ стран' },
        { name: 'Неограниченный трафик' },
        { name: 'Круглосуточная поддержка' },
        { name: 'Продвинутые функции безопасности' }
      ],
      popular: false
    }
  ];

  // Контактная информация
  const contactInfo = [
    {
      icon: 'mail',
      title: 'Напишите нам',
      description: 'support@shadowlink.com'
    },
    {
      icon: 'phone',
      title: 'Позвоните нам',
      description: '+1 (555) 123-4567'
    },
    {
      icon: 'message-circle',
      title: 'Чат онлайн',
      description: 'Доступен круглосуточно для мгновенной поддержки'
    }
  ];

  return (
    <div>
      {/* Герой секция */}
      <Hero scrollToFeatures={featuresSectionRef} /> {/* Передаем реф в Hero */}
      
      {/* Секция Features */}
      <section ref={featuresSectionRef} id="features" className="py-20 bg-card/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Почему стоит выбрать <span className="text-primary">Shadowlink</span>?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Наши прокси-сервисы предлагают непревзойденную защиту и конфиденциальность для всех ваших онлайн-активностей.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={0.1 * index}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Секция Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Простые и прозрачные <span className="text-primary">цены</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Выберите план, который подходит вам, без скрытых платежей и сложных условий.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
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
        </div>
      </section>
      
      {/* Секция Contact */}
      <section id="contact" className="py-20 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Свяжитесь с <span className="text-primary">нами</span></h2>
                <p className="text-muted-foreground mb-6">Есть вопросы о наших услугах? Наша команда готова помочь вам с любыми вопросами.</p>
              </motion.div>
              
              <div className="space-y-4 mb-8">
                {contactInfo.map((info, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <div className="bg-primary/20 p-3 rounded-lg mr-4">
                      {info.icon === 'mail' && 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      }
                      {info.icon === 'phone' && 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      }
                      {info.icon === 'message-circle' && 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{info.title}</h3>
                      <p className="text-muted-foreground">{info.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="md:w-1/2">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
