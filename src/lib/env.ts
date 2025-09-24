import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Public environment variables (accessible in browser)
  NEXT_PUBLIC_STACK_AI_API_URL: z.string().url().optional().default('https://api.stack-ai.com'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Server-only environment variables
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Parse and validate environment variables
function validateEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_STACK_AI_API_URL: process.env.NEXT_PUBLIC_STACK_AI_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

// Export validated environment variables
export const env = validateEnv();

// Type-safe environment variable access
export type Env = z.infer<typeof envSchema>;