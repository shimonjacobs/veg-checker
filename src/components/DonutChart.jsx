import React from 'react';

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const radians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function describeDonutSlice(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, rOuter, startAngle);
  const endOuter = polarToCartesian(cx, cy, rOuter, endAngle);
  const startInner = polarToCartesian(cx, cy, rInner, endAngle);
  const endInner = polarToCartesian(cx, cy, rInner, startAngle);

  // Large arc flag is 1 if angle span > 180 degrees
  const angleDiff = endAngle - startAngle;
  const largeArcFlag = angleDiff > 180 ? 1 : 0;

  return [
    `M ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
    `L ${startInner.x.toFixed(2)} ${startInner.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`,
    'Z'
  ].join(' ');
}

export default function DonutChart({
  data = [],
  centerValue = "0",
  centerLabel = "Completed",
  emptyLabel = "No Data"
}) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  const validSlices = data.filter(d => d.value > 0);

  const cx = 90;
  const cy = 90;
  const rOuter = 80;
  const rInner = 52;
  const strokeWidth = rOuter - rInner;
  const midRadius = (rOuter + rInner) / 2;

  let currentAngle = 0;
  const slicesWithPaths = validSlices.map(d => {
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...d,
      startAngle,
      endAngle,
      path: describeDonutSlice(cx, cy, rOuter, rInner, startAngle, endAngle)
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
      {/* SVG Donut */}
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-90">
          {total === 0 ? (
            <circle
              cx={cx}
              cy={cy}
              r={midRadius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
            />
          ) : validSlices.length === 1 ? (
            <circle
              cx={cx}
              cy={cy}
              r={midRadius}
              fill="none"
              stroke={validSlices[0].color}
              strokeWidth={strokeWidth}
            />
          ) : (
            slicesWithPaths.map((slice, i) => (
              <path
                key={slice.label || i}
                d={slice.path}
                fill={slice.color}
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
                className="transition-opacity duration-200 hover:opacity-85"
              />
            ))
          )}
        </svg>

        {/* Center Cutout Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
          {total === 0 ? (
            <>
              <span className="text-xl font-bold text-gray-400 leading-none">0</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{emptyLabel}</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold text-gray-800 leading-none tracking-tight">{centerValue}</span>
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">{centerLabel}</span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="w-full max-w-xs space-y-2">
        {data.length === 0 || total === 0 ? (
          <p className="text-sm text-gray-400 text-center sm:text-left">No batch data available yet.</p>
        ) : (
          data.map(d => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
            return (
              <div
                key={d.label}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: d.color }}
                  ></span>
                  <span className="font-medium text-gray-700 truncate">{d.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-gray-900">{d.value}</span>
                  <span className="text-gray-400 text-[10px] min-w-[32px] text-right">({pct}%)</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
