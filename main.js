
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
        var current_fixing = document.getElementById("current_fixing").value;
        
        //convert strings
        notional=parseFloat(notional);
        coupon=parseFloat(coupon)/100;
        current_fixing=parseFloat(current_fixing)/100;
        
        var regxp=/(\d\d\d\d)\D{0,1}(\d\d)\D{0,1}(\d\d)\D{0,1}/
        var regxp_result=regxp.exec(maturity);
        
        maturity=new Date(regxp_result[1],regxp_result[2]-1,regxp_result[3],0,0,0);
        
        return new Bond(notional,maturity,coupon,freq,ref_curve,current_fixing);
}

var update_dirty_value=function(){
        var b=get_bond_from_gui();

        //get data from html form
        var val_date = document.getElementById("val_date").value;
        var ytm = document.getElementById("ytm").value;
        
        //convert strings
        ytm=parseFloat(ytm)/100;
        
        var regxp=/(\d\d\d\d)\D{0,1}(\d\d)\D{0,1}(\d\d)\D{0,1}/
        var regxp_result=regxp.exec(val_date);
        
        val_date=new Date(regxp_result[1],regxp_result[2]-1,regxp_result[3],0,0,0);
        var dirty_value=b.dirty_value(val_date,null,null,ytm);
        document.getElementById("dirty_value").value=Math.round(dirty_value*100)/100;
}


var update_yield=function(){
        var b=get_bond_from_gui();

        //get data from html form
        var val_date = document.getElementById("val_date").value;
        var dirty_value = document.getElementById("dirty_value").value;
        
        //convert strings
        dirty_value=parseFloat(dirty_value);
        
        var regxp=/(\d\d\d\d)\D{0,1}(\d\d)\D{0,1}(\d\d)\D{0,1}/
        var regxp_result=regxp.exec(val_date);
        
        val_date=new Date(regxp_result[1],regxp_result[2]-1,regxp_result[3],0,0,0);
        var ytm=b.ytm(val_date,null,dirty_value);
        document.getElementById("ytm").value=Math.round(ytm*1000000)/10000;
}

// start when window is loaded
window.onload = initialize;
