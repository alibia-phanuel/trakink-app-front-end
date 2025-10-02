"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StatsModalProps {
  stats: any; // tu peux typer plus précisément si nécessaire
  onClose: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Statistiques des pays</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          <p>
            <strong>Total de pays :</strong> {stats.totalPays}
          </p>
          <p>
            <strong>Pays actifs :</strong> {stats.paysActifs}
          </p>
          <p>
            <strong>Pays inactifs :</strong> {stats.paysInactifs}
          </p>
          <p>
            <strong>Taux d&apos;activation :</strong> {stats.tauxActivation}%
          </p>

          <div className="mt-2">
            <h4 className="font-semibold">Pays avec colis :</h4>
            <ul className="list-disc list-inside">
              {stats.paysAvecColis.map((p: any) => (
                <li key={p.nom}>
                  {p.nom} ({p.code}) - Colis : {p.colisCount}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-2">
            <h4 className="font-semibold">Pays avec utilisateurs :</h4>
            <ul className="list-disc list-inside">
              {stats.paysAvecUtilisateurs.map((p: any) => (
                <li key={p.nom}>
                  {p.nom} ({p.code}) - Utilisateurs : {p.usersCount}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatsModal;
