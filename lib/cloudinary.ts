import { toast } from "react-toastify";
import imageCompression from "browser-image-compression";
import axios from "axios";

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

// ✅ Upload image vers Cloudinary
export const uploadImageToCloudinary = async (
  file: File
): Promise<{ url: string; imageId: string } | null> => {
  try {
    // Compression de l'image
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });

    // FormData pour Cloudinary
    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    // ✅ URL dynamique via .env
    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

    // Upload
    const res = await axios.post<CloudinaryUploadResponse>(
      uploadUrl,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Retour avec imageId uniquement (issu de public_id)
    return {
      url: res.data.secure_url,
      imageId: res.data.public_id,
    };
  } catch (error: any) {
    console.error(
      "❌ Cloudinary Error:",
      error.response?.data || error.message
    );
    toast.error(error.response?.data?.error?.message || "Échec de l'upload");
    return null;
  }
};

// ✅ Upload plusieurs images vers Cloudinary
export const uploadImagesToCloudinary = async (
  files: File[]
): Promise<Array<{ url: string; imageId: string } | null>> => {
  const uploadPromises = Array.from(files).map(uploadImageToCloudinary);
  return await Promise.all(uploadPromises);
};
