# 💪 Workout Planner

เว็บแอปจัดโปรแกรมออกกำลังกาย 7 วัน (จ–อา) ใช้ได้ทั้งคอมและมือถือ
Next.js 15 (App Router) + Firebase Auth + Cloud Firestore

## ฟีเจอร์
- สมัครสมาชิกแบบเบราว์เซอร์จำไว้ ไม่ต้องตั้งรหัสผ่าน (ได้รหัสเข้าสู่ระบบไว้ใช้บนเครื่องอื่น) เก็บ ชื่อ อายุ ส่วนสูง น้ำหนัก (คำนวณ BMI ให้)
- สร้างโปรแกรมได้หลายอัน แต่ละวันมี ท่าเวท (เซ็ต × ครั้ง), คาร์ดิโอ (เวลา), หรือกิจกรรมอื่น ๆ เช่น พัก / ยืดเหยียด / ชั่งน้ำหนัก
- **นำเข้าจากโน้ต** — วางโน้ตรูปแบบ `📅 วันจันทร์` / `☐ Bench Press` / `4 × 8-10` แล้วแปลงเป็นโปรแกรมอัตโนมัติ
- **ติ๊กประจำสัปดาห์** — เช็กว่าทำแล้ว + จดน้ำหนักที่ยก แยกเก็บรายสัปดาห์ และโชว์น้ำหนักสัปดาห์ก่อนเป็นตัวช่วย
- หน้า **วันนี้** เปิดมาเจอรายการของวันปัจจุบันจากโปรแกรมหลักทันที
- ตั้งค่า **ส่วนตัว / สาธารณะ** — โปรแกรมสาธารณะแสดงในหน้าสำรวจ แชร์ลิงก์ได้ (ผู้เปิดต้องเข้าสู่ระบบก่อน) และคนอื่นกด “คัดลอกไปใช้” เป็นของตัวเองได้

## ตั้งค่า Firebase (ครั้งแรก)
1. ไปที่ https://console.firebase.google.com → **Add project**
2. **Build → Authentication → Get started** แล้วเปิด *Email/Password* (แอปใช้เป็นกลไกเบื้องหลังของรหัสเข้าสู่ระบบ)
3. **Build → Firestore Database → Create database** (production mode, region เช่น `asia-southeast1`)
4. **Project settings → Your apps → Web (</>)** สร้างเว็บแอป แล้วคัดลอกค่า config
5. `cp .env.local.example .env.local` แล้วใส่ค่าจากข้อ 4
6. ใส่ Security Rules: คัดลอก `firestore.rules` ไปวางในแท็บ **Firestore → Rules** แล้ว Publish
   (หรือใช้ CLI: `npx firebase-tools login && npx firebase-tools deploy --only firestore:rules --project <project-id>`)

## รัน
```bash
npm install
npm run dev
# เปิด http://localhost:3000
```
ทดสอบบนมือถือในวง Wi-Fi เดียวกัน: `npm run dev -- -H 0.0.0.0` แล้วเปิด `http://<IP เครื่อง>:3000`

## Deploy
แนะนำ Vercel: import repo แล้วใส่ environment variables ชุดเดียวกับ `.env.local`
จากนั้นเพิ่มโดเมนของ Vercel ใน Firebase **Authentication → Settings → Authorized domains**

## โครงสร้างข้อมูล (Firestore)
```
users/{uid}                     name, age, height, weight, activeProgramId
users/{uid}/logs/{pid}_{week}   programId, week ("2026-W43"), entries: { itemId: { done, weight } }
programs/{pid}                  ownerId, ownerName, title, description, visibility,
                                days[7]: { title, items: [{ id, name, kind, sets, reps, duration, note }] },
                                copiedFrom, createdAt, updatedAt
```
