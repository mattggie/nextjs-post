'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        // If invalid login, try to sign up ONLY IF it matches the default credentials in .env
        // This allows the "Default Account" feature to auto-provision on first use.
        if (
            process.env.DEFAULT_EMAIL &&
            process.env.DEFAULT_PASSWORD &&
            email === process.env.DEFAULT_EMAIL &&
            password === process.env.DEFAULT_PASSWORD
        ) {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { role: 'admin' }
                }
            })
            if (signUpError) {
                console.error('Auto-signup failed:', signUpError)
                return redirect('/login?error=Invalid login credentials')
            }
            // If signup success, we might be logged in or need confirmation
            // For this simple app, we hope 'Confirm Email' is off or we assume success.
            revalidatePath('/', 'layout')
            redirect('/')
        }

        return redirect('/login?error=Invalid login credentials')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
