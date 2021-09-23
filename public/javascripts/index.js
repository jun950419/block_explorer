window.onload = function() {
    getblockcount();
    listtransactions();   
    // setInterval(getblockcount, 1000); 
    // setInterval(listtransactions, 1000); 
}

function getblockcount() {
    $.ajax({
        url: "/getblockcount",
        type: "post",
        async: false,
        success: function(result) {
            $(".height").text(String(result.height));
        },
        error: function(error) {
            console.log(error);
        }
    })
}

function listtransactions() {
    $.ajax({
        url: "/listtransactions",
        type: "post",
        async: false,
        success: function(result) {
            for(let i = 0; i < result.length; i++) {
                $.ajax({
                    url: "/getaccountaddress",
                    type: "post",
                    data: {account: result.account[i]}, 
                    async: false,
                    success: function(result2) {
                        let rowHtml = `<tr><td class="${result.txid[i]}"><a href="/gettransaction/${result.txid[i]}">${result.txid[i]}</a></td>`;
                        rowHtml += `<td>${result.time[i]}</td>`;
                        rowHtml += `<td>${result2}</td>`;
                        rowHtml += `<td>${result.account[i]}</td>`;
                        rowHtml += `<td>${result.to[i]}</td></tr>`;
            
                        $("#transactionsTable > tbody:last").append(rowHtml);
                    }
                });

            }
        },
        error: function(error) {
            console.log(error);
        }
    });
}