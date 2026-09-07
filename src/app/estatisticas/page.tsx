import type { Metadata } from "next";
import EstatisticasClient from "./EstatisticasClient";

export const metadata: Metadata = {
  title: "Guilda - TP&IRMANDADE",
  description: "Conheça a TP&IRMANDADE - Dono, administradores, membros e informações da guilda.",
};

export default function EstatisticasPage() {
  return <EstatisticasClient />;
}
