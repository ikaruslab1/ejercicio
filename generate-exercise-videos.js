import fs from 'fs';

const videos = JSON.parse(fs.readFileSync('extracted-videos.json', 'utf8'));

const tsContent = `// Catálogo oficial de videos tutoriales de técnica (Min-Max Program - Jeff Nippard)
// 88 ejercicios con video directo oficial de YouTube extraídos del documento del programa

export const EXERCISE_VIDEOS: Record<string, string> = ${JSON.stringify(videos, null, 2)};

/**
 * Obtiene la URL de YouTube del video para un ejercicio dado (por nombre exacto o normalizado).
 */
export function getExerciseVideoUrl(name?: string): string | undefined {
  if (!name) return undefined;
  const trimmed = name.trim();
  if (EXERCISE_VIDEOS[trimmed]) {
    return EXERCISE_VIDEOS[trimmed];
  }
  // Búsqueda insensible a mayúsculas
  const lower = trimmed.toLowerCase();
  for (const [key, url] of Object.entries(EXERCISE_VIDEOS)) {
    if (key.toLowerCase() === lower) {
      return url;
    }
  }
  return undefined;
}

/**
 * Convierte una URL estándar o corta de YouTube en URL embebible (embed) para un iframe.
 * Soporta:
 * - https://youtu.be/ID
 * - https://www.youtube.com/watch?v=ID
 * - https://www.youtube.com/embed/ID
 */
export function getYoutubeEmbedUrl(urlOrName?: string): string | null {
  if (!urlOrName) return null;
  
  let url = urlOrName;
  if (!url.startsWith('http')) {
    const foundUrl = getExerciseVideoUrl(urlOrName);
    if (!foundUrl) return null;
    url = foundUrl;
  }

  // Extraer el ID de 11 caracteres de YouTube
  const match = url.match(/(?:youtu\\.be\\/|youtube\\.com\\/(?:embed\\/|v\\/|watch\\?v=|watch\\?.+&v=))([\\w-]{11})/);
  if (match && match[1]) {
    return \`https://www.youtube-nocookie.com/embed/\${match[1]}?autoplay=1&rel=0&modestbranding=1\`;
  }

  return null;
}
`;

fs.writeFileSync('src/data/exerciseVideos.ts', tsContent, 'utf8');
console.log('Successfully created src/data/exerciseVideos.ts');
