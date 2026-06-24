import RevealSection from '../../shared/components/RevealSection'
import SectionHeading from '../../shared/components/SectionHeading'

const directContacts = [
  { label: 'Email', value: 'benjaminnamayandeh@gmail.com', href: 'mailto:benjaminnamayandeh@gmail.com' },
  { label: 'Mobile', value: '(647) 607-0275', href: 'tel:16476070275' },
]

function ContactSection({ number, socialLinks = [] }) {
  const rows = [
    ...directContacts,
    ...socialLinks.map((link) => ({
      label: link.label,
      value: link.href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
      href: link.href,
      external: true,
    })),
  ]

  return (
    <RevealSection as="section" className="section" id="contact">
      <SectionHeading number={number} title="Contact" />

      <div className="contact">
        {rows.map((row) => (
          <div key={row.label} className="contact-row">
            <span className="contact-label">{row.label}</span>
            <a
              className="contact-value"
              href={row.href}
              target={row.external ? '_blank' : undefined}
              rel={row.external ? 'noreferrer' : undefined}
            >
              {row.value}
            </a>
          </div>
        ))}
      </div>
    </RevealSection>
  )
}

export default ContactSection
