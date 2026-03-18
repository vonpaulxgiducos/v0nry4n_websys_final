import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

type ProductPayload = {
	id: number;
	name: string;
	description: string | null;
	category: string;
	price: string;
	stock: string;
	image_url: string | null;
};

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

export default function SellerEditProduct({ product }: { product: ProductPayload }) {
	const { data, setData, post, processing, errors } = useForm<ProductForm & { _method: 'put' }>({
		name: product.name,
		description: product.description ?? '',
		category: product.category,
		price: product.price,
		stock: product.stock,
		image: null,
		_method: 'put',
	});

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		post(`/seller/products/${product.id}`, {
			forceFormData: true,
		});
	};

	return (
		<>
			<Head title="Edit Product" />
			<div className="min-h-screen bg-slate-50 text-slate-900">
				<div className="mx-auto w-full max-w-3xl px-6 py-8">
					<div className="mb-6 flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-semibold text-slate-900">Edit Product</h1>
							<p className="text-sm text-slate-500">
								Update your product details and resubmit for approval.
							</p>
						</div>
						<Link
							href="/seller/dashboard"
							className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
						>
							Back to Dashboard
						</Link>
					</div>

					<form
						onSubmit={handleSubmit}
						className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
					>
						<div className="grid gap-2">
							<label htmlFor="name" className="text-sm font-semibold text-slate-800">
								Product Name
							</label>
							<input
								id="name"
								type="text"
								value={data.name}
								onChange={(event) => setData('name', event.target.value)}
								className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
								required
							/>
							{errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
						</div>

						<div className="grid gap-2">
							<label htmlFor="description" className="text-sm font-semibold text-slate-800">
								Description
							</label>
							<textarea
								id="description"
								rows={4}
								value={data.description}
								onChange={(event) => setData('description', event.target.value)}
								className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
							/>
							{errors.description && (
								<p className="text-xs text-rose-600">{errors.description}</p>
							)}
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="grid gap-2">
								<label htmlFor="category" className="text-sm font-semibold text-slate-800">
									Category
								</label>
								<select
									id="category"
									value={data.category}
									onChange={(event) => setData('category', event.target.value)}
									className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
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
								<label htmlFor="price" className="text-sm font-semibold text-slate-800">
									Price (PHP)
								</label>
								<input
									id="price"
									type="number"
									min="0"
									step="0.01"
									value={data.price}
									onChange={(event) => setData('price', event.target.value)}
									className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
									required
								/>
								{errors.price && <p className="text-xs text-rose-600">{errors.price}</p>}
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="grid gap-2">
								<label htmlFor="stock" className="text-sm font-semibold text-slate-800">
									Stock
								</label>
								<input
									id="stock"
									type="number"
									min="0"
									step="1"
									value={data.stock}
									onChange={(event) => setData('stock', event.target.value)}
									className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
									required
								/>
								{errors.stock && <p className="text-xs text-rose-600">{errors.stock}</p>}
							</div>

							<div className="grid gap-2">
								<label htmlFor="image" className="text-sm font-semibold text-slate-800">
									Replace Image (optional)
								</label>
								<input
									id="image"
									type="file"
									accept="image/*"
									onChange={(event) =>
										setData('image', event.target.files?.[0] ?? null)
									}
									className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
								/>
								{errors.image && <p className="text-xs text-rose-600">{errors.image}</p>}
							</div>
						</div>

						{product.image_url && (
							<div className="grid gap-2">
								<p className="text-sm font-semibold text-slate-800">Current Image</p>
								<img
									src={product.image_url}
									alt={product.name}
									className="h-40 w-56 rounded-xl border border-slate-200 object-cover"
								/>
							</div>
						)}

						<div className="pt-2">
							<button
								type="submit"
								disabled={processing}
								className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
							>
								{processing ? 'Saving...' : 'Update Product'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}

