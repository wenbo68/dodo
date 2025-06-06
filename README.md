# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnexi-launch%2Ffinwise-landing-page)

# Finwise - Next.js + Tailwind Landing Page Template

Finwise is a lightweight, easily configurable, and customizable **Next.js** and **Tailwind CSS** landing page template. It’s built to be adaptable, performant, and perfect for any product launch, portfolio, or promotional site.

Try out the demo here: [https://finwise-omega.vercel.app](https://finwise-omega.vercel.app).

Please check out the documentation below to get started.

---

## Features

- **Next.js** app router with **TypeScript**
- **Tailwind CSS** v3 for flexible styling customization
- Smooth transitions powered by **Framer Motion**
- Built-in **font optimization** with [next/font](https://nextjs.org/docs/app/api-reference/components/font)
- Automatic **image optimization** via [next/image](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- Access to **31+ icon packs** via [React Icons](https://react-icons.github.io/react-icons/)
- Near-perfect **Lighthouse score**
- Modular, responsive, and **scalable components**
- **Free lifetime updates**

---

## Sections

- Hero
- Partners or Clients Logos
- Features
- Pricing
- Testimonials
- FAQ
- Statistics
- CTA
- Footer

---

## Getting Started

### Prerequisites

Before starting, make sure you have the following installed:

- **Node.js**: Version 18 or later
- **npm**: Version 8 or later (bundled with Node.js)
- **Code editor**: [VS Code](https://code.visualstudio.com/) is recommended.

### Steps

1. **Install dependencies**: Run `npm install`
2. **Run the development server**: `npm run dev`
3. **View your project**: Open [localhost:3000](http://localhost:3000)

---

## Customization

1. **Edit colors**: Update `globals.css` for primary, secondary, background, and accent colors.
2. **Update site details**: Customize `siteDetails.ts` in `/src/data` to reflect your brand and site info.
3. **Modify content**: Files in `/src/data` handle data for navigation, features, pricing, testimonials, and more.
4. **Replace favicon**: Add your icon to `/src/app/favicon.ico`.
5. **Add images**: Update `public/images` for Open Graph metadata (e.g., `og-image.jpg`, `twitter-image.jpg`).

---

## Deploying on Vercel

The fastest way to deploy Finwise is on [Vercel](https://vercel.com/). Simply click the "Deploy with Vercel" button at the top of this README, or check the [Next.js deployment docs](https://vercel.com/docs/deployments/deployment-methods) for other deployment options.

---

## Contributing

Finwise is an open-source project, and we welcome contributions from the community! If you have ideas for new components, designs, layouts, or optimizations, please join us in making Finwise even better.

### How to Contribute

1. **Fork the Repository**: Clone it locally.
2. **Create a New Branch**: For example, `feature/new-section` or `fix/style-issue`.
3. **Develop and Test**: Make sure your changes work and don't break existing functionality.
4. **Submit a Pull Request**: Open a pull request with a clear description of your changes, and we'll review it.

### Ideas for Contributions

- New component sections (team introductions, comparison table, case studies, etc.)
- Additional page variants (e.g., agency, eCommerce, portfolio layouts)
- Additional themes
- Documentation updates, tutorials, or guides

---

## Community and Support

Join our community discussions on GitHub to share ideas, ask questions, or suggest improvements. Let’s build something amazing together!

---

## License

This project is open-source and available under the MIT License. Feel free to use, modify, and distribute it for personal or commercial projects.

# Future Modifications

1. Move sortable.js for items from grid to list
2. use queue instead of lock/mutex
3. add hierarchy to items
4. add daisy ui (dark mode)
5. use unique string ids for lists and items
6. clicking refresh immediate a/f add item does not update db (remove isNew from todo-item and include handleItemBlur in todo-list?)
7. the width of the list should have a max; the gap between the lists should be fixed horizontally
8. add animations to lists and items
9. toast when error occurs and optimistic update reverts
10. add search functionality
11. add storage for deleted lists
12. when moving list to different grid or when moving item to different list, give option to drop or copy to new location
13. infinite scrolling?
14. if adding new list must be instant in frontend, we need to handle temp id before real id is available from backend. In this case, client cache will become the truth for temp list/item. However, client cache cannot survive a refresh from user. If users want the temp list/item to survive a refresh, we need indexedDB as the truth for temp list/item.
15. when clicking addList/addItem, move viewport to let the user see the newly added list/item immediately
16. phone mode and dark mode
