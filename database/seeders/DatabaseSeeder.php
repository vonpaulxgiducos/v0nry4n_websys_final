<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Faq;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Seller;
use App\Models\Shipment;
use App\Models\SuperAdmin;
use App\Models\SupportReply;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()
            ->whereIn('email', [
                'john_customer@music.test',
                'mia_seller@music.test',
                'zoe_admin@music.test',
            ])
            ->get()
            ->each
            ->delete();

        Faq::query()->delete();

        $customerUser = User::factory()->create([
            'name' => 'John Customer',
            'username' => 'john_customer',
            'email' => 'john_customer@music.test',
            'password' => Hash::make('password'),
            'user_type' => 'customer',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $sellerUser = User::factory()->create([
            'name' => 'Mia Seller',
            'username' => 'mia_seller',
            'email' => 'mia_seller@music.test',
            'password' => Hash::make('password'),
            'user_type' => 'seller',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $adminUser = User::factory()->create([
            'name' => 'Zoe Admin',
            'username' => 'zoe_admin',
            'email' => 'zoe_admin@music.test',
            'password' => Hash::make('password'),
            'user_type' => 'super_admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $customer = Customer::create([
            'user_id' => $customerUser->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'phone' => '+63 912 345 6789',
            'address' => '123 Main St, Brgy. Central',
            'city' => 'Manila',
            'province' => 'Metro Manila',
            'postal_code' => '1000',
        ]);

        $seller = Seller::create([
            'user_id' => $sellerUser->id,
            'business_name' => 'Music Hub Philippines',
            'owner_name' => 'Mia Santos',
            'phone' => '+63 917 222 1188',
            'email' => $sellerUser->email,
            'address' => '89 Rizal Ave, Cebu City, Cebu 6000',
            'is_approved' => true,
            'approval_date' => now(),
        ]);

        SuperAdmin::create([
            'user_id' => $adminUser->id,
            'first_name' => 'Zoe',
            'last_name' => 'Admin',
            'phone' => '+63 908 111 2233',
            'email' => $adminUser->email,
        ]);

        $seedDemoEcommerce = filter_var((string) env('SEED_DEMO_ECOMMERCE', 'false'), FILTER_VALIDATE_BOOLEAN);

        if (! $seedDemoEcommerce) {
            return;
        }

        $yamaha = Product::create([
            'seller_id' => $seller->seller_id,
            'name' => 'Yamaha F310 Acoustic Guitar',
            'description' => 'Perfect for beginners. Full-size dreadnought body with bright balanced tone.',
            'category' => 'Guitars',
            'price' => 8500,
            'stock' => 15,
            'image_url' => 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
            'approval_status' => 'approved',
            'is_active' => true,
        ]);

        $keyboard = Product::create([
            'seller_id' => $seller->seller_id,
            'name' => 'Casio CT-S300 Keyboard',
            'description' => '61-key portable keyboard with 400 tones and 77 rhythms.',
            'category' => 'Keyboards',
            'price' => 12500,
            'stock' => 12,
            'image_url' => 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=900&q=80',
            'approval_status' => 'approved',
            'is_active' => true,
        ]);

        Product::create([
            'seller_id' => $seller->seller_id,
            'name' => 'Roland TD-07 Drum Kit',
            'description' => 'Quiet electronic drum kit with mesh heads and realistic feel.',
            'category' => 'Drums',
            'price' => 38900,
            'stock' => 2,
            'image_url' => 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=900&q=80',
            'approval_status' => 'pending',
            'is_active' => true,
        ]);

        $order1 = Order::create([
            'order_number' => 'ORD-2024-00001',
            'customer_id' => $customer->customer_id,
            'seller_id' => $seller->seller_id,
            'order_date' => now()->subDays(40),
            'order_status' => 'delivered',
            'subtotal' => 8500,
            'shipping_fee' => 250,
            'total_amount' => 8750,
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => $yamaha->id,
            'item_name' => $yamaha->name,
            'quantity' => 1,
            'unit_price' => 8500,
            'line_total' => 8500,
        ]);

        Payment::create([
            'order_id' => $order1->id,
            'method' => 'GCash',
            'reference' => 'GCASH-20240207-123456',
            'amount' => 8750,
            'notes' => 'Paid via GCash',
            'status' => 'verified',
            'verified_by' => $adminUser->id,
            'verified_at' => now()->subDays(39),
        ]);

        Shipment::create([
            'order_id' => $order1->id,
            'seller_id' => $seller->seller_id,
            'tracking_number' => 'JRS-2024-001234',
            'courier' => 'JRS Express',
            'shipping_status' => 'delivered',
            'shipped_at' => now()->subDays(37),
            'delivered_at' => now()->subDays(35),
        ]);

        $order2 = Order::create([
            'order_number' => 'ORD-2024-00003',
            'customer_id' => $customer->customer_id,
            'seller_id' => $seller->seller_id,
            'order_date' => now()->subDays(20),
            'order_status' => 'pending',
            'subtotal' => 12800,
            'shipping_fee' => 300,
            'total_amount' => 13100,
        ]);

        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => $keyboard->id,
            'item_name' => $keyboard->name,
            'quantity' => 1,
            'unit_price' => 12800,
            'line_total' => 12800,
        ]);

        Payment::create([
            'order_id' => $order2->id,
            'method' => 'GCash',
            'reference' => 'GCASH-20240214-345678',
            'amount' => 13100,
            'notes' => 'Paid via GCash',
            'status' => 'pending',
        ]);

        $ticket = SupportTicket::create([
            'ticket_number' => 'TICK-2024-00001',
            'customer_id' => $customer->customer_id,
            'order_id' => $order1->id,
            'assigned_to' => $adminUser->id,
            'subject' => 'Question about guitar maintenance',
            'message' => 'How often should I change the strings for my Yamaha F310?',
            'priority' => 'medium',
            'status' => 'open',
        ]);

        SupportReply::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => $adminUser->id,
            'message' => 'For regular use, changing every 2-3 months is recommended.',
        ]);

        Faq::create([
            'question' => 'How do I place an order?',
            'answer' => 'Browse products, add item to cart, then checkout and pay.',
            'category' => 'Ordering',
            'display_order' => 1,
            'is_active' => true,
        ]);

        Faq::create([
            'question' => 'What payment methods are accepted?',
            'answer' => 'GCash and bank transfer are currently supported.',
            'category' => 'Payments',
            'display_order' => 2,
            'is_active' => true,
        ]);
    }
}
