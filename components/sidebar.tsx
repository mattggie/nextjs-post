'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Folder, FolderOpen, Plus, Trash2, LogOut, Settings } from 'lucide-react'
import { createFolder, deleteFolder, signOut } from '@/app/actions'
import { cn } from '@/utils/cn'

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

export default function Sidebar({ folders, user }: { folders: FolderType[], user: any }) {
    const tree = useMemo(() => buildTree(folders), [folders])
    const [newFolderName, setNewFolderName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const pathname = usePathname()

    async function handleSignOut() {
        await signOut()
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!newFolderName) return
        const formData = new FormData()
        formData.set('name', newFolderName)
        formData.set('parentId', 'null')
        await createFolder(formData)
        setNewFolderName('')
        setIsCreating(false)
    }

    return (
        <aside className="w-64 bg-secondary/30 backdrop-blur-xl border-r border-border h-full flex flex-col shrink-0">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    DocSpace
                </span>
                <button onClick={handleSignOut} className="text-muted-foreground hover:text-foreground transition-colors" title="退出登录">
                    <LogOut size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                <TreeNode nodes={tree} />

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

            <div className="p-4 border-t border-border">
                {/* 设置链接 */}
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors mb-3",
                        pathname === '/settings'
                            ? "bg-indigo-500/10 text-indigo-500"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                >
                    <Settings size={14} /> 账户设置
                </Link>

                {/* 用户信息 */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold overflow-hidden">
                        {user.user_metadata?.avatar ? (
                            <span className="text-base">{user.user_metadata.avatar}</span>
                        ) : (
                            user.email?.[0].toUpperCase()
                        )}
                    </div>
                    <span className="truncate flex-1 font-medium">{user.email}</span>
                </div>
            </div>
        </aside>
    )
}

function TreeNode({ nodes, level = 0 }: { nodes: any[], level?: number }) {
    const pathname = usePathname()

    return (
        <div className="flex flex-col gap-0.5">
            {nodes.map(node => {
                const isActive = pathname === `/folder/${node.id}`
                return (
                    <div key={node.id}>
                        <Link
                            href={`/folder/${node.id}`}
                            className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all group relative",
                                isActive ? "bg-indigo-500/10 text-indigo-500 font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                            style={{ paddingLeft: `${(level * 12) + 8}px` }}
                        >
                            {isActive ? <FolderOpen size={16} className="shrink-0" /> : <Folder size={16} className="shrink-0" />}
                            <span className="truncate">{node.name}</span>

                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (confirm('确定删除该文件夹及其内容吗？')) deleteFolder(node.id)
                                }}
                                className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-opacity"
                            >
                                <Trash2 size={12} />
                            </button>
                        </Link>
                        {node.children.length > 0 && <TreeNode nodes={node.children} level={level + 1} />}
                    </div>
                )
            })}
        </div>
    )
}
