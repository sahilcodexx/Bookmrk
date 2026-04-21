import { cn } from "@/lib/utils";
import { FullWidthDivider } from "@/components/ui/full-width-divider";
import { GridFiller } from "@/components/ui/grid-filler";
// https://magicui.design/docs/components/grid-pattern
import { GridPattern } from "@/components/ui/grid-pattern";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Testimonial = {
  name: string;
  role: string;
  image: string;
  company?: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "Efferd is so polished I might just retire and become a full-time potato farmer. The ecosystem is in safe hands.",
    image: "https://github.com/shadcn.png",
    name: "Shadcn",
    role: "Founder",
    company: "Shadcn UI",
  },
  {
    quote:
      "Efferd is why I still have hair. No more pulling it out over centering divs or fighting with CSS grid.",
    image: "https://github.com/rauchg.png",
    name: "Guillermo Rauch",
    role: "CEO",
    company: "Vercel",
  },
  {
    quote:
      "I tried to buy Efferd but they wouldn't sell. So I just bought Twitter instead to complain about it.",
    image: "https://unavatar.io/x/elonmusk",
    name: "Elon Musk",
    role: "CEO",
    company: "X.com",
  },
  {
    quote:
      "We just acquired Efferd for 3 gazillion dollars. We're calling it iEfferd. It's our best product yet.",
    image: "https://unavatar.io/x/tim_cook",
    name: "Tim Cook",
    role: "CEO",
    company: "Apple",
  },
  {
    quote:
      "I'm considering shipping Efferd components with Prime delivery. 2-day shipping on beautiful UIs? Done.",
    image: "https://unavatar.io/x/JeffBezos",
    name: "Jeff Bezos",
    role: "Founder",
    company: "Amazon",
  },
  {
    quote:
      "We're rewriting OpenAI's entire frontend in Efferd. The AGI told us it's the only logical choice.",
    image: "https://unavatar.io/x/sama",
    name: "Sam Altman",
    role: "CEO",
    company: "OpenAI",
  },
  {
    quote:
      "We processed 100 petabytes of data to find the perfect UI library. The algorithm returned 'Efferd' with 99.9% confidence.",
    image: "https://unavatar.io/x/sundarpichai",
    name: "Sundar Pichai",
    role: "CEO",
    company: "Google",
  },
  {
    quote:
      "Our links might 404 sometimes, but thanks to Efferd, at least the 404 page looks absolutely stunning.",
    image: "https://github.com/steven-tey.png",
    name: "Steven Tey",
    role: "Founder",
    company: "Dub.co",
  },
  {
    quote:
      "It's so fast, I finished my UI sprint before my next meeting even started. Open source for the win.",
    image: "https://unavatar.io/x/peer_rich",
    name: "Peer Richelsen",
    role: "Co-Founder",
    company: "Cal.com",
  },
  {
    quote:
      "21st.dev brings in 100k users daily just to see Efferd. We got into YC solely because of this UI library. And yes, we're rich now.",
    image: "https://github.com/serafimcloud.png",
    name: "Serafim",
    role: "Founder",
    company: "21st Labs.",
  },
  {
    quote:
      "I posted a video on Efferd components and it got more views than my cat video. That's statistically impossible.",
    image: "https://github.com/TheOrcDev.png",
    name: "OrcDev",
    role: "Youtuber",
  },
  {
    quote:
      "I had 10,000 bookmarks scattered across browsers and notes. Bookmrk saved my sanity and my links in one beautiful place.",
    image: "https://unavatar.io/x/linus",
    name: "Linus Torvalds",
    role: "Creator",
    company: "Linux",
  },
  {
    quote:
      "Finally, a bookmark manager that doesn't feel like it was designed in 1999. My tabs tab is finally empty.",
    image: "https://github.com/evbomg.png",
    name: "Eva",
    role: "Developer",
    company: "Vercel",
  },
  {
    quote:
      "I used to lose links faster than I could save them. Now my bookmarks are more organized than my actual life.",
    image: "https://unavatar.io/x/dhh",
    name: "DHH",
    role: "Creator",
    company: "Ruby on Rails",
  },
  {
    quote:
      "Bookmrk is the only place where my 'read later' list actually gets read. The UI is just too good to ignore.",
    image: "https://unavatar.io/x/fireship",
    name: "Jeff",
    role: "Creator",
    company: "Fireship",
  },
];

export function TestimonialsSection() {
  return (
    <div className="mx-auto min-h-screen max-w-5xl space-y-8 border-x py-6">
      <div className="flex flex-col gap-2 px-4 md:px-6">
        <h1 className="text-center text-3xl tracking-wide max-w-sm m-auto">
          Loved by Developers Who Save Links
        </h1>
        <p className="text-muted-foreground text-sm md:text-sm max-w-xs text-center w-full m-auto">
          Join thousands of developers who never lose track of their favorite
          links.
        </p>
      </div>
      <div className="relative grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        <FullWidthDivider position="top" />
        {testimonials.map((testimonial) => (
          <TestimonialsCard key={testimonial.name} testimonial={testimonial} />
        ))}
        <GridFiller
          className="bg-background"
          lgColumns={3}
          smColumns={2}
          totalItems={testimonials.length}
        />
        <FullWidthDivider position="bottom" />
      </div>
    </div>
  );
}

function TestimonialsCard({
  testimonial,
  className,
  ...props
}: React.ComponentProps<"figure"> & {
  testimonial: Testimonial;
}) {
  const { quote, company, image, name, role } = testimonial;
  return (
    <figure
      className={cn(
        "relative grid grid-cols-[auto_1fr] gap-x-3 overflow-hidden bg-background p-4",
        className,
      )}
      {...props}
    >
      <div className="mask-[radial-gradient(farthest-side_at_top,white,transparent)] pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 size-full">
        <GridPattern
          className="absolute inset-0 size-full stroke-border"
          height={25}
          width={25}
          x={-12}
          y={4}
        />
      </div>

      <Avatar className="size-8 rounded-full">
        <AvatarImage alt={`${name}'s profile picture`} src={image} />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <figcaption className="-mt-0.5 -space-y-0.5">
          <cite className="text-sm not-italic md:text-base">{name}</cite>
          <span className="block font-light text-[11px] text-muted-foreground tracking-tight">
            {role}
            {company && `, ${company}`}
          </span>
        </figcaption>
        <blockquote className="mt-3">
          <p className="text-foreground/80 text-sm tracking-wide">{quote}</p>
        </blockquote>
      </div>
    </figure>
  );
}
