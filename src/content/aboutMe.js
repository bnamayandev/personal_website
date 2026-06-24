// Copy and stats for the About section. The Spotify and Steam values are hand
// kept snapshots for now. See README notes if you wire them to live APIs later.

export const aboutMe = {
  lead: "Here's what I get up to away from the keyboard, plus what I have been listening to and playing lately.",

  interests: [
    {
      title: "FPV drones",
      body: "My newest hobby. Strapping on goggles and flying like I'm in the cockpit never gets old. Build, tune, crash, fix, repeat.",
    },
    {
      title: "Skiing",
      body: "Just started, and I'm bad at it. Lots of falling, lots of easy runs. Still grinning every time I'm out there.",
    },
    {
      title: "Boxing",
      body: "Also new. Still learning the basics, but I love how much there is to it.",
    },
    {
      title: "Guitar",
      body: "Been playing for years. Most evenings end with me noodling on some chords or chasing a riff stuck in my head.",
    },
    {
      title: "Gym",
      body: "My daily reset away from screens. Show up, add a little weight, watch the numbers move.",
    },
    {
      title: "Gaming",
      body: "How I unwind and stay in touch with friends in other cities. Competitive matches, co-op grinds, plenty of trash talk.",
    },
    {
      title: "Basketball",
      body: "My excuse to get outside. I'll join a pickup game with strangers and lose happily until it's too dark to see the rim.",
    },
  ],

  spotify: {
    href: "https://open.spotify.com/",
    artistsCaption: "Most Listened-To Artists This Week",
    topArtists: ["The Strokes", "Geese", "Radiohead", "Deftones"],
    tracksCaption: "Favourite Tracks Right Now",
    topTracks: [
      { title: "Genesis", artist: "Justice" },
      { title: "Nausicaä (Love Will Be Revealed)", artist: "Cameron Winter" },
      { title: "Domoto", artist: "Geese" },
      { title: "Au Pays du Cocaine", artist: "Geese" },
      { title: "12:51", artist: "The Strokes" },
    ],
  },

  steam: {
    href: "https://steamcommunity.com/",
    caption: "Recently played",
    recentGames: [
      { name: "PUBG", detail: "with friends" },
      { name: "Liftoff", detail: "FPV practice" },
      { name: "CS:GO", detail: "ranked grind" },
      { name: "Phasmophobia", detail: "late nights" },
    ],
  },

  fineprint: "These are updated by hand for now.",
}
