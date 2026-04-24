"use client";

import React, {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useCallback,
} from "react";
import type { CartItem, SelectedOption, ProductReadOnly } from "@/types";

// ─── State & Actions ──────────────────────────────────────────────────────

interface CartState {
    items: CartItem[];
}

type CartAction =
    | { type: "ADD_ITEM"; payload: CartItem }
    | { type: "REMOVE_ITEM"; payload: { cartItemId: string } }
    | {
        type: "UPDATE_QUANTITY";
        payload: { cartItemId: string; quantity: number };
    }
    | {
        type: "UPDATE_OPTIONS";
        payload: {
            cartItemId: string;
            selectedOptions: SelectedOption[];
            newCartItemId: string;
            newUnitPrice: number;
        };
    }
    | { type: "CLEAR_CART" }
    | { type: "LOAD"; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case "LOAD":
            return { items: action.payload };
        case "ADD_ITEM": {
            const existing = state.items.find(
                (i) => i.cartItemId === action.payload.cartItemId
            );
            if (existing) {
                return {
                    items: state.items.map((i) =>
                        i.cartItemId === action.payload.cartItemId
                            ? { ...i, quantity: i.quantity + action.payload.quantity }
                            : i
                    ),
                };
            }
            return { items: [...state.items, action.payload] };
        }
        case "REMOVE_ITEM":
            return {
                items: state.items.filter(
                    (i) => i.cartItemId !== action.payload.cartItemId
                ),
            };
        case "UPDATE_QUANTITY":
            if (action.payload.quantity <= 0) {
                return {
                    items: state.items.filter(
                        (i) => i.cartItemId !== action.payload.cartItemId
                    ),
                };
            }
            return {
                items: state.items.map((i) =>
                    i.cartItemId === action.payload.cartItemId
                        ? { ...i, quantity: action.payload.quantity }
                        : i
                ),
            };
        case "UPDATE_OPTIONS":
            return {
                items: state.items.map((i) =>
                    i.cartItemId === action.payload.cartItemId
                        ? {
                            ...i,
                            cartItemId: action.payload.newCartItemId,
                            selectedOptions: action.payload.selectedOptions,
                            unitPrice: action.payload.newUnitPrice,
                        }
                        : i
                ),
            };
        case "CLEAR_CART":
            return { items: [] };
        default:
            return state;
    }
}

// ─── Context ──────────────────────────────────────────────────────────────

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    total: number;
    addItem: (product: ProductReadOnly, selectedOptions: SelectedOption[], quantity?: number) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    updateOptions: (cartItemId: string, selectedOptions: SelectedOption[]) => void;
    clearCart: () => void;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

// ─── Helpers ──────────────────────────────────────────────────────────────

function buildCartItemId(productId: string, selectedOptions: SelectedOption[]) {
    const opts = selectedOptions
        .map((s) => `${s.groupId}:${s.option.id}`)
        .sort()
        .join("|");
    return `${productId}-${opts}`;
}

function computeUnitPrice(product: ProductReadOnly, selectedOptions: SelectedOption[]) {
    const base = parseFloat(product.price);
    const extras = selectedOptions.reduce(
        (acc, s) => acc + parseFloat(s.option.price),
        0
    );
    return base + extras;
}

// ─── Provider ─────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });
    const [isOpen, setIsOpen] = React.useState(false);

    // Persist cart to localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("cart");
            if (stored) dispatch({ type: "LOAD", payload: JSON.parse(stored) });
        } catch { }
    }, []);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(state.items));
    }, [state.items]);

    const itemCount = state.items.reduce((acc, i) => acc + i.quantity, 0);
    const total = state.items.reduce(
        (acc, i) => acc + i.unitPrice * i.quantity,
        0
    );

    const addItem = useCallback(
        (product: ProductReadOnly, selectedOptions: SelectedOption[], quantity = 1) => {
            const cartItemId = buildCartItemId(product.id, selectedOptions);
            const unitPrice = computeUnitPrice(product, selectedOptions);
            dispatch({
                type: "ADD_ITEM",
                payload: { cartItemId, product, quantity, selectedOptions, unitPrice },
            });
        },
        []
    );

    const removeItem = useCallback((cartItemId: string) => {
        dispatch({ type: "REMOVE_ITEM", payload: { cartItemId } });
    }, []);

    const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
        dispatch({ type: "UPDATE_QUANTITY", payload: { cartItemId, quantity } });
    }, []);

    const updateOptions = useCallback(
        (cartItemId: string, selectedOptions: SelectedOption[]) => {
            const item = state.items.find((i) => i.cartItemId === cartItemId);
            if (!item) return;
            const newCartItemId = buildCartItemId(item.product.id, selectedOptions);
            const newUnitPrice = computeUnitPrice(item.product, selectedOptions);
            dispatch({
                type: "UPDATE_OPTIONS",
                payload: { cartItemId, selectedOptions, newCartItemId, newUnitPrice },
            });
        },
        [state.items]
    );

    const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
    const openCart = useCallback(() => setIsOpen(true), []);
    const closeCart = useCallback(() => setIsOpen(false), []);

    return (
        <CartContext.Provider
            value={{
                items: state.items,
                itemCount,
                total,
                addItem,
                removeItem,
                updateQuantity,
                updateOptions,
                clearCart,
                isOpen,
                openCart,
                closeCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
