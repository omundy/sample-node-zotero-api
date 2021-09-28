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


    // RUN

    // get all items in a collection
    const myapi = await api(myCredentials.key, {
            limit: 50
        })
        .library('user', myCredentials.user)
        .collections(myCollections.randomness)
        .items().get();
    const items = myapi.getData();


    // console.log(items.length, items);
    // console.log(items.map(i => i.title));
    console.log(getSelectedCitationsAsJson(items));


})().catch(err => {
    console.error(err);
});



/**
 *  Combine all creators into a single string
 */
function mergeCreators(creators) {
    var out = [];
    if (!creators) return;
    console.log(creators);
    for (var i = 0; i < creators.length; i++) {
        if (creators[i].director) {
            out.push(
                (creators[i].director ? creators[i].lastName : "") +
                ((creators[i].lastName && creators[i].firstName) ? ", " : "") +
                (creators[i].firstName ? creators[i].firstName : "")
            );
        } else if (creators[i].lastName) {
            out.push(
                (creators[i].lastName ? creators[i].lastName : "") +
                ((creators[i].lastName && creators[i].firstName) ? ", " : "") +
                (creators[i].firstName ? creators[i].firstName : "")
            );
        }
    }
    return out.join(", ");
}

/**
 *  Combine all creators into a single string
 */
function getSelectedCitationsAsJson(items) {
    var out = [];
    if (!items || items.length == 0) return;
    for (var i = 0; i < items.length; i++) {
        // if an imported_url || imported_file
        if (items[i].linkMode) continue;
        // if one of my notes
        if (items[i].itemType == "note") continue;
        // if no data
        if (!items[i].title) continue;

        console.log(i, items[i].title);

        out.push({
            author: mergeCreators(items[i].creators) || "",
            title: items[i].title,
            url: items[i].url,
            // zotero has different fields depending on itemType
            publication: (items[i].publicationTitle ? items[i].publicationTitle : "") ||
                (items[i].blogTitle ? items[i].blogTitle : "") ||
                (items[i].websiteTitle ? items[i].websiteTitle : ""),
            year: (items[i].date ? items[i].date.split("-")[0] : "")
        });
    }
    return out;
}
