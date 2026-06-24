function SectionHeading({ number, title }) {
  return (
    <div className="section-head">
      {number ? <span className="section-num">{number}</span> : null}
      <h2 className="section-title">{title}</h2>
      <span className="section-rule" aria-hidden="true" />
    </div>
  )
}

export default SectionHeading
