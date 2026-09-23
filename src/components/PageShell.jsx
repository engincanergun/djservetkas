export default function PageShell({ title, children, wide = false }) {
  return (
    <main className="min-h-svh bg-[#080808] px-5 pb-20">
      <h1 className="pt-[22vh] text-center text-[11px] font-medium tracking-[0.46em] text-white uppercase md:pt-[24vh] md:text-xs">
        {title}
      </h1>
      <div className={`mx-auto mt-16 md:mt-20 ${wide ? 'max-w-[1864px]' : 'max-w-7xl'}`}>{children}</div>
    </main>
  )
}
