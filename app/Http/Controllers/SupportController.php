<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    /**
     * Display FAQs.
     */
    public function faqs(): Response
    {
        $faqs = Faq::where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('created_at')
            ->get()
            ->groupBy('category');

        return Inertia::render('support/faqs', [
            'faqs' => $faqs,
        ]);
    }

    /**
     * Display customer's support tickets.
     */
    public function customerTickets(): Response
    {
        $customer = Auth::user()->customer;
        
        $tickets = SupportTicket::where('customer_id', $customer->customer_id)
            ->with(['order', 'assignedTo', 'replies'])
            ->latest()
            ->paginate(10);

        return Inertia::render('customer/support/tickets', [
            'tickets' => $tickets,
        ]);
    }

    /**
     * Create a new support ticket.
     */
    public function createTicket(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'nullable|exists:orders,id',
            'subject' => 'required|string|max:200',
            'message' => 'required|string',
            'priority' => 'nullable|in:low,medium,high',
        ]);

        $customer = Auth::user()->customer;
        
        $ticketNumber = 'TKT-' . now()->format('Ymd') . '-' . str_pad(SupportTicket::count() + 1, 5, '0', STR_PAD_LEFT);

        SupportTicket::create([
            'ticket_number' => $ticketNumber,
            'customer_id' => $customer->customer_id,
            'order_id' => $validated['order_id'] ?? null,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'priority' => $validated['priority'] ?? 'medium',
            'status' => 'open',
        ]);

        return back()->with('success', 'Support ticket created successfully.');
    }

    /**
     * Display a specific support ticket.
     */
    public function showTicket(SupportTicket $ticket): Response
    {
        $ticket->load(['order', 'assignedTo', 'replies.user']);

        return Inertia::render('customer/support/ticket-detail', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * Reply to a support ticket.
     */
    public function replyToTicket(SupportTicket $ticket, Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $ticket->replies()->create([
            'user_id' => Auth::id(),
            'support_ticket_id' => $ticket->id,
            'message' => $validated['message'],
        ]);

        return back()->with('success', 'Reply sent successfully.');
    }

    /**
     * Display admin's support tickets view.
     */
    public function adminTickets(Request $request): Response
    {
        $tickets = SupportTicket::with(['customer.user', 'order', 'assignedTo'])
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/support/tickets', [
            'tickets' => $tickets,
        ]);
    }

    /**
     * Assign a ticket to an admin.
     */
    public function assignTicket(SupportTicket $ticket, Request $request)
    {
        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $ticket->update([
            'assigned_to' => $validated['assigned_to'],
            'status' => 'in_progress',
        ]);

        return back()->with('success', 'Ticket assigned successfully.');
    }

    /**
     * Resolve a support ticket.
     */
    public function resolveTicket(SupportTicket $ticket)
    {
        $ticket->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        return back()->with('success', 'Ticket resolved successfully.');
    }
}
