import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import pool from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Authenticate
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify slug matches
    if (auth.slug !== params.slug) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as 'avatar' | 'cover'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Convert file to base64 for storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Update provider record
    const columnName = type === 'avatar' ? 'avatar_url' : 'cover_photo_url'
    await pool.query(
      `UPDATE service_providers SET ${columnName} = $1 WHERE id = $2`,
      [dataUrl, auth.providerId]
    )

    return NextResponse.json({
      url: dataUrl,
      message: `${type === 'avatar' ? 'Avatar' : 'Cover photo'} uploaded successfully`
    })
  } catch (error: any) {
    console.error('Photo upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
