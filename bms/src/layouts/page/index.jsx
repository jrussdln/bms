import { useAuth } from "../../hooks/useAuth";
import HCFLayout from "./structure/HCF/Layout";
import HSCFLayout from "./structure/HSCF/Layout";

export default function Layout() {
  const { user } = useAuth();
  return user?.cUserRole === "A" ? <HSCFLayout /> : <HSCFLayout />;
  // return user?.cUserRole === "A" ? <HCFLayout /> : <HCFLayout />;

}