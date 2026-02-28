import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import pool from "@/lib/db"
import bcrypt from "bcrypt"

console.log('[NextAuth] Initializing with:', {
  hasSecret: !!process.env.NEXTAUTH_SECRET,
  hasUrl: !!process.env.NEXTAUTH_URL,
  hasDbUrl: !!process.env.DATABASE_URL,
})

const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          console.log('[NextAuth] Authorize attempt for:', credentials.email)

          // Find provider by email
          const result = await pool.query(
            'SELECT id, slug, name, business_name, email, password FROM service_providers WHERE email = $1',
            [credentials.email]
          )

          console.log('[NextAuth] Query result:', { found: result.rows.length > 0 })

          if (result.rows.length === 0) {
            console.log('[NextAuth] No user found')
            return null
          }

          const provider = result.rows[0]

          // Check if password exists (OAuth users might not have password)
          if (!provider.password) {
            console.log('[NextAuth] No password set for user')
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, provider.password)

          console.log('[NextAuth] Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            return null
          }

          console.log('[NextAuth] Auth successful for user:', provider.id)

          return {
            id: provider.id.toString(),
            email: provider.email,
            name: provider.name,
            slug: provider.slug,
            business_name: provider.business_name,
          }
        } catch (error) {
          console.error('[NextAuth] Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Update last login for email/password users
      if (account?.provider === "credentials") {
        try {
          await pool.query(
            'UPDATE service_providers SET last_login_at = NOW() WHERE id = $1',
            [parseInt(user.id)]
          )
        } catch (error) {
          console.error('Login tracking error:', error)
          // Don't fail sign in if tracking fails
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.slug = user.slug
        token.email = user.email
        token.name = user.name
        token.business_name = user.business_name
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id as string
        session.user.slug = token.slug as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.business_name = token.business_name as string
      }
      return session
    }
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
