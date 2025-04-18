import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: "shadowlink-secret-key", // В реальном проекте следует использовать переменные окружения
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 часа
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        // Обновляем lastLogin при успешном входе
        if (user.id) {
          storage.updateUser(user.id, { lastLogin: new Date() });
        }
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ error: "Имя пользователя уже существует" });
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      
      // Удаляем пароль из ответа
      const userResponse = { ...user };
      delete userResponse.password;
      
      res.status(201).json(userResponse);
    });
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: SelectUser) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: "Неверное имя пользователя или пароль" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Удаляем пароль из ответа
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.status(200).json(userResponse);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Удаляем пароль из ответа
    const userResponse = { ...req.user };
    delete userResponse.password;
    
    res.json(userResponse);
  });
  
  // API для обновления профиля пользователя
  app.post("/api/profile", (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Необходимо войти в систему" });
    
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: "Некорректный ID пользователя" });
    
    // Обновляем только допустимые поля, игнорируя id и другие системные поля
    const { fullName, email } = req.body;
    
    storage.updateUser(userId, { fullName, email })
      .then(user => {
        if (!user) {
          return res.status(404).json({ error: "Пользователь не найден" });
        }
        
        // Удаляем пароль из ответа
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.json(userResponse);
      })
      .catch(err => next(err));
  });
  
  // API для пополнения кредитов прокси
  app.post("/api/proxy-credits", (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Необходимо войти в систему" });
    
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ error: "Некорректный ID пользователя" });
    
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: "Некорректная сумма пополнения" });
    }
    
    storage.updateUserCredits(userId, amount)
      .then(user => {
        if (!user) {
          return res.status(404).json({ error: "Пользователь не найден" });
        }
        
        // Удаляем пароль из ответа
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.json(userResponse);
      })
      .catch(err => next(err));
  });
}