import { getHomepageData } from "@/lib/homepageData";
import HomeClientView from "@/components/HomeClientView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Aameena Furniture | Handcrafted Teak & Sheesham Furniture Manufacturer",
  description:
    "Direct manufacturer of hand-carved Sagwan Teak sofas, luxury dining sets, master bedroom suites, custom interior furniture, and factory loose cloth materials.",
};

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <HomeClientView
      sliderRow1={data.sliderRow1}
      sliderRow2={data.sliderRow2}
      categories={data.categories}
      bestsellers={data.bestsellers}
    />
  );
}
