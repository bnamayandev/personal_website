import { Link } from 'react-router-dom'
import { FiArrowUpRight } from 'react-icons/fi'

import RevealSection from '../../shared/components/RevealSection'

const repositories = [
  { label: 'Frontend', tag: 'React', href: 'https://github.com/WesternBajaRacing/BajaEcom-Frontend' },
  { label: 'Backend', tag: 'Service layer', href: 'https://github.com/WesternBajaRacing/BajaEcom-Backend' },
]

function BajaEcomPage() {
  return (
    <RevealSection as="main" className="baja" immediate>
      <p className="baja-eyebrow">Western Baja Racing</p>
      <h1 className="baja-name" id="bajaecom-title">
        <span className="baja-name-highlight">Baja Ecom</span>
      </h1>
      <p className="baja-copy">
        A full-stack storefront for merch sales with cleaner inventory handling and a
        setup that was easier for the team to run. Repository links below.
      </p>

      <div className="baja-links">
        {repositories.map((repo) => (
          <a
            key={repo.label}
            className="baja-link"
            href={repo.href}
            target="_blank"
            rel="noreferrer"
          >
            <span>
              {repo.label}
              <FiArrowUpRight className="proj-arrow" aria-hidden="true" style={{ marginLeft: 8 }} />
            </span>
            <span className="baja-link-tag">{repo.tag}</span>
          </a>
        ))}
      </div>

      <Link className="baja-back" to="/">← back to home</Link>
    </RevealSection>
  )
}

export default BajaEcomPage
