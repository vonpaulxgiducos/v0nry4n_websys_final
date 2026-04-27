<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function verify(Payment $payment): RedirectResponse
    {
        $this->authorizeSellerPayment($payment);

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
            ->route('seller.dashboard', ['section' => 'payments'])
            ->with('success', 'Payment verified successfully.');
    }

    public function reject(Payment $payment): RedirectResponse
    {
        $this->authorizeSellerPayment($payment);

        $payment->update([
            'status' => 'rejected',
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        return redirect()
            ->route('seller.dashboard', ['section' => 'payments'])
            ->with('success', 'Payment rejected successfully.');
    }

    private function authorizeSellerPayment(Payment $payment): void
    {
        $sellerId = Auth::user()?->seller?->seller_id;
        $order = $payment->order;

        abort_unless(
            $sellerId !== null
            && $order !== null
            && (int) $order->seller_id === (int) $sellerId,
            403,
        );
    }
}
