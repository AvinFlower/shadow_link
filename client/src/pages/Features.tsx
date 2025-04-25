import React from 'react';
import { Shield, Zap, Lock, Globe, LifeBuoy, BarChart4, Server, Clock, RefreshCw, Database, Layers, Users, Key } from 'lucide-react';
import FeatureCard from '@/components/FeatureCard';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Features: React.FC = () => {
  // Extended features list
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
    },
    {
      icon: Server,
      title: 'Dedicated Servers',
      description: 'Get exclusive use of proxy servers for maximum performance and security for your business.',
    },
    {
      icon: Clock,
      title: 'Unlimited Duration',
      description: 'No time limits on proxy usage - keep your connections active as long as you need them.',
    },
    {
      icon: RefreshCw,
      title: 'Automatic Rotation',
      description: 'Our system can automatically rotate your proxy IPs at specified intervals for enhanced anonymity.',
    },
    {
      icon: Database,
      title: 'Extensive Locations',
      description: 'Choose from a vast network of proxy servers located in cities around the world.',
    },
    {
      icon: Layers,
      title: 'Multiple Protocols',
      description: 'Support for HTTP, HTTPS, SOCKS4, and SOCKS5 protocols to meet all your proxy needs.',
    },
    {
      icon: Users,
      title: 'Concurrent Connections',
      description: 'Connect multiple devices simultaneously with our multi-user proxy plans.',
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our <span className="text-primary">Features</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the comprehensive set of features that make Shadowlink the leading choice for secure proxy services.
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
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Advanced Security Technology</h2>
              <p className="text-muted-foreground mb-4">
                Our proxy servers utilize military-grade encryption and cutting-edge security measures to ensure your data remains private and protected from threats.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <Key className="h-5 w-5 text-primary mr-2" />
                  <span>256-bit AES encryption</span>
                </li>
                <li className="flex items-center">
                  <Key className="h-5 w-5 text-primary mr-2" />
                  <span>SSL/TLS secure connections</span>
                </li>
                <li className="flex items-center">
                  <Key className="h-5 w-5 text-primary mr-2" />
                  <span>No-logs policy</span>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to experience the difference?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Shadowlink for their online privacy and security needs.
          </p>
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-full px-8 py-6 transition duration-300 transform hover:scale-105"
          >
            Get Started Today
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;
