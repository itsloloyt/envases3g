import type { Metadata } from "next";
import { OrderView } from "@/components/OrderView";

export const metadata: Metadata = { title: "Tu pedido", robots: { index: false, follow: false } };

export default async function PedidoPage({ params }: PageProps<"/pedido/[numero]">) {
  const { numero } = await params;
  return <OrderView number={decodeURIComponent(numero)} />;
}
