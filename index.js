/**
 *	Import a JSON file
 */
const fs = require('fs').promises;
async function getJsonFromFile(path) {
    const data = await fs.readFile(path, "binary");
    const str = new Buffer.from(data).toString();
    return JSON.parse(str);
}


(async () => {

    // SETUP

    // import myCredentials file
    let myCredentials = await getJsonFromFile("credentials.json");
    // console.log(myCredentials);
    const {
        default: api
    } = require('zotero-api-client');

    // TESTS

    // basic test
    // const myapi = await api().library('user', 475425).collections('9KH9TNSJ');
    // const itemsResponse = await myapi.items().get();
    // console.log(itemsResponse);

    const myCollections = {
        "randomness": "BUX7N984"
    };
    // get all items
    // const myapi = await api(myCredentials.key).library('user', myCredentials.user);
    // const allItems = await myapi.items().get();
    // console.log(allItems);

    // get all items in a collection
    const myapi = await api(myCredentials.key).library('user', myCredentials.user).collections(myCollections.randomness).items().get();
    const items = myapi.getData();
    // console.log(items);
    // console.log(items.map(i => i.title));
    console.log(getSelectedCitationsAsJson(items));



})().catch(err => {
    console.error(err);
});




function mergeAuthors(items) {
    var out = [];
    for (var i = 0; i < items.length; i++) {
        if (items[i].director) {
            out.push(
                (items[i].director ? items[i].lastName : "") +
                ((items[i].lastName && items[i].firstName) ? ", " : "") +
                (items[i].firstName ? items[i].firstName : "")
            );
        } else if (items[i].lastName) {
            out.push(
                (items[i].lastName ? items[i].lastName : "") +
                ((items[i].lastName && items[i].firstName) ? ", " : "") +
                (items[i].firstName ? items[i].firstName : "")
            );
        }

    }
    return out.join(", ");
}

function getSelectedCitationsAsJson(items) {
    var out = [];
    for (var i = 0; i < items.length; i++) {
        if (items[i].linkMode) continue;

		// zotero has different fields depending on itemType
        let pub = (items[i].publicationTitle ? items[i].publicationTitle : "") ||
            (items[i].blogTitle ? items[i].blogTitle : "") ||
            (items[i].websiteTitle ? items[i].websiteTitle : "");

        out.push({
            author: mergeAuthors(items[i].creators),
            title: items[i].title,
            url: items[i].url,
            year: pub + ((pub && items[i].date) ? ", " : "") +
                (items[i].date ? items[i].date.split("-")[0] : "")
        });
    }
    return out;
}
