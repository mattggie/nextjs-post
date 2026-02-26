import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid calling getUser() on every single request if possible.
    // For public routes or routes with API keys, we can skip the session check to improve performance.
    const isLoginPage = request.nextUrl.pathname.startsWith('/login')
    const isApiUpload = request.nextUrl.pathname.startsWith('/api/upload')
    const hasApiKey = request.headers.has('x-api-key')

    // If it's an API call or the upload path, we might skip the session check
    if (isApiUpload || hasApiKey) {
        return response
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        !isLoginPage
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If user is logged in and trying to access login, redirect to dashboard
    if (user && isLoginPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return response
}

