#!/usr/bin/env node

/**
 * Setup script for creating test admin user
 * Run with: node scripts/setup-test-admin.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupTestAdmin() {
  console.log('🚀 Setting up test admin user...');
  
  const testAdminEmail = 'admin@testsprite.com';
  const testAdminPassword = 'TestSprite123!';
  
  try {
    // Try to sign up the admin user
    console.log('📝 Creating admin user account...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testAdminEmail,
      password: testAdminPassword,
      options: {
        data: {
          role: 'admin',
          full_name: 'TestSprite Admin'
        }
      }
    });

    if (signUpError && !signUpError.message.includes('already registered')) {
      throw signUpError;
    }

    console.log('✅ Admin user created/exists:', testAdminEmail);
    
    // Try to sign in to verify
    console.log('🔐 Verifying admin login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testAdminEmail,
      password: testAdminPassword
    });

    if (signInError) {
      console.warn('⚠️  Login verification failed:', signInError.message);
    } else {
      console.log('✅ Admin login verified successfully');
    }

    console.log('\n🎉 Test admin setup complete!');
    console.log('📧 Email:', testAdminEmail);
    console.log('🔑 Password:', testAdminPassword);
    console.log('\n💡 Use these credentials for TestSprite testing');
    
  } catch (error) {
    console.error('❌ Error setting up test admin:', error.message);
    
    // Provide helpful suggestions
    console.log('\n💡 Troubleshooting suggestions:');
    console.log('1. Check your Supabase project is active');
    console.log('2. Verify your environment variables are correct');
    console.log('3. Ensure email auth is enabled in Supabase Auth settings');
    console.log('4. Check if email confirmation is required (disable for testing)');
  }
}

// Run the setup
setupTestAdmin().catch(console.error);