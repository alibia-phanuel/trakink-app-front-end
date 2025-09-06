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
import { BarChart2, CheckCircle, Package, Loader } from "lucide-react";
import Image from "next/image";
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

// Mapping des pays vers images de drapeau
const countryFlags: Record<string, string> = {
  cameroun: "/flag/Cameroonian.png",
  "côte d'ivoire": "/flag/cote-divoire.png",
  mali: "/flag/mali.png",
  ghana: "/flag/ghana.png",
  guinée: "/flag/guinea.png",
  sénégal: "/flag/senegal.png",
};

// Normalize country name for consistent lookup
const normalizeCountryName = (country: unknown): string => {
  if (typeof country !== "string") return "unknown";
  return country.trim().toLowerCase();
};

// Component to display flag in the list
const CountryFlag = ({ country }: { country: unknown }) => {
  const normalizedKey = normalizeCountryName(country);
  const flag = countryFlags[normalizedKey];
  return flag ? (
    <img
      src={flag}
      alt={country as string}
      className="w-6 h-6 mr-3 rounded-sm object-cover"
    />
  ) : (
    <span className="mr-3">🏳️</span>
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
const SkeletonLoader = () => (
  <div className="p-6 space-y-6 bg-[#f8f8f8] min-h-screen">
    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, idx) => (
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
          <div className="lg:w-2/3">
            <div className="h-80 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function Page() {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    })();
  }, []);

  if (!stats) return <SkeletonLoader />;

  const { colisByPays } = stats.stats;
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border border-gray-100 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Image
                  src="/flag/china.png"
                  alt="Drapeau Chine"
                  width={28}
                  height={20}
                  className="rounded-sm"
                />
                <span>État</span>
              </CardTitle>

              {/* Loader pour montrer que ça charge / dynamique */}
              <Loader className="animate-spin text-yellow-500 w-5 h-5" />
            </CardHeader>

            <CardDescription className="px-4 text-sm text-gray-500">
              Suivi de la logistique vers l'afrique / depuis la Chine
            </CardDescription>

            <CardContent className="px-4 py-3 text-[#333] text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Colis reçus</span>
                <span className="font-semibold">{stats.stats.colisRecus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Colis quittés Chine</span>
                <span className="font-semibold">
                  {stats.stats.colisQuittesChine}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Taux de réception</span>
                <span className="font-semibold">
                  {stats.stats.tauxReception}%
                </span>
              </div>
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

          {/* Nouvelle carte “Utilisé” */}
          <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Total Colis</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Package className="text-[#cf6e4c]" /> {stats.stats.totalColis}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-none shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Colis par pays</CardTitle>
            <CardDescription>
              Distribution des colis reçus par pays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
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
                        width={80}
                        tick={({ x, y, payload }) => {
                          const key = normalizeCountryName(
                            String(payload.value)
                          ); // <-- convertir en string
                          const flag = countryFlags[key];
                          return (
                            <g transform={`translate(${x - 50},${y - 12})`}>
                              {flag && (
                                <image
                                  href={flag}
                                  width={24}
                                  height={24}
                                  style={{ borderRadius: "4px" }}
                                />
                              )}
                              <text x={30} y={16} fill="#333" fontSize={12}>
                                {String(payload.value).charAt(0).toUpperCase() +
                                  String(payload.value).slice(1)}
                              </text>
                            </g>
                          );
                        }}
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
