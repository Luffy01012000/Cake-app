import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/data-service";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> | null = null;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be a JSON object." },
      { status: 400 }
    );
  }

  const {
    cakeId,
    cakeName,
    customerName,
    customerEmail,
    price,
    quantity,
    deliveryDate,
    notes,
  } = body;

  // Validation: cakeId is required and must be non-empty string
  if (!cakeId || typeof cakeId !== "string" || !cakeId.trim()) {
    return NextResponse.json(
      { error: "Validation failed: 'cakeId' is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  // Validation: customerName is required and must be non-empty string
  if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
    return NextResponse.json(
      { error: "Validation failed: 'customerName' is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  // Validation: customerEmail is required and must contain @
  if (!customerEmail || typeof customerEmail !== "string" || !customerEmail.includes("@")) {
    return NextResponse.json(
      { error: "Validation failed: 'customerEmail' is required and must be a valid email address." },
      { status: 400 }
    );
  }

  // Validation: quantity, if provided, must be a positive integer
  if (
    quantity !== undefined &&
    (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1)
  ) {
    return NextResponse.json(
      { error: "Validation failed: 'quantity' must be a positive integer (minimum 1)." },
      { status: 400 }
    );
  }

  // Validation: price, if provided, must be a non-negative number
  if (
    price !== undefined &&
    (typeof price !== "number" || !Number.isFinite(price) || price < 0)
  ) {
    return NextResponse.json(
      { error: "Validation failed: 'price' must be a non-negative number." },
      { status: 400 }
    );
  }

  try {
    const order = await createOrder({
      cakeId: cakeId.trim(),
      cakeName: typeof cakeName === "string" ? cakeName.trim() : undefined,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      price: price !== undefined ? price : undefined,
      quantity: quantity !== undefined ? quantity : 1,
      deliveryDate: typeof deliveryDate === "string" ? deliveryDate.trim() : undefined,
      notes: typeof notes === "string" ? notes.trim() : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = (err as Error).message || "Failed to create order.";
    const isNotFound = message.toLowerCase().includes("not found");
    return NextResponse.json(
      { error: message },
      { status: isNotFound ? 404 : 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to place orders." },
    { status: 405 }
  );
}
