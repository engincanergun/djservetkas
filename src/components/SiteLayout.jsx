import { Outlet, useLocation } from 'react-router-dom'
import { pageFromPath } from '../i18n/LocaleContext'
import CustomCursor from './CustomCursor'
import Navigation from './Navigation'
import SiteDock from './SiteDock'

export default function SiteLayout() {
  const { pathname } = useLocation()
  const home = pathname === '/' || pathname === '/en' || pathname === '/en/'
  const contact = pageFromPath(pathname) === 'contact'

  return (
    <>
      <CustomCursor />
      <Navigation overlay={home} />
      <div className={home ? undefined : 'flex h-svh flex-col md:block md:h-auto'}>
        <div className={home ? undefined : 'min-h-0 flex-1 overflow-y-auto md:overflow-visible'}>
          <Outlet />
        </div>
        {contact ? null : <SiteDock home={home} />}
      </div>
    </>
  )
}
