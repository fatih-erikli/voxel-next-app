import Auth from "@/components/Auth";
import "./globals.css";

export const metadata = {
  title: "Iceland",
  description: "Iceland",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <Auth>
            {children}
          </Auth>
        </div>
      </body>
    </html>
  );
}
