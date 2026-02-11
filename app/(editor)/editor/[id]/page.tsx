import { createClient } from '@/utils/supabase/server'
import Editor from '@/components/editor'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { EditorSkeleton } from '@/components/skeletons'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const supabase = await createClient()
    const { data } = await supabase.from('documents').select('title').eq('id', id).single()
    return { title: data?.title ? `编辑: ${data.title}` : '编辑器' }
}

async function EditorContent({ id }: { id: string }) {
    const supabase = await createClient()
    const { data: doc, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !doc) {
        return (
            <div className="h-screen flex items-center justify-center flex-col gap-4">
                <h1 className="text-2xl font-bold">文档未找到</h1>
                <p className="text-muted-foreground">该文档可能已被删除。</p>
            </div>
        )
    }

    return <Editor doc={doc} />
}

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    return (
        <Suspense fallback={<EditorSkeleton />}>
            <EditorContent id={id} />
        </Suspense>
    )
}
