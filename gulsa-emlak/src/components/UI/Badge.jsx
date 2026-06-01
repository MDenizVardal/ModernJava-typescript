const colorMap = {
  green:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  amber:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  red:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  gray:   'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  gold:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  navy:   'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
}

export default function Badge({ children, color = 'gray', className = '', size = 'sm' }) {
  const sz = size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${sz} ${colorMap[color] || colorMap.gray} ${className}`}>
      {children}
    </span>
  )
}
