import React from 'react';
import PricingCard from '@/components/PricingCard';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from 'lucide-react';

const Pricing: React.FC = () => {
  // Monthly pricing plans
  const monthlyPlans = [
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

  // Yearly pricing plans (with discount)
  const yearlyPlans = [
    {
      title: 'Basic',
      price: '$90',
      features: [
        { name: '5 Private Proxies' },
        { name: '10 Countries' },
        { name: '1GB Bandwidth/day' },
        { name: 'Email Support' },
        { name: '2 Months Free' }
      ],
      popular: false
    },
    {
      title: 'Professional',
      price: '$190',
      features: [
        { name: '20 Private Proxies' },
        { name: '30 Countries' },
        { name: '5GB Bandwidth/day' },
        { name: 'Priority Support' },
        { name: 'Proxy Rotation' },
        { name: '2 Months Free' }
      ],
      popular: true
    },
    {
      title: 'Enterprise',
      price: '$490',
      features: [
        { name: '100 Private Proxies' },
        { name: '50+ Countries' },
        { name: 'Unlimited Bandwidth' },
        { name: '24/7 Dedicated Support' },
        { name: 'Advanced Security Features' },
        { name: '2 Months Free' }
      ],
      popular: false
    }
  ];

  // Compare features
  const compareFeatures = [
    { name: 'Private Proxies', basic: '5', pro: '20', enterprise: '100' },
    { name: 'Countries', basic: '10', pro: '30', enterprise: '50+' },
    { name: 'Bandwidth', basic: '1GB/day', pro: '5GB/day', enterprise: 'Unlimited' },
    { name: 'Support', basic: 'Email', pro: 'Priority', enterprise: '24/7 Dedicated' },
    { name: 'Proxy Rotation', basic: false, pro: true, enterprise: true },
    { name: 'API Access', basic: false, pro: true, enterprise: true },
    { name: 'Dedicated IPs', basic: false, pro: true, enterprise: true },
    { name: 'IP Authentication', basic: true, pro: true, enterprise: true },
    { name: 'Multiple Subnets', basic: false, pro: true, enterprise: true },
    { name: 'Advanced Security', basic: false, pro: false, enterprise: true }
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent <span className="text-primary">Pricing</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that's right for you. No hidden fees, no complicated terms, and full feature access on all plans.
          </p>
        </motion.div>
        
        <Tabs defaultValue="monthly" className="w-full mb-16">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-64 grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly (Save 16%)</TabsTrigger>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Compare Plans</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 px-6 text-left">Feature</th>
                  <th className="py-4 px-6 text-center">Basic</th>
                  <th className="py-4 px-6 text-center">Professional</th>
                  <th className="py-4 px-6 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {compareFeatures.map((feature, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-4 px-6 font-medium">{feature.name}</td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.basic === 'boolean' ? 
                        (feature.basic ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>) : 
                        feature.basic
                      }
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.pro === 'boolean' ? 
                        (feature.pro ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>) : 
                        feature.pro
                      }
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof feature.enterprise === 'boolean' ? 
                        (feature.enterprise ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>) : 
                        feature.enterprise
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
          <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We offer tailored proxy packages for businesses with specific requirements. 
            Contact our sales team to discuss your needs.
          </p>
          <div className="text-primary font-semibold">
            sales@shadowlink.com | +1 (555) 987-6543
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
