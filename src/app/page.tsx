import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-bold mb-4">j a w n . h o s t</h1>
      <p className="text-lg mb-8">made by totonchi</p>
      <div className="flex gap-4">
        <Link href="/lunch">
          <Button size="lg">What's for lunch?</Button>
        </Link>
        <Link href="/venos">
          <Button size="lg">Study for Venos</Button>
        </Link>
      </div>
    </div>
  );
}
