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

    public function withdrawProduct(Product $product): RedirectResponse
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        $product->update([
            'approval_status' => 'pending',
        ]);

        return back()->with('success', 'Product approval withdrawn successfully.');
    }

    public function verifyPayment(Payment $payment): RedirectResponse
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        $payment->update([
            'status' => 'verified',
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        if ($payment->order && $payment->order->order_status === 'pending') {
            $payment->order->update([
                'order_status' => 'payment_verified',
            ]);
        }

        return redirect()
            ->route('admin.dashboard', ['section' => 'payments'])
            ->with('success', 'Payment verified successfully.');
    }

    public function rejectPayment(Payment $payment): RedirectResponse
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        $payment->update([
            'status' => 'rejected',
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        return redirect()
            ->route('admin.dashboard', ['section' => 'payments'])
            ->with('success', 'Payment rejected successfully.');
    }

    public function archivePayment(Payment $payment): RedirectResponse
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        if (! $payment->admin_archived_at) {
            $payment->update([
                'admin_archived_at' => now(),
            ]);
        }

        return back()->with('success', 'Payment archived successfully.');
    }

    public function unarchivePayment(Payment $payment): RedirectResponse
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        $payment->update([
            'admin_archived_at' => null,
        ]);

        return back()->with('success', 'Payment unarchived successfully.');
    }

    public function destroyPayment(Payment $payment): RedirectResponse
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        if (! $payment->admin_hidden_at) {
            $payment->update([
                'admin_hidden_at' => now(),
            ]);
        }

        return back()->with('success', 'Payment removed from admin list.');
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

    public function destroyTicket(SupportTicket $ticket): RedirectResponse
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        $ticket->delete();

        return back()->with('success', 'Support ticket deleted successfully.');
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
            ->whereNull('admin_hidden_at')
            ->where('status', 'pending')
            ->whereHas('order', function ($query) {
                $query->where('order_status', '!=', 'cancelled');
            })
            ->latest()
            ->get();

        $verifiedPayments = Payment::query()
            ->with('order.customer.user')
            ->whereNull('admin_hidden_at')
            ->where('status', 'verified')
            ->latest()
            ->get();

        $rejectedPayments = Payment::query()
            ->with('order.customer.user')
            ->whereNull('admin_hidden_at')
            ->where('status', 'rejected')
            ->latest()
            ->get();

        $revenueHistoryPayments = Payment::query()
            ->with('order.customer.user')
            ->whereNull('admin_hidden_at')
            ->where('status', 'verified')
            ->whereHas('order', function ($query) {
                $query->where('order_status', 'delivered');
            })
            ->latest()
            ->get();

        $tickets = SupportTicket::query()
            ->with(['customer.user', 'order'])
            ->latest()
            ->get();

        $platformRevenue = Payment::query()
            ->whereNull('admin_hidden_at')
            ->where('status', 'verified')
            ->whereHas('order', function ($query) {
                $query->where('order_status', 'delivered');
            })
            ->sum('amount');

        return Inertia::render('admin/dashboard', [
            'profileData' => [
                'username' => Auth::user()?->username,
                'email' => Auth::user()?->email,
                'name' => Auth::user()?->name,
                'phone' => Auth::user()?->superAdmin?->phone,
            ],
            'userType' => Auth::user()?->user_type,
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
                    'customerPhone' => $payment->order?->customer?->phone ?? $payment->order?->recipient_phone,
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
                    'customerPhone' => $payment->order?->customer?->phone ?? $payment->order?->recipient_phone,
                    'dateLabel' => optional($payment->created_at)->format('F j, Y \a\t h:i A') ?? '',
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
            'initialRevenueHistory' => $revenueHistoryPayments->map(function (Payment $payment) {
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
                    'isArchived' => $payment->admin_archived_at !== null,
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
