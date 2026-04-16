import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

const Hero = () => {
  return (
    <Container className=" h-screen px-10 py-5 ">
      <div className="  h-full flex flex-col justify-center items-start">
        <h2 className="text-3xl ">One Place for All Your Favorite Links</h2>
        <h2 className="text-3xl ">Save & Access anywhere</h2>
        <p className="text-neutral-600 mt-4 max-w-sm text-lg">
          Access your favorite Bookmarks links anytime, anywhere, across all
          your devices. Never lose a link again.
        </p>
        <div className="mt-4 flex items-center gap-5">
          <Button size="lg" className="dark:bg-orange-600 mt-4">
            Get started <ArrowRightIcon />
          </Button>
          <Button size="lg" className=" dark:bg-neutral-700/70 mt-4">
            Star Github <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default Hero;
