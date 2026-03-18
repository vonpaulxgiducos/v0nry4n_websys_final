<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Product;
use App\Models\SupportTicket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function approveProduct(Product $product): RedirectResponse
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        $product->update([
            'approval_status' => 'approved',
        ]);

        return back()->with('success', 'Product approved successfully.');
    }

    public function rejectProduct(Product $product): RedirectResponse
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        $product->update([
            'approval_status' => 'rejected',
        ]);

        return back()->with('success', 'Product rejected successfully.');
    }

    public function verifyPayment(Payment $payment): RedirectResponse
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        $payment->update([
            'status' => 'verified',
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        if ($payment->order) {
            $payment->order->update([
                'order_status' => 'payment_verified',
            ]);
        }

        return back()->with('success', 'Payment verified successfully.');
    }

    public function rejectPayment(Payment $payment): RedirectResponse
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        $payment->update([
            'status' => 'rejected',
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        return back()->with('success', 'Payment rejected successfully.');
    }

    public function resolveTicket(SupportTicket $ticket): RedirectResponse
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        $ticket->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        return back()->with('success', 'Support ticket resolved successfully.');
    }

    public function index(): Response
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        $pendingProducts = Product::query()
            ->with('seller.user')
            ->where('approval_status', 'pending')
            ->latest()
            ->get();

        $approvedProducts = Product::query()
            ->with('seller.user')
            ->where('approval_status', 'approved')
            ->latest()
            ->get();

        $pendingPayments = Payment::query()
            ->with('order.customer.user')
            ->where('status', 'pending')
            ->latest()
            ->get();

        $verifiedPayments = Payment::query()
            ->with('order.customer.user')
            ->where('status', 'verified')
            ->latest()
            ->get();

        $tickets = SupportTicket::query()
            ->with(['customer.user', 'order'])
            ->latest()
            ->get();

        $platformRevenue = Payment::query()->where('status', 'verified')->sum('amount');

        return Inertia::render('admin/dashboard', [
            'stats' => [
                ['label' => 'Pending Products', 'value' => (string) $pendingProducts->count()],
                ['label' => 'Pending Payments', 'value' => (string) $pendingPayments->count()],
                ['label' => 'Open Tickets', 'value' => (string) $tickets->where('status', '!=', 'resolved')->count()],
                ['label' => 'Total Orders', 'value' => (string) Payment::query()->count()],
            ],
            'platformRevenue' => (float) $platformRevenue,
            'activeProducts' => Product::query()->where('approval_status', 'approved')->where('is_active', true)->count(),
            'initialApprovals' => $pendingProducts->map(function (Product $product) {
                return [
                    'id' => 'APP-'.$product->id,
                    'name' => $product->name,
                    'description' => $product->description ?? '',
                    'seller' => $product->seller?->business_name ?? $product->seller?->user?->name ?? 'Seller',
                    'category' => $product->category,
                    'price' => (float) $product->price,
                    'stock' => (int) $product->stock,
                    'image' => $product->image_url ?: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
                    'status' => 'pending',
                ];
            })->values(),
            'initialApprovedProducts' => $approvedProducts->map(function (Product $product) {
                return [
                    'id' => 'APP-'.$product->id,
                    'name' => $product->name,
                    'description' => $product->description ?? '',
                    'seller' => $product->seller?->business_name ?? $product->seller?->user?->name ?? 'Seller',
                    'category' => $product->category,
                    'price' => (float) $product->price,
                    'stock' => (int) $product->stock,
                    'image' => $product->image_url ?: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
                    'status' => 'approved',
                ];
            })->values(),
            'initialPendingPayments' => $pendingPayments->map(function (Payment $payment) {
                return [
                    'paymentId' => $payment->id,
                    'id' => $payment->order?->order_number ?? 'ORD-'.$payment->order_id,
                    'method' => $payment->method,
                    'amount' => (float) $payment->amount,
                    'customer' => $payment->order?->customer?->user?->name ?? 'Customer',
                    'dateLabel' => optional($payment->created_at)->format('F j, Y \a\t h:i A') ?? '',
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
                    'dateLabel' => optional($payment->created_at)->format('F j, Y \a\t h:i A') ?? '',
                    'reference' => $payment->reference,
                    'notes' => $payment->notes ?? '',
                    'status' => 'verified',
                    'verifiedOn' => $payment->verified_at ? 'Verified on '.$payment->verified_at->format('n/j/Y') : null,
                    'verificationNotes' => $payment->notes,
                ];
            })->values(),
            'initialTickets' => $tickets->map(function (SupportTicket $ticket) {
                return [
                    'ticketId' => $ticket->id,
                    'id' => $ticket->ticket_number,
                    'subject' => $ticket->subject,
                    'preview' => str($ticket->message)->limit(80)->toString(),
                    'message' => $ticket->message,
                    'customer' => $ticket->customer?->user?->name ?? 'Customer',
                    'date' => optional($ticket->created_at)->format('n/j/Y') ?? '',
                    'priority' => $ticket->priority,
                    'status' => $ticket->status,
                    'relatedOrder' => $ticket->order?->order_number,
                ];
            })->values(),
        ]);
    }
}
