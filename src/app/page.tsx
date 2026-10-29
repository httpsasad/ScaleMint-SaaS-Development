import { Hero } from '@/components/home/Hero';
import { TrustStrip } from '@/components/home/TrustStrip';
import { WorkflowSection } from '@/components/home/WorkflowSection';
import { WhySection } from '@/components/home/WhySection';
import { PricingSection } from '@/components/home/PricingSection';
import { CtaBanner } from '@/components/home/CtaBanner';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. Breadcrumbs & Hero Section with Heading & CTAs */}
      <Hero />

      {/* 2. Trust-feature strip */}
      <TrustStrip />

      {/* 3. Four-step workflow section */}
      <WorkflowSection />

      {/* 4. Why ScaleMint feature grid */}
      <WhySection />

      {/* 5. Three pricing cards: Starter, Agency, Enterprise with Request a Quote */}
      <PricingSection />

      {/* 6. Final CTA Banner */}
      <CtaBanner />
    </div>
  );
}
