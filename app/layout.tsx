import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-family",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Creciendo — Todo el crecimiento y salud de tus hijos en un solo lugar",
  description:
    "Organiza vacunas, peso, talla, documentos, controles médicos y recordatorios de tus hijos. Diseñado para padres y cuidadores con total privacidad y apoyo de IA educativa.",
};

import { ScrollRevealProvider } from "./components/ScrollRevealProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable}`}>
      <body>
        <ScrollRevealProvider>{children}</ScrollRevealProvider>
      </body>
    </html>
  );
}
