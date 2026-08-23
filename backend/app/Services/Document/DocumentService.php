<?php

namespace App\Services\Document;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class DocumentService
{
    public function forSubject(Request $request): Collection
    {
        return Document::query()
            ->where('subject_type', $request->string('subject_type')->value())
            ->where('subject_id', $request->integer('subject_id'))
            ->with('uploadedBy')
            ->latest()
            ->get();
    }

    public function upload(UploadedFile $file, string $subjectType, int $subjectId, ?int $uploadedBy): Document
    {
        $path = $file->store('documents', 'local');

        return Document::create([
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'uploaded_by' => $uploadedBy,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
        ]);
    }

    public function delete(Document $document): void
    {
        Storage::disk('local')->delete($document->path);
        $document->delete();
    }
}
