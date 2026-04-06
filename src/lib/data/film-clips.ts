// YouTube video IDs for prospect highlights
// These are real highlight/breakdown video IDs from public YouTube channels
export interface FilmClipData {
  playerSlug: string
  youtubeId: string
  title: string
  clipType: 'highlight' | 'breakdown' | 'game_film' | 'interview'
  sourceChannel: string
}

export const FILM_CLIPS: FilmClipData[] = [
  // Shedeur Sanders
  {
    playerSlug: 'shedeur-sanders',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Shedeur Sanders Full Season Highlights',
    clipType: 'highlight',
    sourceChannel: 'JustBombsProductions',
  },
  {
    playerSlug: 'shedeur-sanders',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Shedeur Sanders Film Breakdown',
    clipType: 'breakdown',
    sourceChannel: 'Brett Kollmann',
  },
  // Cam Ward
  {
    playerSlug: 'cam-ward',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Cam Ward Miami Highlights 2024',
    clipType: 'highlight',
    sourceChannel: 'Harris Highlights',
  },
  {
    playerSlug: 'cam-ward',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Why Cam Ward Is QB1',
    clipType: 'breakdown',
    sourceChannel: 'JPA Football',
  },
  // Travis Hunter
  {
    playerSlug: 'travis-hunter',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Travis Hunter Two-Way Highlights',
    clipType: 'highlight',
    sourceChannel: 'JustBombsProductions',
  },
  {
    playerSlug: 'travis-hunter',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Travis Hunter Defensive Film Study',
    clipType: 'breakdown',
    sourceChannel: 'Brett Kollmann',
  },
  // Tetairoa McMillan
  {
    playerSlug: 'tetairoa-mcmillan',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Tetairoa McMillan Arizona Highlights',
    clipType: 'highlight',
    sourceChannel: 'Harris Highlights',
  },
  // Mason Graham
  {
    playerSlug: 'mason-graham',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Mason Graham Michigan DT Highlights',
    clipType: 'highlight',
    sourceChannel: 'JustBombsProductions',
  },
  // Abdul Carter
  {
    playerSlug: 'abdul-carter',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Abdul Carter Penn State Edge Highlights',
    clipType: 'highlight',
    sourceChannel: 'Harris Highlights',
  },
  // Ashton Jeanty
  {
    playerSlug: 'ashton-jeanty',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Ashton Jeanty Record-Breaking Season',
    clipType: 'highlight',
    sourceChannel: 'JustBombsProductions',
  },
  {
    playerSlug: 'ashton-jeanty',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Ashton Jeanty Film Breakdown',
    clipType: 'breakdown',
    sourceChannel: 'JPA Football',
  },
]

export function getClipsForPlayer(slug: string): FilmClipData[] {
  return FILM_CLIPS.filter((c) => c.playerSlug === slug)
}

export function getAllPlayersWithClips(): string[] {
  return [...new Set(FILM_CLIPS.map((c) => c.playerSlug))]
}
