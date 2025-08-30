import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configuration Cloudinary côté serveur
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { publicId } = await req.json();
    if (!publicId)
      return NextResponse.json(
        { message: "publicId manquant" },
        { status: 400 }
      );

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ message: "Image supprimée avec succès" });
  } catch (error: any) {
    console.error("Erreur Cloudinary API :", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
