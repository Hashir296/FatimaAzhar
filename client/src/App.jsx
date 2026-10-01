import { useEffect, useRef, useState } from "react";
import { postJSON } from "./api";

const LINKS = [
  { href: "#home", id: "home", label: "Home" },
  { href: "#about", id: "about", label: "About" },
  { href: "#work", id: "work", label: "Services" },
  { href: "#films", id: "films", label: "Work" },
  { href: "#results", id: "results", label: "Result" },
  { href: "#contact", id: "contact", label: "Contact" },
];

const SERVICES = ["Video Editing", "Ads", "Business Growth"];
const TIMES = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

const TESTIMONIALS = [
  {
    name: "Ayesha Khan",
    role: "Founder",
    photo: "/images/p2.jpg",
    quote: "Fatima's team turned a folder of footage into a month of videos. The right clients started showing up.",
  },
  {
    name: "Rene Wells",
    role: "Brand Strategist",
    photo: "/images/p1.jpg",
    quote: "The ad cuts finally explained the offer. We stopped guessing which creative to run.",
    flip: true,
  },
  {
    name: "Hina Malik",
    role: "Creative Director",
    photo: "/images/p5.jpg",
    quote: "The films sound like the brand. Views turned into real conversations.",
  },
  {
    name: "Sara Qureshi",
    role: "Course Creator",
    photo: "/images/p4.jpg",
    quote: "The growth plan made the next 90 days obvious. One shoot covered the posts and the ads.",
    flip: true,
  },
  {
    name: "Maya Collins",
    role: "Consultant",
    photo: "/images/p6.jpg",
    quote: "Clear edits, a calm calendar, and videos that finally explain what we do.",
  },
  {
    name: "Leah Ahmed",
    role: "Creator",
    photo: "/images/p3.jpg",
    quote: "Fatima is direct and kind. We left the call with the edit list and the next three ads ready.",
    flip: true,
  },
];

const PROGRAMS = [
  {
    title: "Video Editing",
    text: "Edits that look like the brand and are ready to publish.",
    points: ["Short-form and brand films", "Captions, hooks, and cuts", "A clear revision round"],
  },
  {
    title: "Ads",
    text: "Ad creative built to get the right people to respond.",
    points: ["Ad concepts and edits", "Hooks tested for the offer", "Cuts sized for the platforms"],
  },
  {
    title: "Business Growth",
    text: "The offer, the content, and the follow-up working as one system.",
    points: ["Offer and message", "Content that explains it", "A plan for the next 90 days"],
  },
];

const CASES = [
  {
    name: "Ayesha Khan",
    clip: "ayesha-film",
    result: "From scattered posts to a month of content that brought clients",
    detail: "Fatima rebuilt her content pillars, batching plan, and hooks. She filmed twelve pieces and booked discovery calls from the first week.",
  },
  {
    name: "Studio North",
    clip: "studio-film",
    result: "A content system the whole team can run",
    detail: "The studio stopped waiting on one person for every caption. Roles, templates, and a weekly rhythm made publishing consistent.",
  },
  {
    name: "Hina Malik",
    clip: "hina-film",
    result: "Brand films that sound like the business, not a trend",
    detail: "Hina moved from daily pressure to a signature series. Views turned into conversations because the content finally explained the offer.",
  },
];

const SERIES = [
  {
    id: "pillars",
    title: "A brand edit",
    text: "How the agency cuts a simple film so the offer is clear in the first seconds.",
    poster: "/images/family.jpg",
    src: "/videos/pillars.mp4",
  },
  {
    id: "shine",
    title: "An ad that got seen",
    text: "The hook, the cut, and what the team repeats on the next ad.",
    poster: "/images/podcast.jpg",
    src: "/videos/shine.mp4",
  },
  {
    id: "batch",
    title: "A month of edits",
    text: "One shoot, cut into the posts and ads a client can run all month.",
    poster: "/images/solution.jpg",
    src: "/videos/batch.mp4",
  },
  {
    id: "hooks",
    title: "Hooks for growth",
    text: "Opening lines used when the video needs a client, not just a view.",
    poster: "/images/about.jpg",
    src: "/videos/hooks.mp4",
  },
];

const FILMS = [
  {
    id: "ayesha-film",
    title: "Ayesha Khan",
    client: "Founder series",
    text: "Twelve pieces from one shot list. The first week brought discovery calls.",
    poster: "/images/p2.jpg",
    src: "/videos/ayesha.mp4",
  },
  {
    id: "studio-film",
    title: "Studio North",
    client: "Team system",
    text: "A weekly rhythm the whole studio can run, so publishing does not wait on one person.",
    poster: "/images/mastermind.jpg",
    src: "/videos/studio.mp4",
  },
  {
    id: "hina-film",
    title: "Hina Malik",
    client: "Brand film",
    text: "A signature series that explains the offer, so views turned into conversations.",
    poster: "/images/p5.jpg",
    src: "/videos/hina.mp4",
  },
];

function todayStamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function labelTime(value) {
  const [hourPart, minute] = value.split(":");
  const hour = Number(hourPart);
  const suffix = hour >= 12 ? "PM" : "AM";
  const shown = hour % 12 || 12;
  return `${shown}:${minute} ${suffix}`;
}

function labelDate(value) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

function findClip(id) {
  return [...SERIES, ...FILMS].find((item) => item.id === id) || SERIES[0];
}

const PAINS = [
  {
    title: "Footage, no finished videos",
    text: "Shoots sitting in a folder while the brand stays quiet.",
    icon: "crown",
    program: "Video Editing",
  },
  {
    title: "Ads that don't convert",
    text: "Spend going out, and the creative still not selling the offer.",
    icon: "hourglass",
    program: "Ads",
  },
  {
    title: "Growth with no system",
    text: "Posts, ads, and follow-up each running on their own.",
    icon: "dollar",
    program: "Business Growth",
  },
];

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 86;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  if (id === "book") {
    window.setTimeout(() => {
      document.querySelector("#book-form input")?.focus({ preventScroll: true });
    }, 480);
  }
  if (id === "contact") {
    window.setTimeout(() => {
      document.querySelector("#contact-email")?.focus({ preventScroll: true });
    }, 480);
  }
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Button({ href, children, variant = "dark", onClick, type = "button", disabled, small }) {
  const className = `btn btn-${variant}${small ? " btn-sm" : ""}`;
  const inner = (
    <>
      <span>{children}</span>
      <span className="btn-arrow">
        <ArrowIcon />
      </span>
    </>
  );
  function handle(event) {
    if (href?.startsWith("#") && onClick) event.preventDefault();
    onClick?.(event);
  }
  if (href) {
    return (
      <a className={className} href={href} onClick={handle}>
        {inner}
      </a>
    );
  }
  return (
    <button className={className} type={type} onClick={handle} disabled={disabled}>
      {inner}
    </button>
  );
}

function PlayButton({ label, onClick }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      className="play"
      type={onClick ? "button" : undefined}
      aria-label={onClick ? label : undefined}
      aria-hidden={onClick ? undefined : true}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <path d="M9 7.5v9l8-4.5-8-4.5z" fill="currentColor" />
      </svg>
    </Tag>
  );
}

function PainIcon({ name }) {
  if (name === "hourglass") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M7 3h10M7 21h10M8 3c0 4 4 5 4 9s-4 5-4 9M16 3c0 4-4 5-4 9s4 5 4 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "dollar") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M12 3v18M16.5 7.5c-.8-1.2-2.2-2-4-2-2.4 0-4 1.3-4 3.2 0 4.2 8 2.2 8 6.3 0 1.9-1.7 3.3-4.2 3.3-1.9 0-3.4-.8-4.3-2.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M4 16l3-8 3 5 2-3 2 4 3-7 3 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Social({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      onClick={(event) => {
        if (!href.startsWith("#")) return;
        event.preventDefault();
        scrollToId("contact");
      }}
    >
      {children}
    </a>
  );
}

function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="modal-back" onClick={onClose} role="presentation">
      <div className={`modal${wide ? " modal-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <button className="modal-x" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function Navbar({ onGo }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const nodes = LINKS.map((link) => document.getElementById(link.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0.01 }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 980) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function go(id) {
    setOpen(false);
    onGo(id);
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="logo" href="#home" onClick={(event) => { event.preventDefault(); go("home"); }}>
          fatima azhar
        </a>
        <nav className={`nav-links${open ? " open" : ""}`} aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={active === link.id ? "active" : undefined}
              onClick={(event) => {
                event.preventDefault();
                go(link.id);
              }}
            >
              {link.label}
            </a>
          ))}
          <div className="menu-cta">
            <Button href="#book" small onClick={() => go("book")}>
              Book a call
            </Button>
          </div>
        </nav>
        <div className="nav-cta">
          <Button href="#book" small onClick={() => onGo("book")}>
            Book a call
          </Button>
        </div>
        <button className={`burger${open ? " open" : ""}`} type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

function Hero({ onGo }) {
  return (
    <section className="hero" id="home">
      <div className="hero-grid">
        <div>
          <div className="badge">
            <span className="badge-star" aria-hidden="true">
              ★
            </span>
            Video Editing · Ads · Growth
          </div>
          <h1>The agency for the edit, the ads, and the growth.</h1>
          <p className="lede">Fatima Azhar&apos;s team edits the videos, builds the ads, and sets up the system that brings clients.</p>
          <Button href="#book" onClick={() => onGo("book")}>Book a meeting</Button>
          <div className="proof">
            <div className="avatars">
              <img src="/images/a1.jpg" alt="" />
              <img src="/images/a2.jpg" alt="" />
              <img src="/images/a3.jpg" alt="" />
            </div>
            <div>
              <strong>
                <span>★★★★★</span>(2.3K Reviews)
              </strong>
              <p>Trusted by brands that want the work handled</p>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <img className="hero-main" src="/images/hero.jpg" alt="Fatima Azhar, content creator" />
          <div className="float-card">
            <img src="/images/float.jpg" alt="A content planning session" />
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoBar() {
  return (
    <section className="seen" aria-label="As seen on">
      <div className="seen-inner">
        <span className="seen-label">As Seen On...</span>
        <div className="seen-row">
          <span className="brand">
            <em>inspired</em>COACH
          </span>
          <span className="brand">perth now</span>
          <span className="brand brand-startup">
            <span className="brand-dot" />
            startup smart
          </span>
          <span className="brand brand-auralis">AURALIS</span>
          <span className="brand brand-medium">Medium</span>
          <span className="brand">SmartCompany</span>
        </div>
      </div>
    </section>
  );
}

function About({ onGo }) {
  return (
    <section className="about" id="about">
      <div className="about-photo">
        <img src="/images/about.jpg" alt="Strategy session at a whiteboard" />
      </div>
      <div className="about-copy">
        <h2>Hey there, I&apos;m Fatima — I run the agency behind the videos, the ads, and the growth.</h2>
        <p className="sub">Clients send the footage and the offer. The team edits, cuts the ads, and builds the plan that keeps the business moving.</p>
        <Button href="#book" variant="light" onClick={() => onGo("book")}>
          Book a meeting
        </Button>
        <div className="why">
          What the agency handles:
          <ul>
            <li>
              <span>+</span> Video editing for brand films and short-form
            </li>
            <li>
              <span>+</span> Ad creative that explains the offer
            </li>
            <li>
              <span>+</span> Business growth plans tied to that content
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function BookCall({ service, onClearService, onPlay }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: service || "",
    meetingDate: "",
    meetingTime: "",
    note: "",
  });
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState({});
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!service) return;
    setForm((current) => ({ ...current, service }));
    setBooking(null);
  }, [service]);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setInvalid((current) => ({ ...current, [name]: false }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextInvalid = {
      firstName: !form.firstName.trim(),
      lastName: !form.lastName.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
      phone: form.phone.replace(/\D/g, "").length < 7,
      service: !SERVICES.includes(form.service),
      meetingDate: !form.meetingDate || form.meetingDate < todayStamp(),
      meetingTime: !TIMES.includes(form.meetingTime),
    };
    setInvalid(nextInvalid);
    if (nextInvalid.firstName || nextInvalid.lastName) {
      setError("Please enter your first and last name.");
      return;
    }
    if (nextInvalid.email) {
      setError("Please enter a valid email address.");
      return;
    }
    if (nextInvalid.phone) {
      setError("Please enter a phone number we can call.");
      return;
    }
    if (nextInvalid.service) {
      setError("Please choose video editing, ads, or business growth.");
      return;
    }
    if (nextInvalid.meetingDate) {
      setError("Please choose a meeting date from today onward.");
      return;
    }
    if (nextInvalid.meetingTime) {
      setError("Please choose a meeting time.");
      return;
    }
    setLoading(true);
    try {
      const data = await postJSON("/api/meetings", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        service: form.service,
        meetingDate: form.meetingDate,
        meetingTime: form.meetingTime,
        note: form.note.trim(),
      });
      setBooking({
        firstName: form.firstName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        service: form.service,
        meetingDate: form.meetingDate,
        meetingTime: form.meetingTime,
        emailSent: data.delivery?.email === "sent",
        emailFailed: data.delivery?.email === "failed",
      });
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="access" id="book">
      <div className="wrap">
        <div className="access-head">
          <h2>Book a meeting</h2>
          <p>Pick the service, a day, and a time. The request is saved for the agency, and the call gets confirmed on your email and phone.</p>
        </div>
        <div className="access-grid">
          <div className="form-card" id="book-form">
            <h3>Book a call with Fatima</h3>
            {booking ? (
              <div className="done" role="status">
                <h3>Call requested, {booking.firstName}.</h3>
                <p>
                  {booking.service} on {labelDate(booking.meetingDate)} at {labelTime(booking.meetingTime)}.
                  {booking.emailSent
                    ? ` A confirmation email is on its way to ${booking.email}. We'll also reach you on ${booking.phone}.`
                    : booking.emailFailed
                      ? ` The request is saved. The email to ${booking.email} did not go out just now — we'll still confirm on ${booking.phone}.`
                      : ` We'll confirm on ${booking.email} and ${booking.phone}.`}
                </p>
                <div className="done-actions">
                  <Button type="button" onClick={() => onPlay("pillars")}>
                    Watch the work
                  </Button>
                  <button
                    className="text-link"
                    type="button"
                    onClick={() => {
                      setBooking(null);
                      setForm({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        service: "",
                        meetingDate: "",
                        meetingTime: "",
                        note: "",
                      });
                      onClearService();
                    }}
                  >
                    Book another time
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                {error ? (
                  <p className="form-alert" role="alert">
                    {error}
                  </p>
                ) : null}
                {form.service && SERVICES.includes(form.service) ? (
                  <p className="choice-chip">
                    {form.service}
                    <button
                      type="button"
                      onClick={() => {
                        setForm((current) => ({ ...current, service: "" }));
                        onClearService();
                      }}
                    >
                      Clear
                    </button>
                  </p>
                ) : null}
                <div className="fields">
                  <div className="name-row">
                    <label className={invalid.firstName ? "field-bad" : undefined}>
                      First Name
                      <input name="firstName" type="text" placeholder="Your First Name" value={form.firstName} onChange={update} autoComplete="given-name" maxLength={60} />
                    </label>
                    <label className={invalid.lastName ? "field-bad" : undefined}>
                      Last Name
                      <input name="lastName" type="text" placeholder="Your Last Name" value={form.lastName} onChange={update} autoComplete="family-name" maxLength={60} />
                    </label>
                  </div>
                  <label className={invalid.email ? "field-bad" : undefined}>
                    Email
                    <input name="email" type="email" placeholder="Enter Your Email Address" value={form.email} onChange={update} autoComplete="email" maxLength={120} />
                  </label>
                  <label className={invalid.phone ? "field-bad" : undefined}>
                    Phone
                    <input name="phone" type="tel" placeholder="Number for the call" value={form.phone} onChange={update} autoComplete="tel" maxLength={30} />
                  </label>
                  <label className={invalid.service ? "field-bad" : undefined}>
                    Service
                    <select name="service" value={form.service} onChange={update}>
                      <option value="">Choose a service</option>
                      {SERVICES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="name-row">
                    <label className={invalid.meetingDate ? "field-bad" : undefined}>
                      Date
                      <input name="meetingDate" type="date" min={todayStamp()} value={form.meetingDate} onChange={update} />
                    </label>
                    <label className={invalid.meetingTime ? "field-bad" : undefined}>
                      Time
                      <select name="meetingTime" value={form.meetingTime} onChange={update}>
                        <option value="">Choose a time</option>
                        {TIMES.map((item) => (
                          <option key={item} value={item}>
                            {labelTime(item)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label>
                    What do you need?
                    <textarea name="note" placeholder="Tell us about the videos, ads, or growth goal (optional)" value={form.note} onChange={update} maxLength={400} />
                  </label>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Book this call"}
                </Button>
              </form>
            )}
          </div>
          <div className="media-card">
            <img src="/images/family.jpg" alt="A still from the agency's video work" />
            <PlayButton label="Play a client edit" onClick={() => onPlay("pillars")} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Solution({ onPain }) {
  return (
    <section className="solution" id="solution">
      <div className="wrap solution-grid">
        <article className="solution-card">
          <h3>The Solution</h3>
          <p>One agency for the edit, the ads, and the growth plan — so the videos you already have start working for the business.</p>
          <div className="proven">
            <i aria-hidden="true">✓</i>
            Proven. Repeatable. On brand.
          </div>
          <img src="/images/solution.jpg" alt="A content workshop around a planning table" />
        </article>
        <div className="solution-copy">
          <h2>Where is the work getting stuck?</h2>
          <p>Pick the problem. It opens the matching service, then you can book the call.</p>
          <div className="pains">
            {PAINS.map((pain) => (
              <a
                className="pain"
                href="#work"
                key={pain.title}
                onClick={(event) => {
                  event.preventDefault();
                  onPain(pain.program);
                }}
              >
                <span className="pain-ico">
                  <PainIcon name={pain.icon} />
                </span>
                <span>
                  <strong>{pain.title}</strong>
                  <small>{pain.text}</small>
                </span>
                <span className="pain-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Mastermind({ highlight, onChoose }) {
  return (
    <section className="master" id="work" style={{ backgroundImage: "url(/images/mastermind.jpg)" }}>
      <div className="master-shade" />
      <div className="master-inner">
        <div className="master-top">
          <h2>Services</h2>
          <p>Video editing, ads, and business growth. Choose one and the meeting form opens with it selected.</p>
        </div>
        <div className="cards">
          {PROGRAMS.map((program) => (
            <article className={`program${highlight === program.title ? " hot" : ""}`} id={`offer-${program.title}`} key={program.title}>
              <h3>{program.title}</h3>
              <p>{program.text}</p>
              <ul>
                {program.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <button className="card-go" type="button" onClick={() => onChoose(program.title)}>
                Book this call
                <ArrowIcon />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ onCases }) {
  const rowRef = useRef(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return undefined;
    let active = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;

    const down = (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      active = true;
      moved = false;
      startX = event.clientX;
      startLeft = el.scrollLeft;
      el.classList.add("dragging");
    };
    const move = (event) => {
      if (!active) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const up = () => {
      active = false;
      el.classList.remove("dragging");
    };
    const click = (event) => {
      if (moved) {
        event.preventDefault();
        event.stopPropagation();
        moved = false;
      }
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
    };
  }, []);

  function scrollCards(direction) {
    rowRef.current?.scrollBy({ left: direction * 300, behavior: "smooth" });
  }

  return (
    <section className="results" id="results">
      <div className="wrap">
        <div className="results-head">
          <div>
            <h2>Here&apos;s what they have to say</h2>
            <p>Read all testimonials from our clients</p>
          </div>
          <Button onClick={onCases}>Read case studies</Button>
        </div>
      </div>
      <div className="wrap" style={{ position: "relative" }}>
        <button className="t-arrow prev" type="button" aria-label="Previous testimonials" onClick={() => scrollCards(-1)}>
          ‹
        </button>
        <div className="t-row" ref={rowRef}>
          {TESTIMONIALS.map((person) => (
            <article className={`t-card${person.flip ? " tall" : ""}`} key={person.name}>
              {person.flip ? (
                <>
                  <div className="q-who">
                    <strong>{person.name}</strong>
                    <span>{person.role}</span>
                  </div>
                  <img className="q-photo" src={person.photo} alt="" />
                  <p className="q-text">&ldquo;{person.quote}&rdquo;</p>
                </>
              ) : (
                <>
                  <img className="q-photo" src={person.photo} alt="" />
                  <p className="q-text">&ldquo;{person.quote}&rdquo;</p>
                  <div className="q-who">
                    <strong>{person.name}</strong>
                    <span>{person.role}</span>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
        <button className="t-arrow next" type="button" aria-label="Next testimonials" onClick={() => scrollCards(1)}>
          ›
        </button>
      </div>
    </section>
  );
}

function Films({ onPlay }) {
  return (
    <section className="films" id="films">
      <div className="wrap">
        <div className="films-head">
          <h2>Selected work</h2>
          <p>Client edits, ads, and growth films. Press play.</p>
        </div>
        <div className="film-grid">
          {FILMS.map((film) => (
            <button className="film" type="button" key={film.id} onClick={() => onPlay(film.id)} aria-label={`Play ${film.title}`}>
              <img src={film.poster} alt="" />
              <PlayButton />
              <span className="film-cap">
                <strong>{film.title}</strong>
                <small>{film.client}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PodcastShow({ onPlay }) {
  return (
    <section className="podcast" id="podcast">
      <h2>Work you can watch</h2>
      <p className="lede-light">Edits, ads, and growth films from the agency. Press play — no form in the way.</p>
      <div className="ep-row">
        {SERIES.map((item) => (
          <button className="ep-chip" type="button" key={item.id} onClick={() => onPlay(item.id)}>
            <strong>{item.title}</strong>
            <small>Play now</small>
          </button>
        ))}
      </div>
      <div className="pod-frame">
        <img src="/images/podcast.jpg" alt="Recording still from Shine Online" />
        <PlayButton label="Play Shine Online" onClick={() => onPlay("shine")} />
      </div>
    </section>
  );
}

function Player({ clipId, onClose, onPick }) {
  const clip = findClip(clipId);
  const list = SERIES.some((item) => item.id === clip.id) ? SERIES : FILMS;
  const videoRef = useRef(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return undefined;
    setNeedsTap(false);
    const attempt = node.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => setNeedsTap(true));
    }
    return undefined;
  }, [clip.id, clip.src]);

  return (
    <Modal title={clip.title} wide onClose={onClose}>
      <div className="stage">
        <video
          key={clip.src}
          ref={videoRef}
          src={clip.src}
          poster={clip.poster}
          controls
          playsInline
          autoPlay
          onPlay={() => setNeedsTap(false)}
        />
        {needsTap ? <PlayButton label="Play video" onClick={() => videoRef.current?.play()} /> : null}
      </div>
      <h3>{clip.title}</h3>
      <p>{clip.text}</p>
      <div className="ep-list">
        {list.map((item) => (
          <button className={`ep-item${item.id === clip.id ? " on" : ""}`} type="button" key={item.id} onClick={() => onPick(item.id)}>
            <strong>{item.title}</strong>
            <small>Play</small>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function Footer({ onLegal, onGo }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const year = new Date().getFullYear();

  async function onSubmit(event) {
    event.preventDefault();
    setSuccess("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const data = await postJSON("/api/subscribe", { email: email.trim() });
      setSuccess(data.message);
      setEmail("");
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="footer" id="contact">
      <div className="wrap footer-grid">
        <div>
          <a className="logo" href="#home" onClick={(event) => { event.preventDefault(); onGo("home"); }}>
            fatima azhar
          </a>
          <div className="socials">
            <Social href="#contact" label="Instagram">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
                <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" />
              </svg>
            </Social>
            <Social href="#contact" label="Facebook">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z" fill="currentColor" />
              </svg>
            </Social>
            <Social href="#contact" label="X">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </Social>
            <Social href="#contact" label="YouTube">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <rect x="3" y="7" width="18" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
                <path d="M11 10.2v3.6l3.2-1.8-3.2-1.8z" fill="currentColor" />
              </svg>
            </Social>
          </div>
        </div>
        <div className="footer-links">
          <a href="#home" onClick={(event) => { event.preventDefault(); onGo("home"); }}>Home</a>
          <a href="#about" onClick={(event) => { event.preventDefault(); onGo("about"); }}>About</a>
          <a href="#work" onClick={(event) => { event.preventDefault(); onGo("work"); }}>Services</a>
        </div>
        <div className="footer-links">
          <a href="#films" onClick={(event) => { event.preventDefault(); onGo("films"); }}>Work</a>
          <a href="#book" onClick={(event) => { event.preventDefault(); onGo("book"); }}>Book a call</a>
          <a href="#results" onClick={(event) => { event.preventDefault(); onGo("results"); }}>Result</a>
          <a href="#contact" onClick={(event) => { event.preventDefault(); onGo("contact"); }}>Contact</a>
        </div>
        <div>
          <h3>Leave an email if you want a follow-up.</h3>
          <form className="news" onSubmit={onSubmit} noValidate>
            <input
              type="email"
              placeholder="Enter email"
              id="contact-email"
              aria-label="Email address"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              maxLength={120}
            />
            <button type="submit" aria-label="Subscribe" disabled={loading}>
              <ArrowIcon />
            </button>
          </form>
          <p className={`form-note${error ? " bad" : ""}${success ? " ok" : ""}`} role="status">
            {error || success}
          </p>
        </div>
      </div>
      <div className="wrap legal-row">
        <span>@copyright {year}</span>
        <div className="legal-actions">
          <button type="button" onClick={() => onLegal("privacy")}>
            Privacy Policy
          </button>
          <button type="button" onClick={() => onLegal("terms")}>
            Terms & Condition
          </button>
          <span>All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [playerId, setPlayerId] = useState(null);
  const [casesOpen, setCasesOpen] = useState(false);
  const [legal, setLegal] = useState(null);
  const [service, setService] = useState("");
  const [highlight, setHighlight] = useState("");

  function openPlayer(id) {
    setCasesOpen(false);
    setLegal(null);
    setPlayerId(id);
  }

  function go(id, nextService) {
    setPlayerId(null);
    setCasesOpen(false);
    setLegal(null);
    if (typeof nextService === "string") setService(nextService);
    window.setTimeout(() => scrollToId(id), 40);
  }

  function chooseProgram(title) {
    setService(title);
    setHighlight(title);
    go("book", title);
  }

  function showPain(program) {
    setHighlight(program);
    scrollToId("work");
  }

  return (
    <>
      <Navbar onGo={go} />
      <main>
        <Hero onGo={go} />
        <LogoBar />
        <About onGo={go} />
        <BookCall service={service} onClearService={() => setService("")} onPlay={openPlayer} />
        <Solution onPain={showPain} />
        <Mastermind highlight={highlight} onChoose={chooseProgram} />
        <Films onPlay={openPlayer} />
        <Testimonials onCases={() => setCasesOpen(true)} />
        <PodcastShow onPlay={openPlayer} />
      </main>
      <Footer onLegal={setLegal} onGo={go} />

      {playerId ? <Player clipId={playerId} onClose={() => setPlayerId(null)} onPick={setPlayerId} /> : null}

      {casesOpen && (
        <Modal title="Case studies" onClose={() => setCasesOpen(false)}>
          <h3>Client results</h3>
          <p>Open a film to watch the work. The write-up is what changed for the brand.</p>
          {CASES.map((item) => (
            <div className="case" key={item.name}>
              <strong>{item.name}</strong>
              <em>{item.result}</em>
              <p>{item.detail}</p>
              <button className="text-link" type="button" onClick={() => openPlayer(item.clip)}>
                Watch the film
              </button>
            </div>
          ))}
        </Modal>
      )}

      {legal && (
        <Modal title={legal === "privacy" ? "Privacy Policy" : "Terms & Condition"} onClose={() => setLegal(null)}>
          <h3>{legal === "privacy" ? "Privacy Policy" : "Terms & Condition"}</h3>
          {legal === "privacy" ? (
            <p>
              Fatima Azhar's agency stores the name, email, phone, service, and meeting time you submit so the team can confirm the call. Details are kept for this site only and are not sold. You can ask for a request to be removed from the contact section.
            </p>
          ) : (
            <p>
              Booking a meeting requests a call. It is confirmed once the agency replies. Video editing, ads, and business growth work are scoped on that call. Results depend on the offer, the footage, and the budget. The email list is optional and can be stopped any time.
            </p>
          )}
        </Modal>
      )}
    </>
  );
}
