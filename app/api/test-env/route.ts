import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
    nodeEnv: process.env.NODE_ENV,
  })
}
