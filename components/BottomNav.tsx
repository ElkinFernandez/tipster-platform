const items = [
  { key: 'inicio', label: 'Inicio', href: '/' },
  { key: 'resultados', label: 'Resultados', href: '/resultados' },
  { key: 'estadisticas', label: 'Estadisticas', href: '/estadisticas' },
  { key: 'como-funciona', label: 'Como funciona', href: '/como-funciona' },
  { key: 'perfil', label: 'Perfil', href: '/perfil' },
]

export function BottomNav(props: { active: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 bg-[#F3F1EA]/95 backdrop-blur-sm border-t border-black/15 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-3 flex justify-between text-xs">
        {items.map(function (item) {
          const isActive = item.key === props.active
          return isActive
            ? <span key={item.key} className="font-semibold text-[#1F2937]">{item.label}</span>
            : <a key={item.key} href={item.href} className="text-[#4B5563]">{item.label}</a>
        })}
      </div>
    </nav>
  )
}
