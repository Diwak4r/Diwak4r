import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.os.diwakaryadav.com.np"),
  title: "DiwakarOS | Diwakar Ray Yadav's Interactive Portfolio",
  description:
    "An interactive, macOS-style desktop experience showcasing Diwakar Ray Yadav's work. For the full written portfolio, visit diwakaryadav.com.np.",
  alternates: {
    canonical: "https://www.diwakaryadav.com.np/",
  },
  openGraph: {
    type: "website",
    siteName: "Diwakar Ray Yadav",
    title: "DiwakarOS | Diwakar Ray Yadav's Interactive Portfolio",
    description: "Exploring Gen-AI and LLMs. Integrating AI into everyday workflows.",
    images: ["/images/hero-800.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#08090c",
  width: "device-width",
  initialScale: 1,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Diwakar Ray Yadav",
  url: "https://www.diwakaryadav.com.np/",
  sameAs: [
    "https://github.com/Diwak4r",
    "https://www.linkedin.com/in/diwak4r/",
    "https://x.com/Norwakar",
    "https://www.instagram.com/diwak4r/",
  ],
  jobTitle: "AI & Workflow Intern",
  worksFor: { "@type": "Organization", name: "The Mindsnack" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
