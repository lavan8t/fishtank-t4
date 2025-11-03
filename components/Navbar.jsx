"use client";
import Link from "next/link";
import NavIcon from "@/components/NavIcon";
import { useState } from "react";
import {
  HiOutlineCloudUpload,
  HiOutlineCog,
  HiOutlineMenu,
} from "react-icons/hi";

import { useView } from "@/contexts/ViewContext";

export default function Navbar() {
  const [isNavHovered, setIsNavHovered] = useState(false);
  const { setIsGalleryOpen } = useView();

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
  ];

  return (
    <nav
      className="w-full bg-gradient-to-b from-[#0d0d0d] via-[#0d0d0d]/70 to-transparent fixed top-0 left-0 z-50"
      onMouseEnter={() => setIsNavHovered(true)}
      onMouseLeave={() => setIsNavHovered(false)}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            href="/"
            onClick={() => setIsGalleryOpen(false)}
            className="group flex items-center justify-center transition-colors"
            data-hoverable="true"
          >
            <span className="text-2xl font-asset text-neutral-100 group-hover:text-[#BADA55] transition-colors tracking-wider">
              VYNX
            </span>
          </Link>

          <div className="relative flex items-center justify-end">
            <div className="flex gap-7">
              <NavIcon
                href="/upload"
                animationClasses={`${baseAnimation} ${iconAnims[0].delay} ${
                  isNavHovered ? iconAnims[0].visible : iconAnims[0].hidden
                }`}
              >
                <HiOutlineCloudUpload className="w-full h-full" />
              </NavIcon>
              <NavIcon
                href="/settings"
                animationClasses={`${baseAnimation} ${iconAnims[1].delay} ${
                  isNavHovered ? iconAnims[1].visible : iconAnims[1].hidden
                }`}
              >
                <HiOutlineCog className="w-full h-full" />
              </NavIcon>
            </div>

            <div
              className={`absolute right-0 top-0 transition-opacity duration-300 ease-in-out ${
                isNavHovered ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <button
                className="flex items-center justify-center w-10 h-10 transition-colors"
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
