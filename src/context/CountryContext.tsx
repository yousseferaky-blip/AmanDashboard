import React, { createContext, useContext, useEffect, useState } from "react";

type CountryCode = "+20" | "+967";

interface CountryContextType {
  countryCode: CountryCode;
  setCountryCode: (code: CountryCode) => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

const DEFAULT_COUNTRY: CountryCode = "+20";

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [countryCode, setCountryCodeState] = useState<CountryCode>(DEFAULT_COUNTRY);

  useEffect(() => {
    const stored = localStorage.getItem("countryCode") as CountryCode | null;
    if (stored) {
      setCountryCodeState(stored);
    } else {
      localStorage.setItem("countryCode", DEFAULT_COUNTRY);
    }
  }, []);

  const setCountryCode = (code: CountryCode) => {
    setCountryCodeState(code);
    localStorage.setItem("countryCode", code);
  };

  return (
    <CountryContext.Provider value={{ countryCode, setCountryCode }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error("useCountry must be used within CountryProvider");
  }
  return context;
};
