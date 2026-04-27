import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

type ProductForm = {
    name: string;
    description: string;
    category: string;
    price: string;
    stock: string;
    image: File | null;
};

const categories = [
    'Guitars',
    'Keyboards',
    'Drums',
    'Accessories',
    'Music Sheets',
    'Music Books',
];

export default function SellerCreateProduct() {
    const { data, setData, post, processing, errors } = useForm<ProductForm>({
        name: '',
        description: '',
        category: 'Guitars',
        price: '',
        stock: '',
        image: null,
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/seller/products', { forceFormData: true });
    };

    return (
        <>
            <Head title="Add Product" />
            <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
                <div className="mx-auto w-full max-w-3xl px-6 py-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Add Product</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Create a new product listing for your store.
                            </p>
                        </div>
                        <Link
                            href="/seller/dashboard"
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                            Back to Dashboard
                        </Link>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                    >
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                Product Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:focus:border-indigo-500"
                                placeholder="e.g. Yamaha F310 Acoustic Guitar"
                                required
                            />
                            {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="description" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:focus:border-indigo-500"
                                placeholder="Write product details"
                            />
                            {errors.description && (
                                <p className="text-xs text-rose-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <label htmlFor="category" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={data.category}
                                    onChange={(event) => setData('category', event.target.value)}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:focus:border-indigo-500"
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="text-xs text-rose-600">{errors.category}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="price" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Price (PHP)
                                </label>
                                <input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(event) => setData('price', event.target.value)}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:focus:border-indigo-500"
                                    placeholder="0.00"
                                    required
                                />
                                {errors.price && <p className="text-xs text-rose-600">{errors.price}</p>}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <label htmlFor="stock" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Stock
                                </label>
                                <input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.stock}
                                    onChange={(event) => setData('stock', event.target.value)}
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:focus:border-indigo-500"
                                    placeholder="0"
                                    required
                                />
                                {errors.stock && <p className="text-xs text-rose-600">{errors.stock}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label htmlFor="image" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Product Image (optional)
                                </label>
                                <input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        setData('image', event.target.files?.[0] ?? null)
                                    }
                                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white outline-none focus:border-indigo-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:file:bg-indigo-600 dark:focus:border-indigo-500"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Upload JPG, PNG, GIF, or WEBP (max 5MB).
                                </p>
                                {errors.image && (
                                    <p className="text-xs text-rose-600">{errors.image}</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                            >
                                {processing ? 'Saving...' : 'Submit Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
