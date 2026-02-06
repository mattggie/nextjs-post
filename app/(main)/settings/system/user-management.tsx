'use client'

import { useState } from 'react'
import { Plus, Trash2, UserCog, Shield, User, Loader2 } from 'lucide-react'
import { createUser, deleteUser, updateUserRole } from './actions'
import Loading from '@/components/loading'

export default function UserManagement({ initialUsers, currentUserId }: { initialUsers: any[], currentUserId: string }) {
    const [users, setUsers] = useState(initialUsers)
    const [isCreating, setIsCreating] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const res = await createUser(formData)

        if (res?.error) {
            setError(res.error)
            setIsLoading(false)
        } else {
            // 简单处理：重新加载页面或通过服务器操作 revalidate 自动更新（如果直接使用 List 渲染可能需要刷新数据）
            window.location.reload()
        }
    }

    async function handleDelete(userId: string) {
        if (!confirm('确定要删除此用户吗？此操作不可逆。')) return
        setIsLoading(true)
        const res = await deleteUser(userId)
        if (res?.error) {
            alert(res.error)
            setIsLoading(false)
        } else {
            window.location.reload()
        }
    }

    async function toggleRole(userId: string, currentRole: string) {
        const newRole = currentRole === 'admin' ? 'user' : 'admin'
        setIsLoading(true)
        const res = await updateUserRole(userId, newRole)
        if (res?.error) {
            alert(res.error)
            setIsLoading(false)
        } else {
            window.location.reload()
        }
    }

    return (
        <div className="space-y-6">
            {isLoading && <Loading message="正在更新用户数据..." />}

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <UserCog className="text-indigo-500" size={24} />
                    用户管理
                </h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={18} /> 新增用户
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreateUser} className="bg-card border-2 border-indigo-500/20 p-6 rounded-2xl animate-in zoom-in-95 duration-200">
                    <h3 className="font-bold mb-4">创建新账号</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">邮箱</label>
                            <input name="email" type="email" required className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-indigo-500/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">初始密码</label>
                            <input name="password" type="password" required className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-indigo-500/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">权限角色</label>
                            <select name="role" className="w-full bg-background border rounded-lg px-3 py-2 outline-none focus:ring-2 ring-indigo-500/50">
                                <option value="user">普通用户</option>
                                <option value="admin">管理员</option>
                            </select>
                        </div>
                    </div>
                    {error && <p className="text-destructive text-sm mt-4">{error}</p>}
                    <div className="flex gap-2 mt-6">
                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium">确认创建</button>
                        <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2 border rounded-lg">取消</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 gap-3">
                {users.map(u => (
                    <div key={u.id} className="bg-card border border-border/50 p-4 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center relative overflow-hidden">
                                {u.user_metadata?.avatar ? (
                                    <span className="text-xl">{u.user_metadata.avatar}</span>
                                ) : (
                                    <User size={20} className="text-muted-foreground" />
                                )}
                                {u.user_metadata?.role === 'admin' && (
                                    <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white p-0.5 rounded-full ring-2 ring-card">
                                        <Shield size={10} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold">{u.email}</p>
                                    {u.id === currentUserId && <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded-full font-bold">我自己</span>}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {u.user_metadata?.role === 'admin' ? '系统管理员' : '普通用户'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => toggleRole(u.id, u.user_metadata?.role)}
                                className="p-2 text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
                                title="修改角色"
                            >
                                <Shield size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(u.id)}
                                disabled={u.id === currentUserId}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all disabled:opacity-0"
                                title="删除用户"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
