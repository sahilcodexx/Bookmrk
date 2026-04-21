import Container from "@/components/container";
import React from "react";

const FeatureSection = () => {
  return (
    <>
      <Container>
        <div className="min-h-screen  py-10">
          <div className="border-y flex items-center h-100 justify-center gap-10 px-10 ">
            <div className="flex w-full items-center justify-center ">
              <div className="h-60 border w-60 bg-secondary/30 rounded-lg  flex items-center justify-center">
                s
              </div>
            </div>
            <div className=" bg-neutral-300/70 dark:bg-neutral-700/50 w-px h-full "></div>
            <div className="w-full">s</div>
          </div>
        </div>
      </Container>
      <div className=" bg-neutral-300/70 dark:bg-neutral-700/50 h-px w-full "></div>
    </>
  );
};

export default FeatureSection;
