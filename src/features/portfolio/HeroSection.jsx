import RevealSection from "../../shared/components/RevealSection";

function HeroSection() {
  return (
    <RevealSection as="header" className="hero" immediate>
      <p className="hero-eyebrow">Software Engineer · Student</p>
      <h1 className="hero-name">Benjamin Namayandeh</h1>
      <p className="hero-intro">
        Software engineering student at Western University. I like building
        thoughtful software across backend services, embedded systems, and
        applied AI. Always open to connecting. Feel free to{" "}
        <a href="#contact">reach out</a>.
      </p>
    </RevealSection>
  );
}

export default HeroSection;
