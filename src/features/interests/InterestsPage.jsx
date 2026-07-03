import { Link } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'

import RevealSection from '../../shared/components/RevealSection'
import { aboutMe } from '../../content/aboutMe'

function ProfileLink({ href }) {
  return (
    <a className="about-panel-link" href={href} target="_blank" rel="noreferrer">
      profile
      <FiArrowUpRight className="proj-arrow" aria-hidden="true" />
    </a>
  )
}

function InterestsPage() {
  const { lead, interests, spotify, steam, fineprint } = aboutMe

  // Rendered straight from the hand-kept snapshot in content/aboutMe.
  const spotifyView = spotify
  const steamView = steam
  const fineprintText = fineprint

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

          <p className="about-panel-note">{spotifyView.artistsCaption}</p>
          <p className="about-panel-artists">{spotifyView.topArtists.join(', ')}</p>

          <p className="about-panel-note">{spotifyView.tracksCaption}</p>
          <div className="about-list">
            {spotifyView.topTracks.map((track) => (
              <div className="about-line" key={`${track.title}-${track.artist}`}>
                <span className="about-line-main">{track.title}</span>
                <span className="about-line-sub">{track.artist}</span>
              </div>
            ))}
          </div>
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
