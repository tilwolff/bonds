var g_method_exact=true;

var initialize=function(){
        update_dirty_value();
}

var get_bond_from_gui=function(){
        //get data from html form
        var notional = document.getElementById("notional").value;
        var maturity = document.getElementById("maturity").value;
        var coupon = document.getElementById("coupon").value;
        var freq = document.getElementById("freq").value;
        var is_floater = document.getElementById("is_floater").value;
        var current_fixing = document.getElementById("current_fixing").value;
        
        //convert strings
        notional=parseFloat(notional);
        coupon=(""==coupon) ? 0 : parseFloat(coupon)/100;
        current_fixing=(""==current_fixing) ? 0 : parseFloat(current_fixing)/100;
        is_floater=("Yes"==is_floater);
        
        var regxp=/(\d\d\d\d)\D{0,1}(\d\d)\D{0,1}(\d\d)\D{0,1}/
        var regxp_result=regxp.exec(maturity);
        
        maturity=new Date(regxp_result[1],regxp_result[2]-1,regxp_result[3],0,0,0);
        
        return new Bond(notional,maturity,coupon,freq,is_floater,current_fixing, null);
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
        var dirty_value=b.dirty_value(val_date,null,null,null,ytm);
        document.getElementById("dirty_value").value=Math.round(dirty_value*100)/100;
        risk_analysis(b);
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
        risk_analysis(b);
}

var display_risk=function(f,s){
        //risk figures
        document.getElementById("ttm").innerHTML=f.ttm.toFixed(2)+ " Years";
        document.getElementById("ir_duration").innerHTML=f.ir_duration.toFixed(2);
        document.getElementById("spread_duration").innerHTML=f.spread_duration.toFixed(2);
        document.getElementById("bpv").innerHTML=(Math.round((f.bpv * 1000)/10)/100).toLocaleString();
        
        //risk scenarios
        var target_table=document.getElementById("risk");
        
        target_table.innerHTML="";

        if (0==s.length) return;
        
        var max_diff=0;
        //find max abs percentage
        for (var i=0;i<s.length;i++){
                max_diff=Math.max(max_diff, Math.abs(s[i].diff_bp));
        }
        
        // create  a <tbody>
        var tblBody=document.createElement("tbody");
        
        // create header
        var row = document.createElement("tr");
        var cell = document.createElement("th");    
        cell.innerHTML="Scenario";
        row.appendChild(cell);
        
        cell = document.createElement("th");   
        cell.className="text-right"; 
        cell.innerHTML="Value Change (exact)";
        row.appendChild(cell);
        
        cell = document.createElement("th");    
        cell.innerHTML="Value Change (approx. via eff. duration)";
        cell.className="text-right";
        row.appendChild(cell);
        
        cell = document.createElement("th");    
        cell.innerHTML="Difference [bp]";
        row.appendChild(cell);
        
        tblBody.appendChild(row);
        
        var progress;
        var progressbar;
              
        // cells creation
        for (var i=0;i<s.length;i++){
                // table row creation
                row = document.createElement("tr");

                cell = document.createElement("td");
                cell.innerHTML=s[i].description;
                row.appendChild(cell);
                
                cell = document.createElement("td");
                cell.innerHTML=(Math.round((s[i].value_change_exact * 1000)/10)/100).toLocaleString();
                cell.style.textAlign = "right";
                row.appendChild(cell);
                
                cell = document.createElement("td");
                cell.innerHTML=(Math.round((s[i].value_change_approx * 1000)/10)/100).toLocaleString();
                cell.style.textAlign = "right";
                row.appendChild(cell);
                
                cell = document.createElement("td");
                progress=document.createElement("div");
                progress.className="progress";
                progress.style.backgroundColor="#888888";
                progress.style.backgroundImage="none";
                progressbar=document.createElement("div");
                progressbar.className="progress-bar";
                progressbar.setAttribute("role", "progressbar"); 
                progressbar.innerHTML=s[i].diff_bp.toFixed(2);

                progressbar.className+=" progress-bar-danger";
                progressbar.style.width = (s[i].diff_bp/max_diff*100).toFixed(2)+"%";
                
                
                progress.appendChild(progressbar);                
                cell.appendChild(progress); 
                row.appendChild(cell);

                //row added to end of table body
                tblBody.appendChild(row);
        }
        target_table.appendChild(tblBody);

}

var risk_analysis=function(b){

        //get data from html form        
        var val_date = document.getElementById("val_date").value;
        var dirty_value = document.getElementById("dirty_value").value;
        
        //convert strings
        dirty_value=parseFloat(dirty_value);
        
        var regxp=/(\d\d\d\d)\D{0,1}(\d\d)\D{0,1}(\d\d)\D{0,1}/
        var regxp_result=regxp.exec(val_date);
        
        val_date=new Date(regxp_result[1],regxp_result[2]-1,regxp_result[3],0,0,0);

        //calculate yield
        var ytm=b.ytm(val_date,null,dirty_value);
        
        //calculate basic risk figures
        var curve_1_plus=get_const_curve(0.0001);
        var curve_1_minus=get_const_curve(-0.0001);
        //effective ir duration
        var ir_dur=b.dirty_value(val_date,curve_1_minus,null,curve_1_minus,ytm) - b.dirty_value(val_date,curve_1_plus,null,curve_1_plus,ytm);
        ir_dur=ir_dur/dirty_value*5000;
        //effective spread duration
        var spread_dur=b.dirty_value(val_date,curve_1_minus,null,null,ytm) - b.dirty_value(val_date,curve_1_plus,null,null,ytm);
        spread_dur=spread_dur/dirty_value*5000;
        var bpv=b.dirty_value(val_date,curve_1_plus,null,null,ytm) - b.dirty_value(val_date,curve_1_minus,null,null,ytm);
        bpv/=2;
        
        //present value of a spread basis point
        var figures={
                ttm: (b._maturity-val_date)  / (1000*60*60*24*365),
                ir_duration: ir_dur,
                spread_duration: spread_dur,
                bpv: bpv
        };
        
        
        //create bcbs 352 scenarios
        var bcbs352times=[0.0028,0.0417,0.1667,0.375,0.625,0.875,1.25,1.75,2.5,3.5,4.5,5.5,6.5,7.5,8.5,9.5,12.5,17.5,25];
        
        var curve_up={labels:[],times:bcbs352times,values:[]};
        var curve_down={labels:[],times:bcbs352times,values:[]};
        var curve_steepener={labels:[],times:bcbs352times,values:[]};
        var curve_flattener={labels:[],times:bcbs352times,values:[]};
        var curve_shortup={labels:[],times:bcbs352times,values:[]};
        var curve_shortdown={labels:[],times:bcbs352times,values:[]};
        
        var slong,sshort;
        for (var i=0;i<bcbs352times.length;i++){
                curve_up.values.push(0.02);
                curve_down.values.push(-0.02);
                sshort=Math.exp(-bcbs352times[i]/4);
                slong=1-sshort;
                curve_shortup.values.push(0.025*sshort);
                curve_shortdown.values.push(-0.025*sshort);
                curve_steepener.values.push(-0.65*0.025*sshort+0.9*0.01*slong);
                curve_flattener.values.push(0.8*0.025*sshort-0.6*0.01*slong);
        }
        
        var b_ir_dur=new Bond(dirty_value*Math.pow(1+ytm,ir_dur),new Date(val_date.getTime()+ir_dur*(1000*60*60*24*365)),0,"1Y",false,0, null);
        var b_spread_dur=new Bond(dirty_value*Math.pow(1+ytm,spread_dur),new Date(val_date.getTime()+spread_dur*(1000*60*60*24*365)),0,"1Y",false,0, null);
        
        var scenarios=[
                {
                        description: "Interest Rate BCBS 368 Up",
                        value_exact: b.dirty_value(val_date,curve_up,null,curve_up,ytm),
                        value_approx: b_ir_dur.dirty_value(val_date,curve_up,null,curve_up,ytm)
                },{
                        description: "Interest Rate BCBS 368 Down",
                        value_exact: b.dirty_value(val_date,curve_down,null,curve_down,ytm),
                        value_approx: b_ir_dur.dirty_value(val_date,curve_down,null,curve_down,ytm)
                },{
                        description: "Interest Rate BCBS 368 Steepener",
                        value_exact: b.dirty_value(val_date,curve_steepener,null,curve_steepener,ytm),
                        value_approx: b_ir_dur.dirty_value(val_date,curve_steepener,null,curve_steepener,ytm)
                },{
                        description: "Interest Rate BCBS 368 Flattener",
                        value_exact: b.dirty_value(val_date,curve_flattener,null,curve_flattener,ytm),
                        value_approx: b_ir_dur.dirty_value(val_date,curve_flattener,null,curve_flattener,ytm)
                },{
                        description: "Interest Rate BCBS 368 Short Rate Up",
                        value_exact: b.dirty_value(val_date,curve_shortup,null,curve_shortup,ytm),
                        value_approx: b_ir_dur.dirty_value(val_date,curve_shortup,null,curve_shortup,ytm)
                },{
                        description: "Interest Rate BCBS 368 Short Rate Down",
                        value_exact: b.dirty_value(val_date,curve_shortdown,null,curve_shortdown,ytm),
                        value_approx: b_ir_dur.dirty_value(val_date,curve_shortdown,null,curve_shortdown,ytm)
                },{
                        description: "Spread Shock +1 bp",
                        value_exact: b.dirty_value(val_date,null,null,null,ytm+0.0001),
                        value_approx: b_spread_dur.dirty_value(val_date,null,null,null,ytm+0.0001)
                },{
                        description: "Spread Shock +50 bp",
                        value_exact: b.dirty_value(val_date,null,null,null,ytm+0.005),
                        value_approx: b_spread_dur.dirty_value(val_date,null,null,null,ytm+0.005)
                },{
                        description: "Spread Shock +100 bp",
                        value_exact: b.dirty_value(val_date,null,null,null,ytm+0.01),
                        value_approx: b_spread_dur.dirty_value(val_date,null,null,null,ytm+0.01)
                },{
                        description: "Spread Shock +200 bp",
                        value_exact: b.dirty_value(val_date,null,null,null,ytm+0.02),
                        value_approx: b_spread_dur.dirty_value(val_date,null,null,null,ytm+0.02)
                },{
                        description: "Spread Shock +500 bp",
                        value_exact: b.dirty_value(val_date,null,null,null,ytm+0.05),
                        value_approx: b_spread_dur.dirty_value(val_date,null,null,null,ytm+0.05)
                },{
                        description: "Spread Shock +1000 bp",
                        value_exact: b.dirty_value(val_date,null,null,null,ytm+0.1),
                        value_approx: b_spread_dur.dirty_value(val_date,null,null,null,ytm+0.1)
                }
        ];
        
        for (var i=0;i<scenarios.length;i++){
                scenarios[i].value_change_exact=(scenarios[i].value_exact-dirty_value);
                scenarios[i].value_change_approx=(scenarios[i].value_approx-dirty_value);
                scenarios[i].diff_bp=Math.abs(scenarios[i].value_change_exact-scenarios[i].value_change_approx)/Math.abs(bpv);
                
        }
        
        display_risk(figures,scenarios);
}

var isin_search=function(){
        var isin = document.getElementById("isin").value;
        isin=isin.toUpperCase();
        var callb=function(results,file){
                
                if (0==results.data.length){
                        make_alert("danger", "Query failed or no bond with ISIN <strong>"+isin+"</strong> found");
                        return;
                }
                
                                
                if ("undefined"==typeof(results.data[0].MATURITY_DATE) || "undefined"==typeof(results.data[0].COUPON_RATE) || "undefined"==typeof(results.data[0].COUPON_DEFINITION)){
                        make_alert("danger", "Query failed or no bond with ISIN <strong>"+isin+"</strong> found");
                        return;
                }
        
                //get data from returned object
                var maturity = results.data[0].MATURITY_DATE;
                var coupon = results.data[0].COUPON_RATE;
                var is_floater = results.data[0].COUPON_DEFINITION;
                
                //convert formats
                maturity=maturity.substring(6,10)+"-"+maturity.substring(3,5)+"-"+maturity.substring(0,2);
                coupon=parseFloat(coupon);
                is_floater=(is_floater=="CD2") ? "Yes" : "No";
                
                //write to html form
                document.getElementById("notional").value=100;
                document.getElementById("maturity").value=maturity;
                document.getElementById("coupon").value=coupon;
                document.getElementById("freq").value="1Y";
                document.getElementById("is_floater").value=is_floater;
                document.getElementById("current_fixing").value=0;
                document.getElementById("ytm").value=0;
                
                var success_msg="Found bond with ISIN <strong>"+isin+"</strong> from issuer <strong>"+results.data[0].ISSUER_NAME+"</strong>.";
                if ("undefined"!=typeof(results.data[0].GUARANTOR_NAME)){
                        if(""!=results.data[0].GUARANTOR_NAME){
                                success_msg+=" Bond is guaranteed by <strong>"+results.data[0].GUARANTOR_NAME+"</strong>.";
                        }
                }
                make_alert("success", success_msg);
                update_dirty_value();
                
        }
        
        var pp_config={
	        header: true,
	        download: true,
        	dynamicTyping: true,
	        worker: false,
	        newline: "\r\n",
	        delimiter: "\t",
	        complete: callb
        };
        
        Papa.parse('search.php?isin=' + isin,pp_config);
}

var make_alert=function(context, html_str){
        var a=document.createElement("div");
        a.className="alert alert-dismissible alert-"+context;
        a.setAttribute("role", "alert");
        
        var b=document.createElement("button");
        b.className="close";
        b.setAttribute("data-dismiss", "alert");
        b.innerHTML="<span>&times;</span>";
        a.appendChild(b);
        a.innerHTML+=html_str;

        document.getElementById("alert-container").innerHTML="";        
        document.getElementById("alert-container").appendChild(a);
}

// start when document is loaded
$(document).ready(initialize);
