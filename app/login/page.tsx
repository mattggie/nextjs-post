'use client'

import { useState } from 'react'
import { login } from './actions'
import Loading from '@/components/loading'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'DocSpace'

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            await login(formData)
        } catch (error) {
            console.error(error)
            // Error is usually handled by redirect or throw in server action
            // In Next.js, redirect throws a special error that is caught by the router
        } finally {
            // If it didn't redirect, stop loading
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {isLoading && <Loading message="正在验证身份..." />}

            {/* 装饰元素 */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>

            <form action={handleSubmit} className="z-10 glass p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-2">
                        {siteName}
                    </h1>
                    <p className="text-sm text-muted-foreground">请输入您的账号密码以继续</p>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">邮箱</label>
                        <input
                            name="email"
                            type="email"
                            required
                            disabled={isLoading}
                            className="bg-secondary/50 border border-white/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-muted-foreground/50 disabled:opacity-50"
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">密码</label>
                        <input
                            name="password"
                            type="password"
                            required
                            disabled={isLoading}
                            className="bg-secondary/50 border border-white/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-muted-foreground/50 disabled:opacity-50"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-medium p-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                >
                    {isLoading ? '登录中...' : '登 录'}
                </button>
            </form>
        </div>
    )
}
