"use client";

import { useMemo } from "react";
import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";

function formatDateTick(tick) {
  if (!tick || tick === "Unknown") return "Unknown";
  try {
    const dateString = tick.includes("T") ? tick : `${tick}T00:00:00`;
    const date = new Date(dateString);
    if (isNaN(date)) return tick;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return tick;
  }
}

export default function PhotosTimelineChart({ photosByDay = [] }) {
  const cumulativePhotosByDay = useMemo(() => {
    let cumulativeCount = 0;
    return photosByDay.map((item) => ({
      ...item,
      cumulative: (cumulativeCount += item.photos),
    }));
  }, [photosByDay]);

  const totalPhotos =
    cumulativePhotosByDay.length > 0
      ? cumulativePhotosByDay[cumulativePhotosByDay.length - 1].cumulative
      : 0;

  return (
    <div
      className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl shadow-lg flex flex-col p-5 relative"
      style={{ height: 210, minWidth: 0, minHeight: 0 }}
    >
      <h2
        className="font-serif font-bold text-4xl text-[#BADA55] mb-2"
        style={{ fontFamily: "var(--font-serif), serif" }}
      >
        {totalPhotos} Photos
      </h2>

      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={0}
      >
        <LineChart
          data={cumulativePhotosByDay}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          style={{ minWidth: 0, minHeight: 0 }}
        >
          <defs>
            <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BADA55" stopOpacity={0.3} />
              <stop offset="85%" stopColor="#BADA55" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* No XAxis */}

          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="#BADA55"
            strokeWidth={4}
            dot={false}
            activeDot={false}
            fill="url(#fade)"
            fillOpacity={1}
          />

          <Tooltip
            labelFormatter={formatDateTick}
            cursor={false}
            contentStyle={{
              background: "#191919",
              borderRadius: "10px",
              border: "none",
              fontFamily: "var(--font-serif), serif",
            }}
            labelStyle={{ color: "#BADA55", fontWeight: 700 }}
            itemStyle={{ color: "#e5e5e5", fontWeight: 500 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div
        className="absolute left-0 bottom-0 w-full h-10 pointer-events-none"
        style={{
          background: "linear-gradient(0deg, #0d0d0d 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
