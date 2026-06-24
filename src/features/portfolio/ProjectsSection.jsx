import { FiArrowUpRight } from 'react-icons/fi'

import RevealSection from '../../shared/components/RevealSection'
import SectionHeading from '../../shared/components/SectionHeading'
import { reposHref } from '../../content/portfolio'

import ProjectCard from './components/ProjectCard'

function ProjectsSection({ number, projects }) {
  return (
    <RevealSection as="section" className="section" id="projects">
      <SectionHeading number={number} title="Projects" />

      <div className="ledger">
        {projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>

      <a className="ledger-more" href={reposHref} target="_blank" rel="noreferrer">
        See the rest on GitHub
        <FiArrowUpRight className="proj-arrow" aria-hidden="true" />
      </a>
    </RevealSection>
  )
}

export default ProjectsSection
