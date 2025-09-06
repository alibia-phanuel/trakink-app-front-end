export const countries = [
  "Cameroun",
  "Côte d'Ivoire",
  "Mali",
  "Ghana",
  "Sénégal",
  "Guinée",
] as const;
export const modeEnvoiOptions: string[] = [
  "Maritime",
  "Aérien",
  "Terrestre",
  "Express",
];

export const uniteMesureOptions: string[] = ["kg", "g", "cm", "m", "L"];

export const natureColisOptions: string[] = [
  "Effets personnels",
  "Documents",
  "Électronique",
  "Vêtements",
  "Alimentaire",
  "Médicaments",
];

export const cityMap: { [key: string]: string[] } = {
  Cameroun: ["Yaoundé", "Douala", "Bamenda", "Garoua", "Maroua"],
  "Côte d'Ivoire": ["Abidjan", "Yamoussoukro", "Bouaké", "Daloa", "San-Pédro"],
  Mali: ["Bamako", "Sikasso", "Koutiala", "Ségou", "Kayes"],
  Ghana: ["Accra", "Kumasi", "Tamale", "Sekondi-Takoradi", "Cape Coast"],
  Sénégal: ["Dakar", "Touba", "Thiès", "Saint-Louis", "Kaolack"],
  Guinée: ["Conakry", "Nzérékoré", "Kankan", "Kindia", "Labé"],
};
