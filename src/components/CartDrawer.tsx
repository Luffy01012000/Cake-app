"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Trash2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Minus,
  Plus,
  Calendar,
  AlertCircle,
  User,
  Mail,
} from "lucide-react";
import { CartItem } from "../data/cakes";
import DatePickerModal from "./DatePickerModal";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [giftNote, setGiftNote] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [eventDate, setEventDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Disable background page scrollbar when cart drawer is open
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (acc, item) => acc + item.cake.price * item.quantity,
    0
  );
  const courierFee = subtotal >= 300 ? 0 : 45;
  const grandTotal = subtotal + courierFee;

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // Sensible defaults if left empty so checkout remains seamless
      const finalName = customerName.trim() || "Patisserie Guest";
      const finalEmail = customerEmail.trim() || "guest@aurapatisserie.com";

      const createdOrderIds: string[] = [];

      for (const item of items) {
        const notesParts: string[] = [];
        if (item.flavorChoice) notesParts.push(`Flavor: ${item.flavorChoice}`);
        if (item.customInscription) notesParts.push(`Plaque: "${item.customInscription}"`);
        if (giftNote.trim()) notesParts.push(`Gift Note: ${giftNote.trim()}`);
        const notes = notesParts.join(" | ") || undefined;

        const res = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cakeId: item.cake.id,
            cakeName: item.cake.name,
            customerName: finalName,
            customerEmail: finalEmail,
            price: item.cake.price,
            quantity: item.quantity,
            deliveryDate: item.deliveryDate || eventDate,
            notes,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Checkout failed (${res.status})`);
        }

        const data = await res.json();
        const createdId = data.order?.id || data.id;
        if (createdId) {
          createdOrderIds.push(createdId);
        }
      }

      // Success: clear cart and transition to confirmation view
      onClearCart();
      setConfirmedOrderId(
        createdOrderIds.join(", ") || `AUR-${Date.now().toString().slice(-6)}`
      );
      setOrderConfirmed(true);
    } catch (err: unknown) {
      console.error("Checkout failed:", err);
      setCheckoutError(
        (err as Error).message ||
          "An error occurred while placing your order. Please try again."
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleReset = () => {
    setOrderConfirmed(false);
    setConfirmedOrderId("");
    setCheckoutError(null);
    onClearCart();
    onClose();
  };

  const formattedDate = eventDate
    ? new Date(eventDate + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Select date";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in cursor-pointer"
    >
      <div
        className="w-full max-w-[500px] h-full bg-white flex flex-col justify-between shadow-2xl transition-all cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#f5f5f7] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1d1d1f] tracking-tight">
              Your Cart
            </h2>
            <span className="text-xs text-[#707070]">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] flex items-center justify-center text-[#1d1d1f] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {orderConfirmed ? (
          <div className="p-8 text-center flex-grow flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-[#1d1d1f]">
              Order Confirmed
            </h3>
            <p className="text-sm text-[#707070] max-w-[320px] leading-relaxed">
              Your order confirmation and pastry delivery schedule have been sent. Our master pâtissier will contact you within 4 hours.
            </p>
            <div className="p-4 bg-[#f5f5f7] rounded-2xl w-full text-xs text-[#474747] space-y-1">
              <div className="flex justify-between">
                <span>Confirmation ID:</span>
                <span className="font-semibold text-[#1d1d1f] font-mono">
                  {confirmedOrderId || "AUR-2026-9812"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Date:</span>
                <span className="font-semibold text-[#1d1d1f]">{formattedDate}</span>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="btn-electric w-full py-3 text-sm cursor-pointer mt-4"
            >
              Continue Exploring
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center flex-grow flex flex-col items-center justify-center">
            <Sparkles className="w-10 h-10 text-[#d6d6d6] mb-3" />
            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-1">
              Your cart is empty
            </h3>
            <p className="text-sm text-[#707070] mb-6">
              Explore our occasion collection or design a custom cake in the Atelier.
            </p>
            <button
              onClick={onClose}
              className="btn-wash text-sm py-2 px-6 cursor-pointer"
            >
              Discover Occasions
            </button>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto p-6 space-y-6 slim-blur-scrollbar">
            {/* Items List */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#f5f5f7] flex gap-4 items-start"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0">
                    <Image
                      src={item.cake.image}
                      alt={item.cake.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="text-sm font-semibold text-[#1d1d1f] truncate">
                        {item.cake.name}
                      </h4>
                      <span className="text-[20px] font-bold text-[#1d1d1f] numr shrink-0">
                        ${item.cake.price * item.quantity}
                      </span>
                    </div>

                    <div className="text-xs text-[#707070] mb-1">
                      {item.cake.occasion} • {item.cake.servings}
                    </div>

                    {item.customInscription && (
                      <div className="text-xs bg-white/80 px-2 py-0.5 rounded text-[#1d1d1f] truncate mb-2">
                        Plaque: &ldquo;{item.customInscription}&rdquo;
                      </div>
                    )}

                    {/* Quantity & Delete */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5">
                      {/* Perfectly centered stepper pill */}
                      <div className="flex items-center bg-white rounded-full h-8 px-1.5 border border-[#d6d6d6] shadow-2xs">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full text-[#707070] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.25]" />
                        </button>
                        <span className="w-7 text-center font-bold text-[14px] text-[#1d1d1f] tabular-nums select-none flex items-center justify-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full text-[#707070] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.25]" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-[#707070] hover:text-red-600 transition-colors cursor-pointer p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Whole-Card Clickable Event Date Selector (Opens Popup Modal Picker) */}
            <div
              onClick={() => setIsDatePickerOpen(true)}
              className="p-4 rounded-2xl border border-[#d6d6d6] hover:border-[#0071e3] transition-all bg-white cursor-pointer group flex items-center justify-between shadow-2xs"
            >
              <div className="flex-1 pr-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[#707070] mb-1">
                  Event / Celebration Date
                </span>
                <span className="text-[16px] font-bold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors block">
                  {formattedDate}
                </span>
                <span className="text-[11px] text-[#707070]">Click anywhere to choose date</span>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] group-hover:bg-[#0071e3]/10 flex items-center justify-center transition-colors">
                <Calendar className="w-5 h-5 text-[#707070] group-hover:text-[#0071e3] transition-colors" />
              </div>
            </div>

            {/* Guest Contact Details for Order */}
            <div className="p-4 rounded-2xl border border-[#d6d6d6] space-y-3 bg-white">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#707070]">
                Client & Delivery Details
              </span>
              <div className="space-y-2">
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#707070] absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Full name (e.g. Eleanor Vance)"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (checkoutError) setCheckoutError(null);
                    }}
                    className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-black/10 focus:border-[#0071e3] focus:outline-none transition-colors"
                  />
                </div>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-[#707070] absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Email address for order tracking"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (checkoutError) setCheckoutError(null);
                    }}
                    className="w-full text-sm pl-9 pr-3 py-2 rounded-xl border border-black/10 focus:border-[#0071e3] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Complimentary Gift Card Note */}
            <div className="p-4 rounded-2xl border border-[#d6d6d6] space-y-2 bg-white">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#707070]">
                Complimentary Calligraphy Card Note
              </label>
              <textarea
                rows={2}
                placeholder="Include a personal handwritten wax-sealed message..."
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                className="w-full text-sm bg-transparent resize-none focus:outline-none placeholder:text-[#707070]"
              />
            </div>

            {/* White-Glove Logistics Note */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>
                Includes 4°C temperature-guaranteed courier & white-glove table staging.
              </span>
            </div>
          </div>
        )}

        {/* Footer Checkout Summary */}
        {!orderConfirmed && items.length > 0 && (
          <div className="p-6 border-t border-[#f5f5f7] bg-[#fafafc]">
            {/* Error Banner */}
            {checkoutError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="flex-1">{checkoutError}</span>
                <button
                  type="button"
                  onClick={() => setCheckoutError(null)}
                  className="text-rose-500 hover:text-rose-800 text-base font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}

            <div className="space-y-2.5 mb-5 bg-white p-4 rounded-2xl border border-[#d6d6d6]/60">
              <div className="flex justify-between items-center text-[15px]">
                <span className="text-[#707070]">Subtotal</span>
                <span className="numr font-bold text-[18px] text-[#1d1d1f]">${subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#707070]">White-Glove Refrigerated Courier</span>
                <span className="numr font-semibold text-[15px] text-[#1d1d1f]">
                  {courierFee === 0 ? (
                    <span className="text-emerald-600 font-bold">Complimentary</span>
                  ) : (
                    `$${courierFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-[#d6d6d6]/60">
                <div>
                  <span className="text-[17px] font-bold text-[#1d1d1f] block">Total Cart Price</span>
                  <span className="text-[12px] text-[#707070]">Includes tax & 4°C logistics</span>
                </div>
                <span className="numr text-[28px] sm:text-[32px] font-black tracking-tight text-[#1d1d1f]">
                  ${grandTotal}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="btn-electric w-full py-4 text-[16px] font-semibold cursor-pointer shadow-lg shadow-[#0071e3]/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? (
                "Processing Order..."
              ) : (
                <>
                  Checkout • ${grandTotal}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Date Picker Popup Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={eventDate}
        onSelectDate={(newDate) => setEventDate(newDate)}
        title="Delivery / Event Date"
      />
    </div>
  );
}
