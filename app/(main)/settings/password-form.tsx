'use client'

import { useState } from 'react'
import { Key, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function PasswordForm({ userEmail }: { userEmail: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.currentTarget
        setIsLoading(true)
        setMessage(null)

        const formData = new FormData(form)
        const newPassword = formData.get('newPassword') as string
        const confirmPassword = formData.get('confirmPassword') as string

        // 验证
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: '两次输入的新密码不一致' })
            setIsLoading(false)
            return
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: '新密码长度至少为6位' })
            setIsLoading(false)
            return
        }

        const supabase = createClient()

        // 直接更新密码（用户已通过会话认证）
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (updateError) {
            console.log('Update Error:', updateError)
            setMessage({ type: 'error', text: `密码更新失败: ${updateError.message}` })
            setIsLoading(false)
            return
        }

        setMessage({ type: 'success', text: '密码修改成功！下次登录请使用新密码。' })
        setIsLoading(false)

        // 清空表单
        form.reset()
        router.refresh()
    }

    return (
        <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                    <Key size={20} />
                </div>
                <h2 className="text-lg font-semibold">修改密码</h2>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                当前账户: <span className="font-medium text-foreground">{userEmail}</span>
            </p>

            {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'error'
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-green-500/10 text-green-600 border border-green-500/20'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">新密码</label>
                    <input
                        name="newPassword"
                        type="password"
                        required
                        minLength={6}
                        disabled={isLoading}
                        className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                        placeholder="请输入新密码（至少6位）"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">确认新密码</label>
                    <input
                        name="confirmPassword"
                        type="password"
                        required
                        minLength={6}
                        disabled={isLoading}
                        className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                        placeholder="请再次输入新密码"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-medium p-3 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            更新中...
                        </>
                    ) : '更新密码'}
                </button>
            </form>
        </div>
    )
}
