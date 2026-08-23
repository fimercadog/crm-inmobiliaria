<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Property\StorePropertyImageRequest;
use App\Http\Requests\Property\UpdatePropertyImageRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Services\Property\PropertyImageService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class PropertyImageController extends Controller
{
    public function __construct(private readonly PropertyImageService $imageService) {}

    public function store(StorePropertyImageRequest $request, Property $property): JsonResponse
    {
        $this->authorize('update', $property);

        $image = $this->imageService->upload($property, $request->file('file'), $request->validated('alt'));

        return ApiResponse::success($this->present($image), 'Imagen cargada correctamente', Response::HTTP_CREATED);
    }

    public function update(UpdatePropertyImageRequest $request, Property $property, PropertyImage $image): JsonResponse
    {
        $this->authorize('update', $property);
        abort_unless($image->property_id === $property->id, 404);

        $this->imageService->update($image, $request->validated());

        return ApiResponse::success($this->present($image->fresh()), 'Imagen actualizada correctamente');
    }

    public function destroy(Property $property, PropertyImage $image): JsonResponse
    {
        $this->authorize('update', $property);
        abort_unless($image->property_id === $property->id, 404);

        $this->imageService->delete($image);

        return ApiResponse::success(null, 'Imagen eliminada correctamente');
    }

    /**
     * @return array<string, mixed>
     */
    private function present(PropertyImage $image): array
    {
        return [
            'id' => $image->id,
            'url' => $image->url(),
            'alt' => $image->alt,
            'sort_order' => $image->sort_order,
            'is_cover' => $image->is_cover,
        ];
    }
}
