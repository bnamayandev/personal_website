import RevealSection from '../../shared/components/RevealSection'
import SectionHeading from '../../shared/components/SectionHeading'

const monthLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
})

function parseMonth(monthValue) {
  const [year, month] = monthValue.split('-').map(Number)

  return new Date(year, month - 1, 1)
}

function formatPeriod(start, end) {
  const startLabel = monthLabelFormatter.format(parseMonth(start))

  if (end === 'present') {
    return `${startLabel} — Present`
  }

  return `${startLabel} — ${monthLabelFormatter.format(parseMonth(end))}`
}

function ExperienceSection({ number, experiences }) {
  return (
    <RevealSection as="section" className="section" id="experience">
      <SectionHeading number={number} title="Experience" />

      <ol className="timeline">
        {experiences.map((experience) => (
          <li key={`${experience.company}-${experience.role}`} className="timeline-item">
            <span className="timeline-dot" aria-hidden="true" />
            <span className="ledger-meta">{formatPeriod(experience.start, experience.end)}</span>
            <span className="exp-role">{experience.role}</span>
            <p className="exp-sub">
              {experience.company}
              {experience.location ? ` · ${experience.location}` : ''}
            </p>
          </li>
        ))}
      </ol>
    </RevealSection>
  )
}

export default ExperienceSection
