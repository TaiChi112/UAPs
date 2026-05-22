import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const primaryFont = Space_Grotesk({
  variable: "--font-primary",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UAPS",
  description: "Universal Academic Portfolio System",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${primaryFont.variable} ${monoFont.variable} h-full antialiased`}>
      <body className="min-h-full">
        {/* <div className="page-shell"> */}
          {/* <header className="topbar"> */}
            {/* <div> */}
              {/* <p className="eyebrow">UAPS</p> */}
              {/* <h1 className="brand">Universal Academic Portfolio System</h1> */}
            {/* </div> */}
            {/* <RoleSwitchNav /> */}
          {/* </header> */}
          <main className="content-shell">{children}</main>
        {/* </div> */}
      </body>
    </html>
  );
}
