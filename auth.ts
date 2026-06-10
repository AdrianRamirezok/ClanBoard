import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

console.log('[auth.ts] ENV check:', {
  AUTH_SECRET: process.env.AUTH_SECRET ? '✓ set' : '✗ missing',
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ? '✓ set' : '✗ missing',
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ? '✓ set' : '✗ missing',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? '✗ missing',
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user?.password) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!valid) return null

        return { id: user.id, email: user.email }
      },
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
