import * as z from 'zod'
export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(3, 'The name should have minimum 3 characters')
    .max(100),
  email: z.string().email(),
  password: z.string().min(8, 'The password should have minimum 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'The password should have minimum 8 characters')
    .max(100),
})


export const searchSchema=z.object({
  query:z.string().min(1)
})