// ─────────────────────────────────────────────────────────────
//  GOE — Global Order Engine  ·  ASP.NET Core 10  Entry Point
//  Ref: https://dev.smartstore.com/framework/platform/identity
//  Ref: https://docs.nopcommerce.com/en/index.html
// ─────────────────────────────────────────────────────────────
using GOE.Api;
using GOE.Api.Middleware;
using GOE.Identity.Application.Services;
using GOE.Pricing.Application;
using GOE.Pricing.Application.Calculators;
using GOE.Pricing.Domain.Services;
using GOE.Shared.Abstractions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Core Services ──────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "GOE API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
});
builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();

// ── MediatR (CQRS) ─────────────────────────────────────────────
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssemblies(AppDomain.CurrentDomain.GetAssemblies()));

// ── JWT Authentication ──────────────────────────────────────────
var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidIssuer              = jwtSection["Issuer"],
            ValidateAudience         = true,
            ValidAudience            = jwtSection["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSection["Secret"]!)),
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

// ── GOE Shared Abstractions ─────────────────────────────────────
builder.Services.AddScoped<IWorkContext, WorkContext>();
builder.Services.AddScoped<IStoreContext, StoreContext>();
builder.Services.AddScoped<IPermissionService, PermissionService>();

// ── GOE Identity Services ───────────────────────────────────────
builder.Services.AddScoped<GoeSignInManager>();
builder.Services.AddScoped<TokenService>();

// ── GOE Pricing Pipeline ────────────────────────────────────────
// Smartstore-style composable calculators — order is driven by IPriceCalculator.Order
builder.Services.AddScoped<IPriceCalculator, BasePriceCalculator>();
builder.Services.AddScoped<IPriceCalculator, TierPriceCalculator>();
builder.Services.AddScoped<IPriceCalculator, DiscountCalculator>();
builder.Services.AddScoped<IPriceCalculator, TaxCalculator>();
builder.Services.AddScoped<IPriceCalculator, CurrencyCalculator>();
builder.Services.AddScoped<IPriceCalculationService, PriceCalculationService>();

// ── Module Registration ─────────────────────────────────────────
ModuleLoader.RegisterModules(builder.Services, builder.Configuration);

// ── CORS ────────────────────────────────────────────────────────
builder.Services.AddCors(opt =>
    opt.AddDefaultPolicy(p => p
        .WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"])
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()));

var app = builder.Build();

// ── Middleware Pipeline ─────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "GOE API v1"));
}

app.UseMiddleware<InstallationGuardMiddleware>();
app.UseMiddleware<WebhookEndpointMiddleware>();
app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── Module Route Mapping ────────────────────────────────────────
ModuleLoader.MapModules(app);

app.Run();
