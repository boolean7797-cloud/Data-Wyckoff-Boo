# 👻 Ghost Phaze - Trading Journal & Analytics Terminal

ระบบบันทึกและวิเคราะห์ผลการเทรด (Trading Journal & Analytics Terminal) พัฒนาด้วย React 19, TypeScript, Tailwind CSS v4 และ Express Backend พร้อมการประมวลผลด้วย Gemini AI

---

## 🚀 วิธีนำโปรเจกต์นี้ไปพัฒนาต่อบนเครื่องของคุณ (Local Development)

### 1. ความต้องการของระบบ (Prerequisites)
- **Node.js**: เวอร์ชัน 18 ขึ้นไป (แนะนำ Node.js v20 หรือ v22 LTS)
- **npm** (มาพร้อมกับ Node.js) หรือ **bun** / **yarn** / **pnpm**
- **Git** (สำหรับจัดการ Source Code)

---

### 2. ขั้นตอนการนำโปรเจกต์ไปเปิดและรัน

1. **ดาวน์โหลดโค้ด (Download ZIP หรือ Clone)**
   - จากเมนูของ Google AI Studio กด **Export to GitHub** หรือ **Download ZIP**
   - แตกไฟล์ ZIP และเปิดโฟลเดอร์ใน **VS Code**, **Cursor** หรือ Text Editor ที่คุณใช้

2. **ติดตั้ง Dependencies**
   เปิด Terminal ในโฟลเดอร์โปรเจกต์ แล้วรันคำสั่ง:
   ```bash
   npm install
   ```

3. **ตั้งค่า Environment Variables**
   - คัดลอกไฟล์ `.env.example` ไปเป็น `.env`:
     ```bash
     cp .env.example .env
     ```
     *(สำหรับ Windows PowerShell: `copy .env.example .env`)*
   - ใส่ **GEMINI_API_KEY** ของคุณในไฟล์ `.env`:
     ```env
     GEMINI_API_KEY="AIzaSy..."
     APP_URL="http://localhost:3000"
     ```
     *(สามารถขอ API Key ฟรีได้จาก [Google AI Studio](https://aistudio.google.com/))*

4. **รัน Development Server**
   ```bash
   npm run dev
   ```
   เปิดบราวเซอร์ไปที่: **`http://localhost:3000`**

---

## 🛠️ คำสั่ง Scripts ทั้งหมดในโปรเจกต์

| คำสั่ง | คำอธิบาย |
| :--- | :--- |
| `npm run dev` | สตาร์ท Express Server + Vite Middleware ในโหมด Development |
| `npm run build` | ทำการ Build แอป Client เป็น Production Bundle และรวม Express Server เป็น `dist/server.cjs` |
| `npm start` | รันเซิร์ฟเวอร์ Production จากไฟล์ที่ Build แล้ว (`dist/server.cjs`) |
| `npm run lint` | ตรวจสอบ Type Safety ด้วย TypeScript (`tsc --noEmit`) |

---

## 🚢 วิธีการ Deploy นำขึ้น Production Hosting

### 1. Deploy บน Cloud Platforms (Render / Railway / Fly.io / Heroku / Cloud Run)
โปรเจกต์นี้มี Express Backend ในตัว สามารถ Deploy เป็น Node Service ได้ทันที:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: กำหนด Environment Variable `PORT=3000` (หรือตามที่ Platform กำหนด)
- **Environment Variables**: เพิ่ม `GEMINI_API_KEY` ใน Dashboard ของผู้ให้บริการ

### 2. Deploy บน Vercel / Netlify
หากต้องการ Deploy เฉพาะ Frontend (Client-side):
- **Framework Preset**: `Vite`
- **Build Command**: `vite build`
- **Output Directory**: `dist`

---

## 📁 โครงสร้างโปรเจกต์ (Project Architecture)

```text
├── src/
│   ├── components/      # UI Components (Charts, Tables, Modals, Forms)
│   ├── types.ts         # TypeScript Interfaces & Models
│   ├── App.tsx          # Main Dashboard & View State
│   ├── main.tsx         # React DOM Entry Point
│   └── index.css        # Tailwind CSS Entry
├── server.ts            # Express Backend & AI Proxy Routes
├── vite.config.ts       # Vite & Build Configuration
├── package.json         # Dependencies & Build Scripts
└── README.md            # คู่มือการใช้งานและพัฒนาต่อ
```
