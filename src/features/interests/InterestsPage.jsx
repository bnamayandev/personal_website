import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'

import RevealSection from '../../shared/components/RevealSection'
import { aboutMe } from '../../content/aboutMe'
import { API_BASE } from '../../shared/apiBase'

function ProfileLink({ href }) {
  return (
    <a className="about-panel-link" href={href} target="_blank" rel="noreferrer">
      profile
      <FiArrowUpRight className="proj-arrow" aria-hidden="true" />
    </a>
  )
}

// Links out to Spotify when the API gave us a URL.
function MaybeLink({ href, className = '', children }) {
  if (!href) return <span className={className}>{children}</span>
  return (
    <a className={`about-link ${className}`} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

function NowPlaying({ track, captions }) {
  return (
    <>
      <p className="about-panel-note about-now-note">
        {track.isPlaying && <span className="about-now-dot" aria-hidden="true" />}
        {track.isPlaying ? captions.nowPlaying : captions.lastPlayed}
      </p>
      <MaybeLink className="about-now" href={track.url}>
        {track.image && <img className="about-now-art" src={track.image} alt="" width="48" height="48" />}
        <span className="about-now-text">
          <span className="about-line-main">{track.title}</span>
          <span className="about-line-sub">{track.artist}</span>
        </span>
      </MaybeLink>
    </>
  )
}

function TopList({ caption, items }) {
  if (!items?.length) return null
  return (
    <>
      <p className="about-panel-note">{caption}</p>
      <div className="about-list">
        {items.map((item) => (
          <div className="about-line" key={`${item.title}-${item.artist}`}>
            <MaybeLink className="about-line-main" href={item.url}>{item.title}</MaybeLink>
            <span className="about-line-sub">{item.artist}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function ArtistList({ caption, artists }) {
  if (!artists?.length) return null
  return (
    <>
      <p className="about-panel-note">{caption}</p>
      <div className="about-list">
        {artists.map((artist) => (
          <div className="about-line about-artist" key={artist.name}>
            {artist.image && <img className="about-artist-art" src={artist.image} alt="" width="28" height="28" />}
            <MaybeLink className="about-line-main" href={artist.url}>{artist.name}</MaybeLink>
          </div>
        ))}
      </div>
    </>
  )
}

function SpotifyStats({ data, captions }) {
  return (
    <>
      {data.nowPlaying && <NowPlaying track={data.nowPlaying} captions={captions} />}
      <TopList caption={captions.tracks} items={data.topTracks} />
      <TopList caption={captions.albums} items={data.topAlbums} />
      <ArtistList caption={captions.artists} artists={data.topArtists} />
    </>
  )
}

function InterestsPage() {
  const { lead, interests, spotify, steam } = aboutMe

  // Spotify has no snapshot: it renders once /api/spotify answers, or shows a
  // short note if it can't. Steam starts from the hand-kept snapshot and swaps
  // in live data when the backend is running.
  const [spotifyData, setSpotifyData] = useState(null)
  const [spotifyFailed, setSpotifyFailed] = useState(false)
  const [steamView, setSteamView] = useState(steam)

  useEffect(() => {
    let cancelled = false

    // Resolves true once the data has been applied, false if the call failed.
    async function load(path, apply) {
      try {
        const res = await fetch(`${API_BASE}${path}`)
        if (!res.ok) return false
        const data = await res.json()
        if (!cancelled) apply(data)
        return true
      } catch {
        return false
      }
    }

    load('/api/spotify', setSpotifyData).then((ok) => {
      if (!ok && !cancelled) setSpotifyFailed(true)
    })
    load('/api/steam', (data) => {
      setSteamView((prev) => ({
        ...prev,
        recentGames: data.recentGames?.length ? data.recentGames : prev.recentGames,
      }))
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <RevealSection as="main" className="interests" id="interests" immediate>
      <h1 className="baja-name">
        <span className="baja-name-highlight">My Interests</span>
      </h1>
      <p className="about-lead">{lead}</p>

      <div className="about-interests">
        {interests.map((interest) => (
          <div className="about-interest" key={interest.title}>
            <span className="about-interest-title">{interest.title}</span>
            <p className="about-interest-body">{interest.body}</p>
          </div>
        ))}
      </div>

      <div className="about-data">
        <section className="about-panel">
          <div className="about-panel-head">
            <span className="about-panel-label">Music</span>
            <ProfileLink href={spotifyData?.profileUrl || spotify.href} />
          </div>

          {spotifyData && <SpotifyStats data={spotifyData} captions={spotify.captions} />}
          {spotifyFailed && <p className="about-panel-note">{spotify.captions.unavailable}</p>}
        </section>

        <section className="about-panel">
          <div className="about-panel-head">
            <span className="about-panel-label">Steam</span>
          </div>

          <p className="about-panel-note">{steamView.caption}</p>
          <div className="about-list">
            {steamView.recentGames.map((game) => (
              <div className="about-line" key={game.name}>
                <span className="about-line-main">{game.name}</span>
                <span className="about-line-sub">{game.detail}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Link className="baja-back" to="/">← back to home</Link>
    </RevealSection>
  )
}

export default InterestsPage
