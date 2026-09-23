export default function PageShell({ title, children, wide = false }) {
  return (
    <main className="min-h-svh overflow-x-clip bg-[#080808] px-4 pb-16 sm:px-6 md:px-8 md:pb-20">
      <h1 className="px-8 pt-24 text-center text-[11px] leading-relaxed font-medium tracking-[0.18em] text-balance text-white uppercase sm:pt-28 sm:tracking-[0.28em] md:px-12 md:pt-[18vh] md:text-xs md:tracking-[0.36em] lg:pt-[22vh] lg:tracking-[0.46em]">
        {title}
      </h1>
      <div className={`mx-auto mt-12 md:mt-16 lg:mt-20 ${wide ? 'max-w-[1864px]' : 'max-w-7xl'}`}>{children}</div>
    </main>
  )
}
