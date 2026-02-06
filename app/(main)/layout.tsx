import { createClient } from '@/utils/supabase/server'
import Sidebar from '@/components/sidebar'
import { redirect } from 'next/navigation'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 确保初始账号拥有管理员权限（即使用户元数据中尚未写入）
    const isAdmin = user.user_metadata?.role === 'admin' || user.email === process.env.DEFAULT_EMAIL
    if (isAdmin && user.user_metadata?.role !== 'admin') {
        user.user_metadata = { ...user.user_metadata, role: 'admin' }
    }

    const { data: folders } = await supabase
        .from('folders')
        .select('*')
        .order('name')

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar folders={folders || []} user={user} />
            <main className="flex-1 overflow-auto bg-muted/20 relative">
                {children}
            </main>
        </div>
    )
}
