"use client"

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
    <Container>
      <div className="min-h-screen flex items-center justify-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center justify-center text-2xl font-bold"
            >
              {company.name}
            </motion.div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default LogoSection;
