'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // 验证新密码
    if (newPassword !== confirmPassword) {
        return redirect('/settings?error=两次输入的新密码不一致')
    }

    if (newPassword.length < 6) {
        return redirect('/settings?error=新密码长度至少为6位')
    }

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
        return redirect('/login')
    }

    // 验证当前密码（通过重新登录验证）
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
    })

    if (signInError) {
        return redirect('/settings?error=当前密码不正确')
    }

    // 更新密码
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
    })

    if (updateError) {
        console.error('Update password error:', updateError)
        return redirect('/settings?error=密码更新失败，请重试')
    }

    revalidatePath('/settings')
    return redirect('/settings?success=密码修改成功')
}
