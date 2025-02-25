"use client";

import { IEpisode } from "@/models/episode";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function EpisodeVsPlayChart() {
  const supabase = createClient();
  const [episodes, setEpisodes] = useState<IEpisode[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisodes = async () => {
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .limit(10)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setEpisodes(data || []);
      }
    };

    fetchEpisodes();
  }, []);

  if (error) {
    return <div>{`An error occurred: ${error}`}</div>;
  }

  return (
    <div className="border flex flex-col">
      <span className="underline mb-2.5">Episode vs plays</span>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={episodes.map((episode) => ({
            episode: episode.name.split(" ")[1],
            plays: episode.plays,
          }))}
          className="w-full"
        >
          <XAxis dataKey="episode" stroke="#ffffff" />
          <YAxis dataKey="plays" stroke="#ffffff" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="plays" fill="#ffffff" name="Plays per Episode">
            <LabelList
              position="top"
              offset={12}
              className="fill-foreground"
              fontSize={12}
              stroke="#ffffff"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 p-2 border rounded shadow text-white">
        <p className="font-bold">Episode {label}</p>
        <p>Plays: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};
