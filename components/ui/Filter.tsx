"use client";
import { useState } from "react";

export default function Filter({ years }: { years: number[] }) {
  const [activeYear, setActiveYear] = useState(years[years.length - 1]);

  return (
    <fieldset className="w-full px-4 bg-white flex flex-row gap-4 items-center border-b border-gray-200">
      <legend className="sr-only">Filter by year</legend>
      <span aria-hidden="true">ANO</span>
      <ul role="list" className="flex flex-row gap-4">
        {years.map((year) => (
          <li key={year} className="flex">
            <button
              onClick={() => setActiveYear(year)}
              className={`py-3 h-full border-b-2 transition-all duration-200 cursor-pointer ${activeYear === year ? "border-primary text-primary" : "border-transparent"}`}
            >
              {year}
            </button>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
