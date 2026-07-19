import EditIcon from "@mui/icons-material/Edit";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import DescriptionIcon from "@mui/icons-material/Description";
import CircleIcon from "@mui/icons-material/FiberManualRecord";

export const ICONS = {
  pencil: EditIcon,
  dashboard: DashboardIcon,
  users: PeopleIcon,
  settings: SettingsIcon,
  records: DescriptionIcon,
};

// fallback icon used when navItems doesn't specify one, or the name doesn't match
export const DEFAULT_ICON = CircleIcon;