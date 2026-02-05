import { createClient } from '@/utils/supabase/server'
import Sidebar from '@/components/sidebar'
import { redirect } from 'next/navigation'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
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
