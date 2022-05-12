const puppeteer = require('puppeteer');

async function getTitle(page) {
    const title = await page.evaluate(function() {
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && ogTitle.content.length > 0) return ogTitle.content;
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle && twitterTitle.content.length > 0) return twitterTitle.content;
        const docTitle = document.title;
        if (docTitle && docTitle.length > 0) return docTitle;
        const h1Element = document.querySelector('h1');
        const h1 = h1Element ? h1Element.textContent : null;
        if (h1 && h1.length > 0) return h1;
        const h2Element = document.querySelector('h2');
        const h2 = h2Element ? h2Element.textContent : null;
        if (h2 && h2.length > 0) return h2;
        return null;
    });
    return title;
}

async function getDescription(page) {
    const description = await page.evaluate(function() {
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription && ogDescription.content.length > 0) return ogDescription.content;
        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        if (twitterDescription && twitterDescription.content.length > 0) return twitterDescription.content;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && metaDescription.content.length > 0) return metaDescription.content;
        const paragraphs = document.querySelectorAll('p');
        for (let i = 0; i < paragraphs.length; i++) {
            if (paragraphs[i].offsetParent && paragraphs[i].offsetWidth > 0 && paragraphs[i].offsetHeight > 0 && paragraphs[i].textContent.length > 0) {
                return paragraphs[i].textContent;
            }
        }
        return null;
    });
    return description;
}

async function getDomain(page, uri) {
    const domain = await page.evaluate(function() {
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical && canonical.href.length > 0) return canonical.href;
        const ogUrlTag = document.querySelector('meta[property="og:url"]');
        if (ogUrlTag && ogUrlTag.content.length > 0) return ogUrlTag.content;
        return null;
    });
    return domain ? new URL(domain).hostname.replace('www.', '') : new URL(uri).hostname.replace('www.', '');
}

async function getImg(page) {
    const img = await page.evaluate(function() {
        const ogImg = document.querySelector('meta[property="og:image"]');
        if (ogImg && ogImg.content.length > 0) return ogImg.content;
        const linkImg = document.querySelector('link[rel="image_src"]');
        if (linkImg && linkImg.href.length > 0) return linkImg.href;
        const twitterImg = document.querySelector('meta[name="twitter:image"]');
        if (twitterImg && twitterImg.content.length > 0) return twitterImg.content;
        return null;
    });
    return img;
}

module.exports = async function(uri, puppeteerArgs = [], puppeteerAgent = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)') {
    const puppeteerParams = {headless: true, args: [...puppeteerArgs]};
    const browser = await puppeteer.launch(puppeteerParams);
    const page = await browser.newPage();
    page.setUserAgent(puppeteerAgent);

    await page.goto(uri);

    const preview = {};
    preview.title = await getTitle(page);
    preview.description = await getDescription(page);
    preview.domain = await getDomain(page, uri);
    preview.img = await getImg(page);

    await browser.close();
    //console.log(`Results for ${uri}:\n`, preview);
    return preview;
}