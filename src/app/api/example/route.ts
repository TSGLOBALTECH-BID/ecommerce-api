import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * @openapi
 * /api/example:
 *   get:
 *     summary: Get example data
 *     description: Returns a simple message
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export async function GET() {
  // Example of using Supabase
  // const { data, error } = await supabase.from('your_table').select('*')
  
  return NextResponse.json({ 
    message: 'Hello from the API!',
    // data: data || []
  })
}