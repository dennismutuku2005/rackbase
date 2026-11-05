import { RackbaseProvider } from "@/context/RackbaseContext";
import DashboardShell from "@/components/DashboardShell";

export const metadata = {
  title: "Rackbase - Network Operations",
  description: "MikroTik equipment inventory and incident response management",
};

export default function DashboardLayout({ children }) {
  return (
    <RackbaseProvider>
      <DashboardShell>{children}</DashboardShell>
    </RackbaseProvider>
  );
}

