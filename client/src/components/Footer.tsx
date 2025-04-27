import React from 'react';
import { Link } from 'wouter';
import Logo from './Logo';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  const companyLinks = [
    { name: 'О нас', href: '#' },
    { name: 'Блог', href: '#' },
    { name: 'Вакансии', href: '#' },
    { name: 'Пресс-кит', href: '#' }
  ];
  
  const supportLinks = [
    { name: 'Центр поддержки', href: '#' },
    { name: 'База знаний', href: '#' },
    { name: 'Статус системы', href: '#' },
    { name: 'Контакт с поддержкой', href: '#' }
  ];
  
  const legalLinks = [
    { name: 'Условия использования', href: '#' },
    { name: 'Политика конфиденциальности', href: '#' },
    { name: 'Политика использования файлов cookie', href: '#' },
    { name: 'Допустимое использование', href: '#' }
  ];
  
  const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Linkedin, href: '#' },
    { icon: Instagram, href: '#' }
  ];
  
  return (
    <footer className="bg-background py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-6">
              <Logo />
            </div>
            <p className="text-muted-foreground mb-6">
              Надежные и анонимные прокси-сервисы для частных лиц и бизнеса по всему миру.
            </p>
            <p className="text-muted-foreground text-sm">
              &copy; {year} Shadowlink. Все права защищены.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Компания</h4>
            <ul className="space-y-2">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>
                    <a className="text-muted-foreground hover:text-primary transition duration-300">
                      {link.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Поддержка</h4>
            <ul className="space-y-2">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>
                    <a className="text-muted-foreground hover:text-primary transition duration-300">
                      {link.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Правовые вопросы</h4>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>
                    <a className="text-muted-foreground hover:text-primary transition duration-300">
                      {link.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <a 
                    key={index}
                    href={link.href}
                    className="bg-primary/20 hover:bg-primary/30 p-3 rounded-full transition duration-300"
                    aria-label={`Социальная сеть ${index + 1}`}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
