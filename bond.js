var Bond=function(notional, maturity, coupon, freq_str, is_floater, current_fixing, tags){
        this._notional=notional;
        this._maturity=maturity;        
        this._coupon=coupon;
        this._freq_str=freq_str;
        this._freq= str_to_time(freq_str);
        this._current_fixing=current_fixing;
        this._tags=tags;
        this._is_floater= is_floater;
        
        this._residual_spread=null;
        //performance increase
        this._index_disc_curve=null;
        this._index_fwd_curve=null;
}

Bond.prototype.initialise=function(pv,md){
        this._ytm=0;
}

Bond.prototype.pv=function(md){
        var disc_curve=get_disc_curve(md, this._tags);
        var spread_curve=get_spread_curve(md, this._tags);
        var fwd_curve=get_fwd_curve(md, this._tags, this._freq_str);
        return this.dirty_value(md.valdate,disc_curve, spread_curve, fwd_curve, this._residual_spread);
}

Bond.prototype.dirty_value=function(valdate,disc_curve, spread_curve, fwd_curve, spread){
        if(null==disc_curve) disc_curve=get_const_curve(0);
        if(null==spread_curve) spread_curve=get_const_curve(0);
        if(null==fwd_curve) fwd_curve=get_const_curve(0);

        var t=(this._maturity-valdate)  / (1000*60*60*24*365);
        
        var dr=get_rate(disc_curve,t);
        var sr=get_rate(spread_curve,t)
        var df=Math.pow(1+dr+sr+spread,-t);
        
        var cp_amount=this._coupon*this._freq*this._notional;
        
        var res=(this._notional+cp_amount)*df;
        
        if (this._is_floater){
                //to do: handle floaters
        }
        
        
        while (t>this._freq){
                t-=this._freq;
                
                dr=get_rate(disc_curve,t);
                sr=get_rate(spread_curve,t)
                df=Math.pow(1+dr+sr+spread,-t);
                
                res+=cp_amount*df;
                               
                if (this._is_floater){
                        //to do: handle floaters
                }
        }
        return res;
}


Bond.prototype.ytm=function(valdate,fwd_curve,dirty_value){
        var res=0;
        var eps=0.0001;
        var x=this.dirty_value(valdate,null,null,fwd_curve,res);
        var dx=0;
        var nmax=10;
        while(Math.abs(x-dirty_value)>0.00001 && nmax>0){
                dx=(this.dirty_value(valdate,null,null,fwd_curve,res+eps)-x)/eps;
                res+=(dirty_value-x)/dx;
                var x=this.dirty_value(valdate,null,null,fwd_curve,res);
                nmax--;
        }
        return res;
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
