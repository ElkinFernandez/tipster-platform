import { BottomNav } from '@/components/BottomNav'

export default function ComoFuncionaPage() {
  const steps = [
    { n: '01', title: 'Se publica en Telegram', text: 'El pronostico se anuncia primero en el canal, con la cuota y el analisis, antes de que el evento ocurra.' },
    { n: '02', title: 'Se registra en la plataforma', text: 'La apuesta se carga aqui, adjuntando el enlace a la evidencia real de la cuota y la explicacion del analisis.' },
    { n: '03', title: 'Se espera el evento', text: 'El pronostico queda visible como "en juego" hasta que el partido o torneo termina y hay un resultado real.' },
    { n: '04', title: 'Se registra el resultado', text: 'Gano, perdio o se anulo. El resultado se marca aqui y las estadisticas se actualizan al instante, en publico.' },
  ]

  return (
    <div className="min-h-dvh flex flex-col bg-[#F3F1EA]">
      <header className="bg-[#1F2937] text-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
          <a href="/" className="font-display font-bold tracking-wide text-sm">RAGUX</a>
          <span className="text-xs text-white/50">EST. 2025</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-5 sm:px-8 py-6 pb-28">
        <p className="text-xs font-bold uppercase tracking-wider text-[#FF9933] mb-1">Transparencia</p>
        <h1 className="font-display text-2xl font-extrabold text-[#1F2937] mb-2">Como se registra cada pronostico</h1>
        <p className="text-sm text-[#4B5563] mb-6">Ningun resultado se anota despues de forma arbitraria. Este es el proceso exacto que sigue cada apuesta.</p>

        <div className="relative pl-8">
           {steps.map(function (s, i) {
            return (
              <div key={s.n} className={'relative ' + (i < steps.length - 1 ? 'mb-5' : '')}>
                {i < steps.length - 1 && (
                    <div className="absolute left-[-14px] top-9 bottom-[-20px] w-px bg-black/25"></div>
                )}
                <div className="absolute -left-8 top-0 w-9 h-9 rounded-full bg-[#1F2937] text-white flex items-center justify-center font-display font-extrabold text-[10.5px] border-4 border-[#F3F1EA]">{s.n}</div>
                <div className="ml-3 rounded-r-2xl border-1.5 border-l-0 border-black/15 bg-white pl-4 pr-4 py-3.5" style={{ borderLeft: '3px solid #3FA9B7' }}>
                  <h3 className="font-display text-base font-bold text-[#1F2937] mb-1">{s.title}</h3>
                  <p className="text-xs text-[#4B5563] leading-relaxed">{s.text}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="rounded-2xl bg-[#1F2937] text-white p-6 mt-6 text-center">
          <h3 className="font-display text-base font-bold mb-1.5">Todo queda a la vista.</h3>
          <p className="text-sm text-white/55 mb-4">Puedes revisar el historial completo cuando quieras.</p>
          <a href="/resultados" className="inline-block rounded-2xl bg-[#FFA94D] text-white font-bold text-sm py-2.5 px-5">Ver resultados</a>
        </div>
      </main>

      <BottomNav active="como-funciona" />
    </div>
  )
}