<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $seller = Auth::user()?->seller;

        if (! $seller) {
            abort(403, 'Seller profile not found.');
        }

        $products = Product::query()
            ->where('seller_id', $seller->seller_id)
            ->latest()
            ->get();

        $orders = Order::query()
            ->where('seller_id', $seller->seller_id)
            ->with(['customer.user', 'orderItems', 'payment', 'shipment'])
            ->latest('order_date')
            ->get();

        return Inertia::render('seller/dashboard', [
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
            'orders' => $orders->map(function (Order $order) {
                $firstItem = $order->orderItems->first();
                $customer = $order->customer;

                return [
                    'orderId' => $order->id,
                    'id' => $order->order_number,
                    'dateLabel' => optional($order->order_date)->format('F j, Y') ?? '',
                    'paymentStatus' => $order->payment?->status === 'verified' ? 'verified' : 'pending',
                    'itemName' => $firstItem?->item_name ?? 'Item',
                    'quantity' => (int) ($firstItem?->quantity ?? 1),
                    'itemAmount' => (float) ($firstItem?->line_total ?? $order->subtotal),
                    'customerName' => trim(($customer?->first_name ?? '').' '.($customer?->last_name ?? '')) ?: $customer?->user?->name,
                    'customerPhone' => $customer?->phone,
                    'customerAddress' => trim(collect([$customer?->address, $customer?->city, $customer?->province, $customer?->postal_code])->filter()->implode(', ')),
                    'courier' => $order->shipment?->courier ?? '—',
                    'trackingNumber' => $order->shipment?->tracking_number ?? '—',
                    'shippingFee' => (float) $order->shipping_fee,
                    'subtotal' => (float) $order->subtotal,
                    'total' => (float) $order->total_amount,
                    'status' => $this->mapOrderStatus($order->order_status),
                ];
            })->values(),
        ]);
    }

    private function mapOrderStatus(string $status): string
    {
        return match ($status) {
            'delivered' => 'delivered',
            'shipped' => 'shipped',
            default => 'pending',
        };
    }
}
