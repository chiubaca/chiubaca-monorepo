export interface ContactInfo {
  type: "phone" | "email" | "linkedin" | "github" | "location" | "blog";
  icon: string;
  value: string;
  href?: string;
}

export interface Experience {
  company: string;
  location: string;
  period: string;
  role: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  period: string;
  degree: string;
}

export interface CVData {
  header: {
    name: string;
    summary: string;
    location: string;
    contact: ContactInfo[];
  };
  experience: Experience[];
  skills: Record<string, string[]>;
  education: Education;
  languages: string[];
}

export const cvData: CVData = {
  header: {
    name: "Alex Chiu",
    summary:
      "Senior Fullstack Engineer at Zoopla. Architecting robust, scalable user experiences. Passionate about building high-quality software, reducing complexity, and shipping production-grade code.",
    location: "London, UK",
    contact: [
      {
        type: "phone",
        icon: "fa-solid fa-phone",
        value: "+44 07898-972-136",
        href: "tel:+4407898972136",
      },
      {
        type: "email",
        icon: "fa-solid fa-envelope",
        value: "alexchiu11@gmail.com",
        href: "mailto:alexchiu11@gmail.com",
      },
      {
        type: "linkedin",
        icon: "fa-brands fa-linkedin",
        value: "linkedin.com/in/achiu1",
        href: "https://www.linkedin.com/in/achiu1/",
      },
      {
        type: "github",
        icon: "fa-brands fa-github",
        value: "github.com/chiubaca",
        href: "https://github.com/chiubaca",
      },
      {
        type: "blog",
        icon: "fa-solid fa-pen",
        value: "Blog",
        href: "/blogs",
      },
    ],
  },
  experience: [
    {
      company: "Zoopla",
      location: "London",
      period: "March 2024 - Present",
      role: "Senior Software Engineer",
      bullets: [
        "Senior Engineer in MyHome, a fast-moving exploratory team building homeowner insights through maps, charts, and interactive widgets. Combines internal and external APIs and datasets to help homeowners across the UK make informed decisions about selling their homes.",
        "Built a reusable headless form component with state persistence and strongly-typed navigation which is now the backbone of multiple questionnaire flows across the site. Rewrote 'Instant Valuation' using this library, modernising an outdated onboarding flow which drove 30% lift in completion rates and 66% uplift in mortgage profile saves.",
        "Led full-stack delivery of 'Buyer Demand Report', MyHome's flagship feature for exploring property performance across price bands. Surfaces 3 years of data through dynamic visualisations with toggleable parameters. Collaborated with data science on Databricks, built test suite, defined GraphQL schemas, shipped to 1M+ MAU.",
        "Co-lead Zoopla's Frontend Community of Practice, driving internal knowledge sharing. Spoke at React Advanced meetup on React 19 APIs and modern patterns to an audience of 100+ engineers.",
        "Led performance modernisation of Zoopla's MyHome pages, improving Core Web Vitals through React 19, Next.js server components, Suspense, and partial pre-rendering.",
      ],
    },
    {
      company: "VU.CITY",
      location: "London",
      period: "October 2021 - December 2023",
      role: "Fullstack Web Developer (Geospatial)",
      bullets: [
        "Built an interactive 3D web map for a local council to visualise planned buildings sites. This was built using React, TypeScript, and Mapbox and Geoserver for GIS data.",
        'Maintained VU.CITY\'s existing SaaS product <a href="https://hub.vu.city/" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">hub.vu.city</a>, a fullstack TypeScript codebase. Resolved authentication bugs and integrated internal tooling such as MixPanel and HubSpot.',
        "Led R&D initiatives to explore new tools to visualise high-fidelity 3d models using web technologies including Cesium and Three.js.",
      ],
    },
    {
      company: "NEVERBLAND",
      location: "London",
      period: "March 2021 - October 2023",
      role: "Fullstack Web Developer",
      bullets: [
        'Architected internal tooling for the mental-health social media platform <a href="https://togetherall.com/en-gb/" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">togetherall.com</a>. This project used React, GraphQL, Apollo and MySQL paired with Prisma ORM. Due to a larger number of developers working on the same codebase, critical code paths were unit tested with Jest and end-to-end tests were put in place using Cypress so that future developers could extend functionality confidently.',
        'Led the development and launch of a fintech website, <a href="https://fnz.com/" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">fnz.com</a>. This website uses Next.js, Styled-components with a GraphCMS backend. This project was turned around on a tight 4-week deadline where the CMS was architected from the ground up and the frontend was developed dynamically with designers and the end client.',
        'Engineered Paul McCartney\'s new website, <a href="https://www.paulmccartney.com/" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">paulmccartney.com</a>. This website uses Next.js, Styled-components, Framer Motion and a GraphCMS backend. The main challenge was migrating data from a legacy Drupal system into GraphCMS. The front end uses Framer Motion for creating playful interactions throughout the website.',
        'Architected Algolia search integration for <a href="http://www.henley.ac.uk" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">www.henley.ac.uk</a>. This required writing synchronisation scripts to connect their CraftCMS to Algolia. The search UI was rebuilt using Vue.js. This project also involved using docker to containerise their backend services for development purposes.',
        'Built a real-time tracking platform (<a href="https://moveformothers.neverbland.com/" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">moveformothers.neverbland.com</a>) to visually track a collaborative (virtual) 4500-mile walk from London to Kathmandu, to raise money for the charity PHASE Worldwide. This website uses Next.js, Mapbox, Turf.js and the Strava API. The map automatically refreshes when a team member tracks activity on Strava.',
      ],
    },
    {
      company: "Transport for London",
      location: "London",
      period: "November 2016 - March 2021",
      role: "GIS Developer",
      description:
        "Joined TfL's Tech & Data department as a Developer involved in a multitude of work relating specifically to geospatial requirements.",
      bullets: [
        "Delivered a real-time road works management web map app. This entailed collaborating with third-party contractors during the final development phase, migrating data from a legacy Oracle database to a SQL server and releasing over a midnight launch so there was no downtime switching users to the new system.",
        "Enhanced the road-works app to progressively add new features and fix bugs. This entailed improving the UI/UX of the frontend web app written with Dojo. Also extending the backend to integrate with new data feeds and set up new geospatial REST APIs using Esri middleware and SQL Server.",
        "Architected automated data conversion pipelines using Python and FME. Continuously fine-tuned existing data workflows to make them more efficient and maintainable for future Developers.",
        "Managed DevOps for an internal data-as-a-service solution, Playbook. Ensuring all systems are up and running.",
      ],
    } as Experience & { description?: string },
    {
      company: "Esri UK",
      location: "Aylesbury",
      period: "October 2015 - November 2016",
      role: "GIS Software Consultant",
      description:
        "Promoted after completing the Esri UK graduate scheme as a Consultant to work on a variety of technical issues both internally and externally with customers.",
      bullets: [
        "Architected and deployed a data-as-service solution, Datahub. By creating a collection of new tiled basemaps services which would be used by customers across the UK in various web mapping applications.",
        "Owned data pipeline operations ensuring internal OS MasterMap data was up to date for the internal content team. Responsible for ensuring data pipelines were run on time and improving the process wherever possible.",
        "Worked closely with Product Managers to understand how customers are using Esri software. Taking all feedback into consideration to improve and produce new API services.",
        "Frequently wrote blogs for the Esri UK website and ran webinars to help alleviate customer issues.",
        "Deployed and automated Esri software in the cloud for infrastructure-as-a-service offerings to customers. Automating steps wherever possible.",
        "Managed AWS infrastructure for Datahub and platform-as-a-service solution Apphub.",
      ],
    } as Experience & { description?: string },
  ],
  skills: {
    "Core Languages": ["TypeScript", "Python"],
    Frontend: [
      "React",
      "Next.js",
      "Astro.js",
      "TanStack Start",
      "Vue.js",
      "Svelte",
    ],
    Backend: [
      "Node.js",
      "GraphQL",
      "PostgreSQL",
      "Drizzle.js",
      "Prisma",
      "MongoDB",
      "DynamoDB",
      "Firebase",
      "BetterAuth",
      "AWS Lambda",
      "Docker",
      "Cloudflare Workers",
      "Cloudflare D1",
      "Cloudflare R2",
      "Durable Objects",
      "Cloudflare Pages",
    ],
    Tooling: ["Nx", "pnpm", "GitHub Actions", "CloudWatch", "Sentry"],
  },
  education: {
    institution: "Kingston University, London",
    period: "2008 - 2011",
    degree: "BSc (Hons) GIS, 2.1",
  },
  languages: ["English", "Cantonese"],
};
