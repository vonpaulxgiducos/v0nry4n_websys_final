<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        abort_unless(Auth::user()?->user_type === 'super_admin', 403);

        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->select('id', 'username', 'name', 'email', 'user_type', 'is_active', 'created_at')
                ->orderByDesc('created_at')
                ->get(),
        ]);
    }
}
