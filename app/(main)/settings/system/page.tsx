import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings, ShieldAlert, Bot } from 'lucide-react'
import BrandingForm from '../branding-form'
import UserManagement from './user-management'
import AiSettingsForm from './ai-settings-form'
import { Suspense } from 'react'
import { Skeleton } from '@/components/skeletons'

export const metadata = {
    title: '系统设置 - DocSpace',
}

async function UserManagementSection({ currentUserId }: { currentUserId: string }) {
    const { data: { users: authUsers } } = await (await import('@/utils/supabase/server')).createAdminClient().then(c => c.auth.admin.listUsers())
    return <UserManagement initialUsers={authUsers || []} currentUserId={currentUserId} />
}

export default async function SystemSettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 严格限权检查
    const isAdmin = user.user_metadata?.role === 'admin' || user.email === process.env.DEFAULT_EMAIL
    if (!isAdmin) {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-sm">
                    <div className="inline-flex p-4 bg-destructive/10 text-destructive rounded-full">
                        <ShieldAlert size={48} />
                    </div>
                    <h1 className="text-2xl font-bold">访问受限</h1>
                    <p className="text-muted-foreground italic">
                        该页面仅供系统管理员访问。如果您认为这是误报，请联系上级管理员。
                    </p>
                    <Link href="/" className="inline-block px-6 py-2 bg-foreground text-background rounded-xl font-medium">
                        回到主页
                    </Link>
                </div>
            </div>
        )
    }

    const siteName = user.user_metadata?.site_name || process.env.NEXT_PUBLIC_SITE_NAME || 'DocSpace'
    const siteGradient = user.user_metadata?.site_gradient || 'from-indigo-500 to-purple-500'
    const aiConfigs = user.user_metadata?.ai_configs || []
    const aiPrompts = user.user_metadata?.ai_prompts || []

    return (
        <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-4xl mx-auto space-y-12">
            <header className="flex items-center gap-4">
                <Link
                    href="/"
                    className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">系统设置</h1>
                    <p className="text-sm text-muted-foreground">管理站点品牌、全局配置与用户权限</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* 1. AI 设置 */}
                    <section className="bg-card border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Bot className="text-indigo-500" size={20} />
                            <h2 className="text-lg font-bold">AI 处理中心</h2>
                        </div>
                        <AiSettingsForm initialConfigs={aiConfigs} initialPrompts={aiPrompts} />
                    </section>

                    {/* 2. 用户权限管理 */}
                    <section>
                        <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-2xl" />}>
                            <UserManagementSection currentUserId={user.id} />
                        </Suspense>
                    </section>
                </div>

                <div className="space-y-8">
                    {/* 3. 站点品牌设置 */}
                    <section className="bg-card border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Settings className="text-indigo-500" size={20} />
                            <h2 className="text-lg font-bold">站点品牌</h2>
                        </div>
                        <BrandingForm initialName={siteName} initialGradient={siteGradient} />
                    </section>
                </div>
            </div>
        </div>
    )
}
