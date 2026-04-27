<div align="center">

<img src="public/favicon.svg" width="80" height="80" alt="TaskFlow Logo" />

# TaskFlow

**Modern, hızlı ve kullanımı kolay Kanban proje yönetim uygulaması**

[![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

[🚀 Canlı Demo](https://taskflow-six-murex.vercel.app) · [🐛 Hata Bildir](https://github.com/behadogangun/taskflow/issues) · [💡 Özellik İste](https://github.com/behadogangun/taskflow/issues)

</div>

---

## 📖 Hakkında

TaskFlow, Trello'dan ilham alınarak geliştirilmiş, modern web teknolojileriyle inşa edilmiş bir Kanban proje yönetim uygulamasıdır. Bireysel kullanım ve ekip işbirliği için tasarlanmıştır.

---

## ✨ Özellikler

<table>
<tr>
<td width="50%">

### 🗂️ Kanban Yönetimi
- ✅ Board, sütun ve kart oluşturma
- ✅ Sürükle-bırak ile kartları taşıma
- ✅ **Sütun sıralama** sürükle-bırak ile
- ✅ Sıralama sayfa yenilemesinde korunur
- ✅ Inline başlık düzenleme

### 🃏 Kart Özellikleri
- ✅ Öncelik seviyeleri (🟢 🟡 🔴) — opsiyonel
- ✅ Son teslim tarihi — geciken kartlar kırmızı border
- ✅ Atanan kişi
- ✅ Alt görevler + renk değişen ilerleme çubuğu
- ✅ Yorumlar
- ✅ Kart tamamlama — yeşil border + kimin tamamladığı
- ✅ Renkli etiketler (Bug, Feature, Design, Backend, Frontend, Urgent)

### 🔍 Arama & Filtreleme
- ✅ Kart başlığı ve açıklamasına göre arama
- ✅ Önceliğe göre filtreleme
- ✅ Son teslim tarihine göre sıralama
- ✅ Arama çubuğu hızlı temizle butonu

</td>
<td width="50%">

### 👥 İşbirliği
- ✅ Davet kodu ile workspace paylaşımı
- ✅ Collaborator yönetimi
- ✅ Tam düzenleme yetkisi
- ✅ Aktivite geçmişi (gerçek zamanlı)
- ✅ Workspace'ten çıkma

### 📊 İstatistikler & Dashboard
- ✅ Board istatistik çubuğu
- ✅ Tamamlanan / Geciken / Devam Eden kart sayıları
- ✅ Renk değişen progress bar
- ✅ Dashboard'da geciken kart uyarı bandı (board adı ile)
- ✅ Dashboard'da bugün/yarın biten kart uyarısı
- ✅ Board kartlarında kart sayısı

### 🎨 UI & Deneyim
- ✅ Dark / Light mode
- ✅ Board rengi seçimi (8 renk)
- ✅ Klavye kısayolları
- ✅ Toast bildirimleri
- ✅ Skeleton loading
- ✅ Boş sütun & board empty state
- ✅ Mobil uyumlu — bottom sheet modal
- ✅ Sütun başlığı hover kalem ikonu
- ✅ Onay dialogları (silme işlemleri)

</td>
</tr>
</table>

---

## 🛠️ Teknoloji Stack

| Katman | Teknoloji | Tercih Sebebi |
|--------|-----------|---------------|
| **Framework** | Next.js 15 (App Router) | Server/client ayrımı, Vercel uyumu |
| **Dil** | TypeScript | Tip güvenliği, daha az hata |
| **Veritabanı** | Supabase (PostgreSQL) | RLS, Auth, gerçek zamanlı |
| **Drag & Drop** | dnd-kit | Aktif geliştirme, touch desteği, react-beautiful-dnd'nin bakımsız kalması |
| **Stil** | Tailwind CSS | Hızlı, responsive, dark mode |
| **State** | Custom Hooks | Temiz mimari, sade state yönetimi |

---

## 🏗️ Proje Mimarisi

| Klasör | İçerik |
|--------|--------|
| `app/board/[id]/` | Kanban tahtası — BoardClient, Column, CardItem, SortableColumn |
| `app/dashboard/` | Board listesi |
| `app/profile/` | Profil & collaboration |
| `app/auth/callback/` | Email doğrulama callback |
| `app/login/` | Giriş sayfası |
| `app/register/` | Kayıt sayfası |
| `components/board/` | CardModal, Checklist, Comments, ActivityLog |
| `components/providers/` | ThemeProvider, ToastProvider |
| `components/ui/` | Logo, UserMenu, ConfirmDialog, PriorityBadge |
| `hooks/useBoard.ts` | Kanban CRUD + drag & drop (kart + sütun) |
| `hooks/useBoards.ts` | Dashboard board yönetimi |
| `lib/supabase/` | Client & Server instance |
| `lib/utils.ts` | Yardımcı fonksiyonlar |
| `types/index.ts` | TypeScript tipleri |

---

## 💡 Teknik Kararlar

### 🔢 Sıralama Algoritması

Her kart ve sütun `position: float` alanı tutar. İki öğe arasına ekleme yaparken:
newPosition = (prevCard.position + nextCard.position) / 2
Tüm listeyi yeniden numaralandırmak gerekmez. Sadece taşınan öğe güncellenir — O(1) işlem.

### 🖱️ Drag & Drop Stratejisi

`react-beautiful-dnd` yerine `dnd-kit` tercih edildi çünkü:
- react-beautiful-dnd bakım almıyor
- `PointerSensor` + `TouchSensor` ile hem mouse hem dokunmatik ekran desteği
- `DragOverlay` ile sürükleme sırasında görsel kopya
- Optimistik UI — state önce güncellenir, ardından veritabanına yazılır
- Tek `DndContext` içinde hem kart hem sütun sıralama — `rectIntersection` ve `closestCorners` collision detection'ları dinamik olarak seçiliyor

### 🔐 Güvenlik Mimarisi

- **Client (Browser):** React Components + Custom Hooks
- **Next.js Middleware:** Route koruma ve kimlik doğrulama
- **Supabase:** PostgreSQL + Row Level Security + Auth
- Her kullanıcı yalnızca kendi verilerine erişebilir

---

## 🗄️ Veritabanı Şeması

```sql
boards        (id, title, owner_id, color, created_at)
columns       (id, board_id, title, position, created_at)
cards         (id, column_id, title, description, position,
               priority, due_date, assignee, completed,
               completed_by, labels, created_at)
profiles      (id, full_name, email, created_at)
collaborators (id, owner_id, collaborator_id, created_at)
invitations   (id, owner_id, code, created_at)
checklists    (id, card_id, title, completed, position, created_at)
comments      (id, card_id, user_id, content, created_at)
activities    (id, card_id, board_id, user_id, action, detail, created_at)
```

---

## 🧪 Kalite Güvencesi

TaskFlow, production'a almadan önce aşağıdaki senaryolar kapsamlı şekilde test edilmiştir.

### 🔐 Auth & Güvenlik
| Senaryo | Sonuç |
|---------|-------|
| Kayıt, giriş, email doğrulama | ✅ |
| Yanlış şifre ile giriş | ✅ Hata mesajı |
| Şifre değiştirme | ✅ |
| Yetkisiz `/dashboard` erişimi | ✅ Login'e yönlendirme |
| RLS ile kullanıcı verisi izolasyonu | ✅ |

### 📋 Board & Sütun
| Senaryo | Sonuç |
|---------|-------|
| Board oluşturma, düzenleme, silme | ✅ |
| Sütun ekleme, başlık düzenleme, silme | ✅ |
| Sütun sürükle-bırak sıralama | ✅ |
| Sıralama sayfa yenilemede korunma | ✅ |
| Uzun board adı truncate | ✅ |

### 🃏 Kart İşlemleri
| Senaryo | Sonuç |
|---------|-------|
| Kart oluşturma, düzenleme, silme | ✅ |
| Öncelik, tarih, atanan kişi, etiket | ✅ |
| Yeni kart prioritysiz gelir | ✅ |
| Alt görevler + renk değişen progress bar | ✅ |
| Yorumlar | ✅ |
| Kart tamamlama / geri alma | ✅ |
| Tamamlanan kart yeşil border | ✅ |
| Geçmiş tarihli kart kırmızı border | ✅ |
| Sürükle-bırak aynı sütun içi | ✅ |
| Sürükle-bırak sütunlar arası | ✅ |
| Kart en alta sürükleme | ✅ |
| Sıralama sayfa yenilemede korunma | ✅ |

### 🔍 Arama & Filtreleme
| Senaryo | Sonuç |
|---------|-------|
| Başlık ve açıklamaya göre arama | ✅ |
| Arama çubuğu hızlı temizle | ✅ |
| Önceliğe göre filtreleme | ✅ |
| Tarihe göre sıralama | ✅ |

### 👥 İşbirliği
| Senaryo | Sonuç |
|---------|-------|
| Davet kodu oluşturma ve kopyalama | ✅ |
| Başka hesapla workspace'e katılma | ✅ |
| Paylaşılan board'lara erişim | ✅ |
| Collaborator ekleme ve kaldırma | ✅ |
| Workspace'ten çıkma | ✅ |
| Aktivite geçmişi gerçek zamanlı | ✅ |

### 📱 Mobil Uyumluluk
| Senaryo | Sonuç |
|---------|-------|
| Tüm sayfalar responsive | ✅ |
| Kart modal bottom sheet | ✅ |
| Modal arka plan scroll lock | ✅ |
| Yatay sütun kaydırma | ✅ |
| Edit/sil butonları görünürlüğü | ✅ |

### ⚡ Edge Cases
| Senaryo | Sonuç |
|---------|-------|
| Uzun metin taşma kontrolü | ✅ |
| Boş state'ler (board, sütun, kart) | ✅ |
| Dark/Light mode tüm sayfalarda | ✅ |
| İnternet kesintisinde hata mesajları | ✅ |

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- Supabase hesabı

### Adımlar

```bash
# 1. Repoyu klonla
git clone https://github.com/behadogangun/taskflow.git
cd taskflow

# 2. Bağımlılıkları yükle
npm install

# 3. Environment variables oluştur
cp .env.example .env.local
```

`.env.local` dosyasını düzenle:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
# 4. Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini aç.

---

## ⌨️ Klavye Kısayolları

| Kısayol | Eylem |
|---------|-------|
| `Ctrl + Shift + N` | Yeni sütun ekle |
| `Ctrl + Shift + B` | Dashboard'a dön |
| `Ctrl + Shift + D` | Tema değiştir |
| `?` | Kısayolları göster |
| `Esc` | Modalı kapat |
| `Enter` | Onayla / Kaydet |

---

## 📄 Lisans

MIT © 2026 [Beha Dogangun](https://github.com/behadogangun)

---

<div align="center">

**TaskFlow** ile projelerinizi daha verimli yönetin 🚀

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

</div>