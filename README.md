# TaskFlow — Kanban Proje Yönetim Tahtası

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)

> Trello benzeri, gerçek zamanlı Kanban proje yönetim uygulaması.

🔗 **[Canlı Demo](https://taskflow-juwomv52h-behadoganguns-projects.vercel.app)**

---

## ✨ Özellikler

- 🔐 Kullanıcı kaydı ve girişi (email doğrulama)
- 📋 Board oluşturma, renk seçimi, düzenleme, silme
- 🗂️ Sütun ekleme, başlık düzenleme
- 🃏 Kart ekleme, düzenleme, silme
- 🖱️ Sürükle-bırak (aynı sütun içi + sütunlar arası)
- 💾 Sıralama sayfa yenilemesinde korunuyor
- 🚩 Öncelik/Flag sistemi (Düşük 🟢 / Orta 🟡 / Yüksek 🔴)
- 📅 Son teslim tarihi
- 👤 Atanan kişi (Assignee)
- ✅ Alt görevler (Checklist + ilerleme çubuğu)
- 💬 Yorumlar
- ☑️ Kart tamamlama (kimin tamamladığı gösterilir)
- 🔍 Kart arama ve önceliğe göre filtreleme
- 📅 Tarihe göre sıralama
- 🔑 Davet kodu ile workspace paylaşımı
- 👥 Tam collaboration desteği (düzenleme + yorum)
- 🌙 Dark / Light mode
- 🎨 Board rengi seçimi
- ⌨️ Klavye kısayolları
- 🔔 Toast bildirimleri
- ⚡ Skeleton loading
- 📱 Responsive tasarım

---

## 🛠️ Teknoloji Stack

| Teknoloji | Neden Seçildi |
|---|---|
| **Next.js 15** | App Router, server/client ayrımı, Vercel uyumu |
| **TypeScript** | Tip güvenliği, daha az hata |
| **Supabase** | PostgreSQL + Auth + RLS |
| **dnd-kit** | Aktif geliştirme, touch desteği, TypeScript uyumlu |
| **Tailwind CSS** | Hızlı geliştirme, dark mode desteği |

---

## 💡 Teknik Kararlar

### Sıralama Algoritması
Her kart `position: float` alanı tutar. İki kart arasına eklerken:
newPosition = (prevCard.position + nextCard.position) / 2
Tüm listeyi yeniden sıralamak gerekmez, sadece tek kart güncellenir.

### Drag & Drop
`dnd-kit` tercih edildi çünkü `react-beautiful-dnd` artık bakım almıyor. `PointerSensor` + `TouchSensor` ile hem mouse hem dokunmatik ekran desteği sağlandı.

### Güvenlik
Row Level Security (RLS) ile her kullanıcı sadece kendi verilerine erişebilir. Middleware ile korunan rotalar server-side kontrol edilir.

---

## 🚀 Kurulum

```bash
git clone https://github.com/behadogangun/taskflow.git
cd taskflow
npm install
```

`.env.local` dosyası oluştur:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

---

## 🔐 Güvenlik

- Row Level Security (RLS) tüm tablolarda aktif
- Middleware ile korunan rotalar
- Email doğrulama zorunlu
- Davet kodu olmadan workspace erişimi yok