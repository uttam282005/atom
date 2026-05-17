import { getServerSession } from "next-auth";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect('/api/auth/signin');
  } else {
    return redirect('/dashboard');
  }
}
