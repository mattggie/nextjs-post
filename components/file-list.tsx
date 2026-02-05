'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, Trash2, Calendar } from 'lucide-react'
import { createDocument, deleteDocument } from '@/app/actions'
import { format } from 'date-fns'

export default function FileList({ folderId, folderName, documents }: { folderId: string, folderName: string, documents: any[] }) {
    const [isCreating, setIsCreating] = useState(false)
    const [title, setTitle] = useState('')

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!title) return
        const formData = new FormData()
        formData.set('title', title)
        formData.set('folderId', folderId)
        await createDocument(formData)
        setTitle('')
        setIsCreating(false)
    }

    return (
        <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
            <header className="flex items-center justify-between mb-8 sticky top-0 bg-background/50 backdrop-blur-md p-4 rounded-xl border border-border/50 z-10">
                <h1 className="text-2xl font-bold tracking-tight">{folderName}</h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={16} /> 新建文档
                </button>
            </header>

            {isCreating && (
                <form onSubmit={handleCreate} className="mb-6 mx-4 p-4 bg-card border rounded-xl animate-in fade-in slide-in-from-top-2 shadow-sm">
                    <input
                        autoFocus
                        className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-muted-foreground"
                        placeholder="文档标题..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onBlur={() => !title && setIsCreating(false)}
                    />
                </form>
            )}

            <div className="grid grid-cols-1 gap-2 px-4">
                {documents.map(doc => (
                    <div key={doc.id} className="group flex items-center justify-between p-4 bg-card hover:bg-accent/50 border border-transparent hover:border-border rounded-xl transition-all shadow-sm hover:shadow-md">
                        <Link href={`/editor/${doc.id}`} className="flex-1 flex items-center gap-4">
                            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground group-hover:text-indigo-500 transition-colors">{doc.title}</h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Calendar size={10} />
                                    {format(new Date(doc.updated_at), 'yyyy年MM月dd日')}
                                </p>
                            </div>
                        </Link>
                        <button
                            onClick={async () => {
                                if (confirm('确定删除该文档吗？')) await deleteDocument(doc.id)
                            }}
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-destructive/10 rounded-lg"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            {documents.length === 0 && !isCreating && (
                <div className="text-center py-20 text-muted-foreground">
                    <p>暂无文档。</p>
                </div>
            )}
        </div>
    )
}
