
var initialize=function(){
        risk_analysis();
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
        coupon=parseFloat(coupon)/100;
        current_fixing=parseFloat(current_fixing)/100;
        is_floater=(is_floater=="Yes");
        
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
        risk_analysis();
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
        risk_analysis();
}

var display_scenarios=function(s){
        var target=document.getElementById("risk");
        
        target.innerHTML="";

        if (0==s.length) return;
        
        var max_perc=0;
        //find max abs percentage
        for (var i=0;i<s.length;i++){
                max_perc=Math.max(max_perc, Math.abs(s[i].percentage));
        }
        
        // create elements <table> and a <tbody>
        var tbl= document.createElement("table");
        tbl.className = "table";
        var tblBody=document.createElement("tbody");
        
        
        // create header
        var row = document.createElement("tr");
        var cell = document.createElement("th");    
        cell.innerHTML="Scenario";
        row.appendChild(cell);
        
        cell = document.createElement("th");    
        cell.innerHTML="Value Change absolute";
        row.appendChild(cell);
        
        cell = document.createElement("th");    
        cell.innerHTML="Value Change Percent";
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
                cell.innerHTML=s[i].value_change.toFixed(2);
                row.appendChild(cell);
                
                cell = document.createElement("td");
                progress=document.createElement("div");
                progress.className="progress";
                progressbar=document.createElement("div");
                progressbar.className="progress-bar";
                progressbar.setAttribute("role", "progressbar"); 
                progressbar.innerHTML=s[i].percentage.toFixed(2)+"%";
                if (s[i].percentage>0){
                progressbar.className+=" progress-bar-success";
                progressbar.style.width = (s[i].percentage/max_perc*100).toFixed(2)+"%";
                
                }else{
                progressbar.className+=" progress-bar-danger";
                progressbar.style.width = (-s[i].percentage/max_perc*100).toFixed(2)+"%";
                }
                
                
                progress.appendChild(progressbar);                
                cell.appendChild(progress); 
                row.appendChild(cell);

                //row added to end of table body
                tblBody.appendChild(row);
        }
        tbl.appendChild(tblBody);
        target.appendChild(tbl);
}

var risk_analysis=function(){
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
        
                                
                                
        var scenarios=[
                {
                        description: "Spread Shock -100 bp",
                        value: b.dirty_value(val_date,null,null,null,ytm-0.01)
                },{
                        description: "Spread Shock -1 bp",
                        value: b.dirty_value(val_date,null,null,null,ytm-0.0001)
                },{
                        description: "Spread Shock +1 bp",
                        value: b.dirty_value(val_date,null,null,null,ytm+0.0001)
                },{
                        description: "Spread Shock +100 bp",
                        value: b.dirty_value(val_date,null,null,null,ytm+0.01)
                },{
                        description: "Spread Shock +200 bp",
                        value: b.dirty_value(val_date,null,null,null,ytm+0.02)
                },{
                        description: "Spread Shock +500 bp",
                        value: b.dirty_value(val_date,null,null,null,ytm+0.05)
                },{
                        description: "Spread Shock +1000 bp",
                        value: b.dirty_value(val_date,null,null,null,ytm+0.1)
                },{
                        description: "BCBS 368 Up",
                        value: b.dirty_value(val_date,curve_up,null,curve_up,ytm)
                },{
                        description: "BCBS 368 Down",
                        value: b.dirty_value(val_date,curve_down,null,curve_down,ytm)
                },{
                        description: "BCBS 368 Steepener",
                        value: b.dirty_value(val_date,curve_steepener,null,curve_steepener,ytm)
                },{
                        description: "BCBS 368 Flattener",
                        value: b.dirty_value(val_date,curve_flattener,null,curve_flattener,ytm)
                },{
                        description: "BCBS 368 Short Rate Up",
                        value: b.dirty_value(val_date,curve_shortup,null,curve_shortup,ytm)
                },{
                        description: "BCBS 368 Short Rate Down",
                        value: b.dirty_value(val_date,curve_shortdown,null,curve_shortdown,ytm)
                }
        ];
        
        for (var i=0;i<scenarios.length;i++){
                scenarios[i].value_change=(scenarios[i].value-dirty_value);
                scenarios[i].percentage=scenarios[i].value_change/dirty_value*100;
                
        }
        
        display_scenarios(scenarios);
}

// start when document is loaded
$(document).ready(initialize);
