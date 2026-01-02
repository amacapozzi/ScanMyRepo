import { type Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "ScanMyRepo",
    template: "%s · ScanMyRepo",
  },
  description:
    "ScanMyRepo is an AI-powered platform that analyzes GitHub repositories to detect bugs, code smells, security issues, and improvement opportunities. Get clear, actionable insights in seconds.",
  applicationName: "ScanMyRepo",
  keywords: [
    "AI code review",
    "GitHub repository analysis",
    "static code analysis",
    "AI bug detection",
    "code quality",
    "developer tools",
    "software security",
    "code insights",
  ],
  authors: [{ name: "Amadeo Capozzi" }],
  creator: "Amadeo Capozzi",
  publisher: "ScanMyRepo",
  metadataBase: new URL("https://scanmyrepo.dev"),
  openGraph: {
    title: "ScanMyRepo · AI-Powered Repository Analysis",
    description:
      "Analyze your GitHub repositories with AI. Detect bugs, security risks, and code improvements automatically.",
    url: "https://scanmyrepo.dev",
    siteName: "ScanMyRepo",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ScanMyRepo – AI Repository Scanner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScanMyRepo · AI Code Analysis",
    description:
      "AI-powered GitHub repository analysis. Find bugs, security issues, and improve your code quality.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};
