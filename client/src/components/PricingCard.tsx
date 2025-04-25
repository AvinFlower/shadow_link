import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PricingFeature {
  name: string;
}

interface PricingCardProps {
  title: string;
  price: string;
  features: PricingFeature[];
  popular?: boolean;
  delay?: number;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  title, 
  price, 
  features,
  popular = false,
  delay = 0
}) => {
  return (
    <motion.div 
      className={`${
        popular 
          ? "bg-gradient-to-b from-background to-card relative transform transition-all duration-300 hover:scale-105 z-10 shadow-xl border-2 border-primary" 
          : "bg-background border border-border transition-all duration-300 hover:border-primary"
      } p-8 rounded-xl`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-lg rounded-tr-lg font-medium text-sm">
          MOST POPULAR
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <div className="flex justify-center items-end">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground ml-1">/month</span>
        </div>
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="h-5 w-5 text-primary mr-2" />
            <span className={popular ? "text-foreground" : "text-muted-foreground"}>{feature.name}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        variant={popular ? "default" : "outline"} 
        className={`w-full ${
          popular 
            ? "bg-primary hover:bg-primary/80 text-primary-foreground" 
            : "border-primary text-primary hover:bg-card"
        } font-medium rounded-full px-6 py-3`}
      >
        Choose Plan
      </Button>
    </motion.div>
  );
};

export default PricingCard;
