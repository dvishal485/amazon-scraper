const search = async (query, host) => {

    const SearchQuery = query.replace(/%20/gi, '+')
    const searchRes = await (await fetch(`https://www.amazon.in/s?k=${SearchQuery}`)).text()

    var all_product = searchRes.split('<div class="a-section aok-relative s-image-fixed-height">')

    var i, result = [];
    for (i = 1; i < all_product.length; i++) { /* (type 1) */
        try {
            var link = 'https://www.amazon.in' + all_product[i].split('<a class="a-link-normal a-text-normal" target="_blank" href="')[1].split('"')[0].split('?')[0]
            var current_price = parseFloat(all_product[i].split('<span class="a-price" data-a-size="l" data-a-color="price"><span class="a-offscreen">')[1].split('</span>')[0].replace(/,/g, '').replace('₹', '').trim())
            var original_price = parseFloat(all_product[i].split('<span class="a-price a-text-price" data-a-size="b" data-a-strike="true" data-a-color="secondary"><span class="a-offscreen">')[1].split('</span>')[0].replace(/,/g, '').replace('₹', '').trim())
            if (!link.includes('/gp/slredirect/')) { /* Not including sponsered products */
                result.push({
                    name: (all_product[i].split('<span class="a-size-medium a-color-base a-text-normal">')[1].split('</span>')[0]).replace(/&#39;/gi, "'").replace(/&amp;/gi, "&").replace(/&quot;/gi, "'").replace(/&#x27;/gi, "'"),
                    link,
                    current_price,
                    original_price,
                    discounted: (current_price < original_price),
                    thumbnail: (all_product[i].split('src="')[1].split('"')[0]).replace('_AC_UY218_.jpg', '_SL1000_.jpg'),
                    query_url: link.replace('www.amazon.in', host + '/product')
                })
            }
        } catch (err) { }
    }

    if (result.length === 0) { /* (type 2) */
        var all_product_container = searchRes.split('<div class="a-section a-spacing-medium a-text-center">')

        for (i = 1; i < all_product_container.length; i++) {
            try {
                var link = 'https://www.amazon.in' + all_product_container[i].split('<a class="a-link-normal s-no-outline" target="_blank" href="')[1].split('"')[0].split('?')[0]
                var current_price = parseFloat(all_product_container[i].split('<span class="a-price" data-a-size="l" data-a-color="price"><span class="a-offscreen">')[1].split('</span>')[0].replace(/,/g, '').replace('₹', '').trim())
                var original_price = parseFloat(all_product_container[i].split('<span class="a-price a-text-price" data-a-size="b" data-a-strike="true" data-a-color="secondary"><span class="a-offscreen">')[1].split('</span>')[0].replace(/,/g, '').replace('₹', '').trim())
                if (!link.includes('/gp/slredirect/')) {
                    result.push({
                        name: (all_product_container[i].split('<span class="a-size-base-plus a-color-base a-text-normal">')[1].split('</span>')[0]).replace(/&#39;/gi, "'").replace(/&amp;/gi, "&").replace(/&quot;/gi, "'").replace(/&#x27;/gi, "'"),
                        link,
                        current_price,
                        original_price,
                        discounted: (current_price < original_price),
                        thumbnail: (all_product_container[i].split('src="')[1].split('"')[0]).replace('_AC_UL320_.jpg', '_SL1000_.jpg'),
                        query_url: link.replace('www.amazon.in', host + '/product')
                    })
                }
            } catch (err) { }
        }
    }

    return JSON.stringify({
        total_result: result.length,
        query: SearchQuery,
        fetch_from: `https://www.amazon.in/s?k=${SearchQuery}`,
        result
    }, null, 2)
}


export default search