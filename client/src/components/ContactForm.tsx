import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Имя должно содержать хотя бы 2 символа' }),
  email: z.string().email({ message: 'Пожалуйста, введите правильный адрес электронной почты' }),
  subject: z.string().min(1, { message: 'Пожалуйста, выберите тему' }),
  message: z.string().min(10, { message: 'Сообщение должно содержать хотя бы 10 символов' })
});

type ContactFormValues = z.infer<typeof formSchema>;

const ContactForm: React.FC = () => {
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  function onSubmit(data: ContactFormValues) {
    console.log(data);
    toast({
      title: "Сообщение отправлено",
      description: "Спасибо за ваше сообщение. Мы свяжемся с вами в ближайшее время.",
    });
    form.reset();
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-background p-8 rounded-xl border border-border"
    >
      <h3 className="text-xl font-semibold mb-6">Отправьте нам сообщение</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ваше имя</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Иван Иванов" 
                    className="bg-card border border-border focus:border-primary" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Адрес электронной почты</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="ivan@example.com" 
                    className="bg-card border border-border focus:border-primary" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тема</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-card border border-border focus:border-primary">
                      <SelectValue placeholder="Выберите тему" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">Общий вопрос</SelectItem>
                    <SelectItem value="technical">Техническая поддержка</SelectItem>
                    <SelectItem value="billing">Вопрос по оплате</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ваше сообщение</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Как мы можем вам помочь?" 
                    className="bg-card border border-border focus:border-primary focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2" 
                    rows={4} 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-medium rounded-lg px-5 py-3 transition duration-300"
          >
            Отправить сообщение
          </Button>
        </form>
      </Form>
    </motion.div>
  );
};

export default ContactForm;