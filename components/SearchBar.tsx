"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchBar({ placeholder, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center w-full sm:w-[512px] bg-white border border-gray-300 rounded-2xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
      <Search className="text-gray-500 mr-2 shrink-0" size={20} />
      <input
        type="text"
        placeholder={placeholder || "Rechercher..."}
        onChange={onChange} // ✅ Ajout ici
        className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
      />
    </div>
  );
}
