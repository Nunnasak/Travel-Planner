export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { container } = await import("@/infrastructure/container");
  const run = () => container.cleanupSessions.execute().catch(console.error);

  run(); // กวาดครั้งแรกตอนเซิร์ฟเวอร์เริ่ม
  setInterval(run, 6 * 60 * 60 * 1000).unref(); // แล้วทุก 6 ชั่วโมง
}