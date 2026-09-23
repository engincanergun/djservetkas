import { Outlet, useLocation } from 'react-router-dom'
import CustomCursor from './CustomCursor'
import Navigation from './Navigation'

export default function SiteLayout() {
  const { pathname } = useLocation()
  const home = pathname === '/' || pathname === '/en'

  return (
    <>
      <CustomCursor />
      <Navigation overlay={home} />
      <Outlet />
    </>
  )
}
