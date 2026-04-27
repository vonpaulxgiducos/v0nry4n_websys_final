<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Customer\CartController as CustomerCartController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\Seller\DashboardController as SellerDashboardController;
use App\Http\Controllers\Seller\OrderController as SellerOrderController;
use App\Http\Controllers\Seller\PaymentController as SellerPaymentController;
use App\Http\Controllers\Seller\ProductController as SellerProductController;
use App\Http\Controllers\SupportController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'status' => session('status'),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::middleware('role:customer')->group(function () {
        Route::get('dashboard', [CustomerDashboardController::class, 'index'])->name('dashboard');
        Route::post('customer/cart', [CustomerCartController::class, 'store'])->name('customer.cart.store');
        Route::patch('customer/cart/{product}', [CustomerCartController::class, 'update'])->name('customer.cart.update');
        Route::delete('customer/cart/{product}', [CustomerCartController::class, 'destroy'])->name('customer.cart.destroy');
        Route::post('customer/cart/checkout', [CustomerCartController::class, 'checkout'])->name('customer.cart.checkout');
        Route::patch('customer/orders/{order}/received', [CustomerDashboardController::class, 'markOrderReceived'])->name('customer.orders.received');
        Route::patch('customer/orders/{order}/cancel', [CustomerDashboardController::class, 'cancelOrder'])->name('customer.orders.cancel');
        Route::delete('customer/orders/{order}', [CustomerDashboardController::class, 'cancelOrDeleteOrder'])->name('customer.orders.destroy');

        Route::post('support/tickets', [SupportController::class, 'createTicket'])->name('support.tickets.store');
    });

    Route::middleware('role:seller')->group(function () {
        Route::get('seller/dashboard', [SellerDashboardController::class, 'index'])->name('seller.dashboard');
        Route::get('seller/products/create', [SellerProductController::class, 'create'])->name('seller.products.create');
        Route::post('seller/products', [SellerProductController::class, 'store'])->name('seller.products.store');
        Route::get('seller/products/{product}/edit', [SellerProductController::class, 'edit'])->name('seller.products.edit');
        Route::put('seller/products/{product}', [SellerProductController::class, 'update'])->name('seller.products.update');
        Route::delete('seller/products/{product}', [SellerProductController::class, 'destroy'])->name('seller.products.destroy');
        Route::put('seller/orders/{order}/status', [SellerOrderController::class, 'updateStatus'])->name('seller.orders.status');
        Route::patch('seller/orders/{order}/archive', [SellerOrderController::class, 'archive'])->name('seller.orders.archive');
        Route::patch('seller/orders/{order}/unarchive', [SellerOrderController::class, 'unarchive'])->name('seller.orders.unarchive');
        Route::delete('seller/orders/{order}', [SellerOrderController::class, 'destroy'])->name('seller.orders.destroy');
        Route::post('seller/payments/{payment}/verify', [SellerPaymentController::class, 'verify'])->name('seller.payments.verify');
        Route::post('seller/payments/{payment}/reject', [SellerPaymentController::class, 'reject'])->name('seller.payments.reject');
    });

    Route::middleware('role:super_admin')->group(function () {
        Route::get('admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
        Route::post('admin/products/{product}/approve', [AdminDashboardController::class, 'approveProduct'])->name('admin.products.approve');
        Route::post('admin/products/{product}/reject', [AdminDashboardController::class, 'rejectProduct'])->name('admin.products.reject');
        Route::post('admin/payments/{payment}/verify', [AdminDashboardController::class, 'verifyPayment'])->name('admin.payments.verify');
        Route::post('admin/payments/{payment}/reject', [AdminDashboardController::class, 'rejectPayment'])->name('admin.payments.reject');
        Route::patch('admin/payments/{payment}/archive', [AdminDashboardController::class, 'archivePayment'])->name('admin.payments.archive');
        Route::patch('admin/payments/{payment}/unarchive', [AdminDashboardController::class, 'unarchivePayment'])->name('admin.payments.unarchive');
        Route::delete('admin/payments/{payment}', [AdminDashboardController::class, 'destroyPayment'])->name('admin.payments.destroy');
        Route::post('admin/tickets/{ticket}/resolve', [AdminDashboardController::class, 'resolveTicket'])->name('admin.tickets.resolve');
        Route::delete('admin/tickets/{ticket}', [AdminDashboardController::class, 'destroyTicket'])->name('admin.tickets.destroy');

        Route::get('admin/users', [AdminUserController::class, 'index'])->name('admin.users.index');
    });
});

require __DIR__.'/settings.php';
