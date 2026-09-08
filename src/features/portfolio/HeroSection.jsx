import RevealSection from "../../shared/components/RevealSection";

function HeroSection() {
  return (
    <RevealSection as="header" className="hero" immediate>
      <h1 className="hero-name">
        <span className="hero-name-highlight">Benjamin Namayandeh</span>
      </h1>
    </RevealSection>
  );
}

export default HeroSection;
