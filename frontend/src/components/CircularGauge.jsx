

export const CircularGauge = ({ percentage, color = '#127ec3' }) => {
  // SVG Arc Configuration for a clean circular progress indicator
  const radius = 24;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className="relative flex items-center justify-center w-[4.875rem] h-[4.9375rem] bg-white rounded-full shadow-elevation-2 select-none"
      data-node-id="135:445"
    >
      <svg className="w-[3.75rem] h-12 transform -rotate-90" viewBox="0 0 60 60">
        {/* Track Circle */}
        <circle
          className="text-gray-100"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="30"
          cy="30"
        />
        {/* Active Progress Circle */}
        <circle
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx="30"
          cy="30"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Centered Percentage Number */}
      <span className="absolute font-mono font-bold text-base text-bp-navy">
        {Math.round(percentage)}%
      </span>
    </div>
  );
};
