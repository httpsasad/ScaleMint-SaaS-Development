'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface AuthActionResult {
  success: boolean;
  message: string;
}

export async function signInUser(formData: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const { email, password } = formData;

  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Authentication successful. Redirecting to dashboard...' };
  } catch {
    return { success: false, message: 'Authentication service temporarily unreachable.' };
  }
}

export async function signUpUser(formData: {
  email: string;
  password: string;
  companyName: string;
  contactName: string;
}): Promise<AuthActionResult> {
  const { email, password, companyName, contactName } = formData;

  if (!email || !password || !companyName || !contactName) {
    return { success: false, message: 'All fields are required for registration.' };
  }

  if (password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters long.' };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          contact_name: contactName,
        },
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: 'Account registered. If email confirmation is enabled, please check your inbox to activate your account.',
    };
  } catch {
    return { success: false, message: 'Registration service temporarily unreachable.' };
  }
}

export async function signOutUser() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch (e) {
    console.error('Error during sign out:', e);
  }
  redirect('/login');
}
