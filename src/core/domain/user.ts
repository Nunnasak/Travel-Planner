export interface User {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

// ข้อมูลที่ปลอดภัยส่งออกไปให้ client (ไม่มี passwordHash)
export type PublicUser = Omit<User, "passwordHash">;