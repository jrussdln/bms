import ContentPage from "../../layouts/page/content-page/ContentPage";
import SettingsView from "./SettingsView";
import useSettings from "./useSettings";

export default function Settings() {
  const settings = useSettings();

  return (
    <ContentPage title="Settings">
      <SettingsView {...settings} />
    </ContentPage>
  );
}