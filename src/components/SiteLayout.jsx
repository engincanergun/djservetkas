import { Outlet, useLocation } from 'react-router-dom'
import { pageFromPath } from '../i18n/LocaleContext'
import CustomCursor from './CustomCursor'
import Navigation from './Navigation'
import SiteCredit from './SiteCredit'
import SiteDock from './SiteDock'

export default function SiteLayout() {
  const { pathname } = useLocation()
  const home = pathname === '/' || pathname === '/en' || pathname === '/en/'
  const contact = pageFromPath(pathname) === 'contact'

  return (
    <>
      <CustomCursor />
      <Navigation overlay={home} />
      <div className={home ? undefined : 'flex h-svh flex-col'}>
        <div className={home ? undefined : 'min-h-0 flex-1 overflow-y-auto'}>
          <Outlet />
        </div>
        {contact ? (
          <div className="pointer-events-none z-40 flex shrink-0 justify-center bg-[#080808] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-10 md:pb-8">
            <SiteCredit />
          </div>
        ) : (
          <SiteDock home={home} />
        )}
      </div>
    </>
  )
}
