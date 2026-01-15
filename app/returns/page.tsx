import { redirect } from "next/navigation"

export default function ReturnsPage() {
  redirect("/terms")
  return null
}
