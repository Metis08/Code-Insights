import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hourglass, FileWarning, Share2 } from "lucide-react";

const problems = [
  {
    icon: <Hourglass className="w-8 h-8 text-primary" />,
    title: "Wasted Hours",
    description: "Developers spend countless hours deciphering unfamiliar code, slowing down development cycles and project timelines."
  },
  {
    icon: <FileWarning className="w-8 h-8 text-primary" />,
    title: "Outdated Documentation",
    description: "Relying on documentation that is often missing, incomplete, or lagging far behind the actual codebase leads to confusion."
  },
  {
    icon: <Share2 className="w-8 h-8 text-primary" />,
    title: "Fragmented Insights",
    description: "Existing tools provide disconnected pieces of information, forcing developers to manually connect the dots."
  }
];

export default function Problem() {
  return (
    <section id="problem" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">The Developer's Dilemma</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Navigating a new codebase is a universal challenge. Here's why it's so tough.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <Card key={index} className="bg-card/50 border-border/50 backdrop-blur-sm transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
              <CardHeader className="flex flex-col items-center text-center">
                {problem.icon}
                <CardTitle className="mt-4 text-xl">{problem.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
