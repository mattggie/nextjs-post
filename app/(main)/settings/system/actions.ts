'use server'

import { createAdminClient, createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * 检查当前用户是否为管理员
 */
async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isAdmin = user?.user_metadata?.role === 'admin' || (user?.email === process.env.DEFAULT_EMAIL && !!user?.email)

    if (!user || !isAdmin) {
        throw new Error('权限不足')
    }
    return user
}

export async function listUsers() {
    await checkAdmin()
    const adminClient = await createAdminClient()
    const { data: { users }, error } = await adminClient.auth.admin.listUsers()

    if (error) {
        console.error('List users error:', error)
        return []
    }

    return users
}

export async function createUser(formData: FormData) {
    await checkAdmin()
    const adminClient = await createAdminClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string || 'user'

    const { error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role }
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/settings/system')
    return { success: true }
}

export async function updateUserRole(userId: string, role: string) {
    await checkAdmin()
    const adminClient = await createAdminClient()

    const { error } = await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: { role }
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/settings/system')
    return { success: true }
}

export async function deleteUser(userId: string) {
    const currentUser = await checkAdmin()

    if (userId === currentUser.id) {
        return { error: '不能删除自己' }
    }

    const adminClient = await createAdminClient()
    const { error } = await adminClient.auth.admin.deleteUser(userId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/settings/system')
    return { success: true }
}
