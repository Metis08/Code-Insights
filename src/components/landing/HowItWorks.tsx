const steps = [
  {
    step: 1,
    title: "Connect GitHub Repo",
    description: "Provide the URL to a public GitHub repository you want to analyze. No installation or configuration needed.",
    code: `// 1. Enter repository URL
const repoUrl = "https://github.com/user/project";`
  },
  {
    step: 2,
    title: "AI Analyzes The Code",
    description: "Our system, powered by Gemini and Genkit, clones the repo and begins its analysis, mapping out the entire architecture.",
    code: `// 2. AI generates insights
const { summary, docs } = await analyze(repoUrl);`
  },
  {
    step: 3,
    title: "Get Instant Insights",
    description: "Explore the codebase through an interactive dashboard with summaries, file-by-file documentation, and more.",
    code: `// 3. Explore documentation
console.log(summary);
console.log(docs['src/app.ts']);`
  }
];

const CodeBlock = ({ code }: { code: string }) => (
  <pre className="mt-4 bg-zinc-800/80 rounded-lg p-4 text-sm font-code overflow-x-auto">
    <code className="text-accent">{code.trim()}</code>
  </pre>
);

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Simple 3-Step Process</h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            Go from zero to full understanding in just a few clicks.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step) => (
              <div key={step.step}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                      {step.step}
                    </div>
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                  </div>
                  <p className="mt-4 text-muted-foreground">{step.description}</p>
                  <CodeBlock code={step.code} />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
