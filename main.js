
function initialize(){
        var bond=get_bond_from_gui();
}

var get_bond_from_gui=function(){
        //get data from html form
        var notional = document.getElementById("notional").value;
        var maturity = document.getElementById("maturity").value;
        var coupon = document.getElementById("coupon").value;
        var freq = document.getElementById("freq").value;
        var ref_curve = document.getElementById("ref_curve").value;
        var coupon_spread = document.getElementById("coupon_spread").value;
        
        //unify number formats
        notional=notional.replace(",",".");
        coupon=coupon.replace(",",".");
        coupon_spread=coupon_spread.replace(",",".");
        
        //convert strings
        notional=parseFloat(notional);
        coupon=parseFloat(coupon)/100;
        coupon_spread=parseFloat(coupon_spread)/100;
        
        var regxp=/(\d\d\d\d)\D{0,1}(\d\d)\D{0,1}(\d\d)\D{0,1}/
        var regxp_result=regxp.exec(maturity);
        
        maturity=new Date(regxp_result[1],regxp_result[2]-1,regxp_result[3],0,0,0);
        
        ref_curve=null; //todo: floater
        
        return new Bond(notional,maturity,coupon,freq,ref_curve,coupon_spread);
}

var update_dirty_value=function(){
       var b=get_bond_from_gui();

        //get data from html form
        var val_date = document.getElementById("val_date").value;
        var ytm = document.getElementById("ytm").value;
        
        //unify number formats
        ytm=ytm.replace(",",".");
        
        //convert strings
        ytm=parseFloat(ytm)/100;
        
        var regxp=/(\d\d\d\d)\D{0,1}(\d\d)\D{0,1}(\d\d)\D{0,1}/
        var regxp_result=regxp.exec(val_date);
        
        val_date=new Date(regxp_result[1],regxp_result[2]-1,regxp_result[3],0,0,0);
        var dirty_value=b.dirty_value(val_date,null,ytm);
        document.getElementById("dirty_value").value=dirty_value;
}


var update_yield=function(){

}

// start when window is loaded
window.onload = initialize;
