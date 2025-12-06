import { z } from "zod"

// Schema for Pterodactyl Configuration
export const PterodactylConfigSchema = z.object({
  domain: z.string().url("Domain harus berupa URL yang valid").min(1),
  apiKey: z.string().min(1, "API Key tidak boleh kosong"),
  nests: z.string().min(1, "Nests ID tidak boleh kosong"),
  nestsGame: z.string().optional(),
  egg: z.string().min(1, "Egg ID tidak boleh kosong"),
  eggSamp: z.string().optional(),
  location: z.string().min(1, "Location ID tidak boleh kosong"),
})

// Schema for App Configuration
export const AppConfigSchema = z.object({
  nameHost: z.string().min(1, "Nama Host tidak boleh kosong"),
  whatsappGroupLink: z.string().url("Link WhatsApp harus berupa URL yang valid").optional(),
  feeMin: z.number().min(0, "Fee minimal tidak boleh negatif"),
  feeMax: z.number().min(0, "Fee maksimal tidak boleh negatif"),
  garansi: z.object({
    warrantyDays: z.number().min(0, "Hari garansi tidak boleh negatif"),
    replaceLimit: z.number().min(0, "Limit claim tidak boleh negatif"),
  }).optional(),
  pay: z.object({
    api_key: z.string().min(1, "API Key pembayaran tidak boleh kosong"),
    api_id: z.string().min(1, "API ID pembayaran tidak boleh kosong"),
  }).optional(),
  emailSender: z.object({
    host: z.string().min(1, "Email host tidak boleh kosong"),
    port: z.number().default(587),
    secure: z.boolean().default(false),
    auth: z.object({
      user: z.string().email("Email user harus valid"),
      pass: z.string().min(1, "Password email tidak boleh kosong"),
    }),
    from: z.string().min(1, "Email dari tidak boleh kosong"),
  }).optional(),
  telegram: z.object({
    botToken: z.string().min(1, "Bot token tidak boleh kosong"),
    ownerId: z.string().min(1, "Owner ID tidak boleh kosong"),
  }).optional(),
  mongodb: z.object({
    uri: z.string().min(1, "MongoDB URI tidak boleh kosong"),
    dbName: z.string().min(1, "DB name tidak boleh kosong"),
  }).optional(),
  socialMedia: z.object({
    whatsapp: z.string().url().optional(),
    telegram: z.string().url().optional(),
    tiktok: z.string().url().optional(),
    instagram: z.string().url().optional(),
  }).optional(),
})

// Combined Settings Schema
export const SettingsSchema = z.object({
  _id: z.string().optional(),
  pterodactylConfig: PterodactylConfigSchema.optional(),
  appConfig: AppConfigSchema.optional(),
  updatedAt: z.date().optional(),
})

export type PterodactylConfig = z.infer<typeof PterodactylConfigSchema>
export type AppConfig = z.infer<typeof AppConfigSchema>
export type Settings = z.infer<typeof SettingsSchema>

export function validateSettings(data: unknown) {
  const result = SettingsSchema.safeParse(data)
  return result
}

export function getValidationErrors(errors: z.ZodError) {
  return errors.flatten().fieldErrors
}
