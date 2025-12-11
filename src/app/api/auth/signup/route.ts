import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse
} from '@/types/api-response'

// Input validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
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
 *               - phone
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
 *               phone:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 15
 *                 description: Phone number in international format (e.g., +1234567890)
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
 *                     phone:
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
      const errors = validation.error.issues.reduce<Record<string, string[]>>((acc, issue) => {
        const path = issue.path.join('.')
        if (!acc[path]) {
          acc[path] = []
        }
        acc[path].push(issue.message)
        return acc
      }, {})
      
      return validationErrorResponse('Validation failed', errors)
    }

    const { email, password, phone, fullName, username } = validation.data

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single()

    if (existingUser) {
      return errorResponse('Email or username already in use', 400)
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: phone,
          full_name: fullName,
          username: username,
          emailRedirectTo: '',
        },
      },
    })

    if (authError) {
      return errorResponse(authError.message, 400)
    }

    if (!authData.user) {
      throw new Error('Failed to create user')
    }

    const { id } = authData.user

    // Create user profile
    // const { error: profileError } = await supabase
    //   .from('profiles')
    //   .insert([
    //     {
    //       id,
    //       full_name: fullName,
    //       username,
    //       updated_at: new Date().toISOString()
    //     }
    //   ])

    // if (profileError) {
    //   // Rollback: Delete the auth user if profile creation fails
    //   await supabase.auth.admin.deleteUser(id)
      
    //   return errorResponse('Failed to create user profile', 500, profileError.message)
    // }

    return successResponse(
        {
          user: {
            id,
            email,
            fullName,
            username
          }
        },
        'User registered successfully',
        201
      )
  } catch (error) {
    console.error('Signup error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return errorResponse('Internal server error', 500, errorMessage)
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