import { Code, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          <p className="text-muted-foreground">
            Made by <a href="#" className="font-semibold text-foreground hover:text-primary transition-colors">Anshuman Mishra</a>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
            <Github className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
