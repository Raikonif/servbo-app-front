import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  ProductDetail,
  productTitleId,
} from "@/features/marketplace/product-detail";
import { ProductModal } from "@/features/marketplace/product-modal";
import { getProduct } from "@/lib/catalog";

// Intercepts /products/<id> on client navigation from within the app and
// shows it over the current page. A hard load renders app/products/[id].
export default async function ProductModalPage({
  params,
}: PageProps<"/[locale]/products/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const product = await getProduct(id, locale);
  if (!product) notFound();

  return (
    <ProductModal
      labelledBy={productTitleId(product.id)}
      productId={product.id}
      title={product.name}
    >
      <ProductDetail product={product} />
    </ProductModal>
  );
}
