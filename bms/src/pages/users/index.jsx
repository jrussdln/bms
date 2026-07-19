import useUserManagement from "./useUserManagement";
import UserManagementView from "./UserManagementView";

export default function Users() {
  const props = useUserManagement();
  return <UserManagementView {...props} />;
}