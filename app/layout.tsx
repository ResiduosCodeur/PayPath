import "./globals.css";
import { Space_Grotesk, Inter } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Requirements & SDLC Agent",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="min-h-screen font-sans">
        <div className="max-w-4xl mx-auto px-5 py-10">
          <header className="mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-accent flex items-center justify-center shrink-0">
              <span className="block w-3 h-3 bg-bg rounded-[2px]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-none">
                Requirements &amp; SDLC Agent
              </h1>
              <p className="text-muted text-sm mt-1">
                Fine-tuned agents: extraction &rarr; SDLC recommendation
              </p>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
