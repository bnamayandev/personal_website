import { Fragment, useEffect, useState } from 'react'
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

// Links out to Spotify when the API gave us a URL; the hand-kept snapshot has none.
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

function InterestsPage() {
  const { lead, interests, spotify, steam, fineprint } = aboutMe

  // Start from the hand-kept snapshot, then swap in live API data when the
  // backend is running. If the calls fail we just keep what we have.
  const [spotifyView, setSpotifyView] = useState(spotify)
  const [steamView, setSteamView] = useState(steam)
  const [live, setLive] = useState({ spotify: false, steam: false })

  const liveSources = [live.spotify && 'Spotify', live.steam && 'Steam'].filter(Boolean)
  const fineprintText = liveSources.length ? `Pulled live from ${liveSources.join(' and ')}.` : fineprint
  const { captions } = spotify

  useEffect(() => {
    let cancelled = false

    async function load(path, apply) {
      try {
        const res = await fetch(`${API_BASE}${path}`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) apply(data)
      } catch {
        // Backend not running — keep the static snapshot.
      }
    }

    load('/api/spotify', (data) => {
      setSpotifyView((prev) => ({
        ...prev,
        href: data.profileUrl || prev.href,
        nowPlaying: data.nowPlaying,
        topTracks: data.topTracks,
        topAlbums: data.topAlbums,
        topArtists: data.topArtists,
      }))
      setLive((prev) => ({ ...prev, spotify: true }))
    })
    load('/api/steam', (data) => {
      setSteamView((prev) => ({
        ...prev,
        recentGames: data.recentGames?.length ? data.recentGames : prev.recentGames,
      }))
      setLive((prev) => ({ ...prev, steam: true }))
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
            <span className="about-panel-label">Spotify</span>
            <ProfileLink href={spotifyView.href} />
          </div>

          {spotifyView.nowPlaying && (
            <NowPlaying track={spotifyView.nowPlaying} captions={captions} />
          )}

          <p className="about-panel-note">{captions.tracks}</p>
          <div className="about-list">
            {spotifyView.topTracks.map((track) => (
              <div className="about-line" key={`${track.title}-${track.artist}`}>
                <MaybeLink className="about-line-main" href={track.url}>{track.title}</MaybeLink>
                <span className="about-line-sub">{track.artist}</span>
              </div>
            ))}
          </div>

          {spotifyView.topAlbums.length > 0 && (
            <>
              <p className="about-panel-note">{captions.albums}</p>
              <div className="about-list">
                {spotifyView.topAlbums.map((album) => (
                  <div className="about-line" key={`${album.title}-${album.artist}`}>
                    <MaybeLink className="about-line-main" href={album.url}>{album.title}</MaybeLink>
                    <span className="about-line-sub">{album.artist}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="about-panel-note">{captions.artists}</p>
          <p className="about-panel-artists">
            {spotifyView.topArtists.map((artist, index) => (
              <Fragment key={artist.name}>
                {index > 0 && ', '}
                <MaybeLink href={artist.url}>{artist.name}</MaybeLink>
              </Fragment>
            ))}
          </p>
        </section>

        <section className="about-panel">
          <div className="about-panel-head">
            <span className="about-panel-label">Steam</span>
            <ProfileLink href={steamView.href} />
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

      <p className="about-fineprint">{fineprintText}</p>

      <Link className="baja-back" to="/">← back to home</Link>
    </RevealSection>
  )
}

export default InterestsPage
