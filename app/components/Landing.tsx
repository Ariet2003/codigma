import { Hero } from "./Hero";
import { LanguageSectionLanding } from "./LanguageSection";
import { Features } from "./Features";
import { HowItWork } from "./HowItWork";
import { CTA } from "./CTA";

export default function Landing() {
  return (
    <main>
      <Hero />
      <LanguageSectionLanding />
      <Features />
      <HowItWork />
      <CTA />
    </main>
  );
} 