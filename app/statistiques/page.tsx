/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Assuming Tabs component
import { Loader2, Globe, Package, Truck, Calendar, Filter } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  getDashboard,
  getPaysStats,
  getColisStats,
  getStatTransport,
} from "@/lib/Analytics";
import Flag from "react-flagkit";
import type {
  GetDashboardResponse,
  DashboardStats,
  GetPaysStatsResponse,
  PaysStats,
  ColisStatsFilters,
  TransportDetail,
  StatsTransportResponse,
  ColisAnalyticsItem,
} from "@/type/stats";

const periods = ["30d", "90d", "1y"] as const;

const Page = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [paysStats, setPaysStats] = useState<PaysStats | null>(null);
  const [colisAnalytics, setColisAnalytics] = useState<ColisAnalyticsItem[]>(
    []
  );
  const [transportStats, setTransportStats] =
    useState<StatsTransportResponse | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [paysLoading, setPaysLoading] = useState(true);
  const [colisLoading, setColisLoading] = useState(true);
  const [transportLoading, setTransportLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<(typeof periods)[number]>("30d");
  const [groupBy, setGroupBy] = useState<ColisStatsFilters["groupBy"]>("month");
  const [paysFilter, setPaysFilter] = useState<string>("");
  const [modeEnvoiFilter, setModeEnvoiFilter] = useState<
    ColisStatsFilters["modeEnvoi"] | "all"
  >("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Debounce filter inputs
  const [debouncedPaysFilter] = useDebounce(paysFilter, 500);
  const [debouncedModeEnvoiFilter] = useDebounce(modeEnvoiFilter, 500);
  const [debouncedStartDate] = useDebounce(startDate, 500);
  const [debouncedEndDate] = useDebounce(endDate, 500);
  const [debouncedGroupBy] = useDebounce(groupBy, 500);

  // Fetch functions
  const fetchDashboard = async (selectedPeriod: (typeof periods)[number]) => {
    setDashboardLoading(true);
    try {
      const res: GetDashboardResponse = await getDashboard(selectedPeriod);
      if (res.status === 200) setStats(res.stats);
      else throw new Error(`Dashboard API: ${res.message}`);
    } catch (err: any) {
      setError(
        err.message || "Erreur lors du chargement des statistiques du dashboard"
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchPaysStats = async () => {
    setPaysLoading(true);
    try {
      const res: GetPaysStatsResponse = await getPaysStats();
      if (res.status === 200) setPaysStats(res.stats);
      else throw new Error(`Pays Stats API: ${res.message}`);
    } catch (err: any) {
      setError(
        err.message || "Erreur lors du chargement des statistiques des pays"
      );
    } finally {
      setPaysLoading(false);
    }
  };

  const fetchColisStats = async () => {
    setColisLoading(true);
    try {
      const filters: ColisStatsFilters = {
        groupBy: debouncedGroupBy,
        pays: debouncedPaysFilter || undefined,
        modeEnvoi:
          debouncedModeEnvoiFilter === "all"
            ? undefined
            : debouncedModeEnvoiFilter,
        startDate: debouncedStartDate || undefined,
        endDate: debouncedEndDate || undefined,
      };
      if (
        debouncedStartDate &&
        debouncedEndDate &&
        new Date(debouncedEndDate) < new Date(debouncedStartDate)
      ) {
        throw new Error(
          "La date de fin doit être postérieure à la date de début"
        );
      }
      const res = await getColisStats(filters);
      if (res.status === 200) setColisAnalytics(res.analytics);
      else throw new Error(`Colis Stats API: ${res.message}`);
    } catch (err: any) {
      setError(
        err.message || "Erreur lors du chargement des statistiques des colis"
      );
    } finally {
      setColisLoading(false);
    }
  };

  const fetchTransportStats = async (
    selectedPeriod: (typeof periods)[number]
  ) => {
    setTransportLoading(true);
    try {
      const res = await getStatTransport(selectedPeriod);
      setTransportStats(res);
    } catch (err: any) {
      setError(
        err.message || "Erreur lors du chargement des statistiques de transport"
      );
    } finally {
      setTransportLoading(false);
    }
  };

  // Effects for fetching data
  useEffect(() => {
    fetchDashboard(period);
    fetchTransportStats(period);
  }, [period]);

  useEffect(() => {
    fetchPaysStats();
  }, []);

  useEffect(() => {
    fetchColisStats();
  }, [
    debouncedGroupBy,
    debouncedPaysFilter,
    debouncedModeEnvoiFilter,
    debouncedStartDate,
    debouncedEndDate,
  ]);

  const resetFilters = () => {
    setPaysFilter("");
    setModeEnvoiFilter("all");
    setStartDate("");
    setEndDate("");
    setGroupBy("month");
  };

  if (error)
    return (
      <p className="text-red-500 flex items-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {error}
      </p>
    );

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold flex items-center mb-4">
        <Globe className="mr-2 h-6 w-6 text-blue-600" />
        Statistiques
      </h1>

      {/* Filters Section */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              Période:
            </span>
            {periods.map((p) => (
              <Button
                key={p}
                onClick={() => setPeriod(p)}
                variant={p === period ? "default" : "outline"}
                className="flex items-center"
                aria-label={`Select period ${p}`}
                aria-pressed={p === period}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="destructive"
            onClick={resetFilters}
            className="flex items-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            Réinitialiser Filtres
          </Button>
        </div>
        <Card>
          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1 flex items-center"
                htmlFor="paysFilter"
              >
                <Globe className="mr-1 h-4 w-4" />
                Pays (code):
              </label>
              <Input
                id="paysFilter"
                type="text"
                value={paysFilter}
                onChange={(e) => setPaysFilter(e.target.value.toUpperCase())}
                placeholder="Ex: CI, CM"
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1 flex items-center"
                htmlFor="modeEnvoi"
              >
                <Truck className="mr-1 h-4 w-4" />
                Mode d&apos;envoi:
              </label>
              <Select
                value={modeEnvoiFilter}
                onValueChange={(value) =>
                  setModeEnvoiFilter(
                    value === "all"
                      ? "all"
                      : (value as ColisStatsFilters["modeEnvoi"])
                  )
                }
              >
                <SelectTrigger
                  id="modeEnvoi"
                  className="border rounded px-2 py-1"
                >
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="Aérien">Aérien</SelectItem>
                  <SelectItem value="Maritime">Maritime</SelectItem>
                  <SelectItem value="Terrestre">Terrestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1 flex items-center"
                htmlFor="startDate"
              >
                <Calendar className="mr-1 h-4 w-4" />
                Début:
              </label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1 flex items-center"
                htmlFor="endDate"
              >
                <Calendar className="mr-1 h-4 w-4" />
                Fin:
              </label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1 flex items-center"
                htmlFor="groupBy"
              >
                <Filter className="mr-1 h-4 w-4" />
                Group By:
              </label>
              <Select
                value={groupBy}
                onValueChange={(value) =>
                  setGroupBy(value as ColisStatsFilters["groupBy"])
                }
              >
                <SelectTrigger
                  id="groupBy"
                  className="border rounded px-2 py-1"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Jour</SelectItem>
                  <SelectItem value="week">Semaine</SelectItem>
                  <SelectItem value="month">Mois</SelectItem>
                  <SelectItem value="year">Année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dashboard and Pays Stats */}
        <div className="space-y-6 lg:col-span-1">
          {/* Dashboard Stats */}
          {dashboardLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              </CardContent>
            </Card>
          ) : (
            stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-blue-600" />
                    Dashboard Général
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Statistiques générales (à implémenter selon la structure de
                    DashboardStats)
                  </p>
                  {/* Example KPI layout - replace with actual DashboardStats fields */}
                  {/* <div className="grid grid-cols-2 gap-4">
                  <Card className="p-2 text-center">
                    <p className="font-semibold">Total Envois</p>
                    <p className="text-2xl">{stats.totalShipments}</p>
                  </Card>
                  <Card className="p-2 text-center">
                    <p className="font-semibold">Revenus</p>
                    <p className="text-2xl">{stats.revenue}</p>
                  </Card>
                </div> */}
                </CardContent>
              </Card>
            )
          )}

          {/* Pays Stats */}
          {paysLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-48 w-full" />
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            paysStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-purple-600" />
                    Statistiques par pays
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Card className="p-2 text-center">
                      <p className="font-semibold">Total pays</p>
                      <p className="text-2xl">{paysStats.totalPays}</p>
                    </Card>
                    <Card className="p-2 text-center">
                      <p className="font-semibold">Pays actifs</p>
                      <p className="text-2xl">{paysStats.paysActifs}</p>
                    </Card>
                    <Card className="p-2 text-center">
                      <p className="font-semibold">Pays inactifs</p>
                      <p className="text-2xl">{paysStats.paysInactifs}</p>
                    </Card>
                    <Card className="p-2 text-center">
                      <p className="font-semibold">Taux d&apos;activation</p>
                      <p className="text-2xl">{paysStats.tauxActivation}%</p>
                    </Card>
                  </div>
                  <Tabs defaultValue="chart">
                    <TabsList className="mb-4">
                      <TabsTrigger value="chart">Graphique</TabsTrigger>
                      <TabsTrigger value="list">Liste</TabsTrigger>
                    </TabsList>
                    <TabsContent value="chart">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={paysStats.paysAvecColis}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nom" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="colisCount"
                            fill="#8884d8"
                            name="Nombre de Colis"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="list">
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {paysStats.paysAvecColis.map((p) => (
                            <Card
                              key={p.id}
                              className="p-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Flag country={p.code} />
                                <span>{p.nom}</span>
                              </div>
                              <span className="flex items-center">
                                Colis: {p.colisCount}{" "}
                                <Package className="ml-2 h-4 w-4" />
                              </span>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )
          )}
        </div>

        {/* Right Column: Colis and Transport */}
        <div className="space-y-6 lg:col-span-2">
          {/* Colis filtrés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-green-600" />
                Colis filtrés
              </CardTitle>
            </CardHeader>
            <CardContent>
              {colisLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="chart">
                  <TabsList className="mb-4">
                    <TabsTrigger value="chart">Graphique</TabsTrigger>
                    <TabsTrigger value="list">Liste</TabsTrigger>
                  </TabsList>
                  <TabsContent value="chart">
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={colisAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#8884d8"
                          name="Total Colis"
                        />
                        <Line
                          type="monotone"
                          dataKey="taille_moyenne"
                          stroke="#82ca9d"
                          name="Taille Moyenne"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>
                  <TabsContent value="list">
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {colisAnalytics.map((colis, idx) => (
                          <Card
                            key={`${colis.period}-${colis.pays_destination}-${colis.statut}-${idx}`}
                            className="p-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
                          >
                            <div>
                              <p className="font-semibold flex items-center">
                                <Flag
                                  country={colis.pays_destination}
                                  className="mr-2"
                                />
                                <strong>{colis.pays_destination}</strong> -{" "}
                                {colis.statut} ({colis.total})
                              </p>
                              <p>
                                Mode: {colis.mode_envoi}, Taille totale:{" "}
                                {colis.taille_totale}
                              </p>
                              <p>
                                Taille moyenne: {colis.taille_moyenne}, min:{" "}
                                {colis.taille_min}, max: {colis.taille_max}
                              </p>
                            </div>
                            <Package className="h-5 w-5 text-green-600" />
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Transport Stats */}
          {transportLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              </CardContent>
            </Card>
          ) : (
            transportStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="mr-2 h-5 w-5 text-orange-600" />
                    Transport
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Période: {transportStats.period}
                  </p>
                  <p>
                    Du{" "}
                    {new Date(
                      transportStats.dateRange.start
                    ).toLocaleDateString()}{" "}
                    au{" "}
                    {new Date(
                      transportStats.dateRange.end
                    ).toLocaleDateString()}
                  </p>
                  <Tabs defaultValue="chart">
                    <TabsList className="mb-4">
                      <TabsTrigger value="chart">Graphique</TabsTrigger>
                      <TabsTrigger value="list">Liste</TabsTrigger>
                    </TabsList>
                    <TabsContent value="chart">
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={transportStats.transportDetails}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="pays_destination" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="total_taille"
                            fill="#8884d8"
                            name="Total Taille"
                          />
                          <Bar
                            dataKey="moyenne_taille"
                            fill="#82ca9d"
                            name="Moyenne Taille"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="list">
                      <ScrollArea className="h-48">
                        <div className="space-y-2">
                          {transportStats.transportDetails.map(
                            (t: TransportDetail, idx) => (
                              <Card
                                key={idx}
                                className="p-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
                              >
                                <div>
                                  <p className="font-semibold flex items-center">
                                    <Truck className="mr-2 h-4 w-4" />
                                    <strong>{t.mode_envoi}</strong> vers{" "}
                                    {t.pays_destination} - {t.statut}
                                  </p>
                                  <p>
                                    Total: {t.total_taille} {t.unite_mesure} |
                                    Moyenne: {t.moyenne_taille} | Min:{" "}
                                    {t.min_taille} | Max: {t.max_taille} |
                                    Écart-type: {t.ecart_type_taille.toFixed(2)}
                                  </p>
                                </div>
                                <Flag country={t.pays_destination} />
                              </Card>
                            )
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
