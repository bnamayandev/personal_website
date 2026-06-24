import { getDailyAccent } from '../dailyAccent.js'

function ColorOfTheDay() {
  const { hex } = getDailyAccent()

  return (
    <div className="cod" title={`Color of the day · ${hex}`}>
      <span className="cod-swatch" aria-hidden="true" />
      <span className="cod-text">
        <span className="cod-label">color of the day</span>
        <span className="cod-hex">{hex}</span>
      </span>
    </div>
  )
}

export default ColorOfTheDay
