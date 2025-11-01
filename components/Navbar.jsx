"use client";
import Link from "next/link";
import NavIcon from "@/components/NavIcon";
import { useState } from "react";
import {
  HiOutlineEye,
  HiOutlineHome,
  HiOutlineCloudUpload,
  HiOutlinePhotograph,
  HiOutlineCog,
  HiOutlineMenu,
} from "react-icons/hi";

export default function Navbar() {
  const [isNavHovered, setIsNavHovered] = useState(false);

  const baseAnimation = "duration-300 ease-in-out";

  const iconAnims = [
    {
      hidden: "opacity-0 translate-x-8",
      visible: "opacity-100 translate-x-0",
      delay: "delay-0",
    },
    {
      hidden: "opacity-0 translate-x-8",
      visible: "opacity-100 translate-x-0",
      delay: "delay-100",
    },
    {
      hidden: "opacity-0 translate-x-8",
      visible: "opacity-100 translate-x-0",
      delay: "delay-200",
    },
    {
      hidden: "opacity-0 translate-x-8",
      visible: "opacity-100 translate-x-0",
      delay: "delay-300",
    },
  ];

  return (
    <nav
      className="w-full bg-gradient-to-b from-black via-black/70 to-transparent fixed top-0 left-0 z-50"
      onMouseEnter={() => setIsNavHovered(true)}
      onMouseLeave={() => setIsNavHovered(false)}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 bg-neutral-800/50 hover:bg-neutral-700 rounded-full transition-colors"
            data-hoverable="true"
          >
            <HiOutlineEye className="w-6 h-6 text-neutral-400" />
          </Link>

          <div className="relative flex items-center justify-end">
            <div className="flex gap-2">
              <NavIcon
                href="/"
                animationClasses={`${baseAnimation} ${iconAnims[0].delay} ${
                  isNavHovered ? iconAnims[0].visible : iconAnims[0].hidden
                }`}
              >
                <HiOutlineHome className="w-full h-full" />
              </NavIcon>
              <NavIcon
                href="/upload"
                animationClasses={`${baseAnimation} ${iconAnims[1].delay} ${
                  isNavHovered ? iconAnims[1].visible : iconAnims[1].hidden
                }`}
              >
                <HiOutlineCloudUpload className="w-full h-full" />
              </NavIcon>
              <NavIcon
                href="/gallery"
                animationClasses={`${baseAnimation} ${iconAnims[2].delay} ${
                  isNavHovered ? iconAnims[2].visible : iconAnims[2].hidden
                }`}
              >
                <HiOutlinePhotograph className="w-full h-full" />
              </NavIcon>
              <NavIcon
                href="/settings"
                animationClasses={`${baseAnimation} ${iconAnims[3].delay} ${
                  isNavHovered ? iconAnims[3].visible : iconAnims[3].hidden
                }`}
              >
                <HiOutlineCog className="w-full h-full" />
              </NavIcon>
            </div>

            <div
              className={`absolute right-0 top-0 transition-all duration-300 ease-in-out ${
                isNavHovered
                  ? "opacity-0 translate-x-8"
                  : "opacity-100 translate-x-0"
              }`}
            >
              <button
                className="flex items-center justify-center w-10 h-10 bg-neutral-800/50 hover:bg-neutral-700 rounded-full transition-colors"
                data-hoverable="true"
                aria-label="Open menu"
              >
                <HiOutlineMenu className="w-6 h-6 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
