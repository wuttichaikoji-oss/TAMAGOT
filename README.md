# Laya Pet — Frame-Based Pet Mode (GitHub Ready)

รอบนี้เปลี่ยนแนวทางใหม่ตามข้อเสนอ:
1. ตัดพื้นหลังออกก่อน
2. ทำ action ละหลายเฟรม
3. เล่นเป็น frame animation จริงบนหน้า Home

## เฟรมที่มี
- idle = 5
- blink = 4
- happy = 5
- sleep = 4
- love = 4
- sad = 4
- hurt = 3

## จุดเด่น
- ไม่ใช่ภาพเดียวขยับด้วย CSS แล้ว
- เป็น frame-based structure พร้อมต่อยอดเป็นเกมจริงง่ายกว่า
- Save / Load state ด้วย localStorage
- พร้อมอัป GitHub Pages

## วิธีอัป GitHub Pages
1. แตกไฟล์ ZIP
2. สร้าง repository ใหม่
3. อัปทุกไฟล์ขึ้น repo
4. Settings > Pages
5. Deploy from a branch
6. เลือก main และ /(root)
