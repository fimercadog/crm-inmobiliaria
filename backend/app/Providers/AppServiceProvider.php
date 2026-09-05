<?php

namespace App\Providers;

use App\Models\Activity;
use App\Models\BlogPost;
use App\Models\Client;
use App\Models\Document;
use App\Models\Lead;
use App\Models\Opportunity;
use App\Models\Owner;
use App\Models\Property;
use App\Models\Task;
use App\Models\User;
use App\Models\Visit;
use App\Policies\CrmPolicy;
use App\Policies\UserPolicy;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use PHPOpenSourceSaver\JWTAuth\Http\Parser\Cookies;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Relation::enforceMorphMap([
            'client' => Client::class,
            'lead' => Lead::class,
            'opportunity' => Opportunity::class,
            'property' => Property::class,
            'owner' => Owner::class,
        ]);

        foreach ([Property::class, Owner::class, Client::class, Lead::class, Opportunity::class, Visit::class, Activity::class, Task::class, Document::class, BlogPost::class] as $model) {
            Gate::policy($model, CrmPolicy::class);
        }

        Gate::policy(User::class, UserPolicy::class);

        // Activating/deactivating contingency mode is an operational decision
        // (it puts most of the CRM in read-only for everyone), not a regular
        // CRM write — reuses the existing Admin role rather than adding a new
        // granular permission for a single gate.
        Gate::define('manage-contingency', fn (User $user): bool => $user->isAdmin());

        // jwt-auth's default parser chain only reads the Bearer header. The
        // frontend now carries the JWT in an httpOnly cookie instead (never
        // in localStorage/JS-readable storage), so the chain needs a parser
        // that knows to look there too — `decrypt_cookies` stays false in
        // config/jwt.php because Laravel's own EncryptCookies middleware
        // already decrypts it before this parser ever sees the value.
        $this->app->make('tymon.jwt.parser')->addParser(new Cookies((bool) config('jwt.decrypt_cookies')));
    }
}
