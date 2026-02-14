<template>
  <section id="experiences" class="scroll-mt-24">
    <ol class="group/list flex flex-col gap-4">
      <ExperienceCard
        class="lg:group-hover/list:opacity-50 lg:hover:!opacity-100"
        v-for="(experience, index) in experiences"
        :key="index"
        v-bind="experience"
      />
    </ol>
  </section>
</template>

<script setup lang="ts">
import type { ExperienceCardProps } from "./ExperienceCard.vue";

const experiences: ExperienceCardProps[] = [
  {
    title: "Tech Lead @Mayday",
    contract: "Full-Time",
    positions: ["Senior Engineer", "Full Stack Engineer"],
    description: `
    Led two squads (7 engineers) in building a SaaS platform at a fast-growing startup.
    Collaborated with product to define roadmaps and prioritize features.
    Spearheaded technical discoveries (e.g. collaborative editor with Y.js) and shaped scalable architecture.
    Ensured delivery through best practices and mentorship.
    Shipped critical features, refactored the notification system using RabbitMQ, and initiated the LMS product.
    Implemented single/multi-tenant DB architecture for premium users.
    Defined onboarding processes and setup for new engineers to support rapid team growth.`,
    dates: ["2021 - 2025", "(Present)"],
    stack: [
      "VueJS",
      "TailwindCSS",
      "NodeJS",
      "ExpressJS",
      "NestJS",
      "TypeScript",
      "GraphQL",
      "MongoDB",
      "PostgreSQL",
      "RabbitMQ",
    ],
    companyLink: "https://www.mayday.fr/",
  },
  {
    title: "Backend Technical Lead @Maiia",
    contract: "Full-Time",
    positions: ["Full Stack Engineer"],
    description: `Led backend team (3 developers) within the squad building the Maiia Pro web application.
      Designed technical architecture and data models for new features.
      Planned technical tasks and estimated development timelines.
       Mentored new backend developers.
        Delivered critical features such as agenda management and payment processing.
        Integrated key third-party APIs, including Stripe and Algolia, to support core business workflows.`,
    dates: ["2019 - 2021", "(22 months)"],
    stack: [
      "Java",
      "SprintBoot",
      "MongoDB",
      "RabbitMQ",
      "ReactJS",
      "Node.js",
      "JavaScript",
    ],
    companyLink: "https://www.maiia.com/",
  },
  {
    title: "Software Engineer @Viveris",
    contract: "Full-Time",
    description: `Worked as an embedded software engineer at Cobham in the aerospace sector. 
    Developed unit tests in C using RTRT (IBM Rational Test RealTime) and validated technical and functional requirements. 
    Joined as a software and QA engineer in the Intelligent Transportation Systems team. 
    Later served as a technical consultant for Renault and Akka Technologies on an autonomous vehicle PoC. 
    Authored test plans and led functional validation efforts to ensure reliability and compliance in safety-critical environments.
`,
    dates: ["2018 - 2019", "(10 months)"],
    stack: ["C", "RTRT", "Functional QA"],
    companyLink: "https://www.viveris.fr/",
  },
  {
    title: "Full Stack Engineer @Sopra Steria",
    contract: "Internship",
    description: `Contributed to the GIP-MDS project on the net-entreprises.fr portal. 
    Developed new features and ensured reliability through unit testing. 
    Built a Circuit Breaker PoC using Hystrix to enhance system resilience. 
    Led a task force of 4 developers, successfully reducing the backlog from 50 to under 20 tickets within one month.
`,
    dates: ["2018", "(6 months)"],
    stack: [
      "Java",
      "JEE",
      "JSP",
      "SpringBoot",
      "JUnit",
      "HTML",
      "CSS",
      "Javascript",
      "jQuery",
    ],
    companyLink: "https://www.soprasteria.com/",
    projectLinks: [
      {
        name: "GIP-MDS",
        url: "https://www.net-entreprises.fr/",
      },
    ],
  },
  {
    title: "Software Engineer @CineApps",
    contract: "Internship",
    description: `Led development of a Java-based monitoring tool for Twavox, a cinema accessibility device for hearing- and visually-impaired audiences. 
    Handled the full cycle from requirements gathering to deployment at client sites. 
    Collaborated on software design, testing, and customer support. Authored technical documentation and user manuals, and supported training efforts to ensure smooth adoption.
`,
    dates: ["2018", "(6 months)"],
    stack: ["Java", "Swing", "Linux"],
    companyLink: "https://www.linkedin.com/company/cineapps/",
    projectLinks: [
      {
        name: "Twavox",
        url: "https://www.twavox.com/",
      },
    ],
  },
];
</script>

<style scoped></style>
