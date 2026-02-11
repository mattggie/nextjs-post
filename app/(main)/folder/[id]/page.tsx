import { createClient } from '@/utils/supabase/server'
import FileList from '@/components/file-list'
import { Suspense } from 'react'
import { FileListSkeleton } from '@/components/skeletons'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const supabase = await createClient()
    const { data } = await supabase.from('folders').select('name').eq('id', id).single()
    return { title: data?.name ? `${data.name} - 文章列表` : '文件夹' }
}

async function DocumentList({ id, folderName }: { id: string, folderName: string }) {
    const supabase = await createClient()
    const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('folder_id', id)
        .order('updated_at', { ascending: false })

    return <FileList folderId={id} folderName={folderName} documents={documents || []} />
}

export default async function FolderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: folder, error } = await supabase
        .from('folders')
        .select('name')
        .eq('id', id)
        .single()

    if (error || !folder) {
        return <div className="p-8 text-center text-muted-foreground">文件夹未找到。</div>
    }

    return (
        <Suspense fallback={<FileListSkeleton />}>
            <DocumentList id={id} folderName={folder.name} />
        </Suspense>
    )
}
