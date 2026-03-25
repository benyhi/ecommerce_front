"use client";

import React from "react";
import { Accordion } from "@mantine/core";
import { useBranding } from "@/contexts/BrandContext";

export default function FAQAccordion() {
    const { branding } = useBranding();
    const faqs = [
        {
            q: "¿Cuáles son los métodos de pago disponibles?",
            a: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencia bancaria, Mercado Pago (con todas sus opciones de cuotas) y efectivo en local. Para compras mayores a $100.000 podemos coordinar financiamiento personalizado.",
        },
        {
            q: "¿Tienen envío a domicilio? ¿Cuál es el costo?",
            a: "Sí, enviamos a todo el país. El costo de envío se calcula en el checkout según el destino y el peso del paquete. Enviamos gratis en compras mayores a $50.000 dentro del AMBA. Usamos correo privado con seguimiento.",
        },
        {
            q: "¿Cuánto tarda en llegar mi pedido?",
            a: "AMBA: 24–48hs hábiles. Interior: 3–7 días hábiles. Las entregas se realizan en días hábiles. Recibirás un email con el número de seguimiento cuando el paquete sea despachado.",
        },
        {
            q: "¿Los productos tienen garantía oficial?",
            a: "Todos nuestros productos cuentan con garantía oficial del fabricante. Los equipos electrónicos tienen 1 año de garantía en fábrica. Además ofrecemos soporte post-venta: podés traer el equipo al local o enviarlo por correo.",
        },
        {
            q: "¿Puedo cambiar o devolver un producto?",
            a: "Sí. Tenés hasta 30 días corridos para cambios o devoluciones sin necesidad de justificación, siempre que el producto esté en su estado original con todos los accesorios y empaque. El costo del envío de vuelta corre por cuenta del comprador, salvo que el producto tenga un defecto de fábrica.",
        },
        {
            q: "¿Trabajan con empresas? ¿Emiten factura A?",
            a: `Sí, trabajamos con empresas y emitimos factura A. Para presupuestos corporativos, licitaciones o compras por volumen, contactanos al email ${branding.contact.email} o llamá directamente al local para hablar con nuestro equipo B2B.`,
        },
        {
            q: "¿Cómo puedo hacer el seguimiento de mi compra?",
            a: "Una vez que tu pedido es despachado, te enviamos un email con el número de seguimiento del correo. También podés ingresar a tu cuenta en nuestra web y ver el estado de todos tus pedidos en la sección 'Mis compras'.",
        },
        {
            q: "¿Tienen servicio técnico?",
            a: "Sí, contamos con servicio técnico propio. Atendemos laptops, smartphones, tablets y accesorios. Podés traer tu equipo al local de lunes a viernes en horario de atención. Presupuesto sin cargo.",
        },
    ];

    return (
        <Accordion variant="separated" radius="md">
            {faqs.map((faq, i) => (
                <Accordion.Item key={i} value={`item-${i}`}>
                    <Accordion.Control>{faq.q}</Accordion.Control>
                    <Accordion.Panel>{faq.a}</Accordion.Panel>
                </Accordion.Item>
            ))}
        </Accordion>
    );
}
