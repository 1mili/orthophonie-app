import { requireParent } from "@/lib/require-parent";

export default async function EspaceParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireParent();
  return <>{children}</>;
}
