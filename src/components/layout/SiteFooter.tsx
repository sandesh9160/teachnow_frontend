import Footer from "@/shared/layout/Footer/Footer";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";

export default async function SiteFooter() {
  const { navigation, footer, heroCTA } = await getGlobalLayoutData();

  return (
    <Footer
      footerData={footer}
      heroCTA={heroCTA}
      navigationData={navigation}
    />
  );
}
