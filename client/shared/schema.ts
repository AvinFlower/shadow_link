import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Определение таблицы пользователей
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  full_name: text("full_name").notNull(),
  birth_date: text("birth_date").notNull(),
  role: text("role").default("user"),
  proxyCredits: integer("proxy_credits").default(0),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Схема для вставки нового пользователя с валидацией через zod
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  full_name: true,
  birth_date: true,
});

export const userSchema = insertUserSchema.extend({
  birth_date: z.string(),
});

export type InsertUser = z.infer<typeof userSchema>;
export type User = typeof users.$inferSelect;
