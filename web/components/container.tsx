import { ReactNode } from 'react';

interface ContainerProps {
  className?: string;
  children?: ReactNode;
}

const Container = ({ className, children }: ContainerProps) => {
  return <div className={` max-w-3xl m-auto ${className}`}>{children}</div>;
};

export default Container;
