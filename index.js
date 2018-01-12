const puppeteer = require('puppeteer');
const fs = require('fs');
var util = require('util');


// begin time

(async () => {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();

    //to select all rows inside the dvTable (the one without iframe)
    const  rowSelector = "#dvTable > table > tbody > tr";
    var all_trans = [];
    page.on('dialog', dialog => {
        // In case of alert popup Dismiss !
        dialog.dismiss();
    });
    // load the page one time !
    await page.goto('https://web.bankin.com/challenge/index.html');
    console.time("Scraping");

    // iterate over all the pages [ 5000 is the limit from the load.js ]
    for (var st = 0; st < 5000; st += 50) {
        //the script is added after the loaded page
        //we force the page to load the data in a non-iframe format and without fail or slowmode
        // PS: we may have 2 rendered tables, one with iframe and one without but we just neglect the iframe one :-)
        await page.addScriptTag({
            content: "hasiframe = false ; slowmode = false ; failmode = false;start = " + st + ";generate()"
        });
        await page.waitForSelector(rowSelector);
        //get all the rows from single page
        const fifty_trans = await page.$$eval(rowSelector, transactions => {
            return transactions.map(function(row) {
                // get the attributes of a transaction
                var account = row.children[0].innerHTML
                var transaction = row.children[1].innerHTML
                var amount= row.children[2].innerHTML
                var obj = {
                    "Account": account,
                    "Transaction": (transaction).substr((transaction).indexOf(" ") + 1),
                    "Amount": amount.slice(0, -1),
                    "Currency": amount.substr(-1)
                }
                return obj
            })
        });
        //erase the first row
        await fifty_trans.shift();
        //appending to the result
        await all_trans.push.apply(all_trans, fifty_trans)
    }
    // writing into Json format
    await fs.writeFileSync('./Transaction.json', JSON.stringify(all_trans,null, 4), 'utf-8');
    await console.timeEnd("Scraping");
    browser.close();
})();
