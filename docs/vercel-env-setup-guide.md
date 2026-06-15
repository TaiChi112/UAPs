# Vercel Environment Variables Setup Guide

คู่มือนี้จะอธิบายขั้นตอนการเตรียมและดึงค่า Environment Variables (.env) ที่จำเป็นทั้งหมด สำหรับนำไปใส่ใน Vercel เพื่อ Deploy ระบบ UAPS (Universal Academic Portfolio System) ให้สมบูรณ์

---

## 1. วิธีนำไฟล์ `.env.vercel` ไปใส่ใน Vercel ในครั้งเดียว

เราได้เตรียมไฟล์ `.env.vercel` ไว้ที่ Root ของโปรเจกต์ (ไฟล์ชื่อ `.env.vercel`) ซึ่งรวมตัวแปรทั้งหมดไว้ให้แล้ว คุณสามารถใช้วิธี **Copy & Paste** เพื่อลดเวลาการทำงานได้ทันที:

1. เปิดไฟล์ `.env.vercel` ในโปรแกรม VS Code
2. ทำการแก้ไขค่าต่างๆ ให้เป็นค่าสำหรับ Production ตามคำแนะนำด้านล่าง
3. Copy เนื้อหาในไฟล์ทั้งหมด (`Ctrl + A` แล้ว `Ctrl + C`)
4. ไปที่ Vercel Dashboard > เลือก Project ของคุณ
5. ไปที่แท็บ **Settings** > **Environment Variables**
6. ในช่องกรอก Key ค่าแรก (ซ้ายมือ) ให้คุณกดคลิก 1 ครั้ง แล้ววาง (`Ctrl + V`) ทันที
7. Vercel จะทำการอ่านไฟล์และแยก Key-Value ออกเป็นหลายๆ บรรทัดให้อัตโนมัติ!
8. กดปุ่ม **Save** เพื่อบันทึกข้อมูล และกด Deploy ใหม่อีกครั้ง

---

## 2. แหล่งที่มาและวิธีเอาค่า Key ต่างๆ

### 🗄️ 2.1 Database (Neon Serverless Postgres)
ระบบใช้ Neon Database ในการเก็บข้อมูล คุณจำเป็นต้องใช้ Connection String ทั้งแบบ Pool (สำหรับการทำงานปกติ) และแบบ Direct (สำหรับ Prisma CLI migration)

**ขั้นตอนการดึงค่า:**
1. ไปที่ [Neon Dashboard](https://console.neon.tech/) และล็อกอินเข้าสู่ระบบ
2. เลือก Project Database ของคุณ
3. ในหน้า Dashboard ตรงหัวข้อ **Connection Details**
4. ตรวจสอบว่าเช็คบ็อกซ์ **Pooled connection** **เปิดอยู่ (Checked)**
5. ก๊อปปี้ URL มาใส่ใน `DATABASE_URL` (URL มักจะมีคำว่า `-pooler` อยู่ในนั้น)
6. นำเช็คบ็อกซ์ **Pooled connection** **ออก (Unchecked)**
7. ก๊อปปี้ URL มาใส่ใน `DIRECT_URL` (URL จะไม่มีคำว่า `-pooler`)

**ตัวแปรที่เกี่ยวข้อง:**
- `DATABASE_URL`: `postgresql://user:pass@ep-...-pooler.region.aws.neon.tech/neondb?sslmode=require`
- `DIRECT_URL`: `postgresql://user:pass@ep-....region.aws.neon.tech/neondb?sslmode=require`

---

### 🐙 2.2 GitHub OAuth (ระบบ Login)
คุณไม่สามารถใช้ GitHub App เดิมที่เป็น `localhost` สำหรับการขึ้น Production ได้ คุณต้องสร้าง App อันใหม่ใน GitHub ผูกกับโดเมนจริงของ Vercel

**ขั้นตอนการดึงค่า:**
1. ไปที่ GitHub ของคุณ: **Settings** > **Developer settings** > **OAuth Apps**
2. กดปุ่ม **New OAuth App**
3. กรอกข้อมูลดังนี้:
   - **Application name:** `UAPS Production` (หรือชื่อโปรเจกต์คุณ)
   - **Homepage URL:** โดเมนของ Vercel (เช่น `https://uaps-frontend.vercel.app`)
   - **Authorization callback URL:** `https://<โดเมนของ Backend API>/v1/auth/github/callback`
     *(ถ้า Deploy เป็น Monorepo บน Vercel มักจะเป็นโดเมนเดียวกัน: `https://uaps.vercel.app/v1/auth/github/callback`)*
4. กดปุ่ม **Register application**
5. ก๊อปปี้ **Client ID** นำมาใส่ใน `GITHUB_CLIENT_ID`
6. กดปุ่ม **Generate a new client secret** และก๊อปปี้ค่านั้น นำมาใส่ใน `GITHUB_CLIENT_SECRET` (ระวัง! ค่านั้นจะแสดงให้เห็นแค่ครั้งเดียว)
7. นำ Callback URL จากข้อ 3 ไปใส่ใน `GITHUB_REDIRECT_URI`

---

### 🤖 2.3 Google Gemini AI (ระบบ AI Resume)
ระบบใช้ Gemini 2.5 Flash ในการสร้าง Resume

**ขั้นตอนการดึงค่า:**
1. ไปที่ [Google AI Studio](https://aistudio.google.com/app/apikey)
2. ล็อกอินด้วยบัญชี Google ของคุณ
3. เลือกเมนู **Get API key** ทางซ้ายมือ
4. กดปุ่ม **Create API key**
5. เลือก Project หรือสร้างใหม่
6. ก๊อปปี้ Key ที่ได้ (มักจะขึ้นต้นด้วย `AIzaSy...`) มาใส่ใน `GOOGLE_GENERATIVE_AI_API_KEY`

---

### 🔐 2.4 ความปลอดภัยของระบบ (JWT & Session)
การเข้ารหัสข้อมูล Token ของผู้ใช้เพื่อความปลอดภัย

**ขั้นตอนการดึงค่า:**
1. สำหรับ `JWT_SECRET` คุณต้องสร้างข้อความยาวๆ สุ่มขึ้นมา
2. สามารถเปิด Terminal (WSL) แล้วรันคำสั่ง `openssl rand -base64 32` เพื่อสุ่มรหัส
3. นำข้อความที่สุ่มได้ไปใส่ใน `JWT_SECRET`
4. สำหรับ `SESSION_COOKIE_NAME` แนะนำให้ใช้ `uaps_session` (ไม่ต้องแก้)

---

### 🌐 2.5 URLs ฝั่ง Frontend และ Backend
ระบุให้ระบบรู้ว่า Domain จริงๆ ที่ทำงานอยู่บน Vercel คืออะไร

**ตัวแปรที่เกี่ยวข้อง:**
- `WEB_APP_URL` และ `NEXT_PUBLIC_WEB_BASE_URL`: เป็นโดเมนหลักของหน้าเว็บ เช่น `https://my-uaps-project.vercel.app`
- `API_BASE_URL`: URL สำหรับเชื่อม API ภายใน เช่น `https://my-uaps-project.vercel.app` (ถ้า deploy หน้าและหลังบ้านที่เดียวกัน)
- `NEXT_PUBLIC_API_BASE_URL`: URL ที่ฝั่งบราวเซอร์จะใช้เรียก API มักจะเป็น `https://my-uaps-project.vercel.app/v1`

---

> **ข้อแนะนำ:** หากมีตัวแปรไหนที่คุณไม่แน่ใจ แนะนำให้ Deploy ขึ้น Vercel ไปก่อนรอบหนึ่งเพื่อให้ได้ URL (`.vercel.app`) มาใช้เป็น Base URL แล้วค่อยกลับมากรอกใน OAuth และตั้งค่าตัวแปรอีกครั้งครับ
