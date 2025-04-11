import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function verifyAdminToken() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("admin-token");

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token.value, secret);

    if (payload.role !== "ADMIN") {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("VERIFY_ADMIN_TOKEN_ERROR:", error);
    return null;
  }
} 