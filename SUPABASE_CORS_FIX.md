# 🔧 Supabase CORS Configuration Fix

## 🚨 **Critical Issue:** 
Your Supabase project needs to allow your production domain `https://aiexamevaluator.me` in its CORS settings.

## 📋 **Step-by-Step Fix:**

### **1. Access Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `agpsxkxpimtuqlwqqeby`
3. Navigate to **Settings** → **API**

### **2. Update CORS Settings**
Find the **CORS Configuration** section and add your domain:

#### **Current Allowed Origins (likely only):**
```
http://localhost:3000
http://localhost:5173
```

#### **Updated Allowed Origins (add these):**
```
http://localhost:3000
http://localhost:5173
https://aiexamevaluator.me
https://*.aiexamevaluator.me
```

### **3. Alternative: Update via SQL**
If CORS settings aren't in the UI, run this in your Supabase SQL Editor:

```sql
-- Allow your production domain
INSERT INTO auth.config (key, value) 
VALUES ('cors_allowed_origins', 'http://localhost:3000,http://localhost:5173,https://aiexamevaluator.me,https://*.aiexamevaluator.me')
ON CONFLICT (key) 
DO UPDATE SET value = 'http://localhost:3000,http://localhost:5173,https://aiexamevaluator.me,https://*.aiexamevaluator.me';
```

### **4. Edge Functions CORS (if using custom functions)**
If you have custom Edge Functions, update their CORS headers:

```typescript
// In your Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

export default async function handler(req: Request) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  // Your function logic...
  
  return new Response(
    JSON.stringify(data),
    { 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  )
}
```

Create `_shared/cors.ts`:
```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://aiexamevaluator.me',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}
```

## 🔄 **After Making Changes:**

### **1. Wait for Propagation**
- Supabase changes take 1-2 minutes to propagate
- Clear your browser cache
- Try a hard refresh (Ctrl+F5)

### **2. Test the Fix**
1. Open your deployed app: `https://aiexamevaluator.me`
2. Open browser DevTools (F12)
3. Try uploading and evaluating a paper
4. Check if CORS errors are gone

### **3. Verify PDF Viewing**
1. Complete an evaluation
2. Go to Review AI Evaluation
3. Check if PDFs load without "content blocked" message

## 🛠️ **Additional Debugging:**

### **Check Supabase Logs**
1. Go to Supabase Dashboard → **Logs**
2. Look for CORS-related errors
3. Verify API calls are reaching your functions

### **Test API Endpoints Directly**
```bash
# Test if your domain is allowed
curl -H "Origin: https://aiexamevaluator.me" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://agpsxkxpimtuqlwqqeby.supabase.co/functions/v1/admin-api/global-settings
```

Expected response should include:
```
Access-Control-Allow-Origin: https://aiexamevaluator.me
```

## ⚠️ **Security Note:**
- Only add your production domain
- Avoid using wildcard (*) for production
- Keep localhost URLs for development

## 📞 **If Issues Persist:**
1. Check Supabase service status
2. Verify your project limits/quotas
3. Contact Supabase support with your project ID
4. Try deploying to a temporary Netlify URL to test

---

**Next Step:** After updating Supabase CORS, rebuild and redeploy your app!
