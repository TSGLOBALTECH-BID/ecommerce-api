import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse 
} from '@/types/api-response'

// Input validation schema
const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user
 *     description: Logs in a user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User authenticated successfully
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
 *                 session:
 *                   type: object
 *                   properties:
 *                     access_token:
 *                       type: string
 *                     expires_in:
 *                       type: number
 *                     refresh_token:
 *                       type: string
 *       400:
 *         description: Invalid input or authentication failed
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.issues.reduce<Record<string, string[]>>((acc, issue) => {
        const path = issue.path.join('.')
        if (!acc[path]) {
          acc[path] = []
        }
        acc[path].push(issue.message)
        return acc
      }, {})
      
      return NextResponse.json(
        validationErrorResponse('Validation failed', errors),
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      return NextResponse.json(
        errorResponse('Invalid email or password', 401),
        { status: 401 }
      )
    }

    if (!data.session) {
      return NextResponse.json(
        errorResponse('No session created', 500),
        { status: 500 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      // Don't fail the login if we can't get the profile
      // Just return the basic user info
      return NextResponse.json(
        successResponse(
          {
            user: {
              id: data.user.id,
              email: data.user.email,
            },
            session: {
              access_token: data.session.access_token,
              expires_in: data.session.expires_in,
              refresh_token: data.session.refresh_token,
            }
          },
          'Login successful'
        )
      )
    }

    return NextResponse.json(
      successResponse(
        {
          user: {
            id: data.user.id,
            email: data.user.email,
            fullName: profile.full_name,
          },
          session: {
            access_token: data.session.access_token,
            expires_in: data.session.expires_in,
            refresh_token: data.session.refresh_token,
          }
        },
        'Login successful'
      )
    )
  } catch (error) {
    console.error('Login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json(
      errorResponse('Internal server error', 500, errorMessage),
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
