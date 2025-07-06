import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase-config"; // Ton fichier Firebase doit exporter l'objet app

/**
 * Upload une image vers Firebase Storage et retourne l'URL publique
 * @param file - Le fichier image sélectionné par l'utilisateur
 * @returns L'URL publique de l'image stockée
 */
export const uploadImageToFirebase = async (file: File): Promise<string> => {
  const storage = getStorage(app);
  const storageRef = ref(storage, `profiles/${Date.now()}-${file.name}`);

  // Upload du fichier
  const snapshot = await uploadBytes(storageRef, file);

  // Récupération de l'URL publique
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};
