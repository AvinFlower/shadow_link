import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Настраиваем авторизацию и маршруты авторизации
  setupAuth(app);

  // API для получения информации о прокси сервисах (публичный)
  app.get("/api/proxy-services", (req, res) => {
    const services = [
      {
        id: 1,
        name: "Basic Proxy",
        description: "Базовый прокси-сервис для обычного серфинга",
        price: 5,
        credits: 100
      },
      {
        id: 2,
        name: "Premium Proxy",
        description: "Премиум прокси с высокой скоростью и поддержкой",
        price: 15,
        credits: 500
      },
      {
        id: 3,
        name: "Enterprise Proxy",
        description: "Корпоративный прокси с выделенными IP-адресами",
        price: 50,
        credits: 2000
      }
    ];
    
    res.json(services);
  });
  
  // Защищенный маршрут для получения прокси-серверов пользователя
  app.get("/api/my-proxies", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Необходимо войти в систему" });
    }
    
    // Здесь может быть логика получения прокси-серверов пользователя из базы данных
    // Для демонстрации возвращаем заглушку
    const proxies = [
      {
        id: 101,
        ip: "185.123.xxx.xxx",
        port: 8080,
        country: "Netherlands",
        status: "active",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 дней
      }
    ];
    
    res.json(proxies);
  });

  const httpServer = createServer(app);

  return httpServer;
}
