const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Global salt for password hashing (in production, use per-user salts)
const GLOBAL_PASSWORD_SALT = 'exam_evaluator_salt_2024'

// Custom password hashing using Deno's built-in crypto
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + GLOBAL_PASSWORD_SALT)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests first
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    // Check for required environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      })
      
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Missing required environment variables' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Create Supabase client with service role key
    const { createClient } = await import('npm:@supabase/supabase-js@2')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Default admin credentials
    const defaultEmail = 'shakhawat.hossain07@northsouth.edu'
    const defaultPassword = 'Ece2131273642@'
    
    // Generate hash for the password using custom function
    const hashedPassword = await hashPassword(defaultPassword)

    // Check if default admin already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('admin_users')
      .select('id, email')
      .eq('email', defaultEmail)
      .single()

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Default admin already exists',
          email: defaultEmail
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Create default admin user
    const { data: newAdmin, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email: defaultEmail,
        password_hash: hashedPassword,
        is_default_admin: true
      })
      .select()
      .single()

    if (adminError) {
      throw new Error(`Failed to create admin user: ${adminError.message}`)
    }

    // Create default global settings
    const { error: settingsError } = await supabaseAdmin
      .from('global_settings')
      .insert({
        gemini_api_key: null,
        gemini_model: 'gemini-2.5-flash',
        updated_by: newAdmin.id
      })

    if (settingsError && settingsError.code !== '23505') { // Ignore duplicate key error
      console.warn('Failed to create global settings:', settingsError.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Default admin user created successfully',
        email: defaultEmail,
        adminId: newAdmin.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Setup default admin error:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to setup default admin'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})