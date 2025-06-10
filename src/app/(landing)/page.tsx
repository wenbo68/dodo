import Hero from "@/components/landing/Hero";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/Pricing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Logos from "@/components/landing/Logos";
import Benefits from "@/components/Benefits/Benefits";
import Container from "@/components/landing/Container";
import Section from "@/components/landing/Section";
import Stats from "@/components/landing/Stats";
import CTA from "@/components/landing/CTA";

const HomePage: React.FC = () => {
  const color1 = "bg-neutral-50";
  const color2 = "bg-white";

  return (
    <>
      <Hero />
      <Logos />
      <Container>
        <Section
          id="benefits"
          title="Benefits"
          description="Discover what makes us different"
          bgColor={color1}
        >
          <Benefits />
        </Section>

        <Section
          id="pricing"
          title="Pricing"
          description="Simple, transparent pricing. No surprises."
          bgColor={color2}
        >
          <Pricing />
        </Section>

        <Section
          id="testimonials"
          title="What Our Clients Say"
          description="Hear from those who have partnered with us."
          bgColor={color1}
        >
          <Testimonials />
        </Section>

        <Section
          id="faq"
          title="FAQ"
          description="Frequently Asked Questions"
          bgColor={color2}
        >
          <FAQ />
        </Section>

        <Section
          id="stats"
          title="Stats"
          description="Our Impact in Numbers"
          bgColor={color1}
        >
          <Stats />
        </Section>

        <CTA />
      </Container>
    </>
  );
};

export default HomePage;
