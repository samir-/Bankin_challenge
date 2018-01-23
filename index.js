/*

Author : Samir IDWY
Mail: Samir.idwy@gmail.com
*Objective : Script to scrap web.bankin.com/challenge/index.html in a optimized time
*Techniques/tricks used :
- ususal scrapping with dismissing alert errors
- forcing the page to generate all the results without reloading
- bypassing the artificial timeout
- Getting the transactions without expicitly selecting them from HTML (rendering time and selector time optimized)
  |-> how : modifying Jquery append to get me all the data without rendering.

Detailed timing : in my computer
- Pupeteer loading process: 467.546ms
- Page loading: 296.337ms
- Pure scrapping time: 485.753ms
- The whole execution time: 1250.229ms

*/
const puppeteer = require('puppeteer');
const fs = require('fs');
var util = require('util');

// begin time
console.time("The whole execution time");
(async () => {
    // array of all transactions
    transactions = []
    console.time("pupeteer loading process");
    //load of browser and page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await console.timeEnd("pupeteer loading process");
    //to dismiss the alert error when loading
    page.on('dialog', dialog => {
        // In case of alert popup Dismiss !
        dialog.dismiss();
    });

    // load the page just one time !
    await console.time("page loading");
    await page.goto('https://web.bankin.com/challenge/index.html');
    await console.timeEnd("page loading");
    //
    await console.time("Pure scrapping time");
    // return all the transactions
    transactions = await page.evaluate(() => {
        var indice = 0;
        var one_transaction = {};
        var transactions =[];

        // we do this trick to modify the append method and get rid of the rendering in html page
        // basically we scrap the data implicitly, without getting it from the html page
        jQuery.prototype.append = function() {
            if (this[0].nodeName == "TR") {
              // we skip the first 3 nodes (head of table).
                if (indice > 2) {
                  // modulo is used to detect if the node is an account or trans or ammount
                  // Nb : the nodes are succcesive
                  // arguments[0][0] is the node in question (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments)
                    if (indice % 3 == 0) {
                        one_transaction["Account"] = arguments[0][0].innerHTML;
                    } else if (indice % 3 == 1) {
                        one_transaction["Transaction"] = arguments[0][0].innerHTML;
                    } else if (indice % 3 == 2) {
                        //could be regex but there was 1 currency
                        one_transaction["Amount"] = arguments[0][0].innerHTML.slice(0, -1);
                        one_transaction["Currency"] = arguments[0][0].innerHTML.substr(-1);
                        // push the one_transaction to the transactions array reset the one_transaction object
                        transactions.push(one_transaction)
                        one_transaction = {};
                    }
                }
                //indice denotes the number of tr nodes
                indice++;
            }
            return 0;
        }
        // iterate over all the pages
        for (var i = 0; i < 5000; i += 50) {
            //concentrate on one case
            window.hasiframe = false;
            //start index variable
            window.start = i;
            // force the page to be generated
            window.doGenerate();
        }
        // return the local table transactions
        return transactions;

    });
    // writing into Json format
    await fs.writeFileSync('./Transaction.json', JSON.stringify(transactions, null, 1), 'utf-8');
    // end of timer
    await console.timeEnd("Pure scrapping time");
    await console.timeEnd("The whole execution time");
    browser.close();
})();
