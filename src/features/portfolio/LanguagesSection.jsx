import {
  SiAngular,
  SiC,
  SiCplusplus,
  SiDocker,
  SiExpress,
  SiFastapi,
  SiFirebase,
  SiGit,
  SiGo,
  SiLinux,
  SiMongodb,
  SiNodedotjs,
  SiPython,
  SiPytorch,
  SiReact,
  SiRust,
  SiSharp,
  SiSpringboot,
  SiTypescript,
} from 'react-icons/si'
import { FaAws, FaJava } from 'react-icons/fa6'
import { TbSql } from 'react-icons/tb'
import RevealSection from '../../shared/components/RevealSection'
import SectionHeading from '../../shared/components/SectionHeading'

const iconMap = {
  python: SiPython,
  java: FaJava,
  typescript: SiTypescript,
  c: SiC,
  cpp: SiCplusplus,
  go: SiGo,
  rust: SiRust,
  csharp: SiSharp,
  sql: TbSql,
  springBoot: SiSpringboot,
  angular: SiAngular,
  react: SiReact,
  nodejs: SiNodedotjs,
  expressjs: SiExpress,
  fastapi: SiFastapi,
  pytorch: SiPytorch,
  git: SiGit,
  linux: SiLinux,
  docker: SiDocker,
  firebase: SiFirebase,
  aws: FaAws,
  mongodb: SiMongodb,
}

function StackItem({ item }) {
  const Icon = iconMap[item.icon]

  return (
    <span className="stack-item">
      {Icon ? <Icon className="stack-icon" aria-hidden="true" /> : null}
      {item.label}
    </span>
  )
}

function StackSection({ number, skillGroups }) {
  return (
    <RevealSection as="section" className="section" id="stack">
      <SectionHeading number={number} title="Stack" />

      <div className="stack">
        {skillGroups.map((group) => (
          <div key={group.title} className="stack-row">
            <span className="stack-label">{group.title}</span>
            <div className="stack-items">
              {group.items.map((item) => (
                <StackItem key={item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </RevealSection>
  )
}

export default StackSection
