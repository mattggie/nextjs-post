import { createClient } from '@/utils/supabase/server'
import Editor from '@/components/editor'
import { redirect } from 'next/navigation'

export default async function EditorPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: doc, error } = await supabase.from('documents').select('*').eq('id', params.id).single()

    if (error || !doc) {
        return (
            <div className="h-screen flex items-center justify-center flex-col gap-4">
                <h1 className="text-2xl font-bold">Document not found</h1>
                <p className="text-muted-foreground">It may have been deleted.</p>
            </div>
        )
    }

    return <Editor doc={doc} />
}
