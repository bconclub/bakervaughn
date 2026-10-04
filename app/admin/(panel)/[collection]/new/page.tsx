import { notFound } from "next/navigation";
import ItemForm from "@/components/admin/ItemForm";
import { Crumbs, PageTitle } from "@/components/admin/ui";
import { getCollection } from "@/lib/collections/config";

export default async function NewItemPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const def = getCollection(collection);
  if (!def) notFound();
  return (
    <>
      <Crumbs items={[{ label: "Dashboard", href: "/admin" }, { label: def.label, href: `/admin/${collection}` }, { label: "New" }]} />
      <PageTitle title={`Add ${def.singular}`} />
      <ItemForm collection={collection} id={null} fields={def.fields} values={{ status: "published" }} />
    </>
  );
}
