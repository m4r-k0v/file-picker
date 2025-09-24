import { z } from 'zod';


const envSchema = z.object({
  
  NEXT_PUBLIC_STACK_AI_API_URL: z.string().url().optional().default('https://api.stack-ai.com'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});


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


export const env = validateEnv();


export type Env = z.infer<typeof envSchema>;