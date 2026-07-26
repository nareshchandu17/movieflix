"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { BiSearch, BiX } from "react-icons/bi";

interface EnhancedSearchBarProps {
  onTyping?: (value: string) => void;
  onSearch?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  initialValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

const EnhancedSearchBar = ({
  onTyping,
  onSearch,
  onFocus,
  onBlur,
  initialValue = "",
  placeholder = "Search for movies, TV shows, actors..",
  autoFocus = true,
}: EnhancedSearchBarProps) => {
  const searchBarRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState<string>(initialValue);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (autoFocus) {
      searchBarRef.current?.focus();
    }
  }, [autoFocus]);

  const handleTyping = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
      onTyping?.(value);
    },
    [onTyping]
  );

  const handleSearch = useCallback(() => {
    if (!searchValue.trim()) {
      searchBarRef.current?.focus();
      return;
    }
    onSearch?.(searchValue.trim());
  }, [searchValue, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      } else if (e.key === "Escape") {
        searchBarRef.current?.blur();
      }
    },
    [handleSearch]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleClear = useCallback(() => {
    setSearchValue("");
    onTyping?.("");
    searchBarRef.current?.focus();
  }, [onTyping]);

  return (
    <div className="relative max-w-2xl w-full">
      <div
        className={`relative flex items-center bg-gradient-to-r from-black/90 to-gray-900/90 backdrop-blur-xl rounded-2xl border-2 transition-all duration-300 overflow-hidden ${isFocused
            ? "border-red-600 shadow-lg shadow-red-600/20 scale-[1.02]"
            : "border-gray-700 hover:border-gray-600"
          }`}
      >
        <div className="pl-4 pr-3">
          <BiSearch
            className={`text-xl transition-colors duration-300 ${isFocused ? "text-red-500" : "text-gray-400"}`}
          />
        </div>

        <input
          ref={searchBarRef}
          value={searchValue}
          type="text"
          name="search"
          id="search"
          placeholder={placeholder}
          aria-label={placeholder}
          aria-expanded={isFocused}
          className="flex-1 bg-transparent text-white placeholder-gray-400 py-4 placeholder:text-sm pr-3 text-base outline-none font-medium"
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="off"
        />

        {searchValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-3 text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Clear search"
          >
            <BiX className="text-lg" />
          </button>
        )}

        <button
          type="button"
          aria-label="Search"
          className="text-gray-400 hover:text-white px-4 py-4 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSearch}
          disabled={!searchValue.trim()}
        >
          <BiSearch className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default EnhancedSearchBar;
