import { login } from './actions'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* 装饰元素 */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>

            <form className="z-10 glass p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent mb-2">
                        DocSpace
                    </h1>
                    <p className="text-sm text-muted-foreground">请输入您的账号密码以继续</p>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">邮箱</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="bg-secondary/50 border border-white/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-muted-foreground/50"
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">密码</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="bg-secondary/50 border border-white/5 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-muted-foreground/50"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    formAction={login}
                    className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium p-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                >
                    登 录
                </button>
            </form>
        </div>
    )
}
