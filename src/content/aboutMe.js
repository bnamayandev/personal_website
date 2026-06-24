// Copy and stats for the About section. The Spotify and Steam values are hand
// kept snapshots for now. See README notes if you wire them to live APIs later.

export const aboutMe = {
  lead: "Here's what I get up to away from the keyboard, plus what I have been listening to and playing lately.",

  interests: [
    {
      title: "Guitar",
      body: "I started playing in middle school. I usually play indie rock or something along those lines, but lately I've been trying to nail down a few Polyphia songs!",
    },
    {
      title: "Gym",
      body: "I've been working out for a while now. I try to go at least 5 times a week on a PPL split!",
    },
    {
      title: "Gaming",
      body: "I mostly play FPS games. I have 2,800 hours in CS2, which probably says more about me than I'd like to admit.",
    },
    {
      title: "FPV drones",
      body: "I recently got into this and I'm still in the sim phase, but I'm excited to use it as a way to see the world from a new perspective and as a tool for some future projects.",
    },
    {
      title: "Boxing",
      body: "Started in VR and quickly realized there was way more to it than I thought. Still learning, and for now I only work the bag.",
    },
    {
      title: "Skiing",
      body: "Just started, so I'm still finding my feet. Lots of falling, lots of easy runs. I haven't made it down a green cleanly yet, but if this ever gets updated, you'll know I stuck with it.",
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
      { name: "CS2", detail: "ranked grind" },
      { name: "Phasmophobia", detail: "late nights" },
    ],
  },

  fineprint: "These are updated by hand for now.",
}
