import { redirect } from "next/navigation";

// สมัครสมาชิกย้ายไปอยู่หน้าแรกแล้ว
export default function RegisterPage() {
  redirect("/");
}
