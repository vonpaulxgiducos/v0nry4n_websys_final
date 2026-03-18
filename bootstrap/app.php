<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\LoadUserRelationships;
use App\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Only exclude cookies that should NOT be encrypted (appearance preference, UI state)
        // XSRF-TOKEN will be set automatically by VerifyCsrfToken middleware
        // laravel-session SHOULD be encrypted for security
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Use custom VerifyCsrfToken that properly handles Inertia
        $middleware->replace(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class, VerifyCsrfToken::class);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            LoadUserRelationships::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
