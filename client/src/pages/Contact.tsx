import React from 'react';
import ContactForm from '@/components/ContactForm';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageSquare, MapPin, Clock, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Contact: React.FC = () => {
  // Contact info with more details
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'support@shadowlink.com',
      details: 'We typically respond within 24 hours'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: '+1 (555) 123-4567',
      details: 'Mon-Fri, 9am-5pm EST'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Available 24/7 for instant support',
      details: 'Average response time: 2 minutes'
    }
  ];

  // Office locations
  const officeLocations = [
    {
      city: 'New York',
      address: '123 Tech Plaza, Suite 400, New York, NY 10001',
      phone: '+1 (555) 123-4567'
    },
    {
      city: 'London',
      address: '456 Digital Avenue, Floor 3, London, UK EC2A 1AB',
      phone: '+44 20 1234 5678'
    },
    {
      city: 'Singapore',
      address: '789 Cyber Street, #10-01, Singapore 049315',
      phone: '+65 6123 4567'
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in <span className="text-primary">Touch</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our services? Our team is ready to assist you with anything you need.
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
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold mb-4">Office Locations</h3>
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
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
              <div className="flex mb-2">
                <Clock className="h-5 w-5 text-primary mr-4" />
                <div>
                  <p className="text-foreground">Monday - Friday: 9:00 AM - 5:00 PM EST</p>
                  <p className="text-foreground">Saturday - Sunday: Closed</p>
                </div>
              </div>
              <p className="text-muted-foreground mt-2">
                * Technical support is available 24/7 through our live chat and email.
              </p>
            </motion.div>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Find quick answers to common questions about our proxy services.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-2">How do I get started with Shadowlink?</h3>
              <p className="text-muted-foreground">
                Simply select a plan that suits your needs, create an account, and complete the payment process. Your proxies will be provisioned instantly.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-2">Are your proxies compatible with all websites?</h3>
              <p className="text-muted-foreground">
                Our proxies work with most websites and online services. For specialized needs, contact our support team for custom configurations.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and cryptocurrency payments including Bitcoin, Ethereum, and Litecoin.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold mb-2">Can I upgrade my plan later?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade your plan at any time. We'll prorate the cost based on your remaining subscription period.
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Enterprise Solutions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Need a custom solution for your organization? Our team can create a tailored package that meets your specific requirements.
          </p>
          <p className="text-lg font-medium">
            Contact our enterprise sales team: <span className="text-primary">enterprise@shadowlink.com</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
