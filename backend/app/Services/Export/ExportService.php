<?php

namespace App\Services\Export;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use League\Csv\Writer;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportService
{
    /**
     * @param  Collection<int, array<string, mixed>>  $rows  flattened rows keyed by column key
     * @param  array<string, string>  $columns  column key => display label, in export order
     */
    public function csv(Collection $rows, array $columns, string $filename): StreamedResponse
    {
        $csv = Writer::createFromString('');
        $csv->insertOne(array_values($columns));

        foreach ($rows as $row) {
            $csv->insertOne(array_map(fn (string $key) => (string) ($row[$key] ?? ''), array_keys($columns)));
        }

        return response()->streamDownload(function () use ($csv): void {
            echo $csv->toString();
        }, "{$filename}.csv", ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $rows
     * @param  array<string, string>  $columns
     */
    public function pdf(Collection $rows, array $columns, string $filename, string $title): Response
    {
        $pdf = Pdf::loadView('exports.table', [
            'rows' => $rows,
            'columns' => $columns,
            'title' => $title,
        ])->setPaper('a4', 'landscape');

        return $pdf->download("{$filename}.pdf");
    }
}
