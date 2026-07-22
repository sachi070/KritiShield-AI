const LinkedinIcon = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Footer = () => {
  const teamMembers = [
    { name: 'Sachi Godbole', url: 'https://www.linkedin.com/in/sachi-godbole-aa14ab296/' },
    { name: 'Neel Joglekar', url: 'https://www.linkedin.com/in/neeljoglekar/' },
    { name: 'Omkar Dahiphale', url: 'https://www.linkedin.com/in/omkardahiphale/' },
  ];

  return (
    <footer className="w-full px-6 py-4 border-t border-panel-border bg-panel-bg backdrop-blur-md text-gray-400 text-sm flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 shrink-0 z-10">
      <span className="font-semibold text-white tracking-widest uppercase">Diabolics</span>
      <span className="hidden md:inline text-gray-600">|</span>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {teamMembers.map((member, index) => (
          <a
            key={index}
            href={member.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-neon-cyan transition-colors"
          >
            <LinkedinIcon size={16} />
            {member.name}
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
