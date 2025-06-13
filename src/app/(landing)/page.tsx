import Hero from "@/components/landing/Hero";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Logos from "@/components/landing/Logos";
import Benefits from "@/components/landing/Benefits/Benefits";
import Container from "@/components/landing/Container";
import Section from "@/components/landing/Section";
import Stats from "@/components/landing/Stats";
import CTA from "@/components/landing/CTA";

const HomePage: React.FC = () => {
  const color1 = "bg-neutral-50 dark:bg-neutral-700";
  const color2 = "bg-white dark:bg-neutral-800";

  return (
    <>
      <Hero />
      {/* <Logos /> */}
      <Container>
        <Section
          id="benefits"
          title="Features"
          description="Discover what makes us different"
          bgColor={color1}
        >
          <Benefits />
        </Section>

        <Section
          id="pricing"
          title="Pricing"
          description="Transparent pricing. No surprises."
          bgColor={color2}
        >
          <Pricing />
        </Section>

        {/* <Section
          id="testimonials"
          title="What Our Clients Say"
          description="Hear from those who have partnered with us."
          bgColor={color1}
        >
          <Testimonials />
        </Section> */}

        <Section
          id="faq"
          title="FAQ"
          description="Frequently Asked Questions"
          bgColor={color1}
        >
          <FAQ />
        </Section>

        {/* <Section
          id="stats"
          title="Stats"
          description="Our Impact in Numbers"
          bgColor={color1}
        >
          <Stats />
        </Section> */}

        <CTA />
      </Container>
    </>
  );
};

export default HomePage;
