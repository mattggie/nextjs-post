import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PasswordForm from './password-form'
import AvatarSelector from './avatar-selector'
import BrandingForm from './branding-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const avatar = user.user_metadata?.avatar || ''

    // 确保显示一致：初始账号在界面上始终显示为管理员
    if (user.email === process.env.DEFAULT_EMAIL && user.user_metadata?.role !== 'admin') {
        user.user_metadata = { ...user.user_metadata, role: 'admin' }
    }

    const siteName = user.user_metadata?.site_name || process.env.NEXT_PUBLIC_SITE_NAME || 'DocSpace'
    const siteGradient = user.user_metadata?.site_gradient || 'from-indigo-500 to-purple-500'

    return (
        <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-2xl mx-auto">
            <header className="flex items-center gap-4 mb-8">
                <Link
                    href="/"
                    className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold">个人设置</h1>
            </header>

            <div className="space-y-8">
                {/* 1. 账户概览 */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">账户概览</h2>
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 text-4xl font-bold ring-4 ring-background shadow-inner">
                            {avatar || user.email?.[0].toUpperCase()}
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-xl">{user.email}</p>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[10px] font-bold rounded-full uppercase">
                                    {user.user_metadata?.role || 'user'}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                    注册于 {new Date(user.created_at).toLocaleDateString('zh-CN')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. 头像与外观 */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">头像与外观</h2>
                    <AvatarSelector currentAvatar={avatar} />
                </div>

                {/* 3. 安全隐私 */}
                <div className="bg-card border rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">安全隐私</h2>
                    <PasswordForm userEmail={user.email || ''} />
                </div>
            </div>
        </div>
    )
}
