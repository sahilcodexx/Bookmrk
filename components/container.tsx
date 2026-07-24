import { forwardRef, HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={` w-full max-w-5xl m-auto border-x dark:border-neutral-600/70 border-neutral-300/70 ${className}`}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export default Container;
