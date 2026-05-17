import { BiGlobe } from "react-icons/bi";
import { useCountry } from "../../context/CountryContext";

const CountrySwitcher = () => {
  const { countryCode, setCountryCode } = useCountry();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value as "+20" | "+967";

    if (newCode === countryCode) return;

    setCountryCode(newCode);

    // 🔄 reload dashboard
    window.location.reload();
    
  };

  return (
    <div className="relative inline-block">
      {/* Icon Decoration */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <BiGlobe className="w-4 h-4 text-indigo-300" />
      </div>

      <select
        value={countryCode}
        onChange={handleChange}
        className="
          appearance-none
          bg-gradient-to-br from-indigo-800 to-indigo-900
          text-white
          border-2 border-indigo-600
          rounded-xl
          px-4 pr-10 py-2.5
          text-sm font-medium
          cursor-pointer
          transition-all duration-300
          hover:border-indigo-400
          hover:shadow-lg hover:shadow-indigo-500/30
          focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
          backdrop-blur-sm
        "
        style={{ direction: 'rtl' }}
      >
        <option value="+20" className="bg-indigo-900 text-white py-2">
          🇪🇬 مصر (+20)
        </option>
        <option value="+967" className="bg-indigo-900 text-white py-2">
          🇾🇪 اليمن (+967)
        </option>
      </select>

      {/* Custom Dropdown Arrow */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          className="w-4 h-4 text-indigo-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

export default CountrySwitcher;