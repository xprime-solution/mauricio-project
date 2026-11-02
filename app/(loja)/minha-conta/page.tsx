import type { Metadata } from "next";
import { AccountView } from "@/components/account-view";

export const metadata: Metadata = { title: "Minha conta" };

export default function AccountPage() {
  return <AccountView />;
}
