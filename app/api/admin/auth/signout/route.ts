import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = cookies();
  
  // Удаляем куки админа
  cookieStore.delete("admin-token");
  
  return NextResponse.json({ success: true });
} 