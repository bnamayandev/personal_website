// Copy and stats for the About section. Spotify data comes only from the
// server's /api/spotify; the Steam values are a hand-kept snapshot that the
// Interests page swaps for live data when the server is running.

export const aboutMe = {
  lead: "Here's what I get up to away from the keyboard, plus what I have been listening to and playing lately.",

  interestsLead: "Some of my interests are:",

  interests: [
    { title: "Guitar" },
    { title: "Gym" },
    { title: "Gaming" },
    { title: "FPV drones" },
    { title: "Boxing" },
    { title: "Skiing" },
  ],

  spotify: {
    href: "https://open.spotify.com/",
    captions: {
      nowPlaying: "Listening Now",
      lastPlayed: "Last Played",
      tracks: "Top Tracks",
      albums: "Top Albums",
      artists: "Top Artists",
      unavailable: "Couldn't load music right now.",
    },
  },

  steam: {
    caption: "Recently played",
    recentGames: [
      {
        name: "PUBG",
        detail: "with friends",
        image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/578080/capsule_231x87.jpg",
      },
      {
        name: "Liftoff",
        detail: "FPV practice",
        image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/410340/capsule_231x87.jpg",
      },
      {
        name: "CS2",
        detail: "ranked grind",
        image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/730/capsule_231x87.jpg",
      },
      {
        name: "Phasmophobia",
        detail: "late nights",
        image: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/739630/capsule_231x87.jpg",
      },
    ],
  },
}
