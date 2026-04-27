<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Seller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $seller = $user?->seller;

        if ($user && ! $seller) {
            $seller = Seller::create([
                'user_id' => $user->id,
                'business_name' => $user->name ?? 'Business',
                'owner_name' => $user->name ?? '',
                'phone' => '',
                'email' => $user->email,
                'address' => '',
                'is_approved' => false,
            ]);
        }

        $products = Product::query()
            ->where('seller_id', $seller->seller_id)
            ->latest()
            ->get();

        $orders = Order::query()
            ->where('seller_id', $seller->seller_id)
            ->whereNull('seller_hidden_at')
            ->with(['customer.user', 'orderItems', 'payment', 'shipment'])
            ->latest('order_date')
            ->get();

        $pendingPayments = Payment::query()
            ->with('order.customer.user')
            ->where('status', 'pending')
            ->whereHas('order', function ($query) use ($seller) {
                $query
                    ->where('seller_id', $seller->seller_id)
                    ->whereNull('seller_hidden_at')
                    ->where('order_status', '!=', 'cancelled');
            })
            ->latest()
            ->get();

        $verifiedPayments = Payment::query()
            ->with('order.customer.user')
            ->where('status', 'verified')
            ->whereHas('order', function ($query) use ($seller) {
                $query
                    ->where('seller_id', $seller->seller_id)
                    ->whereNull('seller_hidden_at');
            })
            ->latest()
            ->get();

        $rejectedPayments = Payment::query()
            ->with('order.customer.user')
            ->where('status', 'rejected')
            ->whereHas('order', function ($query) use ($seller) {
                $query
                    ->where('seller_id', $seller->seller_id)
                    ->whereNull('seller_hidden_at');
            })
            ->latest()
            ->get();

        $mapOrder = function (Order $order): array {
            $customer = $order->customer;
            $items = $order->orderItems->map(function ($item) {
                return [
                    'name' => $item->item_name,
                    'quantity' => (int) $item->quantity,
                    'amount' => (float) $item->line_total,
                ];
            })->values();

            return [
                'orderId' => $order->id,
                'id' => $order->order_number,
                'dateLabel' => optional($order->order_date)->format('F j, Y') ?? '',
                'paymentStatus' => $order->payment?->status === 'verified' ? 'verified' : 'pending',
                'paymentMethod' => $this->mapPaymentMethod($order->payment?->method),
                'items' => $items,
                'quantity' => (int) $order->orderItems->sum('quantity'),
                'customerName' => trim(($customer?->first_name ?? '').' '.($customer?->last_name ?? '')) ?: $customer?->user?->name,
                'customerPhone' => $customer?->phone,
                'customerAddress' => trim(collect([$customer?->address, $customer?->city, $customer?->province, $customer?->postal_code])->filter()->implode(', ')),
                'courier' => $order->shipment?->courier ?? $order->courier ?? '—',
                'trackingNumber' => $order->shipment?->tracking_number ?? '—',
                'shippingFee' => (float) $order->shipping_fee,
                'subtotal' => (float) $order->subtotal,
                'total' => (float) $order->total_amount,
                'status' => $this->mapOrderStatus($order),
            ];
        };

        $activeOrders = $orders
            ->filter(fn (Order $order) => $order->seller_archived_at === null && $order->order_status !== 'cancelled')
            ->map($mapOrder)
            ->values();

        $archivedOrders = $orders
            ->filter(fn (Order $order) => $order->seller_archived_at !== null || $order->order_status === 'cancelled')
            ->map($mapOrder)
            ->values();

        return Inertia::render('seller/dashboard', [
            'profileData' => [
                'username' => $user?->username,
                'email' => $user?->email,
                'name' => $user?->name,
                'owner_name' => $seller?->owner_name,
                'business_name' => $seller?->business_name,
                'phone' => $seller?->phone,
                'address' => $seller?->address,
            ],
            'userType' => $user?->user_type,
            'products' => $products->map(function (Product $product) {
                return [
                    'id' => 'prod-'.$product->id,
                    'name' => $product->name,
                    'category' => $product->category,
                    'image' => $product->image_url ?: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
                    'description' => $product->description ?? '',
                    'stock' => (int) $product->stock,
                    'price' => (float) $product->price,
                    'status' => $product->approval_status === 'approved' ? 'approved' : 'pending',
                ];
            })->values(),
            'initialPendingPayments' => $pendingPayments->map(function (Payment $payment) {
                return [
                    'paymentId' => $payment->id,
                    'id' => $payment->order?->order_number ?? 'ORD-'.$payment->order_id,
                    'method' => $payment->method,
                    'amount' => (float) $payment->amount,
                    'customer' => $payment->order?->customer?->user?->name ?? 'Customer',
                    'customerPhone' => $payment->order?->customer?->phone ?? $payment->order?->recipient_phone,
                    'dateLabel' => optional($payment->created_at)->format('F j, Y \\a\\t h:i A') ?? '',
                    'reference' => $payment->reference,
                    'notes' => $payment->notes ?? '',
                    'status' => 'pending',
                ];
            })->values(),
            'initialVerifiedPayments' => $verifiedPayments->map(function (Payment $payment) {
                return [
                    'paymentId' => $payment->id,
                    'id' => $payment->order?->order_number ?? 'ORD-'.$payment->order_id,
                    'method' => $payment->method,
                    'amount' => (float) $payment->amount,
                    'customer' => $payment->order?->customer?->user?->name ?? 'Customer',
                    'customerPhone' => $payment->order?->customer?->phone ?? $payment->order?->recipient_phone,
                    'dateLabel' => optional($payment->created_at)->format('F j, Y \\a\\t h:i A') ?? '',
                    'reference' => $payment->reference,
                    'notes' => $payment->notes ?? '',
                    'status' => 'verified',
                    'verifiedOn' => $payment->verified_at ? 'Verified on '.$payment->verified_at->format('n/j/Y') : null,
                    'verificationNotes' => $payment->notes,
                ];
            })->values(),
            'initialRejectedPayments' => $rejectedPayments->map(function (Payment $payment) {
                return [
                    'paymentId' => $payment->id,
                    'id' => $payment->order?->order_number ?? 'ORD-'.$payment->order_id,
                    'method' => $payment->method,
                    'amount' => (float) $payment->amount,
                    'customer' => $payment->order?->customer?->user?->name ?? 'Customer',
                    'customerPhone' => $payment->order?->customer?->phone ?? $payment->order?->recipient_phone,
                    'dateLabel' => optional($payment->created_at)->format('F j, Y \\a\\t h:i A') ?? '',
                    'reference' => $payment->reference,
                    'notes' => $payment->notes ?? '',
                    'status' => 'rejected',
                    'verificationNotes' => $payment->notes,
                ];
            })->values(),
            'activeOrders' => $activeOrders,
            'archivedOrders' => $archivedOrders,
        ]);
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

    private function mapOrderStatus(Order $order): string
    {
        return match ($order->order_status) {
            'cancelled' => 'cancelled',
            'delivered' => 'delivered',
            'preparing' => $order->shipment_status ?: 'confirmed',
            'shipped' => $order->shipment_status ?: 'shipped_dispatched',
            default => 'pending',
        };
    }
}
