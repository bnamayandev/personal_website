import { Link } from 'react-router-dom'

import RevealSection from '../../shared/components/RevealSection'
import BikeTerminal from './BikeTerminal'

function EasterEggPage() {
  return (
    <RevealSection as="main" className="egg" immediate>
      <h1 className="baja-name" id="easter-egg-title">
        <span className="baja-name-highlight">easter egg</span>
      </h1>

      <p className="baja-copy">
        A little game I built in high school for a class project. I sank an embarrassing number
        of hours into it, and honestly it&apos;s the thing that made me realize I wanted to do
        programming. I tried to keep this version as close to the 
        original as I could, and dropped it here just for fun.
      </p>
      <p className="baja-copy">
        It&apos;s the actual Python, compiled to WebAssembly, so
        give it a second to boot. Type the passage, out-pedal the monster, and try to save the
        world.
      </p>

      <BikeTerminal />
      <Link className="baja-back" to="/">← back to home</Link>
    </RevealSection>
  )
}

export default EasterEggPage
