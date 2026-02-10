'use client'

import { useState, useMemo, useOptimistic, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Folder, FolderOpen, Plus, Trash2, LogOut, Settings, Check, X } from 'lucide-react'
import { createFolder, deleteFolder, signOut } from '@/app/actions'
import { cn } from '@/utils/cn'
import Loading from './loading'
import { ThemeToggle } from './theme-toggle'

type FolderType = {
    id: string
    name: string
    parent_id: string | null
}

function buildTree(folders: FolderType[]) {
    const map: Record<string, FolderType & { children: any[] }> = {}
    const roots: any[] = []

    folders.forEach(f => {
        map[f.id] = { ...f, children: [] }
    })

    folders.forEach(f => {
        if (f.parent_id && map[f.parent_id]) {
            map[f.parent_id].children.push(map[f.id])
        } else {
            roots.push(map[f.id])
        }
    })

    return roots
}

export default function Sidebar({ folders: initialFolders, user }: { folders: FolderType[], user: any }) {
    const [isPending, startTransition] = useTransition()
    const [optimisticFolders, addOptimisticFolder] = useOptimistic(
        initialFolders,
        (state: FolderType[], { action, folder }: { action: 'add' | 'delete', folder: FolderType }) => {
            if (action === 'add') return [...state, folder]
            if (action === 'delete') return state.filter(f => f.id !== folder.id)
            return state
        }
    )

    const tree = useMemo(() => buildTree(optimisticFolders), [optimisticFolders])
    const [newFolderName, setNewFolderName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [isGlobalLoading, setIsGlobalLoading] = useState(false)
    const pathname = usePathname()

    // 品牌设置：优先使用元数据，其次环境变量，最后默认值
    const siteName = user.user_metadata?.site_name || process.env.NEXT_PUBLIC_SITE_NAME || 'DocSpace'
    const siteGradient = user.user_metadata?.site_gradient || 'from-indigo-500 to-purple-500'

    async function handleSignOut() {
        setIsGlobalLoading(true)
        await signOut()
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!newFolderName) return

        const tempId = Math.random().toString()
        const newFolder = { id: tempId, name: newFolderName, parent_id: null }

        startTransition(async () => {
            addOptimisticFolder({ action: 'add', folder: newFolder })
            setNewFolderName('')
            setIsCreating(false)

            const formData = new FormData()
            formData.set('name', newFolderName)
            formData.set('parentId', 'null')
            await createFolder(formData)
        })
    }

    const handleDelete = async (id: string) => {
        startTransition(async () => {
            addOptimisticFolder({ action: 'delete', folder: { id, name: '', parent_id: null } })
            await deleteFolder(id)
        })
    }

    // 在手机端点击链接后自动关闭侧边栏
    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            setIsOpen(false)
        }
    }

    return (
        <>
            {isGlobalLoading && <Loading message="正在退出..." />}
            {/* 手机端背景遮罩 */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* 手机端汉堡菜单按钮 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 bg-background border rounded-lg shadow-lg md:hidden hover:bg-muted transition-colors"
                aria-label="切换菜单"
            >
                {isOpen ? <Plus className="rotate-45" size={20} /> : <div className="flex flex-col gap-1 w-5"><div className="h-0.5 bg-foreground"></div><div className="h-0.5 bg-foreground"></div><div className="h-0.5 bg-foreground"></div></div>}
            </button>

            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-background/80 backdrop-blur-xl border-r border-border h-full flex flex-col shrink-0 transition-transform duration-300 md:relative md:translate-x-0 shadow-2xl md:shadow-none",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <span className={cn(
                        "font-bold bg-gradient-to-r bg-clip-text text-transparent truncate text-lg",
                        siteGradient
                    )}>
                        {siteName}
                    </span>
                    <div className="flex items-center gap-1">
                        <ThemeToggle />
                        <button onClick={handleSignOut} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="退出登录">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 scrollbar-none" onClick={handleLinkClick}>
                    <TreeNode nodes={tree} onDelete={handleDelete} />

                    {isCreating ? (
                        <form onSubmit={handleCreate} className="px-2 py-1 mt-2">
                            <input
                                autoFocus
                                className="w-full bg-background border rounded px-2 py-1 text-sm outline-none focus:ring-1 ring-indigo-500"
                                placeholder="文件夹名称..."
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                onBlur={() => !newFolderName && setIsCreating(false)}
                            />
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors mt-2"
                        >
                            <Plus size={14} /> 新建文件夹
                        </button>
                    )}
                </div>

                <div className="p-4 border-t border-border space-y-1">
                    {/* 系统设置 - 仅管理员可见 */}
                    {user.user_metadata?.role === 'admin' && (
                        <Link
                            href="/settings/system"
                            onClick={handleLinkClick}
                            className={cn(
                                "flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors",
                                pathname.startsWith('/settings/system')
                                    ? "bg-indigo-500/10 text-indigo-500 font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Settings size={14} className="text-purple-500" /> 系统设置
                        </Link>
                    )}

                    {/* 用户信息 - 点击进入个人设置 */}
                    <Link
                        href="/settings"
                        onClick={handleLinkClick}
                        className={cn(
                            "flex items-center gap-2 px-2 py-2 rounded-lg transition-all",
                            pathname === '/settings'
                                ? "bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold overflow-hidden shrink-0">
                            {user.user_metadata?.avatar ? (
                                <span className="text-base">{user.user_metadata.avatar}</span>
                            ) : (
                                user.email?.[0].toUpperCase()
                            )}
                        </div>
                        <span className="truncate flex-1 text-xs font-medium">{user.email}</span>
                    </Link>
                </div>
            </aside>
        </>
    )
}

function TreeNode({ nodes, onDelete, level = 0 }: { nodes: any[], onDelete: (id: string) => void, level?: number }) {
    const pathname = usePathname()
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    return (
        <div className="flex flex-col gap-0.5" onMouseLeave={() => setConfirmDeleteId(null)}>
            {nodes.map(node => {
                const isActive = pathname === `/folder/${node.id}`
                const isConfirming = confirmDeleteId === node.id

                return (
                    <div key={node.id}>
                        <div
                            className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all group relative",
                                isActive ? "bg-indigo-500/10 text-indigo-500 font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                isConfirming && "bg-destructive/10 text-destructive"
                            )}
                            style={{ paddingLeft: `${(level * 12) + 8}px` }}
                        >
                            <Link href={`/folder/${node.id}`} className="flex items-center gap-2 flex-1 min-w-0">
                                {isActive ? <FolderOpen size={16} className="shrink-0" /> : <Folder size={16} className="shrink-0" />}
                                <span className="truncate">{node.name}</span>
                            </Link>

                            <div className="flex items-center">
                                {isConfirming ? (
                                    <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDelete(node.id)
                                                setConfirmDeleteId(null)
                                            }}
                                            className="p-1 hover:bg-destructive hover:text-white rounded transition-colors"
                                            title="确定删除"
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setConfirmDeleteId(null)
                                            }}
                                            className="p-1 hover:bg-muted rounded transition-colors"
                                            title="取消"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setConfirmDeleteId(node.id)
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-opacity"
                                        title="删除文件夹"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {node.children.length > 0 && <TreeNode nodes={node.children} onDelete={onDelete} level={level + 1} />}
                    </div>
                )
            })}
        </div>
    )
}
