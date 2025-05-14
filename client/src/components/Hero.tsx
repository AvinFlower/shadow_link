import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Hero: React.FC<{ scrollToFeatures: React.RefObject<HTMLDivElement> }> = ({ scrollToFeatures }) => {
  const scrollToSection = () => {
    if (scrollToFeatures.current) {
      scrollToFeatures.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-36 pb-20 md:pt-48 md:pb-32 relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-2/3 mb-12 md:mb-0">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            >
              Защищённые и анонимные<br/>
              <span className="text-primary">Прокси-сервисы</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8"
            >
              Покупайте приватные прокси для защиты вашей онлайн-активности и сохранения анонимности.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-full px-8 py-6 transition duration-300 transform hover:scale-105"
                onClick={scrollToSection} // Используем реф для прокрутки
              >
                Начать
              </Button>
            </motion.div>
          </div>
          
          <motion.div 
            className="md:w-1/3 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 bg-gradient-radial from-primary to-transparent opacity-10 rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 text-primary"> {/* Это иконка или изображение */} </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
