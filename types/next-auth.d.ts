import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      slug: string
      email: string
      name: string
      business_name: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    slug: string
    email: string
    name: string
    business_name: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    slug: string
    email: string
    name: string
    business_name: string
  }
}
