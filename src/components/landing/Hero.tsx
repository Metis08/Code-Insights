import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative w-full py-32 md:py-48 lg:py-56 flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 -z-10 h-full w-full bg-background">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(137,44,220,0.3),rgba(255,255,255,0))]"></div>
      </div>
      
      <div className="container relative z-10 flex flex-col items-center text-center px-4">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-2">
          Understand Any Codebase in Minutes, Not Days.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-neutral-300">
          AI-powered code analysis using Gemini. Import a GitHub repo and instantly get architecture summaries, documentation, and insights.
        </p>
        <div className="mt-8">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-full shadow-[0_0_20px_theme(colors.primary)] transition-shadow duration-300 hover:shadow-[0_0_30px_theme(colors.primary)]">
            Analyze a Repo
          </Button>
        </div>
      </div>
    </section>
  );
}
