import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Problem from '@/components/landing/Problem';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import TechStack from '@/components/landing/TechStack';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <TechStack />
      </main>
      <Footer />
    </div>
  );
}
