import { UserNav } from "./UserNav";

export default function TopNav() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white border-b">
      <div>
        {/* Potentially breadcrumbs or page title */}
      </div>
      <div>
        <UserNav />
      </div>
    </nav>
  );
}
