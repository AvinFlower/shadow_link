import React from 'react';
import ContactForm from '@/components/ContactForm';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageSquare, MapPin, Clock, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Contact: React.FC = () => {
  // Информация для связи с подробностями
  const contactInfo = [
    {
      icon: Mail,
      title: 'Напишите нам',
      description: 'shadowlink@tutamail.com',
      details: 'Обычно отвечаем в течение 24 часов'
    },
    {
      icon: Phone,
      title: 'Позвоните нам',
      description: '+7 (912) 736-6610',
      details: 'Пн-Пт, 9:00-17:00 по МСК'
    },
    {
      icon: MessageSquare,
      title: 'Telegram чат',
      description: '7/0, 9:00-20:00 по МСК',
      details: 'Среднее время ответа: 10 минут'
    }
  ];

  // Офисные локации
  // const officeLocations = [
  //   {
  //     city: 'Нью-Йорк',
  //     address: '123 Tech Plaza, Suite 400, Нью-Йорк, NY 10001',
  //     phone: '+1 (555) 123-4567'
  //   },
  //   {
  //     city: 'Лондон',
  //     address: '456 Digital Avenue, Floor 3, Лондон, Великобритания EC2A 1AB',
  //     phone: '+44 20 1234 5678'
  //   },
  //   {
  //     city: 'Сингапур',
  //     address: '789 Cyber Street, #10-01, Сингапур 049315',
  //     phone: '+65 6123 4567'
  //   }
  // ];

  return (
    <div className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Свяжитесь с <span className="text-primary">нами</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Есть вопросы о наших услугах? Наша команда готова помочь вам в любое время.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <div className="bg-primary/20 p-3 rounded-lg mr-4">
                    <info.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{info.title}</h3>
                    <p className="text-foreground">{info.description}</p>
                    <p className="text-muted-foreground text-sm mt-1">{info.details}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold mb-4">Офисы</h3>
              <div className="space-y-6">
                {officeLocations.map((location, index) => (
                  <div key={index} className="flex">
                    <div className="mr-4">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{location.city}</h4>
                      <p className="text-muted-foreground text-sm">{location.address}</p>
                      <p className="text-muted-foreground text-sm">{location.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div> */}
            
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold mb-4">Рабочие часы</h3>
              <div className="flex mb-2">
                <Clock className="h-5 w-5 text-primary mr-4" />
                <div>
                  <p className="text-foreground">Понедельник - Пятница: 9:00 AM - 5:00 PM EST</p>
                  <p className="text-foreground">Суббота - Воскресенье: Закрыто</p>
                </div>
              </div>
              <p className="text-muted-foreground mt-2">
                * Техническая поддержка доступна 24/7 через наш живой чат и email.
              </p>
            </motion.div> */}
          </div>
          
          <div>
            <ContactForm />
          </div>
        </div>
        
        <Separator className="my-16" />
        
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Часто задаваемые вопросы</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Найдите быстрые ответы на часто задаваемые вопросы о наших прокси-сервисах.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-2">Как начать работу с Shadowlink?</h3>
              <p className="text-muted-foreground">
                Просто выберите план, который соответствует вашим потребностям, создайте аккаунт и завершите процесс оплаты. Ваши прокси будут предоставлены мгновенно.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-2">Совместимы ли ваши прокси с любыми сайтами?</h3>
              <p className="text-muted-foreground">
                Наши прокси работают с большинством сайтов и онлайн-сервисов. Для специализированных нужд свяжитесь с нашей службой поддержки для настройки.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-2">Какие способы оплаты вы принимаете?</h3>
              <p className="text-muted-foreground">
                Мы принимаем все основные кредитные карты, банковские карты РФ, а также электронный доллар(USDT).
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-2">Могу ли я обновить свой план позже?</h3>
              <p className="text-muted-foreground">
                Да, вы можете обновить план в любое время. Мы пропорционально пересчитаем стоимость в зависимости от оставшегося периода подписки.
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-card p-8 md:p-12 rounded-xl border border-border text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Users className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Решения для бизнеса</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Нужен индивидуальный пакет для вашей организации? Наша команда может создать решение, соответствующее вашим требованиям.
          </p>
          <p className="text-lg font-medium">
            Свяжитесь с нашей командой по корпоративным продажам: <span className="text-primary">shadowlink@tutamail.com | +7 (912) 736-6610</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
