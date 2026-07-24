import { DashboardShell } from "@/components/dashboard-shell";

const links = [
  { title: "Build Your Application", link: "https://sahilcodex.vercel.app/" },
  { title: "tcxcommit", link: "https://tcxcommit.vercel.app/" },
  { title: "keyui", link: "https://keyui.vercel.app/" },
];

export default function Page() {
  return (
    <DashboardShell>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {links.map((link, idx) => (
          <div key={idx}>{link.title}</div>
        ))}
      </div>
    </DashboardShell>
  );
}
