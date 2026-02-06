'use client'

import { useState, useEffect, useOptimistic, useTransition } from 'react'
import Link from 'next/link'
import { FileText, Plus, Trash2, Calendar, Search, Globe, FolderSearch, X } from 'lucide-react'
import { createDocument, deleteDocument, searchDocuments } from '@/app/actions'
import { format } from 'date-fns'
import Loading from './loading'
import { cn } from '@/utils/cn'

export default function FileList({ folderId, folderName, documents: initialDocuments }: { folderId: string, folderName: string, documents: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [optimisticDocs, addOptimisticDoc] = useOptimistic(
        initialDocuments,
        (state: any[], { action, doc }: { action: 'add' | 'delete', doc: any }) => {
            if (action === 'add') return [doc, ...state]
            if (action === 'delete') return state.filter(d => d.id !== doc.id)
            return state
        }
    )

    const [isCreating, setIsCreating] = useState(false)
    const [title, setTitle] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchScope, setSearchScope] = useState<'current' | 'all'>('current')
    const [displayDocuments, setDisplayDocuments] = useState(optimisticDocs)
    const [isGlobalLoading, setIsGlobalLoading] = useState(false)

    // 当乐观文档或初始文档改变时同步显示
    useEffect(() => {
        if (!searchQuery) {
            setDisplayDocuments(optimisticDocs)
        }
    }, [optimisticDocs, searchQuery])

    // 处理搜索逻辑 - 使用 transition 避免阻塞输入
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            startTransition(async () => {
                if (searchQuery.trim()) {
                    const results = await searchDocuments(
                        searchQuery,
                        searchScope === 'current' ? folderId : undefined
                    )
                    setDisplayDocuments(results)
                } else {
                    setDisplayDocuments(optimisticDocs)
                }
            })
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery, searchScope, folderId, optimisticDocs])

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!title) return

        const tempId = Math.random().toString()
        const newDoc = { id: tempId, title, updated_at: new Date().toISOString(), folder_id: folderId }

        startTransition(async () => {
            addOptimisticDoc({ action: 'add', doc: newDoc })
            setTitle('')
            setIsCreating(false)

            const formData = new FormData()
            formData.set('title', title)
            formData.set('folderId', folderId)
            await createDocument(formData)
        })
    }

    async function handleDelete(docId: string) {
        if (!confirm('确定删除该文档吗？')) return

        startTransition(async () => {
            addOptimisticDoc({ action: 'delete', doc: { id: docId } })
            await deleteDocument(docId)
        })
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto h-full overflow-y-auto pt-20 md:pt-8 scrollbar-none">
            {isGlobalLoading && <Loading message="正在处理..." />}

            <header className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 sticky top-0 bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-border/50 z-10 shadow-lg">
                <div className="flex items-center gap-2 flex-1 w-full relative">
                    <Search className={cn("absolute left-3 transition-colors", isPending ? "text-indigo-500 animate-pulse" : "text-muted-foreground")} size={18} />
                    <input
                        type="text"
                        placeholder={searchScope === 'current' ? `在 "${folderName}" 中搜索...` : "搜索所有文档..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-24 py-2 bg-secondary/50 border border-border/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
                    />
                    <div className="absolute right-2 flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/50">
                        <button
                            onClick={() => setSearchScope('current')}
                            className={cn(
                                "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all",
                                searchScope === 'current' ? "bg-indigo-500 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
                            )}
                            title="当前文件夹"
                        >
                            <FolderSearch size={12} /> <span className="hidden xs:inline">此旬</span>
                        </button>
                        <button
                            onClick={() => setSearchScope('all')}
                            className={cn(
                                "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all",
                                searchScope === 'all' ? "bg-indigo-500 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"
                            )}
                            title="所有文件夹"
                        >
                            <Globe size={12} /> <span className="hidden xs:inline">全部</span>
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 shrink-0 w-full md:w-auto justify-center active:scale-95"
                >
                    <Plus size={18} /> <span>新建文档</span>
                </button>
            </header>

            {isCreating && (
                <form onSubmit={handleCreate} className="mb-6 p-5 bg-card border-2 border-indigo-500/20 rounded-2xl animate-in fade-in slide-in-from-top-4 shadow-xl">
                    <input
                        autoFocus
                        className="w-full bg-transparent text-xl font-bold outline-none placeholder:text-muted-foreground/50"
                        placeholder="给新文档起个名字..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onBlur={() => !title && setIsCreating(false)}
                    />
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Plus size={12} /> 按回车键确认创建
                    </p>
                </form>
            )}

            <div className="grid grid-cols-1 gap-3">
                {displayDocuments.map(doc => (
                    <div key={doc.id} className="group flex items-center justify-between p-4 bg-card hover:bg-indigo-500/5 border border-border/50 hover:border-indigo-500/30 rounded-2xl transition-all shadow-sm hover:shadow-xl hover:-translate-y-0.5">
                        <Link href={`/editor/${doc.id}`} className="flex-1 flex items-center gap-4 overflow-hidden">
                            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all transform group-hover:rotate-12 shrink-0">
                                <FileText size={22} />
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-foreground group-hover:text-indigo-600 transition-colors truncate text-lg">{doc.title}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar size={12} />
                                        {format(new Date(doc.updated_at), 'yyyy/MM/dd HH:mm')}
                                    </p>
                                    {searchScope === 'all' && (
                                        <span className="px-2 py-0.5 bg-muted text-[10px] text-muted-foreground rounded-full border border-border">
                                            来自文件夹
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete(doc.id)
                            }}
                            className="text-muted-foreground hover:text-white md:opacity-0 group-hover:opacity-100 transition-all p-2.5 hover:bg-destructive rounded-xl shrink-0 shadow-sm"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>

            {displayDocuments.length === 0 && (
                <div className="text-center py-32 animate-in fade-in slide-in-from-bottom-4">
                    <div className="inline-flex p-6 bg-muted rounded-full mb-4">
                        <Search size={40} className="text-muted-foreground/30" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">没有找到相关文档</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                        {searchQuery ? '尝试换个关键词或者切换搜索范围。' : '这个文件夹里空空如也。'}
                    </p>
                </div>
            )}
        </div>
    )
}
