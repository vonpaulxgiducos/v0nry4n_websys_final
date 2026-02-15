<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
