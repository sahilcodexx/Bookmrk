import Container from "@/components/container";
import Image from "next/image";
import React from "react";

const BannerSection = () => {
  return (
    <>
      <div className=" bg-neutral-300/70 dark:bg-neutral-600 h-px w-full"></div>
      <Container className="relative bg-neutral-800/70 ">
        <div className="absolute z-10 h-2 w-2 top-0 xl:-top-1 left-0 xl:-left-1 rounded-none bg-black dark:bg-white"></div>
        <div className="absolute z-10 h-2 w-2 top-0 xl:-top-1 right-0 xl:-right-1 rounded-none bg-black dark:bg-white"></div>
        <div className="absolute z-10 h-2 w-2 bottom-0 xl:-bottom-1 left-0 xl:-left-1 rounded-none bg-black dark:bg-white"></div>
        <div className="absolute z-10 h-2 w-2 bottom-0 xl:-bottom-1 right-0 xl:-right-1 rounded-none bg-black dark:bg-white"></div>
        <div className="my-10 p-5">
          <Image
            src="/image.webp"
            height={800}
            width={1200}
            alt="banner"
            className=" rounded-lg bg-size-[5px_5px] bg-[radial-gradient(circle,#525252_1px,transparent_1px)]"
          />
        </div>
      </Container>
      <div className=" bg-neutral-300/70 dark:bg-neutral-600 h-px w-full  "></div>
    </>
  );
};

export default BannerSection;
