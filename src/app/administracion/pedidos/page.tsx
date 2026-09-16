import { OrdersPanel } from "@/components/orders-panel";
export const metadata={title:"Administración de pedidos",robots:{index:false,follow:false}};
export default function Page(){return <main id="contenido" className="container section"><OrdersPanel/></main>;}
