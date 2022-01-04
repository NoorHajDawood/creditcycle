var onCoupons = false;
var onShops = false;
$("#coupons-button").click(function() {
    onCoupons = true;
    $(".profile-div").addClass("hidden");
    $("#coupons").show();
    $("#title").text("Coupons");
});
$("#back-button").click(function () {
    if (onCoupons)
    {
        onCoupons = false;
        $("#coupons").hide();
        $(".profile-div").removeClass("hidden");
        $("#title").text("Profile");
    }
    else if (onShops)
    {
        onShops = false;
        $("#shops").hide();
        $(".profile-div").removeClass("hidden");
        $("#title").text("Profile");
    }
    else
    {
        window.location.href = "./index.html"
    }
});

$("#shoplist-button").click(function() {
    onShops = true;
    $(".profile-div").addClass("hidden");
    $("#shops").show();
    $("#title").text("Shops List");
});