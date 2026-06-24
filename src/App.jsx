import { Link, Route, Routes } from 'react-router-dom'

import BajaEcomPage from './features/bajaecom/BajaEcomPage'
import InterestsPage from './features/interests/InterestsPage'
import ContactSection from './features/portfolio/ContactSection'
import ExperienceSection from './features/portfolio/ExperienceSection'
import HeroSection from './features/portfolio/HeroSection'
import StackSection from './features/portfolio/LanguagesSection'
import ProjectsSection from './features/portfolio/ProjectsSection'
import GlowCursor from './shared/components/GlowCursor'
import ColorOfTheDay from './shared/components/ColorOfTheDay'
import { experiences, projects, skillGroups, socialLinks } from './content/portfolio'

const resumeHref = '/resume.pdf'

function TopNav() {
  return (
    <nav className="topnav" aria-label="Primary">
      <Link className="topnav-mark" to="/">benjamin namayandeh</Link>
      <div className="topnav-links">
        <Link className="topnav-link" to="/interests">interests</Link>
        {socialLinks.map((link) => (
          <a
            key={link.label}
            className="topnav-link"
            href={link.href}
            target="_blank"
            rel="noreferrer"
          >
            {link.label.toLowerCase()}
          </a>
        ))}
        <a className="topnav-link" href={resumeHref} target="_blank" rel="noreferrer">
          résumé
        </a>
      </div>
    </nav>
  )
}

function HomePage() {
  return (
    <main>
      <HeroSection resumeHref={resumeHref} />
      <ExperienceSection number="01" experiences={experiences} />
      <ProjectsSection number="02" projects={projects} />
      <ContactSection number="03" socialLinks={socialLinks} />
      <StackSection number="04" skillGroups={skillGroups} />
    </main>
  )
}

function App() {
  return (
    <div className="page">
      <GlowCursor />
      <div className="container">
        <TopNav />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/bajaecom" element={<BajaEcomPage />} />
          <Route path="/interests" element={<InterestsPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>

        <footer className="site-footer">
          <span>© {new Date().getFullYear()} Benjamin Namayandeh</span>
          <ColorOfTheDay />
          <span>Built with love</span>
        </footer>
      </div>
    </div>
  )
}

export default App
