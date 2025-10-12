import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

// Input validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores')
})

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               fullName:
 *                 type: string
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 20
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     username:
 *                       type: string
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Internal server error
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = signupSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password, fullName, username } = validation.data

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email or username already in use' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
          emailRedirectTo: '',
        },
      },
    })

    if (authError) {
      console.error('Signup error:', authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Failed to create user')
    }

    // const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    // if (sessionError || !session) {
    //   throw new Error('Not authenticated');
    // }

    // Create user profile in the database
    // const { data: profile, error: profileError } = await supabase
    //   .from('profiles')
    //   .insert([
    //     {
    //       id: authData.user.id,
    //       updated_at: new Date().toISOString(),
    //       username: username,
    //       full_name: fullName,
    //       avatar_url: ''
    //     },
    //   ]).select()

    // if (profileError) {
    //   console.error('Profile creation error:', profileError)
    //   throw new Error('Failed to create user profile')
    // }

    return NextResponse.json(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName,
          username,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Add OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}