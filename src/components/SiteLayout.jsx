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
      <Outlet />
      {contact ? null : <SiteDock />}
    </>
  )
}
