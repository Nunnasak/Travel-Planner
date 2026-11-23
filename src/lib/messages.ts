const EXACT: Record<string, string> = {
  "Please check your input.": "ข้อมูลบางช่องไม่ถูกต้อง ตรวจสอบแล้วลองอีกครั้ง",
  "Something went wrong. Please try again.": "ระบบขัดข้อง ลองอีกครั้ง",
  "Invalid JSON": "ส่งข้อมูลไม่สำเร็จ ลองอีกครั้ง",
  "Invalid input": "ข้อมูลไม่ถูกต้อง",
  "Internal error": "ระบบขัดข้อง ลองอีกครั้ง",
  "Not found.": "ไม่พบข้อมูลนี้",

  "Please log in again.": "เซสชันหมดอายุ เข้าสู่ระบบอีกครั้ง",
  "Please log in first.": "เข้าสู่ระบบก่อนทำรายการนี้",
  "Account not found.": "ไม่พบบัญชีนี้",
  "Email or password is incorrect.": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  "Invalid credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  "Password is incorrect.": "รหัสผ่านไม่ถูกต้อง",
  "Current password is incorrect.": "รหัสผ่านปัจจุบันไม่ถูกต้อง",
  "Password is too long.": "รหัสผ่านยาวเกินไป",
  "New password must be different from the current one.": "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม",
  "This email is already registered.": "อีเมลนี้มีบัญชีอยู่แล้ว",
  "Email already exists": "อีเมลนี้มีบัญชีอยู่แล้ว",
  "This username is already taken.": "ชื่อผู้ใช้นี้มีคนใช้แล้ว",
  "Username already exists": "ชื่อผู้ใช้นี้มีคนใช้แล้ว",
  "Email or username already exists": "อีเมลหรือชื่อผู้ใช้นี้มีคนใช้แล้ว",
  "Duplicate fields": "อีเมลหรือชื่อผู้ใช้นี้มีคนใช้แล้ว",

  "You don't have permission to do that.": "คุณไม่มีสิทธิ์ทำรายการนี้",
  "You can only view this plan.": "คุณดูแผนนี้ได้อย่างเดียว แก้ไขไม่ได้",
  "Ask the owner to give you access.": "ขอให้เจ้าของแผนเพิ่มสิทธิ์ให้คุณ",
  "Only the owner can change who has access.": "เฉพาะเจ้าของแผนเท่านั้นที่เปลี่ยนสิทธิ์การเข้าถึงได้",
  "Only the owner can delete this plan.": "เฉพาะเจ้าของแผนเท่านั้นที่ลบแผนนี้ได้",
  "Only the owner can post this plan to Discover.": "เฉพาะเจ้าของแผนเท่านั้นที่โพสต์แผนนี้ได้",
  "Only the owner can remove this plan from Discover.": "เฉพาะเจ้าของแผนเท่านั้นที่เอาโพสต์ออกได้",
  "You already own this plan.": "คุณเป็นเจ้าของแผนนี้อยู่แล้ว",
  "That person doesn't have access to this plan.": "คนนี้ไม่มีสิทธิ์เข้าถึงแผนนี้",
  "No one has that username or email.": "ไม่พบผู้ใช้ที่มีชื่อหรืออีเมลนี้",
  "Enter a username or email.": "ใส่ชื่อผู้ใช้หรืออีเมล",
  "That username or email is too long.": "ชื่อผู้ใช้หรืออีเมลยาวเกินไป",
  "Pick Viewer or Editor.": "เลือกสิทธิ์ดูอย่างเดียวหรือแก้ไขได้",
  "Pick who can open the link.": "เลือกว่าใครเปิดลิงก์นี้ได้บ้าง",
  "This link doesn't work anymore.": "ลิงก์นี้ใช้ไม่ได้แล้ว",

  "Plan not found.": "ไม่พบแผนนี้",
  "Enter a plan name.": "ตั้งชื่อแผน",
  "Enter how many days.": "ใส่จำนวนวัน",
  "A plan needs at least 1 day.": "แผนต้องมีอย่างน้อย 1 วัน",
  "Pick at least one category.": "เลือกอย่างน้อย 1 หมวดหมู่",
  "Pick a category from the list.": "เลือกหมวดหมู่จากรายการ",
  "This plan isn't on Discover.": "แผนนี้ไม่ได้โพสต์ไว้",
  "The plan changed in the meantime. Reload the page and try again.": "มีคนแก้แผนนี้ไปก่อนแล้ว โหลดหน้าใหม่แล้วลองอีกครั้ง",

  "Pick a place.": "เลือกสถานที่",
  "Place not found in this plan.": "ไม่พบสถานที่นี้ในแผน",
  "That place no longer exists.": "สถานที่นี้ถูกลบไปแล้ว",
  "Enter the place name.": "ใส่ชื่อสถานที่",
  "Enter the address.": "ใส่ที่อยู่",
  "Keep the name under 100 characters.": "ชื่อต้องไม่เกิน 100 ตัวอักษร",
  "Keep the name under 150 characters.": "ชื่อต้องไม่เกิน 150 ตัวอักษร",
  "Keep the address under 300 characters.": "ที่อยู่ต้องไม่เกิน 300 ตัวอักษร",
  "Enter a time like 09:30 or 09:30:00.": "ใส่เวลาแบบ 09:30",
  "That district doesn't exist.": "ไม่พบอำเภอนี้",
  "Province not found.": "ไม่พบจังหวัดนี้",
  "Paste a Google Maps link (https://maps.app.goo.gl/… or https://www.google.com/maps/…).":
    "วางลิงก์ Google Maps (https://maps.app.goo.gl/… หรือ https://www.google.com/maps/…)",
  "Couldn't find the location in this link. Open the place in Google Maps, tap Share and copy the link.":
    "หาตำแหน่งจากลิงก์นี้ไม่เจอ เปิดสถานที่ใน Google Maps กดแชร์ แล้วคัดลอกลิงก์มาใหม่",
  "Couldn't open this Google Maps link. Check it and try again.": "เปิดลิงก์ Google Maps นี้ไม่ได้ ตรวจสอบลิงก์แล้วลองอีกครั้ง",
  "This link is too long.": "ลิงก์ยาวเกินไป",

  "Pick a photo to upload.": "เลือกรูปที่จะอัปโหลด",
  "Upload a JPG, PNG or WebP photo.": "อัปโหลดได้เฉพาะรูป JPG, PNG หรือ WebP",
  "The photo must be 5 MB or smaller.": "รูปต้องมีขนาดไม่เกิน 5 MB",
  "This photo can't be read. Try another file.": "เปิดรูปนี้ไม่ได้ ลองใช้ไฟล์อื่น",
  "Image not found.": "ไม่พบรูปนี้",
  "Enter a full image URL (https://...) or upload a photo.": "ใส่ลิงก์รูปแบบเต็ม (https://...) หรืออัปโหลดรูป",
};

const PATTERNS: [RegExp, (match: RegExpMatchArray) => string][] = [
  [/^A plan can have at most (\d+) days\.$/, (m) => `แผนหนึ่งมีได้ไม่เกิน ${m[1]} วัน`],
  [/^This plan only has (\d+) days\.$/, (m) => `แผนนี้มีแค่ ${m[1]} วัน`],
  [
    /^Day (\d+) still has places\. Remove them before making the plan shorter\.$/,
    (m) => `วันที่ ${m[1]} ยังมีสถานที่อยู่ ลบออกก่อนลดจำนวนวัน`,
  ],
  [/^Must be a whole number from 1 to \d+\.$/, () => "ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป"],
];

export function toThai(message: string): string;
export function toThai(message: string | undefined): string | undefined;
export function toThai(message: string | undefined) {
  if (!message) return message;
  const exact = EXACT[message];
  if (exact) return exact;
  for (const [pattern, build] of PATTERNS) {
    const match = message.match(pattern);
    if (match) return build(match);
  }
  return message;
}

export function localizeErrors(errors: Record<string, string> | undefined) {
  if (!errors) return errors;
  return Object.fromEntries(Object.entries(errors).map(([key, value]) => [key, toThai(value)]));
}

export const NETWORK_ERROR = "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง";
