"use client";
import { useState } from "react";
import Copypaste from "../copypaste";
import { Bookmark } from "lucide-react";
import { motion } from "motion/react";

const BookmarkBox = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseMove = () => {
    setIsMoving(true);
    setTimeout(() => setIsMoving(false), 1000);
  };

  return (
    <div
      className="mr-10 relative mb-20 md:mb-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="absolute -top-25 -left-20">
        <Copypaste />
      </span>
      <div className="border flex items-center justify-center h-50 w-45 rounded-lg dark:border-neutral-600/80 border-neutral-300 shadow-xs hover:bg-neutral-100/70 dark:hover:bg-neutral-900 duration-200 transition-all">
        <Bookmark size={30} />
      </div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={
          isHovered && !isMoving ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }
        }
        transition={{ duration: 0.3 }}
        className="absolute bottom-2 border text-xs px-3 py-1 rounded-sm bg-white dark:bg-black left-5"
      >
        Bookmark your link
      </motion.div>
    </div>
  );
};

export default BookmarkBox;
