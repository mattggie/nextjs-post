import { createClient } from '@/utils/supabase/server'
import FileList from '@/components/file-list'
import { redirect } from 'next/navigation'

export default async function FolderPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const { data: folder, error } = await supabase.from('folders').select('name').eq('id', params.id).single()

    if (error || !folder) {
        return <div className="p-8 text-center text-muted-foreground">Folder not found.</div>
    }

    const { data: documents } = await supabase.from('documents').select('*').eq('folder_id', params.id).order('updated_at', { ascending: false })

    return <FileList folderId={params.id} folderName={folder.name} documents={documents || []} />
}
