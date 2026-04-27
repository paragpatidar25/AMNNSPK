// Ref: https://docs.nopcommerce.com/en/index.html — Guest Checkout + nopCommerce CheckoutService
using GOE.Order.Application.Commands;
using GOE.Pricing.Domain.Services;
using GOE.Shared.Results;
using MediatR;

namespace GOE.Order.Application.Services;

/// <summary>
/// Orchestrates the full checkout flow: price calculation → order placement → payment initiation.
/// Supports guest checkout (nopCommerce pattern).
/// </summary>
public class CheckoutService
{
    private readonly ISender _mediator;
    private readonly IPriceCalculationService _pricing;

    public CheckoutService(ISender mediator, IPriceCalculationService pricing)
    {
        _mediator = mediator;
        _pricing  = pricing;
    }

    public async Task<Result<int>> CheckoutAsync(CheckoutRequest request, CancellationToken ct = default)
    {
        // 1. Recalculate prices server-side to prevent manipulation
        var lines = new List<OrderLineRequest>();
        foreach (var item in request.CartItems)
        {
            var priceResult = await _pricing.CalculateAsync(new PriceCalculationRequest(
                ProductId:    item.ProductId,
                BasePrice:    item.ListedPrice,
                Quantity:     item.Quantity,
                CustomerId:   request.CustomerId,
                CustomerRoles: request.CustomerRoles,
                CurrencyCode: request.CurrencyCode,
                CouponCode:   request.CouponCode,
                IsTaxIncluded: true,
                StoreId:      request.StoreId), ct);

            lines.Add(new OrderLineRequest(
                item.ProductId,
                item.Quantity,
                priceResult.FinalPrice,
                item.AttributesJson));
        }

        // 2. Place order
        var placeResult = await _mediator.Send(new PlaceOrderCommand(
            request.CustomerId,
            request.StoreId,
            request.IsGuest,
            request.BillingAddressJson,
            request.ShippingAddressJson,
            request.ShippingMethod,
            request.PaymentMethodSystemName,
            request.CurrencyCode,
            lines), ct);

        return placeResult;
    }
}

public record CheckoutRequest(
    int CustomerId,
    int StoreId,
    bool IsGuest,
    string BillingAddressJson,
    string? ShippingAddressJson,
    string? ShippingMethod,
    string PaymentMethodSystemName,
    string CurrencyCode,
    string? CouponCode,
    IReadOnlyList<string> CustomerRoles,
    IReadOnlyList<CartItemRequest> CartItems);

public record CartItemRequest(int ProductId, int Quantity, decimal ListedPrice, string? AttributesJson);
