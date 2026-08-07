You are an expert creative developer, UX designer, and frontend architect. Build a premium portfolio website for a web designer and developer that feels like an Awwwards-quality digital experience.

The goal is to create a visually impressive, highly polished portfolio that showcases design skill, frontend development ability, animation craft, and creative direction. The site should feel elegant, modern, interactive, and memorable — not like a generic template.

## Tech Stack

Use:

- Next.js with App Router
- TypeScript
- Tailwind CSS
- GSAP for animation
- Three.js or React Three Fiber for subtle 3D/interactive visual moments
- Framer Motion only if useful, but GSAP should be the primary animation tool
- Lenis or a smooth scrolling solution
- Optional: shadcn/ui only where it helps, but avoid a generic SaaS look

## Design Direction

Create a premium, editorial-style portfolio with a cinematic feel.

Style keywords:

- Awwwards-quality
- premium creative studio
- modern editorial
- refined motion
- dark luxury interface
- high contrast
- immersive hero section
- elegant typography
- interactive case studies
- strong visual hierarchy
- tasteful microinteractions
- smooth transitions

Avoid:

- generic cards
- basic gradient blobs
- boring grid-only layouts
- stock SaaS sections
- overused purple/blue startup design
- excessive animation that hurts usability

## Visual Identity

Use a dark, refined color palette:

- near-black background
- warm off-white text
- muted gray secondary text
- one strong accent color such as electric lime, amber gold, cobalt, or muted cyan

Use large typography, generous spacing, and strong contrast.

Create a layout that feels like a mix between a creative agency site, personal brand site, and digital product showcase.

## Required Pages / Sections

Build a one-page portfolio with smooth anchor navigation.

Sections:

1. **Hero**
   - Large headline introducing the designer/developer
   - Example headline:
     “Designing digital experiences with code, motion, and strategy.”
   - Subheadline explaining the person builds websites, interfaces, brands, and interactive experiences
   - Animated text reveal using GSAP
   - Subtle Three.js background or interactive 3D object
   - CTA buttons:
     - View Work
     - Contact Me

2. **Featured Work**
   - Showcase 3–4 portfolio projects
   - Each project should feel like a case study preview
   - Include project title, category, year, role, and short description
   - Use large image/video placeholder panels
   - Add hover interactions using GSAP
   - Add horizontal scroll or pinned scroll interaction if appropriate
   - Make this section feel premium and memorable

3. **About**
   - Brief story of the designer/developer
   - Highlight design thinking, frontend development, UX, branding, and motion
   - Include a visually interesting layout, not just a plain text block
   - Add animated stats or capabilities

4. **Services / Capabilities**
   - Include:
     - Web Design
     - Frontend Development
     - UI/UX Design
     - Brand Systems
     - Motion Design
     - Interactive Experiences
   - Each should have a short description
   - Add subtle hover animations

5. **Process**
   - Show a clear process:
     - Discover
     - Design
     - Build
     - Refine
     - Launch
   - Use an animated timeline or scroll-triggered reveals

6. **Selected Experiments**
   - Small section for creative coding, Three.js experiments, UI concepts, animations, and prototypes
   - This should communicate that the person is not just a designer but a creative technologist

7. **Contact**
   - Strong closing statement
   - Contact form UI
   - Email/social links
   - CTA:
     “Let’s build something memorable.”

## Animation Requirements

Use GSAP seriously, not just fade-ins.

Include:

- Hero text reveal animation
- ScrollTrigger section reveals
- Project image parallax
- Magnetic button interactions
- Smooth hover transitions
- Pinned or horizontal scroll section for featured work
- Staggered text/element animations
- Page load intro animation
- Subtle cursor or pointer effect, but keep it tasteful
- Reduced motion fallback for accessibility

Animations should be smooth, performant, and intentional.

## Three.js Requirements

Use Three.js or React Three Fiber for one tasteful interactive element.

Possible ideas:

- Abstract 3D shape in hero
- Floating glass-like geometry
- Interactive particle field
- Wireframe object that reacts to mouse movement
- Subtle shader-style background
- 3D typography accent

Keep it elegant. Do not let it overpower the content.

Make sure it performs well and is responsive.

## UX Requirements

The site must feel polished and professional.

Include:

- Responsive design for mobile, tablet, and desktop
- Sticky navigation
- Smooth scrolling
- Clear content hierarchy
- Strong accessibility
- Keyboard-friendly navigation
- Proper semantic HTML
- Good contrast
- Reduced motion support
- Fast loading
- Clean code organization

## Content Quality

Use strong placeholder copy that sounds premium and realistic. Avoid bland filler text.

Instead of “Lorem ipsum,” write real portfolio-style content.

Example project names:

- Atlas Studio — Brand and website system for a creative agency
- Northline — Interactive product landing page
- Verano Motors — Luxury automotive digital experience
- FinSight — Financial dashboard and AI assistant interface

For each project, include:

- Name
- Type
- Role
- Year
- Short summary
- Visual placeholder
- Tags

## Components to Create

Create reusable components such as:

- Navbar
- Hero
- FeaturedWork
- ProjectCard
- About
- Services
- Process
- Experiments
- Contact
- MagneticButton
- AnimatedText
- SectionHeading
- ThreeScene
- Footer

Keep the code clean, modular, and easy to customize.

## File Structure

Use a professional structure similar to:

```txt
src/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
    Navbar.tsx
    Hero.tsx
    FeaturedWork.tsx
    ProjectCard.tsx
    About.tsx
    Services.tsx
    Process.tsx
    Experiments.tsx
    Contact.tsx
    Footer.tsx
    MagneticButton.tsx
    AnimatedText.tsx
    ThreeScene.tsx
  data/
    projects.ts
    services.ts
  hooks/
    useReducedMotion.ts
    useGSAPAnimations.ts
  lib/
    utils.ts
```
