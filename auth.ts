import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

console.log('[auth.ts] ENV check:', {
  AUTH_SECRET: process.env.AUTH_SECRET ? '✓ set' : '✗ missing',
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ? '✓ set' : '✗ missing',
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ? '✓ set' : '✗ missing',
  RESEND_API_KEY: process.env.RESEND_API_KEY ? '✓ set' : '✗ missing',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? '✗ missing',
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Resend({
      from: 'ClanBoard <noreply@hydrovision.com.ar>',
      apiKey: process.env.RESEND_API_KEY,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
        const perfil = await prisma.perfil.findUnique({
          where: { userId: token.sub },
          select: { id: true },
        })
        session.user.hasProfile = !!perfil
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
})
