export interface ShippingCardConfig {
    title: string;
    description: string;
    icon: "truck" | "shield" | "box";
}

export const storeInfo = {
    shippingCards: <ShippingCardConfig[]>[
        {
            title: "Llega rápido",
            description: "Envío a todo el país en 48/72 hs. Despacho en 24 hs hábiles.",
            icon: "truck",
        },
        {
            title: "Garantía oficial",
            description: "12 meses con el fabricante. Cambios simples dentro de los 30 días.",
            icon: "shield",
        },
    ],
    shippingDetails: [
        "Despachamos en 24 hs hábiles. Plazos estimados 48/72 hs según localidad.",
        "Retiro en sucursal sin costo en CABA y GBA.",
        "Seguimiento online y seguro incluido en el envío.",
    ],
};
