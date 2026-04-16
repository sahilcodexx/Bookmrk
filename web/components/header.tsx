import React from "react";
import Container from "./container";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";

const Header = () => {
  return (
    <div className="border-b">
      <Container className="pt-4 pb-3 px-5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">Bookmrk</h2>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50 duration-200 transition-all text-sm"
            >
              Docs
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Header;
