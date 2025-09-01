import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username è obbligatorio'),
  password: z.string().min(1, 'Password è obbligatoria'),
});

export type LoginFormInputs = z.infer<typeof loginSchema>;