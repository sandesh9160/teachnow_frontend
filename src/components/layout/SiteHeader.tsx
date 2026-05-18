import Header from "@/shared/layout/Header/Header";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";
import { getSessionProfile, sessionUserForHeader } from "@/lib/serverAuth";

export default async function SiteHeader() {
  const [{ navigation, footer }, session] = await Promise.all([
    getGlobalLayoutData(),
    getSessionProfile(),
  ]);

  const authUser = sessionUserForHeader(session);

  return (
    <Header
      navigationData={navigation}
      footerData={footer}
      authUser={authUser}
    />
  );
}
