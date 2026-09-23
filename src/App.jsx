import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ContentProvider } from './cms/ContentContext'
import SiteLayout from './components/SiteLayout'
import { LocaleProvider } from './i18n/LocaleContext'
import AboutPage from './pages/AboutPage'
import AdminPage from './pages/AdminPage'
import ContactPage from './pages/ContactPage'
import EventsPage from './pages/EventsPage'
import GalleryPage from './pages/GalleryPage'
import Home from './pages/Home'
import VideosPage from './pages/VideosPage'

export default function App() {
  return (
    <ContentProvider>
      <BrowserRouter>
        <LocaleProvider>
          <Routes>
            <Route path="/admin" element={<AdminPage />} />
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/hakkimda" element={<AboutPage />} />
              <Route path="/hakkimda/" element={<AboutPage />} />
              <Route path="/videos" element={<VideosPage />} />
              <Route path="/videos/" element={<VideosPage />} />
              <Route path="/etkinlikler" element={<EventsPage />} />
              <Route path="/etkinlikler/" element={<EventsPage />} />
              <Route path="/gorseller" element={<GalleryPage />} />
              <Route path="/gorseller/" element={<GalleryPage />} />
              <Route path="/iletisim" element={<ContactPage />} />
              <Route path="/iletisim/" element={<ContactPage />} />
              <Route path="/en" element={<Home />} />
              <Route path="/en/" element={<Home />} />
              <Route path="/en/about" element={<AboutPage />} />
              <Route path="/en/about/" element={<AboutPage />} />
              <Route path="/en/videos" element={<VideosPage />} />
              <Route path="/en/videos/" element={<VideosPage />} />
              <Route path="/en/events" element={<EventsPage />} />
              <Route path="/en/events/" element={<EventsPage />} />
              <Route path="/en/gallery" element={<GalleryPage />} />
              <Route path="/en/gallery/" element={<GalleryPage />} />
              <Route path="/en/contact" element={<ContactPage />} />
              <Route path="/en/contact/" element={<ContactPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </LocaleProvider>
      </BrowserRouter>
    </ContentProvider>
  )
}
