import Container from "@/components/container";
import Githubicon from "@/components/github";
import BookmarkBox from "@/components/ui/bookmarkbox";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

const Hero = () => {
  return (
    <Container className=" h-scren py-5 flex md:flex-row flex-col items-center justify-between gap-20">
      <div className="flex h-full flex-col items-start justify-start px-4 pt-10 pb-10 md:pt-45 md:pb-45 ">
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
      <BookmarkBox />
    </Container>
  );
};

export default Hero;
