import { Card, CardTitle } from "@/components/ui/card";
import { Github, FileText, Network, Smartphone, Sparkles } from "lucide-react";

const features = [
  {
    icon: <Github className="w-10 h-10 text-primary" />,
    title: "GitHub Repo Analysis",
    description: "Connect any public GitHub repository. Our AI gets to work instantly, cloning and parsing the codebase without any setup."
  },
  {
    icon: <FileText className="w-10 h-10 text-primary" />,
    title: "AI-Generated Documentation",
    description: "Get file-by-file documentation, complete with code snippets and explanations, powered by Google's Gemini."
  },
  {
    icon: <Network className="w-10 h-10 text-primary" />,
    title: "Architecture Summaries",
    description: "Understand the high-level structure at a glance. We generate summaries of components, dependencies, and data flow."
  },
  {
    icon: <Smartphone className="w-10 h-10 text-primary" />,
    title: "Responsive, Clean UI",
    description: "Explore your codebase insights through a fast, modern, and fully responsive interface built for developers."
  },
  {
    icon: <Sparkles className="w-10 h-10 text-primary" />,
    title: "Future: Q&A and Code Gen",
    description: "Soon, you'll be able to ask questions about your code and generate new code based on existing patterns."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 lg:py-32">
       <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Powerful Insights, Zero Friction</h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to master a codebase, automated and intelligent.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col bg-card/50 border-border/50 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:shadow-2xl hover:shadow-primary/20">
              {feature.icon}
              <CardTitle className="mt-4 mb-2 text-2xl font-bold">{feature.title}</CardTitle>
              <p className="text-muted-foreground flex-grow">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
