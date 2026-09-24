export const pageTitleClass =
  'text-center text-[11px] leading-relaxed font-medium tracking-[0.18em] text-balance text-white uppercase sm:tracking-[0.28em] md:text-xs md:tracking-[0.36em] lg:tracking-[0.32em] xl:tracking-[0.4em]'

export default function PageShell({ title, children, wide = false }) {
  return (
    <main className="min-h-full overflow-x-clip bg-[#080808] px-4 pt-24 pb-10 sm:px-6 sm:pt-28 md:px-8 md:pt-[18vh] lg:pt-[22vh]">
      <h1 className={`px-8 md:px-12 ${pageTitleClass}`}>{title}</h1>
      <div className={`mx-auto mt-12 md:mt-16 lg:mt-20 ${wide ? 'max-w-[1864px]' : 'max-w-7xl'}`}>{children}</div>
    </main>
  )
}
