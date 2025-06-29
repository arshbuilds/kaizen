"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";


const ROW_HEIGHT = 40;  

const FormDropdown = ({
  value,
  onChange,
  options,
  placeholder = "Select",
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const btn = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - btn.bottom;

    const menuHeight =
      menuRef.current?.scrollHeight ?? options.length * ROW_HEIGHT + 16; // +padding

    setOpenUpwards(spaceBelow < menuHeight); // true ⇒ open up
  }, [isOpen, options.length]);

  return (
    <div className="relative w-full">
      <button
        type="button"
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border
                   border-slate-600/60 bg-[#243044] px-3 py-3 text-left shadow"
      >
        <span className="truncate">
          {value ?? <span className="text-slate-400">{placeholder}</span>}
        </span>
        <FaChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            ref={menuRef}
            className={`absolute left-0 z-10 w-full overflow-y-auto
                       rounded-lg border border-slate-600/60 bg-slate-700/60
                       py-2 shadow-lg 
                       ${
                         openUpwards
                           ? "bottom-full mb-1 origin-bottom"
                           : "top-full mt-1 origin-top"
                       }`}
            initial={{ opacity: 0, y: openUpwards ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: openUpwards ? 6 : -6 }}
            transition={{ duration: 0.15 }}
          >
            {options.map((opt) => (
              <li
                key={opt}
                className="cursor-pointer px-4 py-2 hover:bg-slate-600/30"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormDropdown;
