import { useContent } from '../cms/ContentContext'

export default function MediaImg({ src, alt = '', className = '', ...props }) {
  const { mediaUrl } = useContent()
  const url = mediaUrl(src)
  if (!url) return <div className={`bg-[#111] ${className}`} aria-hidden />
  return <img src={url} alt={alt} className={className} {...props} />
}
