using GOE.Catalog.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GOE.Catalog.Api;

[ApiController]
[Route("api/catalog")]
public class CatalogController : ControllerBase
{
    private readonly ICatalogDbContext _db;

    public CatalogController(ICatalogDbContext db) => _db = db;

    /// <summary>List products with optional search and pagination.</summary>
    [HttpGet("products")]
    public async Task<IActionResult> ListProducts(
        [FromQuery] string? search,
        [FromQuery] int? categoryId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int page = 0,
        [FromQuery] int size = 20,
        CancellationToken ct = default)
    {
        var query = _db.Products
            .Include(p => p.ProductCategories)
            .Where(p => p.Published && !p.Deleted);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search) || p.Sku.Contains(search));

        if (categoryId.HasValue)
            query = query.Where(p => p.ProductCategories.Any(pc => pc.CategoryId == categoryId));

        if (minPrice.HasValue) query = query.Where(p => p.Price >= minPrice.Value);
        if (maxPrice.HasValue) query = query.Where(p => p.Price <= maxPrice.Value);

        var total = await query.CountAsync(ct);
        var items = await query.Skip(page * size).Take(size).ToListAsync(ct);

        return Ok(new { total, page, size, items });
    }

    /// <summary>Get a single product by slug or id.</summary>
    [HttpGet("products/{slug}")]
    public async Task<IActionResult> GetProduct(string slug, CancellationToken ct)
    {
        Product? product;
        if (int.TryParse(slug, out var id))
            product = await _db.Products.FindAsync(new object[] { id }, ct);
        else
            product = await _db.Products.FirstOrDefaultAsync(p => p.Slug == slug, ct);

        return product is null ? NotFound() : Ok(product);
    }

    /// <summary>List categories.</summary>
    [HttpGet("categories")]
    public async Task<IActionResult> ListCategories(CancellationToken ct)
    {
        var categories = await _db.Categories
            .Where(c => c.Published && !c.Deleted)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync(ct);
        return Ok(categories);
    }
}

/// <summary>EF Core DbContext interface for testability.</summary>
public interface ICatalogDbContext
{
    DbSet<Product> Products { get; }
    DbSet<Category> Categories { get; }
}
