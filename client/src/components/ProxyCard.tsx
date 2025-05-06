import React, { useState, useMemo, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { AiOutlineCopy, AiOutlineCheck } from 'react-icons/ai'; // Импортируем иконки
import { cn } from "@/lib/utils"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Server } from "lucide-react";
import { GetConfigResponse } from "@/hooks/use-auth"; // Путь к файлу с типами, где определён GetConfigResponse


  const getRemainingTime = (expirationDate: string | Date): { time: string, color: string } => {
    const now = new Date();
    const exp = new Date(expirationDate);
    const diffMs = exp.getTime() - now.getTime();
  
    if (diffMs <= 0) return { time: "Истек", color: "text-red-500" };
  
    const rtf = new Intl.RelativeTimeFormat("ru", { numeric: "always" });
  
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
  
    let remainingTime = "";
    let color = "text-green-500"; // Default color (green)
  
    if (diffDays > 0) {
      remainingTime = `${diffDays} дней`;
  
      // Цветовые условия
      if (diffDays <= 3) color = "text-red-500"; // Красный, если осталось 3 дня или меньше
      else if (diffDays <= 7) color = "text-yellow-500"; // Жёлтый, если осталось 4-7 дней
    } else if (diffHours > 0) {
      remainingTime = `${diffHours} часов`;
  
      // Цветовые условия
      if (diffHours <= 3) color = "text-red-500"; // Красный, если осталось 3 часа или меньше
      else if (diffHours <= 6) color = "text-yellow-500"; // Жёлтый, если осталось 4-6 часов
    } else {
      remainingTime = `${diffMinutes} минут`;
  
      // Цветовые условия
      if (diffMinutes <= 15) color = "text-red-500"; // Красный, если осталось 15 минут или меньше
      else if (diffMinutes <= 30) color = "text-yellow-500"; // Жёлтый, если осталось 15-30 минут
    }
  
    return { time: remainingTime, color };
  };

  export const ProxyCard: React.FC<{
    cfg: GetConfigResponse[0];
    i: number;
    status: "active" | "expired";
    colorClass: string;
    statusText: string;
  }> = ({ cfg, i, status, colorClass, statusText }) => {
    const [copied, setCopied] = useState(false);
  
    const handleCopy = () => {
      navigator.clipboard.writeText(cfg.config_link);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1000); // Сбрасываем состояние через 1 секунду
    };
  
    return (
      <Card className="text-sm">
        <CardHeader className="flex justify-between p-2">
          <CardTitle className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <Server className={`h-4 w-4 ${status === "active" ? "text-green-500" : "text-red-500"}`} />
              <span className={`${status === "active" ? "text-green-500" : "text-red-500"} font-semibold`}>
                #{i + 1}
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-lg ${status === "active" ? "bg-green-500/10" : "bg-red-500/10"} ${status === "active" ? "text-green-500" : "text-red-500"}`}>
              {statusText}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-2 pb-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Ссылка:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className={`text-black ${status === "active" ? "text-green-500" : "text-red-500"}`}>
                  <AiOutlineCopy className={`${status === "active" ? "text-green-500" : "text-red-500"}`} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-2 text-sm">
                <div className="space-y-2">
                  <div className="break-all">{cfg.config_link}</div>
                  <Button
                    size="sm"
                    variant={null}
                    className="w-full relative bg-primary hover:bg-primary/90 text-black"
                    onClick={handleCopy}
                  >
                    <span
                      className={cn(
                        "transition-all duration-300 !text-black",
                        copied && "opacity-0 absolute"
                      )}
                    >
                      Скопировать
                    </span>
                    <AiOutlineCheck
                      className={cn(
                        "transition-all duration-300 text-black",
                        copied ? "opacity-100" : "opacity-0 absolute"
                      )}
                    />
                  </Button>

                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Создан:</span>
            <span>{new Date(cfg.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Истекает:</span>
            <span>{new Date(cfg.expiration_date).toLocaleDateString()}</span>
          </div>
          {status === "active" && (
            <div className="flex justify-between">
              <span className="text-gray-400">Осталось:</span>
              <span className={getRemainingTime(cfg.expiration_date).color}>
                {getRemainingTime(cfg.expiration_date).time}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };