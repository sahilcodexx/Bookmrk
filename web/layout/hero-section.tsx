import Container from "@/components/container";
import Githubicon from "@/components/github";
import BookmarkBox from "@/components/ui/bookmarkbox";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { BlinkingGrid } from "@/components/ui/blinking-grid";

const Hero = () => {
  return (
    <Container className="relative min-h-[500px] md:min-h-[700px] py-12 md:py-16 flex md:flex-row flex-col items-center justify-between gap-12 md:gap-20 overflow-hidden">
      {/* BLINKING GRID BACKGROUND TOP LEFT */}
      <div className="absolute top-0 left-0 w-[500px] h-[400px] pointer-events-none z-0 [mask-image:radial-gradient(ellipse_at_top_left,black_10%,transparent_50%)] opacity-70 dark:opacity-90">
        <BlinkingGrid />
      </div>
      
      {/* BLINKING GRID BACKGROUND BOTTOM RIGHT */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none z-0 [mask-image:radial-gradient(ellipse_at_bottom_right,black_10%,transparent_50%)] opacity-70 dark:opacity-90">
        <BlinkingGrid />
      </div>

      <div className="relative z-10 flex h-full flex-col items-start justify-center px-4">
        <div className="px-10">
          <h2 className="max-w-xl text-4xl">
            A Better Way to Save and Revisit Links Anytime
          </h2>
          <p className="mt-4 max-w-md text-lg text-neutral-600">
            Access your favorite Bookmarks links anytime, anywhere, across all
            your devices and Never lose a link again.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-5 px-10">
          <Button size="lg" className="mt-4 dark:bg-orange-600">
            Get started <ArrowRightIcon />
          </Button>
          <Button size="lg" variant="outline" className="mt-4 shadow-xs">
            Star Github
            <Githubicon />
          </Button>
        </div>
      </div>
      <div className="relative z-10">
        <BookmarkBox />
      </div>
    </Container>
  );
};

export default Hero;
