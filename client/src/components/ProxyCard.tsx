// import React, { useState, useMemo, useEffect } from "react";
// import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { AiOutlineCopy } from 'react-icons/ai';
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
//   } from "@/components/ui/form";
//   import { Input } from "@/components/ui/input";
//   import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardFooter,
//     CardHeader,
//     CardTitle,
//   } from "@/components/ui/card";
//   import {
//     Tabs,
//     TabsContent,
//     TabsList,
//     TabsTrigger,
//   } from "@/components/ui/tabs";
//   import {
//     Loader2,
//     User,
//     Shield,
//     CreditCard,
//     Globe,
//     Server,
//   } from "lucide-react";
//   import { motion } from "framer-motion";

// const ProxyCard = ({ cfg, i, status, colorClass, statusText }) => {
//     const { time, color } = getRemainingTime(cfg.expiration_date);
  
//     return (
//       <Card className="text-sm">
//         <CardHeader className="flex justify-between p-2">
//           <CardTitle className="flex items-center justify-between">
//             <div className="flex items-center gap-1">
//               <Server className={`h-4 w-4 ${colorClass}`} />
//               #{i + 1}
//             </div>
//             <span className={`text-xs px-2 py-0.5 rounded-lg ${colorClass}/10 ${colorClass}`}>
//               {statusText}
//             </span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-1 px-2 pb-2">
//           <div className="flex justify-between items-center">
//             <span className="text-gray-400">Ссылка:</span>
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button variant="ghost" size="icon">
//                   <AiOutlineCopy className={colorClass} />
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-[260px] p-2 text-sm">
//                 <div className="space-y-2">
//                   <div className="text-muted-foreground">
//                     Копировать ссылку
//                   </div>
//                   <div className="break-all">{cfg.config_link}</div>
//                   <Button
//                     size="sm"
//                     variant="secondary"
//                     onClick={() => navigator.clipboard.writeText(cfg.config_link)}
//                   >
//                     Скопировать
//                   </Button>
//                 </div>
//               </PopoverContent>
//             </Popover>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-400">Создан:</span>
//             <span>{new Date(cfg.created_at).toLocaleDateString()}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-400">Истекает:</span>
//             <span>{new Date(cfg.expiration_date).toLocaleDateString()}</span>
//           </div>
//           {status === "active" && (
//             <div className="flex justify-between">
//               <span className="text-gray-400">Осталось:</span>
//               <span className={color}>{time}</span>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     );
//   };
  