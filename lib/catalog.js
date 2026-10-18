// Mappatura fra i codici categoria usati nel DB e gli slug/nomi usati negli URL.
export const CATEGORIES = {
  personalized_gift: {
    code: 'personalized_gift',
    slug: 'illuminazione-personalizzata',
    name: 'Illuminazione personalizzata',
    tagline: 'Lampade e insegne al neon con il nome o la dedica che scegli tu.',
  },
  mood_lighting: {
    code: 'mood_lighting',
    slug: 'mood-lighting',
    name: 'Mood lighting',
    tagline: 'Luci di atmosfera: lampade luna 3D e proiettori tramonto.',
  },
};

export function categoryByCode(code) {
  return CATEGORIES[code] || null;
}

export function categoryBySlug(slug) {
  return Object.values(CATEGORIES).find((c) => c.slug === slug) || null;
}
