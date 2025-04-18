import React from 'react';
import Hero from '@/components/Hero';
import { useLocation, useRoute } from 'wouter';
import { Shield, Zap, Lock, Globe, LifeBuoy, BarChart4 } from 'lucide-react';
import FeatureCard from '@/components/FeatureCard';
import PricingCard from '@/components/PricingCard';
import ContactForm from '@/components/ContactForm';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  // Features section data
  const features = [
    {
      icon: Shield,
      title: 'Complete Anonymity',
      description: 'Your real IP address remains hidden, allowing you to browse the web without leaving traces of your identity.',
    },
    {
      icon: Zap,
      title: 'Lightning Speed',
      description: 'Our proxies are optimized for performance, ensuring minimal impact on your browsing and download speeds.',
    },
    {
      icon: Lock,
      title: 'Enterprise-Grade Security',
      description: 'Our proxies use advanced encryption protocols to protect your data from hackers and surveillance.',
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Connect through servers located in over 50 countries to access geo-restricted content from anywhere.',
    },
    {
      icon: LifeBuoy,
      title: '24/7 Support',
      description: 'Our dedicated team is available around the clock to help you with any technical issues or questions.',
    },
    {
      icon: BarChart4,
      title: 'Scalable Solutions',
      description: 'From individual users to large enterprises, our proxy solutions can scale to meet your specific needs.',
    }
  ];

  // Pricing section data
  const pricingPlans = [
    {
      title: 'Basic',
      price: '$9',
      features: [
        { name: '5 Private Proxies' },
        { name: '10 Countries' },
        { name: '1GB Bandwidth/day' },
        { name: 'Email Support' }
      ],
      popular: false
    },
    {
      title: 'Professional',
      price: '$19',
      features: [
        { name: '20 Private Proxies' },
        { name: '30 Countries' },
        { name: '5GB Bandwidth/day' },
        { name: 'Priority Support' },
        { name: 'Proxy Rotation' }
      ],
      popular: true
    },
    {
      title: 'Enterprise',
      price: '$49',
      features: [
        { name: '100 Private Proxies' },
        { name: '50+ Countries' },
        { name: 'Unlimited Bandwidth' },
        { name: '24/7 Dedicated Support' },
        { name: 'Advanced Security Features' }
      ],
      popular: false
    }
  ];

  // Contact info
  const contactInfo = [
    {
      icon: 'mail',
      title: 'Email Us',
      description: 'support@shadowlink.com'
    },
    {
      icon: 'phone',
      title: 'Call Us',
      description: '+1 (555) 123-4567'
    },
    {
      icon: 'message-circle',
      title: 'Live Chat',
      description: 'Available 24/7 for instant support'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-card/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="text-primary">Shadowlink</span>?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Our proxy services offer unmatched protection and privacy for all your online activities.</p>
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
      
      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent <span className="text-primary">Pricing</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Choose the plan that's right for you, no hidden fees or complicated terms.</p>
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
      
      {/* Contact Section */}
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
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Get in <span className="text-primary">Touch</span></h2>
                <p className="text-muted-foreground mb-6">Have questions about our services? Our team is ready to assist you with anything you need.</p>
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
