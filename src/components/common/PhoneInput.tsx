"use client";

import React, { useState, useEffect, useRef } from "react";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { ALL_COUNTRIES, DEFAULT_COUNTRY, CountryInfo } from "@/utils/countryCodes";
import { ChevronDown, Search, Phone, Check } from "lucide-react";

interface PhoneInputProps {
  value: string;
  onChange: (normalizedE164: string, isValid: boolean, rawValue: string) => void;
  label?: string;
  helperText?: string;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export default function PhoneInput({
  value,
  onChange,
  label = "PHONE NUMBER",
  helperText = "We'll use this number for account verification and security.",
  error = null,
  disabled = false,
  required = false,
  className = "",
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(DEFAULT_COUNTRY); // India (+91) default
  const [localNumber, setLocalNumber] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [internalError, setInternalError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync initial incoming value or pasted E.164 string
  useEffect(() => {
    if (!value) {
      setLocalNumber("");
      return;
    }

    // Try parsing full E.164 if value starts with '+'
    if (value.trim().startsWith("+")) {
      const parsed = parsePhoneNumberFromString(value.trim());
      if (parsed && parsed.country) {
        const match = ALL_COUNTRIES.find((c) => c.code === parsed.country);
        if (match) {
          setSelectedCountry(match);
          setLocalNumber(parsed.nationalNumber);
          return;
        }
      }
    }

    // Fallback: strip leading country dialcode if present
    let clean = value.trim();
    if (clean.startsWith(selectedCountry.dialCode)) {
      clean = clean.slice(selectedCountry.dialCode.length).trim();
    }
    setLocalNumber(clean);
  }, [value]);

  // Handle local number change or country selection
  const handlePhoneChange = (numStr: string, country: CountryInfo = selectedCountry) => {
    const trimmed = numStr.trim();
    setLocalNumber(numStr);

    if (!trimmed) {
      setInternalError(null);
      onChange("", !required, "");
      return;
    }

    let activeCountry = country;
    let targetDigits = trimmed;

    // Intelligent Pasted Number Detection: If user pastes number starting with '+'
    if (trimmed.startsWith("+")) {
      const parsedPasted = parsePhoneNumberFromString(trimmed);
      if (parsedPasted && parsedPasted.country) {
        const matchedCountry = ALL_COUNTRIES.find((c) => c.code === parsedPasted.country);
        if (matchedCountry) {
          activeCountry = matchedCountry;
          setSelectedCountry(matchedCountry);
          targetDigits = parsedPasted.nationalNumber;
          setLocalNumber(targetDigits);
        }
      }
    }

    // Combine country dial code and typed local number
    const combined = targetDigits.startsWith("+")
      ? targetDigits
      : `${activeCountry.dialCode}${targetDigits.replace(/\D/g, "")}`;

    const parsed = parsePhoneNumberFromString(combined, activeCountry.code);

    if (parsed && parsed.isValid()) {
      const normalizedE164 = parsed.number; // e.g. +919876543210, +447911123456
      setInternalError(null);
      onChange(normalizedE164, true, targetDigits);
    } else {
      setInternalError(`Invalid phone number for ${activeCountry.name} (${activeCountry.dialCode})`);
      onChange("", false, targetDigits);
    }
  };

  const handleCountrySelect = (country: CountryInfo) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery("");
    handlePhoneChange(localNumber, country);
  };

  const searchClean = searchQuery.toLowerCase().trim().replace(/^\+/, "");
  const filteredCountries = ALL_COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(searchClean) ||
    c.dialCode.replace(/^\+/, "").includes(searchClean) ||
    c.code.toLowerCase().includes(searchClean)
  );

  const displayError = error || internalError;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center" ref={dropdownRef}>
        {/* Country Selector Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="h-11 px-3 bg-neutral-100 dark:bg-neutral-900 border border-r-0 border-neutral-300 dark:border-neutral-700 rounded-l-xl flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span>{selectedCountry.dialCode}</span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
        </button>

        {/* Local Phone Number Input */}
        <div className="relative flex-1">
          <input
            type="tel"
            disabled={disabled}
            value={localNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="98765 43210"
            className={`w-full h-11 pl-9 pr-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-r-xl text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 ${
              displayError ? "border-rose-500 dark:border-rose-500" : ""
            }`}
          />
          <Phone className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Searchable Country Dropdown */}
        {isOpen && (
          <div className="absolute top-12 left-0 z-50 w-72 max-h-72 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            {/* Dropdown Search Header */}
            <div className="p-2.5 border-b border-neutral-150 dark:border-neutral-800 relative">
              <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country, code or +91..."
                className="w-full h-8 pl-8 pr-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
                autoFocus
              />
            </div>

            {/* Country List */}
            <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-400">
                  No matching countries found.
                </div>
              ) : (
                filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      selectedCountry.code === c.code
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-neutral-400 font-mono text-[11px]">{c.dialCode}</span>
                      {selectedCountry.code === c.code && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error or Helper text */}
      {displayError ? (
        <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{displayError}</p>
      ) : helperText ? (
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed">{helperText}</p>
      ) : null}
    </div>
  );
}
