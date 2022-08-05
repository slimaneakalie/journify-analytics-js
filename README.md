# Journify JavaScript SDK
This SDK enables you to send your data to Journify back-office without any additional integrations for new added destinations.

# Quickstart
The easiest and quickest way to get started with the SDK is to [use it through Journify](#-using-with-journify). Alternatively, you can [install it through NPM](#-using-as-an-npm-package) or simply [add it to your HTML page](#-using-in-html-page) and do the instrumentation yourself.

## Using with Segment
1. Create a javascript source at [Journify](https://app.journify.io) and you will automatically get a snippet that you can add to your website. For more information visit our [documentation](https://journify.io/docs/sources/javascript).
2. Start tracking!

## Using as an NPM package
1. Install the package

```sh
# npm
npm install @journifyio/analytics

# yarn
yarn add @journifyio/analytics

# pnpm
pnpm add @journifyio/analytics
```

2. Import the package into your project and you're good to go (with working types)!

```ts
import { Journify } from "@journifyio/analytics";

const analytics = Journify.load({ writeKey: '<YOUR_WRITE_KEY>' })

analytics.identify('user-id-1', {email: "user-1@mail.com"})

document.body?.addEventListener('click', () => {
  analytics.track('document body clicked!')
})
```

## Using in html page
1. Add the following script tag at the top of your `<head>`:
```html
<script src="https://unpkg.com/@journifyio/analytics@latest/dist/_bundles/journifyio.min.js"></script>
```
2. Start tracking inside the page:
```html
<script>
    const analytics = window.journifyio.Journify.load({ writeKey: '<YOUR_WRITE_KEY>'});

    analytics.track('Order completed', {
        email: "user-1@mail.com",
        value: 1000,
    })
    .then(() => console.log('Order event tracked with success'))
    .catch((err) => console.log("Order event tracking encountered some errors: ", err));
</script>
```