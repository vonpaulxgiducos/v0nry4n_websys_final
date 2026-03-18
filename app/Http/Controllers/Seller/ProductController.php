<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function create(): Response
    {
        $seller = Auth::user()?->seller;

        if (! $seller) {
            abort(403, 'Seller profile not found.');
        }

        return Inertia::render('seller/products/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $seller = Auth::user()?->seller;

        if (! $seller) {
            abort(403, 'Seller profile not found.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        $imagePath = $request->file('image')?->store('products', 'public');

        Product::create([
            'seller_id' => $seller->seller_id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'],
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'image_url' => $imagePath ? Storage::url($imagePath) : null,
            'approval_status' => 'pending',
            'is_active' => true,
        ]);

        return redirect()
            ->route('seller.dashboard', ['section' => 'products'])
            ->with('success', 'Product submitted successfully and is pending admin approval.');
    }

    public function edit(Product $product): Response
    {
        $seller = Auth::user()?->seller;

        if (! $seller || $product->seller_id !== $seller->seller_id) {
            abort(403, 'You are not allowed to edit this product.');
        }

        return Inertia::render('seller/products/edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'category' => $product->category,
                'price' => (string) $product->price,
                'stock' => (string) $product->stock,
                'image_url' => $product->image_url,
            ],
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $seller = Auth::user()?->seller;

        if (! $seller || $product->seller_id !== $seller->seller_id) {
            abort(403, 'You are not allowed to update this product.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        $imageUrl = $product->image_url;
        if ($request->hasFile('image')) {
            if ($imageUrl && str_starts_with($imageUrl, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $imageUrl));
            }

            $imagePath = $request->file('image')?->store('products', 'public');
            $imageUrl = $imagePath ? Storage::url($imagePath) : $imageUrl;
        }

        $product->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'],
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'image_url' => $imageUrl,
            'approval_status' => 'pending',
        ]);

        return redirect()
            ->route('seller.dashboard', ['section' => 'products'])
            ->with('success', 'Product updated successfully and is pending admin approval.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $seller = Auth::user()?->seller;

        if (! $seller || $product->seller_id !== $seller->seller_id) {
            abort(403, 'You are not allowed to delete this product.');
        }

        if ($product->image_url && str_starts_with($product->image_url, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $product->image_url));
        }

        $product->delete();

        return redirect()
            ->route('seller.dashboard', ['section' => 'products'])
            ->with('success', 'Product deleted successfully.');
    }
}
