var Bond=function(notional, maturity, coupon, freq_str, ref_curve, coupon_spread){
        this._notional=notional;
        this._maturity=maturity;        
        this._coupon=coupon;
        this._freq=str_to_time(freq_str);
        this._ref_curve=ref_curve;
        this._coupon_spread=coupon_spread;
        
        this._is_floater= (null==this._ref_curve) ? false : true;
        
}


Bond.prototype.dirty_value=function(valdate,curves,spread){

        var t=(this._maturity-valdate)  / (1000*60*60*24*365);

        //to do: add zero coupon rate of curves
        var df=Math.pow(1+spread,-t);
        
        var cp_amount=0;
        if (this._is_floater){
                //to do: handle floaters
        }
        else{
                cp_amount=this._coupon*this._freq*this._notional;
        }
        
        var res=(this._notional+cp_amount)*df;
        
        while (t>this._freq){
                t-=this._freq;
                
                if (this._is_floater){
                        //to do: handle floaters
                }
                
                //to do: add zero coupon rate of curves
                var df=Math.pow(1+spread,-t);
                res+=cp_amount*df;
        }
        return res;
}


Bond.prototype.ytm=function(valdate,dirty_value){
        return 0;
}

Bond.prototype.z_spread=function(valdate,dirty_value,curves){
        return 0;
}

function str_to_time(str){
        var num=parseInt(str);
        var unit=str.charAt(str.length-1);
        if( unit == 'Y' || unit == 'y') return num;
        if( unit == 'M' || unit == 'm') return num/12;
        if( unit == 'W' || unit == 'w') return num/52;
        if( unit == 'D' || unit == 'd') return num/365;
        console.log('str_to_time: Invalid time string' + str);
        return null;
}
