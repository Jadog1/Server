/*
 * var element = document.evaluate('//*[@id="availability"]/span/text()', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent.trim();
if(element.match("unavailable")) console.log("Unavailable");
else console.log(parseFloat(document.getElementById("priceblock_ourprice").innerHTML.substr(1)));
 * */

const cheerio = require('cheerio');
const got = require('got');

const vgmUrl = 'https://www.amazon.com/Microsoft-RRT-00001-Xbox-1TB-SSD/dp/B08XBKBM8X/ref=sr_1_2?dchild=1&keywords=xbox+series+x&qid=1615003703&sr=8-2';


exports.searchPage = () => {
    (async () => {
        const response = await got(vgmUrl);
        const $ = cheerio.load(response.body);

        const value = cheerio.text($('body'));
        console.log("Value: " + value);
    })();
}