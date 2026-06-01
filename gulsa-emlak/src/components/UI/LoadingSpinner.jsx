export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size] || 'w-8 h-8'
  return (
    <div className={`${sz} border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin ${className}`} />
  )
}

export function FullPageLoader({ text = 'Yükleniyor...' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-slate-500 dark:text-slate-400 text-sm">{text}</p>
    </div>
  )
}
