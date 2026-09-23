# DJ Servet Kaş

Sayfalar ayrı açılır. Ana sayfada yalnızca video + altta sosyal / e-posta vardır.

```bash
npm install
npm run dev
```

## Marka sahibi: içerik paneli

Adres: `/admin`  
Şifre: `servetkas` (`src/data/artist.js` içinde `cmsPin`)

Panelden:

- Ana sayfa videosu ve poster yükleme
- Hakkımda metni ve görseli
- YouTube video ID’leri
- Galeri fotoğrafları (bilgisayar / telefon)
- Event takvimi
- E-posta, telefon, sosyal linkler

Yüklenen dosyalar **bu tarayıcıda** saklanır (IndexedDB). Başka bilgisayarda görünmez. Kalıcı yayın için dosyaları `public/media/` klasörüne koyup panelde URL olarak `/media/dosya.jpg` yazın.

YouTube: videonun adresindeki `v=` değerini yapıştırın.
