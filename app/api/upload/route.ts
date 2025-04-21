import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get("image") as File;
    
    if (!image) {
      return new NextResponse("No image provided", { status: 400 });
    }

    // Конвертируем File в base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Загружаем на ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append("key", IMGBB_API_KEY!);
    imgbbFormData.append("image", base64Image);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: imgbbFormData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    return NextResponse.json({ url: data.data.url });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 