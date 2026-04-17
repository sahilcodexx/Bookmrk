import { ReactNode } from "react";

interface ContainerProps {
  className?: string;
  children?: ReactNode;
}

const Container = ({ className, children }: ContainerProps) => {
  return (
    <div
      className={` w-full max-w-5xl m-auto border-x dark:border-neutral-600/70 border-neutral-300/70 ${className}`}
    >
      {children}
    </div>
  );
};

export default Container;
