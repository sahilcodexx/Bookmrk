"use client";

import { PointerEvent, useRef, useState } from "react";
import Container from "@/components/container";
import Image from "next/image";

const BannerSection = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = wrapperRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const xRatio = (event.clientX - bounds.left) / bounds.width;
    const yRatio = (event.clientY - bounds.top) / bounds.height;
    const maxMove = 70;

    const x = (xRatio - 0.5) * maxMove;
    const y = (yRatio - 0.5) * maxMove;

    setOffset({ x, y });
  };

  const handlePointerLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <>
      <div className=" bg-neutral-300/70 dark:bg-neutral-600 h-px w-full"></div>
      <Container className="relative  bg-neutral-200/30 dark:bg-neutral-800/70">
        <div className="absolute z-10 h-2 w-2 top-0 xl:-top-1 left-0 xl:-left-1 rounded-none bg-black dark:bg-white"></div>
        <div className="absolute z-10 h-2 w-2 top-0 xl:-top-1 right-0 xl:-right-1 rounded-none bg-black dark:bg-white"></div>
        <div className="absolute z-10 h-2 w-2 bottom-0 xl:-bottom-1 left-0 xl:-left-1 rounded-none bg-black dark:bg-white"></div>
        <div className="absolute z-10 h-2 w-2 bottom-0 xl:-bottom-1 right-0 xl:-right-1 rounded-none bg-black dark:bg-white"></div>
        <div
          ref={wrapperRef}
          className="my-10 mx-10 rounded-lg border dark:border-neutral-500 overflow-visible bg-[repeating-linear-gradient(60deg,#d4d4d4_0px,#e5e5e5_1px,transparent_1px,transparent_6px)] dark:bg-[repeating-linear-gradient(60deg,#73737360_0px,#737373_1px,transparent_1px,transparent_6px)]"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <div
            className="transition-transform duration-150 ease-out will-change-transform"
            style={{
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
            }}
          >
            <Image
              loading="eager"
              src="/image.webp"
              height={800}
              width={1200}
              alt="banner"
              className="rounded-lg border shadow-sm"
            />
          </div>
        </div>
      </Container>
      <div className=" bg-neutral-300/70 dark:bg-neutral-600 h-px w-full "></div>
    </>
  );
};

export default BannerSection;
