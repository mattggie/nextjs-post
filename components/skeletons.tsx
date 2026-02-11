import { cn } from "@/utils/cn"

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted/50", className)}
            {...props}
        />
    )
}

export function FileListSkeleton() {
    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto h-full space-y-8 pt-20 md:pt-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 p-4 rounded-2xl border border-border/50">
                <Skeleton className="h-10 flex-1 w-full" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-border/50 rounded-2xl">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-1/3" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function EditorSkeleton() {
    return (
        <div className="h-screen flex flex-col bg-background">
            <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4 flex-1">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-1/4" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </header>
            <div className="flex-1 flex overflow-hidden">
                <div className="w-1/2 p-6 border-r border-border">
                    <Skeleton className="h-full w-full" />
                </div>
                <div className="w-1/2 p-8">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-2" />
                </div>
            </div>
        </div>
    )
}
