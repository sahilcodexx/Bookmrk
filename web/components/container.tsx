import { ReactNode } from "react";

interface ContainerProps {
  className?: string;
  children?: ReactNode;
}

const Container = ({ className, children }: ContainerProps) => {
  return <div className={` w-full max-w-3xl m-auto border-x ${className}`}>{children}</div>;
};

export default Container;
