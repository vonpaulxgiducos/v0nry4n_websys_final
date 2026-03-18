<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display seller's orders.
     */
    public function index(Request $request): Response
    {
        $seller = Auth::user()->seller;
        
        $orders = Order::where('seller_id', $seller->seller_id)
            ->with(['customer.user', 'orderItems', 'payment', 'shipment'])
            ->when($request->status, function ($query, $status) {
                $query->where('order_status', $status);
            })
            ->latest()
            ->paginate(10);

        return Inertia::render('seller/orders/index', [
            'orders' => $orders,
        ]);
    }

    /**
     * Display a specific order.
     */
    public function show(Order $order): Response
    {
        // Ensure the order belongs to the authenticated seller
        if ($order->seller_id !== Auth::user()->seller->seller_id) {
            abort(403);
        }

        $order->load([
            'customer.user',
            'orderItems.product',
            'payment',
            'shipment',
        ]);

        return Inertia::render('seller/orders/show', [
            'order' => $order,
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Order $order, Request $request)
    {
        // Ensure the order belongs to the authenticated seller
        if ($order->seller_id !== Auth::user()->seller->seller_id) {
            abort(403);
        }

        $validated = $request->validate([
            'order_status' => 'required|in:pending,payment_verified,preparing,shipped,delivered,cancelled',
        ]);

        $order->update([
            'order_status' => $validated['order_status'],
        ]);

        return redirect()
            ->route('seller.dashboard', ['section' => 'orders'])
            ->with('success', 'Order status updated successfully.');
    }
}
