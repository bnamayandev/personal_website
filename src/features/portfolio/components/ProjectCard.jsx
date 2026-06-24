import { FiArrowUpRight } from 'react-icons/fi'

function ProjectCard({ project }) {
  const isExternalLink = /^https?:\/\//.test(project.href)
  const NameTag = project.href ? 'a' : 'span'

  return (
    <article className="ledger-item">
      <div className="ledger-head">
        <NameTag
          className="proj-name"
          href={project.href || undefined}
          target={isExternalLink ? '_blank' : undefined}
          rel={isExternalLink ? 'noreferrer' : undefined}
        >
          {project.name}
          {project.href ? <FiArrowUpRight className="proj-arrow" aria-hidden="true" /> : null}
        </NameTag>
        <span className="ledger-meta">{project.label}</span>
      </div>

      <p className="proj-desc">{project.description}</p>
    </article>
  )
}

export default ProjectCard
