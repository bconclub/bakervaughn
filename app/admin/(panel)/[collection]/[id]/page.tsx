import { notFound } from "next/navigation";
import ItemForm from "@/components/admin/ItemForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { Crumbs, PageTitle, formatWhen } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/cms/admin";
import { getCollection, type Row } from "@/lib/collections/config";
import { deleteItem } from "../../../actions";

export default async function EditItemPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = await params;
  const def = getCollection(collection);
  if (!def) notFound();

  const { supabase } = await requireAdmin();
  const { data } = await supabase.from(def.table).select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const row = data as Row;
  const title = String(row[def.titleField] ?? "Untitled");

  return (
    <>
      <Crumbs items={[{ label: "Dashboard", href: "/admin" }, { label: def.label, href: `/admin/${collection}` }, { label: title }]} />
      <PageTitle title={title} intro={`Last updated ${formatWhen(row.updated_at)}`} />
      <ItemForm collection={collection} id={id} fields={def.fields} values={row} />
      <form action={deleteItem.bind(null, collection, id)} className="mt-12 border-t border-line-soft pt-6">
        <ConfirmButton
          message={`Delete "${title}"? This can't be undone.`}
          className="text-sm text-[oklch(72%_0.15_29)] underline-offset-4 hover:underline"
        >
          Delete this {def.singular}
        </ConfirmButton>
        <span className="ml-3 text-xs text-text-3">Permanent. To hide it instead, set the status to Archived.</span>
      </form>
    </>
  );
}
