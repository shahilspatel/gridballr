// YouTube video IDs for prospect highlights — real verified videos
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
    youtubeId: 'BUOOALFbWIg',
    title: 'Shedeur Sanders Top Plays at Colorado | 2023 & 2024 Highlights',
    clipType: 'highlight',
    sourceChannel: 'Bleacher Report',
  },
  // Cam Ward
  {
    playerSlug: 'cam-ward',
    youtubeId: 'T_0nPdqxjkY',
    title: 'Cam Ward 2024 Regular Season Highlights | Miami Quarterback',
    clipType: 'highlight',
    sourceChannel: 'ACC Digital Network',
  },
  // Travis Hunter
  {
    playerSlug: 'travis-hunter',
    youtubeId: 'KWBVSpflBqQ',
    title: 'Travis Hunter Heisman Highlights | Top Plays 2024',
    clipType: 'highlight',
    sourceChannel: 'Bleacher Report',
  },
  // Tetairoa McMillan
  {
    playerSlug: 'tetairoa-mcmillan',
    youtubeId: 'dzunAZdG25c',
    title: 'Tetairoa McMillan 2024 Arizona Season Highlights',
    clipType: 'highlight',
    sourceChannel: 'CFB ON FOX',
  },
  // Mason Graham
  {
    playerSlug: 'mason-graham',
    youtubeId: 'rUeZ0RAgcGI',
    title: 'Mason Graham | 2024 Highlights',
    clipType: 'highlight',
    sourceChannel: 'Sports Productions',
  },
  // Abdul Carter
  {
    playerSlug: 'abdul-carter',
    youtubeId: 'LLXHMe-g6OM',
    title: 'The Next Great Edge Rusher? | Abdul Carter 2024 Penn State Highlights',
    clipType: 'highlight',
    sourceChannel: 'Bleacher Report',
  },
  // Will Johnson
  {
    playerSlug: 'will-johnson',
    youtubeId: 'fl8Hp4W74Hg',
    title: 'NFL DRAFT HIGHLIGHTS: DB Will Johnson | Michigan Football',
    clipType: 'highlight',
    sourceChannel: 'Big Ten Football',
  },
  // Kelvin Banks
  {
    playerSlug: 'kelvin-banks',
    youtubeId: 'fQXdsI45s3s',
    title: 'Kelvin Banks Jr College Football Highlights | Texas Left Tackle',
    clipType: 'highlight',
    sourceChannel: 'The NFL Film Room',
  },
  // Ashton Jeanty
  {
    playerSlug: 'ashton-jeanty',
    youtubeId: 'nSqYKFIQpKA',
    title: 'Ashton Jeanty 2024 Boise State Full Season Highlights',
    clipType: 'highlight',
    sourceChannel: 'CFB ON FOX',
  },
  // Luther Burden
  {
    playerSlug: 'luther-burden',
    youtubeId: 'dVY888WOPuc',
    title: 'Missouri WR Luther Burden III 2024 Highlights',
    clipType: 'highlight',
    sourceChannel: 'JustBombsProductions',
  },
  // James Pearce
  {
    playerSlug: 'james-pearce',
    youtubeId: '0g4_1cIPuwY',
    title: 'Tennessee EDGE James Pearce Jr. 2024 Highlights',
    clipType: 'highlight',
    sourceChannel: 'JustBombsProductions',
  },
  // Tyler Warren
  {
    playerSlug: 'tyler-warren',
    youtubeId: 'DQA1imJTd2Q',
    title: 'Tyler Warren | 2024 Highlights',
    clipType: 'highlight',
    sourceChannel: 'Sports Productions',
  },
  // Malaki Starks
  {
    playerSlug: 'malaki-starks',
    youtubeId: 'arBs57bAi_M',
    title: 'Georgia Safety Malaki Starks 2024 Highlights',
    clipType: 'highlight',
    sourceChannel: 'JustBombsProductions',
  },
  // Jalen Milroe
  {
    playerSlug: 'jalen-milroe',
    youtubeId: 'AyrKBCtweIU',
    title: 'Faster QB Than Lamar Jackson? | Jalen Milroe 2024 Alabama Highlights',
    clipType: 'highlight',
    sourceChannel: 'Bleacher Report',
  },
  // Emeka Egbuka
  {
    playerSlug: 'emeka-egbuka',
    youtubeId: '19x_leBY3xc',
    title: 'Emeka Egbuka | 2024 Highlights',
    clipType: 'highlight',
    sourceChannel: 'Sports Productions',
  },
]

export function getClipsForPlayer(slug: string): FilmClipData[] {
  return FILM_CLIPS.filter((c) => c.playerSlug === slug)
}

export function getAllPlayersWithClips(): string[] {
  return [...new Set(FILM_CLIPS.map((c) => c.playerSlug))]
}
