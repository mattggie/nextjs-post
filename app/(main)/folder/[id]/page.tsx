import { createClient } from '@/utils/supabase/server'
import FileList from '@/components/file-list'

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

    const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('folder_id', id)
        .order('updated_at', { ascending: false })

    return <FileList folderId={id} folderName={folder.name} documents={documents || []} />
}
