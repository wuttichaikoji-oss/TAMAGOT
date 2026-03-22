# Laya Pet — Blink Redraw Fix

รอบนี้ทำตาม feedback:
- วาด blink 3 เฟรมใหม่จริง (half / closed / reopen)
- star bob ลดลงมากเพื่อไม่ให้ดูหลุดจากก้าน
- wing flutter เป็น overlay only ตัวก้อนลำตัวไม่ถูกตัด

ไฟล์สำคัญ:
- `assets/master/nova_master_clean.png`
- `assets/layers/blink_half_overlay.png`
- `assets/layers/blink_closed_overlay.png`
- `assets/layers/blink_reopen_overlay.png`
- `assets/frames/idle/idle_00.png` ถึง `idle_11.png`
- `assets/frames/blink/blink_00.png` ถึง `blink_04.png`
