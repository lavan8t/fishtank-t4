"use client";
import Link from "next/link";

export default function NavIcon({ href, children, animationClasses }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-center w-10 h-10 bg-neutral-800/50 rounded-full transition-all ease-in-out group hover:bg-neutral-700 ${animationClasses}`}
      data-hoverable="true"
    >
      <div className="flex-shrink-0 w-6 h-6 text-neutral-400 group-hover:text-white transition-colors">
        {children}
      </div>
      <span
        className={`whitespace-nowrap text-sm font-medium text-white transition-all duration-300 ease-in-out ml-0 max-w-0 opacity-0`}
      ></span>
    </Link>
  );
}
