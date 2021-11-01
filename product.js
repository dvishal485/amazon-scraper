const product = async (query) => {

    const product_page = await (await fetch(`https://www.amazon.in/${query}`)).text()

    try {
        var highlights = []
        var feat = product_page.split('<ul class="a-unordered-list a-vertical a-spacing-mini">')[1].split('</ul>')[0]
        var feat = feat.split('<span class="a-list-item">')
        for (var i = 1; i < feat.length; i++) {
            try {
                highlights.push((feat[i].split('</span>')[0].replaceAll('\n', '')).replaceAll('"', "'"))
            } catch (err) { }
        }

    } catch (err) {
        var highlights = [null]
    }


    try {
        var price = product_page.split('<span id="priceblock_ourprice" class="a-size-medium a-color-price priceBlockBuyingPriceString">')[1].split('</span>')[0]
        var original_price = product_page.split('<span class="priceBlockStrikePriceString a-text-strike">')[1].split('</span>')[0]
        if (!original_price) { var original_price = price }
    } catch (error) {
        try {
            var price = (product_page.split('<span id="priceblock_ourprice" class="a-size-medium a-color-price priceBlockBuyingPriceString">')[1].split('</span>')[0]).split(' - ')[0]
            var original_price = (product_page.split('<span id="priceblock_ourprice" class="a-size-medium a-color-price priceBlockBuyingPriceString">')[1].split('</span>')[0]).split(' - ')[1]
            if (!original_price) { var original_price = price }
        } catch (erro) {
            try {
                var price = product_page.split('<span id="priceblock_dealprice" class="a-size-medium a-color-price priceBlockDealPriceString">')[1].split('</span>')[0]
                var original_price = product_page.split('<span class="priceBlockStrikePriceString a-text-strike">')[1].split('</span>')[0]
                if (!original_price) { var original_price = price }
            } catch (err) {
                try {
                    var price = product_page.split('<span id="priceblock_saleprice" class="a-size-medium a-color-price priceBlockSalePriceString">')[1].split('</span>')[0]
                    var original_price = product_page.split('<span class="priceBlockStrikePriceString a-text-strike">')[1].split('</span>')[0].replace(/\n/gi, '')
                    if (!original_price) { var original_price = price }
                } catch (er) {
                    var price = null
                    var original_price = null
                }
            }
        }
    }
    if (original_price !== null) {
        original_price = parseFloat(original_price.replace('₹', '').replace(/,/g, '').trim())
    }
    if (price !== null) {
        price = parseFloat(price.replace('₹', '').replace(/,/g, '').trim())
    }
    try {
        var discounted = current_price < original_price
        var discount_percent = Math.ceil(100 * (original_price - current_price) / original_price)
    } catch (e) { }

    try {
        var in_stock = product_page.split('id="availability"')[1].split('</div>')[0].toLowerCase().lastIndexOf('in stock.') !== -1
    } catch (e) { var in_stock = (product_page.split('In stock.').length > 1) }

    try {
        var image = product_page.split('<div id="imgTagWrapperId" class="imgTagWrapper">')[1].split('data-old-hires="')[1].split('"')[0].replaceAll('\n', '')
        if (image === '') {
            var image = product_page.split('<div id="imgTagWrapperId" class="imgTagWrapper">')[1].split('data-a-dynamic-image="{&quot;')[1].split('&quot;')[0].replaceAll('\n', '')
        }
    } catch (e) { var image = null }

    try {
        var review_section = product_page.split('ratings</span>')[0]
        var ratings_count = parseInt(lastEntry(review_section.split('>')).replace(/,/g, '').trim())
        var rating = parseFloat(lastEntry(lastEntry(review_section.split('a-icon-star')).split('</span>')[0].split('out of')[0].split('>')).trim())
        var rating_details = { ratings_count, rating }
    } catch (er) {
        console.log(er.message)
        var rating_details = { ratings_count: null, rating: null }
    }

    try {
        var product_detail = {
            name: (product_page.split('<span id="productTitle" class="a-size-large product-title-word-break">')[1].split('</span>')[0]).replaceAll('\n', '').trim(),
            'current_price': price,
            original_price,
            discounted,
            discount_percent,
            'rating': rating_details.rating,
            'ratings_count': rating_details.ratings_count,
            in_stock,
            share_url: `https://www.amazon.in/${query}`,
            thumbnails: [image],
            highlights
        }
    } catch (err) {
        var product_detail = null
    }


    return JSON.stringify(product_detail, null, 2)
}

const lastEntry = (array) => array[array.length - 1]

export default product