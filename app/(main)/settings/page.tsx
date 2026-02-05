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
    const siteName = user.user_metadata?.site_name || process.env.NEXT_PUBLIC_SITE_NAME || 'DocSpace' // Added siteName
    const siteGradient = user.user_metadata?.site_gradient || 'from-indigo-500 to-purple-500' // Added siteGradient

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <header className="flex items-center gap-4 mb-8">
                <Link
                    href="/"
                    className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold">账户设置</h1>
            </header>

            {/* 用户信息 */}
            <div className="bg-card border rounded-xl p-6 mb-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-4">账户信息</h2>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 text-3xl font-bold">
                        {avatar || user.email?.[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium text-lg">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                            注册时间: {new Date(user.created_at).toLocaleDateString('zh-CN')}
                        </p>
                    </div>
                </div>
            </div>

            {/* 品牌设置 */}
            <div className="mb-6">
                <BrandingForm initialName={siteName} initialGradient={siteGradient} />
            </div>

            {/* 头像选择 */}
            <div className="mb-6">
                <AvatarSelector currentAvatar={avatar} />
            </div>

            {/* 修改密码表单 */}
            <PasswordForm userEmail={user.email || ''} />
        </div>
    )
}
