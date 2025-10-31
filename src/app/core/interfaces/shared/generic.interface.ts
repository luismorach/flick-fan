export interface PaginatedData<R> {
    results: R[];
    page: number;
    total_pages: number;
    total_results: number
    type: string
}