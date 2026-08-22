<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\Lead;
use App\Models\Opportunity;
use App\Models\Property;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

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
        ]);
    }
}
