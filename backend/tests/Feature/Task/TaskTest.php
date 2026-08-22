<?php

namespace Tests\Feature\Task;

use App\Enums\TaskStatus;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    private function actingUser(): void
    {
        $user = User::factory()->create();
        $this->withHeader('Authorization', 'Bearer '.auth('api')->login($user));
    }

    public function test_guest_cannot_list_tasks(): void
    {
        $this->getJson('/api/v1/tasks')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_tasks_paginated(): void
    {
        $this->actingUser();
        Task::factory(12)->create();

        $response = $this->getJson('/api/v1/tasks?per_page=10');

        $response->assertOk()->assertJsonCount(10, 'data.items')->assertJsonPath('data.meta.total', 12);
    }

    public function test_status_filter_narrows_results(): void
    {
        $this->actingUser();
        Task::factory(3)->create(['status' => TaskStatus::Pendiente]);
        Task::factory(2)->create(['status' => TaskStatus::Completada]);

        $response = $this->getJson('/api/v1/tasks?filter[status]=completada');

        $response->assertOk()->assertJsonCount(2, 'data.items');
    }

    public function test_authenticated_user_can_create_a_task(): void
    {
        $this->actingUser();

        $payload = [
            'title' => 'Llamar al cliente para confirmar visita',
            'due_date' => now()->addDays(2)->toDateString(),
            'status' => TaskStatus::Pendiente->value,
        ];

        $response = $this->postJson('/api/v1/tasks', $payload);

        $response->assertCreated()->assertJsonPath('data.title', $payload['title']);
        $this->assertDatabaseHas('tasks', ['title' => $payload['title']]);
    }

    public function test_create_requires_mandatory_fields(): void
    {
        $this->actingUser();

        $this->postJson('/api/v1/tasks', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'status']);
    }

    public function test_authenticated_user_can_complete_a_task(): void
    {
        $this->actingUser();
        $task = Task::factory()->create(['status' => TaskStatus::Pendiente]);

        $response = $this->putJson("/api/v1/tasks/{$task->id}", [
            'title' => $task->title,
            'status' => TaskStatus::Completada->value,
        ]);

        $response->assertOk()->assertJsonPath('data.status', TaskStatus::Completada->value);
    }

    public function test_authenticated_user_can_delete_a_task(): void
    {
        $this->actingUser();
        $task = Task::factory()->create();

        $this->deleteJson("/api/v1/tasks/{$task->id}")->assertOk();

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_can_export_tasks_as_csv(): void
    {
        $this->actingUser();
        Task::factory(3)->create();

        $response = $this->get('/api/v1/tasks/export?format=csv');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }
}
