"use client";
import { usePhotos } from "../../contexts/PhotoContext";
import { processPhotosByYear } from "../../lib/utils";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function TimelinePage() {
  const { photos } = usePhotos();

  const photosByYear = useMemo(() => processPhotosByYear(photos), [photos]);

  return (
    <section className="flex flex-col w-full min-h-[70vh]">
      <header className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-3xl font-bold text-white">Timeline</h1>
          <p className="text-sm text-neutral-400">Photo activity over time.</p>
        </div>
      </header>

      <div className="mt-8 w-full">
        {photos.length > 0 ? (
          <div className="w-full h-[50vh] bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl shadow-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={photosByYear}
                margin={{
                  top: 5,
                  right: 20,
                  left: -20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} />
                <YAxis stroke="#a3a3a3" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    borderColor: "#404040",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "#ffffff" }}
                  itemStyle={{ color: "#8b5cf6" }}
                />
                <Bar dataKey="photos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-8 border-2 border-dashed border-neutral-800 rounded-lg p-10 text-neutral-500 text-center">
            <p>No timeline data to show. Scan a folder to begin.</p>
          </div>
        )}
      </div>
    </section>
  );
}
