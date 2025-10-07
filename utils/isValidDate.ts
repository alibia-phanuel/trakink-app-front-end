// Fonction utilitaire pour valider une chaîne de date
// Vérifie si la chaîne peut être convertie en une date valide
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  // Vérifie si la date est valide et si la chaîne n'est pas vide
  return !isNaN(date.getTime()) && dateString.trim() !== "";
}
