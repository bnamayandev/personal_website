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

      <div className="ledger">
        {experiences.map((experience) => (
          <article key={`${experience.company}-${experience.role}`} className="ledger-item">
            <div className="ledger-head">
              <span className="exp-role">{experience.role}</span>
              <span className="ledger-meta">{formatPeriod(experience.start, experience.end)}</span>
            </div>

            <p className="exp-sub">
              {experience.company}
              {experience.type ? ` · ${experience.type}` : ''}
              {experience.location ? ` · ${experience.location}` : ''}
            </p>

            <p className="exp-summary">{experience.summary}</p>
          </article>
        ))}
      </div>
    </RevealSection>
  )
}

export default ExperienceSection
