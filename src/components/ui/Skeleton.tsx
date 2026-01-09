export function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
    );
}

export function TableRowSkeleton({ cols }: { cols: number }) {
    return (
        <tr>
            {[...Array(cols)].map((_, i) => (
                <td key={i} className="px-6 py-4 whitespace-nowrap">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                </div>
            </div>
        </div>
    );
}
