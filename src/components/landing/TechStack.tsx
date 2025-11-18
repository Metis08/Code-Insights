import { Badge } from "@/components/ui/badge";

const technologies = [
  "Next.js",
  "Firebase",
  "Tailwind CSS",
  "shadcn/ui",
  "TypeScript",
  "Genkit",
  "Gemini"
];

export default function TechStack() {
  return (
    <section id="tech-stack" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Built with a Modern Stack</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Leveraging the best tools for a fast, reliable, and scalable experience.
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {technologies.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-md px-4 py-2 rounded-lg">
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
