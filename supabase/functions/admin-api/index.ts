const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

// Custom password comparison
async function comparePassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hash
}

interface LoginRequest {
  action: string
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  password: string
}

interface AssignAdminRequest {
  email: string
  password: string
}

interface GlobalSettingsRequest {
  geminiApiKey: string
  geminiModel: string
}

interface UserLimitRequest {
  userId: string
  limit: number
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
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse URL to get the route
    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    
    // Get the last segment as the route, or use the request body action for login
    let route = pathSegments[pathSegments.length - 1]
    
    // For POST requests to the base admin-api endpoint, check for action in body
    if (route === 'admin-api' && req.method === 'POST') {
      try {
        const body = await req.clone().json()
        if (body.action) {
          route = body.action
        }
      } catch (e) {
        // If we can't parse JSON, continue with the route from URL
      }
    }

    // Create Supabase client with service role key for admin operations
    const { createClient } = await import('npm:@supabase/supabase-js@2')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Route handlers
    switch (route) {
      case 'login':
        return await handleLogin(req, supabaseAdmin)
      
      case 'register':
        return await handleRegister(req, supabaseAdmin)
      
      case 'global-settings':
        if (req.method === 'GET') {
          return await handleGetGlobalSettings(supabaseAdmin)
        } else if (req.method === 'POST') {
          return await handleUpdateGlobalSettings(req, supabaseAdmin)
        }
        break
      
      case 'users':
        return await handleGetUsers(supabaseAdmin)
      
      case 'admins':
        return await handleGetAdmins(supabaseAdmin)
      
      case 'assign-admin':
        return await handleAssignAdmin(req, supabaseAdmin)
      
      case 'user-limit':
        return await handleUpdateUserLimit(req, supabaseAdmin)
      
      default:
        // Handle remove-admin with dynamic ID
        if (pathSegments.some(segment => segment.includes('remove-admin'))) {
          const adminId = pathSegments[pathSegments.length - 1]
          return await handleRemoveAdmin(adminId, supabaseAdmin)
        }
        
        return new Response(
          JSON.stringify({ error: `Route not found: ${route}` }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Admin API error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleLogin(req: Request, supabaseAdmin: any) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const body: LoginRequest = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Query admin_users table to find user by email
    const { data: adminUser, error: queryError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()

    if (queryError || !adminUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if password_hash exists
    if (!adminUser.password_hash) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Compare password with hash using custom function
    let isValidPassword = false
    try {
      isValidPassword = await comparePassword(password, adminUser.password_hash)
    } catch (compareError) {
      console.error('Password comparison failed:', compareError)
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return admin user data (excluding password hash)
    const { password_hash, ...adminData } = adminUser
    
    return new Response(
      JSON.stringify(adminData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Login error:', error)
    return new Response(
      JSON.stringify({ error: 'Login failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleRegister(req: Request, supabaseAdmin: any) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const { email, password }: RegisterRequest = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin with this email already exists' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Hash the password using custom function
    const hashedPassword = await hashPassword(password)

    // Insert new admin
    const { data: newAdmin, error: insertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email,
        password_hash: hashedPassword,
        is_default_admin: false
      })
      .select()
      .single()

    if (insertError) throw insertError

    // Return admin user data (excluding password hash)
    const { password_hash, ...adminData } = newAdmin

    return new Response(
      JSON.stringify(adminData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Register error:', error)
    return new Response(
      JSON.stringify({ error: 'Registration failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleGetGlobalSettings(supabaseAdmin: any) {
  try {
    // Use the safe RPC function that guarantees exactly one row
    const { data, error } = await supabaseAdmin.rpc('get_global_settings')

    if (error) {
      console.error('RPC get_global_settings error:', error)
      throw error
    }

    // The RPC function returns JSON with the settings
    return new Response(
      JSON.stringify(data || {
        geminiApiKey: '',
        geminiModel: 'gemini-2.5-flash'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Get global settings error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch global settings' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleUpdateGlobalSettings(req: Request, supabaseAdmin: any) {
  try {
    const { geminiApiKey, geminiModel }: GlobalSettingsRequest = await req.json()

    // Use the safe RPC function that prevents multiple rows
    const { data, error } = await supabaseAdmin.rpc('update_global_settings', {
      new_api_key: geminiApiKey,
      new_model: geminiModel || 'gemini-2.5-flash'
    })

    if (error) {
      console.error('RPC update_global_settings error:', error)
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        settings: data 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Update global settings error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update global settings' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleGetUsers(supabaseAdmin: any) {
  try {
    // Get users from auth.users and their limits
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) throw usersError

    // Get user limits and evaluation counts
    const userIds = users.users.map((user: any) => user.id)
    
    const { data: limits } = await supabaseAdmin
      .from('user_limits')
      .select('user_id, evaluation_limit')
      .in('user_id', userIds)

    const { data: evaluationCounts } = await supabaseAdmin
      .from('evaluations')
      .select('user_id')
      .in('user_id', userIds)

    // Count evaluations per user
    const evaluationCountMap = evaluationCounts?.reduce((acc: any, eval: any) => {
      acc[eval.user_id] = (acc[eval.user_id] || 0) + 1
      return acc
    }, {}) || {}

    // Create limits map
    const limitsMap = limits?.reduce((acc: any, limit: any) => {
      acc[limit.user_id] = limit.evaluation_limit
      return acc
    }, {}) || {}

    // Combine data
    const usersWithLimits = users.users.map((user: any) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      evaluation_limit: limitsMap[user.id] || 10,
      evaluation_count: evaluationCountMap[user.id] || 0
    }))

    return new Response(
      JSON.stringify(usersWithLimits),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Get users error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch users' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleGetAdmins(supabaseAdmin: any) {
  try {
    const { data: admins, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, is_default_admin, created_at')
      .order('created_at', { ascending: true })

    if (error) throw error

    return new Response(
      JSON.stringify(admins || []),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Get admins error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch admins' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleAssignAdmin(req: Request, supabaseAdmin: any) {
  try {
    const { email, password }: AssignAdminRequest = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin with this email already exists' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Hash the password using custom function
    const hashedPassword = await hashPassword(password)

    // Insert new admin
    const { error: insertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email,
        password_hash: hashedPassword,
        is_default_admin: false
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Assign admin error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to assign admin' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleUpdateUserLimit(req: Request, supabaseAdmin: any) {
  try {
    const { userId, limit }: UserLimitRequest = await req.json()

    if (!userId || limit === undefined) {
      return new Response(
        JSON.stringify({ error: 'User ID and limit are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user limit record exists
    const { data: existing } = await supabaseAdmin
      .from('user_limits')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Update existing record
      const { error } = await supabaseAdmin
        .from('user_limits')
        .update({
          evaluation_limit: limit,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error
    } else {
      // Insert new record
      const { error } = await supabaseAdmin
        .from('user_limits')
        .insert({
          user_id: userId,
          evaluation_limit: limit
        })

      if (error) throw error
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Update user limit error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update user limit' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleRemoveAdmin(adminId: string, supabaseAdmin: any) {
  try {
    if (!adminId) {
      return new Response(
        JSON.stringify({ error: 'Admin ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if admin exists and is not default admin
    const { data: admin, error: fetchError } = await supabaseAdmin
      .from('admin_users')
      .select('is_default_admin')
      .eq('id', adminId)
      .single()

    if (fetchError || !admin) {
      return new Response(
        JSON.stringify({ error: 'Admin not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (admin.is_default_admin) {
      return new Response(
        JSON.stringify({ error: 'Cannot remove default admin' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Delete admin
    const { error: deleteError } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('id', adminId)

    if (deleteError) throw deleteError

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Remove admin error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to remove admin' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}