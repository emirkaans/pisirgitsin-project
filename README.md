# 🍳 PişirGitsin

PişirGitsin, yemek tarifleri keşfetmek ve yemek yapma sürecini daha pratik hale getirmek amacıyla geliştirilmiş bir web uygulamasıdır.

Kullanıcılar tarifleri görüntüleyebilir, malzemelere göre arama yapabilir ve kendilerine uygun yemek önerileri alabilir. Kayıtlı kullanıcılar ise favori listeleri, menüler ve alışveriş listeleri oluşturarak uygulamayı daha aktif şekilde kullanabilir.

🌐 Canlı site: https://pisir-gitsin.netlify.app/

---

## ✨ Özellikler

### Herkes İçin
- Yemek tariflerini görüntüleme
- Malzemeye göre tarif arama
- Akıllı tarif önerileri
- Basit ve kullanıcı dostu arayüz

### Kayıtlı Kullanıcılar İçin
- Tarifleri favorilere ekleme
- Günlük / haftalık menü oluşturma
- Menüye eklenen yemeklere göre otomatik alışveriş listesi
- Menü ve favorileri düzenleme

---

## 🛒 Alışveriş Listesi
Menüye eklenen tariflerde yer alan malzemeler otomatik olarak tek bir alışveriş listesinde toplanır.  
Bu sayede alışverişe çıkmadan önce eksik malzemeleri kolayca görmek mümkün olur.

---

## 🧠 Akıllı Öneriler
Uygulama, kullanıcıların:
- görüntülediği tarifleri
- favorilere eklediklerini
- menülerini

dikkate alarak benzer ve ilgili tarifler önermeye çalışır.

---

## 🧑‍💻 Kullanılan Teknolojiler

- **Next.js** – Uygulama altyapısı ve sayfa yönetimi
- **Supabase** – Kimlik doğrulama, veritabanı ve backend servisleri
- **Netlify** – Deployment ve hosting

---

## ⚙️ Kurulum

Projeyi lokal ortamda çalıştırmak için:

```bash
git clone https://github.com/emirkaans/pisirgitsin-project.git
cd pisirgitsin-project
npm install
npm run dev
