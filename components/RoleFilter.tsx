"use client";

import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Users2, ShieldCheck, UserCheck, Briefcase } from "lucide-react";

const roles = [
  {
    label: "Tous",
    value: "TOUS", // Match logique
    icon: Users2,
  },
  {
    label: "Administrateur",
    value: "ADMIN",
    icon: ShieldCheck,
  },
  {
    label: "Employé",
    value: "EMPLOYE",
    icon: UserCheck,
  },
  {
    label: "Directeur",
    value: "DIRECTEUR",
    icon: Briefcase,
  },
];
export default function RoleFilter({
  onChange,
  defaultValue = "Tous",
}: {
  onChange?: (value: string) => void;
  defaultValue?: string;
}) {
  const [selected, setSelected] = useState(defaultValue);

  return (
    <Select
      value={selected}
      onValueChange={(value) => {
        setSelected(value);
        onChange?.(value);
      }}
    >
      <SelectTrigger className="w-[200px] cursor-pointer">
        <SelectValue placeholder="Filtrer par rôle" />
      </SelectTrigger>

      <SelectContent>
        {roles.map((role) => (
          <SelectItem
            key={role.value}
            value={role.value}
            className="flex items-center gap-2"
          >
            <role.icon className="w-4 h-4 mr-2 text-[#cd7455]" />
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
