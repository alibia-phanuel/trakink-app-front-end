"use client";

import { useEffect, useState } from "react";
import { getStats, StatsResponse } from "@/lib/stats";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart2, CheckCircle, Package } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import ProtectedRoute from "../context/ProtectedRoute";

// Mapping des pays vers drapeaux (standardized keys)
const countryFlags: Record<string, string> = {
  cameroun: "🇨🇲",
  "côte d'ivoire": "🇨🇮",
  mali: "🇲🇱",
  ghana: "🇬🇭",
  guinée: "🇬🇳",
  sénégal: "🇸🇳",
};

// Normalize country name for consistent lookup
const normalizeCountryName = (country: unknown): string => {
  if (typeof country !== "string") {
    console.warn(`Invalid country name: ${country}`);
    return "unknown"; // Fallback for non-string values
  }
  return country.trim().toLowerCase();
};

// Component to display flag
const CountryFlag = ({ country }: { country: unknown }) => {
  const normalizedKey = normalizeCountryName(country);
  return (
    <span className="text-2xl mr-3">{countryFlags[normalizedKey] || "🏳️"}</span>
  );
};

// Merge duplicate country entries
const mergeDuplicateCountries = (data: { pays: string; count: number }[]) => {
  const merged: Record<string, number> = {};
  data.forEach((item) => {
    const normalizedKey = normalizeCountryName(item.pays);
    if (normalizedKey !== "unknown") {
      merged[normalizedKey] = (merged[normalizedKey] || 0) + item.count;
    }
  });
  return Object.entries(merged).map(([pays, count]) => ({ pays, count }));
};

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <div className="p-6 space-y-6 bg-[#f8f8f8] min-h-screen">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(2)].map((_, idx) => (
          <Card key={idx} className="border-none shadow-lg">
            <CardHeader>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-none shadow-lg">
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Skeleton for Country List */}
            <div className="lg:w-1/3">
              <ScrollArea className="h-80">
                <ul className="space-y-4">
                  {[...Array(6)].map((_, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-6 w-6 bg-gray-200 rounded animate-pulse mr-3" />
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
            {/* Skeleton for Chart */}
            <div className="lg:w-2/3">
              <div className="h-80 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Page() {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getStats();
        console.log("API Response (colisByPays):", data.stats.colisByPays); // Debug log
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    })();
  }, []);

  if (!stats) return <SkeletonLoader />;

  const { colisByPays } = stats.stats;
  // Filter out invalid entries before merging
  const validColisByPays = colisByPays.filter(
    (item) => typeof item.pays === "string" && item.pays.trim() !== ""
  );
  const mergedColisByPays = mergeDuplicateCountries(validColisByPays);

  return (
    <div className="p-6 space-y-6 bg-[#f8f8f8] min-h-screen">
      <ProtectedRoute>
        <h1 className="text-3xl font-bold text-[#cf6e4c] flex items-center gap-2">
          <BarChart2 /> Statistiques des colis
        </h1>
        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Total Colis</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Package className="text-[#cf6e4c]" /> {stats.stats.totalColis}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[#333]">
              Colis reçus: {stats.stats.colisRecus} <br />
              Colis quittés Chine: {stats.stats.colisQuittesChine} <br />
              Taux de réception: {stats.stats.tauxReception}%
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Réception Complète</CardTitle>
              <CardDescription className="flex items-center gap-2 text-green-500">
                <CheckCircle /> {stats.stats.tauxReception}%
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        {/* Colis par pays - Side by Side Layout */}
        <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Colis par pays</CardTitle>
            <CardDescription>
              Distribution des colis reçus par pays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Liste des pays */}
              <div className="lg:w-1/3">
                <ScrollArea className="h-80">
                  <ul className="space-y-4">
                    {mergedColisByPays.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <CountryFlag country={item.pays} />
                          <span className="font-medium text-[#333]">
                            {item.pays.charAt(0).toUpperCase() +
                              item.pays.slice(1)}
                          </span>
                        </div>
                        <span className="text-[#cf6e4c] font-bold">
                          {item.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>

              {/* Graphique */}
              <div className="lg:w-2/3">
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={mergedColisByPays.map((c) => ({
                        name: c.pays,
                        count: c.count,
                      }))}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tickFormatter={(name) =>
                          countryFlags[normalizeCountryName(name)] || "🏳️"
                        }
                        width={60}
                      />
                      <Tooltip
                        formatter={(value, name, props) => [
                          value,
                          props.payload.name.charAt(0).toUpperCase() +
                            props.payload.name.slice(1),
                        ]}
                      />
                      <Bar dataKey="count" fill="#cf6e4c" radius={[4, 4, 4, 4]}>
                        {mergedColisByPays.map((entry, index) => (
                          <Cell key={index} fill="#cf6e4c" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ProtectedRoute>
    </div>
  );
}
