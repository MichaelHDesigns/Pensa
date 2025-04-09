import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Wallets table
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  publicKey: text("public_key").notNull().unique(),
  // Encrypted private key (should never be stored in plain text)
  encryptedPrivateKey: text("encrypted_private_key").notNull(),
  // Encrypted mnemonic phrase (should never be stored in plain text)
  encryptedMnemonic: text("encrypted_mnemonic"),
  name: text("name").default("My Wallet"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  publicKey: true,
  encryptedPrivateKey: true,
  encryptedMnemonic: true,
  name: true,
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletPublicKey: text("wallet_public_key").notNull(),
  signature: text("signature").notNull().unique(),
  type: text("type").notNull(), // 'send', 'receive', 'swap'
  amount: text("amount").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  status: text("status").notNull().default("confirmed"), // 'confirmed', 'pending', 'failed'
  timestamp: timestamp("timestamp").defaultNow(),
  details: jsonb("details"), // Additional transaction details
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  walletPublicKey: true,
  signature: true,
  type: true,
  amount: true,
  tokenSymbol: true,
  fromAddress: true,
  toAddress: true,
  status: true,
  details: true,
});

// Swap records
export const swaps = pgTable("swaps", {
  id: serial("id").primaryKey(),
  walletPublicKey: text("wallet_public_key").notNull(),
  signature: text("signature").notNull().unique(),
  fromToken: text("from_token").notNull(),
  toToken: text("to_token").notNull(),
  fromAmount: text("from_amount").notNull(),
  toAmount: text("to_amount").notNull(),
  rate: text("rate").notNull(),
  status: text("status").notNull().default("completed"), // 'completed', 'pending', 'failed'
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertSwapSchema = createInsertSchema(swaps).pick({
  walletPublicKey: true,
  signature: true,
  fromToken: true,
  toToken: true,
  fromAmount: true,
  toAmount: true,
  rate: true,
  status: true,
});

// Define types for the tables
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertSwap = z.infer<typeof insertSwapSchema>;
export type Swap = typeof swaps.$inferSelect;
