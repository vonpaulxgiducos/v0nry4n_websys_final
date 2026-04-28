<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Faq;
use App\Models\Order;
use App\Models\Product;
use App\Models\SupportTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $customer = $user?->customer;

        if ($user && ! $customer) {
            $nameParts = explode(' ', $user->name ?? '', 2);

            $customer = Customer::create([
                'user_id' => $user->id,
                'first_name' => $nameParts[0] ?? '',
                'last_name' => $nameParts[1] ?? '',
            ]);
        }

        $products = Product::query()
            ->with('seller.user')
            ->where('approval_status', 'approved')
            ->where('is_active', true)
            ->latest()
            ->get();

        $orders = Order::query()
            ->where('customer_id', $customer->customer_id)
            ->whereNull('customer_hidden_at')
            ->with(['seller.user', 'orderItems', 'payment'])
            ->latest('order_date')
            ->get();

        $tickets = SupportTicket::query()
            ->where('customer_id', $customer->customer_id)
            ->latest()
            ->limit(10)
            ->get();

        $faqs = Faq::query()
            ->where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('id')
            ->pluck('question');

        $cartItems = $customer->cartItems()
            ->with(['product.seller.user'])
            ->get()
            ->filter(fn ($item) => $item->product && $item->product->approval_status === 'approved' && $item->product->is_active)
            ->values();

        $mappedOrderDetails = $orders->map(function (Order $order) use ($customer) {
            $items = $order->orderItems->map(function ($item) {
                return [
                    'name' => $item->item_name,
                    'meta' => $item->variant_name,
                    'quantity' => (int) $item->quantity,
                    'amount' => '₱'.number_format((float) $item->line_total, 0),
                ];
            })->values();

            $totalQuantity = (int) $order->orderItems->sum('quantity');

            return [
                'orderId' => $order->id,
                'id' => $order->order_number,
                'date' => optional($order->order_date)->format('F j, Y') ?? '',
                'status' => $this->mapOrderStatus($order),
                'paymentStatus' => $order->payment?->status === 'verified' ? 'verified' : 'pending',
                'paymentMethod' => $this->mapPaymentMethod($order->payment?->method),
                'items' => $items,
                'quantity' => $totalQuantity,
                'recipient' => $order->recipient_name ?: (trim(($customer->first_name ?? '').' '.($customer->last_name ?? '')) ?: $order->customer?->user?->name),
                'phone' => $order->recipient_phone ?: $customer->phone,
                'address' => $order->delivery_address ?: trim(collect([$customer->address, $customer->city, $customer->province, $customer->postal_code])->filter()->implode(', ')),
                'courier' => $order->courier ?: 'J&T Express',
                'subtotal' => '₱'.number_format((float) $order->subtotal, 0),
                'shippingFee' => '₱'.number_format((float) $order->shipping_fee, 0),
                'total' => '₱'.number_format((float) $order->total_amount, 0),
                'seller' => $order->seller?->business_name ?? $order->seller?->user?->name ?? 'Seller',
                'sellerPhone' => $order->seller?->phone,
            ];
        })->values();

        return Inertia::render('dashboard', [
            'stats' => [
                ['label' => 'Total Orders', 'value' => (string) $orders->count()],
                ['label' => 'Pending Orders', 'value' => (string) $orders->where('order_status', 'pending')->count()],
                ['label' => 'In Transit', 'value' => (string) $orders->where('order_status', 'shipped')->count()],
                ['label' => 'Available Products', 'value' => (string) $products->count()],
            ],
            'dashboardOrders' => $orders->take(5)->map(function (Order $order) {
                return [
                    'id' => $order->order_number,
                    'store' => $order->seller?->business_name ?? $order->seller?->user?->name ?? 'Seller',
                    'amount' => '₱'.number_format((float) $order->total_amount, 0),
                    'status' => $this->mapOrderStatus($order),
                    'paymentStatus' => $order->payment?->status === 'verified' ? 'verified' : 'pending',
                    'paymentMethod' => $this->mapPaymentMethod($order->payment?->method),
                ];
            })->values(),
            'products' => $products->map(function (Product $product) {
                return [
                    'id' => 'prod-'.$product->id,
                    'name' => $product->name,
                    'description' => $product->description ?? '',
                    'seller' => $product->seller?->business_name ?? $product->seller?->user?->name ?? 'Seller',
                    'stock' => (int) $product->stock,
                    'price' => (float) $product->price,
                    'category' => $product->category,
                    'image' => $product->image_url ?: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
                ];
            })->values(),
            'cartItems' => $cartItems->map(function ($item) {
                $product = $item->product;

                return [
                    'product' => [
                        'id' => 'prod-'.$product->id,
                        'name' => $product->name,
                        'description' => $product->description ?? '',
                        'seller' => $product->seller?->business_name ?? $product->seller?->user?->name ?? 'Seller',
                        'stock' => (int) $product->stock,
                        'price' => (float) $product->price,
                        'category' => $product->category,
                        'image' => $product->image_url ?: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
                    ],
                    'quantity' => (int) $item->quantity,
                ];
            })->values(),
            'activeOrderDetails' => $mappedOrderDetails
                ->filter(fn (array $order) => $order['status'] !== 'delivered' && $order['status'] !== 'cancelled')
                ->values(),
            'historyOrderDetails' => $mappedOrderDetails
                ->filter(fn (array $order) => $order['status'] === 'delivered' || $order['status'] === 'cancelled')
                ->values(),
            'checkoutDefaults' => [
                'recipientName' => trim(($customer->first_name ?? '').' '.($customer->last_name ?? '')) ?: ($user?->name ?? ''),
                'phone' => $customer->phone ?? '',
                'address' => trim(collect([$customer->address, $customer->city, $customer->province, $customer->postal_code])->filter()->implode(', ')),
                'courier' => 'J&T Express',
            ],
            'tickets' => $tickets->map(fn (SupportTicket $ticket) => [
                'id' => $ticket->ticket_number,
                'subject' => $ticket->subject,
                'date' => optional($ticket->created_at)->format('n/j/Y'),
                'status' => $ticket->status === 'resolved' ? 'resolved' : 'open',
            ])->values(),
            'faqs' => $faqs->values(),
        ]);
    }

    public function cancelOrder(Request $request, Order $order): RedirectResponse
    {
        $customer = $request->user()?->customer;

        if (! $customer || (int) $order->customer_id !== (int) $customer->customer_id) {
            abort(403, 'You are not allowed to modify this order.');
        }

        if (! $this->isCancellableOrder($order)) {
            return back()->with('error', 'Only pending, payment-verified, or confirmed orders can be cancelled.');
        }

        DB::transaction(function () use ($order): void {
            $order->loadMissing('orderItems.product');

            foreach ($order->orderItems as $item) {
                if ($item->product) {
                    $item->product->increment('stock', (int) $item->quantity);
                }
            }

            $order->update([
                'order_status' => 'cancelled',
                'shipment_status' => null,
            ]);
        });

        return back()->with('success', 'Order cancelled successfully.');
    }

    public function cancelOrDeleteOrder(Request $request, Order $order): RedirectResponse
    {
        $customer = $request->user()?->customer;

        if (! $customer || (int) $order->customer_id !== (int) $customer->customer_id) {
            abort(403, 'You are not allowed to modify this order.');
        }

        $validated = $request->validate([
            'action' => ['nullable', 'in:cancel,delete'],
        ]);

        $action = $validated['action'] ?? ($this->isCancellableOrder($order) ? 'cancel' : 'delete');

        if ($action === 'cancel') {
            if (! $this->isCancellableOrder($order)) {
                return back()->with('error', 'Only pending, payment-verified, or confirmed orders can be cancelled.');
            }

            DB::transaction(function () use ($order): void {
                $order->loadMissing('orderItems.product');

                foreach ($order->orderItems as $item) {
                    if ($item->product) {
                        $item->product->increment('stock', (int) $item->quantity);
                    }
                }

                $order->update([
                    'order_status' => 'cancelled',
                    'shipment_status' => null,
                ]);
            });

            return back()->with('success', 'Order cancelled successfully.');
        }

        if ($this->isCancellableOrder($order)) {
            return back()->with('error', 'Pending, payment-verified, or confirmed orders must be cancelled first.');
        }

        if ($order->customer_hidden_at) {
            return back()->with('success', 'Order removed from your list.');
        }

        $order->update([
            'customer_hidden_at' => now(),
        ]);

        return back()->with('success', 'Order removed from your list.');
    }

    public function markOrderReceived(Request $request, Order $order): RedirectResponse
    {
        $customer = $request->user()?->customer;

        if (! $customer || (int) $order->customer_id !== (int) $customer->customer_id) {
            abort(403, 'You are not allowed to modify this order.');
        }

        if (
            $this->mapOrderStatus($order) !== 'out_for_delivery'
            || $order->payment?->status !== 'verified'
        ) {
            return back()->with('error', 'Order can only be marked as received when payment is verified and it is out for delivery.');
        }

        $order->update([
            'order_status' => 'delivered',
            'shipment_status' => 'delivered',
        ]);

        return back()->with('success', 'Order marked as received.');
    }

    private function mapOrderStatus(Order $order): string
    {
        return match ($order->order_status) {
            'delivered' => 'delivered',
            'payment_verified' => $order->shipment_status ?: 'confirmed',
            'preparing' => $order->shipment_status ?: 'confirmed',
            'shipped' => $order->shipment_status ?: 'shipped_dispatched',
            'cancelled' => 'cancelled',
            default => 'pending',
        };
    }

    private function isCancellableOrder(Order $order): bool
    {
        return in_array($order->order_status, ['pending', 'payment_verified', 'preparing'], true);
    }

    private function mapPaymentMethod(?string $method): string
    {
        return match ($method) {
            'cash_on_delivery' => 'Cash on Delivery',
            'gcash' => 'GCash',
            null => '—',
            default => str($method)->replace('_', ' ')->title()->toString(),
        };
    }
}
