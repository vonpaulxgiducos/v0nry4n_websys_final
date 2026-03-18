<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ShipmentController extends Controller
{
    /**
     * Display seller's shipments.
     */
    public function index(): Response
    {
        $seller = Auth::user()->seller;
        
        $shipments = Shipment::where('seller_id', $seller->seller_id)
            ->with(['order.customer.user'])
            ->latest()
            ->paginate(10);

        return Inertia::render('seller/shipments/index', [
            'shipments' => $shipments,
        ]);
    }

    /**
     * Create a new shipment for an order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'tracking_number' => 'required|string|max:100',
            'courier' => 'required|string|max:100',
            'estimated_delivery' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $seller = Auth::user()->seller;
        
        // Ensure the order belongs to the seller
        $order = Order::findOrFail($validated['order_id']);
        if ($order->seller_id !== $seller->seller_id) {
            abort(403);
        }

        $shipment = Shipment::create([
            'order_id' => $validated['order_id'],
            'seller_id' => $seller->seller_id,
            'tracking_number' => $validated['tracking_number'],
            'courier' => $validated['courier'],
            'shipping_status' => 'preparing',
            'estimated_delivery' => $validated['estimated_delivery'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Update order status
        $order->update([
            'order_status' => 'preparing',
        ]);

        return back()->with('success', 'Shipment created successfully.');
    }

    /**
     * Update shipment status.
     */
    public function update(Shipment $shipment, Request $request)
    {
        // Ensure the shipment belongs to the authenticated seller
        if ($shipment->seller_id !== Auth::user()->seller->seller_id) {
            abort(403);
        }

        $validated = $request->validate([
            'shipping_status' => 'required|in:pending,preparing,in_transit,delivered',
            'tracking_number' => 'nullable|string|max:100',
            'courier' => 'nullable|string|max:100',
            'estimated_delivery' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $shipment->update($validated);

        // Update shipped_at timestamp when status changes to in_transit
        if ($validated['shipping_status'] === 'in_transit' && !$shipment->shipped_at) {
            $shipment->update(['shipped_at' => now()]);
            $shipment->order->update(['order_status' => 'shipped']);
        }

        // Update delivered_at timestamp when status changes to delivered
        if ($validated['shipping_status'] === 'delivered' && !$shipment->delivered_at) {
            $shipment->update(['delivered_at' => now()]);
            $shipment->order->update(['order_status' => 'delivered']);
        }

        return back()->with('success', 'Shipment updated successfully.');
    }
}
