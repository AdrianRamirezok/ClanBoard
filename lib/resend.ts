import { Resend } from 'resend'

// Cliente de Resend para envío de emails transaccionales.
// La API key se lee de RESEND_API_KEY (ver .env.local).
export const resend = new Resend(process.env.RESEND_API_KEY)

// Remitente verificado por defecto de Resend (no requiere dominio propio).
export const EMAIL_FROM = 'ClanBoard <noreply@hydrovision.com.ar>'
