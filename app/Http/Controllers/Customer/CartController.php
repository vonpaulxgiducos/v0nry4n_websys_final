<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CartController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $customer = $this->resolveCustomer($request);

        $product = Product::query()
            ->where('id', $validated['product_id'])
            ->where('approval_status', 'approved')
            ->where('is_active', true)
            ->firstOrFail();

        $item = CartItem::query()->firstOrNew([
            'customer_id' => $customer->customer_id,
            'product_id' => $product->id,
        ]);

        $currentQuantity = $item->exists ? (int) $item->quantity : 0;
        $nextQuantity = min($product->stock, $currentQuantity + (int) $validated['quantity']);

        if ($nextQuantity < 1) {
            return back()->with('error', 'Product is out of stock.');
        }

        $item->quantity = $nextQuantity;
        $item->save();

        return back()->with('success', 'Product added to cart.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $customer = $this->resolveCustomer($request);

        $item = CartItem::query()
            ->where('customer_id', $customer->customer_id)
            ->where('product_id', $product->id)
            ->firstOrFail();

        $maxQuantity = (int) $product->stock;

        if ($maxQuantity < 1) {
            $item->delete();

            return back()->with('error', 'Product is out of stock.');
        }

        $item->update([
            'quantity' => min((int) $validated['quantity'], $maxQuantity),
        ]);

        return back();
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $customer = $this->resolveCustomer($request);

        CartItem::query()
            ->where('customer_id', $customer->customer_id)
            ->where('product_id', $product->id)
            ->delete();

        return back();
    }

    public function checkout(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_ids' => ['required', 'array', 'min:1'],
            'product_ids.*' => ['integer'],
            'recipient_name' => ['required', 'string', 'max:150'],
            'recipient_phone' => ['required', 'string', 'max:30'],
            'delivery_address' => ['required', 'string', 'max:1000'],
            'courier' => ['required', 'in:J&T Express,LBC,Ninja Van'],
            'payment_method' => ['required', 'in:gcash,cash_on_delivery'],
        ]);

        $customer = $this->resolveCustomer($request);

        DB::transaction(function () use ($validated, $customer): void {
            $cartItems = CartItem::query()
                ->where('customer_id', $customer->customer_id)
                ->whereIn('product_id', $validated['product_ids'])
                ->with('product')
                ->lockForUpdate()
                ->get()
                ->filter(fn (CartItem $item) => $item->product && $item->product->seller_id);

            if ($cartItems->isEmpty()) {
                abort(422, 'No selected cart items found.');
            }

            $groupedBySeller = $cartItems->groupBy(fn (CartItem $item) => $item->product->seller_id);

            foreach ($groupedBySeller as $sellerId => $items) {
                $subtotal = $items->sum(fn (CartItem $item) => (float) $item->product->price * (int) $item->quantity);
                $shippingFee = $this->shippingFeeForCourier($validated['courier']);
                $totalAmount = $subtotal + $shippingFee;

                $order = Order::query()->create([
                    'order_number' => $this->generateOrderNumber(),
                    'customer_id' => $customer->customer_id,
                    'seller_id' => (int) $sellerId,
                    'order_status' => 'pending',
                    'subtotal' => $subtotal,
                    'shipping_fee' => $shippingFee,
                    'total_amount' => $totalAmount,
                    'recipient_name' => $validated['recipient_name'],
                    'recipient_phone' => $validated['recipient_phone'],
                    'delivery_address' => $validated['delivery_address'],
                    'courier' => $validated['courier'],
                ]);

                foreach ($items as $item) {
                    if ((int) $item->product->stock < (int) $item->quantity) {
                        abort(422, "Not enough stock for {$item->product->name}.");
                    }

                    $lineTotal = (float) $item->product->price * (int) $item->quantity;

                    OrderItem::query()->create([
                        'order_id' => $order->id,
                        'product_id' => $item->product->id,
                        'item_name' => $item->product->name,
                        'variant_name' => null,
                        'quantity' => (int) $item->quantity,
                        'unit_price' => (float) $item->product->price,
                        'line_total' => $lineTotal,
                    ]);

                    $item->product->decrement('stock', (int) $item->quantity);
                }

                Payment::query()->create([
                    'order_id' => $order->id,
                    'method' => $validated['payment_method'],
                    'reference' => 'PENDING-'.(string) Str::upper(Str::random(8)),
                    'amount' => $totalAmount,
                    'notes' => 'Awaiting payment verification.',
                    'status' => 'pending',
                ]);
            }

            CartItem::query()
                ->where('customer_id', $customer->customer_id)
                ->whereIn('product_id', $validated['product_ids'])
                ->delete();
        });

        return redirect()
            ->route('dashboard', ['section' => 'orders'])
            ->with('success', 'Checkout completed. Orders were created successfully.');
    }

    private function generateOrderNumber(): string
    {
        return 'ORD-'.now()->format('Ymd').'-'.(string) Str::upper(Str::random(6));
    }

    private function shippingFeeForCourier(string $courier): float
    {
        return match ($courier) {
            'J&T Express' => 120.0,
            'LBC' => 150.0,
            'Ninja Van' => 130.0,
            default => 120.0,
        };
    }

    private function resolveCustomer(Request $request): Customer
    {
        $user = $request->user();
        $customer = $user?->customer;

        if ($user && ! $customer) {
            $nameParts = explode(' ', $user->name ?? '', 2);

            $customer = Customer::create([
                'user_id' => $user->id,
                'first_name' => $nameParts[0] ?? '',
                'last_name' => $nameParts[1] ?? '',
            ]);
        }

        return $customer;
    }
}
