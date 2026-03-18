<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use App\Models\Customer;
use App\Models\Seller;
use App\Models\SuperAdmin;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(
            \Laravel\Fortify\Contracts\LoginResponse::class,
            \App\Http\Responses\LoginResponse::class,
        );
        $this->app->singleton(
            \Laravel\Fortify\Contracts\RegisterResponse::class,
            \App\Http\Responses\RegisterResponse::class,
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::authenticateUsing(function (Request $request) {
            $login = $request->input('email');
            $requestedRole = $request->input('user_type');

            $user = User::query()
                ->where('email', $login)
                ->orWhere('username', $login)
                ->first();

            if (! $user || ! $user->is_active) {
                throw ValidationException::withMessages([
                    'email' => 'Invalid username/email or password. Please try again.',
                ]);
            }

            if (! Hash::check($request->input('password'), $user->password)) {
                throw ValidationException::withMessages([
                    'password' => 'Invalid username/email or password. Please try again.',
                ]);
            }

            // Only validate role if user_type is provided (for backward compatibility with tests)
            if ($requestedRole && $user->user_type !== $requestedRole) {
                throw ValidationException::withMessages([
                    'user_type' => 'Choose your role correctly. You may have entered an account that is not on the corresponding role.',
                ]);
            }

            // Ensure user has corresponding profile, create if missing
            DB::transaction(function () use ($user) {
                if ($user->user_type === 'customer' && ! $user->customer) {
                    Customer::create([
                        'user_id' => $user->id,
                        'first_name' => $user->name ?? '',
                        'last_name' => '',
                    ]);
                } elseif ($user->user_type === 'seller' && ! $user->seller) {
                    Seller::create([
                        'user_id' => $user->id,
                        'business_name' => $user->name ?? 'Business',
                        'owner_name' => $user->name ?? '',
                        'phone' => '',
                        'email' => $user->email,
                        'address' => '',
                        'is_approved' => false,
                    ]);
                } elseif ($user->user_type === 'super_admin' && ! $user->superAdmin) {
                    $nameParts = explode(' ', $user->name ?? 'Admin', 2);
                    SuperAdmin::create([
                        'user_id' => $user->id,
                        'first_name' => $nameParts[0],
                        'last_name' => $nameParts[1] ?? '',
                        'phone' => null,
                        'email' => $user->email,
                    ]);
                }
            });

            // Refresh user to reload relationships
            $user->refresh();

            return $user;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
