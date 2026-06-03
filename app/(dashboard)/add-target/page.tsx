import { redirect } from "next/navigation";

export default function AddTargetRedirectPage() {
  redirect("/targets/new");
}
