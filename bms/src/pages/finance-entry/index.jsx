import useFinanceEntryView from "./useFinanceEntry";
import FinanceEntryView from "./FinanceEntryView";

export default function RecordManagementPage() {
  const financeEntryManagement = useFinanceEntryView();

  return <FinanceEntryView {...financeEntryManagement} />;
}
