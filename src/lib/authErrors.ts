const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "รหัสเข้าสู่ระบบไม่ถูกต้อง",
  "auth/too-many-requests": "ลองหลายครั้งเกินไป กรุณารอสักครู่",
  "permission-denied": "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
};

export function errorMessage(e: unknown): string {
  const code = (e as { code?: string })?.code;
  return (code && MESSAGES[code]) || (e as Error)?.message || "เกิดข้อผิดพลาด";
}
