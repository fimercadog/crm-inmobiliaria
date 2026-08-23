<?php

namespace App\Services\Property;

use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PropertyImageService
{
    public function upload(Property $property, UploadedFile $file, ?string $alt): PropertyImage
    {
        $path = $file->store('property-images', 'public');
        $isFirst = ! $property->images()->exists();

        return $property->images()->create([
            'path' => $path,
            'alt' => $alt,
            'sort_order' => ($property->images()->max('sort_order') ?? -1) + 1,
            'is_cover' => $isFirst,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(PropertyImage $image, array $data): PropertyImage
    {
        if (! empty($data['is_cover'])) {
            $image->property->images()->where('id', '!=', $image->id)->update(['is_cover' => false]);
        }

        $image->update($data);

        return $image;
    }

    public function delete(PropertyImage $image): void
    {
        Storage::disk('public')->delete($image->path);
        $wasCover = $image->is_cover;
        $property = $image->property;

        $image->delete();

        if ($wasCover) {
            $next = $property->images()->orderBy('sort_order')->first();
            $next?->update(['is_cover' => true]);
        }
    }
}
