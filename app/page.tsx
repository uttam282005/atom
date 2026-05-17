import { getServerSession } from "next-auth";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="flex h-screen">
      <SideNav />
      <div className="flex flex-col flex-1">
        <TopNav />
        <main className="flex-1 p-8">
          <h1>Welcome, {session.user?.name}</h1>
          <p>Your Role: {session.user?.role}</p>
          {/* Main dashboard content goes here */}
        </main>
      </div>
    </div>
  );
}