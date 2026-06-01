export default function StatCard({ icon: Icon, label, value, sub, color = 'blue', onClick }) {
  const colorMap = {
    blue:   'from-blue-500 to-blue-600',
    green:  'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    amber:  'from-amber-500 to-amber-600',
    red:    'from-red-500 to-red-600',
    navy:   'from-primary-600 to-primary-800',
    gold:   'from-gold-500 to-gold-600',
  }
  return (
    <div
      onClick={onClick}
      className={`card p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all' : ''}`}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.blue} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
