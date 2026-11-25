export type SessionSnapshot = { id: number; name: string; email: string } | null;

// true เมื่อ user ที่ server รู้จักไม่ตรงกับที่ navbar แสดงอยู่
export function sessionChanged(shown: SessionSnapshot, latest: SessionSnapshot): boolean {
  if (!shown || !latest) return shown !== latest;
  return shown.id !== latest.id || shown.name !== latest.name || shown.email !== latest.email;
}
