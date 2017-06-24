var Bond=function(notional, maturity, coupon, freq_str, ref_curve_str, coupon_spread){
        this._notional=notional;
        this._maturity=maturity;        
        this._coupon=coupon;
        this._freq=str_to_time(freq_str);
        this._ref_curve_str=ref_curve_str;
        this._coupon_spread=coupon_spread;
        
        this._is_floater= (""!=this._ref_curve_str);
        
}


Bond.prototype.dirty_value=function(valdate,disc_curves,fwd_curves,spread){

        var t=(this._maturity-valdate)  / (1000*60*60*24*365);

        //to do: add zero coupon rate of curves
        var df=Math.pow(1+spread,-t);
        
        var cp_amount=this._coupon*this._freq*this._notional;
        if (this._is_floater){
                //to do: handle floaters
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


Bond.prototype.ytm=function(valdate,fwd_curves,dirty_value){
        var res=0;
        var eps=0.0001;
        var x=this.dirty_value(valdate,null,fwd_curves,res);
        var dx=0;
        var nmax=10;
        while(Math.abs(x-dirty_value)>0.00001 && nmax>0){
                dx=(this.dirty_value(valdate,null,fwd_curves,res+eps)-x)/eps;
                res+=(dirty_value-x)/dx;
                var x=this.dirty_value(valdate,null,fwd_curves,res);
                nmax--;
        }
        return res;
}

Bond.prototype.z_spread=function(valdate,dirty_value,disc_curves,fwd_curves){
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
