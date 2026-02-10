'use client'

import { useState, useEffect, useOptimistic, useTransition } from 'react'
import Link from 'next/link'
import { FileText, Plus, Trash2, Calendar, Search, Globe, FolderSearch, X, Check, Bot, Sparkles, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { createDocument, deleteDocument, searchDocuments, processWithAi } from '@/app/actions'
import { format } from 'date-fns'
import Loading from './loading'
import { cn } from '@/utils/cn'
import { createClient } from '@/utils/supabase/client'

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
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    // 批量处理相关状态
    const [isBatchMode, setIsBatchMode] = useState(false)
    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set())
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false)
    const [aiConfigs, setAiConfigs] = useState<any[]>([])
    const [aiPrompts, setAiPrompts] = useState<any[]>([])
    const [selectedConfig, setSelectedConfig] = useState('')
    const [selectedPrompt, setSelectedPrompt] = useState('')
    const [isBatchProcessing, setIsBatchProcessing] = useState(false)
    const [batchResult, setBatchResult] = useState<{ total: number, success: number, fail: number } | null>(null)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        const fetchAiSettings = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const configs = user.user_metadata?.ai_configs || []
                const prompts = user.user_metadata?.ai_prompts || []
                setAiConfigs(configs)
                setAiPrompts(prompts)
                if (configs[0]) setSelectedConfig(configs[0].id)
                if (prompts[0]) setSelectedPrompt(prompts[0].id)
            }
        }
        fetchAiSettings()
    }, [])

    const toggleDocSelection = (id: string) => {
        const newSet = new Set(selectedDocIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedDocIds(newSet)
    }

    const selectAll = () => {
        if (selectedDocIds.size === displayDocuments.length) {
            setSelectedDocIds(new Set())
        } else {
            setSelectedDocIds(new Set(displayDocuments.map(d => d.id)))
        }
    }

    async function handleBatchAiExecute() {
        if (selectedDocIds.size === 0) return

        setIsBatchProcessing(true)
        setBatchResult(null)
        let successCount = 0
        let failCount = 0
        const total = selectedDocIds.size

        for (const id of Array.from(selectedDocIds)) {
            setProcessingId(id)
            try {
                const result = await processWithAi(id, selectedConfig, selectedPrompt)
                if (result.success) successCount++
                else failCount++
            } catch (error) {
                failCount++
            }
        }

        setProcessingId(null)
        setIsBatchProcessing(false)
        setBatchResult({ total, success: successCount, fail: failCount })

        // 3秒后关闭概况
        setTimeout(() => {
            setBatchResult(null)
            setIsBatchMode(false)
            setSelectedDocIds(new Set())
            setIsAiPanelOpen(false)
        }, 3000)
    }

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

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (isBatchMode) {
                                setIsBatchMode(false)
                                setSelectedDocIds(new Set())
                                setIsAiPanelOpen(false)
                            } else {
                                setIsBatchMode(true)
                            }
                        }}
                        className={cn(
                            "px-4 py-2 rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-md active:scale-95 min-w-[100px]",
                            isBatchMode
                                ? "bg-indigo-600 text-white shadow-indigo-500/20"
                                : "bg-white dark:bg-card border border-border text-muted-foreground hover:text-foreground shadow-sm"
                        )}
                    >
                        <span>{isBatchMode ? "退出批量" : "批量处理"}</span>
                    </button>

                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 shrink-0 min-w-[100px] active:scale-95"
                    >
                        <span>新建文档</span>
                    </button>
                </div>
            </header>

            {/* 批量操作工具栏 */}
            {isBatchMode && (
                <div className="mb-6 p-5 glass rounded-2xl animate-in slide-in-from-top duration-300 shadow-xl border-indigo-500/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={selectAll}
                                className="text-xs font-bold text-indigo-500 hover:text-indigo-600 px-2 py-1 bg-indigo-500/5 rounded-md transition-colors"
                            >
                                {selectedDocIds.size === displayDocuments.length ? "取消全选" : "全选当前"}
                            </button>
                            <span className="text-xs text-muted-foreground font-bold">
                                已选择 <span className="text-indigo-500 text-sm">{selectedDocIds.size}</span> 个文档
                            </span>
                        </div>
                        <button
                            onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                            disabled={selectedDocIds.size === 0 || isBatchProcessing}
                            className={cn(
                                "px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50",
                                isAiPanelOpen
                                    ? "bg-indigo-600 text-white"
                                    : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                            )}
                        >
                            配置并开始
                        </button>
                    </div>

                    {isAiPanelOpen && (
                        <div className="p-4 bg-muted/20 rounded-2xl flex flex-col md:flex-row items-end gap-4 border border-border/50 animate-in fade-in zoom-in duration-200">
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider ml-1">AI 接口模型</label>
                                <select
                                    value={selectedConfig}
                                    onChange={(e) => setSelectedConfig(e.target.value)}
                                    className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-bold"
                                >
                                    {aiConfigs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    {aiConfigs.length === 0 && <option value="">未配置 API</option>}
                                </select>
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider ml-1">处理任务模板</label>
                                <select
                                    value={selectedPrompt}
                                    onChange={(e) => setSelectedPrompt(e.target.value)}
                                    className="w-full bg-background border border-border/60 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-bold"
                                >
                                    {aiPrompts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    {aiPrompts.length === 0 && <option value="">未配置提示词</option>}
                                </select>
                            </div>
                            <button
                                onClick={handleBatchAiExecute}
                                disabled={isBatchProcessing || selectedDocIds.size === 0}
                                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-muted disabled:text-muted-foreground text-white font-black rounded-xl h-[46px] px-8 flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all min-w-[160px]"
                            >
                                {isBatchProcessing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>处理中</span>
                                    </>
                                ) : (
                                    <span>开始任务</span>
                                )}
                            </button>
                        </div>
                    )}

                    {batchResult && (
                        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl animate-in zoom-in duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-bold text-indigo-600 flex items-center gap-2">
                                    <CheckCircle2 size={16} /> 批量任务完成
                                </h4>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-2 bg-background rounded-lg">
                                    <span className="block text-xs text-muted-foreground">总数</span>
                                    <span className="font-bold">{batchResult.total}</span>
                                </div>
                                <div className="p-2 bg-green-500/10 text-green-600 rounded-lg">
                                    <span className="block text-xs">成功</span>
                                    <span className="font-bold">{batchResult.success}</span>
                                </div>
                                <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
                                    <span className="block text-xs">跳过/失败</span>
                                    <span className="font-bold">{batchResult.fail}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

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
                    <div
                        key={doc.id}
                        onClick={() => isBatchMode && toggleDocSelection(doc.id)}
                        className={cn(
                            "group flex items-center justify-between p-4 bg-card border transition-all rounded-2xl shadow-sm",
                            isBatchMode ? "cursor-pointer" : "hover:shadow-xl hover:-translate-y-0.5",
                            selectedDocIds.has(doc.id) ? "border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20" : "border-border/50 hover:bg-indigo-500/5 hover:border-indigo-500/30",
                            processingId === doc.id && "ring-2 ring-indigo-500 animate-pulse"
                        )}
                    >
                        <div className="flex-1 flex items-center gap-4 overflow-hidden">
                            {isBatchMode ? (
                                <div className={cn(
                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                    selectedDocIds.has(doc.id) ? "bg-indigo-500 border-indigo-500 text-white" : "border-border bg-background"
                                )}>
                                    {selectedDocIds.has(doc.id) && <Check size={14} strokeWidth={3} />}
                                </div>
                            ) : (
                                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all transform group-hover:rotate-12 shrink-0">
                                    <FileText size={22} />
                                </div>
                            )}

                            <div className="overflow-hidden flex-1">
                                <div className="flex items-center gap-2">
                                    {isBatchMode ? (
                                        <span className="font-bold text-foreground truncate text-lg">{doc.title}</span>
                                    ) : (
                                        <Link href={`/editor/${doc.id}`} className="font-bold text-foreground group-hover:text-indigo-600 transition-colors truncate text-lg">
                                            {doc.title}
                                        </Link>
                                    )}
                                    {processingId === doc.id && (
                                        <Loader2 size={14} className="animate-spin text-indigo-500" />
                                    )}
                                </div>
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
                        </div>

                        {!isBatchMode && (
                            <div className="flex items-center">
                                {confirmDeleteId === doc.id ? (
                                    <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                handleDelete(doc.id)
                                                setConfirmDeleteId(null)
                                            }}
                                            className="bg-destructive text-white p-2 rounded-xl shadow-lg hover:scale-110 transition-transform active:scale-95"
                                            title="确认删除"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setConfirmDeleteId(null)
                                            }}
                                            className="bg-muted text-muted-foreground p-2 rounded-xl shadow-sm hover:bg-secondary transition-colors"
                                            title="取消"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setConfirmDeleteId(doc.id)
                                        }}
                                        className="text-muted-foreground hover:text-white md:opacity-0 group-hover:opacity-100 transition-all p-2.5 hover:bg-destructive rounded-xl shrink-0 shadow-sm"
                                        title="删除文档"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        )}
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
