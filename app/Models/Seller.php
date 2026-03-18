<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Seller extends Model
{
    use HasFactory;

    protected $primaryKey = 'seller_id';

    protected $fillable = [
        'user_id',
        'business_name',
        'owner_name',
        'phone',
        'email',
        'address',
        'is_approved',
        'approval_date',
    ];

    protected function casts(): array
    {
        return [
            'is_approved' => 'boolean',
            'approval_date' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'seller_id', 'seller_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'seller_id', 'seller_id');
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class, 'seller_id', 'seller_id');
    }
}
