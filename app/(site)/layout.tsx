import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      {children}
      <div className="grain" aria-hidden />
    </>
  );
}
