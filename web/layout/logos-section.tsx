"use client";

import Container from "@/components/container";
import { motion } from "motion/react";

const LogoSection = () => {
  const companies = [
    { name: "Google" },
    { name: "Microsoft" },
    { name: "Anthropic" },
    { name: "Adobe" },
    { name: "Apple" },
    { name: "Amazon" },
    { name: "Meta" },
    { name: "Tesla" },
  ];

  return (
    <>
      <Container className="pb-10">
        <div className=" flex flex-col pt-20 gap-10 items-center justify-start">
          <h2 className="text-3xl max-w-sm text-center">
            People Use Our Product Working At
          </h2>
          <div className="border-divide grid grid-cols-2  md:grid-cols-4">
            {companies.map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center px-25 py-8 border dark:border-neutral-800/60 "
              >
                {company.name}
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
      <div className=" bg-neutral-300/70 dark:bg-neutral-600 h-px w-full "></div>
    </>
  );
};

export default LogoSection;
