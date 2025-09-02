// app/api/delete-images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { imageIds } = await req.json();
    if (!imageIds?.length)
      return NextResponse.json({ message: "Aucune image à supprimer" });

    // 🔥 Supprimer les images ET purger le cache CDN
    const result = await cloudinary.api.delete_resources(imageIds, {
      invalidate: true,
    });
    return NextResponse.json({
      message: "Images supprimées et cache purgé",
      result,
    });
  } catch (err: any) {
    return NextResponse.json({
      message: "Erreur Cloudinary",
      error: err.message,
    });
  }
}
