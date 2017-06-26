var str_to_time=function(str){
        var num=parseInt(str);
        var unit=str.charAt(str.length-1);
        if( unit == 'Y' || unit == 'y') return num;
        if( unit == 'M' || unit == 'm') return num/12;
        if( unit == 'W' || unit == 'w') return num/52;
        if( unit == 'D' || unit == 'd') return num/365;
        console.log('str_to_time: Invalid time string' + str);
        return null;
}

var get_const_curve=function(value){
        return {labels: ["1Y"],times: [1], values: [value]};
}

var get_rate=function(curve,t,imin,imax){
        if (null==imin) imin=0;
        if (null==imax) imax=curve.times.length-1;
        //found exact time
        if (imin==imax) return curve.values[imin];
        //linear interpolation
        if (imin+1==imax) return curve.values[imin]*(curve.times[imax]-t)/(curve.times[imax]-curve.times[imin])+curve.values[imax]*(t-curve.times[imin])/(curve.times[imax]-curve.times[imin]);
        //constant extrapolation
        if (t<curve.times[imin]) return curve.values[imin];
        if (t>curve.times[imax]) return curve.values[imax];
        //binary search and recursion
        imed=Math.ceil((imin+imax)/2);
        if (t>curve.times[imed]) return get_rate(curve,t,imed,imax);
        return get_rate(curve,t,imin,imed);
}

var get_fwd_amount=function(curve,tstart,tend){
        return Math.pow((1+get_rate(curve,tstart)),-tstart) / Math.pow((1+get_rate(curve,tend)),-tend) -1;
}
